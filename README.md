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

- Hero video and posters (spec: `docs/design/DESIGN.md` §8). Until then the hero shows text-only scenes;
  set `HERO_VIDEO` in `src/components/hero-scenes.tsx` when files are in `public/media/`.
- Product photos. Frames are line drawings until we shoot our own (brand images need permission).
