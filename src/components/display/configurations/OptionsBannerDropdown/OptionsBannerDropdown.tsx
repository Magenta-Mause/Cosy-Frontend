import LanguageSelector from "@components/display/configurations/OptionsBannerDropdown/LanguageSelector/LanguageSelector.tsx";
import LogOutButton from "@components/display/configurations/OptionsBannerDropdown/LogOutButton/LogOutButton.tsx";
import UserMenuButton from "@components/display/configurations/OptionsBannerDropdown/UserMenuButton/UserMenuButton.tsx";
import banner from "@/assets/Banner.webp";
import { cn } from "@/lib/utils.ts";

const OptionsBannerDropdown = () => {
  return (
    <div
      className={cn("flex flex-col gap-4 p-4", "absolute z-50 top-0 right-0 mx-3 my-[1vw]")}
      style={{
        backgroundImage: banner ? `url(${banner})` : undefined,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "contain",
      }}
    >
      <LanguageSelector />
      <UserMenuButton />
      <LogOutButton />
    </div>
  );
};

export default OptionsBannerDropdown;
