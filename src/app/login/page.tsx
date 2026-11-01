import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeNextPath } from "@/lib/safe-redirect";
import { SignInButtons } from "./sign-in-buttons";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  const failed = params.error === "callback";

  if (await getCurrentUser()) redirect(next);

  return (
    <div className="mx-auto max-w-[1440px] px-margin py-16 lg:py-24">
      <div className="max-w-[520px]">
        <h1 className="head text-title">Sign in to book and see your bookings</h1>
        <p className="mt-4 text-muted">
          We only use your account to keep your bookings together. No password to remember.
        </p>

        <div className="mt-10">
          {isSupabaseConfigured() ? (
            <SignInButtons next={next} />
          ) : (
            <p className="bg-surface p-5">Sign-in opens with bookings. Until then you can browse all five pairs.</p>
          )}
          {failed && (
            <p role="alert" className="mt-4 text-danger">
              Sign-in did not finish. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
