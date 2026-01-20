import UserRow from "@components/display/UserManagement/UserDetailPage/UserRow";
import { Button } from "@components/ui/button";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
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
      <Button onClick={() => router.navigate({ to: "/" })}>
        <ArrowLeft className="size-5" />
        Back
      </Button>

      <div className="container text-base mx-auto py-20 flex flex-col gap-2 px-40">
        {users?.map((user, index) => (
          <UserRow
            user={user}
            key={user.uuid || index}
            userName={user.username ?? "Unknown"}
            userRole={user.role ?? "QUOTA_USER"}
          />
        ))}
      </div>
    </div>
  );
}
