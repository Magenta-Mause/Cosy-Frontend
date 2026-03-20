import { Badge } from "@components/ui/badge.tsx";
import { Button } from "@components/ui/button.tsx";
import { Checkbox } from "@components/ui/checkbox.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select.tsx";
import { Label } from "@radix-ui/react-label";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { UserEntityDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { useTypedSelector } from "@/stores/rootReducer";

const UpdateUserRestrictionsModal = (props: {
  user: UserEntityDto;
  open: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslationPrefix("components.userManagement.admin.updateRestrictionsDialog");
  const { t: t_restrictions } = useTranslationPrefix("userRestrictions");
  const { t: t_root } = useTranslation();
  const { updateUserRestrictions } = useDataInteractions();

  const mcRouterConfig = useTypedSelector(
    (state) => state.cosyInstanceSettingsSliceReducer.settings?.mc_router_configuration,
  );
  const isMcRouterEnabled = mcRouterConfig?.enabled ?? false;
  const availableDomains = mcRouterConfig?.domains ?? [];

  const [allowGameServerCreation, setAllowGameServerCreation] = useState(true);
  const [mcRouterAllowAllDomains, setMcRouterAllowAllDomains] = useState(true);
  const [mcRouterAllowedDomains, setMcRouterAllowedDomains] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (props.open) {
      setAllowGameServerCreation(props.user.allow_game_server_creation ?? true);
      setMcRouterAllowAllDomains(props.user.mc_router_allow_all_domains ?? true);
      setMcRouterAllowedDomains(props.user.mc_router_allowed_domains ?? []);
      setSubmitError(null);
    }
  }, [props.open, props.user]);

  const handleClose = () => {
    setSubmitError(null);
    props.onClose();
  };

  const handleSubmit = async () => {
    if (!props.user.uuid) return;

    setSubmitError(null);
    setIsPending(true);
    try {
      await updateUserRestrictions(props.user.uuid, {
        port_restrictions_enabled: props.user.port_restrictions_enabled ?? false,
        allowed_ports: props.user.allowed_ports ?? [],
        allow_game_server_creation: allowGameServerCreation,
        mc_router_allow_all_domains: mcRouterAllowAllDomains,
        mc_router_allowed_domains: mcRouterAllowedDomains,
      });
      handleClose();
    } catch {
      setSubmitError(t("submitError"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={handleClose}>
      <DialogContent className="min-w-128">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogMain>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="restrictions-allow-game-server-creation"
                checked={allowGameServerCreation}
                onCheckedChange={(checked) => setAllowGameServerCreation(checked === true)}
              />
              <div>
                <Label htmlFor="restrictions-allow-game-server-creation" className="text-sm">
                  {t_restrictions("gameServerCreation.allowed")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t_restrictions("gameServerCreation.allowedDescription")}
                </p>
              </div>
            </div>

            {isMcRouterEnabled && (
              <div className="space-y-3 border-t pt-4">
                <Label className="font-bold text-sm">
                  {t_root("userRestrictions.mcRouter.allowAllDomains")}
                </Label>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="restrictions-mc-router-allow-all"
                    checked={mcRouterAllowAllDomains}
                    onCheckedChange={(checked) => setMcRouterAllowAllDomains(checked === true)}
                  />
                  <div>
                    <Label htmlFor="restrictions-mc-router-allow-all" className="text-sm">
                      {t_restrictions("mcRouter.allowAllDomains")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t_restrictions("mcRouter.allowAllDomainsDescription")}
                    </p>
                  </div>
                </div>

                {!mcRouterAllowAllDomains && (
                  <div className="space-y-2 pl-6">
                    <Label className="text-sm">
                      {t_restrictions("mcRouter.allowedDomains")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t_restrictions("mcRouter.allowedDomainsDescription")}
                    </p>
                    <div className="flex gap-2">
                      <Select
                        value=""
                        onValueChange={(domain) => {
                          if (domain && !mcRouterAllowedDomains.includes(domain)) {
                            setMcRouterAllowedDomains((prev) => [...prev, domain]);
                          }
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue
                            placeholder={t_restrictions("mcRouter.allowedDomainsPlaceholder")}
                          />
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
                              setMcRouterAllowedDomains((prev) =>
                                prev.filter((d) => d !== domain),
                              )
                            }
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogMain>
        <DialogFooter>
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          <Button variant="secondary" onClick={handleClose}>
            {t("cancelButton")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {t("confirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateUserRestrictionsModal;
