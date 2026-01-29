import UserDetailListRedirectButton from "@components/display/UserManagement/UserDetailPage/UserDetailListRedirectButton";
import { createFileRoute } from "@tanstack/react-router";
import bgImageBottom from "@/assets/MainPage/bg_day_bottom.png";
import bgImageLoop from "@/assets/MainPage/bg_day_loop.png";
import bgImageTop from "@/assets/MainPage/bg_day_top.png";
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

  // Deine Maße
  const topImageHeight = 360;
  const loopImageHeight = 64;
  const bottomImageHeight = 124;
  const loopRepeat = 10; // Erhöhe dies, damit der Content Platz hat!
  const imgWidth = 640;

  const totalHeight = topImageHeight + (loopImageHeight * loopRepeat) + bottomImageHeight;

  return (
    // Hintergrundfarbe setzen, damit links/rechts vom 640px Bild kein weißer Rand ist
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-black">

      {/* Background Wrapper: Zentriert die 640px Bilder */}
      <div className="absolute inset-0 flex flex-col items-center">
        <div style={{ width: `${imgWidth}px`, height: `${totalHeight}px` }}>

          {/* Top */}
          <div style={{
            backgroundImage: `url(${bgImageTop})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            height: `${topImageHeight}px`
          }} />

          {/* Loop */}
          <div style={{
            backgroundImage: `url(${bgImageLoop})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'repeat-y',
            height: `${loopImageHeight * loopRepeat}px`
          }} />

          {/* Bottom */}
          <div style={{
            backgroundImage: `url(${bgImageBottom})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            height: `${bottomImageHeight}px`
          }} />
        </div>
      </div>

      {/* Content Layer: Liegt über dem Hintergrund */}
      <div
        className="relative z-10 flex flex-col items-center pt-20"
        style={{ minHeight: `${totalHeight}px` }}
      >
        <div className="flex flex-row justify-center items-start w-full max-w-[1200px]">
          <GameServerDisplay gameServerConfigurations={gameServers} />
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
