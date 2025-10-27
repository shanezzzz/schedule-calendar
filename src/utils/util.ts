/**
 * Time-related utility functions - Refactored version
 * Based on high cohesion, low coupling, extensibility, and high stability design principles
 */

// ======================== Constants ========================
export const DEFAULT_TIME_LABEL_INTERVAL = 30 // Default time label interval (minutes)
export const MINUTES_PER_DAY = 24 * 60
const DEFAULT_HEIGHT = 52 // Default minimum height
const TIME_REGEX_24H = /^(\d{1,2}):(\d{2})$/
const TIME_REGEX_12H = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i

// ======================== Type Definitions ========================
/**
 * Time value object
 */
export interface TimeValue {
  readonly hours: number
  readonly minutes: number
}

/**
 * Time format enumeration
 */
export enum TimeFormat {
  HOUR_24 = '24h',
  HOUR_12 = '12h',
}

/**
 * Parse result
 */
interface ParseResult {
  success: boolean
  data?: TimeValue
  error?: string
}

// ======================== Time Parsing Strategy ========================
/**
 * Time parser interface
 */
interface TimeParser {
  canParse(timeString: string): boolean
  parse(timeString: string): ParseResult
}

/**
 * 24-hour format parser
 */
class Hour24Parser implements TimeParser {
  canParse(timeString: string): boolean {
    return TIME_REGEX_24H.test(timeString.trim())
  }

  parse(timeString: string): ParseResult {
    const match = timeString.trim().match(TIME_REGEX_24H)
    if (!match) {
      return { success: false, error: `Invalid 24-hour format: ${timeString}` }
    }

    const hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)

    if (!this.isValidTime(hours, minutes)) {
      return {
        success: false,
        error: `Invalid time values: ${hours}:${minutes}`,
      }
    }

    return { success: true, data: { hours, minutes } }
  }

  private isValidTime(hours: number, minutes: number): boolean {
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
  }
}

/**
 * 12-hour format parser
 */
class Hour12Parser implements TimeParser {
  canParse(timeString: string): boolean {
    return TIME_REGEX_12H.test(timeString.trim())
  }

  parse(timeString: string): ParseResult {
    const match = timeString.trim().match(TIME_REGEX_12H)
    if (!match) {
      return { success: false, error: `Invalid 12-hour format: ${timeString}` }
    }

    let hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    const ampm = match[3].toUpperCase()

    // Convert to 24-hour format
    if (ampm === 'PM' && hours !== 12) {
      hours += 12
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0
    }

    if (!this.isValidTime(hours, minutes)) {
      return {
        success: false,
        error: `Invalid time values: ${hours}:${minutes}`,
      }
    }

    return { success: true, data: { hours, minutes } }
  }

  private isValidTime(hours: number, minutes: number): boolean {
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
  }
}

// ======================== Time Formatting Strategy ========================
/**
 * Time formatter interface
 */
interface TimeFormatter {
  format(input: TimeValue | Date): string
}

/**
 * 24-hour format formatter
 */
class Hour24Formatter implements TimeFormatter {
  format(input: TimeValue | Date): string {
    if (input instanceof Date) {
      if (isNaN(input.getTime())) {
        throw new Error('Invalid Date object')
      }
      return input.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    }

    const { hours, minutes } = input
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
}

/**
 * 12-hour format formatter
 */
class Hour12Formatter implements TimeFormatter {
  format(input: TimeValue | Date): string {
    if (input instanceof Date) {
      if (isNaN(input.getTime())) {
        throw new Error('Invalid Date object')
      }
      return input.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    }

    const { hours, minutes } = input
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return this.format(date)
  }
}

// ======================== Core Service Classes ========================
/**
 * Time parsing service
 */
class TimeParsingService {
  private readonly parsers: TimeParser[] = [
    new Hour12Parser(), // 12-hour format first, as it's easier to identify
    new Hour24Parser(),
  ]

  parse(timeString: string): ParseResult {
    if (!timeString || typeof timeString !== 'string') {
      return { success: false, error: 'Empty or invalid time string' }
    }

    for (const parser of this.parsers) {
      if (parser.canParse(timeString)) {
        return parser.parse(timeString)
      }
    }

    return { success: false, error: `Unsupported time format: ${timeString}` }
  }
}

/**
 * Time formatting service
 */
class TimeFormattingService {
  private readonly formatters = new Map<TimeFormat, TimeFormatter>([
    [TimeFormat.HOUR_24, new Hour24Formatter()],
    [TimeFormat.HOUR_12, new Hour12Formatter()],
  ])

  format(input: TimeValue | Date, format: TimeFormat): string {
    const formatter = this.formatters.get(format)
    if (!formatter) {
      throw new Error(`Unsupported time format: ${format}`)
    }

    try {
      return formatter.format(input)
    } catch (error) {
      console.warn('Time formatting failed:', error)
      return 'Invalid Time'
    }
  }
}

// ======================== Service Instances ========================
const timeParsingService = new TimeParsingService()
const timeFormattingService = new TimeFormattingService()

// ======================== Public API ========================
/**
 * Parse time string
 * @param timeSlot Time string, supports multiple formats
 * @returns Parse result
 */
export function parseTimeSlot(timeSlot: string): ParseResult {
  return timeParsingService.parse(timeSlot)
}

/**
 * Convert time slot string to absolute minutes from 00:00
 */
export function slotToMinutes(timeSlot: string): number | null {
  const result = parseTimeSlot(timeSlot)
  if (!result.success || !result.data) {
    return null
  }

  return result.data.hours * 60 + result.data.minutes
}

/**
 * Add minutes to a given time slot
 */
export function addMinutesToSlot(timeSlot: string, minutes: number): string {
  const baseMinutes = slotToMinutes(timeSlot)
  if (baseMinutes === null) {
    return timeSlot
  }

  const normalized = (baseMinutes + minutes + MINUTES_PER_DAY) % MINUTES_PER_DAY
  const hours = Math.floor(normalized / 60)
  const mins = normalized % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Calculate the difference (in minutes) between two time slots
 */
export function differenceInMinutes(
  startSlot: string,
  endSlot: string
): number {
  const start = slotToMinutes(startSlot)
  const end = slotToMinutes(endSlot)

  if (start === null || end === null) {
    return 0
  }

  let diff = end - start
  if (diff <= 0) {
    diff += MINUTES_PER_DAY
  }

  return diff
}

/**
 * Format time display
 * @param input Date object or TimeValue object
 * @param use24HourFormat true: 24-hour format, false: 12-hour format (AM/PM)
 * @returns Formatted time string
 */
export function formatTime(
  input: Date | TimeValue,
  use24HourFormat: boolean = false
): string {
  const format = use24HourFormat ? TimeFormat.HOUR_24 : TimeFormat.HOUR_12
  return timeFormattingService.format(input, format)
}

/**
 * Create time value object
 * @param hours Hour (0-23)
 * @param minutes Minute (0-59)
 * @returns Time value object
 */
export function createTimeValue(hours: number, minutes: number): TimeValue {
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time values: ${hours}:${minutes}`)
  }
  return { hours, minutes }
}

/**
 * Convert time value to Date object
 * @param timeValue Time value object
 * @param baseDate Base date, defaults to today
 * @returns Date object
 */
export function timeValueToDate(
  timeValue: TimeValue,
  baseDate: Date = new Date()
): Date {
  const date = new Date(baseDate)
  date.setHours(timeValue.hours, timeValue.minutes, 0, 0)
  return date
}

/**
 * Generate time labels array
 * @param timeSlot Starting time slot, supports multiple formats
 * @param stepMinutes Time interval, e.g., 30 minutes
 * @param use24HourFormat true: 24-hour format, false: 12-hour format (AM/PM)
 * @param count Optional, specify the number of time labels to generate
 * @returns Time labels array
 */
export function generateTimeLabels(
  timeSlot: string,
  stepMinutes: number = 30,
  use24HourFormat: boolean = false,
  count?: number
): string[] {
  const parseResult = parseTimeSlot(timeSlot)
  if (!parseResult.success || !parseResult.data) {
    console.warn(`Time parsing failed: ${parseResult.error}`)
    return []
  }

  const labelCount =
    count ?? Math.max(1, Math.round(DEFAULT_TIME_LABEL_INTERVAL / stepMinutes))
  const times: string[] = []

  let currentTime = timeValueToDate(parseResult.data)

  for (let i = 0; i < labelCount; i++) {
    times.push(formatTime(currentTime, use24HourFormat))
    currentTime = new Date(currentTime.getTime() + stepMinutes * 60 * 1000)
  }

  return times
}

/**
 * Generate time slots array
 * @param startHour Start hour
 * @param endHour End hour
 * @param intervalMinutes Time interval (minutes)
 * @param use24HourFormat true: 24-hour format, false: 12-hour format (AM/PM)
 * @returns Time slots array
 */
export function generateTimeSlots(
  startHour: number = 7,
  endHour: number = 23,
  intervalMinutes: number = 30,
  use24HourFormat: boolean = false
): string[] {
  const times: string[] = []
  const start = new Date()
  start.setHours(startHour, 0, 0, 0)
  const end = new Date()
  end.setHours(endHour, 0, 0, 0)

  let current = new Date(start)
  while (current <= end) {
    times.push(formatTime(current, use24HourFormat))
    current = new Date(current.getTime() + intervalMinutes * 60000)
  }

  return times
}

/**
 * Calculate time slot height
 * @param stepMinutes Time interval (minutes)
 * @param baseHeight Base height, defaults to 40px
 * @returns Calculated height
 */
export function calculateSlotHeight(
  stepMinutes: number = 30,
  baseHeight: number = 40
): number {
  const height = (DEFAULT_TIME_LABEL_INTERVAL / stepMinutes) * baseHeight
  return height <= baseHeight ? DEFAULT_HEIGHT : height
}

/**
 * Scroll configuration interface
 */
export interface CalendarScrollConfig {
  startHour: number
  endHour: number
  displayIntervalMinutes: number
  cellHeight: number
  headerHeight?: number
  scrollMargin?: number
}

/**
 * Calendar event interface for scroll calculations
 */
export interface CalendarEventForScroll {
  start: string
  end: string
}

/**
 * Scroll position result
 */
export interface ScrollPositionResult {
  position: number
  isInRange: boolean
}

export type ScrollTargetType =
  | 'currentTimeLine'
  | 'latestEvent'
  | 'newEvent'
  | 'none'

export interface ScrollTargetResult {
  position: number
  type: ScrollTargetType
}

/**
 * Calculate the pixel position of current time line
 * @param config Scroll configuration
 * @param currentTime Optional current time, defaults to now
 * @returns Position result
 */
export function calculateCurrentTimeLinePosition(
  config: CalendarScrollConfig,
  currentTime: Date = new Date()
): ScrollPositionResult {
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()

  // Check if current time is within display range
  if (currentHour < config.startHour || currentHour >= config.endHour) {
    return { position: -1, isInRange: false }
  }

  // Calculate total minutes from start time to current time
  const totalMinutesFromStart =
    (currentHour - config.startHour) * 60 + currentMinute

  // Calculate precise pixel position
  const positionInPixels =
    (totalMinutesFromStart / config.displayIntervalMinutes) * config.cellHeight

  return { position: positionInPixels, isInRange: true }
}

/**
 * Calculate position for a specific event
 * @param event Single event
 * @param config Scroll configuration
 * @returns Position result
 */
export function calculateEventPosition(
  event: CalendarEventForScroll,
  config: CalendarScrollConfig
): ScrollPositionResult {
  // Calculate event start time position
  const [startHourStr, startMinuteStr] = event.start.split(':')
  const eventStartHour = parseInt(startHourStr, 10)
  const eventStartMinute = parseInt(startMinuteStr, 10)

  // Check if event time is within display range
  if (eventStartHour < config.startHour || eventStartHour >= config.endHour) {
    return { position: -1, isInRange: false }
  }

  // Calculate total minutes from start time to event time
  const totalMinutesFromStart =
    (eventStartHour - config.startHour) * 60 + eventStartMinute

  // Calculate precise pixel position
  const positionInPixels =
    (totalMinutesFromStart / config.displayIntervalMinutes) * config.cellHeight

  return { position: positionInPixels, isInRange: true }
}

/**
 * Find the latest event and calculate its position
 * @param events Array of events
 * @param config Scroll configuration
 * @returns Position result
 */
export function findLatestEventPosition(
  events: CalendarEventForScroll[],
  config: CalendarScrollConfig
): ScrollPositionResult {
  if (!events || events.length === 0) {
    return { position: -1, isInRange: false }
  }

  // Find the latest event by time
  let latestEvent = events[0]
  for (const event of events) {
    const latestTime = new Date(`1970-01-01T${latestEvent.start}:00`)
    const currentTime = new Date(`1970-01-01T${event.start}:00`)
    if (currentTime > latestTime) {
      latestEvent = event
    }
  }

  return calculateEventPosition(latestEvent, config)
}

/**
 * Find the earliest new event position
 * @param newEvents Array of new events
 * @param config Scroll configuration
 * @returns Position result
 */
export function findEarliestNewEventPosition(
  newEvents: CalendarEventForScroll[],
  config: CalendarScrollConfig
): ScrollPositionResult {
  if (!newEvents || newEvents.length === 0) {
    return { position: -1, isInRange: false }
  }

  // Find the earliest new event by time
  let earliestEvent = newEvents[0]
  for (const event of newEvents) {
    const earliestTime = new Date(`1970-01-01T${earliestEvent.start}:00`)
    const currentTime = new Date(`1970-01-01T${event.start}:00`)
    if (currentTime < earliestTime) {
      earliestEvent = event
    }
  }

  return calculateEventPosition(earliestEvent, config)
}

/**
 * Determine the optimal scroll target position
 * @param currentTimeLinePosition Current time line position result
 * @param latestEventPosition Latest event position result
 * @param newEventPosition New event position result (highest priority)
 * @returns Target position (-1 if no valid target)
 */
export function determineScrollTarget(
  currentTimeLinePosition: ScrollPositionResult,
  latestEventPosition: ScrollPositionResult,
  newEventPosition?: ScrollPositionResult
): ScrollTargetResult {
  // Highest priority: new event position
  if (newEventPosition && newEventPosition.isInRange) {
    return {
      position: newEventPosition.position,
      type: 'newEvent',
    }
  }

  if (currentTimeLinePosition.isInRange) {
    // Keep focus on the current time line when available
    return {
      position: currentTimeLinePosition.position,
      type: 'currentTimeLine',
    }
  }

  if (latestEventPosition.isInRange) {
    // Fallback to latest event when time line is out of range
    return {
      position: latestEventPosition.position,
      type: 'latestEvent',
    }
  }

  return { position: -1, type: 'none' } // No valid target
}

/**
 * Calculate final scroll position with header height and margin
 * @param targetPosition Target pixel position
 * @param headerHeight Header height to offset
 * @param scrollMargin Additional margin from top (ignored for current time line centering)
 * @param viewportHeight Optional viewport height for centering calculations
 * @param targetType Scroll target source to adjust behavior
 * @param contentHeight Total scrollable content height, used to clamp scroll top
 * @returns Final scroll top position
 */
export function calculateScrollTop(
  targetPosition: number,
  headerHeight: number = 0,
  scrollMargin: number = 200,
  viewportHeight?: number,
  targetType: ScrollTargetType = 'latestEvent',
  contentHeight?: number
): number {
  if (targetPosition === -1) {
    return 0
  }

  const baseTop = targetPosition + headerHeight
  const maxScrollTop =
    typeof contentHeight === 'number' &&
    typeof viewportHeight === 'number' &&
    contentHeight > viewportHeight
      ? contentHeight - viewportHeight
      : undefined
  const clampScrollTop = (value: number) =>
    typeof maxScrollTop === 'number'
      ? Math.min(Math.max(0, value), maxScrollTop)
      : Math.max(0, value)

  if (
    targetType === 'currentTimeLine' &&
    typeof viewportHeight === 'number' &&
    viewportHeight > 0
  ) {
    // Center the current time line within the viewport when possible
    const centeredTop = baseTop - viewportHeight / 2
    return clampScrollTop(centeredTop)
  }

  return clampScrollTop(baseTop - scrollMargin)
}

/**
 * Perform smooth scroll to calculated position
 * @param element Target scroll element
 * @param events Array of events
 * @param config Scroll configuration
 * @param currentTime Optional current time
 * @param newEvents Optional array of new events (highest priority)
 */
export function performCalendarAutoScroll(
  element: HTMLElement,
  events: CalendarEventForScroll[],
  config: CalendarScrollConfig,
  currentTime: Date = new Date(),
  newEvents?: CalendarEventForScroll[]
): void {
  const currentTimeLinePosition = calculateCurrentTimeLinePosition(
    config,
    currentTime
  )
  const latestEventPosition = findLatestEventPosition(events, config)
  const newEventPosition =
    newEvents && newEvents.length > 0
      ? findEarliestNewEventPosition(newEvents, config)
      : undefined

  const { position: targetPosition, type: targetType } = determineScrollTarget(
    currentTimeLinePosition,
    latestEventPosition,
    newEventPosition
  )

  if (targetPosition !== -1) {
    const scrollTop = calculateScrollTop(
      targetPosition,
      config.headerHeight || 0,
      config.scrollMargin || 200,
      element.clientHeight,
      targetType,
      element.scrollHeight
    )

    element.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    })
  }
}
