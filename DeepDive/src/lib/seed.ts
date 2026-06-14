import {
  type AppData,
  type DiveSession,
  type Subject,
  type SubjectColorToken,
  minutesToDepth,
} from "./types";
import { defaultMeta } from "./persistence";

/**
 * 데모용 더미 데이터.
 * 빈 화면 없이 모든 차트/도감/스트릭이 풍성하게 보이도록
 * 최근 ~75일에 걸쳐 현실적인 분포의 잠수 기록을 생성한다.
 * (Date.now 기준 상대 날짜)
 */

const SEED_SUBJECTS: Array<{ name: string; colorToken: SubjectColorToken }> = [
  { name: "자료구조", colorToken: "shallow" },
  { name: "알고리즘", colorToken: "mid" },
  { name: "영어", colorToken: "sun" },
  { name: "전공 수학", colorToken: "coral" },
  { name: "사이드 프로젝트", colorToken: "kelp" },
];

// 결정적 의사난수 (시드 데이터가 매번 같은 분포가 되도록)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeSeedData(): AppData {
  const now = Date.now();
  const rand = mulberry32(20260614);

  const subjects: Subject[] = SEED_SUBJECTS.map((s, i) => ({
    id: `seed-subject-${i}`,
    name: s.name,
    colorToken: s.colorToken,
    createdAt: now - 80 * 86400000,
  }));

  const sessions: DiveSession[] = [];
  const DAY = 86400000;

  for (let dayAgo = 74; dayAgo >= 0; dayAgo--) {
    // 약 70% 날에만 공부 (스트릭/히트맵에 자연스러운 빈칸)
    if (rand() < 0.3) continue;

    const dayStart = new Date(now - dayAgo * DAY);
    dayStart.setHours(9, 0, 0, 0);

    // 최근으로 올수록 집중량이 늘어나는 우상향 추세
    const trend = 1 - dayAgo / 90;
    const sessionCount = 1 + Math.floor(rand() * (1 + trend * 2.5));

    let cursor = dayStart.getTime() + rand() * 4 * 3600000;

    for (let k = 0; k < sessionCount; k++) {
      const subject = subjects[Math.floor(rand() * subjects.length)];
      // 15~95분, 가끔 깊은 잠수
      const base = 15 + rand() * 55;
      const deepBoost = rand() < 0.12 ? 30 + rand() * 40 : 0;
      const durationMin = Math.round(base + deepBoost + trend * 15);
      const durationSec = durationMin * 60;

      const startedAt = Math.round(cursor);
      const endedAt = startedAt + durationSec * 1000;

      sessions.push({
        id: `seed-${dayAgo}-${k}`,
        subjectId: subject.id,
        startedAt,
        endedAt,
        durationSec,
        depthM: minutesToDepth(durationSec),
        status: rand() < 0.06 ? "aborted" : "completed",
      });

      cursor = endedAt + (20 + rand() * 120) * 60 * 1000;
    }
  }

  return {
    subjects,
    sessions,
    unlocks: {},
    meta: { ...defaultMeta(), seededOnce: true },
  };
}
