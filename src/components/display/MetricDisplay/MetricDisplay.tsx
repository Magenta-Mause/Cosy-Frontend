import { Button } from "@components/ui/button";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GetMetricsType } from "@/api/generated/model";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading";
import type { GameServerMetricsWithUuid } from "@/stores/slices/gameServerMetrics";
import TimeRangeDropDown from "./DropDown/TimeRangeDropDown";
import MetricGraph from "./MetricGraph";

const METRIC_ORDER = [
  {
    type: GetMetricsType.CPU_PERCENT,
    size: "6",
  },
  {
    type: GetMetricsType.MEMORY_PERCENT,
    size: "2",
  },
  {
    type: GetMetricsType.MEMORY_LIMIT,
    size: "2",
  },
  {
    type: GetMetricsType.MEMORY_USAGE,
    size: "2",
  },
  {
    type: GetMetricsType.NETWORK_INPUT,
    size: "3",
  },
  {
    type: GetMetricsType.NETWORK_OUTPUT,
    size: "3",
  },
];

const MetricDisplay = (
  props: {
    metrics: GameServerMetricsWithUuid[];
    gameServerUuid: string;
  } & React.ComponentProps<"div">,
) => {
  const { t } = useTranslation();
  const [unit, setUnit] = useState<string>("hour");
  const [startTime, setStartTime] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState<Date | undefined>();
  const { loadMetrics } = useDataLoading();

  useEffect(() => {
    if (!startTime) return;
    loadMetrics(props.gameServerUuid, startTime, endTime);
  }, [startTime, endTime, props.gameServerUuid, loadMetrics]);

  const colSpanMap: Record<string, string> = {
    "1": "col-span-1",
    "2": "col-span-2",
    "3": "col-span-3",
    "4": "col-span-4",
    "5": "col-span-5",
    "6": "col-span-6",
  };


  return (
    <>
      <div className="flex mb-2 w-full items-center justify-end gap-2">
        <TimeRangeDropDown
          onChange={({
            startTime: selectedStartTime,
            endTime: selectedEndTime,
            timeUnit: selectedUnit,
          }) => {
            setUnit(selectedUnit);
            setStartTime(selectedStartTime);
            setEndTime(selectedEndTime);
          }}
        />
        <Button>{t("metrics.configure")}</Button>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {METRIC_ORDER.map((metric) => (
          <MetricGraph
            key={metric.type}
            className={colSpanMap[metric.size]}
            metrics={props.metrics}
            type={metric.type}
            timeUnit={unit}
          />
        ))}
      </div>
    </>
  );
};

export default MetricDisplay;
