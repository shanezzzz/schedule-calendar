export type TimeZone = Intl.DateTimeFormatOptions['timeZone']

export interface ZonedDateParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()

const buildFormatter = (timeZone: string) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

const getFormatter = (timeZone: string): Intl.DateTimeFormat | null => {
  if (!timeZone) return null
  const cached = formatterCache.get(timeZone)
  if (cached) return cached

  try {
    const formatter = buildFormatter(timeZone)
    formatterCache.set(timeZone, formatter)
    return formatter
  } catch {
    return null
  }
}

const pad2 = (value: number) => String(value).padStart(2, '0')

export const getZonedDateParts = (
  date: Date,
  timeZone?: TimeZone
): ZonedDateParts => {
  if (!timeZone) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    }
  }

  const formatter = getFormatter(timeZone)
  if (!formatter) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    }
  }

  const parts = formatter.formatToParts(date)
  const values: Record<string, string> = {}
  parts.forEach(part => {
    if (part.type !== 'literal') {
      values[part.type] = part.value
    }
  })

  const hour = Number(values.hour ?? date.getHours())
  const normalizedHour = hour === 24 ? 0 : hour

  return {
    year: Number(values.year ?? date.getFullYear()),
    month: Number(values.month ?? date.getMonth() + 1),
    day: Number(values.day ?? date.getDate()),
    hour: normalizedHour,
    minute: Number(values.minute ?? date.getMinutes()),
    second: Number(values.second ?? date.getSeconds()),
  }
}

export const getZonedDateString = (
  date: Date = new Date(),
  timeZone?: TimeZone
): string => {
  const parts = getZonedDateParts(date, timeZone)
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`
}

export const isSameZonedDay = (
  left: Date,
  right: Date,
  timeZone?: TimeZone
): boolean => {
  const leftParts = getZonedDateParts(left, timeZone)
  const rightParts = getZonedDateParts(right, timeZone)
  return (
    leftParts.year === rightParts.year &&
    leftParts.month === rightParts.month &&
    leftParts.day === rightParts.day
  )
}
