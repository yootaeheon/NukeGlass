-- Starting inventory: one pair per model so bookings can be tested end to end.
-- Real stock is added or retired by the operator (devices.active); labels are printed on each case.
-- Applied by `supabase db reset` locally and `supabase db push --include-seed` once.
insert into public.devices (model_slug, label) values
  ('ray-ban-meta-wayfarer',       'RBW-01'),
  ('ray-ban-meta-skyler',         'RBS-01'),
  ('ray-ban-meta-blayzer-optics', 'RBB-01'),
  ('oakley-meta-hstn',            'OKH-01'),
  ('oakley-meta-vanguard',        'OKV-01')
on conflict (label) do nothing;
