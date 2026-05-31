export type ParsedFeatureClause = {
  operator: string;
  name: string;
  fields: Record<string, string>;
};

export function parseFeatureDsl(value: string): ParsedFeatureClause[] {
  return value
    .split(";")
    .map((clause) => clause.trim())
    .filter(Boolean)
    .map((clause) => {
      const segments = clause.split("|").map((segment) => segment.trim()).filter(Boolean);
      const [head, ...rest] = segments;
      const [operator, name] = head.split(":");
      const fields: Record<string, string> = {};

      for (const field of rest) {
        const [key, ...parts] = field.split(":");
        fields[key] = parts.join(":");
      }

      return {
        operator,
        name,
        fields,
      };
    });
}
