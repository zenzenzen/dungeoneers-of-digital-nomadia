type NavItem = {
  label: string;
  href?: string;
  active?: boolean;
  muted?: boolean;
};

function makeItem(currentPath: string, label: string, href?: string, exact = false): NavItem {
  const active = href
    ? exact
      ? currentPath === href
      : currentPath === href || currentPath.startsWith(`${href}/`)
    : false;

  return {
    label,
    href,
    active,
    muted: !href,
  };
}

export function getPrimaryNav(currentPath: string) {
  return [
    makeItem(currentPath, "Home", "/", true),
    makeItem(currentPath, "Compendium", "/compendium"),
    makeItem(currentPath, "Characters"),
    makeItem(currentPath, "Sessions"),
  ];
}

export function getCompendiumRail(currentPath: string) {
  return [
    makeItem(currentPath, "Browse Hub", "/compendium", true),
    makeItem(currentPath, "Monsters", "/compendium/monsters"),
    makeItem(currentPath, "Classes"),
    makeItem(currentPath, "Spells"),
    makeItem(currentPath, "Items"),
  ];
}
