"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { creatureById } from "@/lib/creatures";
import { formatDuration } from "@/lib/format";
import { CreatureGlyph } from "@/components/collection/CreatureGlyph";
import { IconTrophy, IconClose } from "@/components/ui/Icons";

export interface DiveResult {
  depthM: number;
  durationSec: number;
  isRecord: boolean;
  prevBest: number;
  newlyUnlocked: string[];
}

/** 잠수 완료 오버레이 — 글래스 + 액센트 글로우 (포커스 트랩) */
export default function MilestoneToast({
  result,
  onClose,
}: {
  result: DiveResult;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    prevFocus.current = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    const focusables = node?.querySelectorAll<HTMLElement>(
      'button, [href], input, [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "Tab" && focusables && focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prevFocus.current?.focus?.();
    };
  }, [onClose]);

  const creatures = result.newlyUnlocked
    .map((id) => creatureById(id))
    .filter((c): c is NonNullable<typeof c> => c != null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-[var(--bg-deep)]/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="잠수 완료"
        className="card animate-pop relative w-full max-w-sm overflow-hidden p-7 text-center shadow-[var(--shadow-md)]"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32"
          style={{ background: "radial-gradient(80% 100% at 50% 0%, var(--glow), transparent 70%)" }}
          aria-hidden
        />
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 text-muted transition hover:text-fg"
        >
          <IconClose width={18} height={18} strokeWidth={1.5} />
        </button>

        <p className="label relative text-[10px] text-accent">SURFACED · 잠수 완료</p>
        <div className="relative mt-4 flex items-baseline justify-center gap-1">
          <span
            className="font-display text-7xl font-semibold tabular-nums text-fg"
            style={{ textShadow: "0 0 40px var(--glow)" }}
          >
            {result.depthM}
          </span>
          <span className="font-display text-2xl font-medium text-muted">m</span>
        </div>
        <p className="label mt-2 text-[10px] text-faint">{formatDuration(result.durationSec)} 집중</p>

        {result.isRecord && (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[color:var(--accent)]/30 bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-3 py-2.5 text-accent">
            <IconTrophy width={16} height={16} strokeWidth={1.5} />
            <span className="label text-[10px]">신기록 · 이전 {result.prevBest}m</span>
          </div>
        )}

        {creatures.length > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="label mb-3 text-[10px] text-muted">새로운 발견 · {creatures.length}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {creatures.map((c) => (
                <div key={c.id} className="flex w-20 flex-col items-center gap-1.5">
                  <div className="grid h-16 w-16 place-items-center rounded-xl border border-border bg-surface">
                    <CreatureGlyph svgKey={c.svgKey} size={44} />
                  </div>
                  <span className="text-[11px] font-medium text-fg">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-7 flex gap-2">
          <button onClick={onClose} className="btn btn-secondary flex-1 py-2.5 text-sm">
            한 번 더
          </button>
          <Link href="/log" className="btn btn-primary flex-1 py-2.5 text-sm font-semibold">
            기록 보기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
