import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { GameServerAccessGroupDtoPermissionsItem } from "@/api/generated/model";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions.tsx";
import {
  DEFAULT_TIME_RANGE,
  isAllowedForRestrictedViewer,
  parseTimeRangeSearch,
  resolveTimeRange,
  type TimeRangeSelection,
  timeRangeKey,
  toTimeRangeSearch,
} from "@/lib/timeRange.ts";

const DASHBOARD_PATH = /^\/server\/[^/]+\/?$/;

interface UseServerTimeRangeResult {
  /** The effective selection — already limited for restricted viewers. */
  selection: TimeRangeSelection;
  /** Stable identity of `selection`, for effect dependencies. */
  selectionKey: string;
  setSelection: (selection: TimeRangeSelection) => void;
  /**
   * Switches back to the default (live) range if a past range is shown — e.g. after sending
   * a command, whose output would otherwise not appear.
   */
  ensureLive: () => void;
  /**
   * The viewer reads at least part of the page through the public dashboard (missing the
   * logs or metrics permission) and is limited to the last 24 hours by the backend.
   */
  restricted: boolean;
}

/**
 * The time range shared by the header selector and the logs/metrics views of a game server.
 * It is stored in the URL search params, so every consumer on the page sees the same value.
 */
const useServerTimeRange = (serverId: string): UseServerTimeRangeResult => {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { hasPermission } = useGameServerPermissions(serverId);

  // Only the dashboard serves data through the public endpoints; the console and metrics
  // pages require the respective permission to be visible at all.
  const restricted =
    DASHBOARD_PATH.test(pathname) &&
    (!hasPermission(GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS) ||
      !hasPermission(GameServerAccessGroupDtoPermissionsItem.READ_SERVER_LOGS));

  const requested = parseTimeRangeSearch(search) ?? DEFAULT_TIME_RANGE;
  const effective =
    restricted && !isAllowedForRestrictedViewer(requested) ? DEFAULT_TIME_RANGE : requested;
  const selectionKey = timeRangeKey(effective);

  // Keep the object identity stable as long as the selection itself does not change.
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed by selectionKey on purpose
  const selection = useMemo(() => effective, [selectionKey]);

  const setSelection = useCallback(
    (next: TimeRangeSelection) => {
      navigate({
        to: ".",
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          timeRangeValue: undefined,
          timeRangeUnit: undefined,
          timeRangeStart: undefined,
          timeRangeEnd: undefined,
          ...toTimeRangeSearch(next),
        }),
        replace: true,
      });
    },
    [navigate],
  );

  const ensureLive = useCallback(() => {
    if (!resolveTimeRange(selection).isLive) setSelection(DEFAULT_TIME_RANGE);
  }, [selection, setSelection]);

  return { selection, selectionKey, setSelection, ensureLive, restricted };
};

export default useServerTimeRange;
