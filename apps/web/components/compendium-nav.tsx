const NAV_ITEMS = [
  { href: "/compendium", label: "Hub" },
  { href: "/compendium/monsters", label: "Monsters" },
  { href: "/join", label: "Join Session" },
  { href: "/api/compendium/monsters", label: "Data API" },
];

export function CompendiumNav() {
  return (
    <nav className="space-y-2">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="block rounded-xl border border-transparent px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:border-[var(--stroke-default)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
