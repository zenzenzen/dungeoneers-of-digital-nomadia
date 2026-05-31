import type { ReactNode } from "react";

type NavItem = {
  label: string;
  href?: string;
  active?: boolean;
  muted?: boolean;
};

type StructuredShellProps = {
  nav: NavItem[];
  rail: NavItem[];
  children: ReactNode;
  aside?: ReactNode;
};

type EditorialShellProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  navigation: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
};

type AppShellProps = StructuredShellProps | EditorialShellProps;

function isStructuredShell(props: AppShellProps): props is StructuredShellProps {
  return "nav" in props;
}

function NavLink({ item, rail = false }: { item: NavItem; rail?: boolean }) {
  const className = rail ? "shell__rail-link" : "shell__nav-link";

  if (!item.href) {
    return (
      <span className={className} data-active={false} data-muted={item.muted}>
        {item.label}
      </span>
    );
  }

  return (
    <a className={className} data-active={item.active} data-muted={item.muted} href={item.href}>
      {item.label}
    </a>
  );
}

export function AppShell(props: AppShellProps) {
  if (isStructuredShell(props)) {
    const { nav, rail, aside, children } = props;

    return (
      <div className="shell">
        <header className="shell__topbar">
          <a className="shell__brand" href="/">
            <span className="shell__brand-mark">DDN</span>
            <span className="shell__brand-copy">
              <span className="shell__brand-title">Dungeoneers of Digital Nomadia</span>
              <span className="shell__brand-subtitle">
                Airport lounge shell, cursed social combat payload.
              </span>
            </span>
          </a>
          <nav aria-label="Primary" className="shell__nav">
            {nav.map((item) => (
              <NavLink item={item} key={`${item.label}-${item.href ?? "muted"}`} />
            ))}
          </nav>
        </header>

        <div className="shell__content">
          <aside className="shell__rail">
            <div className="shell__rail-group">
              <div className="shell__rail-title">Compendium</div>
              {rail.map((item) => (
                <NavLink item={item} key={`${item.label}-${item.href ?? "muted"}`} rail />
              ))}
              <p className="shell__rail-note">
                The monster route is live first so the rest of the catalog can inherit a stable shell
                instead of growing in twelve different directions.
              </p>
            </div>
          </aside>

          <main className="shell__main">{children}</main>

          <aside className="shell__aside">{aside}</aside>
        </div>
      </div>
    );
  }

  const { eyebrow, title, subtitle, navigation, aside, children } = props;

  return (
    <div className="min-h-screen bg-[var(--surface-void)] text-[var(--text-primary)]">
      <div className="mx-auto grid max-w-[1480px] gap-6 px-4 py-4 md:grid-cols-[220px_minmax(0,1fr)] md:px-6 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
        <aside className="rounded-[var(--radius-card)] border border-[var(--stroke-default)] bg-[var(--surface-raised)]/85 p-4 backdrop-blur">
          <div className="mb-6 border-b border-[var(--stroke-hairline)] pb-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--accent-amber)]">
              Dungeoneers
            </p>
            <h1 className="mt-3 text-xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{subtitle}</p>
          </div>
          {navigation}
        </aside>
        <main className="min-w-0">
          {eyebrow ? (
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
              {eyebrow}
            </p>
          ) : null}
          {children}
        </main>
        {aside ? (
          <aside className="rounded-[var(--radius-card)] border border-[var(--stroke-default)] bg-[var(--surface-glass)] p-4 backdrop-blur">
            {aside}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
