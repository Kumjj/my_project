"use client";

import { useMemo } from "react";
import { arcPath } from "./chartUtils";
import { ChartEmpty } from "./ChartCard";
import { subjectColorVar } from "@/lib/colors";
import { formatDuration } from "@/lib/format";
import type { SubjectSlice } from "@/lib/selectors";

/** 과목별 집중시간 비중 도넛 (자작 SVG path, 그레이스케일) */
export default function DonutChart({ slices }: { slices: SubjectSlice[] }) {
  const total = slices.reduce((a, s) => a + s.totalSec, 0);

  // 세그먼트 사이에만 간격(N-1개) → 정확히 360° 분할
  const segments = useMemo(() => {
    if (slices.length === 1) {
      return [{ slice: slices[0], start: 0, end: 360 }];
    }
    const GAP = 4;
    let acc = 0;
    return slices.map((s, i) => {
      const start = acc * 360;
      acc += s.share;
      const end = acc * 360;
      return { slice: s, start, end: end - (i < slices.length - 1 ? GAP : 0) };
    });
  }, [slices]);

  if (slices.length === 0 || total === 0) {
    return <ChartEmpty message="아직 기록된 잠수가 없어요" />;
  }

  const ariaSummary = slices
    .map((s) => `${s.subject.name} ${Math.round(s.share * 100)}%`)
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-7">
      <div className="relative shrink-0">
        <svg
          width="172"
          height="172"
          viewBox="0 0 172 172"
          role="img"
          aria-label={`과목별 집중 비중: ${ariaSummary}`}
        >
          {segments.map(({ slice, start, end }) => (
            <path
              key={slice.subject.id}
              d={arcPath(86, 86, 80, 54, start, end)}
              fill={subjectColorVar(slice.subject.colorToken)}
              stroke="var(--surface)"
              strokeWidth="1"
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="gradient-text font-display text-3xl font-semibold tabular-nums">
            {Math.round(total / 3600)}
          </span>
          <span className="label text-[9px] text-faint">총 집중 시간</span>
        </div>
      </div>

      <ul className="flex w-full flex-col">
        {slices.map((s) => (
          <li
            key={s.subject.id}
            className="flex items-center gap-2.5 border-b border-hair py-2 text-sm last:border-0"
          >
            <span className="h-3 w-3 shrink-0" style={{ background: subjectColorVar(s.subject.colorToken) }} />
            <span className="flex-1 truncate font-medium text-fg">{s.subject.name}</span>
            <span className="tnum text-xs text-muted">{formatDuration(s.totalSec)}</span>
            <span className="tnum w-10 text-right text-xs font-bold text-fg">
              {Math.round(s.share * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
