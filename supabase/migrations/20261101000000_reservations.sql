-- NukeGlass: rental inventory and reservations.
-- Not applied anywhere yet: DB structure changes need CEO approval (gate 3).
--
-- Rules (CLAUDE.md):
--   * Double booking of a device is blocked by an exclusion constraint, not by app code.
--   * All instants are timestamptz (UTC). Dates are shown in Asia/Seoul by the app.
--   * Customers can only read their own reservations; writes go through RPCs.

create extension if not exists btree_gist with schema extensions;

-- ---------------------------------------------------------------------------
-- Catalog and devices
-- ---------------------------------------------------------------------------

create table public.glasses_models (
  slug        text primary key,
  name        text not null,
  daily_usd   integer not null check (daily_usd > 0),
  active      boolean not null default true
);

create table public.devices (
  id          uuid primary key default gen_random_uuid(),
  model_slug  text not null references public.glasses_models(slug),
  label       text not null unique,          -- e.g. "RBW-01", printed on the case
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Reservations
-- ---------------------------------------------------------------------------

create type public.reservation_status as enum
  ('requested', 'confirmed', 'picked_up', 'returned', 'cancelled');

create table public.reservations (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  user_id          uuid not null references auth.users(id) on delete restrict,
  model_slug       text not null references public.glasses_models(slug),
  device_id        uuid not null references public.devices(id),
  start_date       date not null,               -- pick-up date, Seoul calendar
  end_date         date not null,               -- return date, Seoul calendar (inclusive)
  start_at         timestamptz not null,        -- pick-up slot, UTC
  end_at           timestamptz not null,        -- end of return day, UTC
  blocked_until    timestamptz not null,        -- end_at + preparation buffer
  pickup_location  text not null check (pickup_location in ('icn-t1', 'icn-t2')),
  pickup_slot      text not null check (pickup_slot in ('10:00', '13:00', '16:00', '19:00')),
  daily_usd        integer not null,
  total_usd        integer not null,
  contact_name     text not null check (char_length(contact_name) between 1 and 100),
  contact_channel  text not null check (contact_channel in ('whatsapp', 'email', 'kakaotalk', 'line', 'phone')),
  contact_value    text not null check (char_length(contact_value) between 3 and 120),
  status           public.reservation_status not null default 'requested',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (end_date >= start_date),
  check (end_at > start_at),
  check (blocked_until >= end_at),

  -- One device can never be held by two active reservations at once.
  constraint reservations_no_overlap exclude using gist (
    device_id with =,
    tstzrange(start_at, blocked_until, '[)') with &&
  ) where (status in ('requested', 'confirmed', 'picked_up'))
);

create index reservations_user_idx on public.reservations (user_id, start_date desc);

-- Every status change is kept.
create table public.reservation_events (
  id              bigint generated always as identity primary key,
  reservation_id  uuid not null references public.reservations(id) on delete cascade,
  from_status     public.reservation_status,
  to_status       public.reservation_status not null,
  actor           uuid,                          -- auth.uid() at the time, null for system
  created_at      timestamptz not null default now()
);

create function public.log_reservation_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.reservation_events (reservation_id, from_status, to_status, actor)
    values (new.id, null, new.status, auth.uid());
  elsif new.status is distinct from old.status then
    insert into public.reservation_events (reservation_id, from_status, to_status, actor)
    values (new.id, old.status, new.status, auth.uid());
    new.updated_at := now();
  end if;
  return new;
end $$;

create trigger reservations_status_log_ins
  after insert on public.reservations
  for each row execute function public.log_reservation_status();

create trigger reservations_status_log_upd
  before update on public.reservations
  for each row execute function public.log_reservation_status();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.glasses_models     enable row level security;
alter table public.devices            enable row level security;
alter table public.reservations       enable row level security;
alter table public.reservation_events enable row level security;

create policy "models are public" on public.glasses_models
  for select using (active);

create policy "customers read own reservations" on public.reservations
  for select to authenticated using (user_id = auth.uid());

-- No insert/update/delete policies: customers write only through the RPCs below.
-- devices and reservation_events have no customer policies at all.

-- ---------------------------------------------------------------------------
-- RPC: request a reservation for a model (assigns a free device)
-- ---------------------------------------------------------------------------

create function public.request_reservation(
  p_model_slug      text,
  p_start_date      date,
  p_end_date        date,
  p_pickup_location text,
  p_pickup_slot     text,
  p_contact_name    text,
  p_contact_channel text,
  p_contact_value   text
) returns table (reservation_code text)
language plpgsql security definer set search_path = '' as $$
declare
  v_user      uuid := auth.uid();
  v_today     date := (now() at time zone 'Asia/Seoul')::date;
  v_daily     integer;
  v_start_at  timestamptz;
  v_end_at    timestamptz;
  v_blocked   timestamptz;
  v_days      integer;
  v_code      text;
  v_device    uuid;
  v_open      integer;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  -- Same rules as src/lib/booking.ts (BOOKING_RULES)
  if p_end_date < p_start_date then
    raise exception 'end_before_start' using errcode = '22023';
  end if;
  if p_start_date < v_today + 2 then
    raise exception 'too_soon' using errcode = '22023';
  end if;
  if p_start_date > v_today + 90 then
    raise exception 'too_far' using errcode = '22023';
  end if;
  v_days := p_end_date - p_start_date + 1;
  if v_days > 14 then
    raise exception 'too_long' using errcode = '22023';
  end if;

  -- Unpaid requests hold stock, so one account can keep at most 2 open requests.
  -- The lock serialises requests from the same user so the count cannot be raced.
  perform pg_advisory_xact_lock(hashtext(v_user::text));
  select count(*) into v_open from public.reservations
   where user_id = v_user and status = 'requested';
  if v_open >= 2 then
    raise exception 'too_many_requests' using errcode = 'P0001';
  end if;

  select daily_usd into v_daily from public.glasses_models where slug = p_model_slug and active;
  if v_daily is null then
    raise exception 'unknown_model' using errcode = '22023';
  end if;

  v_start_at := (p_start_date + p_pickup_slot::time) at time zone 'Asia/Seoul';
  v_end_at   := (p_end_date + 1)::timestamp at time zone 'Asia/Seoul';
  v_blocked  := v_end_at + interval '24 hours';   -- one day to clean, charge and reset

  -- Try each device; the exclusion constraint decides who gets it.
  for v_device in
    select id from public.devices where model_slug = p_model_slug and active order by label
  loop
    loop
      v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
      exit when not exists (select 1 from public.reservations where code = v_code);
    end loop;
    begin
      insert into public.reservations (
        code, user_id, model_slug, device_id, start_date, end_date,
        start_at, end_at, blocked_until, pickup_location, pickup_slot,
        daily_usd, total_usd, contact_name, contact_channel, contact_value
      ) values (
        v_code, v_user, p_model_slug, v_device, p_start_date, p_end_date,
        v_start_at, v_end_at, v_blocked, p_pickup_location, p_pickup_slot,
        v_daily, v_daily * v_days, p_contact_name, p_contact_channel, p_contact_value
      );
      return query select v_code;
      return;
    exception when exclusion_violation then
      -- device taken for these dates, try the next one
      null;
    end;
  end loop;

  raise exception 'sold_out' using errcode = 'P0001';
end $$;

-- ---------------------------------------------------------------------------
-- RPC: customer cancels their own reservation before it is confirmed
-- ---------------------------------------------------------------------------

create function public.cancel_reservation(p_code text)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.reservations
     set status = 'cancelled'
   where code = p_code
     and user_id = auth.uid()
     and status = 'requested';
  if not found then
    raise exception 'not_cancellable' using errcode = 'P0001';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- RPC: which models still have a free device for a date range (no personal data)
-- ---------------------------------------------------------------------------

create function public.model_availability(p_start_date date, p_end_date date)
returns table (model_slug text, available boolean)
language sql stable security definer set search_path = '' as $$
  select m.slug,
         exists (
           select 1 from public.devices d
            where d.model_slug = m.slug and d.active
              and not exists (
                select 1 from public.reservations r
                 where r.device_id = d.id
                   and r.status in ('requested', 'confirmed', 'picked_up')
                   and tstzrange(r.start_at, r.blocked_until, '[)') &&
                       tstzrange((p_start_date + time '00:00') at time zone 'Asia/Seoul',
                                 ((greatest(p_end_date, p_start_date) + 1)::timestamp at time zone 'Asia/Seoul')
                                   + interval '24 hours', '[)')
              )
         )
    from public.glasses_models m
   where m.active;
$$;

revoke all on function public.request_reservation(text, date, date, text, text, text, text, text) from public, anon;
revoke all on function public.cancel_reservation(text) from public, anon;
grant execute on function public.request_reservation(text, date, date, text, text, text, text, text) to authenticated;
grant execute on function public.cancel_reservation(text) to authenticated;
grant execute on function public.model_availability(date, date) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Seed catalog (prices provisional). Devices are added by the operator.
-- ---------------------------------------------------------------------------

insert into public.glasses_models (slug, name, daily_usd) values
  ('ray-ban-meta-wayfarer',       'Ray-Ban Meta Wayfarer (Gen 2)',       29),
  ('ray-ban-meta-skyler',         'Ray-Ban Meta Skyler (Gen 2)',         29),
  ('ray-ban-meta-blayzer-optics', 'Ray-Ban Meta Blayzer Optics (Gen 2)', 32),
  ('oakley-meta-hstn',            'Oakley Meta HSTN',                    32),
  ('oakley-meta-vanguard',        'Oakley Meta Vanguard',                35);
