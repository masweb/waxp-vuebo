export type ColumnAlign = 'start' | 'center' | 'end'

export interface ColumnSchema {
  key: string
  label?: string
  align?: ColumnAlign
  required?: boolean
}

export interface FilterSchema {
  key: string
  label?: string
}

export type TableSchema = ColumnSchema[]

export type FilterSchemas = FilterSchema[]
