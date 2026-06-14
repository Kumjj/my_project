"use client";

import { useSyncExternalStore } from "react";
import {
  type AppData,
  type DiveSession,
  type Subject,
  type SubjectColorToken,
  type Meta,
  SCHEMA_VERSION,
} from "./types";

/**
 * 클라이언트 스토어 — SQLite 백엔드(API)를 진실의 원천으로 사용.
 * useSyncExternalStore로 인메모리 캐시를 구독하고, 변경은 API로 영속화한다.
 * (진행 중 타이머 ActiveDive만 별도로 localStorage 사용 — useDive)
 */

function emptyMeta(): Meta {
  return {
    schemaVersion: SCHEMA_VERSION,
    theme: "dark",
    reducedMotion: null,
    bestDepthM: 0,
    longestStreak: 0,
    seededOnce: false,
  };
}

const INITIAL: AppData = { subjects: [], sessions: [], unlocks: {}, meta: emptyMeta() };

let state: AppData = INITIAL;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot() {
  return state;
}
function getServerSnapshot() {
  return INITIAL;
}
function set(next: AppData) {
  state = next;
  emit();
}

async function api<T = AppData>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

/** 클라 마운트 후 1회: 서버에서 로드 */
export async function hydrateStore() {
  if (hydrated) return;
  hydrated = true;
  try {
    set(await api<AppData>("/api/data"));
  } catch (e) {
    console.error("[store] hydrate 실패", e);
    hydrated = false; // 다음 기회에 재시도 가능
  }
}

// ---- React 훅 ----------------------------------------------------------
export function useAppData(): AppData {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function getStateSnapshot(): AppData {
  return state;
}

// ---- 뮤테이션 (서버 권위 + 낙관적) -------------------------------------

export interface CommitResult {
  newlyUnlocked: string[];
  isRecord: boolean;
  prevBest: number;
}

/** 완료된 다이브 기록 → 서버가 해금/신기록 판정 */
export async function commitSession(
  session: DiveSession,
): Promise<(CommitResult & { session: DiveSession }) | null> {
  try {
    const res = await api<{ data: AppData } & CommitResult>("/api/sessions", {
      method: "POST",
      body: JSON.stringify(session),
    });
    set(res.data);
    return {
      session,
      newlyUnlocked: res.newlyUnlocked,
      isRecord: res.isRecord,
      prevBest: res.prevBest,
    };
  } catch (e) {
    console.error("[store] commitSession 실패", e);
    return null;
  }
}

export async function addSubject(
  name: string,
  colorToken: SubjectColorToken,
): Promise<Subject | null> {
  try {
    const res = await api<{ data: AppData; subject: Subject }>("/api/subjects", {
      method: "POST",
      body: JSON.stringify({ name, colorToken }),
    });
    set(res.data);
    return res.subject;
  } catch (e) {
    console.error("[store] addSubject 실패", e);
    return null;
  }
}

export async function removeSubject(id: string): Promise<void> {
  // 낙관적 제거
  set({ ...state, subjects: state.subjects.filter((s) => s.id !== id) });
  try {
    set(await api<AppData>(`/api/subjects/${id}`, { method: "DELETE" }));
  } catch (e) {
    console.error("[store] removeSubject 실패", e);
  }
}

export async function setMeta(patch: Partial<Meta>): Promise<void> {
  // 낙관적 반영 (모션 토글 즉시 적용)
  set({ ...state, meta: { ...state.meta, ...patch } });
  try {
    set(
      await api<AppData>("/api/meta", {
        method: "PATCH",
        body: JSON.stringify({
          reducedMotion: patch.reducedMotion,
          theme: patch.theme,
        }),
      }),
    );
  } catch (e) {
    console.error("[store] setMeta 실패", e);
  }
}

export async function seedData(): Promise<void> {
  try {
    set(await api<AppData>("/api/seed", { method: "POST" }));
  } catch (e) {
    console.error("[store] seed 실패", e);
  }
}

export async function resetData(): Promise<void> {
  try {
    set(await api<AppData>("/api/reset", { method: "POST" }));
  } catch (e) {
    console.error("[store] reset 실패", e);
  }
}

export async function replaceAllData(data: AppData): Promise<void> {
  try {
    set(await api<AppData>("/api/import", { method: "POST", body: JSON.stringify(data) }));
  } catch (e) {
    console.error("[store] import 실패", e);
  }
}
