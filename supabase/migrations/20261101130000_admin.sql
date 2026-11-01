-- Operator (admin) tools: who is an operator, reservation handling, device stock.
-- Every operator action goes through SECURITY DEFINER functions that check is_admin() first;
-- no table grants are added, so customers keep exactly the access they had.

-- ---------------------------------------------------------------------------
-- Operators
-- ---------------------------------------------------------------------------
create table public.admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);
alter table public.admins enable row level security;  -- no policies, no grants
revoke all on public.admins from anon, authenticated;

-- New tables start with no API access; each migration grants what it needs
-- (older Supabase setups, including the local stack, grant everything by default).
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

create function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create function public.assert_admin()
returns void language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Status history: keep the reason given by the operator
-- ---------------------------------------------------------------------------
alter table public.reservation_events
  add column reason text check (char_length(reason) <= 300);

create or replace function public.log_reservation_status()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_reason text := nullif(current_setting('app.status_reason', true), '');
begin
  if tg_op = 'INSERT' then
    insert into public.reservation_events (reservation_id, from_status, to_status, actor)
    values (new.id, null, new.status, auth.uid());
  elsif new.status is distinct from old.status then
    insert into public.reservation_events (reservation_id, from_status, to_status, actor, reason)
    values (new.id, old.status, new.status, auth.uid(), v_reason);
    new.updated_at := now();
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Reservations for operators (includes contact details to arrange pick-up)
-- ---------------------------------------------------------------------------
create function public.admin_reservations(p_status public.reservation_status default null)
returns table (
  code             text,
  status           public.reservation_status,
  model_slug       text,
  device_label     text,
  device_active    boolean,
  start_date       date,
  end_date         date,
  pickup_location  text,
  pickup_slot      text,
  total_usd        integer,
  contact_name     text,
  contact_channel  text,
  contact_value    text,
  customer_email   text,
  created_at       timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.assert_admin();
  return query
    select r.code, r.status, r.model_slug, d.label, d.active, r.start_date, r.end_date, r.pickup_location, r.pickup_slot,
           r.total_usd, r.contact_name, r.contact_channel, r.contact_value, u.email::text, r.created_at
      from public.reservations r
      join public.devices d on d.id = r.device_id
      left join auth.users u on u.id = r.user_id
     where p_status is null or r.status = p_status
     order by r.start_date, r.pickup_slot;
end $$;

-- Allowed moves (Notion planning page is the source of the state flow):
--   requested -> confirmed | cancelled
--   confirmed -> picked_up | cancelled
--   picked_up -> returned
create function public.admin_set_status(
  p_code   text,
  p_to     public.reservation_status,
  p_reason text default null
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_from public.reservation_status;
begin
  perform public.assert_admin();

  select status into v_from from public.reservations where code = p_code for update;
  if v_from is null then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  if not (
       (v_from = 'requested' and p_to in ('confirmed', 'cancelled'))
    or (v_from = 'confirmed' and p_to in ('picked_up', 'cancelled'))
    or (v_from = 'picked_up' and p_to = 'returned')
  ) then
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;

  -- Refunds depend on why a booking was cancelled (rental terms), so a reason is required.
  if p_to = 'cancelled' and nullif(trim(coalesce(p_reason, '')), '') is null then
    raise exception 'reason_required' using errcode = '22023';
  end if;

  perform set_config('app.status_reason', coalesce(left(p_reason, 300), ''), true);
  update public.reservations set status = p_to where code = p_code;
  perform set_config('app.status_reason', '', true);
end $$;

-- ---------------------------------------------------------------------------
-- Device stock
-- ---------------------------------------------------------------------------
create function public.admin_devices()
returns table (id uuid, model_slug text, label text, active boolean, open_reservations integer)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.assert_admin();
  return query
    select d.id, d.model_slug, d.label, d.active,
           (select count(*)::integer from public.reservations r
             where r.device_id = d.id and r.status in ('requested', 'confirmed', 'picked_up'))
      from public.devices d
     order by d.model_slug, d.label;
end $$;

create function public.admin_add_device(p_model_slug text, p_label text)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  perform public.assert_admin();
  if p_label is null or trim(p_label) !~ '^[A-Za-z0-9-]{1,40}$' then
    raise exception 'invalid_label' using errcode = '22023';
  end if;
  if not exists (select 1 from public.glasses_models where slug = p_model_slug and active) then
    raise exception 'unknown_model' using errcode = '22023';
  end if;
  insert into public.devices (model_slug, label) values (p_model_slug, upper(trim(p_label))) returning id into v_id;
  return v_id;
end $$;

create function public.admin_set_device_active(p_id uuid, p_active boolean)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.assert_admin();
  update public.devices set active = p_active where id = p_id;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Grants: functions only
-- ---------------------------------------------------------------------------
revoke all on function public.is_admin() from public, anon;
revoke all on function public.assert_admin() from public, anon, authenticated;
revoke all on function public.admin_reservations(public.reservation_status) from public, anon;
revoke all on function public.admin_set_status(text, public.reservation_status, text) from public, anon;
revoke all on function public.admin_devices() from public, anon;
revoke all on function public.admin_add_device(text, text) from public, anon;
revoke all on function public.admin_set_device_active(uuid, boolean) from public, anon;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_reservations(public.reservation_status) to authenticated;
grant execute on function public.admin_set_status(text, public.reservation_status, text) to authenticated;
grant execute on function public.admin_devices() to authenticated;
grant execute on function public.admin_add_device(text, text) to authenticated;
grant execute on function public.admin_set_device_active(uuid, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- First operator
-- ---------------------------------------------------------------------------
-- Only a verified Google sign-in qualifies: an email/password account created with the
-- same address must never become an operator. Returns whether the account was found.
-- If no operator exists yet (the CEO had not signed in when this ran), sign in with Google
-- once and run: select public.grant_first_admin('<email>');  (SQL editor, as owner)
create function public.grant_first_admin(p_email text)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  select id into v_id from auth.users
   where lower(email) = lower(p_email)
     and email_confirmed_at is not null
     and raw_app_meta_data ->> 'provider' = 'google';
  if v_id is null then
    return false;
  end if;
  insert into public.admins (user_id) values (v_id) on conflict do nothing;
  return true;
end $$;

revoke all on function public.grant_first_admin(text) from public, anon, authenticated;

select public.grant_first_admin('yootaeheon00@gmail.com');
