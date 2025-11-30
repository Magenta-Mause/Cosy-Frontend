import type {GameServerConfigurationEntity} from "@/api/generated/model";
import {cn} from "@/lib/utils.ts";
import type {CSSProperties} from "react";

const GameServerConfigurationHouse = (props: { gameServer: GameServerConfigurationEntity, className?: string, style?: CSSProperties }) => {
  return <div className={cn("block overflow-hidden w-[200px] h-[200px] border-black border-4 text-xs", props.className)} style={props.style}>
    {JSON.stringify(props.gameServer)}
  </div>
}

export default GameServerConfigurationHouse;
