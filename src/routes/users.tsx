import UserTable from "@components/display/UserManagement/UserDetailPage/UserTable";
import { GameServerNotFoundPage } from "@components/display/GameServer/GameServerNotFoundPage/GameServerNotFoundPage";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider";
import { Button } from "@components/ui/button";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { UserEntityDtoRole } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import { useRequireRoles } from "@/utils/routeGuards";

export const Route = createFileRoute("/users")({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { t } = useTranslation();
  const { revokeInvite } = useDataInteractions();
  const auth = useContext(AuthContext);
  const router = useRouter();

  const hasAccess = useRequireRoles([UserEntityDtoRole.OWNER, UserEntityDtoRole.ADMIN]);

  // Show nothing while auth is loading
  if (auth.authorized === null) {
    return null;
  }

  if (!hasAccess) {
    return <GameServerNotFoundPage />;
  }

  return (
    <div className="p-2">
      <Button onClick={() => router.navigate({ to: "/" })}>
        <ArrowLeft className="size-5" />
        {t("components.userManagement.backButton")}
      </Button>

      <UserTable onRevoke={revokeInvite} />
    </div>
  );
}
