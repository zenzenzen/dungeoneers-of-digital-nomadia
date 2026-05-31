type RelationshipBannerProps = {
  leftName: string;
  rightName: string;
  label: string;
  before: number;
  after: number;
};

export function RelationshipBanner({
  leftName,
  rightName,
  label,
  before,
  after,
}: RelationshipBannerProps) {
  const delta = after - before;
  const deltaPrefix = delta >= 0 ? "↑" : "↓";

  return (
    <div className="rounded-[var(--radius-banner)] border border-[rgba(244,114,182,0.35)] bg-[rgba(244,114,182,0.08)] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {leftName} ↔ {rightName}
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-[var(--accent-pink)]">
            {before} → {after}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
            {deltaPrefix} {Math.abs(delta)}
          </p>
        </div>
      </div>
    </div>
  );
}
