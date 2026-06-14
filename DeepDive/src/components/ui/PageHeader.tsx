export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && <p className="label mb-2 text-[10px] text-accent">{eyebrow}</p>}
          <h1 className="gradient-text font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {description && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{description}</p>
      )}
      <div
        className="mt-6 h-px w-full"
        style={{ background: "linear-gradient(to right, transparent, var(--border-strong), transparent)" }}
        aria-hidden
      />
    </header>
  );
}
