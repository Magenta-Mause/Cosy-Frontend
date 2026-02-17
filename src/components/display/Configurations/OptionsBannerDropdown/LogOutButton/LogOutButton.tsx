import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Button } from "@components/ui/button.tsx";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import logout from "@/assets/icons/logout.svg";
import { cn } from "@/lib/utils.ts";
import { LogOutAlertDialog } from "./LogOutAlertDialog.tsx";

const LogOutButton = () => {
  const { t } = useTranslation();
  const { handleLogout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className={cn("w-fit p-[.5vw] aspect-square")}
        aria-label={t("optionsBanner.logout")}
        onClick={() => setOpen(true)}
      >
        <img src={logout} alt="Logout Icon" className="h-[2.5vw] p-0 w-auto aspect-square" />
      </Button>
      <LogOutAlertDialog open={open} onOpenChange={setOpen} onConfirm={handleLogout} />
    </>
  );
};

export default LogOutButton;
