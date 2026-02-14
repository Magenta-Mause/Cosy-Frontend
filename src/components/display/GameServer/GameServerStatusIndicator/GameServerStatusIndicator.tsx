import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { type GameServerDto, GameServerDtoStatus } from "@/api/generated/model";
import { useTypedSelector } from "@/stores/rootReducer.ts";
import GameServerStatusDot from "../GameServerStatusDot/GameServerStatusDot.tsx";

const GameServerStatusIndicator = (props: { gameServer: GameServerDto }) => {
  const { t } = useTranslation();
  const status = props.gameServer.status ?? GameServerDtoStatus.STOPPED;
  const pullProgressMap = useTypedSelector((state) => state.gameServerSliceReducer.pullProgress);
  const progress = pullProgressMap[props.gameServer.uuid];
  let buttonLabel: ReactNode = t(`serverStatus.${status}`);
  if (status === "PULLING_IMAGE") {
    if (progress) {
      buttonLabel = (
        <>
          {progress.status}
          {progress.id && ` - Layer ${progress.id}`}
          {progress.current && progress.total
            ? ` (${Math.round((progress.current / progress.total) * 100)}%)`
            : ""}
        </>
      );
    } else {
      buttonLabel = t("serverStatus.PULLING_IMAGE");
    }
  }

  return (
    <div className={"flex gap-2 align-middle items-center"}>
      <GameServerStatusDot status={status} />
      <div className={"text-lg"}>{buttonLabel}</div>
    </div>
  );
};

export default GameServerStatusIndicator;
