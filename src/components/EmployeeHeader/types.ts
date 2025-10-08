import type { CSSProperties, ReactNode } from 'react'

export type Employee = {
  id: string
  name: string
  avatarUrl?: string
  role?: string
  columnWidth?: number | string
  metadata?: Record<string, unknown>
} & Record<string, unknown>

export type EmployeeRenderer = (employee: Employee, index: number) => ReactNode

export interface EmployeeHeaderProps {
  employees: Employee[]
  renderEmployee?: EmployeeRenderer
  className?: string
  style?: CSSProperties
  minColumnWidth?: number
}
