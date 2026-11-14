import { Link } from "@tanstack/react-router";
import { PROJECT_PHONE_DISPLAY, PROJECT_PHONE_TEL } from "@/data/content";

const PRODUCTS = [
  {
    id: "apt",
    href: "/plans",
    title: "아파트",
    fact: "868세대 · 전용 84㎡·103㎡",
    note: "입주자모집공고 2026.10.22 기준",
    image: "/resources/img/pages/main/premium_visual_img_01.v4.jpg",
    alt: "청라 아크원 푸르지오 아파트 외관 이미지",
    cta: "평면·분양가 보기",
  },
  {
    id: "officetel",
    href: "/event/apt",
    title: "오피스텔",
    fact: "987실 · 전용 105㎡·121㎡·136㎡",
    note: "11월말 분양예정 · 멀티 발코니",
    image: "/official/soon/officetel_bg.png",
    alt: "청라 아크원 푸르지오 오피스텔 안내 이미지",
    cta: "계약 시 혜택 보기",
  },
  {
    id: "commercial",
    href: "/event/apt",
    title: "상가",
    fact: "상업시설 1~2층",
    note: "11월말 분양예정",
    image: "/official/soon/commercial_bg.png",
    alt: "청라 아크원 푸르지오 상업시설 안내 이미지",
    cta: "계약 시 혜택 보기",
  },
] as const;

/** 상품을 먼저 보여주는 구간. 신청은 이 구간 제목이 아니다. */
export function ProductBoard() {
  return (
    <section id="products" className="cv" aria-labelledby="products-title">
      <div className="ak-wrap cv__in">
        <p className="cv__eye">상품</p>
        <h2 id="products-title" className="cv__title">
          아파트, 오피스텔, 상가
        </h2>
        <p className="cv__lead">
          규모와 일정을 먼저 확인하세요. 사업개요, 입지, 프리미엄을 본 다음 상담과 사전등록으로 이어집니다. 접수 인원은
          공개하지 않습니다.
        </p>
        <ul className="cv__products">
          {PRODUCTS.map((item) => (
            <li id={`cv-${item.id}`} key={item.id}>
              <a href={item.href}>
                <img src={item.image} alt={item.alt} width={720} height={480} />
                <span className="cv__body">
                  <strong>{item.title}</strong>
                  <span>{item.fact}</span>
                  <span>{item.note}</span>
                  <em>{item.cta}</em>
                </span>
              </a>
              <a className="cv__more" href={item.id === "apt" ? "#overview" : "#premium"}>
                {item.id === "apt" ? "사업개요로" : "공간 이어서"}
              </a>
            </li>
          ))}
        </ul>
        <p className="cv__links">
          <a href="#overview">사업개요</a>
          <a href="#location">입지</a>
          <a href="#premium">프리미엄</a>
          <a href="#consult">상담 · 사전등록</a>
        </p>
      </div>
    </section>
  );
}

/** 상품 안내 뒤의 신청 구간. 제목에만 「상담 · 사전등록」을 쓴다. */
export function ConsultClose() {
  return (
    <section id="consult" className="cv cv--close" aria-labelledby="cv-title">
      <div className="ak-wrap cv__in">
        <p className="cv__eye">신청</p>
        <h2 id="cv-title" className="cv__title">
          상담 · 사전등록
        </h2>
        <p className="cv__lead">
          위에서 상품을 확인한 뒤 전화하거나 등록하세요. 대표번호 {PROJECT_PHONE_DISPLAY}. 등록 확인은 전화로 하며, 접수
          인원은 이 화면에 공개하지 않습니다.
        </p>
        <div className="cv__actions">
          <a className="cv__btn cv__btn--solid ak-num" href={PROJECT_PHONE_TEL}>
            전화 상담 {PROJECT_PHONE_DISPLAY}
          </a>
          <a className="cv__btn cv__btn--line" href="/register">
            사전고객등록
          </a>
          <Link className="cv__btn cv__btn--line" to="/visit">
            방문예약
          </Link>
        </div>
        <aside className="cv__benefit">
          <p>
            <strong>상가·오피스텔 계약 시</strong>
            이 홈페이지에서 사전등록한 뒤 오피스텔 또는 상가를 계약하면, 백화점 상품권 50만원(롯데·현대·신세계 중 1종)을
            계약 시 지급합니다. 기간은 2026년 11월 20일(금)까지이며, 등록만으로 지급되지 않습니다.
          </p>
          <a href="/event/apt">혜택 조건 보기</a>
        </aside>
        <div className="cv__b103">
          <p>
            <strong>103㎡B 선착순</strong>
            <span>참여의향서는 2026년 11월 17일(화)부터 견본주택에서 본인이 접수합니다. 공급 일정은 미정입니다.</span>
          </p>
          <Link to="/103b">접수 안내</Link>
        </div>
      </div>
    </section>
  );
}
