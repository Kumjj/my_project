/** 표시용 포맷 헬퍼 */

/** 초 → "1h 23m" / "23m" / "0m" */
export function formatDuration(sec: number): string {
  const totalMin = Math.floor(sec / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

/** 초 → "MM:SS" (타이머용) */
export function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** 미터 표기 "42m" */
export function formatDepth(m: number): string {
  return `${Math.round(m)}m`;
}

/** epoch ms → "6월 14일" */
export function formatDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** epoch ms → "2026.06.14" */
export function formatDateDot(ms: number): string {
  const d = new Date(ms);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd}`;
}

/** 상대 시간 "3일 전" */
export function formatRelative(ms: number): string {
  const diff = Date.now() - ms;
  const day = Math.floor(diff / 86400000);
  if (day <= 0) {
    const hr = Math.floor(diff / 3600000);
    if (hr <= 0) {
      const min = Math.floor(diff / 60000);
      return min <= 0 ? "방금" : `${min}분 전`;
    }
    return `${hr}시간 전`;
  }
  if (day === 1) return "어제";
  if (day < 7) return `${day}일 전`;
  return formatDate(ms);
}

/** 자정 기준 날짜 키 (로컬) */
export function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export const DAY_MS = 86400000;
