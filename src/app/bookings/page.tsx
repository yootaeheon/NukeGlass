import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatSeoulDate } from "@/lib/booking";
import { getGlasses, getPickupLocation } from "@/lib/glasses";
import { cancelBooking, signOut } from "./actions";

export const metadata: Metadata = { title: "My bookings" };

type Row = {
  code: string;
  model_slug: string;
  start_date: string;
  end_date: string;
  pickup_location: string;
  pickup_slot: string;
  total_usd: number;
  status: "requested" | "confirmed" | "picked_up" | "returned" | "cancelled";
};

// Wording follows the reservation states in the Notion planning page.
const STATUS_TEXT: Record<Row["status"], string> = {
  requested: "Request received. We will confirm it by message.",
  confirmed: "Confirmed. Ready for pick-up.",
  picked_up: "With you now. Enjoy Seoul.",
  returned: "Returned. Thank you.",
  cancelled: "Cancelled.",
};

const STATUS_COLOR: Record<Row["status"], string> = {
  requested: "text-ink",
  confirmed: "text-accent",
  picked_up: "text-accent",
  returned: "text-muted",
  cancelled: "text-danger",
};

export default async function BookingsPage({ searchParams }: PageProps<"/bookings">) {
  const params = await searchParams;
  const newCode = typeof params.new === "string" && /^[A-Z0-9]{8}$/.test(params.new) ? params.new : null;
  const cancelFailed = params.cancel === "failed";

  const supabase = await createClient();
  if (!supabase) {
    return (
      <div className="mx-auto max-w-[1440px] px-margin py-16 lg:py-24">
        <h1 className="head text-title">My bookings</h1>
        <p className="mt-4 text-muted">Bookings open soon.</p>
      </div>
    );
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?next=/bookings");

  const { data, error } = await supabase
    .from("reservations")
    .select("code, model_slug, start_date, end_date, pickup_location, pickup_slot, total_usd, status")
    .eq("user_id", auth.user.id) // RLS already limits this; kept as a second guard
    .order("start_date", { ascending: false });
  const rows = (data ?? []) as Row[];
  const active = rows.filter((r) => r.status !== "returned" && r.status !== "cancelled");
  const past = rows.filter((r) => r.status === "returned" || r.status === "cancelled");

  return (
    <div className="mx-auto max-w-[1440px] px-margin py-12 lg:py-16">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="head text-title">My bookings</h1>
        <form action={signOut}>
          <button type="submit" className="link min-h-12">
            Sign out
          </button>
        </form>
      </div>

      {newCode && (
        <p role="status" className="mt-8 bg-accent-tint p-5">
          Request sent. Your booking code is <strong className="nums tracking-[0.04em]">{newCode}</strong>.
        </p>
      )}

      {cancelFailed && (
        <p role="alert" className="mt-8 text-danger">
          We could not cancel that request. It may already be confirmed. Please contact us.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-8 text-danger">
          We could not load your bookings. Please refresh the page.
        </p>
      )}

      {!error && rows.length === 0 && (
        <div className="mt-12">
          <p className="text-lead">No bookings yet.</p>
          <Link href="/glasses" className="btn btn-primary mt-6">
            Choose your glasses
          </Link>
        </div>
      )}

      <ul className="mt-12 space-y-6">
        {active.map((r) => {
          const g = getGlasses(r.model_slug);
          const loc = getPickupLocation(r.pickup_location);
          return (
            <li key={r.code} className="bg-surface p-6 sm:p-10">
              <p className="text-small text-muted">Booking code</p>
              <p className="nums head mt-1 text-head tracking-[0.04em]">{r.code}</p>
              <p className={`mt-6 font-medium ${STATUS_COLOR[r.status]}`}>{STATUS_TEXT[r.status]}</p>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-small text-muted">Glasses</dt>
                  <dd>{g?.name ?? r.model_slug}</dd>
                </div>
                <div>
                  <dt className="text-small text-muted">Pick-up (KST)</dt>
                  <dd className="nums">
                    {formatSeoulDate(r.start_date)}, {r.pickup_slot}
                  </dd>
                </div>
                <div>
                  <dt className="text-small text-muted">Return by (KST)</dt>
                  <dd className="nums">{formatSeoulDate(r.end_date)}, end of day</dd>
                </div>
                <div>
                  <dt className="text-small text-muted">Where</dt>
                  <dd>
                    {loc?.name ?? r.pickup_location}
                    {loc && (
                      <span lang="ko" className="ko block text-small text-muted">
                        {loc.nameKo}
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
              <p className="nums mt-6">Total ${r.total_usd}</p>
              {r.status === "requested" && (
                <details className="mt-6">
                  <summary className="link inline-flex min-h-12 cursor-pointer items-center">Cancel this request</summary>
                  <div className="mt-3 bg-bg p-5">
                    <p>Nothing has been charged, so cancelling a request is free.</p>
                    <form action={cancelBooking} className="mt-4">
                      <input type="hidden" name="code" value={r.code} />
                      <button type="submit" className="btn border border-danger bg-bg text-danger hover:bg-surface">
                        Yes, cancel {r.code}
                      </button>
                    </form>
                  </div>
                </details>
              )}
            </li>
          );
        })}
      </ul>

      {past.length > 0 && (
        <section aria-labelledby="past-title" className="mt-16">
          <h2 id="past-title" className="text-lead font-medium">
            Earlier
          </h2>
          <table className="mt-4 w-full border-collapse text-left">
            <thead className="sr-only">
              <tr>
                <th>Code</th>
                <th>Glasses</th>
                <th>Dates</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {past.map((r) => (
                <tr key={r.code} className="border-b border-line">
                  <td className="nums py-3 pr-4">{r.code}</td>
                  <td className="py-3 pr-4">{getGlasses(r.model_slug)?.name ?? r.model_slug}</td>
                  <td className="nums py-3 pr-4">
                    {formatSeoulDate(r.start_date)} – {formatSeoulDate(r.end_date)}
                  </td>
                  <td className={`py-3 ${STATUS_COLOR[r.status]}`}>{r.status === "returned" ? "Returned" : "Cancelled"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
