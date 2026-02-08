import UserTable from "@components/display/UserManagement/UserDetailPage/UserTable";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider";
import { Button } from "@components/ui/button";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useContext, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { UserEntityDtoRole } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import { requireRoles } from "@/utils/routeGuards";

export const Route = createFileRoute("/users")({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { t } = useTranslation();
  const { revokeInvite } = useDataInteractions();
  const auth = useContext(AuthContext);
  const router = useRouter();

  const hasAccess = useMemo(
    () =>
      requireRoles(
        {
          authorized: auth.authorized,
          role: auth.role,
          username: auth.username,
        },
        [UserEntityDtoRole.OWNER, UserEntityDtoRole.ADMIN],
      ),
    [auth.authorized, auth.role, auth.username],
  );

  useEffect(() => {
    // Only redirect if auth has finished loading (not null) and user lacks access
    if (auth.authorized !== null && !hasAccess) {
      router.navigate({ to: "/" });
    }
  }, [hasAccess, auth.authorized, router]);

  // Show nothing while auth is loading or if user lacks access
  if (auth.authorized === null || !hasAccess) {
    return null;
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
