import { activeDiveSchema } from "./schema";
import { type ActiveDive, type Meta, type AppData, SCHEMA_VERSION } from "./types";

/**
 * localStorage는 이제 "진행 중 다이브(타이머)"에만 쓴다.
 * 완료된 데이터(과목/세션/해금/설정)는 SQLite 백엔드(API)가 진실의 원천.
 * defaultMeta/defaultData는 시더/서버에서 재사용하는 순수 팩토리.
 */

const ACTIVE_KEY = "deepdive:active";

const isBrowser = () => typeof window !== "undefined";

export function defaultMeta(): Meta {
  return {
    schemaVersion: SCHEMA_VERSION,
    theme: "dark",
    reducedMotion: null,
    bestDepthM: 0,
    longestStreak: 0,
    seededOnce: false,
  };
}

export function defaultData(): AppData {
  return { subjects: [], sessions: [], unlocks: {}, meta: defaultMeta() };
}

export function loadActiveDive(): ActiveDive | null {
  if (!isBrowser()) return null;
  try {
    const rawStr = window.localStorage.getItem(ACTIVE_KEY);
    if (!rawStr) return null;
    const parsed = activeDiveSchema.safeParse(JSON.parse(rawStr));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveActiveDive(dive: ActiveDive): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(ACTIVE_KEY, JSON.stringify(dive));
  } catch (e) {
    console.error("[deepdive] 진행중 다이브 저장 실패", e);
  }
}

export function clearActiveDive(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACTIVE_KEY);
}

/** 진행 중 다이브 존재 여부 (가벼운 체크 — 네비 표식용) */
export function hasActiveDive(): boolean {
  return isBrowser() && window.localStorage.getItem(ACTIVE_KEY) != null;
}

export const STORAGE_KEYS = { ACTIVE_KEY };
