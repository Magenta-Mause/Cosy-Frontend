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

  const roles: UserEntityDtoRole[] = ["OWNER", "ADMIN", "QUOTA_USER"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Funnel className="size-5" />
          {selectedRole
            ? t(`components.userManagement.userRow.roles.${selectedRole.toLowerCase()}`)
            : t("components.userManagement.userTable.filter")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {roles.map((role) => (
            <DropdownMenuItem key={role} onClick={() => onRoleChange(role)}>
              {t(`components.userManagement.userRow.roles.${role.toLowerCase()}`)}
            </DropdownMenuItem>
          ))}

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
