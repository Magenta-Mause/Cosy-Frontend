import { GameServerNotFoundPage } from "@components/display/GameServer/GameServerNotFoundPage/GameServerNotFoundPage";
import BackToHomeLink from "@components/display/GameServer/GameServerDetailPageLayout/BackToHomeLink";
import UserTable from "@components/display/UserManagement/UserDetailPage/UserTable";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider";
import { createFileRoute } from "@tanstack/react-router";
import { useContext } from "react";
import { UserEntityDtoRole } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import { useRequireRoles } from "@/utils/routeGuards";

export const Route = createFileRoute("/users")({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { revokeInvite } = useDataInteractions();
  const auth = useContext(AuthContext);

  const hasAccess = useRequireRoles([UserEntityDtoRole.OWNER, UserEntityDtoRole.ADMIN]);

  // Show nothing while auth is loading
  if (auth.authorized === null) {
    return null;
  }

  if (!hasAccess) {
    return <GameServerNotFoundPage />;
  }

  return (
    <div className="relative p-2">
      <BackToHomeLink className="absolute left-4 top-22" />

      <div className="flex justify-center">
        <UserTable onRevoke={revokeInvite} />
      </div>
    </div>
  );
}
