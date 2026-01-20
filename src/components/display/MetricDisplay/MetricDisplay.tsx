import { Button } from "@components/ui/button";
import { useState } from "react";
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

  return (
    <>
      <div className="flex justify-between mb-2">
        <TimeRangeDropDown
          className="w-[49.5%]"
          gameServerUuid={props.gameServerUuid}
          setUnit={setUnit}
        />
        <Button className="w-[49.5%]">Configure Metrics</Button>
      </div>
      <div className="grid grid-cols-6 gap-2">
        <MetricGraph metrics={props.metrics} type="cpu_percent" unit={unit} />
        <MetricGraph metrics={props.metrics} type="memory_percent" unit={unit} />
        <MetricGraph
          className="col-span-4"
          metrics={props.metrics}
          type="memory_limit"
          unit={unit}
        />
        <MetricGraph
          className="col-span-2"
          metrics={props.metrics}
          type="memory_usage"
          unit={unit}
        />
        <MetricGraph
          className="col-span-6"
          metrics={props.metrics}
          type="memory_usage"
          unit={unit}
        />
      </div>
    </>
  );
};

export default MetricDisplay;
