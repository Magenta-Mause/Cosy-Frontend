import { DeleteGameServerSuccessDialog } from "@components/display/GameServer/DeleteGameServerAlertDialog/DeleteGameServerSuccessDialog";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import GameServerBackground from "@/components/display/GameServer/GameServerBackground/GameServerBackground.tsx";
import GameServerDisplay from "@/components/display/GameServer/GameServerDisplay/GameServerDisplay.tsx";
import LoginDisplay from "@/components/display/Login/LoginDisplay/LoginDisplay.tsx";
import { InviteRedemptionModal } from "@/components/display/UserManagement/UserInvite/InviteRedemptionModal/InviteRedemptionModal.tsx";
import { useTypedSelector } from "@/stores/rootReducer.ts";

interface IndexSearch {
  inviteToken?: string;
  deleted?: boolean;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => {
    return {
      inviteToken: typeof search.inviteToken === "string" ? search.inviteToken : undefined,
      deleted:
        typeof search.deleted === "boolean"
          ? search.deleted
          : typeof search.deleted === "string"
            ? search.deleted === "true"
            : undefined,
    };
  },
  component: Index,
});

function Index() {
  const gameServers = useTypedSelector((state) => state.gameServerSliceReducer.data);
  const { inviteToken, deleted } = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleCloseInvite = () => {
    navigate({
      search: {},
      replace: true,
    });
  };

  const handleCloseDeleteSuccess = () => {
    navigate({
      search: inviteToken ? { inviteToken } : {},
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

        <DeleteGameServerSuccessDialog open={deleted === true} onClose={handleCloseDeleteSuccess} />

      </div>
    </div>
  );
}
