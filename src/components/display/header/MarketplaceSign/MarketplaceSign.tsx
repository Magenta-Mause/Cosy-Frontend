import { Button } from "@components/ui/button.tsx";
import { useRouter } from "@tanstack/react-router";
import { ArrowBigRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserEntityDtoRole } from "@/api/generated/model";
import marktplatzSchild from "@/assets/header/MarktplatzSchild.png";
import { cn } from "@/lib/utils.ts";
import { useRequireRoles } from "@/utils/routeGuards";

const MarketplaceSign = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const signRef = useRef<HTMLButtonElement>(null);

  const hasAccess = useRequireRoles([UserEntityDtoRole.OWNER, UserEntityDtoRole.ADMIN]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (signRef.current && !signRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  if (!hasAccess) {
    return null;
  }

  return (
    <button
      type="button"
      ref={signRef}
      onClick={() => setIsExpanded(!isExpanded)}
      className={cn(
        "flex flex-col gap-4 p-6 items-center justify-center pb-10",
        "fixed z-50 -top-2 right-[5%]",
        "cursor-pointer transition-all duration-300 ease-in-out",
        "overflow-hidden border-0",
        isExpanded
          ? "h-auto"
          : "h-auto -translate-y-[75%] hover:translate-y-[calc(-75%+0.5rem)]",
      )}
      style={{
        backgroundImage: marktplatzSchild ? `url(${marktplatzSchild})` : undefined,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom",
        backgroundSize: "cover",
        width: "4rem",
        minHeight: "15rem",
      }}
    >
      <div
        className={cn(
          "flex flex-col gap-4 items-center transition-opacity duration-300",
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <Button
          onClick={(e) => {
            e.stopPropagation();
            router.navigate({ to: "/users" });
          }}
        >
          {t("components.userManagement.userDetailButton.viewUsers")} <ArrowBigRight />
        </Button>
      </div>
    </button>
  );
};

export default MarketplaceSign;
