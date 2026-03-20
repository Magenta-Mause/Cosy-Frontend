import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion.tsx";
import SettingsActionButtons from "@components/display/GameServer/GameServerSettings/SettingsActionButtons.tsx";
import UnsavedModal from "@components/ui/UnsavedModal";
import { useEffect, useMemo, useState } from "react";
import { GameServerDtoStatus, type GameServerUpdateDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useSelectedGameServer from "@/hooks/useSelectedGameServer/useSelectedGameServer";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { mapGameServerDtoToUpdate } from "@/lib/gameServerMapper.ts";
import { notificationModal } from "@/lib/notificationModal";
import McRouterDomainSelectorEdit from "../../EditGameServer/McRouterDomainSelectorEdit";

const MINECRAFT_EXTERNAL_GAME_ID = 38365;

const GameSpecificSettingsSection = () => {
  const { t } = useTranslationPrefix("components.GameServerSettings.gameSpecific");
  const { t: tToasts } = useTranslationPrefix("toasts");
  const { updateGameServer } = useDataInteractions();
  const { gameServer } = useSelectedGameServer();

  const [mcRouterDomains, setMcRouterDomains] = useState<string[]>(
    gameServer.mc_router_domains ?? [],
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMcRouterDomains(gameServer.mc_router_domains ?? []);
  }, [gameServer.mc_router_domains]);

  const isChanged = useMemo(
    () =>
      JSON.stringify(mcRouterDomains) !==
      JSON.stringify(gameServer.mc_router_domains ?? []),
    [mcRouterDomains, gameServer.mc_router_domains],
  );

  const isMinecraft = gameServer.external_game_id === MINECRAFT_EXTERNAL_GAME_ID;

  const isServerActive =
    gameServer.status !== GameServerDtoStatus.STOPPED &&
    gameServer.status !== GameServerDtoStatus.FAILED;

  const handleRevert = () => {
    setMcRouterDomains(gameServer.mc_router_domains ?? []);
  };

  const handleConfirm = async () => {
    if (!gameServer.uuid) {
      notificationModal.error({ message: tToasts("missingUuid") });
      return;
    }
    setLoading(true);
    try {
      const payload: GameServerUpdateDto = {
        ...mapGameServerDtoToUpdate(gameServer),
        mc_router_domains: mcRouterDomains,
      };
      await updateGameServer(gameServer.uuid, payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ lineHeight: "initial" }}>{t("title")}</h2>
        <p className="text-sm text-muted-foreground leading-none">{t("description")}</p>
        {isServerActive && (
          <span className="text-button-destructive-default text-sm">
            {t("serverNeedsToBeStopped")}
          </span>
        )}
      </div>

      <fieldset disabled={isServerActive || loading}>
        <Accordion type="single" collapsible defaultValue="minecraft">
          {isMinecraft && (
            <AccordionItem value="minecraft">
              <AccordionTrigger className="text-base font-bold">
                {t("minecraft.title")}
              </AccordionTrigger>
              <AccordionContent>
                <McRouterDomainSelectorEdit
                  value={mcRouterDomains}
                  onChange={setMcRouterDomains}
                  externalGameId={gameServer.external_game_id}
                />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {!isMinecraft && (
          <p className="text-sm text-muted-foreground">{t("noGameSpecificSettings")}</p>
        )}
      </fieldset>

      <SettingsActionButtons
        onRevert={handleRevert}
        onConfirm={handleConfirm}
        revertDisabled={loading || !isChanged}
        confirmDisabled={loading || !isChanged || isServerActive}
        loading={loading}
        confirmTooltip={isServerActive && t("serverNeedsToBeStopped")}
      />
      <UnsavedModal isChanged={isChanged} onSave={handleConfirm} />
    </div>
  );
};

export default GameSpecificSettingsSection;
