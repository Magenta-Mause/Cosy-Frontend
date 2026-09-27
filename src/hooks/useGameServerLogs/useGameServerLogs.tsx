import { AuthContext } from "@/components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSubscription } from "react-stomp-hooks";
import { v7 as generateUuid } from "uuid";
import { getLogs } from "@/api/generated/backend-api.ts";
import type { GameServerLogMessageEntity } from "@/api/generated/model";
import {
  exceedsLogRetention,
  resolveTimeRange,
  type TimeRangeSelection,
  timeRangeKey,
} from "@/lib/timeRange.ts";
import type { DataLoadState } from "@/types/dataLoadState";
import type { GameServerLogWithUuid } from "@/types/logTypes";

/** Lines per request; the backend returns the newest ones of the range. */
export const LOG_PAGE_SIZE = 500;

interface UseGameServerLogsOptions {
  /**
   * Only fetch and subscribe while this is true. Pass `false` whenever the view
   * that renders the logs is not visible so nothing is loaded or kept around.
   */
  enabled?: boolean;
  /** The range to load. Live updates are only applied while it ends now. */
  range: TimeRangeSelection;
}

interface UseGameServerLogsResult {
  logs: GameServerLogWithUuid[];
  state: DataLoadState;
  /** The range holds older lines than the loaded ones. */
  hasOlder: boolean;
  loadOlder: () => Promise<void>;
  olderState: DataLoadState;
  /** Number of lines prepended by `loadOlder`, for keeping the scroll position. */
  prependedCount: number;
  /** Part of the range lies beyond log retention, so older lines cannot exist. */
  exceedsRetention: boolean;
}

const byTimestamp = (a: GameServerLogMessageEntity, b: GameServerLogMessageEntity) =>
  (a.timestamp ? Date.parse(a.timestamp) : 0) - (b.timestamp ? Date.parse(b.timestamp) : 0);

const withUuids = (logs: GameServerLogMessageEntity[]): GameServerLogWithUuid[] =>
  [...logs].sort(byTimestamp).map((log) => ({ ...log, uuid: generateUuid() }));

/**
 * View-scoped log access for a single game server.
 *
 * The newest page of the range is fetched when the consuming component mounts (or becomes
 * enabled, or the range changes) and dropped again as soon as it unmounts, so nothing
 * outlives the view that actually renders it. Older pages are loaded on demand.
 */
const useGameServerLogs = (
  serverId: string,
  options: UseGameServerLogsOptions,
): UseGameServerLogsResult => {
  const { enabled = true, range } = options;
  const { authorized } = useContext(AuthContext);

  const [logs, setLogs] = useState<GameServerLogWithUuid[]>([]);
  const [state, setState] = useState<DataLoadState>("idle");
  const [hasOlder, setHasOlder] = useState(false);
  const [olderState, setOlderState] = useState<DataLoadState>("idle");
  const [prependedCount, setPrependedCount] = useState(0);

  const active = enabled && !!serverId;
  const rangeKey = timeRangeKey(range);
  const isLive = resolveTimeRange(range).isLive;

  // Guards against a slow response of an outdated request overwriting a newer one.
  const requestIdRef = useRef(0);
  const rangeRef = useRef(range);
  rangeRef.current = range;
  // Start of the loaded range, fixed at fetch time so paging stays within the same window.
  const loadedStartRef = useRef<Date | null>(null);

  const reset = useCallback(() => {
    requestIdRef.current++;
    loadedStartRef.current = null;
    setLogs([]);
    setState("idle");
    setHasOlder(false);
    setOlderState("idle");
    setPrependedCount(0);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the range is keyed by rangeKey
  useEffect(() => {
    if (!active) {
      reset();
      return;
    }

    const requestId = ++requestIdRef.current;
    // Presets are relative to now, so resolve at fetch time rather than at selection time.
    const { start, end } = resolveTimeRange(rangeRef.current);
    loadedStartRef.current = start;

    setState("loading");
    getLogs(serverId, {
      start: start.toISOString(),
      end: end?.toISOString(),
      limit: LOG_PAGE_SIZE,
    })
      .then((fetchedLogs) => {
        if (requestIdRef.current !== requestId) return;
        setLogs(withUuids(fetchedLogs));
        setHasOlder(fetchedLogs.length >= LOG_PAGE_SIZE);
        setState("idle");
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setState("failed");
      });

    return reset;
  }, [active, serverId, rangeKey, reset]);

  const loadOlder = useCallback(async () => {
    const start = loadedStartRef.current;
    const oldest = logs.find((log) => log.timestamp)?.timestamp;
    if (!active || !start || !oldest || olderState === "loading") return;

    const requestId = requestIdRef.current;
    setOlderState("loading");
    try {
      // The end is exclusive, so the oldest loaded line is not returned again.
      const olderLogs = await getLogs(serverId, {
        start: start.toISOString(),
        end: oldest,
        limit: LOG_PAGE_SIZE,
      });
      if (requestIdRef.current !== requestId) return;
      setLogs((previous) => [...withUuids(olderLogs), ...previous]);
      setPrependedCount((previous) => previous + olderLogs.length);
      setHasOlder(olderLogs.length >= LOG_PAGE_SIZE);
      setOlderState("idle");
    } catch {
      if (requestIdRef.current !== requestId) return;
      setOlderState("failed");
    }
  }, [active, serverId, logs, olderState]);

  useSubscription(
    active && isLive
      ? [
          authorized
            ? `/topics/game-servers/${serverId}/logs`
            : `/topics/public/game-servers/${serverId}/logs`,
        ]
      : [],
    (message) => {
      const messageBody = JSON.parse(message.body) as GameServerLogMessageEntity;
      setLogs((previous) => [...previous, { ...messageBody, uuid: generateUuid() }]);
    },
  );

  return {
    logs,
    state,
    hasOlder,
    loadOlder,
    olderState,
    prependedCount,
    exceedsRetention: exceedsLogRetention(range),
  };
};

export default useGameServerLogs;
