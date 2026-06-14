"use client";

import { useState } from "react";
import { addSubject } from "@/lib/store";
import { subjectColorVar, SUBJECT_TOKEN_CYCLE } from "@/lib/colors";
import type { Subject } from "@/lib/types";
import { IconClose } from "@/components/ui/Icons";

/** 다이브할 과목 1개 선택 + 즉석 추가 (글래스 칩, 선택=액센트 글로우) */
export default function SubjectPicker({
  subjects,
  selectedId,
  onSelect,
}: {
  subjects: Subject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const token = SUBJECT_TOKEN_CYCLE[subjects.length % SUBJECT_TOKEN_CYCLE.length];
    setName("");
    setAdding(false);
    const s = await addSubject(trimmed, token);
    if (s) onSelect(s.id);
  };

  return (
    <div>
      <p className="label mb-3 text-[10px] text-muted">과목 · SUBJECT</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="다이브할 과목">
        {subjects.map((s) => {
          const active = s.id === selectedId;
          return (
            <button
              key={s.id}
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(s.id)}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                active
                  ? "border-[color:var(--accent)]/40 text-fg shadow-[0_0_20px_var(--glow)]"
                  : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-fg"
              }`}
              style={
                active
                  ? { background: "color-mix(in srgb, var(--accent) 14%, transparent)" }
                  : undefined
              }
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: subjectColorVar(s.colorToken), boxShadow: active ? "0 0 8px var(--glow)" : "none" }}
              />
              {s.name}
            </button>
          );
        })}

        {adding ? (
          <span className="flex items-center gap-1 rounded-full border border-[color:var(--accent)]/40 bg-surface px-2 py-1">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") {
                  setAdding(false);
                  setName("");
                }
              }}
              placeholder="과목명"
              maxLength={40}
              aria-label="새 과목명"
              className="w-24 bg-transparent px-1.5 text-sm text-fg placeholder:text-faint"
            />
            <button onClick={submit} className="label rounded-full bg-primary px-2.5 py-1 text-[10px] text-[var(--primary-ink)]">
              추가
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setName("");
              }}
              aria-label="과목 추가 취소"
              className="text-muted transition hover:text-fg"
            >
              <IconClose width={16} height={16} strokeWidth={1.5} />
            </button>
          </span>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="rounded-full border border-dashed border-border-strong px-3.5 py-2 text-sm font-medium text-muted transition-all duration-200 hover:border-[color:var(--accent)]/50 hover:text-fg hover:shadow-[0_0_20px_var(--glow)]"
          >
            + 과목
          </button>
        )}
      </div>
    </div>
  );
}
