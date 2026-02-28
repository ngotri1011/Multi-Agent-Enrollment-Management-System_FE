export function formatDate(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value)
  return date.toISOString()
}

