"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { hydrateStore, useAppData } from "@/lib/store";

/**
 * 클라이언트 부트스트랩 (Linear 디자인 = 다크 전용):
 *  - hydrateStore()를 앱 전체에서 단 한 번 호출
 *  - <html>에 .dark 고정 적용
 *  - prefers-reduced-motion은 useSyncExternalStore로 구독 (effect 내 setState 회피)
 */

interface MotionCtx {
  reduced: boolean;
}
const MotionContext = createContext<MotionCtx>({ reduced: false });
export const useReducedMotion = () => useContext(MotionContext).reduced;

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const { meta } = useAppData();
  const sysReduced = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );

  // 한 번만 서버에서 데이터 로드
  useEffect(() => {
    hydrateStore();
  }, []);

  const reduced = meta.reducedMotion ?? sysReduced;

  // <html> 클래스 동기화 (DOM 부수효과 — effect의 정당한 용도)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.toggle("reduce-motion", reduced);
  }, [reduced]);

  return <MotionContext.Provider value={{ reduced }}>{children}</MotionContext.Provider>;
}
