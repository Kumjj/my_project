"use client";

import { IconPause, IconPlay, IconAscend } from "@/components/ui/Icons";
import type { DiveStatus } from "@/hooks/useDive";

/** 다이브 컨트롤 — 글래스 보조 + 액센트 글로우 주버튼 (Linear) */
export default function DiveControls({
  status,
  onPause,
  onResume,
  onEnd,
}: {
  status: DiveStatus;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {status === "diving" ? (
        <button
          onClick={onPause}
          aria-label="잠수 일시정지"
          className="btn btn-secondary px-5 py-3 text-sm"
        >
          <IconPause width={17} height={17} strokeWidth={1.5} />
          일시정지
        </button>
      ) : (
        <button
          onClick={onResume}
          aria-label="잠수 이어가기"
          className="btn btn-secondary px-5 py-3 text-sm"
        >
          <IconPlay width={17} height={17} strokeWidth={1.5} />
          이어가기
        </button>
      )}

      <button
        onClick={onEnd}
        aria-label="잠수 상승하여 종료"
        className="btn btn-primary px-6 py-3 text-sm font-semibold"
      >
        <IconAscend width={17} height={17} strokeWidth={1.5} />
        상승 · 종료
      </button>
    </div>
  );
}
