import {Button} from "@components/ui/button.tsx";
import {Power} from "lucide-react";
import {useTranslation} from "react-i18next";
import {type GameServerDto, GameServerDtoStatus} from "@/api/generated/model";
import useServerInteractions from "@/hooks/useServerInteractions/useServerInteractions.tsx";

const GameServerStartStopButton = (props: { gameServer: GameServerDto }) => {
  const {t} = useTranslation();
  const {stopServer, startServer} = useServerInteractions();

  const buttonProps: React.ComponentProps<"button"> = (() => {
    switch (props.gameServer.status) {
      case GameServerDtoStatus.RUNNING:
        return {
          onClick: () => stopServer(props.gameServer.uuid),
          children: (
            <>
              <Power/>
              {t("serverPage.stop")}
            </>
          ),
        };
      case GameServerDtoStatus.STOPPED:
      case GameServerDtoStatus.FAILED:
        return {
          onClick: () => startServer(props.gameServer.uuid),
          children: (
            <>
              <Power/>
              {t("serverPage.start")}
            </>
          ),
        };
      case GameServerDtoStatus.PULLING_IMAGE:
        return {
          disabled: true,
          children: t(`serverStatus.PULLING_IMAGE`)
        };
      case "AWAITING_UPDATE":
        return {
          disabled: true,
          children: (
            <>
              <Power/>
              {t("serverStatus.AWAITING_UPDATE")}
            </>
          ),
        };
      default:
        return {};
    }
  })();

  return <Button {...buttonProps} />;
};

export default GameServerStartStopButton;
