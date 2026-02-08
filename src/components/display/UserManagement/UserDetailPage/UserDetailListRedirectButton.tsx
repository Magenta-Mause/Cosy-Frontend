import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider";
import { Button } from "@components/ui/button.tsx";
import { useRouter } from "@tanstack/react-router";
import { ArrowBigRight } from "lucide-react";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { requireRoles } from "@/utils/routeGuards";

const UserDetailListRedirectButton = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const auth = useContext(AuthContext);

  const hasAccess = requireRoles(
    {
      authorized: auth.authorized,
      role: auth.role,
      username: auth.username,
    },
    ["OWNER", "ADMIN"],
  );

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
