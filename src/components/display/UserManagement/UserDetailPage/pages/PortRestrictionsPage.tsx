import { Badge } from "@components/ui/badge.tsx";
import { Button } from "@components/ui/button.tsx";
import { Checkbox } from "@components/ui/checkbox.tsx";
import { Input } from "@components/ui/input.tsx";
import { Label } from "@radix-ui/react-label";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserEntityDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { cn } from "@/lib/utils";
import { isValidPortOrRange } from "@/lib/validators/portRestrictionsValidator";

const PortRestrictionsPage = ({
  user,
  onUnsavedChange,
}: {
  user: UserEntityDto;
  onUnsavedChange?: (dirty: boolean) => void;
}) => {
  const { t } = useTranslationPrefix("userRestrictions.portRestrictions");
  const { t: tModal } = useTranslationPrefix("userSettingsModal");
  const { updateUserPortRestrictions } = useDataInteractions();

  const [allowAllPorts, setAllowAllPorts] = useState(!(user.port_restrictions_enabled ?? false));
  const [allowedPorts, setAllowedPorts] = useState<string[]>(user.allowed_ports ?? []);
  const [newPort, setNewPort] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setAllowAllPorts(!(user.port_restrictions_enabled ?? false));
    setAllowedPorts(user.allowed_ports ?? []);
    setSubmitError(null);
  }, [user]);

  const hasChanges =
    allowAllPorts !== !(user.port_restrictions_enabled ?? false) ||
    JSON.stringify(allowedPorts) !== JSON.stringify(user.allowed_ports ?? []);

  useEffect(() => {
    onUnsavedChange?.(hasChanges);
  }, [hasChanges, onUnsavedChange]);

  const handleAddPort = () => {
    const trimmed = newPort.trim();
    if (trimmed && isValidPortOrRange(trimmed) && !allowedPorts.includes(trimmed)) {
      setAllowedPorts((prev) => [...prev, trimmed]);
      setNewPort("");
    }
  };

  const handleRevert = () => {
    setAllowAllPorts(!(user.port_restrictions_enabled ?? false));
    setAllowedPorts(user.allowed_ports ?? []);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!user.uuid) return;

    setSubmitError(null);
    setIsPending(true);
    try {
      await updateUserPortRestrictions(user.uuid, {
        port_restrictions_enabled: !allowAllPorts,
        allowed_ports: allowedPorts,
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

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="port-allow-all"
              className="mb-2.5"
              checked={allowAllPorts}
              onCheckedChange={(checked) => setAllowAllPorts(checked === true)}
            />
            <div>
              <Label htmlFor="port-allow-all" className="text-sm">
                {t("allowAllPorts")}
              </Label>
              <p className="text-xs text-muted-foreground">{t("allowAllPortsDescription")}</p>
            </div>
          </div>

          <div className={cn("space-y-2 pl-6", allowAllPorts && "opacity-50 pointer-events-none")}>
            <Label className="text-sm">{t("allowedPorts")}</Label>
            <p className="text-xs text-muted-foreground">{t("allowedPortsDescription")}</p>

            <div className="flex gap-2 max-w-md">
              <Input
                value={newPort}
                onChange={(e) => setNewPort(e.target.value)}
                placeholder={t("allowedPortsPlaceholder")}
                disabled={allowAllPorts}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPort();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddPort}
                disabled={allowAllPorts || !newPort.trim() || !isValidPortOrRange(newPort.trim())}
                aria-label={t("allowedPorts")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {allowedPorts.map((port) => (
                <Badge key={port} variant="secondary" className="gap-1">
                  {port}
                  <button
                    type="button"
                    onClick={() => setAllowedPorts((prev) => prev.filter((p) => p !== port))}
                    className="ml-1 hover:text-destructive"
                    aria-label={t("removePort", { port })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 w-fit ml-auto flex items-center gap-4 mr-5 mt-auto">
        {submitError && <p className="text-base text-destructive">{submitError}</p>}
        <Button variant="secondary" onClick={handleRevert} disabled={isPending || !hasChanges}>
          {tModal("revert")}
        </Button>
        <Button onClick={handleSubmit} disabled={isPending || !hasChanges}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {tModal("save")}
        </Button>
      </div>
    </div>
  );
};

export default PortRestrictionsPage;
