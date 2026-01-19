import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Ellipsis } from "lucide-react";
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
      <div className="container text-base mx-auto py-20 flex flex-col gap-4">
        <Card>
          <CardContent className="flex gap-5 items-center m-2">
            User 1
            <div className="flex gap-3">
              <Badge className="rounded-xl text-sm px-3 bg-white">QUOTA</Badge>
              <Badge className="px-3 text-sm bg-accent">
                2/3 CPUs
              </Badge>
              <Badge className="px-3 text-sm bg-accent">
                4,2/6,9GB Memory
              </Badge>
              <Badge className="px-3 text-sm bg-accent">
                55/200GB Storage
              </Badge>
              <Badge className="px-3 text-sm bg-accent">
                1/4 Instances
              </Badge>
              <Button><Ellipsis /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
