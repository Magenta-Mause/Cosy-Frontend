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
import { DashboardElementTypes } from "@/types/dashboardTypes";
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
  const publicDashboard = gameServer.public_dashboard ?? {
    publicDashboardEnabled: false,
    publicDashboardLayouts: [],
  };
  const { t } = useTranslationPrefix("components");
  const [publicDashboardLayout, setPublicDashboardLayout] = useState<PublicDashboardLayoutUI[]>(
    () => wrapPublicDashboards(publicDashboard.public_dashboard_layouts || []),
  );
  const [freeText, setFreeText] = useState<PublicDashboardLayoutUI | null>(null);
  const [unfulfilledChanges, setUnfulfilledChanges] = useState<string | null>(null);
  const [checked, setChecked] = useState(publicDashboard.public_dashboard_enabled);

  const isChanged = useMemo(() => {
    const originalLayouts = publicDashboard.public_dashboard_layouts ?? [];

    if (publicDashboardLayout.length !== originalLayouts.length) return true;

    return publicDashboardLayout.some((dashboard, i) => {
      const original = originalLayouts[i];
      return (
        publicDashboard.public_dashboard_enabled !== checked ||
        dashboard.size !== original.size ||
        dashboard.metric_type !== original.metric_type ||
        dashboard.content !== original.content ||
        dashboard.title !== original.title ||
        dashboard.public_dashboard_types !== original.public_dashboard_types ||
        JSON.stringify(dashboard.content ?? []) !== JSON.stringify(original.content ?? [])
      );
    });
  }, [
    publicDashboardLayout,
    publicDashboard.public_dashboard_enabled,
    publicDashboard.public_dashboard_layouts,
    checked,
  ]);

  const isModalChanged = useMemo(() => {
    if (!freeText) return false;

    const original = publicDashboardLayout.find((d) => d._uiUuid === freeText._uiUuid);

    if (!original) return false;

    return (
      freeText.title !== original.title ||
      JSON.stringify(freeText.content ?? []) !== JSON.stringify(original.content ?? [])
    );
  }, [freeText, publicDashboardLayout]);

  const sanitizePrivateDashboardLayout = (
    layout: PublicDashboardLayoutUI,
    type: DashboardElementTypes,
  ): PublicDashboardLayoutUI => {
    const layoutObject: PublicDashboardLayoutUI = {
      _uiUuid: layout._uiUuid,
      public_dashboard_types: type,
      size: layout.size ?? LayoutSize.MEDIUM,
      uuid: layout.uuid,
      valid: true,
    };

    if (type === DashboardElementTypes.METRIC) {
      layoutObject.metric_type = layout.metric_type ?? MetricsType.CPU_PERCENT;
    }

    if (type === DashboardElementTypes.FREETEXT) {
      layoutObject.content = layout.content ?? [{ key: "", value: "" }];
      layoutObject.title = layout.title ?? "";
    }

    return layoutObject;
  };

  const handleTypeSelect = (type: DashboardElementTypes, uuid?: string) => {
    if (!uuid) return;

    setPublicDashboardLayout((prev) =>
      prev.map((dashboard) =>
        dashboard._uiUuid === uuid ? sanitizePrivateDashboardLayout(dashboard, type) : dashboard,
      ),
    );
  };

  const handleMetricTypeChange = (type: MetricsType | string, uuid?: string) => {
    if (!uuid) return;

    setPublicDashboardLayout(
      publicDashboardLayout.map((dashboard) =>
        dashboard._uiUuid === uuid ? { ...dashboard, metric_type: type } : dashboard,
      ),
    );
  };

  const handleModalConfirm = () => {
    if (!freeText) return;

    setPublicDashboardLayout((prev) =>
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
    public_dashboard_types: DashboardElementTypes.METRIC,
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
          <FieldLabel>{t("GameServerSettings.publicDashboard.label")}</FieldLabel>
        </Field>
      </FieldGroup>
      <GenericLayoutSelection<PublicDashboardLayoutUI>
        gameServer={gameServer}
        layoutSection="public_dashboard_layouts"
        isChanged={isChanged}
        layouts={publicDashboardLayout}
        saveHandler={updatePublicDashboardLayout}
        setLayouts={setPublicDashboardLayout}
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
                className={`${checked ? "" : "pointer-events-none"}`}
                widgetType={dashboard.public_dashboard_types}
                setWidgetType={(type) => {
                  handleTypeSelect(type, dashboard._uiUuid);
                }}
              />
              {dashboard.public_dashboard_types === DashboardElementTypes.METRIC && (
                <MetricDropDown
                  className={`flex-1 ${checked ? "" : "pointer-events-none"}`}
                  metricType={dashboard.metric_type || MetricsType.CPU_PERCENT}
                  setMetricType={(type) => handleMetricTypeChange(type, dashboard._uiUuid)}
                />
              )}
              {dashboard.public_dashboard_types === DashboardElementTypes.FREETEXT && (
                <Button
                  className={`${checked ? "" : "pointer-events-none"}`}
                  variant={"secondary"}
                  onClick={() => handleFreeTextEdit(dashboard)}
                >
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
