import GameServerStartStopButton from "@components/display/GameServer/GameServerStartStopButton/GameServerStartStopButton.tsx";
import GameServerStatusIndicator from "@components/display/GameServer/GameServerStatusIndicator/GameServerStatusIndicator.tsx";
import type { GameServerDto } from "@/api/generated/model";

const GameServerDetailPageHeader = (props: { gameServer: GameServerDto }) => {
  return (
    <div className="flex align-bottom items-end gap-12 justify-between">
      <div className={"text-l truncate text-ellipsis max-w-[45vw]"}>
        {props.gameServer.server_name}
      </div>
      <div className={"flex gap-5 items-center"}>
        <GameServerStatusIndicator gameServer={props.gameServer} />
        <GameServerStartStopButton gameServer={props.gameServer} />
      </div>
    </div>
  );
};

export default GameServerDetailPageHeader;
