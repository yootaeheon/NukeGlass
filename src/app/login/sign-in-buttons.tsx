"use client";

import { useState } from "react";
import { AUTH_PROVIDERS } from "@/lib/auth-providers";
import { createClient } from "@/lib/supabase/browser";

export function SignInButtons({ next }: { next: string }) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(provider: (typeof AUTH_PROVIDERS)[number]["id"]) {
    const supabase = createClient();
    if (!supabase) return;
    setPending(provider);
    setError(null);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) {
      setPending(null);
      setError("We could not reach the sign-in page. Check your connection and try again.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {AUTH_PROVIDERS.filter((p) => p.enabled).map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => signIn(p.id)}
          disabled={pending !== null}
          className="btn btn-primary w-full"
        >
          {pending === p.id ? "Opening sign-in…" : p.label}
        </button>
      ))}
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
