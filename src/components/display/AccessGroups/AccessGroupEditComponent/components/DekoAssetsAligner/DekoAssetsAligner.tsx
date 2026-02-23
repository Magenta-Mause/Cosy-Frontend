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

type DekoAssetGroup = {
  variations: DekoAsset[];
  width: string;
};

type DekoAsset = {
  src: string;
  width: string;
};

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

  const dekoAssetGroups: DekoAssetGroup[] = [
    {
      variations: [bush1, bush2, bush3, bush4].map(src => ({ src, width: "7vw" })),
      width: "7vw",
    },
    {
      variations: [tree1_1, tree1_2, tree1_3, tree1_4].map(src => ({ src, width: "8vw" })),
      width: "8vw",
    },
    {
      variations: [tree2_1, tree2_2, tree2_3, tree2_4].map(src => ({ src, width: "10vw" })),
      width: "10vw",
    },
    {
      variations: [{ src: stone, width: "20vw" }],
      width: "20vw",
    },
  ];

  const getDekoAsset = (seed: string): DekoAsset => {
    const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const group = dekoAssetGroups[hash % dekoAssetGroups.length];
    const variation = group.variations[(hash >> 4) % group.variations.length];
    return variation;
  };

  return (
    props.gameServers.flatMap((gameServer, index) => {
      const asset0 = getDekoAsset(`${gameServer.uuid}-0`);
      const asset1 = getDekoAsset(`${gameServer.uuid}-1`);

      return [
        <img
          key={`${gameServer.uuid}-0`}
          src={asset0.src}
          style={{
            ...getStyle(index * 2),
            imageRendering: "pixelated",
            width: asset0.width,
          }}
          alt="deko"
        />,
        <img
          key={`${gameServer.uuid}-1`}
          src={asset1.src}
          style={{
            ...getStyle(index * 2 + 1),
            imageRendering: "pixelated",
            width: asset1.width,
          }}
          alt="deko"
        />,
      ];
    })
  );
};
export default DekoAssetsAligner;
