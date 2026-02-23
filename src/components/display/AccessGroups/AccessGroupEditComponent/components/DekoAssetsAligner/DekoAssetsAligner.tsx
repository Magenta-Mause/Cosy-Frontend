import type { GameServerDto } from "@/api/generated/model";
import bush1 from "@/assets/deko/bush1.png";
import bush2 from "@/assets/deko/bush2.png";
import bush3 from "@/assets/deko/bush3.png";
import bush4 from "@/assets/deko/bush4.png";
import stone from "@/assets/deko/StoneWithHugo.png";
import tree1_1 from "@/assets/deko/tree1_1.png";
import tree1_2 from "@/assets/deko/tree1_2.png";
import tree1_3 from "@/assets/deko/tree1_3.png";
import tree1_4 from "@/assets/deko/tree1_4.png";
import tree2_1 from "@/assets/deko/tree2_1.png";
import tree2_2 from "@/assets/deko/tree2_2.png";
import tree2_3 from "@/assets/deko/tree2_3.png";
import tree2_4 from "@/assets/deko/tree2_4.png";
import dekoCalculateCoordinate from "./dekoCalculateCoordinate";

const DekoAssetsAligner = (props: { gameServers: GameServerDto[] }) => {

  const getStyle = (index: number): React.CSSProperties => {
    const { x, y } = dekoCalculateCoordinate(index);

    return {
      position: "absolute",
      left: `${x * 100}vw`,
      top: `${y * 180}vw`,
      width: "25%",
    };
  };

  const dekoAssets = [
    bush1,
    bush2,
    bush3,
    bush4,
    tree1_1,
    tree1_2,
    tree1_3,
    tree1_4,
    tree2_1,
    tree2_2,
    tree2_3,
    tree2_4,
    stone,
  ];

  const getDekoAsset = (uuid: string) => {
    const hash = uuid.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return dekoAssets[hash % dekoAssets.length];
  };

  return (
    <div className="w-full h-full">
      {props.gameServers.flatMap((gameServer, index) => [
        <img
          key={`${gameServer.uuid}-0`}
          src={getDekoAsset(`${gameServer.uuid}-0`)} style={{
            ...getStyle(index * 2),
            imageRendering: "pixelated",
            width: "10vw",
          }}
          alt="deko"
        />,
        <img
          key={`${gameServer.uuid}-1`}
          src={getDekoAsset(`${gameServer.uuid}-1`)} style={{
            ...getStyle(index * 2 + 1),
            imageRendering: "pixelated",
            width: "10vw",
          }}
          alt="deko"
        />,
      ])}
    </div>
  );
};
export default DekoAssetsAligner;
