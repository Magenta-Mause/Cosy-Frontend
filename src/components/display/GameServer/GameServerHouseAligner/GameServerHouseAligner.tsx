import ConstructionPlaceHouse from "@components/display/GameServer/ConstructionPlaceHouse/ConstructionPlaceHouse.tsx";
import GameServerHouse from "@components/display/GameServer/GameServerHouse/GameServerHouse.tsx";
import calculateCoordinate from "@components/display/GameServer/GameServerHouseAligner/calculateCoordinate.ts";
import UserDetailButton from "@components/display/UserManagement/UserDetailPage/UserDetailButton";
import type { GameServerDto } from "@/api/generated/model";

const GameServerHouseAligner = (props: { gameServers: GameServerDto[] }) => {
  const getStyle = (index: number): React.CSSProperties => {
    const { x, y } = calculateCoordinate(index);

    return {
      position: "absolute",
      left: `${x * 100}vw`,
      top: `${y * 100}vw`,
    };
  };

  return (
    <div className="w-full h-full relative">
      {props.gameServers.map((gameServer, index) => (
        <GameServerHouse key={gameServer.uuid} gameServer={gameServer} style={getStyle(index)} />
      ))}
      <ConstructionPlaceHouse style={getStyle(props.gameServers.length)} />
      <UserDetailButton />
    </div>
  );
};

export default GameServerHouseAligner;
