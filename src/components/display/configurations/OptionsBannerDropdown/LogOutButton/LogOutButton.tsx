import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Button } from "@components/ui/button.tsx";
import { LogOut } from "lucide-react";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";
import { LogOutAlertDialog } from "./LogOutAlertDialog.tsx";

const LogOutButton = () => {
  const { t } = useTranslation();
  const { handleLogout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className={cn("h-auto p-[.5vw] aspect-square")}
        aria-label={t("optionsBanner.logout")}
        onClick={() => setOpen(true)}
      >
        <LogOut className="!h-[1.5vw] p-0 !w-auto aspect-square" />
      </Button>
      <LogOutAlertDialog open={open} onOpenChange={setOpen} onConfirm={handleLogout} />
    </>
  );
};

export default LogOutButton;
