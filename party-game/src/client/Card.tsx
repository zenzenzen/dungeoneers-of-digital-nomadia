import type { CardDefinition } from "../shared/types";
export function CardArt({ kind }: { kind: string }) {
  return (
    <div className={`card-art art-${kind}`} aria-hidden="true">
      <span className="orbit orbit-one" />
      <span className="orbit orbit-two" />
      <svg viewBox="0 0 160 120" fill="none">
        <path
          d="M80 95C60 82 28 63 34 40c5-21 31-23 46-4 15-19 41-17 46 4 6 23-26 42-46 55Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="m80 29-9 27 17 7-11 33"
          stroke="var(--art-line)"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path d="m137 13 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill="var(--ink)" />
        <circle cx="20" cy="89" r="5" fill="var(--ink)" />
      </svg>
      <span className="art-stamp">
        {kind === "monster"
          ? "RED FLAG"
          : kind === "finale"
            ? "END GAME"
            : kind === "class"
              ? "MAIN CHARACTER"
              : kind === "trait"
                ? "PERSONALITY PATCH"
                : kind === "equipment"
                  ? "EMOTIONAL BAGGAGE"
                  : "SOCIAL MAGIC"}
      </span>
    </div>
  );
}
export function GameCard({
  card,
  compact = false,
  children,
}: {
  card: CardDefinition;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <article
      className={`game-card kind-${card.kind} ${compact ? "compact" : ""}`}
      data-card-id={card.id}
    >
      <div className="card-top">
        <span>{card.kind}</span>
        <span>
          {card.strength !== undefined
            ? `${card.strength} STR`
            : card.kind === "class"
              ? "01"
              : card.kind === "trait"
                ? "±"
                : "✦"}
        </span>
      </div>
      {!compact && <CardArt kind={card.kind} />}
      <div className="card-copy">
        <h3>{card.name}</h3>
        <p className="card-rule">{card.rules}</p>
        <p className="card-flavor">“{card.flavor}”</p>
        <div className="card-tags">
          {card.tags.slice(0, 3).map((t) => (
            <span key={t}>{t.replaceAll("_", " ")}</span>
          ))}
        </div>
        {children}
      </div>
    </article>
  );
}
