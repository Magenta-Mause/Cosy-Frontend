import { UserList } from "@components/display/UserManagement/UserModal/UserList";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
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
      <div className="container mx-auto py-20 flex flex-col gap-4">
        test yey
        <Card>
          <CardContent className="flex gap-2 items-center m-2">
            User 1
            <Badge>Admin</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
