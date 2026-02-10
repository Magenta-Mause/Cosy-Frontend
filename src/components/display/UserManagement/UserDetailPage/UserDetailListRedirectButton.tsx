import { Button } from "@components/ui/button.tsx";
import { useRouter } from "@tanstack/react-router";
import { ArrowBigRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UserEntityDtoRole } from "@/api/generated/model";
import { useRequireRoles } from "@/utils/routeGuards";

const UserDetailListRedirectButton = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const hasAccess = useRequireRoles([UserEntityDtoRole.OWNER, UserEntityDtoRole.ADMIN]);

  if (!hasAccess) {
    return null;
  }

  return (
    <Button
      onClick={() => {
        router.navigate({
          to: "/users",
        });
      }}
    >
      {t("components.userManagement.userDetailButton.viewUsers")} <ArrowBigRight />
    </Button>
  );
};

export default UserDetailListRedirectButton;
