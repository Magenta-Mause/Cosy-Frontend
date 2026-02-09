import MetricDropDown from "@components/display/DropDown/MetricDropDown";
import SizeDropDown from "@components/display/DropDown/SizeDropDown";
import { COL_SPAN_MAP } from "@components/display/MetricDisplay/metricLayout";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { v7 as generateUuid } from "uuid";
import { updateMetricLayout } from "@/api/generated/backend-api";
import { type GameServerDto, type MetricLayout, MetricLayoutSize } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice";
import { type MetricLayoutUI, MetricsType } from "@/types/metricsTyp";

interface MetricSetting {
  gameServer: GameServerDto;
}

const wrapMetric = (metric: MetricLayout): MetricLayoutUI => ({
  ...metric,
  _uiUuid: metric.uuid ?? generateUuid(),
});

const wrapMetrics = (metrics: MetricLayout[]): MetricLayoutUI[] =>
  metrics.map(wrapMetric);

export default function MetricsSettingsSection(props: MetricSetting) {
  const { gameServer } = props;
  const { t } = useTranslationPrefix("components");
  const [metricLayoutState, setMetricLayoutState] = useState<MetricLayoutUI[]>(() => wrapMetrics(gameServer.metric_layout));
  const dispatch = useDispatch();

  const isChanged = useMemo(() => {
    if (metricLayoutState.length !== gameServer.metric_layout.length) return true;

    return metricLayoutState.some((metric, i) => {
      const original = gameServer.metric_layout[i];
      return metric.size !== original.size || metric.metric_type !== original.metric_type;
    });
  }, [metricLayoutState, gameServer.metric_layout]);

  const handleConfirm = () => {
    const updatedServer: GameServerDto = {
      ...gameServer,
      metric_layout: metricLayoutState.map(({ _uiUuid, ...metric }) => metric),
    };

    dispatch(gameServerSliceActions.updateGameServer(updatedServer));
    updateMetricLayout(gameServer.uuid, updatedServer.metric_layout);
  };

  const handleWidthSelect = (size: MetricLayoutSize, uuid?: string) => {
    if (!uuid) return;

    setMetricLayoutState(
      metricLayoutState.map((metric) =>
        metric._uiUuid === uuid ? { ...metric, size: size } : metric,
      ),
    );
  };

  const handleOnDelete = (uuid?: string) => {
    if (!uuid) return;

    setMetricLayoutState(metricLayoutState.filter((metric) => metric._uiUuid !== uuid));
  };

  const handleOnAdd = () => {
    /* Default to CPU_PERCENT when adding a new metric */
    const newMetric = wrapMetric({
      metric_type: MetricsType.CPU_PERCENT,
      size: MetricLayoutSize.MEDIUM,
    })

    setMetricLayoutState([...metricLayoutState, newMetric]);
  };

  const handleMetricTypeChange = (type: MetricsType, uuid?: string) => {
    if (!uuid) return;

    setMetricLayoutState(
      metricLayoutState.map((metric) =>
        metric._uiUuid === uuid ? { ...metric, metric_type: type } : metric,
      ),
    );
  };

  return (
    <>
      <h2>{t("GameServerSettings.sections.metrics")}</h2>
      <div className="flex w-full pt-3">
        <Card className="w-full h-[65vh]">
          <CardContent className="grid grid-cols-6 gap-4 overflow-scroll p-6">
            {metricLayoutState.map((metric) => (
              <Card
                key={metric._uiUuid}
                className={`relative border-2 border-primary-border rounded-md bg-background/80
                w-full h-[16vh] justify-center ${COL_SPAN_MAP[metric.size ?? MetricLayoutSize.MEDIUM]}`}
              >
                <Button
                  variant={"destructive"}
                  className={
                    "flex justify-center items-center w-6 h-6 rounded-full absolute top-0 right-0 -mr-3 -mt-2"
                  }
                  onClick={() => handleOnDelete(metric._uiUuid)}
                >
                  <X />
                </Button>
                <div className="flex gap-2 items-center justify-center overflow-x-scroll">
                  <div>
                    <span className="flex text-lg">{t("GameServerSettings.metrics.type")}</span>
                    <span className="flex text-lg">{t("GameServerSettings.metrics.width")}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <MetricDropDown
                      className="w-full"
                      metricType={metric.metric_type}
                      setMetricType={(type) => handleMetricTypeChange(type, metric._uiUuid)}
                    />
                    <SizeDropDown metric={metric} handleWidthSelect={handleWidthSelect} />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              onClick={handleOnAdd}
              variant="secondary"
              className="outline-dashed outline-button-primary-default border-none h-[16vh] col-span-3 flex items-center justify-center shadow-none bg-background/35"
            >
              <div className="flex items-center">
                <Plus className="-size-2" />
                {t("GameServerSettings.metrics.add")}
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
            setMetricLayoutState(wrapMetrics(gameServer.metric_layout));
          }}
        >
          {t("editGameServer.revert")}
        </Button>
        <Button type="button" onClick={handleConfirm} className="h-12.5" disabled={!isChanged}>
          {t("editGameServer.confirm")}
        </Button>
      </div>
    </>
  );
}
