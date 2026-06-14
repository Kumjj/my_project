export function ChartCard({
  title,
  hint,
  className = "",
  children,
}: {
  title: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`card flex flex-col p-5 ${className}`}>
      <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-hair pb-3">
        <h3 className="font-display text-base font-semibold text-fg">{title}</h3>
        {hint && <span className="label text-[9px] text-faint">{hint}</span>}
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}

export function ChartEmpty({ message = "표시할 데이터가 없어요" }: { message?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-faint">
        <path
          d="M3 14c2 0 2 1.2 4 1.2s2-1.2 4-1.2 2 1.2 4 1.2 2-1.2 4-1.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M3 18c2 0 2 1.2 4 1.2s2-1.2 4-1.2 2 1.2 4 1.2 2-1.2 4-1.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
      <p className="text-xs text-faint">{message}</p>
    </div>
  );
}
