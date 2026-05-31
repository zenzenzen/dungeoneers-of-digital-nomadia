import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, NotificationBanner, PixelSprite, StatBlock } from "@ddn/ui";
import { getMonsterBySlug, getMonsters } from "@/lib/compendium";
import { getCompendiumRail, getPrimaryNav } from "@/lib/navigation";

type MonsterDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const monsters = await getMonsters();
  return monsters.map((monster) => ({
    slug: monster.slug,
  }));
}

export default async function MonsterDetailPage({ params }: MonsterDetailPageProps) {
  const { slug } = await params;
  const monster = await getMonsterBySlug(slug);

  if (!monster) {
    notFound();
  }

  const related = (await getMonsters())
    .filter((entry) => entry.type === monster.type && entry.id !== monster.id)
    .slice(0, 3);

  return (
    <AppShell
      nav={getPrimaryNav("/compendium")}
      rail={getCompendiumRail("/compendium/monsters")}
      aside={
        <div className="notification-stack">
          {monster.attackList.map((attack) => (
            <NotificationBanner
              key={attack}
              avatarSeed={`${monster.id}-${attack}`}
              eyebrow="Attack Pattern"
              title={attack}
              body={`${monster.name} tends to open with this when the table has let the scene get a little too comfortable.`}
              meta={`CR ${monster.challenge_rating} ${monster.type.toLowerCase()} threat`}
              tone="warn"
            />
          ))}
        </div>
      }
    >
      <header className="page-header">
        <Link className="kicker" href="/compendium/monsters">
          Back to monster index
        </Link>
      </header>

      <section className="detail-grid">
        <div className="shell__main">
          <article className="panel">
            <div className="detail-hero">
              <PixelSprite label={monster.name} seed={monster.id} size={96} />
              <div className="detail-hero__body">
                <div className="detail-hero__title-row">
                  <h1 className="detail-hero__title">{monster.name}</h1>
                  <span className="pill pill--accent">CR {monster.challenge_rating}</span>
                </div>
                <p className="detail-hero__subtitle">
                  {monster.size} {monster.type} with {monster.speed.toLowerCase()} and an unfortunate amount of confidence.
                </p>
                <ul className="inline-list">
                  <li className="pill">AC {monster.armor_class}</li>
                  <li className="pill">{monster.hit_points}</li>
                  <li className="pill">{monster.speed}</li>
                </ul>
              </div>
            </div>
          </article>

          <div className="summary-grid">
            <StatBlock
              items={[
                { label: "Armor Class", value: String(monster.armor_class) },
                { label: "Hit Points", value: monster.hit_points },
                { label: "Speed", value: monster.speed },
                { label: "Challenge Rating", value: String(monster.challenge_rating) },
              ]}
              title="Combat Snapshot"
            />
            <StatBlock
              items={[
                { label: "Type", value: monster.type },
                { label: "Size", value: monster.size },
                { label: "Version", value: monster.version },
                { label: "Status", value: monster.is_active ? "Active" : "Inactive" },
              ]}
              title="Catalog Metadata"
            />
          </div>

          <article className="panel">
            <span className="panel__eyebrow">Ability Line</span>
            <h2 className="panel__title">Stats, condensed the old-fashioned way.</h2>
            <p className="monster-copy">{monster.abilities}</p>
          </article>

          <section>
            <h2 className="section-title">Special Traits</h2>
            <div className="feature-list">
              {monster.traitList.map((trait) => (
                <NotificationBanner
                  key={trait}
                  avatarSeed={`${monster.id}-${trait}`}
                  eyebrow="Trait"
                  title={trait}
                  body="This is the part the GM reads aloud right before everyone at the table goes, 'oh no, I know exactly this person.'"
                  tone="magic"
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="notification-stack">
          <article className="panel">
            <span className="panel__eyebrow">Encounter Framing</span>
            <h2 className="panel__title">Quick GM shorthand</h2>
            <ul className="meta-list">
              <li>
                <strong>Opener:</strong> Lead with{" "}
                <span className="quiet">{monster.attackList[0] ?? "a passive-aggressive entrance"}</span>.
              </li>
              <li>
                <strong>Escalation:</strong> Bring the trait line online once the party thinks this is a simple social nuisance.
              </li>
              <li>
                <strong>Comedy note:</strong> Play the certainty, not the cruelty. The joke lands harder when the monster fully believes the nonsense.
              </li>
            </ul>
          </article>

          {related.length ? (
            <article className="panel">
              <span className="panel__eyebrow">Related Threats</span>
              <h2 className="panel__title">Same ecosystem, different flavor of damage.</h2>
              <ul className="meta-list">
                {related.map((entry) => (
                  <li key={entry.id}>
                    <Link href={`/compendium/monsters/${entry.slug}`}>
                      <strong>{entry.name}</strong>
                    </Link>{" "}
                    <span className="quiet">CR {entry.challenge_rating}</span>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </aside>
      </section>
    </AppShell>
  );
}
