import { Button } from "@components/ui/button";
import { useEffect, useState } from "react";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading";
import type { GameServerMetricsWithUuid } from "@/stores/slices/gameServerMetrics";
import TimeRangeDropDown from "./DropDown/TimeRangeDropDown";
import MetricGraph from "./MetricGraph";

const MetricDisplay = (
  props: {
    metrics: GameServerMetricsWithUuid[];
    gameServerUuid: string;
  } & React.ComponentProps<"div">,
) => {
  const [unit, setUnit] = useState<string>("hour");
  const [startTime, setStartTime] = useState<Date | null>();
  const [endTime, setEndTime] = useState<Date | null>();
  const { loadMetrics } = useDataLoading();

  useEffect(() => {
    if (!startTime) return;
    loadMetrics(props.gameServerUuid, startTime, endTime);
  }, [startTime, endTime, props.gameServerUuid, loadMetrics]);

  const metricOrder = [
    {
      type: "cpu_percent",
      size: "6",
    },
    {
      type: "memory_percent",
      size: "2",
    },
    {
      type: "memory_limit",
      size: "2",
    },
    {
      type: "memory_usage",
      size: "2",
    },
    {
      type: "block_read",
      size: "3",
    },
    {
      type: "block_write",
      size: "3",
    },
  ];
  return (
    <>
      <div className="flex m-2 w-full items-center justify-end gap-2">
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
        <Button>Configure Metrics</Button>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {metricOrder.map((metric) => (
          <MetricGraph
            key={metric.type}
            className={`col-span-${metric.size}`}
            metrics={props.metrics}
            type={metric.type}
            unit={unit}
          />
        ))}
      </div>
    </>
  );
};

export default MetricDisplay;
