import {type GameServerDto, GameServerDtoStatus} from "@/api/generated/model";
import {stopService} from "@/api/generated/backend-api.ts";
import {startServiceSse} from "@/api/sse.ts";
import {Button} from "@components/ui/button.tsx";
import {useTranslation} from "react-i18next";
import {useTypedSelector} from "@/stores/rootReducer.ts";
import {Power} from "lucide-react";

const GameServerStartStopButton = (props: { gameServer: GameServerDto }) => {
  const {t} = useTranslation();
  const pullProgressMap = useTypedSelector((state) => state.gameServerSliceReducer.pullProgress);
  if (!pullProgressMap) {
    return <></>;
  }
  const progress = pullProgressMap[props.gameServer.uuid];
  let buttonProps: React.ComponentProps<"button"> = (() => {
    switch (props.gameServer.status) {
      case GameServerDtoStatus.RUNNING:
        return {
          onClick: () => stopService(props.gameServer.uuid),
          children: <><Power/>{t("serverPage.stop")}</>
        }
      case GameServerDtoStatus.STOPPED:
      case GameServerDtoStatus.FAILED:
        return {
          onClick: () => startServiceSse(props.gameServer.uuid),
          children: <><Power/>{t("serverPage.start")}</>
        };
      case GameServerDtoStatus.PULLING_IMAGE:
        return {
          disabled: true,
          children:
            progress ?
              <>
                {progress.status}
                {progress.id && ` - Layer ${progress.id}`}
                {progress.current && progress.total
                  ? ` (${Math.round(
                    (progress.current / progress.total) * 100
                  )}%)`
                  : ""}
              </> : t("serverPage.pullingImage")
        };
      default:
        return {};
    }
  })();

  return <Button {...buttonProps} />
}

export default GameServerStartStopButton;
