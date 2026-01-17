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
            <Badge className="rounded-md text-2xl p-3">Quota</Badge>
            <Badge className="rounded-md flex flex-col justify-center p-2">
              <span>2/3</span>
              <span>CPUs</span>
            </Badge>
            <Badge className="rounded-md flex flex-col justify-center p-2">
              <span>4,2/6,9 GB</span>
              <span>Memory</span>
            </Badge>
            <Badge className="rounded-md flex flex-col justify-center p-2">
              <span>55/200 GB</span>
              <span>Storage</span>
            </Badge>
            <Badge className="rounded-md flex flex-col justify-center p-2">
              <span>1/4</span>
              <span>Intance</span>
            </Badge>
            <Badge className="rounded-md text-2xl p-3">...</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
