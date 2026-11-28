"use client";

import { ThemedImage } from "@/components/themed-image";
import { useActionState, useEffect, useRef, useState } from "react";
import { BOOKING_RULES, PICKUP_SLOTS, discountPct, totalPriceUsd, validateBookingDates } from "@/lib/booking";
import { CONTACT_CHANNELS, errorVars, type ErrorCode } from "@/lib/booking-form";
import { GLASSES, PICKUP_LOCATIONS, getGlasses } from "@/lib/glasses";
import { PRODUCT_IMAGES } from "@/lib/media";
import type { Locale } from "@/i18n/config";
import { fmt, formatSeoulDate } from "@/i18n/format";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { requestBooking, type BookingState } from "./actions";

type Props = {
  lang: Locale;
  dict: Pick<Dictionary, "book" | "errors" | "pickup" | "common">;
  initialModel: string;
  defaultName: string;
  /** Computed once on the server so SSR and hydration agree on the date bounds. */
  minStart: string;
  maxStart: string;
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-danger">
      {message}
    </p>
  );
}

const legend = "head text-[clamp(1.5rem,1.2rem+1vw,2rem)]";

export function BookingForm({ lang, dict, initialModel, defaultName, minStart, maxStart }: Props) {
  const t = dict.book;
  const [state, formAction, pending] = useActionState<BookingState, FormData>(requestBooking, {});
  const [model, setModel] = useState(initialModel);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  // Controlled, so a failed submit (React resets forms after an action) keeps what was typed.
  const [location, setLocation] = useState<string>(PICKUP_LOCATIONS[0].id);
  const [slot, setSlot] = useState<string>(PICKUP_SLOTS[0]);
  const [name, setName] = useState(defaultName);
  const [channel, setChannel] = useState<string>("whatsapp");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);

  const msg = (code: ErrorCode | undefined) => (code ? fmt(dict.errors[code], errorVars(code)) : undefined);
  const glasses = getGlasses(model);
  const range = start && end ? validateBookingDates(start, end) : null;
  const total = glasses && range?.ok ? totalPriceUsd(glasses.dailyUsd, start, end) : null;
  const discount = range?.ok ? discountPct(range.days) : 0;
  const e = state.errors ?? {};
  const errorCount = Object.keys(e).length;
  const formError = msg(state.formError);
  const summaryRef = useRef<HTMLDivElement>(null);

  // After a failed submit, move focus to the summary so screen readers hear what to fix.
  useEffect(() => {
    if (errorCount > 0 || state.formError) summaryRef.current?.focus();
  }, [state, errorCount]);

  return (
    <form action={formAction} className="pb-32 [&_input]:scroll-mb-32 [&_select]:scroll-mb-32" noValidate>
      <input type="hidden" name="lang" value={lang} />
      <p className="rounded-xl mb-10 bg-surface p-4">{dict.common.kst}</p>

      <div ref={summaryRef} tabIndex={-1} className="outline-none">
        {(errorCount > 0 || formError) && (
          <div role="alert" className="rounded-r-xl mb-10 border-l-4 border-danger bg-surface p-4">
            <p className="font-medium">{formError ?? (errorCount === 1 ? t.fixOne : fmt(t.fixMany, { n: errorCount }))}</p>
            {errorCount > 0 && (
              <ul className="mt-2 list-disc pl-5 text-danger">
                {Object.values(e).map((code) => (
                  <li key={code}>{msg(code)}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <fieldset>
        <legend className={legend}>{t.glasses}</legend>
        <div className="overflow-hidden rounded-2xl mt-6 grid gap-px bg-surface">
          {GLASSES.map((g) => (
            <label key={g.slug} className="flex min-h-16 cursor-pointer items-center gap-4 bg-bg px-4 py-3 transition-colors hover:bg-surface has-[:checked]:bg-accent-tint">
              <input
                type="radio"
                name="model"
                value={g.slug}
                checked={model === g.slug}
                onChange={() => setModel(g.slug)}
                className="size-5 accent-accent"
              />
              <span className="rounded-lg relative aspect-[3/2] w-20 shrink-0 overflow-hidden bg-product sm:w-24">
                <ThemedImage photo={PRODUCT_IMAGES[g.slug]} alt="" fill sizes="96px" className="object-cover" />
              </span>
              <span className="flex-1 font-medium">{g.name}</span>
              <span className="nums">{fmt(dict.common.perDay, { price: g.dailyUsd })}</span>
            </label>
          ))}
        </div>
        <FieldError id="model-error" message={msg(e.model)} />
      </fieldset>

      <fieldset className="mt-14" aria-describedby={e.dates ? "dates-error" : undefined}>
        <legend className={legend}>{t.dates}</legend>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block font-medium">{t.pickupDate}</span>
            <input
              type="date"
              name="start"
              aria-invalid={!!e.dates}
              required
              min={minStart}
              max={maxStart}
              value={start}
              onChange={(ev) => {
                setStart(ev.target.value);
                if (end && ev.target.value > end) setEnd(ev.target.value);
              }}
              className="field nums"
            />
          </label>
          <label className="block">
            <span className="mb-2 block font-medium">{t.returnDate}</span>
            <input
              type="date"
              name="end"
              aria-invalid={!!e.dates}
              required
              min={start || minStart}
              value={end}
              onChange={(ev) => setEnd(ev.target.value)}
              className="field nums"
            />
          </label>
        </div>
        <p className="mt-3 text-muted">{fmt(t.datesHint, { max: BOOKING_RULES.maxDays })}</p>
        <FieldError id="dates-error" message={msg(e.dates ?? (range && !range.ok ? range.error : undefined))} />
      </fieldset>

      <fieldset className="mt-14">
        <legend className={legend}>{t.pickup}</legend>
        <div className="overflow-hidden rounded-2xl mt-6 grid gap-px bg-surface">
          {PICKUP_LOCATIONS.map((l) => (
            <label key={l.id} className="flex cursor-pointer items-start gap-4 bg-bg px-4 py-4 has-[:checked]:bg-accent-tint">
              <input
                type="radio"
                name="location"
                value={l.id}
                checked={location === l.id}
                onChange={() => setLocation(l.id)}
                className="mt-1 size-5 accent-accent"
              />
              <span>
                <span className="block font-medium">{dict.pickup[l.id].name}</span>
                {lang !== "ko" && (
                  <span lang="ko" className="ko block text-small text-muted">
                    {l.nameKo}
                  </span>
                )}
                <span className="block text-small text-muted">{dict.pickup[l.id].detail}</span>
              </span>
            </label>
          ))}
        </div>
        <FieldError id="location-error" message={msg(e.location)} />

        <p className="mb-3 mt-8 font-medium" id="slot-label">
          {t.pickupTime}
        </p>
        <div className="flex flex-wrap gap-3" role="group" aria-labelledby="slot-label">
          {PICKUP_SLOTS.map((s) => (
            <label key={s} className="cursor-pointer">
              <input type="radio" name="slot" value={s} checked={slot === s} onChange={() => setSlot(s)} className="peer sr-only" />
              <span className="rounded-full nums inline-flex min-h-12 min-w-24 items-center justify-center border border-line px-4 peer-checked:border-accent peer-checked:bg-accent peer-checked:text-bg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                {s}
              </span>
            </label>
          ))}
        </div>
        <FieldError id="slot-error" message={msg(e.slot)} />
      </fieldset>

      <fieldset className="mt-14">
        <legend className={legend}>{t.details}</legend>
        <div className="mt-6 grid gap-6">
          <label className="block">
            <span className="mb-2 block font-medium">{t.name}</span>
            <input
              name="name"
              autoComplete="name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              maxLength={100}
              aria-describedby={e.name ? "name-error" : undefined}
              aria-invalid={!!e.name}
              className="field"
            />
            <FieldError id="name-error" message={msg(e.name)} />
          </label>
          <div className="grid gap-6 sm:grid-cols-[1fr_2fr]">
            <label className="block">
              <span className="mb-2 block font-medium">{t.contactBy}</span>
              <select name="channel" value={channel} onChange={(ev) => setChannel(ev.target.value)} className="field">
                {CONTACT_CHANNELS.map((c) => (
                  <option key={c} value={c}>
                    {t.channels[c]}
                  </option>
                ))}
              </select>
              <FieldError id="channel-error" message={msg(e.channel)} />
            </label>
            <label className="block">
              <span className="mb-2 block font-medium">{t.contactValue}</span>
              <input
                name="contact"
                value={contact}
                onChange={(ev) => setContact(ev.target.value)}
                type={channel === "email" ? "email" : "text"}
                autoComplete={channel === "email" ? "email" : channel === "phone" || channel === "whatsapp" ? "tel" : "off"}
                maxLength={120}
                aria-describedby={e.contact ? "contact-hint contact-error" : "contact-hint"}
                aria-invalid={!!e.contact}
                className="field"
              />
              <span id="contact-hint" className="mt-2 block text-small text-muted">
                {t.contactHint}
              </span>
              <FieldError id="contact-error" message={msg(e.contact)} />
            </label>
          </div>
          <label className="flex cursor-pointer items-start gap-4">
            <input
              type="checkbox"
              name="consent"
              checked={consent}
              onChange={(ev) => setConsent(ev.target.checked)}
              className="mt-1 size-5 shrink-0 accent-accent"
              aria-invalid={!!e.consent}
            />
            <span>{t.consent}</span>
          </label>
          <FieldError id="consent-error" message={msg(e.consent)} />
        </div>
      </fieldset>

      <div className="rounded-2xl mt-14 bg-surface p-5">
        <p className="font-medium">{t.nothingCharged}</p>
        <p className="mt-1 text-muted">{t.nothingChargedBody}</p>
      </div>

      {/* Summary bar */}
      <div data-bottom-bar className="fixed inset-x-0 bottom-0 z-30 bg-bg shadow-[0_-8px_24px_rgba(18,20,22,0.10)]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-margin pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
          <div aria-live="polite" className="min-w-0">
            {total !== null && range?.ok ? (
              <>
                <p className="nums text-lead font-semibold">
                  ${total}
                  {discount > 0 && (
                    <span className="ml-2 text-small font-normal text-accent">{fmt(t.discount, { pct: discount })}</span>
                  )}
                </p>
                <p className="truncate text-small text-muted">
                  {fmt(range.days === 1 ? t.day : t.days, { n: range.days })} · {formatSeoulDate(start, lang)} –{" "}
                  {formatSeoulDate(end, lang)}
                </p>
              </>
            ) : (
              <p className="text-small text-muted">{t.totalHint}</p>
            )}
          </div>
          <button type="submit" disabled={pending} className="btn btn-primary shrink-0">
            {pending ? t.sending : t.send}
          </button>
        </div>
      </div>
    </form>
  );
}
