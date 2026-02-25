import GameServerStartStopButton from "@components/display/GameServer/GameServerStartStopButton/GameServerStartStopButton.tsx";
import GameServerStatusIndicator from "@components/display/GameServer/GameServerStatusIndicator/GameServerStatusIndicator.tsx";
import type { CSSProperties } from "react";
import type { GameServerDto } from "@/api/generated/model";
import { cn } from "@/lib/utils.ts";

const GameServerDetailPageHeader = (props: {
  gameServer: GameServerDto;
  className?: string;
  style?: CSSProperties;
  buttonVariant?: "primary" | "secondary";
}) => {
  return (
    <div className={cn("text-foreground", props.className)} style={props.style}>
      <div
        className={
          "flex align-bottom items-end gap-[2vw] border-b-4 border-foreground py-[5px] justify-between w-full"
        }
      >
        <div className={"text-2xl truncate text-ellipsis max-w-[45vw] leading-none"}>
          {props.gameServer.server_name}
        </div>
        <div className={"flex gap-5 items-center"}>
          <GameServerStatusIndicator gameServer={props.gameServer} />
          <GameServerStartStopButton
            gameServer={props.gameServer}
            buttonVariant={props.buttonVariant}
          />
        </div>
      </div>
    </div>
  );
};

export default GameServerDetailPageHeader;
