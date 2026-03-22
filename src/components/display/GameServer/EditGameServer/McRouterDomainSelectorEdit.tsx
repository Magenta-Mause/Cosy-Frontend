import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Checkbox } from "@components/ui/checkbox.tsx";
import { Field, FieldDescription, FieldLabel } from "@components/ui/field.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover.tsx";
import { ChevronDown } from "lucide-react";
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
  const { uuid } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const mcRouterConfig = useTypedSelector(
    (state) => state.cosyInstanceSettingsSliceReducer.settings?.mc_router_configuration,
  );

  const { data: currentUser, isLoading: isUserLoading } = useGetUserEntity(uuid ?? "", {
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

    if (currentUser?.mc_router_allow_all_domains) {
      return allDomains;
    }

    const allowedDomains = currentUser?.mc_router_allowed_domains ?? [];
    return allDomains.filter((domain) => allowedDomains.includes(domain));
  }, [isMcRouterEnabled, mcRouterConfig?.domains, currentUser]);

  const handleDomainToggle = useCallback(
    (domain: string) => {
      const newSelection = selectedDomains.includes(domain)
        ? selectedDomains.filter((d) => d !== domain)
        : [...selectedDomains, domain];
      onChange(newSelection);
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

  if (isUserLoading) {
    return null;
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

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "flex w-full items-center justify-between rounded-md border border-input bg-primary-banner px-3 py-1 h-9 text-base",
              "[box-shadow:inset_0_1px_2px_rgba(132,66,57,0.4)]",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
            )}
          >
            <span className="truncate text-left">
              {selectedDomains.length > 0
                ? selectedDomains.join(", ")
                : <span className="text-muted-foreground">{t("placeholder")}</span>}
            </span>
            <ChevronDown
              className={cn(
                "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform",
                isOpen && "rotate-180",
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {availableDomains.map((domain) => (
              <div
                key={domain}
                role="option"
                aria-selected={selectedDomains.includes(domain)}
                tabIndex={0}
                className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer w-full text-left"
                onClick={() => handleDomainToggle(domain)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleDomainToggle(domain);
                  }
                }}
              >
                <Checkbox
                  checked={selectedDomains.includes(domain)}
                  tabIndex={-1}
                />
                <span className="text-sm">{domain}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <FieldDescription>{t("description")}</FieldDescription>
    </Field>
  );
};

export default McRouterDomainSelectorEdit;
