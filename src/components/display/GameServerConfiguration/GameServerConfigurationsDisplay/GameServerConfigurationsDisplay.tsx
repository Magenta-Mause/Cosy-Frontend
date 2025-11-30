import type {GameServerConfigurationEntity} from "@/api/generated/model";
import GameServerConfigurationHouseAligner
  from "@components/display/GameServerConfiguration/GameServerConfigurationHouseAligner/GameServerConfigurationHouseAligner.tsx";

const GameServerConfigurationsDisplay = (props: { gameServerConfigurations: GameServerConfigurationEntity[] }) => {
  return <div className={"w-full h-full"}>
    <GameServerConfigurationHouseAligner gameServers={props.gameServerConfigurations}/>
  </div>
}

export default GameServerConfigurationsDisplay;
