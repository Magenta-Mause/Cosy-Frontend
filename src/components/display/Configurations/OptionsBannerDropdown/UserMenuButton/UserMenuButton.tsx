import { Button } from "@components/ui/button.tsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import person from "@/assets/icons/user.svg";
import { cn } from "@/lib/utils.ts";
import { UserProfileModal } from "@components/display/UserManagement/UserProfileModal/UserProfileModal.tsx";

const UserMenuButton = () => {
  const [isUserOpen, setIsUserOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Button
        onClick={() => setIsUserOpen((prev) => !prev)}
        className={cn("w-fit p-[.5vw] aspect-square")}
        aria-label={t("optionsBanner.userMenu")}
      >
        <img src={person} alt="User Menu Icon" className="h-[2.5vw] p-0 w-auto aspect-square" />
      </Button>
      <UserProfileModal open={isUserOpen} onOpenChange={setIsUserOpen} />
    </>
  );
};

export default UserMenuButton;
