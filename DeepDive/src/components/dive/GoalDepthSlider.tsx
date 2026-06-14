"use client";

import { formatDuration } from "@/lib/format";

const PRESETS = [25, 50, 90];

/** 목표 수심(=목표 집중 시간, 분) 슬라이더 */
export default function GoalDepthSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (m: number) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="label text-[10px] text-muted">목표 수심 · GOAL</p>
        <p className="text-sm text-fg">
          <span className="tnum text-base font-semibold text-primary">{value}m</span>
          <span className="ml-2 text-xs text-faint">{formatDuration(value * 60)}</span>
        </p>
      </div>
      <input
        type="range"
        min={5}
        max={120}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="목표 수심 (5~120미터)"
        aria-valuemin={5}
        aria-valuemax={120}
        aria-valuenow={value}
        aria-valuetext={`${value}미터, ${formatDuration(value * 60)} 집중`}
        className="w-full"
      />
      <div className="mt-3 flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-pressed={value === p}
            className={`label rounded-full border px-3 py-1 text-[10px] transition-all duration-200 ${
              value === p
                ? "border-[color:var(--accent)]/40 text-primary shadow-[0_0_16px_var(--glow)]"
                : "border-border text-muted hover:text-fg"
            }`}
            style={value === p ? { background: "color-mix(in srgb, var(--accent) 12%, transparent)" } : undefined}
          >
            {p}m
          </button>
        ))}
      </div>
    </div>
  );
}
