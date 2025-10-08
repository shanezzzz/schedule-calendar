import React from 'react'
import styles from './EmployeeHeader.module.scss'
import type { EmployeeHeaderProps, EmployeeRenderer } from './types'
import { resolveEmployeeColumnTemplate } from '@/utils/employeeColumns'

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
  employees,
  renderEmployee,
  className = '',
  style = {},
  minColumnWidth = 210,
}) => {
  const defaultRenderEmployee: EmployeeRenderer = employee => (
    <div className={styles.employeeHeaderItem}>{employee.name}</div>
  )

  const renderEmployeeContent = renderEmployee || defaultRenderEmployee

  const columnTemplate = employees
    .map(employee =>
      resolveEmployeeColumnTemplate(employee.columnWidth, minColumnWidth)
    )
    .join(' ')

  return (
    <div
      className={`${styles.employeeHeader} ${className}`}
      style={{
        gridTemplateColumns: columnTemplate,
        ...style,
      }}
    >
      {employees.map((employee, index) => (
        <React.Fragment key={employee.id}>
          {renderEmployeeContent(employee, index)}
        </React.Fragment>
      ))}
    </div>
  )
}

export default EmployeeHeader
