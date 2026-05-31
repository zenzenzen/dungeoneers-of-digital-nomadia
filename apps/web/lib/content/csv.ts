export function parseCsv(text: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  const currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (inQuotes) {
      if (character === '"' && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
        continue;
      }

      if (character === '"') {
        inQuotes = false;
        continue;
      }

      currentCell += character;
      continue;
    }

    if (character === '"') {
      inQuotes = true;
      continue;
    }

    if (character === ",") {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (character === "\n") {
      currentRow.push(currentCell);
      rows.push([...currentRow]);
      currentRow.length = 0;
      currentCell = "";
      continue;
    }

    if (character !== "\r") {
      currentCell += character;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push([...currentRow]);
  }

  const [headers, ...dataRows] = rows.filter((row) => row.some((cell) => cell.trim().length > 0));

  if (!headers) {
    return [];
  }

  return dataRows.map((row) =>
    headers.reduce<Record<string, string>>((record, header, columnIndex) => {
      record[header] = row[columnIndex] ?? "";
      return record;
    }, {}),
  );
}
