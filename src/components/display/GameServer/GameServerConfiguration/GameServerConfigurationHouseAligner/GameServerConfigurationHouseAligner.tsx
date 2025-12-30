import GameServerHouse from "@components/display/GameServer/GameServerHouse/GameServerHouse.tsx";
import calculateCoordinate from "@components/display/GameServer/GameServerHouseAligner/calculateCoordinate.ts";
import type { GameServerDto } from "@/api/generated/model";

const GameServerConfigurationHouseAligner = (props: { gameServers: GameServerDto[] }) => {
  const getStyle = (index: number): React.CSSProperties => {
    const { x, y } = calculateCoordinate(index);

    return {
      position: "absolute",
      left: `${x * 100}%`,
      top: `${y}px`,
    };
  };

  return (
    <div className="w-full h-full relative">
      {props.gameServers.map((gameServer, index) => (
        <GameServerHouse key={gameServer.uuid} gameServer={gameServer} style={getStyle(index)} />
      ))}
    </div>
  );
};

export default GameServerConfigurationHouseAligner;
