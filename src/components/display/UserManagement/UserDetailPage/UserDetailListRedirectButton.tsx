import { Button } from "@components/ui/button.tsx";
import { useRouter } from "@tanstack/react-router";
import { ArrowBigRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const UserDetailListRedirectButton = () => {
  const router = useRouter();
  const { t } = useTranslation();
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
