import MetricDropDown from "@components/display/DropDown/MetricDropDown";
import WidgetDropDown from "@components/display/DropDown/WidgetDropDown";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@components/ui/field";
import { SquarePen } from "lucide-react";
import { useMemo, useState } from "react";
import { v7 as generateUuid } from "uuid";
import { updatePublicDashboardLayout } from "@/api/generated/backend-api";
import {
  type GameServerDto,
  MetricLayoutSize,
  type PublicDashboardLayout,
} from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { DashboardTypes } from "@/types/DashboardTypes";
import { LayoutSize } from "@/types/layoutSize";
import { MetricsType } from "@/types/metricsTyp";
import type { PublicDashboardLayoutUI } from "@/types/publicDashboard";
import GenericLayoutSelection from "./GenericLayoutBuilder/GenericLayoutBuilder";
import FreeTextModal from "./PrivateDashboardSetting/FreeTextModal";

const wrapPublicDashboard = (dashboard: PublicDashboardLayout): PublicDashboardLayoutUI => ({
  ...dashboard,
  _uiUuid: dashboard.uuid ?? generateUuid(),
});

const wrapPublicDashboards = (dashboard: PublicDashboardLayout[]): PublicDashboardLayoutUI[] =>
  dashboard.map(wrapPublicDashboard);

export default function PublicDashboardSettingsSection(props: { gameServer: GameServerDto }) {
  const { gameServer } = props;
  const { t } = useTranslationPrefix("components");
  const [publicDashboard, setPublicDashboard] = useState<PublicDashboardLayoutUI[]>(() =>
    wrapPublicDashboards(gameServer.public_dashboard_layouts),
  );
  const [freeText, setFreeText] = useState<PublicDashboardLayoutUI | null>(null);
  const [unfulfilledChanges, setUnfulfilledChanges] = useState<string | null>(null);
  const [checked, setChecked] = useState(gameServer.public_dashboard_enabled ?? false);

  const isChanged = useMemo(() => {
    if (publicDashboard.length !== gameServer.public_dashboard_layouts.length) return true;

    return publicDashboard.some((dashboard, i) => {
      const original = gameServer.public_dashboard_layouts[i];
      return (
        gameServer.public_dashboard_enabled !== checked ||
        dashboard.size !== original.size ||
        dashboard.metric_type !== original.metric_type ||
        dashboard.content !== original.content ||
        dashboard.title !== original.title ||
        dashboard.public_dashboard_types !== original.public_dashboard_types ||
        JSON.stringify(dashboard.content ?? []) !== JSON.stringify(original.content ?? [])
      );
    });
  }, [gameServer.public_dashboard_layouts, publicDashboard, gameServer.public_dashboard_enabled, checked]);

  const isModalChanged = useMemo(() => {
    if (!freeText) return false;

    const original = publicDashboard.find((d) => d._uiUuid === freeText._uiUuid);

    if (!original) return false;

    return (
      freeText.title !== original.title ||
      JSON.stringify(freeText.content ?? []) !== JSON.stringify(original.content ?? [])
    );
  }, [freeText, publicDashboard]);

  const sanitizePrivateDashboardLayout = (
    layout: PublicDashboardLayoutUI,
    type: DashboardTypes,
  ): PublicDashboardLayoutUI => {
    const layoutObject: PublicDashboardLayoutUI = {
      _uiUuid: layout._uiUuid,
      public_dashboard_types: type,
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

    setPublicDashboard((prev) =>
      prev.map((dashboard) =>
        dashboard._uiUuid === uuid ? sanitizePrivateDashboardLayout(dashboard, type) : dashboard,
      ),
    );
  };

  const handleMetricTypeChange = (type: MetricsType, uuid?: string) => {
    if (!uuid) return;

    setPublicDashboard(
      publicDashboard.map((dashboard) =>
        dashboard._uiUuid === uuid ? { ...dashboard, metric_type: type } : dashboard,
      ),
    );
  };

  const handleModalConfirm = () => {
    if (!freeText) return;

    setPublicDashboard((prev) =>
      prev.map((dashboard) =>
        dashboard._uiUuid === freeText._uiUuid
          ? { ...dashboard, content: freeText.content, title: freeText.title }
          : dashboard,
      ),
    );
    setFreeText(null);
  };

  const handleFreeTextEdit = (dashboard: PublicDashboardLayoutUI) => {
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

  const newWidget = wrapPublicDashboard({
    public_dashboard_types: DashboardTypes.METRIC,
    metric_type: MetricsType.CPU_PERCENT,
    size: MetricLayoutSize.MEDIUM,
  });

  return (
    <>
      <h2>{t("GameServerSettings.sections.publicDashboard")}</h2>
      <FieldGroup className="my-1">
        <Field orientation={"horizontal"}>
          <Checkbox
            checked={checked}
            onCheckedChange={(checked) => {
              if (checked === "indeterminate") return;
              setChecked(checked);
            }}
          />
          <FieldLabel>Make Visable</FieldLabel>
        </Field>
      </FieldGroup>
      <GenericLayoutSelection<PublicDashboardLayoutUI>
        gameServer={gameServer}
        layoutSection="public_dashboard_layouts"
        isChanged={isChanged}
        layouts={publicDashboard}
        saveHandler={updatePublicDashboardLayout}
        setLayouts={setPublicDashboard}
        wrapper={wrapPublicDashboards}
        defaultAddNew={newWidget}
        unfulfilledChanges={unfulfilledChanges}
        setUnfulfilledChanges={setUnfulfilledChanges}
        publicIsEnabled={checked}
      >
        {(dashboard) => (
          <>
            <div className={"flex gap-2"}>
              <WidgetDropDown
                widgetType={dashboard.public_dashboard_types}
                setWidgetType={(type) => {
                  handleTypeSelect(type, dashboard._uiUuid);
                }}
              />
              {dashboard.public_dashboard_types === DashboardTypes.METRIC && (
                <MetricDropDown
                  className="flex-1"
                  metricType={dashboard.metric_type || MetricsType.CPU_PERCENT}
                  setMetricType={(type) => handleMetricTypeChange(type, dashboard._uiUuid)}
                />
              )}
              {dashboard.public_dashboard_types === DashboardTypes.FREETEXT && (
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
