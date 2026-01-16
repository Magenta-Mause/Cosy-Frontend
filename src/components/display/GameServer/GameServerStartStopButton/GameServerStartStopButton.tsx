import { Button } from "@components/ui/button.tsx";
import { Power } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GameServerDtoStatus } from "@/api/generated/model";
import useServerInteractions from "@/hooks/useServerInteractions/useServerInteractions.tsx";
import { useTypedSelector } from "@/stores/rootReducer.ts";
import type { GameServerWithLocalStatus } from "@/stores/slices/gameServerSlice.ts";

const GameServerStartStopButton = (props: { gameServer: GameServerWithLocalStatus }) => {
  const { t } = useTranslation();
  const pullProgressMap = useTypedSelector((state) => state.gameServerSliceReducer.pullProgress);
  const { stopServer, startServer } = useServerInteractions();
  if (!pullProgressMap) {
    return null;
  }
  const progress = pullProgressMap[props.gameServer.uuid];

  const buttonProps: React.ComponentProps<"button"> = (() => {
    switch (props.gameServer.status) {
      case GameServerDtoStatus.RUNNING:
        return {
          onClick: () => stopServer(props.gameServer.uuid),
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
          children: progress ? (
            <>
              {progress.status}
              {progress.id && ` - Layer ${progress.id}`}
              {progress.current && progress.total
                ? ` (${Math.round((progress.current / progress.total) * 100)}%)`
                : ""}
            </>
          ) : (
            t("serverPage.pullingImage")
          ),
        };
      case "AWAITING_UPDATE":
        return {
          disabled: true,
          children: (
            <>
              <Power />
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
