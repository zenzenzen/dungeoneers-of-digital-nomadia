import Link from "next/link";

import { AppShell, EntityCard, NotificationBanner } from "@ddn/ui";
import { getMonsters } from "@/lib/compendium";
import { getCompendiumRail, getPrimaryNav } from "@/lib/navigation";

export default async function HomePage() {
  const monsters = await getMonsters();
  const featured = monsters.slice(0, 3);

  return (
    <AppShell
      nav={getPrimaryNav("/")}
      rail={getCompendiumRail("/")}
      aside={
        <div className="notification-stack">
          <NotificationBanner
            avatarSeed="party-feed-karen"
            eyebrow="Live Feed"
            title="The Karen has entered the terminal lounge."
            body="Featured encounters resolve as notification-style banners so the game log feels like your phone blowing up during a badly managed layover."
            meta="Phase 1 uses this card language now so sessions can inherit it later."
            tone="warn"
            glow
          />
          <NotificationBanner
            avatarSeed="party-feed-buff"
            eyebrow="Design Goal"
            title="Chrome stays premium. Chaos stays funny."
            body="The shell is quiet, roomy, and almost suspiciously tasteful until a monster, status effect, or loot drop barges in."
            meta="Airport lounge shell + RPG banner feed."
            tone="magic"
          />
        </div>
      }
    >
      <header className="page-header">
        <span className="eyebrow">Phase 1 Foundation</span>
        <h1 className="page-title">A compendium that feels like a premium travel app until the monsters start posting.</h1>
        <p className="page-lede">
          This first frontend slice establishes the canonical shell, the banner-driven play language, and a real monster
          compendium path backed by the current content seam.
        </p>
      </header>

      <section className="hero-grid">
        <article className="hero-card">
          <div className="hero-card__board">
            <span className="pill pill--accent">Read-only Phase</span>
            <span className="pill">Mobile-ready shell</span>
            <span className="pill">Monster compendium live</span>
          </div>
          <h2 className="hero-card__headline">Browse tonight. Build systems behind it tomorrow.</h2>
          <p className="hero-card__copy">
            The current implementation keeps the promise small and sharp: landing page, compendium shell, monster index,
            and monster detail pages. It leaves room for the dedicated content-build pipeline without blocking visual
            progress now.
          </p>
          <div className="hero-card__actions">
            <Link className="button button--primary" href="/compendium/monsters">
              Browse Monsters
            </Link>
            <Link className="button button--ghost" href="/compendium">
              Open Compendium Hub
            </Link>
          </div>
        </article>

        <aside className="hero-card hero-card__stats">
          <span className="kicker">Current Snapshot</span>
          <div className="stat-pair">
            <span className="stat-pair__value">{monsters.length}</span>
            <span className="stat-pair__label">monsters wired into the UI</span>
          </div>
          <div className="stat-pair">
            <span className="stat-pair__value">3</span>
            <span className="stat-pair__label">Phase 1 routes with real data</span>
          </div>
          <div className="stat-pair">
            <span className="stat-pair__value">1</span>
            <span className="stat-pair__label">visual language for future session banners</span>
          </div>
        </aside>
      </section>

      <section className="landing-grid">
        <article className="panel">
          <span className="panel__eyebrow">Shell</span>
          <h2 className="panel__title">App chrome is calm on purpose.</h2>
          <p className="panel__copy">
            Dark, spacious navigation with thin dividers keeps the browsing layer feeling premium instead of noisy. That
            contrast matters once the sillier game content starts firing.
          </p>
        </article>
        <article className="panel">
          <span className="panel__eyebrow">Compendium</span>
          <h2 className="panel__title">Monsters are the first vertical slice.</h2>
          <p className="panel__copy">
            Cards, filters, search, and detail scaffolding are all live against the current content contract so the UI
            can evolve in parallel with the broader data work.
          </p>
        </article>
        <article className="panel">
          <span className="panel__eyebrow">Later</span>
          <h2 className="panel__title">Banners become the game log.</h2>
          <p className="panel__copy">
            Notification-style cards already match the multiplayer event model from the design doc, which keeps future
            async sessions on the same aesthetic spine.
          </p>
        </article>
      </section>

      <section>
        <div className="page-header">
          <span className="eyebrow">Featured Monsters</span>
          <h2 className="section-title">A small sample of the apocalypse roster.</h2>
        </div>
        <div className="entity-grid">
          {featured.map((monster) => (
            <Link key={monster.id} href={`/compendium/monsters/${monster.slug}`}>
              <EntityCard
                seed={monster.id}
                caption={monster.type}
                title={monster.name}
                subtitle={monster.special_traits}
                meta={[
                  `CR ${monster.challenge_rating}`,
                  `${monster.size} ${monster.type}`,
                  `${monster.hit_points} Chill-equivalent`,
                ]}
                badges={[monster.speed, `AC ${monster.armor_class}`]}
              />
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
