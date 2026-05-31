type StatBlockItem = {
  label: string;
  value: string;
};

type StatBlockProps = {
  title: string;
  items: StatBlockItem[];
};

export function StatBlock({ title, items }: StatBlockProps) {
  return (
    <article className="stat-block">
      <h2 className="stat-block__title">{title}</h2>
      <div className="stat-block__grid">
        {items.map((item) => (
          <div className="stat-block__row" key={`${item.label}-${item.value}`}>
            <span className="stat-block__label">{item.label}</span>
            <span className="stat-block__value">{item.value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
