import {type GameServerDto, GameServerDtoStatus} from "@/api/generated/model";
import {Tooltip, TooltipContent, TooltipTrigger} from "@components/ui/tooltip.tsx";

const STATUS_CLASSES: Record<GameServerDtoStatus, string> = {
  [GameServerDtoStatus.FAILED]: "bg-yellow-400",
  [GameServerDtoStatus.STARTING]: "animation-pulse bg-green-500",
  [GameServerDtoStatus.STOPPED]: "bg-red-400",
  [GameServerDtoStatus.RUNNING]: "bg-green-500",
  SHUTTING_DOWN: ""
}

const ServerStatusIndicator = (props: { status: GameServerDto["status"] }) => {
  return <Tooltip>
    <TooltipTrigger asChild>
      <div className={"w-5 h-5 border-gray-500 border-2 rounded-4xl " + STATUS_CLASSES[props.status]}/>
    </TooltipTrigger>
    <TooltipContent>
      {props.status}
    </TooltipContent>
  </Tooltip>
}

export default ServerStatusIndicator;
