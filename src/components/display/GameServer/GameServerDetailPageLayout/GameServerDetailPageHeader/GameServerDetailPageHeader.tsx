import GameServerStartStopButton from "@components/display/GameServer/GameServerStartStopButton/GameServerStartStopButton.tsx";
import GameServerStatusIndicator from "@components/display/GameServer/GameServerStatusIndicator/GameServerStatusIndicator.tsx";
import type { GameServerDto } from "@/api/generated/model";

const GameServerDetailPageHeader = (props: { gameServer: GameServerDto }) => {
  return (
    <div className="flex align-middle items-center gap-12 border-b-4 border-gray-700 py-4">
      <div className={"text-5xl truncate text-ellipsis max-w-[45vw]"}>
        {props.gameServer.server_name}
      </div>
      <GameServerStatusIndicator status={props.gameServer.status} />
      <GameServerStartStopButton gameServer={props.gameServer} />
    </div>
  );
};

export default GameServerDetailPageHeader;
