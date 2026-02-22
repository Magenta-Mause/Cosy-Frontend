import Footer from "@components/display/Footer/Footer.tsx";
import bgImageLoop from "@/assets/MainPage/backgrounds/bg_day_loop.png";
import bgImageTop from "@/assets/MainPage/backgrounds/bg_day_top.png";
import bgImageFooter from "@/assets/MainPage/backgrounds/bg_footer_day.webp";
import logo from "@/assets/MainPage/logo.gif";
import path_1 from "@/assets/MainPage/platze_1.png";
import path_2 from "@/assets/MainPage/platze_2.png";
import pathLoop_1 from "@/assets/MainPage/platze_loop_1.png";
import pathLoop_2 from "@/assets/MainPage/platze_loop_2.png";
import pathLoop_3 from "@/assets/MainPage/platze_loop_3.png";
import pathLoop_4 from "@/assets/MainPage/platze_loop_4.png";
import pathLoop_5 from "@/assets/MainPage/platze_loop_5.png";
import pathLoop_6 from "@/assets/MainPage/platze_loop_6.png";

const HOUSES_PER_CYCLE = 6;
const BASE_THRESHOLD = 2;

const images = {
  bg: {
    top: bgImageTop,
    loop: bgImageLoop,
    footer: bgImageFooter,
  },
  path: {
    1: path_1,
    2: path_2,
    loop: [pathLoop_1, pathLoop_2, pathLoop_3, pathLoop_4, pathLoop_5, pathLoop_6],
  },
};

function calculatePathSegments(houseCount: number) {
  if (houseCount === 1) {
    return [{ id: "path-base-1", src: images.path[1] }];
  }

  if (houseCount === 2) {
    return [{ id: "path-base-2", src: images.path[2] }];
  }

  const segments = [{ id: "path-base-2", src: images.path[2] }];
  const housesAfterBase = houseCount - BASE_THRESHOLD;

  const fullCycles = Math.floor((housesAfterBase - 1) / HOUSES_PER_CYCLE);
  const remainder = ((housesAfterBase - 1) % HOUSES_PER_CYCLE) + 1;

  for (let i = 0; i < fullCycles; i++) {
    segments.push({
      id: `path-cycle-${i}`,
      src: images.path.loop[5],
    });
  }

  segments.push({
    id: `path-loop-${remainder}`,
    src: images.path.loop[remainder - 1],
  });

  return segments;
}

function calculateBgLoops(houseCount: number) {
  const loopsPerPosition = [2, 0, 3, 1, 1, 1];
  let loopCount = 0;

  for (let i = 1; i <= houseCount; i++) {
    if (i < 3) {
      loopCount += 0.5;
    } else {
      const position = (i - 3) % 6;
      loopCount += loopsPerPosition[position];
    }
  }

  return Array.from({ length: loopCount }, (_, i) => ({
    id: `bg-loop-${i}`,
    src: images.bg.loop,
  }));
}

interface GameServerBackgroundProps {
  houseCount: number;
}

const GameServerBackground = ({ houseCount }: GameServerBackgroundProps) => {
  const pathSegments = calculatePathSegments(houseCount);
  const bgLoops = calculateBgLoops(houseCount);

  return (
    <div className="relative w-full">
      <div className="relative w-full">
        <img
          src={images.bg.top}
          alt="BG Top"
          className="w-full h-auto block"
          style={{ imageRendering: "pixelated" }}
        />
        {bgLoops.map((loop) => (
          <img
            key={loop.id}
            src={loop.src}
            alt="BG Loop"
            className="w-full h-auto block"
            style={{ imageRendering: "pixelated" }}
          />
        ))}
        <Footer bgImageFooter={images.bg.footer} />
      </div>

      <div className="absolute top-0 left-0 w-full">
        {pathSegments.map((segment) => (
          <img
            key={segment.id}
            src={segment.src}
            alt="Path segment"
            className="w-full h-auto block"
            style={{ imageRendering: "pixelated" }}
          />
        ))}
      </div>

      <div className="absolute top-0 pt-[2vw] left-0 w-full z-20 flex justify-center">
        <img
          src={logo}
          alt="Cosy Logo"
          className="w-[45vw] h-auto"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </div>
  );
};

export default GameServerBackground;
