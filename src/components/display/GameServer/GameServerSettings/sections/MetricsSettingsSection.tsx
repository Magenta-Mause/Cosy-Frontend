import MetricDropDown from "@components/display/DropDown/MetricDropDown";
import SizeDropDown from "@components/display/DropDown/SizeDropDown";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { v7 as generateUuid } from "uuid";
import { updateMetricLayout } from "@/api/generated/backend-api";
import type { GameServerDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice";
import { MetricsType } from "@/types/metricsTyp";

interface MetricSetting {
  gameServer: GameServerDto;
}

const COL_SPAN_MAP: Record<number, string> = {
  2: "col-span-2",
  3: "col-span-3",
  6: "col-span-6",
};

export default function MetricsSettingsSection(props: MetricSetting) {
  const { gameServer } = props;
  const { t: tSetting } = useTranslationPrefix("components.GameServerSettings");
  const { t: tButtons } = useTranslationPrefix("components.editGameServer");
  const [isChanged, setIsChanged] = useState(false);
  const [metricLayoutState, setMetricLayoutState] = useState(gameServer.metric_layout || []);
  const dispatch = useDispatch();

  const handleConfirm = () => {
    const updatedServer: GameServerDto = {
      ...gameServer,
      metric_layout: metricLayoutState,
    };

    dispatch(gameServerSliceActions.updateGameServer(updatedServer));
    updateMetricLayout(gameServer.uuid, metricLayoutState).then(() => {
      setIsChanged(false);
    });
  };

  const handleWidthSelect = (size: number, uuid?: string) => {
    if (!uuid) return;
    setIsChanged(true);

    setMetricLayoutState(
      metricLayoutState.map((metric) =>
        metric.uuid === uuid ? { ...metric, size: size } : metric,
      ),
    );
  };

  const handleOnDelete = (uuid?: string) => {
    if (!uuid) return;
    setIsChanged(true);

    setMetricLayoutState(metricLayoutState.filter((metric) => metric.uuid !== uuid));
  };

  const handleOnAdd = () => {
    setIsChanged(true);
    /* Default to CPU_PERCENT when adding a new metric */
    const newMetric = {
      uuid: generateUuid(),
      metric_type: MetricsType.CPU_PERCENT,
      size: 3,
    };

    setMetricLayoutState([...metricLayoutState, newMetric]);
  };

  const handleMetricTypeChange = (type: MetricsType, uuid?: string) => {
    if (!uuid) return;
    setIsChanged(true);

    setMetricLayoutState(
      metricLayoutState.map((metric) =>
        metric.uuid === uuid ? { ...metric, metric_type: type } : metric,
      ),
    )
  };

  return (
    <>
      <h2>{tSetting("sections.metrics")}</h2>
      <div className="flex w-full pt-3">
        <Card className="w-full h-[65vh]">
          <CardContent className="grid grid-cols-6 gap-4 overflow-scroll p-6">
            {metricLayoutState.map((metric) => (
              <Card
                key={metric.uuid}
                className={`relative border border-primary-border rounded-md 
                w-full h-[16vh] justify-center ${COL_SPAN_MAP[metric.size ?? 6]}`}
              >
                <Button
                  variant={"destructive"}
                  className={
                    "flex justify-center items-center w-6 h-6 rounded-full absolute top-0 right-0 -mr-3 -mt-2"
                  }
                  onClick={() => handleOnDelete(metric.uuid)}
                >
                  <X />
                </Button>
                <div className="flex gap-2 items-center justify-center">
                  <div>
                    <span className="flex items-start text-lg">{tSetting("metrics.type")}</span>
                    <span className="flex items-start text-lg">{tSetting("metrics.width")}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <MetricDropDown
                      className="w-full"
                      metricType={metric.metric_type}
                      setMetricType={(type) => handleMetricTypeChange(type, metric.uuid)}
                    />
                    <SizeDropDown metric={metric} handleWidthSelect={handleWidthSelect} />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              onClick={handleOnAdd}
              className="border-4 border-dashed h-[16vh] col-span-3
            flex items-center justify-center  
          bg-[#3E8EDE]/50 border-[#3E8EDE] text-[#3E8EDE] 
          hover:bg-[#3E8EDE]/60 active:bg-[#3E8EDE]/40"
            >
              <div className="flex items-center">
                <Plus />
                {tSetting("metrics.add")}
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="fixed right-[10%] mt-3 w-fit ml-auto flex gap-4">
        <Button
          className="h-12.5"
          variant="secondary"
          disabled={!isChanged}
          onClick={() => {
            setMetricLayoutState(gameServer.metric_layout || []);
          }}
        >
          {tButtons("revert")}
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          className="h-12.5"
          disabled={!isChanged}
        >
          {tButtons("confirm")}
        </Button>
      </div>
    </>
  );
}
