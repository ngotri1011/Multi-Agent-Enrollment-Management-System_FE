export function toCsv(rows: string[][]) {
  return rows.map((row) => row.join(',')).join('\n')
}

