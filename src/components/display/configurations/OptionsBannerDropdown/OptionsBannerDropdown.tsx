import LanguageSelector from "@components/display/configurations/OptionsBannerDropdown/LanguageSelector/LanguageSelector.tsx";
import LogOutButton from "@components/display/configurations/OptionsBannerDropdown/LogOutButton/LogOutButton.tsx";
import UserMenuButton from "@components/display/configurations/OptionsBannerDropdown/UserMenuButton/UserMenuButton.tsx";
import { useEffect, useRef, useState } from "react";
import banner from "@/assets/Banner.webp";
import { cn } from "@/lib/utils.ts";

const OptionsBannerDropdown = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const bannerRef = useRef<HTMLButtonElement>(null);

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
        <LanguageSelector />
        <UserMenuButton />
        <LogOutButton />
      </div>
    </button>
  );
};

export default OptionsBannerDropdown;
