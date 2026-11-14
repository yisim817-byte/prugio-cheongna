import { z } from "zod";

/** The short interest form uses the existing store; absent personal data stays empty, never fabricated. */
export const leadSchema = z.object({
  mode: z.enum(["full", "interest"]).default("full"),
  product: z.enum(["apt", "officetel", "commercial"]).nullable().optional(),
  name: z.string().trim().min(2).max(20),
  phone: z.string().trim(),
  birth6: z.string().trim().default(""),
  sido: z.string().trim().max(20).default(""),
  sigungu: z.string().trim().max(20).default(""),
  dong: z.string().trim().max(20).default(""),
  consent: z.literal(true),
  entry: z.string().trim().max(80).optional(),
  visit_date: z.string().trim().max(10).optional(),
  visit_slot: z.string().trim().max(3).optional(),
}).superRefine((data, ctx) => {
  if (data.mode === "interest") {
    if (data.birth6 || data.sido || data.sigungu || data.dong) ctx.addIssue({ code: "custom", message: "관심고객 등록에서는 생년월일과 주소를 수집하지 않습니다." });
    return;
  }
  if (!data.product) ctx.addIssue({ code: "custom", path: ["product"], message: "상품을 선택해 주세요." });
  if (data.sido.length < 2 || data.sigungu.length < 2 || data.dong.length < 1) ctx.addIssue({ code: "custom", path: ["sido"], message: "주소를 확인해 주세요." });
  if (!validBirth(data.birth6)) ctx.addIssue({ code: "custom", path: ["birth6"], message: "생년월일은 앞 6자리(YYMMDD)만 입력합니다." });
});
export function validBirth(value: string) {
  if (!/^\d{6}$/.test(value)) return false;
  const month = Number(value.slice(2, 4));
  const day = Number(value.slice(4, 6));
  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}
