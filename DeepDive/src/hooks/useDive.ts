"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  loadActiveDive,
  saveActiveDive,
  clearActiveDive,
} from "@/lib/persistence";
import { commitSession, type CommitResult } from "@/lib/store";
import { type ActiveDive, type DiveSession, minutesToDepth } from "@/lib/types";

/**
 * 다이브 타이머 — useReducer 상태머신.
 *   idle → diving ⇄ paused → (end) → idle
 *
 * 핵심 설계: "부드러움"과 "정확성"을 분리한다.
 *  - 화면 갱신(부드러운 하강)은 requestAnimationFrame.
 *  - 경과시간 계산은 항상 startedAt 타임스탬프 기준(now - startedAt - pausedMs).
 *    → 백그라운드 탭/새로고침에서도 setInterval 누적오차 없이 정확.
 */

export type DiveStatus = "idle" | "diving" | "paused";

interface DiveState {
  status: DiveStatus;
  subjectId: string | null;
  startedAt: number; // 최초 시작 epoch ms
  pausedAccumSec: number; // 완료된 일시정지들의 누적 초
  pausedAt: number | null; // 현재 일시정지 시작 ms (paused일 때만)
  goalDepthM: number;
}

type Action =
  | { type: "START"; subjectId: string; goalDepthM: number; now: number }
  | { type: "PAUSE"; now: number }
  | { type: "RESUME"; now: number }
  | { type: "RESTORE"; dive: ActiveDive }
  | { type: "RESET" };

const initialState: DiveState = {
  status: "idle",
  subjectId: null,
  startedAt: 0,
  pausedAccumSec: 0,
  pausedAt: null,
  goalDepthM: 30,
};

function reducer(state: DiveState, action: Action): DiveState {
  switch (action.type) {
    case "START":
      return {
        status: "diving",
        subjectId: action.subjectId,
        startedAt: action.now,
        pausedAccumSec: 0,
        pausedAt: null,
        goalDepthM: action.goalDepthM,
      };
    case "PAUSE":
      if (state.status !== "diving") return state;
      return { ...state, status: "paused", pausedAt: action.now };
    case "RESUME":
      if (state.status !== "paused" || state.pausedAt == null) return state;
      return {
        ...state,
        status: "diving",
        pausedAccumSec:
          state.pausedAccumSec + (action.now - state.pausedAt) / 1000,
        pausedAt: null,
      };
    case "RESTORE":
      return {
        status: action.dive.pausedAt != null ? "paused" : "diving",
        subjectId: action.dive.subjectId,
        startedAt: action.dive.startedAt,
        pausedAccumSec: action.dive.pausedAccumSec,
        pausedAt: action.dive.pausedAt,
        goalDepthM: action.dive.goalDepthM,
      };
    case "RESET":
      return { ...initialState, goalDepthM: state.goalDepthM };
  }
}

/** 타임스탬프 기준 순수 경과시간(초) 계산 */
function computeElapsedSec(s: DiveState, now: number): number {
  if (s.status === "idle") return 0;
  let pausedMs = s.pausedAccumSec * 1000;
  if (s.status === "paused" && s.pausedAt != null) {
    pausedMs += now - s.pausedAt;
  }
  return Math.max(0, (now - s.startedAt - pausedMs) / 1000);
}

function toActiveDive(s: DiveState): ActiveDive {
  return {
    subjectId: s.subjectId!,
    startedAt: s.startedAt,
    pausedAccumSec: s.pausedAccumSec,
    pausedAt: s.pausedAt,
    goalDepthM: s.goalDepthM,
  };
}

export interface UseDive {
  status: DiveStatus;
  subjectId: string | null;
  goalDepthM: number;
  elapsedSec: number;
  depthM: number; // 정수 미터 (=round(min))
  liveDepthM: number; // 소수 1자리 라이브 미터
  /** 시각적 하강 진행도 0~1 (목표 대비) */
  progress: number;
  goalReached: boolean;
  start: (subjectId: string, goalDepthM: number) => void;
  pause: () => void;
  resume: () => void;
  /** 종료 후 기록 커밋(서버). 1분 미만이면 기록하지 않고 null 반환 */
  end: () => Promise<(CommitResult & { session: DiveSession }) | null>;
}

const MIN_LOGGABLE_SEC = 60;

export function useDive(): UseDive {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [elapsedSec, setElapsedSec] = useState(0);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef(state);

  // 최신 state를 ref에 보관 (RAF 콜백에서 참조) — 렌더 중 ref 쓰기 회피
  useEffect(() => {
    stateRef.current = state;
  });

  // 마운트 시 진행 중 다이브 복원 (elapsed는 아래 RAF effect가 상태 전이로 채운다)
  useEffect(() => {
    const saved = loadActiveDive();
    if (saved) dispatch({ type: "RESTORE", dive: saved });
  }, []);

  // RAF 루프: diving 동안만 매 프레임 경과시간 재계산
  useEffect(() => {
    if (state.status !== "diving") {
      // paused/idle: 다음 프레임에 정지값 1회 반영 (effect 본문 동기 setState 회피)
      const id = requestAnimationFrame(() =>
        setElapsedSec(computeElapsedSec(stateRef.current, Date.now())),
      );
      return () => cancelAnimationFrame(id);
    }
    const tick = () => {
      setElapsedSec(computeElapsedSec(stateRef.current, Date.now()));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [state.status, state.startedAt]);

  // 탭 복귀 시 즉시 동기화 (RAF는 백그라운드에서 멈추므로)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        setElapsedSec(computeElapsedSec(stateRef.current, Date.now()));
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // 상태 전이 시 localStorage 동기화
  useEffect(() => {
    if (state.status === "idle") {
      clearActiveDive();
    } else {
      saveActiveDive(toActiveDive(state));
    }
  }, [state]);

  const start = useCallback((subjectId: string, goalDepthM: number) => {
    dispatch({ type: "START", subjectId, goalDepthM, now: Date.now() });
    setElapsedSec(0);
  }, []);

  const pause = useCallback(() => dispatch({ type: "PAUSE", now: Date.now() }), []);
  const resume = useCallback(() => dispatch({ type: "RESUME", now: Date.now() }), []);

  const end = useCallback(async () => {
    const s = stateRef.current;
    if (s.status === "idle" || !s.subjectId) return null;
    const now = Date.now();
    const finalSec = Math.round(computeElapsedSec(s, now));
    dispatch({ type: "RESET" });
    setElapsedSec(0);
    clearActiveDive();

    if (finalSec < MIN_LOGGABLE_SEC) {
      return null;
    }
    const session: DiveSession = {
      id: crypto.randomUUID(),
      subjectId: s.subjectId,
      startedAt: s.startedAt,
      // 불변식 유지: endedAt = startedAt + durationSec*1000 (시드 데이터와 동일 규약)
      endedAt: s.startedAt + finalSec * 1000,
      durationSec: finalSec,
      depthM: minutesToDepth(finalSec),
      status: "completed",
    };
    // 서버가 해금/신기록을 판정해 결과를 돌려준다
    return commitSession(session);
  }, []);

  const liveDepthM = elapsedSec / 60;
  const goalSec = state.goalDepthM * 60;
  const progress = goalSec > 0 ? Math.min(1, elapsedSec / goalSec) : 0;

  return {
    status: state.status,
    subjectId: state.subjectId,
    goalDepthM: state.goalDepthM,
    elapsedSec,
    depthM: minutesToDepth(elapsedSec),
    liveDepthM,
    progress,
    goalReached: liveDepthM >= state.goalDepthM,
    start,
    pause,
    resume,
    end,
  };
}
