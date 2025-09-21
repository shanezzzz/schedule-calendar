import styles from './EmployeeHeader.module.scss';

interface EmployeeHeaderProps {
  employees: any[];
}

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({ employees }) => {
  return (
    <div
      className={styles.employeeHeader}
      style={{
        gridTemplateColumns: `repeat(${employees.length}, minmax(180px, 1fr))`,
      }}
    >
      {employees.map((emp) => (
        <div
          key={emp.id}
          className={styles.employeeHeaderItem}
        >
          {emp.name}
        </div>
      ))}
    </div>
  )
}

export default EmployeeHeader