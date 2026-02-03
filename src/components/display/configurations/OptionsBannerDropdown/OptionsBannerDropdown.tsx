import LanguageSelector from "@components/display/configurations/OptionsBannerDropdown/LanguageSelector/LanguageSelector.tsx";
import LogOutButton from "@components/display/configurations/OptionsBannerDropdown/LogOutButton/LogOutButton.tsx";
import UserMenuButton from "@components/display/configurations/OptionsBannerDropdown/UserMenuButton/UserMenuButton.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip.tsx";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import banner from "@/assets/Banner.webp";
import { cn } from "@/lib/utils.ts";

const OptionsBannerDropdown = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const bannerRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bannerRef.current && !bannerRef.current.contains(event.target as Node)) {
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

  return (
    <button
      type="button"
      ref={bannerRef}
      onClick={() => setIsExpanded(!isExpanded)}
      aria-expanded={isExpanded}
      className={cn(
        "flex flex-col gap-4 p-6 items-center justify-center pb-10",
        "absolute z-50 -top-2 left-[5%]",
        "cursor-pointer transition-all duration-300 ease-in-out",
        "overflow-hidden border-0",
        isExpanded ? "h-auto" : "h-auto hover:translate-y-2",
      )}
      style={{
        backgroundImage: banner ? `url(${banner})` : undefined,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center left",
        backgroundSize: "cover",
        width: "4rem",
        minHeight: "15rem",
        transform: !isExpanded ? "translateY(-75%)" : undefined,
      }}
    >
      <div
        className={cn(
          "flex flex-col gap-4 items-center transition-opacity duration-300",
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <LanguageSelector />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{t("optionsBanner.languageSelector")}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <UserMenuButton />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{t("optionsBanner.userMenu")}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <LogOutButton />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{t("optionsBanner.logout")}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </button>
  );
};

export default OptionsBannerDropdown;
