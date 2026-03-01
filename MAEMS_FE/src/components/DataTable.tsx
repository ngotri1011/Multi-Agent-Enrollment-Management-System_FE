import type { ReactNode } from "react"

type DataTableProps<T> = {
  data: T[]
  renderRow: (item: T) => ReactNode
}

export function DataTable<T>({ data, renderRow }: DataTableProps<T>) {
  return (
    <table>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>{renderRow(item)}</tr>
        ))}
      </tbody>
    </table>
  )
}

