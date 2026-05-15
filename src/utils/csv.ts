export function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "\n" && !inQuotes) {
      if (current.trim()) lines.push(current);
      current = "";
    } else if (ch === "\r" && !inQuotes) {
      // skip
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);

  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const cols: string[] = [];
    let col = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        q = !q;
      } else if (c === "," && !q) {
        cols.push(col.trim());
        col = "";
      } else {
        col += c;
      }
    }
    cols.push(col.trim());
    return cols;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

export interface ImportFieldMapping {
  csvColumn: string;
  entityField: string;
}

export interface ImportResult {
  successCount: number;
  errorCount: number;
  errors?: string[];
}
