import { Button } from "@components/ui/button.tsx";
import { User } from "lucide-react";
import type { ComponentProps } from "react";
import { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";
import { UserModal } from "../../../UserManagement/UserModal/UserModal.tsx";

type UserMenuButtonProps = ComponentProps<typeof Button>;

const UserMenuButton = forwardRef<HTMLButtonElement, UserMenuButtonProps>(
  ({ onClick, ...props }, ref) => {
    const [isUserOpen, setIsUserOpen] = useState(false);
    const { t } = useTranslation();

    return (
      <>
        <Button
          {...props}
          ref={ref}
          onClick={(event) => {
            onClick?.(event);
            setIsUserOpen((prev) => !prev);
          }}
          className={cn("h-auto aspect-square", props.className)}
          aria-label={t("optionsBanner.userMenu")}
        >
          <User className="size-6" />
        </Button>
        <UserModal open={isUserOpen} onOpenChange={setIsUserOpen} />
      </>
    );
  },
);

UserMenuButton.displayName = "UserMenuButton";

export default UserMenuButton;
