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
  PrivateDashboardLayoutPrivateDashboardTypes,
} from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
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
        saveHandler={updatePrivateDashboard}
        setLayouts={setPrivateDashboard}
        wrapper={wrapPrivateDashboards}
        defaultAddNew={newWidget}
      >
        {(dashboard) => (
          <>
            <div className="flex gap-2">
              <WidgetDropDown
                widgetType={dashboard.private_dashboard_types}
                setPrivateDashboardType={(type) => handleTypeSelect(type, dashboard._uiUuid)}
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
      />
    </>
  );
}
