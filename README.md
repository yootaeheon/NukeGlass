# NukeGlass

AI glasses rental for visitors to Korea: product pages, Google sign-in and booking requests.
Planning and policy live in Notion (기획팀 page); design tokens in `docs/design/DESIGN.md`.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Postgres + Auth) · Vitest

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm test
npm run build
```

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every pull request to `main` and every push to `main`:

- `app`: `npm ci`, lint, typecheck, Vitest, `next build` (Node 26, no keys: builds in catalog-only mode).
- `db`: starts a local Supabase Postgres (`supabase db start`, applies `supabase/migrations/` and
  `supabase/seed.sql`), then runs the pgTAP tests in `supabase/tests/` (`supabase test db`).

The workflow holds no secrets and has read-only repo access. Keep the `supabase/setup-cli` version in step
with the `supabase` devDependency.

## Environment

The site runs without any keys in catalog-only mode: every product page works, sign-in and
booking show "opening soon". To enable them, set these in `.env.local` (never commit it):

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API keys (publishable) |

Shortcut after `npx supabase login`: `node scripts/write-env-local.mjs <project-ref>` writes both values
(publishable key only; the value is never printed). Never put a secret key in `.env.local`.

## Enabling sign-in and bookings

1. Create a Supabase project (cost gate: needs CEO approval).
2. Apply `supabase/migrations/` (DB gate: needs CEO approval). Add devices per model in the `devices` table.
3. Supabase → Authentication → Providers → Google: add the OAuth client ID and secret from Google Cloud Console.
   Authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`.
4. Supabase → Authentication → URL Configuration: add `http://localhost:3000/auth/callback**` and the production
   `https://<domain>/auth/callback**` to the redirect allow list. The trailing `**` matters: sign-in appends
   `?next=…`, and an exact entry would not match.
5. More providers (Apple, Kakao): enable them in Supabase, then flip `enabled` in `src/lib/auth-providers.ts`.

## Booking rules

- Double booking is blocked in the database by the `reservations_no_overlap` exclusion constraint.
- Instants are stored as UTC `timestamptz`; the site shows Asia/Seoul (KST).
- Customers write only through the `request_reservation` and `cancel_reservation` RPCs; RLS lets them read only
  their own reservations.
- Limits (lead time, horizon, max days) exist in both `src/lib/booking.ts` and the migration. Change them together.

## Media still needed

- Hero video: an AI-generated stand-in (Higgsfield) at `public/video/hero-features.mp4`, set as `HERO_VIDEO`
  in `src/lib/media.ts`. Replace it with our own footage (spec: `docs/design/DESIGN.md` §8).
- Product photos. Frames are line drawings until we shoot our own (brand images need permission).
