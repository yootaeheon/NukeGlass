-- Reservation rules, checked against a real Postgres (npm run db:test, needs Docker).
-- Every test runs inside one transaction and is rolled back.
begin;
create extension if not exists pgtap with schema extensions;

select plan(15);

-- ---------------------------------------------------------------------------
-- Fixtures: two customers, one Wayfarer device
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'b@example.com');

insert into public.devices (model_slug, label) values ('ray-ban-meta-wayfarer', 'TEST-01');

create function pg_temp.act_as(uid uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
$$;

create function pg_temp.day(n int) returns date language sql as $$
  select (now() at time zone 'Asia/Seoul')::date + n;
$$;

create function pg_temp.book(slug text, s date, e date) returns text language sql as $$
  select reservation_code from public.request_reservation(slug, s, e, 'icn-t1', '10:00', 'Test', 'email', 'a@example.com');
$$;

-- ---------------------------------------------------------------------------
-- Booking and double booking
-- ---------------------------------------------------------------------------
select pg_temp.act_as('00000000-0000-0000-0000-00000000000a');

select isnt(pg_temp.book('ray-ban-meta-wayfarer', pg_temp.day(10), pg_temp.day(12)), null, 'A can request a free device');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000b');

select throws_ok(
  $$ select pg_temp.book('ray-ban-meta-wayfarer', pg_temp.day(11), pg_temp.day(13)) $$,
  'P0001', 'sold_out', 'overlapping dates on the only device are refused by the DB');

select throws_ok(
  $$ select pg_temp.book('ray-ban-meta-wayfarer', pg_temp.day(13), pg_temp.day(14)) $$,
  'P0001', 'sold_out', 'the day after a return is kept free for cleaning');

select isnt(pg_temp.book('ray-ban-meta-wayfarer', pg_temp.day(14), pg_temp.day(15)), null,
  'two days after the return the device is free again');

-- ---------------------------------------------------------------------------
-- Privacy: customers only see their own reservations
-- ---------------------------------------------------------------------------
select is((select count(*)::int from public.reservations), 1, 'B sees only B''s reservation');

select is((select count(*)::int from public.devices), 0, 'customers cannot read devices');

-- ---------------------------------------------------------------------------
-- Cancelling
-- ---------------------------------------------------------------------------
select pg_temp.act_as('00000000-0000-0000-0000-00000000000a');
create temp table a_code as select code from public.reservations;

select pg_temp.act_as('00000000-0000-0000-0000-00000000000b');
select throws_ok(
  format('select public.cancel_reservation(%L)', (select code from a_code)),
  'P0001', 'not_cancellable', 'B cannot cancel A''s reservation');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a');
select lives_ok(format('select public.cancel_reservation(%L)', (select code from a_code)), 'A can cancel A''s request');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000b');
select isnt(pg_temp.book('ray-ban-meta-wayfarer', pg_temp.day(10), pg_temp.day(11)), null,
  'cancelled dates can be booked again');

-- ---------------------------------------------------------------------------
-- Limits and price
-- ---------------------------------------------------------------------------
select throws_ok(
  $$ select pg_temp.book('ray-ban-meta-wayfarer', pg_temp.day(40), pg_temp.day(41)) $$,
  'P0001', 'too_many_requests', 'a third open request from one account is refused');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a');
select throws_ok(
  $$ select pg_temp.book('ray-ban-meta-wayfarer', pg_temp.day(1), pg_temp.day(2)) $$,
  '22023', 'too_soon', 'pick-up needs two days notice');

select isnt(pg_temp.book('ray-ban-meta-wayfarer', pg_temp.day(50), pg_temp.day(56)), null, 'a 7-day rental can be requested');
select is(
  (select total_usd from public.reservations where start_date = pg_temp.day(50)),
  162, '7 days at $29 with the 20% long-stay discount is $162 (same as totalPriceUsd)');

select is(
  (select count(*)::int from public.reservation_events),
  0, 'customers cannot read the status history');

-- ---------------------------------------------------------------------------
-- Anonymous visitors
-- ---------------------------------------------------------------------------
select set_config('role', 'anon', true);
select throws_ok(
  $$ select pg_temp.book('ray-ban-meta-wayfarer', pg_temp.day(60), pg_temp.day(61)) $$,
  '42501', null, 'anonymous visitors cannot request reservations');

select * from finish();
rollback;
