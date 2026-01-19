import ResourceUsageBadge from "@components/display/UserManagement/UserDetailPage/ResourceUsageBadge";
import UserRow from "@components/display/UserManagement/UserDetailPage/UserRow";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Ellipsis } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserEntityDtoRole } from "@/api/generated/model";
import { useTypedSelector } from "@/stores/rootReducer";

export const Route = createFileRoute("/users")({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const users = useTypedSelector((state) => state.userSliceReducer.data);

  return (
    <div className="p-2">
      <Button
        onClick={() => {
          router.navigate({
            to: "/",
          });
        }}
      >
        <ArrowLeft className="size-5" />
        Back
      </Button>
      <div className="container text-base mx-auto py-20 flex flex-col gap-2 px-40">
        <UserRow userName="Jannox" userRole="QUOTA_USER" />
        <UserRow userName="Lafaffi" userRole="ADMIN" />
        <UserRow userName="Neinika" userRole="OWNER" />
        <UserRow userName="Jannox" userRole="QUOTA_USER" />
        <UserRow userName="Jannox" userRole="QUOTA_USER" />
        <UserRow userName="Jannox" userRole="QUOTA_USER" />
        <UserRow userName="Jannox" userRole="QUOTA_USER" />
        <UserRow userName="Jannox" userRole="QUOTA_USER" />
        <UserRow userName="Jannox" userRole="QUOTA_USER" />
        <UserRow userName="Jannox" userRole="QUOTA_USER" />
        <UserRow userName="Jannox" userRole="QUOTA_USER" />

      </div>
    </div>
  );
}
