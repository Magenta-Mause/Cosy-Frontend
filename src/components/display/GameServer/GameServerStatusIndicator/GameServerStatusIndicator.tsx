import {type GameServerDto, GameServerDtoStatus} from "@/api/generated/model";
import {useTranslation} from "react-i18next";

const STATUS_CLASSES: Record<GameServerDtoStatus, string> = {
  [GameServerDtoStatus.FAILED]: "bg-yellow-400",
  [GameServerDtoStatus.STOPPED]: "bg-red-400",
  [GameServerDtoStatus.RUNNING]: "bg-green-500",
  [GameServerDtoStatus.PULLING_IMAGE]: "bg-blue-400",
  STARTING: "",
}

const GameServerStatusIndicator = (props: { status: GameServerDto["status"] }) => {
  const {t} = useTranslation();
  return <div className={"flex items-center gap-2 align-middle items-center"}>
    <div className={"w-5 h-5 border-gray-500 border-2 rounded-4xl " + STATUS_CLASSES[props.status]}/>
    <div className={"text-2xl"}>
      {t("serverStatus." + props.status)}
    </div>
  </div>
}

export default GameServerStatusIndicator;
