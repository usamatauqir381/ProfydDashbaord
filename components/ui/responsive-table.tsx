"use client"

import { ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { useMediaQuery } from "@/hooks/use-media-query"

interface Column<T> {
  key: keyof T | string
  header: string
  cell?: (item: T) => ReactNode
  className?: string
  hideOnMobile?: boolean
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = "No data available"
}: ResponsiveTableProps<T>) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  // Filter columns based on mobile visibility
  const visibleColumns = isMobile 
    ? columns.filter(col => !col.hideOnMobile)
    : columns

  if (data.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      </Card>
    )
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHead key={column.key as string} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={keyExtractor(item)}
                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => onRowClick?.(item)}
              >
                {visibleColumns.map((column) => (
                  <TableCell key={column.key as string} className={column.className}>
                    {column.cell 
                      ? column.cell(item)
                      : (item[column.key as keyof T] as ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}