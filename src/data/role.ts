import { PLACES } from "./content";
import type { Role } from "./role-types";
import { SEO_SOURCE_LINE } from "./seo";

/**
 * 이 사이트의 첫 화면 데이터 (B · 푸르지오청라.site · 역할: 입지·교통·생활권).
 * 세 저장소에서 이 파일만 내용이 다르다. 숫자와 일정은 사실 원장에 있는 값만 쓴다.
 * 거리와 소요시간은 공식 실측 자료가 없어 적지 않는다. 7호선은 항상 「개통 시기 미정」으로 적고 연도를 쓰지 않는다.
 */

/** 출처 줄의 기준일은 seo.ts 의 값을 그대로 쓴다. */
const BASE_DATE = SEO_SOURCE_LINE.match(/기준일\s*([\d.]+)/)?.[1] ?? "";

export const ROLE: Role = {
  tone: "mist",
  h1: ["청라 아크원 푸르지오", "위치·교통 안내"],
  heroLink: { to: "/contact", label: "오시는 길 보기" },
  figure: {
    kind: "plate",
    label: "사업지",
    dong: "청라동",
    no: "86-1",
    sub: ["인천광역시 서해구", "청라국제도시 주상복합용지 M5BL"],
    list: [
      { k: "견본주택", v: "청라동 87-1번지" },
      { k: "홍보관", v: "중봉대로 586번길 19" },
    ],
    maps: [
      { label: "네이버 지도", href: PLACES[0].naver },
      { label: "카카오 지도", href: PLACES[0].kakao },
    ],
    alt: "사업지 주소. 인천광역시 서해구 청라동 86-1번지",
  },
  strip: [
    {
      label: "청라하늘대교",
      chip: { kind: "done", text: "개통" },
      value: "2026.01.05",
      desc: "구 제3연륙교",
    },
    {
      label: "스타필드 청라",
      chip: { kind: "soon", text: "예정" },
      value: "2028",
      unit: "년 개장 예정",
      desc: "복합쇼핑몰과 돔구장",
    },
    {
      label: "서울아산청라병원",
      chip: { kind: "soon", text: "예정" },
      value: "2029",
      unit: "년 예정",
      desc: "발표 기준 연도입니다.",
    },
    {
      label: "서울 7호선 청라연장선",
      chip: { kind: "tbd", text: "시기 미정" },
      value: "개통 시기 미정",
      desc: "국제업무단지역은 예정 단계입니다.",
    },
  ],
  stripSource: [
    { k: "출처", v: "사업주체 공개자료" },
    { k: "기준일", v: BASE_DATE },
    { k: "안내", v: "예정 사업은 확정 일정이 아닙니다." },
  ],
  main: {
    kind: "status",
    title: ["개통한 것과", "예정인 것"],
    lead: "개통·예정·계획을 나눠 적었습니다. 거리와 소요시간은 공식 실측 자료가 없어 적지 않습니다.",
    caption: "교통·생활 시설의 현재 단계",
    rows: [
      { name: "청라하늘대교", chip: { kind: "done", text: "개통" }, note: "2026.01.05 개통" },
      { name: "스타필드 청라", chip: { kind: "soon", text: "예정" }, note: "2028년 개장 예정" },
      { name: "서울아산청라병원", chip: { kind: "soon", text: "예정" }, note: "2029년 예정" },
      { name: "영상문화복합단지", chip: { kind: "plan", text: "계획" }, note: "2031년 계획" },
      {
        name: "GTX-D·E",
        chip: { kind: "plan", text: "계획" },
        note: "계획 단계이며 확정이 아닙니다",
      },
      {
        name: "서울 7호선 청라연장선",
        chip: { kind: "tbd", text: "시기 미정" },
        note: "개통 시기 미정",
      },
    ],
    source: [
      { k: "출처", v: "사업주체 공개자료" },
      { k: "기준일", v: BASE_DATE },
      { k: "안내", v: "개발계획은 관계기관 사정으로 변경·취소될 수 있습니다.", wide: true },
    ],
  },
  sections: ["location", "overview", "subscription", "premium"],
};
