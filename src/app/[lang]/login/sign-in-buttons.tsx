"use client";

import { useState } from "react";
import { AUTH_PROVIDERS } from "@/lib/auth-providers";
import { createClient } from "@/lib/supabase/browser";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function SignInButtons({ next, t }: { next: string; t: Dictionary["login"] }) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function signIn(provider: (typeof AUTH_PROVIDERS)[number]["id"]) {
    const supabase = createClient();
    if (!supabase) return;
    setPending(provider);
    setError(false);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) {
      setPending(null);
      setError(true);
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
          {pending === p.id ? t.opening : t.providers[p.id]}
        </button>
      ))}
      {error && (
        <p role="alert" className="text-danger">
          {t.unreachable}
        </p>
      )}
    </div>
  );
}
