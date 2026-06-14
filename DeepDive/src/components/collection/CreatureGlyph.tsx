"use client";

/**
 * 도감 생물 일러스트 — 라이브러리/이미지 없이 직접 그린 SVG.
 * locked=true면 실루엣(단색)으로 렌더.
 */
export function CreatureGlyph({
  svgKey,
  size = 56,
  locked = false,
}: {
  svgKey: string;
  size?: number;
  locked?: boolean;
}) {
  const fill = locked ? "var(--text-faint)" : undefined;
  const op = locked ? 0.45 : 1;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-hidden
      style={{ opacity: op }}
    >
      <Shape svgKey={svgKey} locked={locked} solid={fill} />
    </svg>
  );
}

function Shape({
  svgKey,
  locked,
  solid,
}: {
  svgKey: string;
  locked: boolean;
  solid?: string;
}) {
  // 잠금 시 단색, 해제 시 컬러
  const c = (color: string) => (locked ? solid : color);

  switch (svgKey) {
    case "fish":
      return (
        <g>
          <path d="M10 32c8-12 26-14 38-6 4 3 6 6 6 6s-2 3-6 6c-12 8-30 6-38-6z" fill={c("var(--subject-sun)")} />
          <path d="M48 26c4-3 8-4 8-4s0 6-2 10c2 4 2 10 2 10s-4-1-8-4z" fill={c("var(--subject-coral)")} />
          <circle cx="20" cy="29" r="2.2" fill={c("#0b1b3a")} />
        </g>
      );
    case "turtle":
      return (
        <g>
          <ellipse cx="32" cy="34" rx="18" ry="13" fill={c("var(--subject-kelp)")} />
          <path d="M32 23l5 5-5 5-5-5z M20 28l4 4-4 4-3-5z M44 28l3 3-3 5-4-4z" fill={c("var(--c-deep)")} opacity="0.5" />
          <circle cx="50" cy="30" r="5" fill={c("var(--subject-kelp)")} />
          <path d="M16 42l-5 4M48 44l4 4M22 45l-2 5M42 45l2 5" stroke={c("var(--subject-kelp)")} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "jelly":
      return (
        <g>
          <path d="M16 30a16 16 0 0 1 32 0v3H16z" fill={c("var(--subject-glow)")} opacity="0.85" />
          <path d="M20 34c0 6-2 14-2 18M28 34c0 8-1 16-1 20M36 34c0 8 1 16 1 20M44 34c0 4-2 12-2 18" stroke={c("var(--subject-glow)")} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );
    case "manta":
      return (
        <g>
          <path d="M32 20c-14 0-26 8-30 14 6 0 10 2 14 6 2-4 8-8 16-8s14 4 16 8c4-4 8-6 14-6-4-6-16-14-30-14z" fill={c("var(--subject-mid)")} />
          <path d="M22 20c-3-3-3-6-3-6s4 1 6 4M42 20c3-3 3-6 3-6s-4 1-6 4" stroke={c("var(--subject-mid)")} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "octopus":
      return (
        <g>
          <path d="M22 26a10 10 0 0 1 20 0v8H22z" fill={c("var(--subject-coral)")} />
          <path d="M24 34c-2 8-8 10-12 14M30 35c-1 8-4 14-4 18M34 35c1 8 4 14 4 18M40 34c2 8 8 10 12 14" stroke={c("var(--subject-coral)")} strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="28" cy="24" r="2" fill={c("#0b1b3a")} />
          <circle cx="36" cy="24" r="2" fill={c("#0b1b3a")} />
        </g>
      );
    case "seahorse":
      return (
        <g>
          <path d="M30 12c6 0 9 4 9 9 0 6-5 8-5 14 0 5 4 7 4 12 0 3-3 5-6 5s-6-3-6-7c0-8 4-10 4-16 0-4-3-5-3-10s3-7 3-7z" fill={c("var(--subject-sun)")} />
          <path d="M30 12c-3-2-3-5-3-5s4 0 6 3" stroke={c("var(--subject-sun)")} strokeWidth="3" strokeLinecap="round" />
          <circle cx="33" cy="18" r="1.6" fill={c("#0b1b3a")} />
        </g>
      );
    case "squid":
      return (
        <g>
          <path d="M32 8c8 0 12 6 12 16 0 8-4 12-4 12H24s-4-4-4-12c0-10 4-16 12-16z" fill={c("var(--subject-deep)")} />
          <path d="M24 36c-1 10-4 14-4 20M29 37c0 10-1 14-1 19M35 37c0 10 1 14 1 19M40 36c1 10 4 14 4 20" stroke={c("var(--subject-deep)")} strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="28" cy="22" r="2.4" fill={c("var(--glow)")} />
          <circle cx="36" cy="22" r="2.4" fill={c("var(--glow)")} />
        </g>
      );
    case "angler":
      return (
        <g>
          <path d="M14 34c0-9 9-15 20-15s18 6 18 14-8 14-19 14c-9 0-19-5-19-13z" fill={c("var(--c-deep)")} />
          <path d="M30 19c-2-6-6-9-6-9 6 0 9 3 11 7" stroke={c("var(--glow)")} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <circle cx="24" cy="11" r="3.2" fill={c("var(--glow)")} />
          <circle cx="40" cy="31" r="2.6" fill={c("var(--subject-sun)")} />
          <path d="M16 30l8 3-8 3M22 38l6 1-5 3" stroke={c("var(--glow)")} strokeWidth="1.6" />
        </g>
      );
    case "whale":
      return (
        <g>
          <path d="M8 34c0-8 12-14 26-14s22 5 22 12c0 3-2 5-2 5s4 1 6 5c-4 1-8 0-11-2-4 3-10 5-17 5C18 50 8 43 8 34z" fill={c("var(--subject-mid)")} />
          <path d="M8 34c8 2 14 2 20 0" stroke={c("var(--c-deep)")} strokeWidth="2" opacity="0.4" />
          <circle cx="20" cy="30" r="2.2" fill={c("#0b1b3a")} />
          <path d="M30 18c0-4 2-7 2-7s2 3 2 7" stroke={c("var(--subject-glow)")} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );
    case "lantern":
      return (
        <g>
          <circle cx="32" cy="32" r="13" fill={c("var(--glow)")} opacity="0.85" />
          <circle cx="32" cy="32" r="20" fill="none" stroke={c("var(--glow)")} strokeWidth="1.4" opacity="0.4" />
          <path d="M32 6v6M32 52v6M6 32h6M52 32h6M14 14l4 4M46 46l4 4M50 14l-4 4M18 46l-4 4" stroke={c("var(--glow)")} strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="32" r="5" fill={c("#fff")} />
        </g>
      );
    default:
      return <circle cx="32" cy="32" r="14" fill={solid ?? "var(--subject-shallow)"} />;
  }
}
