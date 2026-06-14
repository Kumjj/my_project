import type { SubjectColorToken } from "./types";

/** 과목 색 토큰 → CSS 변수 (globals.css의 --subject-*) */
export const subjectColorVar = (token: SubjectColorToken) =>
  `var(--subject-${token})`;

/** 수심 정규화값(0~1) → 그라데이션 색 보간용 CSS color-mix 체인은 컴포넌트에서 처리.
 * 여기서는 수심대별 대표색만 제공 (히트맵/도감 등) */
export function depthColor(depthM: number): string {
  if (depthM >= 100) return "var(--c-mid)";
  if (depthM >= 60) return "var(--subject-deep)";
  if (depthM >= 25) return "var(--c-shallow)";
  return "var(--c-surface)";
}

/** 순환 배정용 토큰 순서 */
export const SUBJECT_TOKEN_CYCLE: SubjectColorToken[] = [
  "shallow",
  "mid",
  "sun",
  "coral",
  "kelp",
  "surface",
  "deep",
  "glow",
];
