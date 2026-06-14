import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import AppNav from "@/components/nav/AppNav";

export const metadata: Metadata = {
  title: "딥다이브 · DeepDive — 집중 학습 항해 로그",
  description:
    "집중한 만큼 더 깊이. 공부 세션 하나하나가 바다 속으로의 잠수가 되는 학습 트래커.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#050506" },
  ],
};

// Linear 디자인은 다크 전용 — 항상 다크 적용
const themeScript = `document.documentElement.classList.add('dark');`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* App Router 루트 레이아웃이라 앱 전역 1회 로드 — 한글(Pretendard) 지원 위해 CDN 웹폰트 사용 */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full antialiased">
        {/* 레이어드 앰비언트 라이팅 */}
        <div className="app-bg" aria-hidden>
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <div className="blob blob-4" />
          <div className="app-grid" />
        </div>

        <a
          href="#main"
          className="sr-only rounded-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--primary-ink)]"
        >
          본문으로 건너뛰기
        </a>

        <ClientProviders>
          <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1360px] flex-col lg:flex-row">
            <AppNav />
            <main
              id="main"
              className="flex-1 px-5 pb-28 pt-5 sm:px-8 lg:px-12 lg:pb-16 lg:pt-12"
            >
              {children}
            </main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
