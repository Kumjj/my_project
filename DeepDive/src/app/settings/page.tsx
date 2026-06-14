"use client";

import { useRef, useState } from "react";
import {
  useAppData,
  seedData,
  resetData,
  replaceAllData,
  getStateSnapshot,
  removeSubject,
} from "@/lib/store";
import { exportFileSchema } from "@/lib/schema";
import { SCHEMA_VERSION } from "@/lib/types";
import { subjectColorVar } from "@/lib/colors";
import PageHeader from "@/components/ui/PageHeader";
import {
  IconSeed,
  IconRefresh,
  IconDownload,
  IconUpload,
  IconClose,
} from "@/components/ui/Icons";

type Toast = { kind: "ok" | "err"; msg: string };

const btnSolid = "btn btn-primary px-4 py-3 text-sm font-medium";
const btnGhost = "btn btn-secondary px-4 py-3 text-sm font-medium";

export default function SettingsPage() {
  const data = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const flash = (t: Toast) => {
    setToast(t);
    window.setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    const payload = {
      app: "deepdive" as const,
      schemaVersion: SCHEMA_VERSION,
      exportedAt: Date.now(),
      data: getStateSnapshot(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deepdive-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash({ kind: "ok", msg: "백업 파일을 내려받았어요" });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = exportFileSchema.safeParse(JSON.parse(String(reader.result)));
        if (!parsed.success) {
          flash({ kind: "err", msg: "올바른 DeepDive 백업 파일이 아니에요" });
          return;
        }
        await replaceAllData(parsed.data.data);
        flash({ kind: "ok", msg: "데이터를 가져왔어요" });
      } catch {
        flash({ kind: "err", msg: "파일을 읽을 수 없어요" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="설정 · SETTINGS"
        title="설정 & 데이터"
        description="데모용 더미 데이터를 넣거나 비우고, JSON으로 백업·복원할 수 있어요. 데이터는 서버 SQLite에 저장됩니다."
      />

      <Section title="데모 데이터" desc="심사·발표 전에 화면을 채우거나 깨끗이 비울 수 있어요.">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              await seedData();
              flash({ kind: "ok", msg: "더미 잠수 기록을 채웠어요" });
            }}
            className={btnSolid}
          >
            <IconSeed width={16} height={16} strokeWidth={1.5} />
            더미 데이터 채우기
          </button>
          <button
            onClick={async () => {
              if (confirm("모든 잠수 기록을 삭제하고 빈 상태로 되돌릴까요?")) {
                await resetData();
                flash({ kind: "ok", msg: "데이터를 초기화했어요" });
              }
            }}
            className={btnGhost}
          >
            <IconRefresh width={16} height={16} strokeWidth={1.5} />
            전체 초기화
          </button>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <Stat label="잠수 기록" value={data.sessions.length} />
          <Stat label="과목" value={data.subjects.length} />
          <Stat label="발견 생물" value={Object.keys(data.unlocks).length} />
        </div>
      </Section>

      <Section title="백업 / 복원" desc="JSON 파일로 내보내고, 다른 기기에서 가져올 수 있어요 (zod로 검증).">
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport} className={btnGhost}>
            <IconDownload width={16} height={16} strokeWidth={1.5} />
            JSON 내보내기
          </button>
          <button onClick={() => fileRef.current?.click()} className={btnGhost}>
            <IconUpload width={16} height={16} strokeWidth={1.5} />
            JSON 가져오기
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </Section>

      {data.subjects.length > 0 && (
        <Section title="과목" desc="다이브 화면에서 과목을 추가할 수 있어요.">
          <ul className="flex flex-wrap gap-2">
            {data.subjects.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: subjectColorVar(s.colorToken) }} />
                <span className="font-medium text-fg">{s.name}</span>
                <button
                  onClick={async () => {
                    if (confirm(`'${s.name}' 과목을 삭제할까요? 기록은 유지됩니다.`)) {
                      await removeSubject(s.id);
                    }
                  }}
                  aria-label={`${s.name} 삭제`}
                  className="text-muted transition hover:text-fg"
                >
                  <IconClose width={15} height={15} strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <p className="label mt-10 text-center text-[9px] text-faint">
        딥다이브 · 스키마 v{SCHEMA_VERSION}
      </p>

      {toast && (
        <div
          role="status"
          className="animate-rise fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-[var(--surface-glass)] px-5 py-3 text-sm font-medium text-fg shadow-[var(--shadow-md)] backdrop-blur-xl lg:bottom-8"
        >
          <span style={{ color: toast.kind === "ok" ? "var(--success)" : "var(--danger)" }}>
            {toast.kind === "ok" ? "✓" : "✕"}
          </span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card mb-4 p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold text-fg">{title}</h2>
      {desc && <p className="mb-5 mt-1 text-sm text-muted">{desc}</p>}
      {!desc && <div className="mb-5" />}
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface py-3">
      <p className="gradient-text font-display text-3xl font-semibold tabular-nums">{value}</p>
      <p className="label mt-1 text-[8px] text-faint">{label}</p>
    </div>
  );
}
