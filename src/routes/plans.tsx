import { createFileRoute } from "@tanstack/react-router";
import { NoticePlansPrice } from "@/components/notice-sections";
import { Shell, SubHero, pageHead } from "@/components/layout";

// PM 지시(2026-10-22): 평면도(84㎡C·103㎡A)와 공급금액표를 한 화면에. 검색 노출 정책은 /overview 와 같다.
export const Route = createFileRoute("/plans")({
  head: () => pageHead("평면·분양가", "/plans"),
  component: Page,
});

function Page() {
  return (
    <Shell>
      <SubHero en="PLANS" title="평면·분양가" crumbs="평면·분양가" />
      <NoticePlansPrice />
    </Shell>
  );
}
