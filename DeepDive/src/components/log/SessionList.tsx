"use client";

import { subjectColorVar } from "@/lib/colors";
import { formatDuration, formatRelative } from "@/lib/format";
import { ChartEmpty } from "@/components/charts/ChartCard";
import type { DiveSession, Subject } from "@/lib/types";

/** 최근 잠수 기록 리스트 */
export default function SessionList({
  sessions,
  subjects,
}: {
  sessions: DiveSession[];
  subjects: Subject[];
}) {
  const byId = new Map(subjects.map((s) => [s.id, s]));

  if (sessions.length === 0) {
    return <ChartEmpty message="아직 기록이 없어요. 첫 잠수를 시작해보세요!" />;
  }

  return (
    <ul className="flex flex-col divide-y divide-hair">
      {sessions.map((s) => {
        const subject = byId.get(s.subjectId);
        const color = subject ? subjectColorVar(subject.colorToken) : "var(--text-faint)";
        return (
          <li key={s.id} className="flex items-center gap-3 py-2.5">
            <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: color }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg">
                {subject?.name ?? "삭제된 과목"}
                {s.status === "aborted" && (
                  <span className="label ml-2 rounded-full border border-border px-1.5 py-0.5 text-[9px] text-muted">
                    중단
                  </span>
                )}
              </p>
              <p className="label mt-0.5 text-[9px] text-faint">{formatRelative(s.startedAt)}</p>
            </div>
            <div className="text-right">
              <p className="tnum text-sm font-bold text-fg">{s.depthM}m</p>
              <p className="tnum text-xs text-faint">{formatDuration(s.durationSec)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
