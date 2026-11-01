"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { BOOKING_RULES, DATE_ERROR_MESSAGES, PICKUP_SLOTS, formatSeoulDate, totalPriceUsd, validateBookingDates } from "@/lib/booking";
import { CONTACT_CHANNELS } from "@/lib/booking-form";
import { GLASSES, PICKUP_LOCATIONS, getGlasses } from "@/lib/glasses";
import { requestBooking, type BookingState } from "./actions";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-danger">
      {message}
    </p>
  );
}

const legend = "head text-[clamp(1.5rem,1.2rem+1vw,2rem)]";

type Props = {
  initialModel: string;
  defaultName: string;
  /** Computed once on the server so SSR and hydration agree on the date bounds. */
  minStart: string;
  maxStart: string;
};

export function BookingForm({ initialModel, defaultName, minStart, maxStart }: Props) {
  const [state, formAction, pending] = useActionState<BookingState, FormData>(requestBooking, {});
  const [model, setModel] = useState(initialModel);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  // Controlled, so a failed submit (React resets forms after an action) keeps what was typed.
  const [location, setLocation] = useState<string>(PICKUP_LOCATIONS[0].id);
  const [slot, setSlot] = useState<string>(PICKUP_SLOTS[0]);
  const [name, setName] = useState(defaultName);
  const [channel, setChannel] = useState("whatsapp");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);

  const glasses = getGlasses(model);
  const range = start && end ? validateBookingDates(start, end) : null;
  const total = glasses && range?.ok ? totalPriceUsd(glasses.dailyUsd, start, end) : null;
  const e = state.errors ?? {};
  const errorCount = Object.keys(e).length;
  const summaryRef = useRef<HTMLDivElement>(null);

  // After a failed submit, move focus to the summary so screen readers hear what to fix.
  useEffect(() => {
    if (errorCount > 0 || state.formError) summaryRef.current?.focus();
  }, [state, errorCount]);

  return (
    <form action={formAction} className="pb-32 [&_input]:scroll-mb-32 [&_select]:scroll-mb-32" noValidate>
      <p className="mb-10 bg-surface p-4">All dates and times are Seoul time (KST).</p>

      <div ref={summaryRef} tabIndex={-1} className="outline-none">
        {(errorCount > 0 || state.formError) && (
          <div role="alert" className="mb-10 border-l-4 border-danger bg-surface p-4">
            <p className="font-medium">{state.formError ?? `Please fix ${errorCount === 1 ? "one thing" : `${errorCount} things`} below.`}</p>
            {errorCount > 0 && (
              <ul className="mt-2 list-disc pl-5 text-danger">
                {Object.values(e).map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <fieldset>
        <legend className={legend}>Glasses</legend>
        <div className="mt-6 grid gap-px bg-surface">
          {GLASSES.map((g) => (
            <label key={g.slug} className="flex min-h-16 cursor-pointer items-center gap-4 bg-bg px-4 py-3 has-[:checked]:bg-accent-tint">
              <input
                type="radio"
                name="model"
                value={g.slug}
                checked={model === g.slug}
                onChange={() => setModel(g.slug)}
                className="size-5 accent-accent"
              />
              <span className="flex-1 font-medium">{g.name}</span>
              <span className="nums">${g.dailyUsd} / day</span>
            </label>
          ))}
        </div>
        <FieldError id="model-error" message={e.model} />
      </fieldset>

      <fieldset className="mt-14" aria-describedby={e.dates ? "dates-error" : undefined}>
        <legend className={legend}>Dates</legend>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block font-medium">Pick-up date</span>
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
            <span className="mb-2 block font-medium">Return date</span>
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
        <p className="mt-3 text-muted">
          Pick-up and return day both count. Up to {BOOKING_RULES.maxDays} days. Return by the end of your return day.
        </p>
        <FieldError id="dates-error" message={e.dates ?? (range && !range.ok ? DATE_ERROR_MESSAGES[range.error] : undefined)} />
      </fieldset>

      <fieldset className="mt-14">
        <legend className={legend}>Pick-up</legend>
        <div className="mt-6 grid gap-px bg-surface">
          {PICKUP_LOCATIONS.map((l) => (
            <label key={l.id} className="flex cursor-pointer items-start gap-4 bg-bg px-4 py-4 has-[:checked]:bg-accent-tint">
              <input
                type="radio"
                name="location"
                value={l.id}
                checked={location === l.id}
                onChange={() => setLocation(l.id)}
                className="mt-1 size-5 accent-accent" />
              <span>
                <span className="block font-medium">{l.name}</span>
                <span lang="ko" className="ko block text-small text-muted">
                  {l.nameKo}
                </span>
                <span className="block text-small text-muted">{l.detail}</span>
              </span>
            </label>
          ))}
        </div>
        <FieldError id="location-error" message={e.location} />

        <p className="mb-3 mt-8 font-medium" id="slot-label">
          Pick-up time
        </p>
        <div className="flex flex-wrap gap-3" role="group" aria-labelledby="slot-label">
          {PICKUP_SLOTS.map((s) => (
            <label key={s} className="cursor-pointer">
              <input type="radio" name="slot" value={s} checked={slot === s} onChange={() => setSlot(s)} className="peer sr-only" />
              <span className="nums inline-flex min-h-12 min-w-24 items-center justify-center border border-line px-4 peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                {s}
              </span>
            </label>
          ))}
        </div>
        <FieldError id="slot-error" message={e.slot} />
      </fieldset>

      <fieldset className="mt-14">
        <legend className={legend}>Your details</legend>
        <div className="mt-6 grid gap-6">
          <label className="block">
            <span className="mb-2 block font-medium">Name for pick-up</span>
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
            <FieldError id="name-error" message={e.name} />
          </label>
          <div className="grid gap-6 sm:grid-cols-[1fr_2fr]">
            <label className="block">
              <span className="mb-2 block font-medium">Contact by</span>
              <select name="channel" value={channel} onChange={(ev) => setChannel(ev.target.value)} className="field">
                {CONTACT_CHANNELS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <FieldError id="channel-error" message={e.channel} />
            </label>
            <label className="block">
              <span className="mb-2 block font-medium">Number, email or ID</span>
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
                Phone numbers with the country code, like +1 415 555 0100.
              </span>
              <FieldError id="contact-error" message={e.contact} />
            </label>
          </div>
          <label className="flex cursor-pointer items-start gap-4">
            <input
              type="checkbox"
              name="consent"
              checked={consent}
              onChange={(ev) => setConsent(ev.target.checked)}
              className="mt-1 size-5 shrink-0 accent-accent" aria-invalid={!!e.consent} />
            <span>
              NukeGlass may use my name and contact details to arrange this rental.
            </span>
          </label>
          <FieldError id="consent-error" message={e.consent} />
        </div>
      </fieldset>

      <div className="mt-14 bg-surface p-5">
        <p className="font-medium">Nothing is charged now.</p>
        <p className="mt-1 text-muted">
          This sends a booking request. We confirm it by message, with how and when to pay, usually within a day.
        </p>
      </div>


      {/* Summary bar */}
      <div data-bottom-bar className="fixed inset-x-0 bottom-0 z-30 bg-bg shadow-[0_-8px_24px_rgba(18,20,22,0.10)]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-margin pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
          <div aria-live="polite" className="min-w-0">
            {total !== null && range?.ok ? (
              <>
                <p className="nums text-lead font-semibold">${total}</p>
                <p className="truncate text-small text-muted">
                  {range.days} {range.days === 1 ? "day" : "days"} · {formatSeoulDate(start)} – {formatSeoulDate(end)}
                </p>
              </>
            ) : (
              <p className="text-small text-muted">Choose your dates to see the total.</p>
            )}
          </div>
          <button type="submit" disabled={pending} className="btn btn-primary shrink-0">
            {pending ? "Sending…" : "Send request"}
          </button>
        </div>
      </div>
    </form>
  );
}
