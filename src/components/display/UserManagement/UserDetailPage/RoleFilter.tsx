import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Funnel } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserEntityDtoRole } from "@/api/generated/model";

interface RoleFilterProps {
  selectedRole: UserEntityDtoRole | null;
  onRoleChange: (role: UserEntityDtoRole | null) => void;
}

const RoleFilter = ({ selectedRole, onRoleChange }: RoleFilterProps) => {
  const { t } = useTranslation();

  const getRoleLabel = (role: UserEntityDtoRole) => {
    const roleMap = {
      OWNER: t("components.userManagement.userRow.roles.owner"),
      ADMIN: t("components.userManagement.userRow.roles.admin"),
      QUOTA_USER: t("components.userManagement.userRow.roles.quota_user"),
    };
    return roleMap[role];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Funnel className="size-6" />
          {selectedRole ? (
            <span>{getRoleLabel(selectedRole)}</span>
          ) : (
            t("components.userManagement.userTable.filter")
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onRoleChange("OWNER")}>
            {t("components.userManagement.userRow.roles.owner")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRoleChange("ADMIN")}>
            {t("components.userManagement.userRow.roles.admin")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRoleChange("QUOTA_USER")}>
            {t("components.userManagement.userRow.roles.quota_user")}
          </DropdownMenuItem>
          {selectedRole && (
            <>
              <div className="h-px bg-border my-1" />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onRoleChange(null)}
              >
                {t("components.userManagement.userTable.resetFilter")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoleFilter;
