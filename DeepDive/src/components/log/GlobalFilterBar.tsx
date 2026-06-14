"use client";

import { useEffect, useRef, useState } from "react";
import type { FilterState, RangeKey } from "@/lib/selectors";
import { subjectColorVar } from "@/lib/colors";
import type { Subject } from "@/lib/types";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 7, label: "7일" },
  { key: 30, label: "30일" },
  { key: 90, label: "90일" },
  { key: "all", label: "전체" },
];

/** 대시보드 전역 필터. 최소수심 슬라이더만 디바운스 적용 */
export default function GlobalFilterBar({
  filter,
  subjects,
  onChange,
}: {
  filter: FilterState;
  subjects: Subject[];
  onChange: (f: FilterState) => void;
}) {
  const [minDepth, setMinDepth] = useState(filter.minDepth);
  const timer = useRef<number | null>(null);

  // 슬라이더 디바운스 (250ms) — 드래그 중 차트 폭주 방지
  useEffect(() => {
    if (timer.current != null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (minDepth !== filter.minDepth) onChange({ ...filter, minDepth });
    }, 250);
    return () => {
      if (timer.current != null) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDepth]);

  const toggleSubject = (id: string) => {
    const has = filter.subjectIds.includes(id);
    onChange({
      ...filter,
      subjectIds: has
        ? filter.subjectIds.filter((s) => s !== id)
        : [...filter.subjectIds, id],
    });
  };

  return (
    <div className="card flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        {/* 기간 */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-faint">기간</span>
          <div className="flex rounded-full border border-border bg-surface-2 p-0.5" role="group" aria-label="기간 필터">
            {RANGES.map((r) => {
              const active = filter.range === r.key;
              return (
                <button
                  key={String(r.key)}
                  onClick={() => onChange({ ...filter, range: r.key })}
                  aria-pressed={active}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-primary text-[var(--primary-ink)] shadow-[var(--shadow-sm)]"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 최소 수심 */}
        <div className="flex min-w-[180px] flex-1 items-center gap-3">
          <span className="whitespace-nowrap text-xs font-medium text-faint">
            최소 수심
          </span>
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            value={minDepth}
            onChange={(e) => setMinDepth(Number(e.target.value))}
            aria-label="최소 수심 필터"
            aria-valuetext={`${minDepth}미터 이상`}
            className="flex-1"
          />
          <span className="tnum w-12 text-right text-xs font-semibold text-fg">
            {minDepth}m+
          </span>
        </div>
      </div>

      {/* 과목 멀티셀렉트 */}
      {subjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-faint">과목</span>
          <button
            onClick={() => onChange({ ...filter, subjectIds: [] })}
            aria-pressed={filter.subjectIds.length === 0}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              filter.subjectIds.length === 0
                ? "border-[color:var(--accent)]/40 bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-fg"
                : "border-border text-muted hover:text-fg"
            }`}
          >
            전체
          </button>
          {subjects.map((s) => {
            const active = filter.subjectIds.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleSubject(s.id)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  active
                    ? "border-[color:var(--accent)]/40 bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-fg shadow-[0_0_16px_var(--glow)]"
                    : "border-border text-muted hover:text-fg"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: subjectColorVar(s.colorToken) }}
                />
                {s.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
