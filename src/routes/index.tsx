import UserDetailListRedirectButton from "@components/display/UserManagement/UserDetailPage/UserDetailListRedirectButton";
import { createFileRoute } from "@tanstack/react-router";
import bgImageBottom from "@/assets/MainPage/bg_day_bottom.png";
import bgImageLoop from "@/assets/MainPage/bg_day_loop.png";
import bgImageTop from "@/assets/MainPage/bg_day_top.png";
import path1 from "@/assets/MainPage/main_page9.png"
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

  // Original Bildmaße
  const imgWidth = 640;
  const topImageHeight = 360;
  const loopImageHeight = 62;
  const bottomImageHeight = 124;

  // Berechne Aspektverhältnisse
  const topAspectRatio = topImageHeight / imgWidth;
  const loopAspectRatio = loopImageHeight / imgWidth;
  const bottomAspectRatio = bottomImageHeight / imgWidth;

  const loopRepeat = 1;

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">

      {/* Background Wrapper */}
      <div className="absolute inset-0 flex flex-col">

        {/* Top */}
        <div
          style={{
            backgroundImage: `url(${bgImageTop})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            width: '100%',
            paddingTop: `${topAspectRatio * 100}%`,
            imageRendering: 'pixelated',
          }}
        />
        <div
          style={{
            backgroundImage: `url(${bgImageLoop})`,
            backgroundSize: '100% auto',
            backgroundRepeat: 'repeat-y',
            width: '100%',
            paddingTop: `${loopAspectRatio * loopRepeat * 100}%`,
            imageRendering: 'pixelated',
          }}
        />
        <div
          style={{
            backgroundImage: `url(${bgImageBottom})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            width: '100%',
            paddingTop: `${bottomAspectRatio * 100}%`,
            imageRendering: 'pixelated',
          }}
        />
      </div>
      <div className="absolute inset-0 z-5 pointer-events-none">
        <img
          src={path1}
          alt=""
          className="w-full h-auto"
          style={{
            imageRendering: 'pixelated',
          }}
        />
      </div>
      <div className="absolute inset-0 z-7 pointer-events-none">
        <div
          className="w-full mx-auto"
          style={{
            maxWidth: '100vw',
            aspectRatio: `${imgWidth} / ${topImageHeight + loopImageHeight * loopRepeat + bottomImageHeight}`,
            height: 'auto',
          }}
        >
          <div className="relative w-full h-full pointer-events-auto">
            <GameServerDisplay gameServerConfigurations={gameServers} />
          </div>
        </div>
      </div>

      {/* Content Layer - z-10 */}
      <div className="relative z-10 flex flex-col items-center pt-20 min-h-screen">
        <div className="flex flex-row justify-center items-start w-full max-w-300">
          <LoginDisplay />
        </div>

        {inviteToken && (
          <InviteRedemptionModal inviteToken={inviteToken} onClose={handleCloseInvite} />
        )}

        <div className="fixed right-10 top-1/4 -translate-y-1/2">
          <UserDetailListRedirectButton />
        </div>
      </div>
    </div>
  );
}
export default Index;
