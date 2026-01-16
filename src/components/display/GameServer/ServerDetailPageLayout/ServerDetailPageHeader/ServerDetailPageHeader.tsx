import type {GameServerDto} from "@/api/generated/model";
import ServerStatusIndicator from "@components/display/GameServer/ServerStatusIndicator/ServerStatusIndicator.tsx";

const ServerDetailPageHeader = (props: { gameServer: GameServerDto }) => {
  return <div className="flex align-middle items-center gap-5">
    <div className={"text-5xl truncate text-ellipsis max-w-[45vw]"}>
      {props.gameServer.server_name}
    </div>
    <ServerStatusIndicator status={"STARTING"}/>
  </div>
}

export default ServerDetailPageHeader;
