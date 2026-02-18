import LanguageSelector from "@components/display/Configurations/OptionsBannerDropdown/LanguageSelector/LanguageSelector.tsx";
import LogOutButton from "@components/display/Configurations/OptionsBannerDropdown/LogOutButton/LogOutButton.tsx";
import UserMenuButton from "@components/display/Configurations/OptionsBannerDropdown/UserMenuButton/UserMenuButton.tsx";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import banner from "@/assets/header/Banner.webp";
import { cn } from "@/lib/utils.ts";

const OptionsBannerDropdown = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOpenDialog, setHasOpenDialog] = useState(false);
  const [userTooltipOpen, setUserTooltipOpen] = useState(false);
  const [logOutTooltipOpen, setLogOutTooltipOpen] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useTranslation();
  const { authorized } = useContext(AuthContext);

  const handleMouseEnter = () => {
    if (hasOpenDialog) return;
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    if (hasOpenDialog) return;
    collapseTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const syncDialogState = () => {
      const hasOpenDialog = document.querySelector('[data-slot="dialog-overlay"]') !== null;
      setHasOpenDialog(hasOpenDialog);
      if (hasOpenDialog) {
        setIsExpanded(false);
        setUserTooltipOpen(false);
        setLogOutTooltipOpen(false);
      }
    };

    syncDialogState();

    const observer = new MutationObserver(syncDialogState);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const handleBannerClicked = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasOpenDialog) return;
    const target = e.target as HTMLElement;
    const clickedElement = target.closest('button, a, [role="button"]');
    const wasBannerClicked = clickedElement?.id === "banner" || target.id === "banner";

    if (wasBannerClicked) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Banner is an interactive container for nested controls
    <div
      id="banner"
      ref={bannerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => handleBannerClicked(e)}
      onKeyDown={(e) => {
        if (hasOpenDialog) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }}
      className={cn(
        "flex flex-col gap-4 items-center justify-center",
        "fixed z-50 -top-2 left-[5%]",
        "cursor-pointer transition-all duration-300 ease-in-out",
        "overflow-hidden border-0",
        hasOpenDialog && "pointer-events-none",
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
        paddingInline: "2%",
        paddingTop: "2%",
        paddingBottom: "3%",
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
          <TooltipWrapper tooltip={t("optionsBanner.languageSelector")} side="right" asChild>
            <div>
              <LanguageSelector onLanguageChange={() => setIsExpanded(false)} />
            </div>
          </TooltipWrapper>
        </div>
        {authorized && (
          <>
            <TooltipWrapper
              tooltip={t("optionsBanner.userMenu")}
              side="right"
              open={userTooltipOpen}
              onOpenChange={setUserTooltipOpen}
              triggerProps={{
                onMouseDown: () => setUserTooltipOpen(false),
                onPointerDown: () => setUserTooltipOpen(false),
              }}
              asChild
            >
              <UserMenuButton />
            </TooltipWrapper>
            <TooltipWrapper
              tooltip={t("optionsBanner.logout")}
              side="right"
              open={logOutTooltipOpen}
              onOpenChange={setLogOutTooltipOpen}
              triggerProps={{
                onMouseDown: () => setLogOutTooltipOpen(false),
                onPointerDown: () => setLogOutTooltipOpen(false),
              }}
              asChild
            >
              <LogOutButton />
            </TooltipWrapper>
          </>
        )}
      </div>
    </div>
  );
};

export default OptionsBannerDropdown;
