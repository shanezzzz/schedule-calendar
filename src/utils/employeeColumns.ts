export const DEFAULT_EMPLOYEE_COLUMN_WIDTH = 210

export const resolveEmployeeColumnTemplate = (
  customWidth: string | number | undefined,
  fallbackWidth: number = DEFAULT_EMPLOYEE_COLUMN_WIDTH
): string => {
  if (customWidth === undefined || customWidth === null) {
    return `minmax(${fallbackWidth}px, 1fr)`
  }

  if (typeof customWidth === 'number') {
    return `${customWidth}px`
  }

  return customWidth
}
