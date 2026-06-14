"use client";

import { useState } from "react";
import { useAppData } from "@/lib/store";
import { useDive } from "@/hooks/useDive";
import DiveStage from "@/components/dive/DiveStage";
import DepthCounter from "@/components/dive/DepthCounter";
import DiveControls from "@/components/dive/DiveControls";
import SubjectPicker from "@/components/dive/SubjectPicker";
import GoalDepthSlider from "@/components/dive/GoalDepthSlider";
import MilestoneToast, { type DiveResult } from "@/components/dive/MilestoneToast";

export default function DivePage() {
  const dive = useDive();
  const { subjects, meta } = useAppData();
  const [goal, setGoal] = useState(30);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [result, setResult] = useState<DiveResult | null>(null);

  const idle = dive.status === "idle";

  // 기본 선택 = 명시 선택 없으면 첫 과목 (effect 없이 렌더 중 파생)
  const effectiveId = selectedId ?? subjects[0]?.id ?? null;
  const activeSubjectId = idle ? effectiveId : dive.subjectId;
  const activeSubject = subjects.find((s) => s.id === activeSubjectId);

  const handleStart = () => {
    if (effectiveId) dive.start(effectiveId, goal);
  };

  const handleEnd = async () => {
    const r = await dive.end();
    if (r) {
      setResult({
        depthM: r.session.depthM,
        durationSec: r.session.durationSec,
        isRecord: r.isRecord,
        prevBest: r.prevBest,
        newlyUnlocked: r.newlyUnlocked,
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="label mb-2 text-[10px] text-accent">집중 세션 · FOCUS SESSION</p>
          <h1 className="gradient-text font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            오늘의 잠수
          </h1>
        </div>
        <div className="hidden text-right sm:block">
          <p className="tnum text-2xl font-semibold text-fg">{meta.bestDepthM}m</p>
          <p className="label mt-1 text-[9px] text-faint">최고 수심 · RECORD</p>
        </div>
      </header>

      <DiveStage progress={dive.progress} liveDepthM={dive.liveDepthM} status={dive.status}>
        <DepthCounter
          liveDepthM={dive.liveDepthM}
          elapsedSec={dive.elapsedSec}
          goalDepthM={idle ? goal : dive.goalDepthM}
          status={dive.status}
          subjectName={!idle ? activeSubject?.name : undefined}
        />
      </DiveStage>

      {idle ? (
        <div className="card mt-6 flex flex-col gap-7 p-6 sm:p-7">
          <SubjectPicker subjects={subjects} selectedId={effectiveId} onSelect={setSelectedId} />
          <GoalDepthSlider value={goal} onChange={setGoal} />

          <button
            onClick={handleStart}
            disabled={!effectiveId}
            className="btn btn-primary group w-full py-4 text-base font-semibold"
          >
            잠수 시작 · Begin Dive
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>

          <p className="border-t border-hair pt-4 text-sm leading-relaxed text-muted">
            <span className="font-medium text-fg">집중 1분 = 수심 1m.</span> 타이머는 탭을
            바꾸거나 새로고침해도 시작 시각 기준으로 정확히 이어집니다. 도달한 수심대에서
            심해 생물이 해금돼요.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex justify-center">
          <DiveControls
            status={dive.status}
            onPause={dive.pause}
            onResume={dive.resume}
            onEnd={handleEnd}
          />
        </div>
      )}

      {result && <MilestoneToast result={result} onClose={() => setResult(null)} />}
    </div>
  );
}
