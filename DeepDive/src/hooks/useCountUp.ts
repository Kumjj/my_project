"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/ClientProviders";

/**
 * 목표값까지 부드럽게 증가하는 카운트업.
 * - RAF 기반 ease-out
 * - reduced-motion이면 즉시 최종값
 */
export function useCountUp(target: number, durationMs = 900): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // reduced면 애니메이션 생략 — 표시값은 아래 return(reduced?target:value)이 처리
    if (reduced) {
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = from + (target - from) * eased;
      setValue(next);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      fromRef.current = target;
    };
  }, [target, durationMs, reduced]);

  return reduced ? target : value;
}
