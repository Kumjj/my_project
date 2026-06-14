"use client";

import { formatClock } from "@/lib/format";
import type { DiveStatus } from "@/hooks/useDive";

/** 대형 수심 카운터 — 그라데이션 화이트 + 글로우 (다크 그라데이션 무대 위) */
export default function DepthCounter({
  liveDepthM,
  elapsedSec,
  goalDepthM,
  status,
  subjectName,
}: {
  liveDepthM: number;
  elapsedSec: number;
  goalDepthM: number;
  status: DiveStatus;
  subjectName?: string;
}) {
  const depthStr = liveDepthM.toFixed(1);

  return (
    <div className="flex flex-col items-center text-center text-white">
      {subjectName && (
        <span className="label mb-3 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] text-white/85 backdrop-blur-sm">
          {subjectName}
        </span>
      )}
      <div className="flex items-start leading-none" aria-hidden>
        <span
          className="font-display font-semibold tabular-nums"
          style={{
            fontSize: "clamp(4.5rem, 16vw, 9rem)",
            letterSpacing: "-0.04em",
            background: "linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.72))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            textShadow: "0 0 40px var(--glow)",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))",
          }}
        >
          {depthStr}
        </span>
        <span className="font-display mt-2 text-2xl font-medium text-white/80 sm:text-3xl">m</span>
      </div>

      <span className="sr-only" aria-live="polite">
        {status === "diving"
          ? `잠수 진행 중, 목표 수심 ${goalDepthM}미터`
          : status === "paused"
            ? "일시정지됨"
            : ""}
      </span>

      <div className="label mt-4 flex items-center gap-4 text-[11px] text-white/70">
        <span className="tnum">{formatClock(elapsedSec)}</span>
        <span className="text-white/30">/</span>
        <span className="tnum">GOAL {goalDepthM}m</span>
      </div>
    </div>
  );
}
