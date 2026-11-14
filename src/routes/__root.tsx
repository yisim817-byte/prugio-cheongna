import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";
import { SITE_ORIGIN } from "@/data/content";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // 2026-11-10 PM 지시: 브라우저 자동번역이 화면 글자를 바꾸지 못하게 한다.
      { name: "google", content: "notranslate" },
      { title: "청라 아크원 푸르지오" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "theme-color", content: "#1c3a32" },
      { name: "google-site-verification", content: "TfTytsz2e4bDSPQ4gKBUt30vHIk68OFJEHuYbUtt5Bk" },
      { name: "naver-site-verification", content: "8c39d5528540c65c44795ca13ffb3d740a72b20a" },
    ],
    links: [
      { rel: "icon", type: "image/png", sizes: "144x144", href: "/g-icon-144.png?v=20261009" },
      { rel: "shortcut icon", href: "/g-icon-144.png?v=20261009" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/g-icon-180.png" },

    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "청라 아크원 푸르지오",
          url: SITE_ORIGIN,
          telephone: "+82-1666-6799",
        }),
      },
    ],
  }),
  component: () => (
    <html lang="ko" translate="no" className="notranslate" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
        <script src="/plan-open-bar.js" data-href="/plans" defer />
      </body>
    </html>
  ),
});
