import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, SubHero, pageHead } from "@/components/layout";
import { PROJECT_PHONE_DISPLAY, PROJECT_PHONE_TEL } from "@/data/content";
import { loadVisitConfig, VISIT_SLOT_LABEL, type VisitOption } from "@/lib/visit-config";

// 작업지시서 13 (2026-10-22): 모델하우스 방문예약 전용 페이지. 사전고객등록(/register)과 별도로 접수한다(/api/visit).
// 문구는 지시서 4-2 그대로. 서식은 아크원푸르지오.site 등록 페이지(제목·입력칸·버튼)를 따른다.
export const Route = createFileRoute("/visit")({
  head: () => pageHead("모델하우스 방문예약", "/visit"),
  component: Page,
});

const INTERESTS = ["아파트", "오피스텔", "상가"] as const;
const SLOTS = ["AM", "PM", "ANY"] as const;

type Done = { receiptNo: string; duplicate: boolean; when: string };

function Page() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitSlot, setVisitSlot] = useState<(typeof SLOTS)[number]>("ANY");
  const [interest, setInterest] = useState("");
  const [consent, setConsent] = useState(false);
  const [dates, setDates] = useState<VisitOption[]>([]);
  const [cfg, setCfg] = useState<"loading" | "ok" | "off">("loading");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  useEffect(() => {
    let live = true;
    loadVisitConfig().then((c) => {
      if (!live) return;
      setDates(c ? c.dates : []);
      setCfg(c ? "ok" : "off");
    });
    return () => { live = false; };
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("이름을 두 글자 이상 입력해 주세요.");
    if (!/^010\d{8}$/.test(phone.replace(/\D/g, ""))) return setError("휴대폰번호는 010으로 시작하는 11자리입니다.");
    if (cfg === "ok" && !visitDate) return setError("방문 희망일을 선택해 주세요.");
    if (!consent) return setError("개인정보 수집·이용에 동의해야 신청할 수 있습니다.");
    setPending(true);
    try {
      const q = new URLSearchParams(window.location.search);
      const res = await fetch("/api/visit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          visit_date: cfg === "ok" ? visitDate : "",
          visit_slot: cfg === "ok" ? visitSlot : "ANY",
          interest,
          consent_privacy: true,
          page: "/visit",
          utm_source: q.get("utm_source") || "",
          utm_medium: q.get("utm_medium") || "",
          utm_campaign: q.get("utm_campaign") || "",
        }),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok: true; duplicate: boolean; receipt_no: string; date_label: string; slot_label: string; visit_date: string | null }
        | { ok: false; message?: string }
        | null;
      if (!body || !body.ok) {
        setError((body && "message" in body && body.message) || "접수하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      const when = body.visit_date && body.date_label ? `${body.date_label} ${body.slot_label}` : "";
      setDone({ receiptNo: body.receipt_no, duplicate: body.duplicate, when });
    } catch {
      setError("접수하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Shell>
      <SubHero en="VISIT" title="모델하우스 방문예약" crumbs="모델하우스 방문예약" />
      <main className="ak-wrap ak-page">
        <div className="vr">
          <h2 className="vr__title">모델하우스 방문예약</h2>
          <p className="vr__desc">방문 희망 날짜를 남겨 주시면, 담당자가 확인 후 방문 시간을 전화로 안내해 드립니다.</p>
          <p className="vr__loc">견본주택 위치 · 인천광역시 서해구 청라동 87-1 · GRAND OPEN 10.30(금)</p>
          {done ? (
            <div className="vr__done" role="status">
              <p className="vr__done_h">
                {done.duplicate ? "이미 접수된 방문예약입니다." : "방문예약 신청이 접수되었습니다."}
                {done.when ? ` ${done.when}` : ""} · 담당자가 확인 후 전화로 방문 시간을 안내해 드립니다.
              </p>
              <p className="vr__done_no">접수번호 <strong>{done.receiptNo}</strong></p>
              <Link to="/register" className="vr__submit">사전고객등록도 하기</Link>
            </div>
          ) : (
            <form className="vr__form" onSubmit={onSubmit} noValidate>
              <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="vr__hp" aria-hidden="true" />
              <label className="vr__field">
                <span className="vr__label">이름 <em>*</em></span>
                <input name="name" required minLength={2} maxLength={20} value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력해 주세요" autoComplete="name" />
              </label>
              <label className="vr__field">
                <span className="vr__label">휴대폰번호 <em>*</em></span>
                <input name="phone" required inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" autoComplete="tel" />
              </label>
              {cfg === "off" ? (
                <div className="vr__off">
                  <p>방문 일정은 담당자가 전화로 확인합니다.</p>
                  <a href={PROJECT_PHONE_TEL} className="vr__tel">전화 예약 {PROJECT_PHONE_DISPLAY}</a>
                </div>
              ) : (
                <>
                  <label className="vr__field">
                    <span className="vr__label">방문 희망일 <em>*</em></span>
                    <select name="visit_date" required value={visitDate} onChange={(e) => setVisitDate(e.target.value)} disabled={cfg !== "ok"}>
                      <option value="">{cfg === "loading" ? "날짜를 불러오는 중" : "날짜 선택"}</option>
                      {dates.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </label>
                  <fieldset className="vr__field">
                    <legend className="vr__label">방문 희망 시간대</legend>
                    <div className="vr__opts">
                      {SLOTS.map((value) => (
                        <label key={value} className="vr__opt">
                          <input type="radio" name="visit_slot" value={value} checked={visitSlot === value} onChange={() => setVisitSlot(value)} />
                          <span>{VISIT_SLOT_LABEL[value]}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </>
              )}
              <fieldset className="vr__field">
                <legend className="vr__label">관심 상품 <small>(선택)</small></legend>
                <div className="vr__opts">
                  {INTERESTS.map((value) => (
                    <label key={value} className="vr__opt">
                      <input type="radio" name="interest" value={value} checked={interest === value} onChange={() => setInterest(value)} />
                      <span>{value}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="vr__consent">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>
                  <strong>개인정보 수집·이용 동의(필수)</strong>
                  <span className="vr__consent_detail">
                    수집항목: 이름, 휴대폰번호, 방문 희망일·시간대, 관심 상품 / 이용목적: 견본주택 방문 일정 안내 / 보유기간: 사전고객등록과 같은 기간(삭제할 때까지) ·{" "}
                    <Link to="/privacy" className="underline">처리방침</Link>
                  </span>
                </span>
              </label>
              {error ? <p className="vr__error" role="alert">{error}</p> : null}
              <button type="submit" disabled={pending} className="vr__submit">{pending ? "접수 중" : "방문예약 신청"}</button>
            </form>
          )}
          <div className="vr__notes">
            <p>※ 방문 시간은 담당자가 전화로 확정 안내합니다.</p>
            <p>※ 방문예약은 청약 신청이 아니며, 청약 자격·순위와 관계없습니다.</p>
            <p>
              ※ 방문예약은 사전고객등록과 별개입니다. 백화점 상품권·코스트코 회원권 이벤트는 사전고객등록을 한 분이 대상입니다.{" "}
              <Link to="/register" className="vr__link">사전고객등록 하기</Link>
            </p>
          </div>
        </div>
      </main>
    </Shell>
  );
}
