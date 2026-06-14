"use client";

import { useId } from "react";
import { arcPath } from "./chartUtils";
import { useCountUp } from "@/hooks/useCountUp";

// 0.27°(=0.001) 미만 아크는 서브픽셀 잡음이라 렌더 생략
const MIN_VISIBLE = 0.001;

/**
 * 주간 목표 대비 달성률 방사형 게이지 (270도 아크).
 * pct: 0~1
 */
export default function WeeklyGoalGauge({
  pct,
  hours,
  goalHours,
}: {
  pct: number;
  hours: number;
  goalHours: number;
}) {
  const gradId = useId();
  const clamped = Math.min(1, Math.max(0, pct));
  const animated = useCountUp(clamped * 100, 1000) / 100;
  const displayPct = Math.round(animated * 100);

  const START = -135;
  const SWEEP = 270;
  const cx = 90;
  const cy = 90;
  const r = 68;
  const rInner = 54;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="180" height="160" viewBox="0 0 180 160" role="img" aria-label={`주간 목표 달성률 ${Math.round(clamped * 100)}퍼센트`}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--c-surface)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>
          {/* 트랙 */}
          <path d={arcPath(cx, cy, r, rInner, START, START + SWEEP)} fill="var(--surface-2)" />
          {/* 채움 (액센트 그라데이션 + 글로우) */}
          {animated > MIN_VISIBLE && (
            <path
              d={arcPath(cx, cy, r, rInner, START, START + SWEEP * animated)}
              fill={`url(#${gradId})`}
              style={{ filter: "drop-shadow(0 0 8px var(--glow))" }}
            />
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-3">
          <span className="gradient-text font-display text-4xl font-semibold tabular-nums">{displayPct}%</span>
          <span className="label mt-1 text-[9px] text-faint">주간 목표</span>
        </div>
      </div>
      <p className="-mt-2 text-xs text-muted">
        <span className="tnum font-semibold text-fg">{hours.toFixed(1)}h</span>
        <span className="text-faint"> / {goalHours}h</span>
      </p>
    </div>
  );
}
