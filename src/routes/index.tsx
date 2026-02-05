import UserDetailListRedirectButton from "@components/display/UserManagement/UserDetailPage/UserDetailListRedirectButton";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import GameServerBackground from "@/components/display/GameServer/GameServerBackground/GameServerBackground.tsx";
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

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("homeScrollPosition");
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10));
      sessionStorage.removeItem("homeScrollPosition");
    }
  }, []);

  return (
    <div className="relative w-full min-h-screen">
      <div className="relative w-full">
        <GameServerBackground houseCount={gameServers.length + 1} />

        <div className="absolute top-0 left-0 w-full h-full pointer-events-auto">
          <GameServerDisplay gameServerConfigurations={gameServers} />
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full z-50 flex flex-col items-center pt-20 pointer-events-none">
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
