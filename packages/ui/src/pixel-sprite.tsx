const palette = ["#14171c", "#5ec8f2", "#e8a33d", "#f472b6", "#4ade80", "#f5f7fa"];

function hashSeed(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function buildCells(seed: string) {
  const hashed = hashSeed(seed);
  const cells: Array<string | null> = [];

  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      const index = row * 4 + column;
      const value = (hashed + row * 17 + column * 31 + index * 13) % 11;
      const color = value < 3 ? null : palette[value % palette.length];
      cells.push(color);
    }
  }

  const mirrored: Array<string | null> = [];

  for (let row = 0; row < 8; row += 1) {
    const rowCells = cells.slice(row * 4, row * 4 + 4);
    mirrored.push(...rowCells, ...[...rowCells].reverse());
  }

  return mirrored;
}

type PixelSpriteProps = {
  seed: string;
  label: string;
  size?: number;
  decorative?: boolean;
};

export function PixelSprite({ seed, label, size = 48, decorative = false }: PixelSpriteProps) {
  const cells = buildCells(seed);

  return (
    <div
      aria-hidden={decorative}
      aria-label={decorative ? undefined : label}
      className="pixel-sprite"
      role={decorative ? undefined : "img"}
      style={{
        width: size,
        height: size,
        gridTemplateColumns: "repeat(8, 1fr)",
        gridTemplateRows: "repeat(8, 1fr)",
      }}
    >
      {cells.map((color, index) => (
        <span
          className="pixel-sprite__cell"
          key={`${seed}-${index}`}
          style={{
            backgroundColor: color ?? "transparent",
          }}
        />
      ))}
    </div>
  );
}
