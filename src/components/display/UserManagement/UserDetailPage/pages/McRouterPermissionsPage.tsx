import { Badge } from "@components/ui/badge.tsx";
import { Button } from "@components/ui/button.tsx";
import { Checkbox } from "@components/ui/checkbox.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select.tsx";
import { Label } from "@radix-ui/react-label";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserEntityDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { cn } from "@/lib/utils";
import { useTypedSelector } from "@/stores/rootReducer";

const McRouterPermissionsPage = ({
  user,
  onUnsavedChange,
}: {
  user: UserEntityDto;
  onUnsavedChange?: (dirty: boolean) => void;
}) => {
  const { t } = useTranslationPrefix("userRestrictions.mcRouter");
  const { t: tModal } = useTranslationPrefix("userSettingsModal");
  const { t: tRestrictions } = useTranslationPrefix("userRestrictions");
  const { updateUserRestrictions } = useDataInteractions();

  const mcRouterConfig = useTypedSelector(
    (state) => state.cosyInstanceSettingsSliceReducer.settings?.mc_router_configuration,
  );
  const isMcRouterEnabled = mcRouterConfig?.enabled ?? false;
  const availableDomains = mcRouterConfig?.domains ?? [];

  const [mcRouterAllowAllDomains, setMcRouterAllowAllDomains] = useState(
    user.mc_router_allow_all_domains ?? true,
  );
  const [mcRouterAllowedDomains, setMcRouterAllowedDomains] = useState<string[]>(
    user.mc_router_allowed_domains ?? [],
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setMcRouterAllowAllDomains(user.mc_router_allow_all_domains ?? true);
    setMcRouterAllowedDomains(user.mc_router_allowed_domains ?? []);
    setSubmitError(null);
  }, [user]);

  const hasChanges =
    mcRouterAllowAllDomains !== (user.mc_router_allow_all_domains ?? true) ||
    JSON.stringify(mcRouterAllowedDomains) !== JSON.stringify(user.mc_router_allowed_domains ?? []);

  useEffect(() => {
    onUnsavedChange?.(hasChanges);
  }, [hasChanges, onUnsavedChange]);

  const handleRevert = () => {
    setMcRouterAllowAllDomains(user.mc_router_allow_all_domains ?? true);
    setMcRouterAllowedDomains(user.mc_router_allowed_domains ?? []);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!user.uuid) return;

    setSubmitError(null);
    setIsPending(true);
    try {
      await updateUserRestrictions(user.uuid, {
        port_restrictions_enabled: user.port_restrictions_enabled ?? false,
        allowed_ports: user.allowed_ports ?? [],
        allow_game_server_creation: user.allow_game_server_creation ?? true,
        mc_router_allow_all_domains: mcRouterAllowAllDomains,
        mc_router_allowed_domains: mcRouterAllowedDomains,
      });
    } catch {
      setSubmitError(tModal("submitError"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto pt-8 pr-5 pl-2">
      <div className="space-y-6 grow min-h-full">
        <div>
          <h2 className="text-xl font-bold">{t("title")}</h2>
        </div>

        <div className={cn("space-y-3", !isMcRouterEnabled && "opacity-50 pointer-events-none")}>
          <div className="flex items-center gap-3">
            <Checkbox
              id="mc-router-allow-all"
              className="mb-2.5"
              disabled={!isMcRouterEnabled}
              checked={mcRouterAllowAllDomains}
              onCheckedChange={(checked) => setMcRouterAllowAllDomains(checked === true)}
            />
            <div>
              <Label htmlFor="mc-router-allow-all" className="text-sm">
                {t("allowAllDomains")}
              </Label>
              <p className="text-xs text-muted-foreground">{t("allowAllDomainsDescription")}</p>
            </div>
          </div>

          <div
            className={cn(
              "space-y-2 pl-6",
              (mcRouterAllowAllDomains || !isMcRouterEnabled) && "opacity-50 pointer-events-none",
            )}
          >
            <Label className="text-sm">{t("allowedDomains")}</Label>
            <p className="text-xs text-muted-foreground">{t("allowedDomainsDescription")}</p>
            <div className="flex gap-2">
              <Select
                value=""
                disabled={mcRouterAllowAllDomains || !isMcRouterEnabled}
                onValueChange={(domain) => {
                  if (domain && !mcRouterAllowedDomains.includes(domain)) {
                    setMcRouterAllowedDomains((prev) => [...prev, domain]);
                  }
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t("allowedDomainsPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {availableDomains
                    .filter((d) => !mcRouterAllowedDomains.includes(d))
                    .map((domain) => (
                      <SelectItem value={domain} key={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              {mcRouterAllowedDomains.map((domain) => (
                <Badge key={domain} variant="secondary" className="gap-1">
                  {domain}
                  <button
                    type="button"
                    onClick={() =>
                      setMcRouterAllowedDomains((prev) => prev.filter((d) => d !== domain))
                    }
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {!isMcRouterEnabled && (
          <p className="text-xs text-muted-foreground italic">
            {tRestrictions("mcRouter.disabledHint")}
          </p>
        )}
      </div>

      <div className="sticky bottom-4 w-fit ml-auto flex items-center gap-4 mr-5 mt-auto">
        {submitError && <p className="text-base text-destructive">{submitError}</p>}
        <Button variant="secondary" onClick={handleRevert} disabled={isPending || !hasChanges}>
          {tModal("revert")}
        </Button>
        <Button onClick={handleSubmit} disabled={isPending || !hasChanges || !isMcRouterEnabled}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {tModal("save")}
        </Button>
      </div>
    </div>
  );
};

export default McRouterPermissionsPage;
