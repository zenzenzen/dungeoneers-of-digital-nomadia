# DDN Logo Sizing Standards

Date: 2026-05-31

## Master Asset

- Source mark: `brand/ddn_ai_star_logo.svg`
- Shape: rounded-square app icon with central chrome/rainbow star.
- Use the SVG for interface rendering whenever possible.
- Export PNGs only for favicons, social previews, app icons, or platforms that cannot render SVG reliably.

## Clear Space

Keep at least **25% of the visible logo width** as empty space around the mark.

Examples:

- 32px logo: 8px clear space.
- 48px logo: 12px clear space.
- 96px logo: 24px clear space.
- 160px logo: 40px clear space.

Do not place the logo flush against text, table borders, card edges, or browser chrome.

## Minimum Sizes

- Minimum UI mark: **24px**
- Minimum paired with wordmark: **28px**
- Minimum app/sidebar icon: **32px**
- Minimum favicon: **16px**, using a simplified crop if detail becomes muddy.

At sizes below 32px, hide the satellite sparkles and use only the central star crop if possible.

## Interface Sizes

| View | Logo Size | Container | Notes |
| --- | ---: | ---: | --- |
| Favicon | 16px / 32px | square | Use simplified central star crop. |
| Mobile top nav | 32px | 40px | Pair with short wordmark or `DDN`. |
| Desktop top nav | 40px | 48px | Standard site header size. |
| Compact sidebar | 36px | 44px | Use mark only. |
| Full sidebar brand | 48px | 56px | Pair with full name. |
| Hero lockup | 96px-128px | 112px-148px | Use above brand name or beside launch copy. |
| Campaign card badge | 28px | 36px | Use for entity/source attribution. |
| Compendium entity badge | 24px | 32px | Use sparingly for "AI indexed" jokes. |
| Loading screen | 72px | 96px | Allow pulse/rotate animation. |
| Social avatar | 256px | 256px | Full mark with rounded-square background. |
| Open Graph image | 160px-220px | flexible | Place over calm dark or white area. |

## Logo Lockups

### Primary Horizontal

- Mark: 40px desktop, 32px mobile.
- Wordmark: `Dungeoneers of Digital Nomadia`.
- Gap between mark and wordmark: 12px desktop, 10px mobile.
- Use in the main header and footer.

### Compact Horizontal

- Mark: 32px.
- Wordmark: `DDN`.
- Gap: 8px.
- Use on narrow mobile headers or dense app surfaces.

### Hero Lockup

- Mark: 96px-128px.
- Wordmark should be larger than the logo and remain the primary brand signal.
- The mark can sit above the title for poster-style layouts or to the left for product-demo layouts.

### Mark Only

- Use when the interface already establishes the full name nearby.
- Valid for favicons, loading states, sidebar collapsed mode, social avatars, and badges.

## Background Rules

Preferred:

- Investor Black `#101114`
- Pitch Deck White `#F7F8F3`
- Deep navy-black product surfaces

Avoid:

- Busy photography directly behind the mark.
- Low-contrast gray surfaces that dull the chrome edge.
- Beige/amber fantasy-console backgrounds from the removed direction.

If the logo sits on photography, add either:

- a subtle dark scrim behind the full lockup, or
- a 1px translucent white/black outline around the mark container.

## Motion Rules

Use motion only for premium parody moments:

- Loading state: slow 3-4 second pulse on the rainbow core.
- Hero entrance: mark fades in, points glint, wordmark follows.
- Hover: tiny 2px lift plus a slight chrome glint.

Do not spin the mark continuously in regular navigation.

## Export Checklist

Recommended exports once the site build starts:

- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` at 180x180
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `og-logo.png` at 1200x630 composition size
- `logo-mark.svg`
- `logo-lockup-horizontal.svg`
- `logo-lockup-compact.svg`
