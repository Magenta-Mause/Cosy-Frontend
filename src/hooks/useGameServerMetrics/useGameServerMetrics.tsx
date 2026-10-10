import { AuthContext } from "@/components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { useContext, useEffect, useRef, useState } from "react";
import { useSubscription } from "react-stomp-hooks";
import { v7 as generateUuid } from "uuid";
import { getMetrics, getPublicEvaluableMetrics } from "@/api/generated/backend-api.ts";
import type { MetricPointDto } from "@/api/generated/model";
import { notificationModal } from "@/lib/notificationModal";
import { resolveTimeRange, type TimeRangeSelection, timeRangeKey } from "@/lib/timeRange.ts";
import type { DataLoadState } from "@/types/dataLoadState";
import type { GameServerMetricsWithUuid } from "@/types/metricsTyp";

interface UseGameServerMetricsOptions {
  /**
   * Only fetch and subscribe while this is true. Pass `false` whenever the view
   * that renders the metrics is not visible so nothing is loaded or kept around.
   */
  enabled?: boolean;
  /** Which endpoint to read from — the public one does not require permissions. */
  source?: "private" | "public";
  /** The range to load. Live updates are only applied while it ends now. */
  range: TimeRangeSelection;
}

interface UseGameServerMetricsResult {
  metrics: GameServerMetricsWithUuid[];
  state: DataLoadState;
}

/**
 * View-scoped metric access for a single game server.
 *
 * The metrics are fetched when the consuming component mounts (or becomes enabled, or the
 * range changes) and dropped again as soon as it unmounts, so nothing outlives the view
 * that actually renders it.
 */
const useGameServerMetrics = (
  serverId: string,
  options: UseGameServerMetricsOptions,
): UseGameServerMetricsResult => {
  const { enabled = true, source = "private", range } = options;
  const { authorized } = useContext(AuthContext);

  const [metrics, setMetrics] = useState<GameServerMetricsWithUuid[]>([]);
  const [state, setState] = useState<DataLoadState>("idle");

  const active = enabled && !!serverId;
  const rangeKey = timeRangeKey(range);
  const isLive = resolveTimeRange(range).isLive;

  // Guards against a slow response of an outdated range overwriting a newer one.
  const requestIdRef = useRef(0);
  const rangeRef = useRef(range);
  rangeRef.current = range;

  // biome-ignore lint/correctness/useExhaustiveDependencies: the range is keyed by rangeKey
  useEffect(() => {
    if (!active) {
      // Invalidate in-flight requests so their results are discarded.
      requestIdRef.current++;
      setMetrics([]);
      setState("idle");
      return;
    }

    const requestId = ++requestIdRef.current;
    // Presets are relative to now, so resolve at fetch time rather than at selection time.
    const { start, end } = resolveTimeRange(rangeRef.current);
    const params = { start: start.toISOString(), end: end?.toISOString() };

    setState("loading");
    (source === "public"
      ? getPublicEvaluableMetrics(serverId, params)
      : getMetrics(serverId, params)
    )
      .then((fetchedMetrics) => {
        if (requestIdRef.current !== requestId) return;
        setMetrics(fetchedMetrics.map((metric) => ({ ...metric, uuid: generateUuid() })));
        setState("idle");
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        notificationModal.error({
          message: `Failed to load metrics for server: ${serverId}`,
        });
        setState("failed");
      });

    return () => {
      requestIdRef.current++;
      setMetrics([]);
      setState("idle");
    };
  }, [active, serverId, source, rangeKey]);

  useSubscription(
    active && isLive
      ? [
          authorized
            ? `/topics/game-servers/${serverId}/metrics`
            : `/topics/public/game-servers/${serverId}/metrics`,
        ]
      : [],
    (message) => {
      const messageBody = JSON.parse(message.body) as MetricPointDto;
      setMetrics((previous) => [...previous, { ...messageBody, uuid: generateUuid() }]);
    },
  );

  return { metrics, state };
};

export default useGameServerMetrics;
