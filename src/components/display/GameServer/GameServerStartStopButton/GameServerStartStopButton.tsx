import { Button } from "@components/ui/button.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper";
import { Power } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  GameServerAccessGroupDtoPermissionsItem,
  type GameServerDto,
  GameServerDtoStatus,
} from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions";

const GameServerStartStopButton = (props: { gameServer: GameServerDto }) => {
  const { t } = useTranslation();
  const { stopServer, startServer } = useDataInteractions();
  const { hasPermission } = useGameServerPermissions(props.gameServer.uuid);

  const canStartStopServer = hasPermission(
    GameServerAccessGroupDtoPermissionsItem.START_STOP_SERVER,
  );

  const buttonProps: React.ComponentProps<"button"> = (() => {
    switch (props.gameServer.status) {
      case GameServerDtoStatus.RUNNING:
        return {
          onClick: () => stopServer(props.gameServer.uuid),
          disabled: !canStartStopServer,
          children: (
            <>
              <Power />
              {t("serverPage.stop")}
            </>
          ),
        };
      case GameServerDtoStatus.STOPPED:
      case GameServerDtoStatus.FAILED:
        return {
          onClick: () => startServer(props.gameServer.uuid),
          disabled: !canStartStopServer,
          children: (
            <>
              <Power />
              {t("serverPage.start")}
            </>
          ),
        };
      case GameServerDtoStatus.PULLING_IMAGE:
        return {
          disabled: true,
          "data-loading": true,
          children: t(`serverStatus.PULLING_IMAGE`),
        };
      case GameServerDtoStatus.AWAITING_UPDATE:
        return {
          disabled: true,
          "data-loading": true,
          children: (
            <>
              <Power />
              {t("serverStatus.AWAITING_UPDATE")}
            </>
          ),
        };
      case GameServerDtoStatus.STOPPING:
        return {
          disabled: true,
          "data-loading": true,
          children: (
            <>
              <Power />
              {t("serverStatus.STOPPING")}
            </>
          ),
        };
      default:
        return {};
    }
  })();

  const isLoadingState =
    props.gameServer.status === GameServerDtoStatus.PULLING_IMAGE ||
    props.gameServer.status === GameServerDtoStatus.AWAITING_UPDATE ||
    props.gameServer.status === GameServerDtoStatus.STOPPING;

  const showTooltip = !canStartStopServer && !isLoadingState;

  return (
    <TooltipWrapper
      tooltip={showTooltip ? t("serverPage.noStartStopPermission") : null}
      side="bottom"
      align="center"
    >
      <Button {...buttonProps} className="transition-all duration-300" />
    </TooltipWrapper>
  );
};

export default GameServerStartStopButton;
