import { addDays, startOfDay } from "date-fns";

/**
 * The time range shared by the logs and metrics views of a game server. It lives in the
 * URL search params so every view (dashboard, console, metrics) and the header selector
 * read the same value, and so a range survives reloads and shared links.
 *
 * The limits below mirror the backend's `cosy.time-range` defaults; the backend enforces
 * them, the frontend only uses them to avoid offering ranges that would be rejected.
 */

export type TimeRangeUnit = "min" | "hour" | "day";

export type TimeRangeSelection =
  | { type: "preset"; value: number; unit: TimeRangeUnit }
  | { type: "custom"; start: Date; end: Date };

export interface TimeRangeSearch {
  timeRangeType?: "preset" | "custom";
  timeRangeValue?: number;
  timeRangeUnit?: TimeRangeUnit;
  timeRangeStart?: string;
  timeRangeEnd?: string;
}

export interface ResolvedTimeRange {
  start: Date;
  /** `undefined` means "now" — the backend resolves it, so client clock skew does not matter. */
  end?: Date;
  /** Whether the range ends now, i.e. new data from the websocket belongs into it. */
  isLive: boolean;
  /** Granularity for axis labels. */
  displayUnit: "hour" | "day";
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const TIME_RANGE_PRESETS: readonly (readonly [number, TimeRangeUnit])[] = [
  [15, "min"],
  [30, "min"],
  [1, "hour"],
  [5, "hour"],
  [12, "hour"],
  [1, "day"],
  [7, "day"],
  [30, "day"],
];

export const DEFAULT_TIME_RANGE: TimeRangeSelection = { type: "preset", value: 5, unit: "hour" };

export const MAX_SPAN_DAYS = 30;
const MAX_SPAN_MS = MAX_SPAN_DAYS * DAY_MS;
export const PUBLIC_MAX_LOOKBACK_MS = DAY_MS;
export const LOG_RETENTION_DAYS = 7;

const TIME_RANGE_SEARCH_KEYS = [
  "timeRangeType",
  "timeRangeValue",
  "timeRangeUnit",
  "timeRangeStart",
  "timeRangeEnd",
] as const satisfies readonly (keyof TimeRangeSearch)[];

const UNIT_MS: Record<TimeRangeUnit, number> = { min: MINUTE_MS, hour: HOUR_MS, day: DAY_MS };

const isUnit = (value: unknown): value is TimeRangeUnit =>
  value === "min" || value === "hour" || value === "day";

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** `validateSearch` for routes carrying the time range — drops anything malformed. */
export const validateTimeRangeSearch = (search: Record<string, unknown>): TimeRangeSearch => {
  const selection = parseTimeRangeSearch(search);
  return selection ? toTimeRangeSearch(selection) : {};
};

/** Reads a selection from search params, `null` if absent or malformed. */
export const parseTimeRangeSearch = (
  search: Record<string, unknown>,
): TimeRangeSelection | null => {
  if (search.timeRangeType === "preset") {
    const value = Number(search.timeRangeValue);
    if (
      Number.isInteger(value) &&
      value > 0 &&
      isUnit(search.timeRangeUnit) &&
      value * UNIT_MS[search.timeRangeUnit] <= MAX_SPAN_MS
    ) {
      return { type: "preset", value, unit: search.timeRangeUnit };
    }
  }
  if (search.timeRangeType === "custom") {
    const start = parseDate(search.timeRangeStart);
    const end = parseDate(search.timeRangeEnd);
    // Custom ranges cover whole local days, which can be an hour longer across a DST change.
    if (start && end && start < end && end.getTime() - start.getTime() <= MAX_SPAN_MS + HOUR_MS) {
      return { type: "custom", start, end };
    }
  }
  // Anything the backend would reject (malformed, or longer than the maximum span) falls back
  // to the default instead of producing an error.
  return null;
};

export const toTimeRangeSearch = (selection: TimeRangeSelection): TimeRangeSearch =>
  selection.type === "preset"
    ? { timeRangeType: "preset", timeRangeValue: selection.value, timeRangeUnit: selection.unit }
    : {
        timeRangeType: "custom",
        timeRangeStart: selection.start.toISOString(),
        timeRangeEnd: selection.end.toISOString(),
      };

/** Extracts only the time range params, e.g. to carry them along when switching tabs. */
export const pickTimeRangeSearch = (search: Record<string, unknown>): TimeRangeSearch => {
  const picked: Record<string, unknown> = {};
  for (const key of TIME_RANGE_SEARCH_KEYS) {
    if (search[key] !== undefined) picked[key] = search[key];
  }
  return picked as TimeRangeSearch;
};

/**
 * Turns the days picked in the date picker into a range covering both days completely:
 * from the start of the first day up to the start of the day after the last one.
 */
export const customRangeFromDays = (firstDay: Date, lastDay: Date): TimeRangeSelection => ({
  type: "custom",
  start: startOfDay(firstDay),
  end: addDays(startOfDay(lastDay), 1),
});

export const customRangeSpanDays = (firstDay: Date, lastDay: Date): number => {
  const range = customRangeFromDays(firstDay, lastDay);
  return range.type === "custom" ? Math.round((+range.end - +range.start) / DAY_MS) : 0;
};

export const isSameTimeRange = (a: TimeRangeSelection, b: TimeRangeSelection): boolean =>
  timeRangeKey(a) === timeRangeKey(b);

/** A stable string identity, usable as an effect dependency. */
export const timeRangeKey = (selection: TimeRangeSelection): string =>
  selection.type === "preset"
    ? `preset:${selection.value}:${selection.unit}`
    : `custom:${selection.start.toISOString()}:${selection.end.toISOString()}`;

/** Resolves a selection against `now`. Presets are relative, so call this at fetch time. */
export const resolveTimeRange = (
  selection: TimeRangeSelection,
  now: Date = new Date(),
): ResolvedTimeRange => {
  if (selection.type === "preset") {
    const spanMs = selection.value * UNIT_MS[selection.unit];
    return {
      start: new Date(now.getTime() - spanMs),
      end: undefined,
      isLive: true,
      displayUnit: spanMs >= DAY_MS ? "day" : "hour",
    };
  }

  const isLive = selection.end >= now;
  // Whole local days can add up to an hour more than the maximum span across a DST change;
  // trim that hour instead of sending a range the backend rejects.
  const earliestStart = selection.end.getTime() - MAX_SPAN_MS;
  return {
    start: selection.start.getTime() < earliestStart ? new Date(earliestStart) : selection.start,
    end: isLive ? undefined : selection.end,
    isLive,
    displayUnit: selection.end.getTime() - selection.start.getTime() > DAY_MS ? "day" : "hour",
  };
};

/** Whether a restricted (public dashboard) viewer may request this selection. */
export const isAllowedForRestrictedViewer = (
  selection: TimeRangeSelection,
  now: Date = new Date(),
): boolean =>
  resolveTimeRange(selection, now).start.getTime() >= now.getTime() - PUBLIC_MAX_LOOKBACK_MS;

/** Whether part of the range lies beyond log retention, so older logs are missing. */
export const exceedsLogRetention = (
  selection: TimeRangeSelection,
  now: Date = new Date(),
): boolean =>
  resolveTimeRange(selection, now).start.getTime() < now.getTime() - LOG_RETENTION_DAYS * DAY_MS;
