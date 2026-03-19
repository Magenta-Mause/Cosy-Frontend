import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Badge } from "@components/ui/badge.tsx";
import { Button } from "@components/ui/button.tsx";
import { Checkbox } from "@components/ui/checkbox.tsx";
import { Field, FieldDescription, FieldLabel } from "@components/ui/field.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover.tsx";
import { ChevronDown, X } from "lucide-react";
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

  // Get MC-Router configuration from Redux store
  const mcRouterConfig = useTypedSelector(
    (state) => state.cosyInstanceSettingsSliceReducer.settings?.mc_router_configuration,
  );

  // Fetch current user's data to get their domain restrictions
  const { data: currentUser } = useGetUserEntity(uuid ?? "", {
    query: { enabled: !!uuid },
  });

  // Determine if the game is Minecraft
  const isMinecraft =
    creationState.utilState.gameEntity?.external_game_id === MINECRAFT_EXTERNAL_GAME_ID;

  // Determine if MC-Router is enabled
  const isMcRouterEnabled = mcRouterConfig?.enabled === true;

  // Compute available domains based on user restrictions
  const availableDomains = useMemo(() => {
    if (!isMcRouterEnabled || !mcRouterConfig?.domains) {
      return [];
    }

    const allDomains = mcRouterConfig.domains;

    // Admin and Owner can use all domains
    if (role === "ADMIN" || role === "OWNER") {
      return allDomains;
    }

    // For regular users, check their restrictions
    if (currentUser?.mc_router_allow_all_domains) {
      return allDomains;
    }

    // Filter to only allowed domains
    const allowedDomains = currentUser?.mc_router_allowed_domains ?? [];
    return allDomains.filter((domain) => allowedDomains.includes(domain));
  }, [isMcRouterEnabled, mcRouterConfig?.domains, role, currentUser]);

  // Initialize from context if values exist
  useEffect(() => {
    const contextValue = creationState.gameServerState[attribute];
    if (contextValue && Array.isArray(contextValue)) {
      setSelectedDomains(contextValue as string[]);
    }
  }, [creationState.gameServerState, attribute]);

  // Update context when selected domains change
  const updateSelection = useCallback(
    (domains: string[]) => {
      setSelectedDomains(domains);
      setGameServerState(attribute)(domains);
      setAttributeTouched(attribute, true);
      // MC-Router domains are optional, so always valid
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

  const handleRemoveDomain = useCallback(
    (domain: string) => {
      updateSelection(selectedDomains.filter((d) => d !== domain));
    },
    [selectedDomains, updateSelection],
  );

  // Initialize validation state on mount
  useEffect(() => {
    // MC-Router domains are optional
    setAttributeValid(attribute, true);
    setAttributeTouched(attribute, true);
  }, [attribute, setAttributeValid, setAttributeTouched]);

  // Don't render if not Minecraft
  if (!isMinecraft) {
    return null;
  }

  // Show message if MC-Router is not enabled
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

  // Show message if no domains are available
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
                ? t("selectedCount", { count: selectedDomains.length })
                : t("selectDomains")}
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

        {/* Display selected domains as badges */}
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

export default McRouterDomainSelector;
