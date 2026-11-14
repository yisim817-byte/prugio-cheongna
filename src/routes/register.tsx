import { createFileRoute, redirect } from "@tanstack/react-router";
import { pageHead } from "@/components/layout";
import { RegisterPage } from "@/components/landing-redesign";
export const Route = createFileRoute("/register")({
  beforeLoad: ({ location }) => { const search = location.search as Record<string, unknown>; if (String(search?.visit ?? "") === "1" || location.hash === "visit") throw redirect({ to: "/visit", replace: true }); },
  head: () => pageHead("관심고객 등록", "/register"),
  component: RegisterPage,
});
