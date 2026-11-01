import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGlasses, getPickupLocation, type PickupLocationId } from "@/lib/glasses";
import { localePath } from "@/i18n/config";
import { fmt, formatSeoulDate } from "@/i18n/format";
import { resolveLang } from "@/i18n/server";
import { cancelBooking, signOut } from "./actions";

export async function generateMetadata({ params }: PageProps<"/[lang]/bookings">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.bookings.metaTitle };
}

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

const STATUS_COLOR: Record<Row["status"], string> = {
  requested: "text-ink",
  confirmed: "text-accent",
  picked_up: "text-accent",
  returned: "text-muted",
  cancelled: "text-danger",
};

export default async function BookingsPage({ params, searchParams }: PageProps<"/[lang]/bookings">) {
  const { lang, dict } = await resolveLang(params);
  const t = dict.bookings;
  const query = await searchParams;
  const newCode = typeof query.new === "string" && /^[A-Z0-9]{8}$/.test(query.new) ? query.new : null;
  const cancelFailed = query.cancel === "failed";

  const supabase = await createClient();
  if (!supabase) {
    return (
      <div className="mx-auto max-w-[1440px] px-margin py-16 lg:py-24">
        <h1 className="head text-title">{t.title}</h1>
        <p className="mt-4 text-muted">{t.notOpen}</p>
      </div>
    );
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(localePath(lang, `/login?next=${encodeURIComponent(localePath(lang, "/bookings"))}`));

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
        <h1 className="head text-title">{t.title}</h1>
        <form action={signOut}>
          <button type="submit" className="link min-h-12">
            {t.signOut}
          </button>
        </form>
      </div>

      {newCode && (
        <p role="status" className="mt-8 bg-accent-tint p-5">
          {t.newCode} <strong className="nums tracking-[0.04em]">{newCode}</strong>
        </p>
      )}

      {cancelFailed && (
        <p role="alert" className="mt-8 text-danger">
          {t.cancelFailed}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-8 text-danger">
          {t.loadFailed}
        </p>
      )}

      {!error && rows.length === 0 && (
        <div className="mt-12">
          <p className="text-lead">{t.empty}</p>
          <Link href={localePath(lang, "/glasses")} className="btn btn-primary mt-6">
            {t.choose}
          </Link>
        </div>
      )}

      <ul className="mt-12 space-y-6">
        {active.map((r) => {
          const g = getGlasses(r.model_slug);
          const loc = getPickupLocation(r.pickup_location);
          return (
            <li key={r.code} className="bg-surface p-6 sm:p-10">
              <p className="text-small text-muted">{t.code}</p>
              <p className="nums head mt-1 text-head tracking-[0.04em]">{r.code}</p>
              <p className={`mt-6 font-medium ${STATUS_COLOR[r.status]}`}>{t.status[r.status]}</p>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-small text-muted">{t.glasses}</dt>
                  <dd>{g?.name ?? r.model_slug}</dd>
                </div>
                <div>
                  <dt className="text-small text-muted">{t.pickup}</dt>
                  <dd className="nums">
                    {formatSeoulDate(r.start_date, lang)}, {r.pickup_slot}
                  </dd>
                </div>
                <div>
                  <dt className="text-small text-muted">{t.returnBy}</dt>
                  <dd className="nums">
                    {formatSeoulDate(r.end_date, lang)}, {t.endOfDay}
                  </dd>
                </div>
                <div>
                  <dt className="text-small text-muted">{t.where}</dt>
                  <dd>
                    {loc ? dict.pickup[loc.id as PickupLocationId].name : r.pickup_location}
                    {loc && lang !== "ko" && (
                      <span lang="ko" className="ko block text-small text-muted">
                        {loc.nameKo}
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
              <p className="nums mt-6">{fmt(t.total, { total: r.total_usd })}</p>
              {r.status === "requested" && (
                <details className="mt-6">
                  <summary className="link inline-flex min-h-12 cursor-pointer items-center">{t.cancelSummary}</summary>
                  <div className="mt-3 bg-bg p-5">
                    <p>{t.cancelFree}</p>
                    <form action={cancelBooking} className="mt-4">
                      <input type="hidden" name="code" value={r.code} />
                      <input type="hidden" name="lang" value={lang} />
                      <button type="submit" className="btn border border-danger bg-bg text-danger hover:bg-surface">
                        {fmt(t.cancelYes, { code: r.code })}
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
            {t.earlier}
          </h2>
          <table className="mt-4 w-full border-collapse text-left">
            <thead className="sr-only">
              <tr>
                <th>{t.colCode}</th>
                <th>{t.glasses}</th>
                <th>{t.colDates}</th>
                <th>{t.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {past.map((r) => (
                <tr key={r.code} className="border-b border-line">
                  <td className="nums py-3 pr-4">{r.code}</td>
                  <td className="py-3 pr-4">{getGlasses(r.model_slug)?.name ?? r.model_slug}</td>
                  <td className="nums py-3 pr-4">
                    {formatSeoulDate(r.start_date, lang)} – {formatSeoulDate(r.end_date, lang)}
                  </td>
                  <td className={`py-3 ${STATUS_COLOR[r.status]}`}>{r.status === "returned" ? t.returned : t.cancelled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
