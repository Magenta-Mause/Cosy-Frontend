import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Badge } from "@components/ui/badge.tsx";
import { Button } from "@components/ui/button.tsx";
import { Checkbox } from "@components/ui/checkbox.tsx";
import { Field, FieldDescription, FieldLabel } from "@components/ui/field.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover.tsx";
import { ChevronDown, X } from "lucide-react";
import { useCallback, useContext, useMemo, useState } from "react";
import { useGetUserEntity } from "@/api/generated/backend-api";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { cn } from "@/lib/utils";
import { useTypedSelector } from "@/stores/rootReducer";

const MINECRAFT_EXTERNAL_GAME_ID = 38365;

interface McRouterDomainSelectorEditProps {
  value: string[] | undefined;
  onChange: (domains: string[]) => void;
  externalGameId: number | undefined;
}

const McRouterDomainSelectorEdit = ({
  value,
  onChange,
  externalGameId,
}: McRouterDomainSelectorEditProps) => {
  const { t } = useTranslationPrefix("mcRouterDomains");
  const { uuid, role } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const mcRouterConfig = useTypedSelector(
    (state) => state.cosyInstanceSettingsSliceReducer.settings?.mc_router_configuration,
  );

  const { data: currentUser } = useGetUserEntity(uuid ?? "", {
    query: { enabled: !!uuid },
  });

  const isMinecraft = externalGameId === MINECRAFT_EXTERNAL_GAME_ID;
  const isMcRouterEnabled = mcRouterConfig?.enabled === true;

  const selectedDomains = value ?? [];

  const availableDomains = useMemo(() => {
    if (!isMcRouterEnabled || !mcRouterConfig?.domains) {
      return [];
    }

    const allDomains = mcRouterConfig.domains;

    if (role === "ADMIN" || role === "OWNER") {
      return allDomains;
    }

    if (currentUser?.mc_router_allow_all_domains) {
      return allDomains;
    }

    const allowedDomains = currentUser?.mc_router_allowed_domains ?? [];
    return allDomains.filter((domain) => allowedDomains.includes(domain));
  }, [isMcRouterEnabled, mcRouterConfig?.domains, role, currentUser]);

  const handleDomainToggle = useCallback(
    (domain: string) => {
      const newSelection = selectedDomains.includes(domain)
        ? selectedDomains.filter((d) => d !== domain)
        : [...selectedDomains, domain];
      onChange(newSelection);
    },
    [selectedDomains, onChange],
  );

  const handleRemoveDomain = useCallback(
    (domain: string) => {
      onChange(selectedDomains.filter((d) => d !== domain));
    },
    [selectedDomains, onChange],
  );

  if (!isMinecraft) {
    return null;
  }

  if (!isMcRouterEnabled) {
    return (
      <Field>
        <FieldLabel className="font-bold">{t("title")}</FieldLabel>
        <div className="text-sm text-muted-foreground p-3 rounded-md bg-muted/50">
          {t("mcRouterNotEnabled")}
        </div>
      </Field>
    );
  }

  if (availableDomains.length === 0) {
    return (
      <Field>
        <FieldLabel className="font-bold">{t("title")}</FieldLabel>
        <div className="text-sm text-muted-foreground p-3 rounded-md bg-muted/50">
          {t("noDomainsAvailable")}
        </div>
      </Field>
    );
  }

  return (
    <Field>
      <FieldLabel className="font-bold">{t("title")}</FieldLabel>

      <div className="space-y-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between"
            >
              {selectedDomains.length > 0
                ? `${selectedDomains.length} selected`
                : t("placeholder")}
              <ChevronDown
                className={cn(
                  "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-2" align="start">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {availableDomains.map((domain) => (
                <button
                  key={domain}
                  type="button"
                  className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer w-full text-left"
                  onClick={() => handleDomainToggle(domain)}
                >
                  <Checkbox
                    checked={selectedDomains.includes(domain)}
                    onCheckedChange={() => handleDomainToggle(domain)}
                  />
                  <span className="text-sm">{domain}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {selectedDomains.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedDomains.map((domain) => (
              <Badge key={domain} variant="secondary" className="gap-1">
                {domain}
                <button
                  type="button"
                  onClick={() => handleRemoveDomain(domain)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <FieldDescription>{t("description")}</FieldDescription>
    </Field>
  );
};

export default McRouterDomainSelectorEdit;
