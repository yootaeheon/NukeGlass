-- Operator (admin) rules, checked against a real Postgres. Rolled back at the end.
begin;
create extension if not exists pgtap with schema extensions;

select plan(19);

-- ---------------------------------------------------------------------------
-- Fixtures: customer A, operator Z, one Wayfarer device
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'customer@example.com'),
  ('00000000-0000-0000-0000-0000000000f1', 'operator@example.com');
insert into public.admins (user_id) values ('00000000-0000-0000-0000-0000000000f1');

update public.devices set active = false;
insert into public.devices (model_slug, label) values ('ray-ban-meta-wayfarer', 'TEST-A1');

create function pg_temp.act_as(uid uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
$$;
create function pg_temp.day(n int) returns date language sql as $$
  select (now() at time zone 'Asia/Seoul')::date + n;
$$;

-- Customer A requests two rentals
select pg_temp.act_as('00000000-0000-0000-0000-0000000000a1');
create temp table codes as
  select reservation_code as code, 1 as n
    from public.request_reservation('ray-ban-meta-wayfarer', pg_temp.day(10), pg_temp.day(11), 'icn-t1', '10:00',
                                    'Alex Test', 'email', 'customer@example.com')
  union all
  select reservation_code, 2
    from public.request_reservation('ray-ban-meta-wayfarer', pg_temp.day(20), pg_temp.day(21), 'icn-t2', '13:00',
                                    'Alex Test', 'email', 'customer@example.com');

-- ---------------------------------------------------------------------------
-- Customers are not operators
-- ---------------------------------------------------------------------------
select is(public.is_admin(), false, 'a customer is not an admin');
select throws_ok($$ select * from public.admin_reservations() $$, '42501', 'forbidden',
  'customers cannot list all reservations');
select throws_ok(format('select public.admin_set_status(%L, %L)', (select code from codes where n = 1), 'confirmed'),
  '42501', 'forbidden', 'customers cannot confirm reservations');
select throws_ok($$ select public.admin_add_device('ray-ban-meta-wayfarer', 'HACK-1') $$, '42501', 'forbidden',
  'customers cannot add devices');
select throws_ok($$ select count(*) from public.admins $$, '42501', null, 'customers cannot read the admin list');

-- ---------------------------------------------------------------------------
-- Operator: list and status changes
-- ---------------------------------------------------------------------------
select pg_temp.act_as('00000000-0000-0000-0000-0000000000f1');
select is(public.is_admin(), true, 'the operator is an admin');
select is((select count(*)::int from public.admin_reservations()), 2, 'the operator sees every reservation');
select is((select contact_name from public.admin_reservations() where code = (select code from codes where n = 1)),
  'Alex Test', 'the operator sees contact details to arrange pick-up');
select is((select device_label from public.admin_reservations() where code = (select code from codes where n = 1)),
  'TEST-A1', 'the operator sees which device is assigned');

select lives_ok(format('select public.admin_set_status(%L, %L)', (select code from codes where n = 1), 'confirmed'),
  'requested -> confirmed');
select throws_ok(format('select public.admin_set_status(%L, %L)', (select code from codes where n = 1), 'returned'),
  'P0001', 'invalid_transition', 'confirmed cannot jump to returned');
select lives_ok(format('select public.admin_set_status(%L, %L)', (select code from codes where n = 1), 'picked_up'),
  'confirmed -> picked_up');
select lives_ok(format('select public.admin_set_status(%L, %L)', (select code from codes where n = 1), 'returned'),
  'picked_up -> returned');
select throws_ok(format('select public.admin_set_status(%L, %L)', (select code from codes where n = 1), 'cancelled'),
  'P0001', 'invalid_transition', 'a returned rental cannot be cancelled');

select lives_ok(format('select public.admin_set_status(%L, %L, %L)', (select code from codes where n = 2), 'cancelled', 'No-show'),
  'requested -> cancelled with a reason');
select is((select count(*)::int from public.admin_reservations('cancelled')), 1, 'the list can be filtered by status');

-- ---------------------------------------------------------------------------
-- Devices
-- ---------------------------------------------------------------------------
select isnt(public.admin_add_device('oakley-meta-vanguard', 'TEST-V1'), null, 'the operator can add a device');
select lives_ok(
  format('select public.admin_set_device_active(%L, false)', (select id from public.admin_devices() where label = 'TEST-V1')),
  'the operator can retire a device');

-- ---------------------------------------------------------------------------
-- History keeps who changed what and why (read as the table owner)
-- ---------------------------------------------------------------------------
reset role;
select is(
  (select reason from public.reservation_events e join public.reservations r on r.id = e.reservation_id
    where r.code = (select code from codes where n = 2) and e.to_status = 'cancelled'),
  'No-show', 'the cancellation reason is stored in the status history');

select * from finish();
rollback;
