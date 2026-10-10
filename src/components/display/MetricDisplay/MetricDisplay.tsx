import { useTranslation } from "react-i18next";
import { type GameServerDto, MetricLayoutSize } from "@/api/generated/model";
import Spinner from "@/components/ui/Spinner.tsx";
import useGameServerMetrics from "@/hooks/useGameServerMetrics/useGameServerMetrics";
import useServerTimeRange from "@/hooks/useServerTimeRange/useServerTimeRange.tsx";
import { resolveTimeRange } from "@/lib/timeRange.ts";
import { MetricsType } from "@/types/metricsTyp";
import MetricGraph from "./MetricGraph";
import { COL_SPAN_MAP } from "./metricLayout";

const MetricDisplay = (
  props: {
    gameServer: GameServerDto;
    canReadMetrics?: boolean;
  } & React.ComponentProps<"div">,
) => {
  const { t } = useTranslation();
  const { gameServer, canReadMetrics = true } = props;

  // The range is chosen in the page header and shared with the other server views.
  const { selection } = useServerTimeRange(gameServer.uuid);

  // The metrics belong to this view only: they are loaded on mount and released again
  // on unmount.
  const { metrics, state } = useGameServerMetrics(gameServer.uuid, {
    enabled: canReadMetrics,
    range: selection,
  });
  const { displayUnit } = resolveTimeRange(selection);

  return (
    <div className={"flex flex-col w-full items-center p-4 h-full"}>
      <div className="grid grid-cols-1 min-[1300px]:grid-cols-6 gap-2 w-full h-auto mb-auto relative">
        {state === "loading" && (
          <div className="absolute z-10 flex justify-center items-center w-full h-full backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Spinner className="size-10" />
              <div className="flex justify-center text-xl">{t("metrics.loadingMetrics")}</div>
            </div>
          </div>
        )}
        {state === "failed" && (
          <div className="absolute z-10 flex justify-center items-center w-full h-full backdrop-blur-sm">
            <div className="flex justify-center text-xl">{t("metrics.loadingMetricsFailed")}</div>
          </div>
        )}
        {gameServer.metric_layout?.map((metric) => (
          <MetricGraph
            key={metric.metric_type}
            className={`${COL_SPAN_MAP[metric.size ?? MetricLayoutSize.MEDIUM]}`}
            metrics={metrics}
            type={metric.metric_type ?? MetricsType.CPU_PERCENT}
            timeUnit={displayUnit}
            canReadMetrics={canReadMetrics}
          />
        ))}
      </div>
    </div>
  );
};

export default MetricDisplay;
