"use client";

import { useId, useMemo } from "react";
import { scaleLinear, smoothPath, niceMax, approxLength } from "./chartUtils";
import { ChartEmpty } from "./ChartCard";
import { formatDate } from "@/lib/format";
import type { DayPoint } from "@/lib/selectors";

const W = 620;
const H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 34 };

/** 일별 총 수심 추이 — 면적 + 곡선(stroke-dashoffset 드로잉), 모노크롬 */
export default function DepthLineChart({ data }: { data: DayPoint[] }) {
  const gradId = useId();
  const nonEmpty = data.filter((d) => d.totalDepth > 0);
  const computed = useMemo(() => {
    if (data.length < 2) return null;
    const maxV = niceMax(Math.max(1, ...data.map((d) => d.totalDepth)));
    const x = scaleLinear(0, data.length - 1, PAD.left, W - PAD.right);
    const y = scaleLinear(0, maxV, H - PAD.bottom, PAD.top);
    const points = data.map((d, i) => ({ x: x(i), y: y(d.totalDepth) }));
    const line = smoothPath(points);
    const area =
      line +
      ` L ${points[points.length - 1].x} ${H - PAD.bottom}` +
      ` L ${points[0].x} ${H - PAD.bottom} Z`;
    return { maxV, x, y, points, line, area, len: approxLength(points) };
  }, [data]);

  // 단일 데이터는 왜곡되므로 빈 상태로 처리 (≥2개 필요)
  if (!computed || nonEmpty.length === 0) {
    return <ChartEmpty message="추이를 그리려면 이틀 이상의 기록이 필요해요" />;
  }

  const { maxV, y, points, line, area, len } = computed;
  const gridVals = [0, maxV / 2, maxV];
  const tickIdx = [0, Math.floor((data.length - 1) / 2), data.length - 1];
  const peak = points.reduce(
    (m, p, i) => (p.y < m.p.y ? { p, i } : m),
    { p: points[0], i: 0 },
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`일별 총 수심 추이. 최대 ${data.reduce((m, d) => Math.max(m, d.totalDepth), 0)}m, 최근 ${data.length}일`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* y 그리드 (하어라인) */}
      {gridVals.map((v, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(v)}
            y2={y(v)}
            stroke="var(--hair)"
            strokeWidth="1"
            strokeDasharray={i === 0 ? "0" : "2 4"}
          />
          <text x={2} y={y(v) + 4} fontSize="10" className="tnum" fill="var(--text-faint)">
            {Math.round(v)}
          </text>
        </g>
      ))}

      {/* 면적 (액센트 그라데이션) */}
      <path d={area} fill={`url(#${gradId})`} className="animate-fade-in" />
      {/* 곡선 (액센트 + 글로우) */}
      <path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len}
        className="animate-draw"
        style={{ filter: "drop-shadow(0 0 6px var(--glow))" }}
      />
      {/* 최고점 마커 */}
      <circle cx={peak.p.x} cy={peak.p.y} r="8" fill="var(--accent)" opacity="0.18" />
      <circle
        cx={peak.p.x}
        cy={peak.p.y}
        r="4"
        fill="var(--accent)"
        className="animate-pop"
        style={{ animationDelay: "0.7s", filter: "drop-shadow(0 0 6px var(--glow))" }}
      />

      {/* x 라벨 */}
      {tickIdx.map((idx) => (
        <text
          key={idx}
          x={points[idx].x}
          y={H - 8}
          fontSize="10"
          textAnchor="middle"
          fill="var(--text-faint)"
        >
          {formatDate(data[idx].day)}
        </text>
      ))}
    </svg>
  );
}
