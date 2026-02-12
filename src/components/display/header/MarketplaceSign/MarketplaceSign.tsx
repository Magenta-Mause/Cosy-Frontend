import { Button } from "@components/ui/button.tsx";
import { useRouter } from "@tanstack/react-router";
import { ArrowBigRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UserEntityDtoRole } from "@/api/generated/model";
import marktplatzSchild from "@/assets/header/MarktplatzSchild.png";
import { useRequireRoles } from "@/utils/routeGuards";

const MarketplaceSign = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const hasAccess = useRequireRoles([UserEntityDtoRole.OWNER, UserEntityDtoRole.ADMIN]);

  if (!hasAccess) {
    return null;
  }

  return (
    <div
      className="fixed z-50 right-[5%] flex items-end justify-center"
      style={{
        backgroundImage: `url(${marktplatzSchild})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "top center",
      }}
    >
      <div className="pt-16 pb-3 px-2">
        <Button
          size="sm"
          onClick={() => router.navigate({ to: "/users" })}
        >
          {t("components.userManagement.userDetailButton.viewUsers")} <ArrowBigRight />
        </Button>
      </div>
    </div>
  );
};

export default MarketplaceSign;
