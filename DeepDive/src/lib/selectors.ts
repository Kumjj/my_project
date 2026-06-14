import { type AppData, type DiveSession, type Subject } from "./types";
import { startOfDay, DAY_MS } from "./format";

/**
 * 대시보드 분석 셀렉터 — 순수 함수.
 * 컴포넌트는 useMemo로 감싸 필터 변경 시에만 재계산한다.
 */

export type RangeKey = 7 | 30 | 90 | "all";

export interface FilterState {
  range: RangeKey;
  subjectIds: string[]; // 비어있으면 전체
  minDepth: number; // 최소 수심(m) 임계값
}

export const DEFAULT_FILTER: FilterState = {
  range: 30,
  subjectIds: [],
  minDepth: 0,
};

/** 필터 적용된 '완료' 세션 (분석은 완료 세션만 집계) */
export function filterSessions(
  sessions: DiveSession[],
  filter: FilterState,
): DiveSession[] {
  const now = Date.now();
  const from =
    filter.range === "all" ? -Infinity : now - filter.range * DAY_MS;
  const subjectSet =
    filter.subjectIds.length > 0 ? new Set(filter.subjectIds) : null;

  return sessions.filter(
    (s) =>
      s.status === "completed" &&
      s.startedAt >= from &&
      s.depthM >= filter.minDepth &&
      (!subjectSet || subjectSet.has(s.subjectId)),
  );
}

export interface Kpis {
  totalSec: number;
  totalDives: number;
  bestDepthM: number;
  avgDepthM: number;
  currentStreak: number;
  weekSec: number; // 최근 7일 집중 초
  weeklyGoalPct: number; // 0~1, 주간 목표 대비
}

const WEEKLY_GOAL_SEC = 20 * 3600; // 주 20시간 목표

export function computeKpis(sessions: DiveSession[]): Kpis {
  const totalSec = sessions.reduce((a, s) => a + s.durationSec, 0);
  const totalDives = sessions.length;
  const bestDepthM = sessions.reduce((m, s) => Math.max(m, s.depthM), 0);
  const avgDepthM = totalDives ? Math.round(totalSec / 60 / totalDives) : 0;

  // 최근 7일 집중량으로 주간 목표율
  const weekAgo = Date.now() - 7 * DAY_MS;
  const weekSec = sessions
    .filter((s) => s.startedAt >= weekAgo)
    .reduce((a, s) => a + s.durationSec, 0);

  return {
    totalSec,
    totalDives,
    bestDepthM,
    avgDepthM,
    currentStreak: computeCurrentStreak(sessions),
    weekSec,
    weeklyGoalPct: Math.min(1, weekSec / WEEKLY_GOAL_SEC),
  };
}

/** 오늘(또는 어제)부터 거슬러 연속으로 잠수한 일수 */
export function computeCurrentStreak(sessions: DiveSession[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => startOfDay(s.startedAt)));
  const today = startOfDay(Date.now());

  // 오늘 기록이 없으면 어제부터 카운트 (오늘은 아직 안 끝남)
  let cursor = days.has(today) ? today : today - DAY_MS;
  if (!days.has(cursor)) return 0;

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

export interface SubjectSlice {
  subject: Subject;
  totalSec: number;
  share: number; // 0~1
}

/** 과목별 집중시간 비중 (도넛 차트용) */
export function bySubject(
  sessions: DiveSession[],
  subjects: Subject[],
): SubjectSlice[] {
  const map = new Map<string, number>();
  for (const s of sessions) {
    map.set(s.subjectId, (map.get(s.subjectId) ?? 0) + s.durationSec);
  }
  const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
  return subjects
    .map((subject) => ({
      subject,
      totalSec: map.get(subject.id) ?? 0,
      share: (map.get(subject.id) ?? 0) / total,
    }))
    .filter((s) => s.totalSec > 0)
    .sort((a, b) => b.totalSec - a.totalSec);
}

export interface DayPoint {
  day: number; // startOfDay ms
  totalDepth: number; // 그날 총 수심(m)
  totalSec: number;
}

/** 일별 시계열 (라인/히트맵 공용). 빈 날도 0으로 채워 연속 축 생성 */
export function byDay(
  sessions: DiveSession[],
  rangeDays: number,
): DayPoint[] {
  const today = startOfDay(Date.now());
  const map = new Map<number, { depth: number; sec: number }>();
  for (const s of sessions) {
    const k = startOfDay(s.startedAt);
    const cur = map.get(k) ?? { depth: 0, sec: 0 };
    cur.depth += s.depthM;
    cur.sec += s.durationSec;
    map.set(k, cur);
  }
  const out: DayPoint[] = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const day = today - i * DAY_MS;
    const v = map.get(day);
    out.push({ day, totalDepth: v?.depth ?? 0, totalSec: v?.sec ?? 0 });
  }
  return out;
}

/** 최근 N개 세션 (로그 리스트용) */
export function recentSessions(data: AppData, limit = 8): DiveSession[] {
  return [...data.sessions]
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, limit);
}

export const WEEKLY_GOAL_HOURS = WEEKLY_GOAL_SEC / 3600;
