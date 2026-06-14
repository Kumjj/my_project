"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { hasActiveDive } from "@/lib/persistence";
import { useSyncExternalStore } from "react";
import {
  IconWaves,
  IconChart,
  IconCollection,
  IconSettings,
} from "@/components/ui/Icons";

const NAV = [
  { href: "/", label: "다이브", sub: "DIVE", Icon: IconWaves },
  { href: "/log", label: "항해 로그", sub: "LOG", Icon: IconChart },
  { href: "/collection", label: "심해 도감", sub: "COLLECTION", Icon: IconCollection },
  { href: "/settings", label: "설정", sub: "SETTINGS", Icon: IconSettings },
] as const;

// 진행 중 다이브 표식 — storage 이벤트 + 2초 폴링 구독 (effect 내 setState 회피)
function subscribeActiveDive(cb: () => void) {
  window.addEventListener("storage", cb);
  const id = window.setInterval(cb, 2000);
  return () => {
    window.removeEventListener("storage", cb);
    window.clearInterval(id);
  };
}

export default function AppNav() {
  const pathname = usePathname();
  const diving = useSyncExternalStore(subscribeActiveDive, hasActiveDive, () => false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border px-4 py-8 lg:flex">
        <Brand />
        <nav className="mt-9 flex flex-col gap-1">
          {NAV.map(({ href, label, sub, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                  active
                    ? "bg-surface-2 text-fg shadow-[inset_0_0_0_1px_var(--border),0_0_24px_var(--glow)]"
                    : "text-muted hover:bg-surface hover:text-fg"
                }`}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                    style={{ boxShadow: "0 0 10px var(--glow)" }}
                  />
                )}
                <span className={`relative ${active ? "text-primary" : ""}`}>
                  <Icon width={20} height={20} strokeWidth={1.5} />
                  {href === "/" && diving && (
                    <span
                      className="absolute -right-1.5 -top-1.5 h-2 w-2 rounded-full bg-[var(--success)]"
                      style={{ animation: "pulse-soft 2s ease-in-out infinite" }}
                      aria-label="진행 중인 잠수"
                    />
                  )}
                </span>
                <span className="flex-1 text-[15px] font-medium">{label}</span>
                <span className="label text-[9px] text-faint opacity-0 transition-opacity group-hover:opacity-100">
                  {sub}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-4">
          <p className="label text-[9px] leading-relaxed text-faint">
            © DEEPDIVE
          </p>
        </div>
      </aside>

      {/* 모바일 상단 */}
      <header className="flex items-center border-b border-border px-5 pb-4 pt-5 lg:hidden">
        <Brand />
      </header>

      {/* 모바일 하단 탭바 */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[var(--surface-glass)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch px-2 py-1.5">
          {NAV.map(({ href, label, sub, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 transition-colors duration-200 ${
                  active ? "text-primary" : "text-muted"
                }`}
              >
                <span className="relative">
                  <Icon width={21} height={21} strokeWidth={1.5} />
                  {href === "/" && diving && (
                    <span
                      className="absolute -right-1.5 -top-1 h-1.5 w-1.5 rounded-full bg-[var(--success)]"
                      style={{ animation: "pulse-soft 2s ease-in-out infinite" }}
                    />
                  )}
                </span>
                <span className="label text-[8px]">{sub}</span>
                <span className="sr-only">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span
        className="grid h-10 w-10 place-items-center rounded-xl text-white"
        style={{
          background: "linear-gradient(140deg, var(--c-surface), var(--primary) 60%, #3a44a0)",
          boxShadow: "0 0 20px var(--glow), inset 0 1px 0 0 rgba(255,255,255,0.25)",
        }}
      >
        <IconWaves width={20} height={20} strokeWidth={1.5} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="label mt-1 text-20 text-faint">DEEPDIVE</span>
      </span>
    </Link>
  );
}
