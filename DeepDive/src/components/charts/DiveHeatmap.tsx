"use client";

import { useMemo } from "react";
import { ChartEmpty } from "./ChartCard";
import { formatDate } from "@/lib/format";
import type { DayPoint } from "@/lib/selectors";

/** 그날 총 수심을 농도로 표현하는 히트맵 (연속 잠수 시각화) */
export default function DiveHeatmap({ data }: { data: DayPoint[] }) {
  const { cells, maxDepth, activeDays } = useMemo(() => {
    if (data.length === 0) return { cells: [], maxDepth: 0, activeDays: 0 };
    const maxDepth = Math.max(1, ...data.map((d) => d.totalDepth));
    const firstDow = new Date(data[0].day).getDay(); // 0=일
    const cells: Array<DayPoint | null> = [
      ...Array.from({ length: firstDow }, () => null),
      ...data,
    ];
    const activeDays = data.filter((d) => d.totalDepth > 0).length;
    return { cells, maxDepth, activeDays };
  }, [data]);

  if (data.length === 0 || activeDays === 0) {
    return <ChartEmpty message="이 기간엔 잠수 기록이 없어요" />;
  }

  const level = (depth: number) => {
    if (depth <= 0) return 0;
    const r = depth / maxDepth;
    if (r < 0.25) return 1;
    if (r < 0.5) return 2;
    if (r < 0.75) return 3;
    return 4;
  };

  const colorFor = (lv: number) => {
    if (lv === 0) return "var(--surface-2)";
    const op = [0, 0.3, 0.5, 0.72, 1][lv];
    return `color-mix(in srgb, var(--primary) ${op * 100}%, var(--surface-2))`;
  };

  return (
    <div>
      <div
        className="grid grid-flow-col gap-[3px]"
        style={{ gridTemplateRows: "repeat(7, 1fr)" }}
        role="img"
        aria-label={`최근 ${data.length}일 중 ${activeDays}일 잠수. 색이 진할수록 그날 총 수심이 깊어요.`}
      >
        {cells.map((c, i) =>
          c === null ? (
            <span key={`pad-${i}`} className="aspect-square" />
          ) : (
            <span
              key={c.day}
              title={`${formatDate(c.day)} · ${c.totalDepth}m`}
              className="aspect-square rounded-[3px] transition-transform hover:scale-125"
              style={{ background: colorFor(level(c.totalDepth)) }}
            />
          ),
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-faint">
        <span className="tnum">{activeDays}일 잠수</span>
        <div className="flex items-center gap-1">
          <span>적음</span>
          {[0, 1, 2, 3, 4].map((lv) => (
            <span
              key={lv}
              className="h-2.5 w-2.5 rounded-[3px]"
              style={{ background: colorFor(lv) }}
            />
          ))}
          <span>많음</span>
        </div>
      </div>
    </div>
  );
}
