import { Badge } from "@components/ui/badge.tsx";
import { Button } from "@components/ui/button.tsx";
import { Checkbox } from "@components/ui/checkbox.tsx";
import { Input } from "@components/ui/input.tsx";
import { Label } from "@components/ui/label.tsx";
import { Loader2, Plus, RefreshCw, X } from "lucide-react";
import type * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { getMcRouterStatus, updateMcRouterConfiguration } from "@/api/cosyInstanceSettingsApi";
import type { McRouterConfigurationUpdateDto, McRouterStatusDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { notificationModal } from "@/lib/notificationModal";
import { cn } from "@/lib/utils";
import { useTypedSelector } from "@/stores/rootReducer";
import { cosyInstanceSettingsSliceActions } from "@/stores/slices/cosyInstanceSettingsSlice";

const McRouterSettingsPage = ({
  onUnsavedChange,
}: {
  onUnsavedChange?: (dirty: boolean) => void;
}) => {
  const { t } = useTranslationPrefix("cosyInstanceSettings.mcRouter");
  const { t: tRoot } = useTranslationPrefix("cosyInstanceSettings");
  const dispatch = useDispatch();

  const storedSettings = useTypedSelector(
    (state) => state.cosyInstanceSettingsSliceReducer.settings,
  );

  const [formData, setFormData] = useState<McRouterConfigurationUpdateDto>({
    enabled: false,
    port: 25565,
    domains: [],
  });
  const [newDomain, setNewDomain] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [routerStatus, setRouterStatus] = useState<McRouterStatusDto | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const originalData = useMemo<McRouterConfigurationUpdateDto>(() => {
    const config = storedSettings?.mc_router_configuration;
    return {
      enabled: config?.enabled ?? false,
      port: config?.port ?? 25565,
      domains: config?.domains ?? [],
    };
  }, [storedSettings]);

  const hasChanges =
    formData.enabled !== originalData.enabled ||
    formData.port !== originalData.port ||
    JSON.stringify(formData.domains) !== JSON.stringify(originalData.domains);

  useEffect(() => {
    onUnsavedChange?.(hasChanges);
  }, [hasChanges, onUnsavedChange]);

  // Load initial data
  useEffect(() => {
    setFormData(originalData);
  }, [originalData]);

  const loadRouterStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const status = await getMcRouterStatus();
      setRouterStatus(status);
      dispatch(cosyInstanceSettingsSliceActions.setMcRouterStatus(status));
    } catch (e) {
      console.error("Failed to load router status", e);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [dispatch]);

  // Load router status on mount
  useEffect(() => {
    loadRouterStatus();
  }, [loadRouterStatus]);

  const handleAddDomain = () => {
    if (newDomain && !formData.domains?.includes(newDomain)) {
      setFormData({
        ...formData,
        domains: [...(formData.domains || []), newDomain],
      });
      setNewDomain("");
    }
  };

  const handleRemoveDomain = (domain: string) => {
    setFormData({
      ...formData,
      domains: formData.domains?.filter((d) => d !== domain) || [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const updatedConfig = await updateMcRouterConfiguration(formData, false);
      dispatch(cosyInstanceSettingsSliceActions.updateMcRouterConfiguration(updatedConfig));
      notificationModal.success({ message: tRoot("saveSuccess") });
      // Reload status after config change
      loadRouterStatus();
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      notificationModal.error({
        message: error?.response?.data?.message || tRoot("saveError"),
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleRevert = () => {
    setFormData(originalData);
  };

  const updateFormData = useCallback((updates: Partial<McRouterConfigurationUpdateDto>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const isDisabled = !formData.enabled;

  return (
    <div className="h-full overflow-y-auto pt-8 pr-5 pl-2">
      <div className="space-y-6 grow min-h-full">
        <div>
          <h2 className="text-xl font-bold">{t("title")}</h2>
          <p className="text-foreground/70 text-sm mt-1">{t("description")}</p>
        </div>

        <form id="mc-router-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-start gap-3 p-4 border border-black/15 rounded-lg bg-black/5">
            <Checkbox
              id="mc-router-enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => updateFormData({ enabled: checked === true })}
              disabled={isPending}
              className="mt-3"
            />
            <div className="flex-1">
              <Label htmlFor="mc-router-enabled" className="text-base font-medium cursor-pointer">
                {t("enabled")}
              </Label>
              <p className="text-sm text-foreground/60 mt-1">{t("enabledDescription")}</p>
            </div>
          </div>

          <div className={cn("space-y-2", isDisabled && "opacity-40 pointer-events-none")}>
            <Input
              type="number"
              header={t("port")}
              value={formData.port}
              onChange={(e) => updateFormData({ port: parseInt(e.target.value, 10) || 25565 })}
              placeholder={t("portPlaceholder")}
              disabled={isPending || isDisabled}
              min={1}
              max={65535}
              className="max-w-xs"
            />
            <p className="text-sm text-foreground/60">{t("portDescription")}</p>
          </div>

          <div className={cn("space-y-3", isDisabled && "opacity-40 pointer-events-none")}>
            <div>
              <Label className="text-base font-medium">{t("domains")}</Label>
              <p className="text-sm text-foreground/60 mt-1">{t("domainsDescription")}</p>
            </div>

            <div className="flex gap-2 max-w-md">
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder={t("domainsPlaceholder")}
                disabled={isPending || isDisabled}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddDomain();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddDomain}
                disabled={isPending || isDisabled || !newDomain}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.domains && formData.domains.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.domains.map((domain) => (
                  <Badge key={domain} variant="secondary" className="gap-1 py-1.5 px-3">
                    {domain}
                    <button
                      type="button"
                      onClick={() => handleRemoveDomain(domain)}
                      disabled={isPending || isDisabled}
                      className="ml-1 hover:text-destructive disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </form>

        <div
          className={cn(
            "border border-black/15 rounded-lg p-5 space-y-3 bg-black/5",
            isDisabled && "opacity-40",
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("status.title")}</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={loadRouterStatus}
              disabled={isLoadingStatus}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn("h-4 w-4", isLoadingStatus && "animate-spin")} />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Status:</span>
            {isLoadingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Badge variant={routerStatus?.running ? "default" : "secondary"}>
                {routerStatus?.running ? t("status.running") : t("status.stopped")}
              </Badge>
            )}
          </div>

          {routerStatus?.container_id && (
            <div className="text-sm text-foreground/60">
              {t("status.containerId")}:{" "}
              <code className="bg-black/10 px-1.5 py-0.5 rounded text-xs">
                {routerStatus.container_id.slice(0, 12)}
              </code>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-4 w-fit ml-auto flex items-center gap-4 mr-5 mt-auto">
        <Button variant="secondary" onClick={handleRevert} disabled={isPending || !hasChanges}>
          {tRoot("revert")}
        </Button>
        <Button type="submit" form="mc-router-form" disabled={isPending || !hasChanges}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {tRoot("save")}
        </Button>
      </div>
    </div>
  );
};

export default McRouterSettingsPage;
