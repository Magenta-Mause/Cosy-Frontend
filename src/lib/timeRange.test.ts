import { describe, expect, it } from "vitest";
import {
  customRangeFromDays,
  customRangeSpanDays,
  exceedsLogRetention,
  isAllowedForRestrictedViewer,
  parseTimeRangeSearch,
  pickTimeRangeSearch,
  resolveTimeRange,
  type TimeRangeSelection,
  timeRangeKey,
  toTimeRangeSearch,
  validateTimeRangeSearch,
} from "@/lib/timeRange.ts";

const NOW = new Date("2026-09-27T12:00:00Z");
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

describe("parseTimeRangeSearch", () => {
  it("parses a preset, accepting the value as string or number", () => {
    expect(
      parseTimeRangeSearch({ timeRangeType: "preset", timeRangeValue: "15", timeRangeUnit: "min" }),
    ).toEqual({ type: "preset", value: 15, unit: "min" });
    expect(
      parseTimeRangeSearch({ timeRangeType: "preset", timeRangeValue: 7, timeRangeUnit: "day" }),
    ).toEqual({ type: "preset", value: 7, unit: "day" });
  });

  it("parses a custom range", () => {
    expect(
      parseTimeRangeSearch({
        timeRangeType: "custom",
        timeRangeStart: "2026-09-01T00:00:00.000Z",
        timeRangeEnd: "2026-09-03T00:00:00.000Z",
      }),
    ).toEqual({
      type: "custom",
      start: new Date("2026-09-01T00:00:00.000Z"),
      end: new Date("2026-09-03T00:00:00.000Z"),
    });
  });

  it("rejects malformed input", () => {
    expect(parseTimeRangeSearch({})).toBeNull();
    expect(
      parseTimeRangeSearch({ timeRangeType: "preset", timeRangeValue: "-1", timeRangeUnit: "min" }),
    ).toBeNull();
    expect(
      parseTimeRangeSearch({ timeRangeType: "preset", timeRangeValue: "1", timeRangeUnit: "week" }),
    ).toBeNull();
    expect(
      parseTimeRangeSearch({
        timeRangeType: "custom",
        timeRangeStart: "not a date",
        timeRangeEnd: "2026-09-03T00:00:00.000Z",
      }),
    ).toBeNull();
    expect(
      parseTimeRangeSearch({
        timeRangeType: "custom",
        timeRangeStart: "2026-09-03T00:00:00.000Z",
        timeRangeEnd: "2026-09-01T00:00:00.000Z",
      }),
    ).toBeNull();
  });
});

describe("toTimeRangeSearch / validateTimeRangeSearch", () => {
  it("round-trips a selection through the search params", () => {
    const selections: TimeRangeSelection[] = [
      { type: "preset", value: 12, unit: "hour" },
      {
        type: "custom",
        start: new Date("2026-09-01T00:00:00.000Z"),
        end: new Date("2026-09-02T00:00:00.000Z"),
      },
    ];
    for (const selection of selections) {
      expect(parseTimeRangeSearch({ ...toTimeRangeSearch(selection) })).toEqual(selection);
    }
  });

  it("rejects presets longer than the maximum span", () => {
    expect(
      parseTimeRangeSearch({ timeRangeType: "preset", timeRangeValue: "30", timeRangeUnit: "day" }),
    ).toEqual({ type: "preset", value: 30, unit: "day" });
    expect(
      parseTimeRangeSearch({ timeRangeType: "preset", timeRangeValue: "31", timeRangeUnit: "day" }),
    ).toBeNull();
    expect(
      parseTimeRangeSearch({
        timeRangeType: "preset",
        timeRangeValue: "721",
        timeRangeUnit: "hour",
      }),
    ).toBeNull();
  });

  it("rejects custom ranges longer than the maximum span", () => {
    expect(
      parseTimeRangeSearch({
        timeRangeType: "custom",
        timeRangeStart: "2026-08-01T00:00:00.000Z",
        timeRangeEnd: "2026-09-01T00:00:00.000Z",
      }),
    ).toBeNull();
  });

  it("drops invalid params instead of keeping them", () => {
    expect(validateTimeRangeSearch({ timeRangeType: "preset", timeRangeValue: "x" })).toEqual({});
  });
});

describe("pickTimeRangeSearch", () => {
  it("keeps only the time range params", () => {
    expect(
      pickTimeRangeSearch({
        view: "public",
        timeRangeType: "preset",
        timeRangeValue: 1,
        timeRangeUnit: "hour",
      }),
    ).toEqual({ timeRangeType: "preset", timeRangeValue: 1, timeRangeUnit: "hour" });
  });
});

describe("customRangeFromDays", () => {
  it("covers both picked days completely", () => {
    const range = customRangeFromDays(new Date(2026, 8, 1, 15, 30), new Date(2026, 8, 3, 8, 0));

    expect(range).toEqual({
      type: "custom",
      start: new Date(2026, 8, 1),
      end: new Date(2026, 8, 4),
    });
    expect(customRangeSpanDays(new Date(2026, 8, 1), new Date(2026, 8, 3))).toBe(3);
  });

  it("covers a single day when both picks are the same day", () => {
    expect(customRangeSpanDays(new Date(2026, 8, 1), new Date(2026, 8, 1))).toBe(1);
  });
});

describe("resolveTimeRange", () => {
  it("resolves a preset relative to now and leaves the end open", () => {
    const resolved = resolveTimeRange({ type: "preset", value: 5, unit: "hour" }, NOW);

    expect(resolved.start).toEqual(new Date(NOW.getTime() - 5 * HOUR_MS));
    expect(resolved.end).toBeUndefined();
    expect(resolved.isLive).toBe(true);
    expect(resolved.displayUnit).toBe("hour");
  });

  it("uses day labels for presets of a day or more", () => {
    expect(resolveTimeRange({ type: "preset", value: 1, unit: "day" }, NOW).displayUnit).toBe(
      "day",
    );
  });

  it("treats a custom range in the past as frozen", () => {
    const start = new Date("2026-09-01T00:00:00Z");
    const end = new Date("2026-09-03T00:00:00Z");

    const resolved = resolveTimeRange({ type: "custom", start, end }, NOW);

    expect(resolved).toEqual({ start, end, isLive: false, displayUnit: "day" });
  });

  it("treats a custom range reaching into the future as live, with an open end", () => {
    // Regression: "is today" used to compare only the day of month, so the 27th of any
    // month counted as today.
    const resolved = resolveTimeRange(
      {
        type: "custom",
        start: new Date("2026-09-27T00:00:00Z"),
        end: new Date("2026-09-28T00:00:00Z"),
      },
      NOW,
    );
    expect(resolved.isLive).toBe(true);
    expect(resolved.end).toBeUndefined();

    const lastMonth = resolveTimeRange(
      {
        type: "custom",
        start: new Date("2026-08-27T00:00:00Z"),
        end: new Date("2026-08-28T00:00:00Z"),
      },
      NOW,
    );
    expect(lastMonth.isLive).toBe(false);
  });
});

describe("resolveTimeRange across a DST change", () => {
  it("trims a 30-day custom range that is an hour longer to the maximum span", () => {
    const end = new Date("2026-09-01T00:00:00Z");
    const start = new Date(end.getTime() - 30 * DAY_MS - HOUR_MS);

    const resolved = resolveTimeRange({ type: "custom", start, end }, NOW);

    expect(resolved.start).toEqual(new Date(end.getTime() - 30 * DAY_MS));
    expect(resolved.end).toEqual(end);
  });
});

describe("isAllowedForRestrictedViewer", () => {
  it("allows up to 24 hours back", () => {
    expect(isAllowedForRestrictedViewer({ type: "preset", value: 12, unit: "hour" }, NOW)).toBe(
      true,
    );
    expect(isAllowedForRestrictedViewer({ type: "preset", value: 1, unit: "day" }, NOW)).toBe(true);
  });

  it("rejects anything reaching further back", () => {
    expect(isAllowedForRestrictedViewer({ type: "preset", value: 7, unit: "day" }, NOW)).toBe(
      false,
    );
    expect(
      isAllowedForRestrictedViewer(
        { type: "custom", start: new Date(NOW.getTime() - 2 * DAY_MS), end: NOW },
        NOW,
      ),
    ).toBe(false);
  });
});

describe("exceedsLogRetention", () => {
  it("flags ranges starting more than 7 days ago", () => {
    expect(exceedsLogRetention({ type: "preset", value: 7, unit: "day" }, NOW)).toBe(false);
    expect(exceedsLogRetention({ type: "preset", value: 30, unit: "day" }, NOW)).toBe(true);
  });
});

describe("timeRangeKey", () => {
  it("is equal for equal selections and differs otherwise", () => {
    expect(timeRangeKey({ type: "preset", value: 1, unit: "hour" })).toBe(
      timeRangeKey({ type: "preset", value: 1, unit: "hour" }),
    );
    expect(timeRangeKey({ type: "preset", value: 1, unit: "hour" })).not.toBe(
      timeRangeKey({ type: "preset", value: 1, unit: "day" }),
    );
  });
});
