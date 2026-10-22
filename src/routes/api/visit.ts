import { createFileRoute } from "@tanstack/react-router";
import { submitVisit } from "@/lib/visit-submit.server";

// 작업지시서 13: 모델하우스 방문예약 접수 API. 같은 사이트 화면(/visit)에서만 쓴다.
export const Route = createFileRoute("/api/visit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const host = (request.headers.get("host") || "").toLowerCase();
        const origin = request.headers.get("origin");
        if (origin) {
          try {
            if (new URL(origin).host.toLowerCase() !== host) return Response.json({ ok: false, reason: "origin" }, { status: 403 });
          } catch {
            return Response.json({ ok: false, reason: "origin" }, { status: 403 });
          }
        }
        const text = await request.text();
        if (text.length > 4000) return Response.json({ ok: false, reason: "too_large" }, { status: 413 });
        let body: Record<string, unknown>;
        try {
          body = JSON.parse(text);
        } catch {
          return Response.json({ ok: false, reason: "json" }, { status: 400 });
        }
        const out = await submitVisit(body, host);
        return Response.json(out.body, { status: out.status, headers: { "cache-control": "no-store" } });
      },
    },
  },
});
