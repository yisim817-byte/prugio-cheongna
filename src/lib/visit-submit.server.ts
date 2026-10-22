import { getSql, dbSource } from "@/lib/db";
import { SITE_ID } from "@/data/content";
import { checkVisit } from "@/lib/visit.server";

// 작업지시서 13 (2026-10-22): 모델하우스 방문예약 접수(/api/visit). 사전고객등록(leads)과 별도 표 visit_reservations.
// - 날짜는 arkone-visit-config 목록 안에서만 저장(목록 밖·설정 꺼짐이면 날짜만 비우고 접수).
// - 같은 번호·같은 날짜 10분 안 재전송은 새로 쓰지 않고 「이미 접수」로 응답.
// - Preview(*.vercel.app)는 is_test=true, 관리자 알림 보내지 않음. 고객 문자는 보내지 않는다.
export const VISIT_CONSENT_VERSION = "visit-2026-10-22-v1";
const SLOT_LABEL: Record<string, string> = { AM: "오전", PM: "오후", ANY: "시간 상관없음" };
const INTERESTS = new Set(["", "아파트", "오피스텔", "상가"]);

type Body = Record<string, unknown>;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[<>]/g, "").trim().slice(0, max) : "");

function receiptNo() {
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `VS${String(d.getUTCFullYear()).slice(2)}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

function kst(d: Date) {
  const k = new Date(d.getTime() + 9 * 3600 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${k.getUTCFullYear()}-${p(k.getUTCMonth() + 1)}-${p(k.getUTCDate())} ${p(k.getUTCHours())}:${p(k.getUTCMinutes())}`;
}

export type VisitReply =
  | { ok: true; duplicate: boolean; receipt_no: string; visit_date: string | null; visit_slot: string; date_label: string; slot_label: string; date_dropped: boolean }
  | { ok: false; reason: string; message: string };

export async function submitVisit(raw: Body, host: string): Promise<{ status: number; body: VisitReply }> {
  const bad = (status: number, reason: string, message: string) => ({ status, body: { ok: false as const, reason, message } });
  if (typeof raw.hp === "string" && raw.hp.length > 0) return bad(400, "rejected", "접수하지 못했습니다.");
  const name = str(raw.name, 20);
  if (name.length < 2) return bad(400, "name", "이름을 두 글자 이상 입력해 주세요.");
  if (/(\d{6}\s*-?\s*[1-8]\d{6})|(\d{13})/.test(String(raw.name ?? ""))) return bad(400, "rrn_blocked", "주민등록번호는 받지 않습니다.");
  const phone = (typeof raw.phone === "string" ? raw.phone : "").replace(/\D/g, "");
  if (!/^010\d{8}$/.test(phone)) return bad(400, "phone", "휴대폰번호는 010으로 시작하는 11자리입니다.");
  if (raw.consent_privacy !== true) return bad(400, "consent", "개인정보 수집·이용에 동의해야 신청할 수 있습니다.");
  const slot = typeof raw.visit_slot === "string" && SLOT_LABEL[raw.visit_slot] ? raw.visit_slot : "ANY";
  const interest = str(raw.interest, 10);
  if (!INTERESTS.has(interest)) return bad(400, "interest", "관심 상품을 다시 선택해 주세요.");

  const isTest = /\.vercel\.app$/i.test(host) || /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  if (dbSource !== "neon" && !isTest) {
    console.error("[visit] durable store unavailable");
    return bad(503, "store", "지금은 접수를 저장할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }
  const dateRaw = str(raw.visit_date, 10);
  const pick = await checkVisit(dateRaw || undefined, slot);
  const visitDate = pick ? pick.date : null;
  const dateLabel = pick ? pick.label.split(" ")[0] : ""; // 「10.30(금) 오후」 → 「10.30(금)」
  try {
    const sql = await getSql();
    const dup = await sql<{ receipt_no: string; visit_slot: string }>`
      select receipt_no, visit_slot from visit_reservations
      where site_id = ${SITE_ID} and phone = ${phone} and is_test = ${isTest}
        and visit_date is not distinct from ${visitDate}::date
        and created_at > now() - interval '10 minutes'
      order by id desc limit 1
    `;
    if (dup[0]) {
      return { status: 200, body: { ok: true, duplicate: true, receipt_no: dup[0].receipt_no, visit_date: visitDate, visit_slot: dup[0].visit_slot, date_label: dateLabel, slot_label: SLOT_LABEL[dup[0].visit_slot] ?? "", date_dropped: false } };
    }
    let receipt = receiptNo();
    for (let i = 0; i < 4; i++) {
      const clash = await sql<{ id: number }>`select id from visit_reservations where receipt_no = ${receipt} limit 1`;
      if (!clash[0]) break;
      receipt = receiptNo();
    }
    await sql`
      insert into visit_reservations (site_id, receipt_no, site_host, page, name, phone, visit_date, visit_slot, interest,
        consent_privacy, consent_version, utm_source, utm_medium, utm_campaign, is_test, notify_status)
      values (${SITE_ID}, ${receipt}, ${host.slice(0, 120)}, ${str(raw.page, 100) || "/visit"}, ${name}, ${phone}, ${visitDate}::date, ${slot}, ${interest || null},
        true, ${VISIT_CONSENT_VERSION}, ${str(raw.utm_source, 60) || null}, ${str(raw.utm_medium, 60) || null}, ${str(raw.utm_campaign, 80) || null},
        ${isTest}, ${isTest ? "skipped_test" : "pending"})
    `;
    if (!isTest) {
      try {
        const { sendVisitAlert } = await import("./kakao.server");
        const alert = await sendVisitAlert({
          receiptNo: receipt,
          createdAt: kst(new Date()),
          name,
          phone,
          visit: `${dateLabel || "날짜 미선택(전화 확인)"} · ${SLOT_LABEL[slot]}`,
          interest: interest || null,
          site: host,
        });
        await sql`update visit_reservations set notify_status = ${alert.status}, notify_detail = ${alert.detail}, notify_at = now() where receipt_no = ${receipt}`;
      } catch {
        console.error("[visit] notify failed after save", receipt);
      }
    }
    return { status: 200, body: { ok: true, duplicate: false, receipt_no: receipt, visit_date: visitDate, visit_slot: slot, date_label: dateLabel, slot_label: SLOT_LABEL[slot], date_dropped: Boolean(dateRaw && !pick) } };
  } catch {
    console.error("[visit] save failed");
    return bad(500, "store", "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}
