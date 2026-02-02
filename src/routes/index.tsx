import UserDetailListRedirectButton from "@components/display/UserManagement/UserDetailPage/UserDetailListRedirectButton";
import { createFileRoute } from "@tanstack/react-router";
import bgImageBottom from "@/assets/MainPage/bg_day_bottom.png";
import bgImageLoop from "@/assets/MainPage/bg_day_loop.png";
import bgImageTop from "@/assets/MainPage/bg_day_top.png";
import path_1 from "@/assets/MainPage/path_1.png";
import path_2 from "@/assets/MainPage/path_2.png";
import pathLoop_1 from "@/assets/MainPage/platze_loop_1.png";
import pathLoop_2 from "@/assets/MainPage/platze_loop_2.png";
import pathLoop_3 from "@/assets/MainPage/platze_loop_3.png";
import pathLoop_4 from "@/assets/MainPage/platze_loop_4.png";
import pathLoop_5 from "@/assets/MainPage/platze_loop_5.png";
import pathLoop_6 from "@/assets/MainPage/platze_loop_6.png";
import GameServerDisplay from "@/components/display/GameServer/GameServerDisplay/GameServerDisplay.tsx";
import LoginDisplay from "@/components/display/Login/LoginDisplay/LoginDisplay.tsx";
import { InviteRedemptionModal } from "@/components/display/UserManagement/UserInvite/InviteRedemptionModal/InviteRedemptionModal.tsx";
import { useTypedSelector } from "@/stores/rootReducer.ts";

interface IndexSearch {
  inviteToken?: string;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => {
    return {
      inviteToken: typeof search.inviteToken === "string" ? search.inviteToken : undefined,
    };
  },
  component: Index,
});

const HOUSES_PER_CYCLE = 6;
const BASE_THRESHOLD = 2;

// Bildpfade
const images = {
  bg: {
    top: bgImageTop,
    loop: bgImageLoop,
    bottom: bgImageBottom,
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

  // Ab 3 Häusern: Basis + Loop-Segmente
  const segments = [{ id: "path-base-2", src: images.path[2] }];
  const housesAfterBase = houseCount - BASE_THRESHOLD;

  // Anzahl vollständiger PATH_LOOP_6-Zyklen
  const fullCycles = Math.floor((housesAfterBase - 1) / HOUSES_PER_CYCLE);

  // Restliche Häuser im aktuellen Zyklus
  const remainder = ((housesAfterBase - 1) % HOUSES_PER_CYCLE) + 1;

  // Füge vollständige PATH_LOOP_6 zur Basis hinzu
  for (let i = 0; i < fullCycles; i++) {
    segments.push({
      id: `path-cycle-${i}`,
      src: images.path.loop[5],
    });
  }

  // Füge aktuelles Loop-Segment hinzu
  segments.push({
    id: `path-loop-${remainder}`,
    src: images.path.loop[remainder - 1],
  });

  return segments;
}

function calculateBgLoops(houseCount: number) {
  const count = Math.ceil((houseCount - 1) / 2);
  return Array.from({ length: count }, (_, i) => ({
    id: `bg-loop-${i}`,
    src: images.bg.loop,
  }));
}

function Index() {
  const gameServers = useTypedSelector((state) => state.gameServerSliceReducer.data);
  const { inviteToken } = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleCloseInvite = () => {
    navigate({
      search: {},
      replace: true,
    });
  };

  const pathSegments = calculatePathSegments(gameServers.length + 1);
  const bgLoops = calculateBgLoops(gameServers.length + 1);

  return (
    <div className="relative w-screen overflow-x-hidden">
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

          <img
            src={images.bg.bottom}
            alt="BG Bottom"
            className="w-full h-auto block"
            style={{ imageRendering: "pixelated" }}
          />
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
        <div className="absolute top-0 left-0 w-full h-full pointer-events-auto">
          <GameServerDisplay gameServerConfigurations={gameServers} />
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full z-10 flex flex-col items-center pt-20 min-h-screen pointer-events-none">
        <div className="flex flex-row justify-center items-start w-full max-w-75 pointer-events-auto">
          <LoginDisplay />
        </div>

        {inviteToken && (
          <InviteRedemptionModal inviteToken={inviteToken} onClose={handleCloseInvite} />
        )}

        <div className="fixed right-10 top-1/4 -translate-y-1/2 pointer-events-auto">
          <UserDetailListRedirectButton />
        </div>
      </div>
    </div>
  );
}

export default Index;
