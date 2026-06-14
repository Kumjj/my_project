/** 라이브러리 없이 SVG 차트를 그리기 위한 스케일/지오메트리 유틸 */

/** 보기 좋은 최대 눈금 (1/2/5 × 10^n) */
export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = Math.pow(10, exp);
  const frac = value / base;
  const niceFrac = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return niceFrac * base;
}

/** [d0,d1] → [r0,r1] 선형 매핑 */
export function scaleLinear(d0: number, d1: number, r0: number, r1: number) {
  const span = d1 - d0 || 1;
  return (v: number) => r0 + ((v - d0) / span) * (r1 - r0);
}

/** 극좌표 → 직교 (12시 방향 0도, 시계방향) */
export function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** 도넛 세그먼트(아크) path. startAngle/endAngle deg, 시계방향 */
export function arcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number,
): string {
  // 완전한 원(360도)은 path로 그릴 수 없어 살짝 줄임
  const sweep = endAngle - startAngle;
  const safeEnd = sweep >= 360 ? startAngle + 359.999 : endAngle;
  const largeArc = safeEnd - startAngle > 180 ? 1 : 0;

  const oStart = polar(cx, cy, rOuter, startAngle);
  const oEnd = polar(cx, cy, rOuter, safeEnd);
  const iEnd = polar(cx, cy, rInner, safeEnd);
  const iStart = polar(cx, cy, rInner, startAngle);

  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${oEnd.x} ${oEnd.y}`,
    `L ${iEnd.x} ${iEnd.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${iStart.x} ${iStart.y}`,
    "Z",
  ].join(" ");
}

/** 점들 → 부드러운 곡선 path (Catmull-Rom → Bezier) */
export function smoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  const d: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const t = 0.18;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`);
  }
  return d.join(" ");
}

/** path 총 길이 추정 (stroke-dashoffset 애니메이션 초기값용) */
export function approxLength(points: Array<{ x: number; y: number }>): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return Math.ceil(len * 1.15);
}
