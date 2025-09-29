import React from 'react';
import styles from './EmployeeHeader.module.scss';

export interface Employee {
  id: string;
  name: string;
  [key: string]: any;
}

export interface EmployeeHeaderProps {
  employees: Employee[];
  renderEmployee?: (employee: Employee, index: number) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  minColumnWidth?: number;
}

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({ 
  employees, 
  renderEmployee,
  className = '',
  style = {},
  minColumnWidth = 210
}) => {
  const defaultRenderEmployee = (employee: Employee) => (
    <div className={styles.employeeHeaderItem}>
      {employee.name}
    </div>
  );

  const renderEmployeeContent = renderEmployee || defaultRenderEmployee;

  return (
    <div
      className={`${styles.employeeHeader} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${employees.length}, minmax(${minColumnWidth}px, 1fr))`,
        ...style,
      }}
    >
      {employees.map((employee, index) => (
        <React.Fragment key={employee.id}>
          {renderEmployeeContent(employee, index)}
        </React.Fragment>
      ))}
    </div>
  );
};

export default EmployeeHeader;