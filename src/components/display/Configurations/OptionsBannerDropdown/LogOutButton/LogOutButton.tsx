import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Button } from "@components/ui/button.tsx";
import { LogOut } from "lucide-react";
import { forwardRef, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";
import { LogOutAlertDialog } from "./LogOutAlertDialog.tsx";

type LogOutButtonProps = React.ComponentProps<typeof Button>;

const LogOutButton = forwardRef<HTMLButtonElement, LogOutButtonProps>(
  ({ onClick, ...props }, ref) => {
    const { t } = useTranslation();
    const { handleLogout } = useContext(AuthContext);
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button
          {...props}
          ref={ref}
          className={cn("h-auto p-[.5vw] aspect-square")}
          aria-label={t("optionsBanner.logout")}
          onClick={(event) => {
            onClick?.(event);
            setOpen(true);
          }}
        >
          <LogOut className="!h-[1.5vw] p-0 !w-auto aspect-square" />
        </Button>
        <LogOutAlertDialog open={open} onOpenChange={setOpen} onConfirm={handleLogout} />
      </>
    );
  },
);

LogOutButton.displayName = "LogOutButton";

export default LogOutButton;
