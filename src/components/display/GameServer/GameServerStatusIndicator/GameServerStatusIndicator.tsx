import {useTranslation} from "react-i18next";
import {type GameServerDto, GameServerDtoStatus} from "@/api/generated/model";
import {useTypedSelector} from "@/stores/rootReducer.ts";
import type {ReactNode} from "react";

const STATUS_CLASSES: Record<GameServerDtoStatus, string> = {
  [GameServerDtoStatus.FAILED]: "bg-yellow-400",
  [GameServerDtoStatus.STOPPED]: "bg-red-400",
  [GameServerDtoStatus.RUNNING]: "bg-green-500",
  [GameServerDtoStatus.PULLING_IMAGE]: "bg-blue-400",
  [GameServerDtoStatus.AWAITING_UPDATE]: "bg-gray-400",
  [GameServerDtoStatus.STOPPING]: "bg-red-600",
};

const GameServerStatusIndicator = (props: { gameServer: GameServerDto }) => {
  const {t} = useTranslation();
  const status = props.gameServer.status ?? GameServerDtoStatus.STOPPED;
  const pullProgressMap = useTypedSelector((state) => state.gameServerSliceReducer.pullProgress);
  const progress = pullProgressMap[props.gameServer.uuid];
  let buttonLabel: ReactNode = t(`serverStatus.${status}`);
  if (status === "PULLING_IMAGE") {
    if (progress) {
      buttonLabel =
        <>
          {progress.status}
          {progress.id && ` - Layer ${progress.id}`}
          {progress.current && progress.total
            ? ` (${Math.round((progress.current / progress.total) * 100)}%)`
            : ""}
        </>;
    } else {
      buttonLabel = t("serverStatus.PULLING_IMAGE");
    }
  }
  return (
    <div className={"flex gap-2 align-middle items-center"}>
      <div
        className={`w-5 h-5 border-button-primary-default border-2 rounded-4xl ${STATUS_CLASSES[status]}`}
      />
      <div className={"text-2xl"}>{buttonLabel}</div>
    </div>
  );
};

export default GameServerStatusIndicator;
