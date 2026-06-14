"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/lib/store";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/log/KpiCard";
import GlobalFilterBar from "@/components/log/GlobalFilterBar";
import SessionList from "@/components/log/SessionList";
import { ChartCard } from "@/components/charts/ChartCard";
import DonutChart from "@/components/charts/DonutChart";
import DepthLineChart from "@/components/charts/DepthLineChart";
import DiveHeatmap from "@/components/charts/DiveHeatmap";
import WeeklyGoalGauge from "@/components/charts/WeeklyGoalGauge";
import {
  DEFAULT_FILTER,
  type FilterState,
  filterSessions,
  computeKpis,
  bySubject,
  byDay,
  recentSessions,
  WEEKLY_GOAL_HOURS,
} from "@/lib/selectors";
import { formatDuration } from "@/lib/format";
import { IconClock, IconWaves, IconFlame, IconTrophy } from "@/components/ui/Icons";

export default function LogPage() {
  const data = useAppData();
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);

  // 필터 변경 시에만 재계산되는 셀렉터 파이프라인
  const filtered = useMemo(
    () => filterSessions(data.sessions, filter),
    [data.sessions, filter],
  );
  const kpis = useMemo(() => computeKpis(filtered), [filtered]);
  const slices = useMemo(
    () => bySubject(filtered, data.subjects),
    [filtered, data.subjects],
  );
  const rangeDays = filter.range === "all" ? 90 : filter.range;
  const lineData = useMemo(() => byDay(filtered, rangeDays), [filtered, rangeDays]);
  const heatData = useMemo(() => byDay(filtered, Math.max(rangeDays, 49)), [filtered, rangeDays]);
  const recent = useMemo(() => {
    const ids = new Set(filtered.map((s) => s.id));
    return recentSessions({ ...data, sessions: data.sessions.filter((s) => ids.has(s.id)) }, 8);
  }, [filtered, data]);

  // 필터가 바뀌면 차트 진입 애니메이션 재생 (stagger 모핑)
  const morphKey = `${filter.range}-${filter.subjectIds.join(",")}-${filter.minDepth}`;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="분석"
        title="항해 로그"
        description="쌓인 잠수가 곧 학습 분석이 됩니다. 기간·과목·수심으로 필터링하면 모든 패널이 함께 반응해요."
      />

      <GlobalFilterBar filter={filter} subjects={data.subjects} onChange={setFilter} />

      {/* KPI */}
      <div key={`kpi-${morphKey}`} className="stagger mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="총 집중 시간"
          value={kpis.totalSec}
          format={(v) => formatDuration(v)}
          icon={<IconClock width={18} height={18} strokeWidth={1.5} />}
        />
        <KpiCard
          label="누적 최고 수심"
          value={data.meta.bestDepthM}
          unit="m"
          icon={<IconTrophy width={18} height={18} strokeWidth={1.5} />}
        />
        <KpiCard
          label="연속 잠수"
          value={kpis.currentStreak}
          unit="일"
          icon={<IconFlame width={18} height={18} strokeWidth={1.5} />}
        />
        <KpiCard
          label="잠수 횟수"
          value={kpis.totalDives}
          unit="회"
          icon={<IconWaves width={18} height={18} strokeWidth={1.5} />}
        />
      </div>

      {/* 차트 그리드 */}
      <div key={`charts-${morphKey}`} className="stagger mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="일별 수심 추이" hint={`최근 ${rangeDays}일`} className="lg:col-span-2">
          <DepthLineChart data={lineData} />
        </ChartCard>

        <ChartCard title="주간 목표">
          <div className="flex flex-1 items-center justify-center">
            <WeeklyGoalGauge
              pct={kpis.weeklyGoalPct}
              hours={Math.round((kpis.weekSec / 3600) * 10) / 10}
              goalHours={WEEKLY_GOAL_HOURS}
            />
          </div>
        </ChartCard>

        <ChartCard title="과목별 집중 비중" className="lg:col-span-2">
          <DonutChart slices={slices} />
        </ChartCard>

        <ChartCard title="최근 잠수">
          <SessionList sessions={recent} subjects={data.subjects} />
        </ChartCard>

        <ChartCard title="잠수 히트맵" hint="진할수록 깊은 날" className="lg:col-span-3">
          <DiveHeatmap data={heatData} />
        </ChartCard>
      </div>
    </div>
  );
}
