import Link from "next/link";

import { AppShell, NotificationBanner } from "@ddn/ui";
import { getContentIndex, getMonsters } from "@/lib/compendium";
import { getCompendiumRail, getPrimaryNav } from "@/lib/navigation";

export default async function CompendiumPage() {
  const [index, monsters] = await Promise.all([getContentIndex(), getMonsters()]);

  return (
    <AppShell
      nav={getPrimaryNav("/compendium")}
      rail={getCompendiumRail("/compendium")}
      aside={
        <div className="notification-stack">
          <NotificationBanner
            avatarSeed="compendium-ready"
            eyebrow="Now Live"
            title="Monster browse is production-shaped."
            body="The compendium route now has enough shell and design language to serve as the pattern for classes, spells, items, and NPCs."
            meta={`${monsters.length} monsters currently available.`}
            tone="positive"
            glow
          />
        </div>
      }
    >
      <header className="page-header">
        <span className="eyebrow">Compendium Hub</span>
        <h1 className="page-title">Browse the canon before somebody tries to monetize it.</h1>
        <p className="page-lede">
          Phase 1 starts with the monster roster and a reusable shell. The rest of the catalog families can slot into
          this same information architecture once their content loaders come online.
        </p>
      </header>

      <section className="panel-grid">
        <article className="panel">
          <span className="panel__eyebrow">Live Vertical Slice</span>
          <h2 className="panel__title">Monsters</h2>
          <p className="panel__copy">
            Searchable, filterable, and cross-link ready with card views plus a detail scaffold.
          </p>
          <Link className="button button--primary" href="/compendium/monsters">
            Open Monster Index
          </Link>
        </article>
        <article className="panel">
          <span className="panel__eyebrow">Queued Next</span>
          <h2 className="panel__title">Classes, spells, items</h2>
          <p className="panel__copy">
            The app shell, token system, and shared cards are ready for the next content families without a visual reset.
          </p>
        </article>
        <article className="panel">
          <span className="panel__eyebrow">Content Shape</span>
          <h2 className="panel__title">Browser now, runtime later</h2>
          <p className="panel__copy">
            Notification banners, pixel placeholders, and quiet chrome already line up with the future multiplayer event
            feed.
          </p>
        </article>
      </section>

      <section className="panel">
        <span className="panel__eyebrow">Current Feed</span>
        <h2 className="panel__title">Loaded entity families</h2>
        <p className="panel__copy">
          The home shell already reflects the generated content index when it exists, but it also degrades safely during
          early integration while content build output is still coming online.
        </p>
        <ul className="inline-list">
          {index.entities.map((entry) => (
            <li className="pill" key={entry.type}>
              {entry.type}: {entry.count}
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
