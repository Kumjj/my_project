"use client";

import { useRef, type ReactNode } from "react";

/**
 * 마우스 추적 스포트라이트 카드 (Linear 시그니처 요소).
 * 커서 위치에 부드러운 인디고 방사형 글로우가 따라붙는다.
 */
export default function SpotlightCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`card card-interactive group relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), var(--glow), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
