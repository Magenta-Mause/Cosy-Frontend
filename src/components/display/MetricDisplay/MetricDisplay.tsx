import { Button } from "@components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import type { GameServerDto } from "@/api/generated/model";
import spinner from "@/assets/gifs/spinner.gif";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading";
import { useTypedSelector } from "@/stores/rootReducer";
import {
  type GameServerMetricsWithUuid,
  gameServerMetricsSliceActions,
} from "@/stores/slices/gameServerMetrics";
import { MetricsType } from "@/types/metricsTyp";
import TimeRangeDropDown from "../DropDown/TimeRangeDropDown";
import MetricGraph from "./MetricGraph";

const MetricDisplay = (
  props: {
    metrics: GameServerMetricsWithUuid[];
    gameServer: GameServerDto;
  } & React.ComponentProps<"div">,
) => {
  const { t } = useTranslation();
  const [unit, setUnit] = useState<string>("hour");
  const [loading, setLoading] = useState<boolean>(false);
  const [isCustomTime, setIsCustomTime] = useState<boolean>(false);
  const { loadMetrics } = useDataLoading();
  const dispatch = useDispatch();

  const liveEnabled = useTypedSelector(
    (s) =>
      s.gameServerMetricsSliceReducer.data[props.gameServer.uuid]?.enableMetricsLiveUpdates ?? true,
  );

  const handleLiveMetrics = (enableLiveMetrics: boolean) => {
    dispatch(
      gameServerMetricsSliceActions.setEnableMetricsLiveUpdates({
        gameServerUuid: props.gameServer.uuid,
        enable: enableLiveMetrics,
      }),
    );
  };

  const handleTimeChange = async (startTime: Date, endTime?: Date) => {
    if (!startTime) return;
    const isToday = !endTime || endTime.getDate() === new Date().getDate();
    setIsCustomTime(!isToday);
    handleLiveMetrics(isToday);

    setLoading(true);
    try {
      await loadMetrics(props.gameServer.uuid, startTime, endTime);
    } finally {
      setLoading(false);
    }
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
            handleTimeChange(selectedStartTime, selectedEndTime);
          }}
        />
        <Button disabled={isCustomTime} onClick={() => handleLiveMetrics(!liveEnabled)}>
          {liveEnabled ? t("metrics.liveMetricsOn") : t("metrics.liveMetricsOff")}
        </Button>
      </div>
      {loading && (
        <div className="absolute z-10 flex justify-center items-center w-[80%] h-[80%] backdrop-blur-sm">
          <div className="flex flex-col gap-2">
            <img src={spinner} alt="spinner" />
            <div className="flex justify-center text-xl">{t("signIn.loading")}</div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-6 gap-2">
        {props.gameServer.metric_layout?.map((metric) => (
          <MetricGraph
            key={metric.metric_type}
            className={`col-span-${metric.size}`}
            metrics={props.metrics}
            type={metric.metric_type ?? MetricsType.CPU_PERCENT}
            timeUnit={unit}
            loading={loading}
          />
        ))}
      </div>
    </>
  );
};

export default MetricDisplay;
