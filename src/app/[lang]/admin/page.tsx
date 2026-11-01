import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GLASSES, getGlasses, getPickupLocation } from "@/lib/glasses";
import { localePath } from "@/i18n/config";
import { formatSeoulDate } from "@/i18n/format";
import { resolveLang } from "@/i18n/server";
import { addDevice, setDeviceActive, setStatus } from "./actions";

// Operator screen. Korean only (used by the NukeGlass team, not by customers).
export const metadata: Metadata = { title: "관리자", robots: { index: false, follow: false } };

type Status = "requested" | "confirmed" | "picked_up" | "returned" | "cancelled";

type Row = {
  code: string;
  status: Status;
  model_slug: string;
  device_label: string;
  start_date: string;
  end_date: string;
  pickup_location: string;
  pickup_slot: string;
  total_usd: number;
  contact_name: string;
  contact_channel: string;
  contact_value: string;
  customer_email: string | null;
  created_at: string;
};

type Device = { id: string; model_slug: string; label: string; active: boolean; open_reservations: number };

const STATUS_KO: Record<Status, string> = {
  requested: "요청",
  confirmed: "확정",
  picked_up: "대여 중",
  returned: "반납 완료",
  cancelled: "취소",
};

const MESSAGES: Record<string, string> = {
  "status:confirmed": "예약을 확정했습니다. 고객에게 확정 메시지를 보내 주세요.",
  "status:picked_up": "수령 처리했습니다.",
  "status:returned": "반납 처리했습니다. 세척·충전·초기화를 해 주세요.",
  "status:cancelled": "예약을 취소했습니다.",
  invalid_transition: "이 상태에서는 할 수 없는 변경입니다. 새로고침 후 다시 확인해 주세요.",
  device_added: "기기를 추가했습니다.",
  device_on: "기기를 다시 사용하도록 바꿨습니다.",
  device_off: "기기를 사용 중지했습니다. 이미 잡힌 예약은 그대로 남습니다.",
  duplicate_device: "같은 라벨의 기기가 이미 있습니다.",
  invalid_device: "모델을 고르고 라벨은 영문·숫자·하이픈 40자 이내로 입력해 주세요.",
  invalid: "잘못된 요청입니다.",
  error: "처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
};

const btn = "btn !min-h-11 px-4 text-small";

function StatusButton({ lang, code, to, label, tone = "primary" }: { lang: string; code: string; to: Status; label: string; tone?: "primary" | "plain" }) {
  return (
    <form action={setStatus}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="to" value={to} />
      <button type="submit" className={`${btn} ${tone === "primary" ? "btn-primary" : "border border-line bg-bg hover:bg-surface"}`}>
        {label}
      </button>
    </form>
  );
}

function CancelForm({ lang, code, label }: { lang: string; code: string; label: string }) {
  return (
    <details>
      <summary className="link inline-flex min-h-11 cursor-pointer items-center text-small">{label}</summary>
      <form action={setStatus} className="mt-2 flex flex-wrap items-end gap-2">
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="code" value={code} />
        <input type="hidden" name="to" value="cancelled" />
        <label className="block">
          <span className="mb-1 block text-small text-muted">사유 (고객에게 보이지 않음)</span>
          <input name="reason" required maxLength={300} placeholder="예: 재고 없음, 노쇼" className="field !min-h-11 w-64" />
        </label>
        <button type="submit" className={`${btn} border border-danger bg-bg text-danger hover:bg-surface`}>
          {code} 취소
        </button>
      </form>
    </details>
  );
}

function ReservationCard({ r, actions }: { r: Row; actions: React.ReactNode }) {
  const g = getGlasses(r.model_slug);
  const loc = getPickupLocation(r.pickup_location);
  return (
    <li className="bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="nums text-lead font-semibold tracking-[0.04em]">{r.code}</p>
        <p className="nums text-small text-muted">${r.total_usd}</p>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-2 text-small sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-muted">글래스 · 기기</dt>
          <dd>
            {g?.name ?? r.model_slug} · <span className="nums">{r.device_label}</span>
          </dd>
        </div>
        <div>
          <dt className="text-muted">기간 (KST)</dt>
          <dd className="nums">
            {formatSeoulDate(r.start_date, "ko")} {r.pickup_slot} – {formatSeoulDate(r.end_date, "ko")}
          </dd>
        </div>
        <div>
          <dt className="text-muted">수령 장소</dt>
          <dd>{loc?.nameKo ?? r.pickup_location}</dd>
        </div>
        <div>
          <dt className="text-muted">고객</dt>
          <dd>
            {r.contact_name} · {r.contact_channel} {r.contact_value}
            {r.customer_email && <span className="block text-muted">{r.customer_email}</span>}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap items-center gap-3">{actions}</div>
    </li>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mt-12" aria-label={title}>
      <h2 className="text-lead font-medium">
        {title} <span className="nums text-muted">({count})</span>
      </h2>
      {count === 0 ? <p className="mt-3 text-small text-muted">없음</p> : <ul className="mt-4 space-y-3">{children}</ul>}
    </section>
  );
}

export default async function AdminPage({ params, searchParams }: PageProps<"/[lang]/admin">) {
  const { lang } = await resolveLang(params);
  const query = await searchParams;
  const msg = typeof query.msg === "string" ? MESSAGES[query.msg] : undefined;

  const supabase = await createClient();
  if (!supabase) notFound();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(localePath(lang, `/login?next=${encodeURIComponent(localePath(lang, "/admin"))}`));

  // Not an operator: behave as if the page did not exist.
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) notFound();

  const [{ data: rowsData, error: rowsError }, { data: devicesData, error: devicesError }] = await Promise.all([
    supabase.rpc("admin_reservations"),
    supabase.rpc("admin_devices"),
  ]);
  if (rowsError) console.error("admin_reservations failed", { code: rowsError.code, message: rowsError.message });
  if (devicesError) console.error("admin_devices failed", { code: devicesError.code, message: devicesError.message });

  const rows = (rowsData ?? []) as Row[];
  const devices = (devicesData ?? []) as Device[];
  const by = (s: Status) => rows.filter((r) => r.status === s);
  const past = rows.filter((r) => r.status === "returned" || r.status === "cancelled").reverse();

  return (
    <div lang="ko" className="mx-auto max-w-[1440px] px-margin py-12 lg:py-16">
      <h1 className="head text-title">관리자</h1>
      <p className="mt-2 text-small text-muted">모든 날짜와 시간은 서울 시간(KST)입니다. 상태를 바꾸면 이력에 처리자와 사유가 남습니다.</p>

      {msg && (
        <p role="status" className="mt-6 bg-accent-tint p-4">
          {msg}
        </p>
      )}
      {(rowsError || devicesError) && (
        <p role="alert" className="mt-6 text-danger">
          데이터를 불러오지 못했습니다. 새로고침해 주세요.
        </p>
      )}

      <Section title="확정 대기" count={by("requested").length}>
        {by("requested").map((r) => (
          <ReservationCard
            key={r.code}
            r={r}
            actions={
              <>
                <StatusButton lang={lang} code={r.code} to="confirmed" label="확정" />
                <CancelForm lang={lang} code={r.code} label="거절" />
              </>
            }
          />
        ))}
      </Section>

      <Section title="수령 대기 (확정됨)" count={by("confirmed").length}>
        {by("confirmed").map((r) => (
          <ReservationCard
            key={r.code}
            r={r}
            actions={
              <>
                <StatusButton lang={lang} code={r.code} to="picked_up" label="수령 처리" />
                <CancelForm lang={lang} code={r.code} label="취소·노쇼" />
              </>
            }
          />
        ))}
      </Section>

      <Section title="대여 중" count={by("picked_up").length}>
        {by("picked_up").map((r) => (
          <ReservationCard
            key={r.code}
            r={r}
            actions={<StatusButton lang={lang} code={r.code} to="returned" label="반납 처리" />}
          />
        ))}
      </Section>

      <section className="mt-12" aria-label="지난 예약">
        <h2 className="text-lead font-medium">
          지난 예약 <span className="nums text-muted">({past.length})</span>
        </h2>
        {past.length > 0 && (
          <div className="mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="지난 예약 표">
            <table className="w-full min-w-[640px] border-collapse text-left text-small">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="py-2 pr-4 font-normal">코드</th>
                  <th className="py-2 pr-4 font-normal">글래스</th>
                  <th className="py-2 pr-4 font-normal">기간</th>
                  <th className="py-2 pr-4 font-normal">고객</th>
                  <th className="py-2 font-normal">상태</th>
                </tr>
              </thead>
              <tbody>
                {past.map((r) => (
                  <tr key={r.code} className="border-b border-line">
                    <td className="nums py-2 pr-4">{r.code}</td>
                    <td className="py-2 pr-4">{getGlasses(r.model_slug)?.name ?? r.model_slug}</td>
                    <td className="nums py-2 pr-4">
                      {formatSeoulDate(r.start_date, "ko")} – {formatSeoulDate(r.end_date, "ko")}
                    </td>
                    <td className="py-2 pr-4">{r.contact_name}</td>
                    <td className={`py-2 ${r.status === "cancelled" ? "text-danger" : "text-muted"}`}>{STATUS_KO[r.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-16" aria-label="기기 재고">
        <h2 className="text-lead font-medium">기기 재고</h2>
        <div className="mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="기기 표">
          <table className="w-full min-w-[560px] border-collapse text-left text-small">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="py-2 pr-4 font-normal">라벨</th>
                <th className="py-2 pr-4 font-normal">모델</th>
                <th className="py-2 pr-4 font-normal">진행 중 예약</th>
                <th className="py-2 pr-4 font-normal">상태</th>
                <th className="py-2 font-normal">
                  <span className="sr-only">변경</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} className="border-b border-line">
                  <td className="nums py-2 pr-4">{d.label}</td>
                  <td className="py-2 pr-4">{getGlasses(d.model_slug)?.name ?? d.model_slug}</td>
                  <td className="nums py-2 pr-4">{d.open_reservations}</td>
                  <td className={`py-2 pr-4 ${d.active ? "text-accent" : "text-muted"}`}>{d.active ? "사용 중" : "사용 중지"}</td>
                  <td className="py-2">
                    <form action={setDeviceActive}>
                      <input type="hidden" name="lang" value={lang} />
                      <input type="hidden" name="id" value={d.id} />
                      <input type="hidden" name="active" value={d.active ? "false" : "true"} />
                      <button type="submit" className="link min-h-11">
                        {d.active ? "사용 중지" : "다시 사용"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={addDevice} className="mt-6 flex flex-wrap items-end gap-3">
          <input type="hidden" name="lang" value={lang} />
          <label className="block">
            <span className="mb-1 block text-small text-muted">모델</span>
            <select name="model" required className="field !min-h-11">
              {GLASSES.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-small text-muted">라벨 (케이스에 붙인 번호)</span>
            <input name="label" required maxLength={40} pattern="[A-Za-z0-9-]+" placeholder="RBW-02" className="field !min-h-11 w-40" />
          </label>
          <button type="submit" className={`${btn} btn-primary`}>
            기기 추가
          </button>
        </form>
      </section>
    </div>
  );
}
