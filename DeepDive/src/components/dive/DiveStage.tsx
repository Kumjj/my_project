"use client";

import { DEPTH_ZONES } from "@/lib/types";
import type { DiveStatus } from "@/hooks/useDive";
import Diver from "./Diver";

/**
 * 다이브 무대 — Linear/Modern.
 * 인디고 심해 그라데이션을 컨테이너보다 크게 깔고 background-position을 progress로 내려
 * '카메라가 따라 내려가는' 하강감을 만든다. 데이터(경과시간)가 비주얼을 직접 구동.
 */
export default function DiveStage({
  progress,
  liveDepthM,
  status,
  children,
}: {
  progress: number;
  liveDepthM: number;
  status: DiveStatus;
  children?: React.ReactNode;
}) {
  const active = status !== "idle";
  const rayOpacity = Math.max(0, 0.5 - progress * 0.5);
  const diverTop = 22 + progress * 24;

  const currentZone =
    [...DEPTH_ZONES].reverse().find((z) => liveDepthM >= z.minDepth) ??
    DEPTH_ZONES[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-md)]">
      {/* 수심 카메라 그라데이션 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, var(--c-shallow) 0%, var(--c-mid) 42%, var(--c-deep) 76%, var(--c-abyss) 100%)",
          backgroundSize: "100% 240%",
          backgroundPosition: `0% ${(progress * 100).toFixed(2)}%`,
        }}
        aria-hidden
      />
      {/* 상단 액센트 광원 (깊을수록 약화) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-2/3"
        style={{
          opacity: rayOpacity,
          background:
            "radial-gradient(120% 90% at 50% -10%, rgba(255,255,255,0.45), transparent 55%), radial-gradient(80% 60% at 70% 0%, var(--glow), transparent 60%)",
          mixBlendMode: "screen",
        }}
        aria-hidden
      />
      {/* 심연 비네팅 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: Math.min(0.75, 0.25 + progress * 0.6),
          background:
            "radial-gradient(130% 80% at 50% 28%, transparent 35%, var(--c-abyss) 115%)",
        }}
        aria-hidden
      />
      {/* 가독성 스크림 (하단 중앙) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 50% at 50% 82%, rgba(2,2,3,0.55), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative flex min-h-[56vh] flex-col justify-between px-6 py-8 sm:min-h-[62vh] sm:px-10 sm:py-12">
        {/* 상단 메타 */}
        <div className="flex items-start justify-between text-white">
          <span className="label flex items-center gap-2 text-[10px] text-white/70">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${active ? "bg-[var(--success)]" : "bg-white/50"}`}
              style={active ? { animation: "pulse-soft 2s ease-in-out infinite" } : undefined}
            />
            {active ? "DIVING" : "SURFACE · 수면"}
          </span>
          <span className="label text-[10px] text-white/40">DEPTH LOG</span>
        </div>

        {/* 다이버 */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 transition-[top] duration-700"
          style={{ top: `${diverTop}%`, transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        >
          <Diver diving={status === "diving"} />
        </div>

        {/* 수심대 눈금 */}
        <ul className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-3 sm:right-6" aria-hidden>
          {[...DEPTH_ZONES].map((z) => {
            const isCurrent = active && z.id === currentZone.id;
            return (
              <li key={z.id} className="flex items-center justify-end gap-2 text-right">
                <span className="flex flex-col items-end leading-none">
                  <span
                    className={`label text-[9px] ${isCurrent ? "text-white" : "text-white/45"}`}
                    style={isCurrent ? { textShadow: "0 0 12px var(--glow)" } : undefined}
                  >
                    {z.sub}
                  </span>
                  <span className={`tnum mt-0.5 text-[10px] ${isCurrent ? "text-white" : "text-white/40"}`}>
                    {Math.abs(z.id)}m
                  </span>
                </span>
                <span
                  className="block h-px rounded-full transition-all"
                  style={{
                    width: isCurrent ? 26 : 10,
                    background: isCurrent ? "var(--primary-bright)" : "rgba(255,255,255,0.4)",
                    boxShadow: isCurrent ? "0 0 10px var(--glow)" : "none",
                  }}
                />
              </li>
            );
          })}
        </ul>

        {/* 중앙 오버레이 */}
        <div className="relative mt-auto flex w-full flex-col items-center">{children}</div>
      </div>
    </div>
  );
}
