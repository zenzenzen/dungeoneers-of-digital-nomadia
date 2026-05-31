import { PixelSprite } from "./pixel-sprite";

type StructuredEntityCardProps = {
  seed: string;
  caption: string;
  title: string;
  subtitle: string;
  meta?: string[];
  badges?: string[];
};

type LinkEntityCardProps = {
  href: string;
  name: string;
  subtitle: string;
  eyebrow: string;
  meta: string;
};

type EntityCardProps = StructuredEntityCardProps | LinkEntityCardProps;

function isStructuredEntityCard(props: EntityCardProps): props is StructuredEntityCardProps {
  return "seed" in props;
}

export function EntityCard(props: EntityCardProps) {
  if (isStructuredEntityCard(props)) {
    const { seed, caption, title, subtitle, meta = [], badges = [] } = props;

    return (
      <article className="entity-card">
        <div className="entity-card__header">
          <PixelSprite label={title} seed={seed} size={64} />
          <div>
            <div className="entity-card__caption">{caption}</div>
            <h2 className="entity-card__title">{title}</h2>
            <p className="entity-card__subtitle">{subtitle}</p>
          </div>
        </div>

        {badges.length ? (
          <div className="entity-card__badges">
            {badges.map((badge) => (
              <span className="pill" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        ) : null}

        {meta.length ? (
          <div className="entity-card__meta">
            {meta.map((entry) => (
              <span key={entry}>{entry}</span>
            ))}
          </div>
        ) : null}
      </article>
    );
  }

  const { href, name, subtitle, eyebrow, meta } = props;

  return (
    <a
      href={href}
      className="group block overflow-hidden rounded-[var(--radius-banner)] border border-[var(--stroke-default)] bg-[var(--card-gradient)] p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-amber)] hover:shadow-[var(--shadow-glow)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-tertiary)]">
            {eyebrow}
          </p>
          <h3 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">{name}</h3>
        </div>
        <div className="rounded-full border border-[var(--stroke-default)] px-3 py-1 text-xs text-[var(--accent-amber)]">
          {meta}
        </div>
      </div>
      <p className="mt-3 max-w-[32ch] text-sm leading-6 text-[var(--text-secondary)]">{subtitle}</p>
    </a>
  );
}
