"use client";

import { CreatureGlyph } from "./CreatureGlyph";
import { IconLock } from "@/components/ui/Icons";
import { formatDateDot } from "@/lib/format";
import type { Creature } from "@/lib/types";

/** 도감 카드 — 해금=글로우, 미해금=실루엣 (Linear 글래스) */
export default function CreatureCard({
  creature,
  unlockedAt,
}: {
  creature: Creature;
  unlockedAt: number | null;
}) {
  const unlocked = unlockedAt != null;
  const requiredDepth = Math.abs(creature.zone);

  return (
    <div
      className={`card relative flex flex-col items-center gap-2 overflow-hidden p-4 text-center ${
        unlocked ? "card-interactive" : ""
      }`}
      role="article"
      aria-label={
        unlocked
          ? `발견한 생물: ${creature.name}`
          : `미해금 생물: ${requiredDepth}미터 수심에 도달하면 발견`
      }
    >
      {unlocked && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-16"
          style={{ background: "radial-gradient(70% 100% at 50% 0%, var(--glow), transparent 70%)" }}
          aria-hidden
        />
      )}
      <div
        className="grid h-20 w-20 place-items-center rounded-2xl border border-border"
        style={unlocked ? { background: "color-mix(in srgb, var(--accent) 8%, transparent)" } : undefined}
      >
        <CreatureGlyph svgKey={creature.svgKey} size={56} locked={!unlocked} />
      </div>

      {unlocked ? (
        <>
          <p className="font-display text-base font-semibold text-fg">{creature.name}</p>
          <p className="-mt-1 text-[11px] italic text-faint">{creature.sub}</p>
          <p className="text-[11px] leading-relaxed text-muted">{creature.blurb}</p>
          <p className="label mt-1 text-[8px] text-faint">{formatDateDot(unlockedAt!)} 발견</p>
        </>
      ) : (
        <>
          <p className="flex items-center gap-1 font-display text-base font-semibold text-muted">
            <span role="img" aria-label="잠금됨">
              <IconLock width={13} height={13} strokeWidth={1.5} />
            </span>
            ???
          </p>
          <p className="text-[11px] leading-relaxed text-faint">
            <span className="tnum font-semibold text-muted">{requiredDepth}m</span> 수심에 도달하면
            만날 수 있어요
          </p>
        </>
      )}
    </div>
  );
}
