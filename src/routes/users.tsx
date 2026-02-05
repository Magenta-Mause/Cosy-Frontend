import UserTable from "@components/display/UserManagement/UserDetailPage/UserTable";
import { Button } from "@components/ui/button";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

  useEffect(() => {
    const hasAccess = requireRoles(
      {
        authorized: auth.authorized,
        role: auth.role,
        username: auth.username,
      },
      ["OWNER", "ADMIN"]
    );

    if (!hasAccess) {
      router.navigate({ to: "/" });
    }
  }, [auth.authorized, auth.role, auth.username, router]);

  const hasAccess = requireRoles(
    {
      authorized: auth.authorized,
      role: auth.role,
      username: auth.username,
    },
    ["OWNER", "ADMIN"]
  );

  if (!hasAccess) {
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
