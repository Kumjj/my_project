"use client";

/** 글로우 다이버 — 인디고/화이트 실루엣 + 기포 */
export default function Diver({ diving }: { diving?: boolean }) {
  return (
    <div
      className="relative"
      style={diving ? { animation: "float 5s ease-in-out infinite" } : undefined}
    >
      {/* 기포 */}
      {diving && (
        <div className="absolute left-12 top-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute block rounded-full bg-white/60"
              style={{
                width: 4 - i,
                height: 4 - i,
                left: i * 4,
                animation: `float ${2.4 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      <svg
        width="116"
        height="116"
        viewBox="0 0 120 120"
        fill="none"
        role="img"
        aria-label="잠수 중인 다이버"
        style={{ filter: "drop-shadow(0 0 16px var(--glow))" }}
      >
        <defs>
          <linearGradient id="diver-suit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#aeb6f5" />
            <stop offset="55%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="#3a44a0" />
          </linearGradient>
        </defs>
        {/* 공기탱크 */}
        <rect x="36" y="30" width="13" height="34" rx="6" fill="#cdd3f7" opacity="0.85" />
        {/* 몸통 */}
        <path
          d="M44 34c14-6 30-2 40 8 6 6 8 14 6 20-2 7-9 11-18 11-12 0-22-5-30-12-6-5-10-12-9-20 1-7 5-13 11-15z"
          fill="url(#diver-suit)"
        />
        {/* 머리 + 마스크 */}
        <circle cx="86" cy="44" r="11" fill="url(#diver-suit)" />
        <rect x="82" y="39" width="12" height="8" rx="3" fill="#dfe4ff" />
        <rect x="82" y="39" width="12" height="8" rx="3" fill="var(--glow)" opacity="0.5" />
        {/* 다리 */}
        <path d="M40 60c-8 6-16 8-24 6 6 4 14 4 22 1z" fill="url(#diver-suit)" />
        <path d="M44 66c-6 8-14 12-22 12 6 3 16 1 24-6z" fill="url(#diver-suit)" />
        {/* 핀 */}
        <path d="M16 64c-6-1-10 2-12 7 5 1 9 0 13-3z" fill="#8e98ee" />
        <path d="M22 78c-6 1-9 5-9 10 5-1 8-4 11-8z" fill="#8e98ee" />
        {/* 팔 */}
        <path d="M70 40c8-4 16-3 22 2-5 2-10 2-15 1z" fill="url(#diver-suit)" opacity="0.92" />
      </svg>
    </div>
  );
}
