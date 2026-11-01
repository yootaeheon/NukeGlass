-- Explicit table privileges for the API roles.
-- New Supabase projects no longer grant anon/authenticated access to public tables by default,
-- while older/local setups do. Revoke everything, then grant only what the site needs, so both
-- behave the same and RLS is never the only line of defence.

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated;

-- Catalog: readable by everyone (RLS policy limits it to active models)
grant select on public.glasses_models to anon, authenticated;

-- Reservations: signed-in customers read their own rows (RLS); writes only through the RPCs
grant select on public.reservations to authenticated;

-- devices and reservation_events: no customer access at all.
-- Functions keep their explicit EXECUTE grants from 20261101000000_reservations.sql.
