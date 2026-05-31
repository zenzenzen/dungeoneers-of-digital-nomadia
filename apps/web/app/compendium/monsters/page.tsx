import { AppShell, EntityCard, NotificationBanner } from "@ddn/ui";
import Link from "next/link";
import { getMonsters } from "@/lib/compendium";
import { getCompendiumRail, getPrimaryNav } from "@/lib/navigation";

type SearchParams = {
  q?: string;
  type?: string;
};

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function buildHref(type?: string, q?: string) {
  const params = new URLSearchParams();
  if (type) {
    params.set("type", type);
  }
  if (q) {
    params.set("q", q);
  }
  const query = params.toString();
  return query ? `/compendium/monsters?${query}` : "/compendium/monsters";
}

export default async function MonsterIndexPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const monsters = await getMonsters();
  const monsterTypes = [...new Set(monsters.map((monster) => monster.type))].sort((left, right) =>
    left.localeCompare(right),
  );
  const query = normalize(params.q);
  const activeType = params.type?.trim();

  const filtered = monsters.filter((monster) => {
    const matchesType = !activeType || monster.type === activeType;
    const haystack = [monster.name, monster.type, monster.special_traits, monster.attacks, monster.abilities]
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query || haystack.includes(query);

    return matchesType && matchesQuery;
  });

  return (
    <AppShell
      nav={getPrimaryNav("/compendium")}
      rail={getCompendiumRail("/compendium/monsters")}
      aside={
        <div className="notification-stack">
          <NotificationBanner
            avatarSeed="filter-banner"
            eyebrow="Browse Tips"
            title="Filter by type, then skim the trait line first."
            body="The monster cards are tuned so the name sells the joke, the type frames the encounter, and the trait line tells you how annoying this thing is in practice."
            meta={`${filtered.length} matching monsters.`}
            tone="neutral"
          />
          <NotificationBanner
            avatarSeed="data-bridge"
            eyebrow="Data Bridge"
            title="This page prefers generated content and falls back to raw canon."
            body="That keeps the frontend aligned with the future data layer without blocking progress while content build artifacts are still settling."
            meta="Frontend-first bridge, not final architecture."
            tone="magic"
          />
        </div>
      }
    >
      <header className="page-header">
        <span className="eyebrow">Compendium / Monsters</span>
        <h1 className="page-title">The monster roster is a callout post with hit points.</h1>
        <p className="page-lede">
          The first compendium slice favors scanning fast on mobile while still leaving enough structure for later keyboard
          navigation, richer filters, and server-built search indexes.
        </p>
      </header>

      <section className="panel">
        <form action="/compendium/monsters" className="search-form">
          {activeType ? <input type="hidden" name="type" value={activeType} /> : null}
          <label className="visually-hidden" htmlFor="monster-search">
            Search monsters
          </label>
          <input
            className="search-input"
            defaultValue={params.q ?? ""}
            id="monster-search"
            name="q"
            placeholder="Search monsters, attacks, traits, or vibes"
            type="search"
          />
          <button className="button button--primary" type="submit">
            Search
          </button>
        </form>
        <div className="chip-row" aria-label="Monster type filters">
          <Link className="chip" data-active={!activeType} href={buildHref(undefined, params.q)}>
            All Types
          </Link>
          {monsterTypes.map((type) => (
            <Link key={type} className="chip" data-active={activeType === type} href={buildHref(type, params.q)}>
              {type}
            </Link>
          ))}
        </div>
      </section>

      {filtered.length ? (
        <section className="entity-grid">
          {filtered.map((monster) => (
            <Link key={monster.id} href={`/compendium/monsters/${monster.slug}`}>
              <EntityCard
                seed={monster.id}
                caption={monster.type}
                title={monster.name}
                subtitle={monster.special_traits}
                meta={[`CR ${monster.challenge_rating}`, `AC ${monster.armor_class}`, monster.speed]}
                badges={[monster.size, `${monster.attackList.length} attacks`]}
              />
            </Link>
          ))}
        </section>
      ) : (
        <section className="empty-state">
          Nothing matches that search yet. Try a broader type filter or fewer buzzwords.
        </section>
      )}
    </AppShell>
  );
}
