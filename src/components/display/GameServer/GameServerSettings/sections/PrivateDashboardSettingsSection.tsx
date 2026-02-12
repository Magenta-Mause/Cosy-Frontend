import MetricDropDown from "@components/display/DropDown/MetricDropDown";
import SizeDropDown from "@components/display/DropDown/SizeDropDown";
import WidgetDropDown from "@components/display/DropDown/WidgetDropDown";
import { COL_SPAN_MAP } from "@components/display/MetricDisplay/metricLayout";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { v7 as generateUuid } from "uuid";
import { updatePrivateDashboard } from "@/api/generated/backend-api";
import {
  type GameServerDto,
  MetricLayoutSize,
  type PrivateDashboardLayout,
  PrivateDashboardLayoutPrivateDashboardTypes,
} from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice";
import { MetricsType } from "@/types/metricsTyp";
import type { PrivateDashboardLayoutUI } from "@/types/privateDashboard";

const wrapPrivateDashboard = (dashboard: PrivateDashboardLayout): PrivateDashboardLayoutUI => ({
  ...dashboard,
  _uiUuid: dashboard.uuid ?? generateUuid(),
});

const wrapPrivateDashboards = (dashboard: PrivateDashboardLayout[]): PrivateDashboardLayoutUI[] =>
  dashboard.map(wrapPrivateDashboard);

export default function PrivateDashboardSettingsSection(props: { gameServer: GameServerDto }) {
  const { gameServer } = props;
  const { t } = useTranslationPrefix("components");
  const [privateDashboard, setPrivateDashboard] = useState<PrivateDashboardLayoutUI[] | []>(() =>
    wrapPrivateDashboards(gameServer.private_dashboard_layouts ?? []),
  );
  const dispatch = useDispatch();

  const isChanged = useMemo(() => {
    if (privateDashboard.length !== gameServer.private_dashboard_layouts.length) return true;

    return privateDashboard.some((dashboard, i) => {
      const original = gameServer.private_dashboard_layouts[i];
      return (
        dashboard.size !== original.size ||
        dashboard.metric_type !== original.metric_type ||
        dashboard.content !== original.content ||
        dashboard.title !== original.title ||
        dashboard.private_dashboard_types !== original.private_dashboard_types
      );
    });
  }, [gameServer.private_dashboard_layouts, privateDashboard]);

  const handleConfirm = () => {
    const updatedServer: GameServerDto = {
      ...gameServer,
      private_dashboard_layouts: privateDashboard.map(
        ({ _uiUuid, ...privateDashboard }) => privateDashboard,
      ),
    };

    dispatch(gameServerSliceActions.updateGameServer(updatedServer));
    updatePrivateDashboard(gameServer.uuid, updatedServer.private_dashboard_layouts);
  };

  const handleTypeSelect = (type: PrivateDashboardLayoutPrivateDashboardTypes, uuid?: string) => {
    if (!uuid) return;

    setPrivateDashboard(
      privateDashboard.map((dashboard) =>
        dashboard._uiUuid === uuid ? { ...dashboard, private_dashboard_types: type } : dashboard,
      ),
    );
  };

  const handleWidthSelect = (size: MetricLayoutSize, uuid?: string) => {
    if (!uuid) return;

    setPrivateDashboard(
      privateDashboard.map((dashboard) =>
        dashboard._uiUuid === uuid ? { ...dashboard, size: size } : dashboard,
      ),
    );
  };

  const handleOnDelete = (uuid?: string) => {
    if (!uuid) return;

    setPrivateDashboard(privateDashboard.filter((dashboard) => dashboard._uiUuid !== uuid));
  };

  const handleOnAdd = () => {
    /* Default to CPU_PERCENT when adding a new metric */
    const newWidget = wrapPrivateDashboard({
      private_dashboard_types: PrivateDashboardLayoutPrivateDashboardTypes.METRIC,
      metric_type: MetricsType.CPU_PERCENT,
      size: MetricLayoutSize.MEDIUM,
    });

    setPrivateDashboard([...privateDashboard, newWidget]);
  };

  const handleMetricTypeChange = (type: MetricsType, uuid?: string) => {
    if (!uuid) return;

    setPrivateDashboard(
      privateDashboard.map((dashboard) =>
        dashboard._uiUuid === uuid ? { ...dashboard, metric_type: type } : dashboard,
      ),
    );
  };

  return (
    <>
      <h2>{t("GameServerSettings.sections.privateDashboard")}</h2>
      <div className="flex w-full pt-3">
        <Card className="w-full h-[65vh]">
          <CardContent className="grid grid-cols-6 gap-4 overflow-scroll p-6">
            {privateDashboard.map((dashboard) => (
              <Card
                key={dashboard._uiUuid}
                className={`relative border-2 border-primary-border rounded-md bg-background/80
                w-full h-[16vh] justify-center ${COL_SPAN_MAP[dashboard.size ?? MetricLayoutSize.MEDIUM]}`}
              >
                <Button
                  variant={"destructive"}
                  className={
                    "flex justify-center items-center w-6 h-6 rounded-full absolute top-0 right-0 -mr-3 -mt-2"
                  }
                  onClick={() => handleOnDelete(dashboard._uiUuid)}
                >
                  <X />
                </Button>
                <div className="flex gap-2 items-center justify-center overflow-x-scroll">
                  <div>
                    <span className="flex text-lg">{t("GameServerSettings.metrics.type")}</span>
                    <span className="flex text-lg">{t("GameServerSettings.metrics.width")}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <WidgetDropDown
                        widgetType={dashboard.private_dashboard_types}
                        setPrivateDashboard={(type) => handleTypeSelect(type, dashboard._uiUuid)}
                      />
                      {dashboard.private_dashboard_types ===
                        PrivateDashboardLayoutPrivateDashboardTypes.METRIC && (
                          <MetricDropDown
                            className="flex-1"
                            metricType={dashboard.metric_type}
                            setMetricType={(type) => handleMetricTypeChange(type, dashboard._uiUuid)}
                          />
                        )}
                    </div>
                    <SizeDropDown metric={dashboard} handleWidthSelect={handleWidthSelect} />
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
                {t("GameServerSettings.privateDashboard.add")}
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
            setPrivateDashboard(wrapPrivateDashboards(gameServer.private_dashboard_layouts));
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
