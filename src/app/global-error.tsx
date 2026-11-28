"use client";

// Last resort: the layout itself failed, so there are no fonts, styles or dictionaries.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "64px 24px", color: "#121416" }}>
        <h1 style={{ fontSize: 32, margin: 0 }}>Something went wrong</h1>
        <p style={{ marginTop: 16, maxWidth: 520, lineHeight: 1.5 }}>
          The page could not be loaded. Nothing was booked or changed. Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{ marginTop: 24, minHeight: 48, padding: "0 24px", background: "#0b6b57", color: "#fff", border: 0, fontSize: 16 }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
