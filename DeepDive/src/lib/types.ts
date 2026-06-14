/**
 * DeepDive 도메인 타입.
 * 핵심 매핑: 집중 1분 = 수심 1m. (depthM = durationSec / 60, 반올림)
 */

/** 과목 색상에 쓰는 토큰명 (globals.css의 --subject-* 와 1:1) */
export const SUBJECT_COLOR_TOKENS = [
  "surface",
  "shallow",
  "mid",
  "deep",
  "glow",
  "coral",
  "sun",
  "kelp",
] as const;
export type SubjectColorToken = (typeof SUBJECT_COLOR_TOKENS)[number];

/** 수심대 경계 (도감/마일스톤 기준, 음수 = 깊이) */
export const DEPTH_ZONES = [
  { id: -5, label: "햇살 구간", sub: "Sunlight", minDepth: 0 },
  { id: -25, label: "산호 구간", sub: "Twilight", minDepth: 25 },
  { id: -60, label: "심해 구간", sub: "Midnight", minDepth: 60 },
  { id: -100, label: "발광 심연", sub: "Abyss", minDepth: 100 },
] as const;
export type DepthZoneId = (typeof DEPTH_ZONES)[number]["id"];

export interface Subject {
  id: string;
  name: string;
  colorToken: SubjectColorToken;
  createdAt: number;
}

export interface DiveSession {
  id: string;
  subjectId: string;
  startedAt: number; // epoch ms
  endedAt: number; // epoch ms
  durationSec: number;
  depthM: number; // = round(durationSec / 60)
  status: "completed" | "aborted";
  note?: string;
}

export interface Creature {
  id: string;
  name: string;
  sub: string; // 학명 느낌의 부제
  zone: DepthZoneId; // 해금되는 수심대
  svgKey: string; // 일러스트 키
  blurb: string; // 도감 설명
}

/** 진행 중 다이브 (새로고침/탭복귀 복원용) */
export interface ActiveDive {
  subjectId: string;
  startedAt: number; // epoch ms (최초 시작)
  pausedAccumSec: number; // 일시정지로 누적된 시간
  pausedAt: number | null; // 현재 일시정지 시작 시각 (null이면 진행 중)
  goalDepthM: number;
}

export type ThemePref = "light" | "dark" | "system";

export interface Meta {
  schemaVersion: number;
  theme: ThemePref;
  reducedMotion: boolean | null; // null = 시스템 따름
  bestDepthM: number;
  longestStreak: number;
  /** 첫 방문 시 자동 시드 1회 실행 여부 */
  seededOnce: boolean;
}

export interface AppData {
  subjects: Subject[];
  sessions: DiveSession[];
  /** creatureId -> unlockedAt(ms) */
  unlocks: Record<string, number>;
  meta: Meta;
}

export const SCHEMA_VERSION = 1;

/** 분 → 미터 환산 */
export const minutesToDepth = (sec: number) => Math.round(sec / 60);
