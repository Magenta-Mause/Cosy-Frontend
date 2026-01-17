import { Button } from "@components/ui/button";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/users")({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();



  return (
    <div className="p-2">
      <Button
        onClick={() => {
          router.navigate({
            to: '/',
          });
        }}>
        <ArrowLeft className="size-5" />
        Back
      </Button>
      <div className="container mx-auto py-20 flex flex-col gap-4">
        test yey


      </div>
    </div>
  );
}
