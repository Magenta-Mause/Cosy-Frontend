import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Checkbox } from "@components/ui/checkbox.tsx";
import { Field, FieldDescription, FieldLabel } from "@components/ui/field.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover.tsx";
import { ChevronDown } from "lucide-react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useGetUserEntity } from "@/api/generated/backend-api";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { cn } from "@/lib/utils";
import { useTypedSelector } from "@/stores/rootReducer";
import {
  GameServerCreationContext,
  type GameServerCreationFormState,
} from "./CreateGameServerModal.tsx";
import { GameServerCreationPageContext } from "./GenericGameServerCreationPage.tsx";

const MINECRAFT_EXTERNAL_GAME_ID = 38365;

interface McRouterDomainSelectorProps {
  attribute: keyof GameServerCreationFormState;
}

const McRouterDomainSelector = ({ attribute }: McRouterDomainSelectorProps) => {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step3.mcRouterDomains");
  const { uuid, role } = useContext(AuthContext);
  const { setGameServerState, creationState } = useContext(GameServerCreationContext);
  const { setAttributeTouched, setAttributeValid } = useContext(GameServerCreationPageContext);

  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const mcRouterConfig = useTypedSelector(
    (state) => state.cosyInstanceSettingsSliceReducer.settings?.mc_router_configuration,
  );

  const { data: currentUser, isLoading: isUserLoading } = useGetUserEntity(uuid ?? "", {
    query: { enabled: !!uuid },
  });

  const isMinecraft =
    creationState.utilState.gameEntity?.external_game_id === MINECRAFT_EXTERNAL_GAME_ID;

  const isMcRouterEnabled = mcRouterConfig?.enabled === true;

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

  useEffect(() => {
    const contextValue = creationState.gameServerState[attribute];
    if (contextValue && Array.isArray(contextValue)) {
      setSelectedDomains(contextValue as string[]);
    }
  }, [creationState.gameServerState, attribute]);

  const updateSelection = useCallback(
    (domains: string[]) => {
      setSelectedDomains(domains);
      setGameServerState(attribute)(domains);
      setAttributeTouched(attribute, true);
      setAttributeValid(attribute, true);
    },
    [attribute, setGameServerState, setAttributeTouched, setAttributeValid],
  );

  const handleDomainToggle = useCallback(
    (domain: string) => {
      const newSelection = selectedDomains.includes(domain)
        ? selectedDomains.filter((d) => d !== domain)
        : [...selectedDomains, domain];
      updateSelection(newSelection);
    },
    [selectedDomains, updateSelection],
  );

  useEffect(() => {
    setAttributeValid(attribute, true);
    setAttributeTouched(attribute, true);
  }, [attribute, setAttributeValid, setAttributeTouched]);

  if (!isMinecraft) {
    return null;
  }

  if (!isMcRouterEnabled) {
    return (
      <Field>
        <FieldLabel className="font-bold">{t("title")}</FieldLabel>
        <div className="text-sm text-muted-foreground p-3 rounded-md bg-muted/50">
          {t("notEnabled")}
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
          {t("noDomains")}
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
              <button
                key={domain}
                type="button"
                className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer w-full text-left"
                onClick={() => handleDomainToggle(domain)}
              >
                <Checkbox
                  checked={selectedDomains.includes(domain)}
                />
                <span className="text-sm">{domain}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <FieldDescription>{t("description")}</FieldDescription>
    </Field>
  );
};

export default McRouterDomainSelector;
