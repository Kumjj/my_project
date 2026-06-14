"use client";

import type { ReactNode } from "react";
import { useCountUp } from "@/hooks/useCountUp";
import SpotlightCard from "@/components/ui/SpotlightCard";

/** KPI 카드 — 마우스 스포트라이트 + 그라데이션 숫자 (Linear) */
export default function KpiCard({
  label,
  value,
  format,
  unit,
  icon,
}: {
  label: string;
  value: number;
  format?: (v: number) => string;
  unit?: string;
  icon: ReactNode;
}) {
  const animated = useCountUp(value);
  const shown = format ? format(animated) : Math.round(animated).toString();

  return (
    <SpotlightCard className="p-4">
      <div className="flex items-center justify-between">
        <span className="label text-[9px] text-muted">{label}</span>
        <span
          className="grid h-8 w-8 place-items-center rounded-lg text-accent"
          style={{
            background: "color-mix(in srgb, var(--accent) 16%, transparent)",
            boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent), 0 0 16px var(--glow)",
          }}
        >
          {icon}
        </span>
      </div>
      <p className="mt-4 flex items-baseline gap-1">
        <span className="gradient-text font-display text-3xl font-semibold tabular-nums">
          {shown}
        </span>
        {unit && <span className="text-xs font-medium text-faint">{unit}</span>}
      </p>
    </SpotlightCard>
  );
}
