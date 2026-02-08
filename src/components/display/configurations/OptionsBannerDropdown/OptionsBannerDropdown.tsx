import LanguageSelector from "@components/display/configurations/OptionsBannerDropdown/LanguageSelector/LanguageSelector.tsx";
import LogOutButton from "@components/display/configurations/OptionsBannerDropdown/LogOutButton/LogOutButton.tsx";
import UserMenuButton from "@components/display/configurations/OptionsBannerDropdown/UserMenuButton/UserMenuButton.tsx";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip.tsx";
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import banner from "@/assets/Banner.webp";
import { cn } from "@/lib/utils.ts";

const OptionsBannerDropdown = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userTooltipOpen, setUserTooltipOpen] = useState(false);
  const [logOutTooltipOpen, setLogOutTooltipOpen] = useState(false);
  const bannerRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();
  const { authorized } = useContext(AuthContext);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isInsideDialog = target.closest('[data-slot="dialog-content"]') !== null;
      const isInsidePopover = target.closest("[data-radix-popper-content-wrapper]") !== null;

      if (
        !isInsideDialog &&
        !isInsidePopover &&
        bannerRef.current &&
        !bannerRef.current.contains(event.target as Node)
      ) {
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

  useEffect(() => {
    const closeTooltipsWhenDialogOpens = () => {
      const hasOpenDialog = document.querySelector('[data-slot="dialog-overlay"]') !== null;
      if (hasOpenDialog) {
        setUserTooltipOpen(false);
        setLogOutTooltipOpen(false);
      }
    };

    const observer = new MutationObserver(closeTooltipsWhenDialogOpens);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const handleBannerClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLElement;
    const clickedElement = target.closest('button, a, [role="button"]');
    const wasBannerClicked = clickedElement?.id === "banner";

    if (wasBannerClicked) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <button
      id="banner"
      type="button"
      ref={bannerRef}
      onClick={(e) => handleBannerClicked(e)}
      aria-expanded={isExpanded}
      className={cn(
        "flex flex-col gap-4 p-6 items-center justify-center pb-10",
        "absolute z-50 -top-2 left-[5%]",
        "cursor-pointer transition-all duration-300 ease-in-out",
        "overflow-hidden border-0",
        isExpanded
          ? authorized
            ? "h-auto"
            : "h-auto -translate-y-[50%]"
          : "h-auto -translate-y-[75%] hover:translate-y-[calc(-75%+0.5rem)]",
      )}
      style={{
        backgroundImage: banner ? `url(${banner})` : undefined,
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
        <div className={isExpanded && !authorized ? "translate-y-[130%]" : ""}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <LanguageSelector onLanguageChange={() => setIsExpanded(false)} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{t("optionsBanner.languageSelector")}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {authorized && (
          <>
            <Tooltip open={userTooltipOpen} onOpenChange={setUserTooltipOpen}>
              <TooltipTrigger
                asChild
                onMouseDown={() => setUserTooltipOpen(false)}
                onPointerDown={() => setUserTooltipOpen(false)}
              >
                <div>
                  <UserMenuButton />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{t("optionsBanner.userMenu")}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip open={logOutTooltipOpen} onOpenChange={setLogOutTooltipOpen}>
              <TooltipTrigger
                asChild
                onMouseDown={() => setLogOutTooltipOpen(false)}
                onPointerDown={() => setLogOutTooltipOpen(false)}
              >
                <div>
                  <LogOutButton />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{t("optionsBanner.logout")}</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </button>
  );
};

export default OptionsBannerDropdown;
