import UserTable from "@components/display/UserManagement/UserDetailPage/UserTable";
import { Button } from "@components/ui/button";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";

export const Route = createFileRoute("/users")({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { t } = useTranslation();
  const { revokeInvite } = useDataInteractions();

  const router = useRouter();

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
