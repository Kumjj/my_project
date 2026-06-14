"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/store";
import { CREATURES } from "@/lib/creatures";
import { DEPTH_ZONES } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import CreatureCard from "@/components/collection/CreatureCard";
import { IconWaves } from "@/components/ui/Icons";

export default function CollectionPage() {
  const { unlocks, meta } = useAppData();

  const totalUnlocked = useMemo(
    () => CREATURES.filter((c) => unlocks[c.id] != null).length,
    [unlocks],
  );
  const pct = Math.round((totalUnlocked / CREATURES.length) * 100);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="컬렉션"
        title="심해 도감"
        description="더 깊이 잠수할수록 새로운 심해 생물을 만납니다. 한 번의 잠수에서 도달한 최고 수심이 그 수심대의 생물을 해금해요."
        actions={
          <Link href="/" className="btn btn-primary px-5 py-3 text-sm font-semibold">
            <IconWaves width={17} height={17} strokeWidth={1.5} />
            잠수하러 가기
          </Link>
        }
      />

      {/* 진행도 */}
      <div className="card mb-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-7">
        <div className="flex items-baseline gap-2">
          <span className="gradient-text font-display text-5xl font-semibold tabular-nums">
            {totalUnlocked}
          </span>
          <span className="label text-[10px] text-muted">/ {CREATURES.length} 발견</span>
        </div>
        <div className="flex-1">
          <div className="label mb-1.5 flex justify-between text-[9px] text-faint">
            <span>도감 완성도</span>
            <span className="tnum font-bold text-fg">{pct}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(to right, var(--c-surface), var(--accent))",
                boxShadow: "0 0 16px var(--glow)",
              }}
            />
          </div>
          <p className="label mt-2 text-[9px] text-faint">
            현재 최고 수심 <span className="tnum font-bold text-fg">{meta.bestDepthM}m</span>
          </p>
        </div>
      </div>

      {/* 수심대별 그룹 */}
      <div className="flex flex-col gap-8">
        {DEPTH_ZONES.map((zone) => {
          const creatures = CREATURES.filter((c) => c.zone === zone.id);
          const unlockedInZone = creatures.filter((c) => unlocks[c.id] != null).length;
          return (
            <section key={zone.id}>
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="h-7 w-1.5 rounded-full"
                  style={{
                    background:
                      zone.id === -5
                        ? "var(--c-surface)"
                        : zone.id === -25
                          ? "var(--c-shallow)"
                          : zone.id === -60
                            ? "var(--c-mid)"
                            : "var(--c-deep)",
                  }}
                />
                <div>
                  <h2 className="font-display text-xl font-semibold text-fg">
                    {zone.label}{" "}
                    <span className="tnum text-sm font-medium text-faint">
                      {Math.abs(zone.id)}m+
                    </span>
                  </h2>
                  <p className="label mt-0.5 text-[9px] text-faint">
                    {zone.sub} · {unlockedInZone}/{creatures.length} 발견
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {creatures.map((c) => (
                  <CreatureCard key={c.id} creature={c} unlockedAt={unlocks[c.id] ?? null} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
