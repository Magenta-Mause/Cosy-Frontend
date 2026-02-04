import MetricDropDown from "@components/display/DropDown/MetricDropDown";
import SizeDropDown from "@components/display/DropDown/SizeDropDown";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { X } from "lucide-react";
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

export default function MetricsSettingsSection(props: MetricSetting) {
  const { gameServer } = props;
  const { t: tSetting } = useTranslationPrefix("components.GameServerSettings");
  const { t: tMetrics } = useTranslationPrefix("metrics");
  const [edit, setEdit] = useState<boolean | null>(false);
  const dispatch = useDispatch();

  const updateGameServerSlice = (updateFn: (server: GameServerDto) => GameServerDto) => {
    const updatedServer = updateFn(gameServer);
    dispatch(gameServerSliceActions.updateGameServer(updatedServer));
    updateMetricLayout(updatedServer.uuid, updatedServer.metric_layout || []);
  };

  const handleWidthSelect = (size: number, uuid?: string) => {
    if (!edit || !uuid) return;

    updateGameServerSlice((server) => ({
      ...server,
      metric_layout: server.metric_layout.map((metric) =>
        metric.uuid === uuid ? { ...metric, size: size } : metric,
      ),
    }));
  };

  const handleOnDelete = (uuid?: string) => {
    if (!edit || !uuid) return;

    updateGameServerSlice((server) => ({
      ...server,
      metric_layout: server.metric_layout.filter((metric) => metric.uuid !== uuid),
    }));
  };

  const handleOnAdd = () => {
    /* Default to CPU_PERCENT when adding a new metric */
    const newMetric = {
      uuid: generateUuid(),
      metric_type: MetricsType.CPU_PERCENT,
      size: 6,
    };

    updateGameServerSlice((server) => ({
      ...server,
      metric_layout: [...server.metric_layout, newMetric],
    }));
  };

  const handleMetricTypeChange = (type: MetricsType, uuid?: string) => {
    if (!edit || !uuid) return;

    updateGameServerSlice((server) => ({
      ...server,
      metric_layout: server.metric_layout.map((metric) =>
        metric.uuid === uuid ? { ...metric, metric_type: type } : metric,
      ),
    }));
  };

  const handleConfigure = () => {
    setEdit(!edit);
  };

  return (
    <>
      <h2>{tSetting("sections.metrics")}</h2>
      <div className="flex gap-2 mt-2">
        <Button onClick={handleOnAdd}>{tSetting("metrics.add")}</Button>
        <Button onClick={handleConfigure}>{tMetrics("configure")}</Button>
      </div>
      <div className="flex w-full pt-3">
        <Card className="w-full h-[65vh]">
          <CardContent className="grid grid-cols-6 gap-4 overflow-scroll p-6">
            {gameServer.metric_layout.map((metric) => (
              <Card
                key={metric.uuid}
                className={`relative border border-primary-border rounded-md 
                w-full h-[16vh] justify-center col-span-${metric.size}`}
              >
                <Button
                  variant={"destructive"}
                  className={`
                  flex justify-center items-center w-6 h-6 rounded-full 
                  absolute top-0 right-0 -mr-3 -mt-2 ${edit ? "opacity-100" : "opacity-0"}`}
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
                      disabled={!edit}
                      metricType={metric.metric_type}
                      setMetricType={(type) => handleMetricTypeChange(type, metric.uuid)}
                    />
                    <SizeDropDown
                      edit={edit}
                      metric={metric}
                      handleWidthSelect={handleWidthSelect}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
