import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { GLASSES, getGlasses } from "@/lib/glasses";
import { BookingForm } from "./booking-form";

export const metadata: Metadata = { title: "Book glasses" };

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const params = await searchParams;
  const requested = typeof params.model === "string" ? params.model : "";
  const model = getGlasses(requested)?.slug ?? GLASSES[0].slug;

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-[1440px] px-margin py-16 lg:py-24">
        <h1 className="head text-title">Bookings open soon</h1>
        <p className="mt-4 max-w-[52ch] text-muted">
          We are getting the first pairs ready. Until then you can read about all five and how pick-up works.
        </p>
        <Link href="/glasses" className="btn btn-primary mt-8">
          See the glasses
        </Link>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/book?model=${model}`)}`);

  return (
    <div className="mx-auto max-w-[760px] px-margin pt-12 lg:pt-16">
      <h1 className="head text-title">Book glasses</h1>
      <p className="mt-3 text-muted">Signed in as {user.email ?? "your account"}.</p>
      <div className="mt-10">
        <BookingForm initialModel={model} defaultName={user.name ?? ""} />
      </div>
    </div>
  );
}
