import MetricDropDown from "@components/display/DropDown/MetricDropDown";
import WidgetDropDown from "@components/display/DropDown/WidgetDropDown";
import { Button } from "@components/ui/button";
import { SquarePen } from "lucide-react";
import { useMemo, useState } from "react";
import { v7 as generateUuid } from "uuid";
import { updatePrivateDashboard } from "@/api/generated/backend-api";
import {
  type GameServerDto,
  MetricLayoutSize,
  type PrivateDashboardLayout,
} from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { DashboardTypes } from "@/types/dashboardTypes";
import { LayoutSize } from "@/types/layoutSize.ts";
import { MetricsType } from "@/types/metricsTyp";
import type { PrivateDashboardLayoutUI } from "@/types/privateDashboard";
import GenericLayoutSelection from "../GenericLayoutBuilder/GenericLayoutBuilder";
import FreeTextModal from "./FreeTextModal";

const wrapPrivateDashboard = (dashboard: PrivateDashboardLayout): PrivateDashboardLayoutUI => ({
  ...dashboard,
  _uiUuid: dashboard.uuid ?? generateUuid(),
});

const wrapPrivateDashboards = (dashboard: PrivateDashboardLayout[]): PrivateDashboardLayoutUI[] =>
  dashboard.map(wrapPrivateDashboard);

export default function PrivateDashboardSettingsSection(props: { gameServer: GameServerDto }) {
  const { gameServer } = props;
  const { t } = useTranslationPrefix("components");
  const [privateDashboard, setPrivateDashboard] = useState<PrivateDashboardLayoutUI[]>(() =>
    wrapPrivateDashboards(gameServer.private_dashboard_layouts),
  );
  const [freeText, setFreeText] = useState<PrivateDashboardLayoutUI | null>(null);
  const [unfulfilledChanges, setUnfulfilledChanges] = useState<string | null>(null);

  const isChanged = useMemo(() => {
    if (privateDashboard.length !== gameServer.private_dashboard_layouts.length) return true;

    return privateDashboard.some((dashboard, i) => {
      const original = gameServer.private_dashboard_layouts[i];
      return (
        dashboard.size !== original.size ||
        dashboard.metric_type !== original.metric_type ||
        dashboard.content !== original.content ||
        dashboard.title !== original.title ||
        dashboard.private_dashboard_types !== original.private_dashboard_types ||
        JSON.stringify(dashboard.content ?? []) !== JSON.stringify(original.content ?? [])
      );
    });
  }, [gameServer.private_dashboard_layouts, privateDashboard]);

  const isModalChanged = useMemo(() => {
    if (!freeText) return false;

    const original = privateDashboard.find((d) => d._uiUuid === freeText._uiUuid);

    if (!original) return false;

    return (
      freeText.title !== original.title ||
      JSON.stringify(freeText.content ?? []) !== JSON.stringify(original.content ?? [])
    );
  }, [freeText, privateDashboard]);

  const sanitizePrivateDashboardLayout = (
    layout: PrivateDashboardLayoutUI,
    type: DashboardTypes,
  ): PrivateDashboardLayoutUI => {
    const layoutObject: PrivateDashboardLayoutUI = {
      _uiUuid: layout._uiUuid,
      private_dashboard_types: type,
      size: layout.size ?? LayoutSize.MEDIUM,
      uuid: layout.uuid,
      valid: true,
    };

    if (type === DashboardTypes.METRIC) {
      layoutObject.metric_type = layout.metric_type ?? MetricsType.CPU_PERCENT;
    }

    if (type === DashboardTypes.FREETEXT) {
      layoutObject.content = layout.content ?? [{ key: "", value: "" }];
      layoutObject.title = layout.title ?? "";
    }

    return layoutObject;
  };

  const handleTypeSelect = (type: DashboardTypes, uuid?: string) => {
    if (!uuid) return;

    setPrivateDashboard((prev) =>
      prev.map((dashboard) =>
        dashboard._uiUuid === uuid ? sanitizePrivateDashboardLayout(dashboard, type) : dashboard,
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

  const handleModalConfirm = () => {
    if (!freeText) return;

    setPrivateDashboard((prev) =>
      prev.map((dashboard) =>
        dashboard._uiUuid === freeText._uiUuid
          ? { ...dashboard, content: freeText.content, title: freeText.title }
          : dashboard,
      ),
    );
    setFreeText(null);
  };

  const handleFreeTextEdit = (dashboard: PrivateDashboardLayoutUI) => {
    const normalized =
      dashboard.content?.map((item) => ({
        key: item.key ?? "",
        value: item.value ?? "",
      })) ?? [];

    setFreeText({
      ...dashboard,
      content: normalized.length > 0 ? normalized : [{ key: "", value: "" }],
    });
  };

  const newWidget = wrapPrivateDashboard({
    private_dashboard_types: DashboardTypes.METRIC,
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
        saveHandler={updatePrivateDashboard}
        setLayouts={setPrivateDashboard}
        wrapper={wrapPrivateDashboards}
        defaultAddNew={newWidget}
        unfulfilledChanges={unfulfilledChanges}
        setUnfulfilledChanges={setUnfulfilledChanges}
      >
        {(dashboard) => (
          <>
            <div className="flex gap-2">
              <WidgetDropDown
                widgetType={dashboard.private_dashboard_types}
                setWidgetType={(type) => {
                  handleTypeSelect(type, dashboard._uiUuid);
                }}
              />
              {dashboard.private_dashboard_types === DashboardTypes.METRIC && (
                <MetricDropDown
                  className="flex-1"
                  metricType={dashboard.metric_type || MetricsType.CPU_PERCENT}
                  setMetricType={(type) => handleMetricTypeChange(type, dashboard._uiUuid)}
                />
              )}
              {dashboard.private_dashboard_types === DashboardTypes.FREETEXT && (
                <Button variant={"secondary"} onClick={() => handleFreeTextEdit(dashboard)}>
                  <SquarePen className="size-6" />
                </Button>
              )}
            </div>
          </>
        )}
      </GenericLayoutSelection>
      <FreeTextModal
        freeText={freeText}
        setFreeText={setFreeText}
        handleModalConfirm={handleModalConfirm}
        isModalChanged={isModalChanged}
        errorText={unfulfilledChanges}
      />
    </>
  );
}
