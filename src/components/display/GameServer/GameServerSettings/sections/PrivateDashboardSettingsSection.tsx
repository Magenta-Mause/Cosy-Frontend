import MetricDropDown from "@components/display/DropDown/MetricDropDown";
import WidgetDropDown from "@components/display/DropDown/WidgetDropDown";
import { Button } from "@components/ui/button";
import { SquarePen } from "lucide-react";
import { useMemo, useState } from "react";
import { v7 as generateUuid } from "uuid";
import {
  type GameServerDto,
  MetricLayoutSize,
  type PrivateDashboardLayout,
  PrivateDashboardLayoutPrivateDashboardTypes,
} from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { MetricsType } from "@/types/metricsTyp";
import type { PrivateDashboardLayoutUI } from "@/types/privateDashboard";
import GenericLayoutSelection from "./GenericLayoutSelection/GenericLayoutSelection";

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

  const handleTypeSelect = (type: PrivateDashboardLayoutPrivateDashboardTypes, uuid?: string) => {
    if (!uuid) return;

    setPrivateDashboard(
      privateDashboard.map((dashboard) =>
        dashboard._uiUuid === uuid ? { ...dashboard, private_dashboard_types: type } : dashboard,
      ),
    );
  };

  const handleMetricTypeChange = (type: MetricsType, uuid?: string) => {
    if (!uuid) return;

    setPrivateDashboard(
      privateDashboard.map((dashboard) =>
        dashboard._uiUuid === uuid ? { ...dashboard, metric_type: type } : dashboard,
      ),
    );
  };

  const newWidget = wrapPrivateDashboard({
    private_dashboard_types: PrivateDashboardLayoutPrivateDashboardTypes.METRIC,
    metric_type: MetricsType.CPU_PERCENT,
    size: MetricLayoutSize.MEDIUM,
  });

  return (
    <>
      <h2>{t("GameServerSettings.sections.privateDashboard")}</h2>
      <GenericLayoutSelection<PrivateDashboardLayoutUI>
        gameServer={gameServer}
        layoutSection="private_dashboard_layouts"
        isChanged={isChanged}
        layouts={privateDashboard}
        setLayouts={setPrivateDashboard}
        wrapper={wrapPrivateDashboards}
        defaultAddNew={newWidget}
      >
        {(dashboard) => (
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
            {dashboard.private_dashboard_types ===
              PrivateDashboardLayoutPrivateDashboardTypes.FREETEXT && (
                <Button variant={"secondary"}>
                  <SquarePen className="size-6" />
                </Button>
              )}
          </div>
        )}
      </GenericLayoutSelection>
    </>
  );
}
