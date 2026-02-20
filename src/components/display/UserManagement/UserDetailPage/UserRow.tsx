import ResourceUsageBadge from "@components/display/ResourceUsageBadge/ResourceUsageBadge";
import UserRoleBadge from "@components/display/UserRoleBadge/UserRoleBadge";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { type UserEntityDto, UserEntityDtoRole } from "@/api/generated/model";
import { formatMemoryLimit } from "@/lib/memoryFormatUtil.ts";
import ChangePasswordByAdminModal from "./ChangePasswordByAdminModal";
import DeleteUserConfirmationModal from "./DeleteUserConfirmationModal";

type UserAction = {
  label: string;
  onClick: () => void;
  className?: string;
};

const UserRow = (props: { user: UserEntityDto; userName: string; userRole: UserEntityDtoRole }) => {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordChangeDialogOpen, setPasswordChangeDialogOpen] = useState(false);
  const { role, uuid } = useContext(AuthContext);

  const userActions: UserAction[] = [
    {
      label: t("components.userManagement.userRow.actions.editPassword"),
      onClick: () => {
        setPasswordChangeDialogOpen(true);
      },
    },
    {
      label: t("components.userManagement.userRow.actions.deleteUser"),
      onClick: () => setDeleteDialogOpen(true),
      className: "text-destructive focus:text-destructive",
    },
  ];

  const canOpenMoreOptions =
    role === UserEntityDtoRole.OWNER ||
    (role === UserEntityDtoRole.ADMIN &&
      props.userRole !== UserEntityDtoRole.OWNER &&
      props.userRole !== UserEntityDtoRole.ADMIN) ||
    uuid === props.user.uuid;

  return (
    <>
      <Card>
        <CardContent className="flex gap-7 items-center my-3 justify-between">
          <div className="flex gap-2 font-semibold">
            {props.user.username}
            <UserRoleBadge role={props.userRole} />
          </div>
          {(props.userRole === "QUOTA_USER" || props.userRole === "ADMIN") && (
            <div className="flex gap-3 flex-1 justify-end">
              <ResourceUsageBadge
                currentValue="calculate_me"
                limit={
                  props.user.docker_hardware_limits?.docker_max_cpu_cores != null
                    ? props.user.docker_hardware_limits.docker_max_cpu_cores
                    : t("components.userManagement.userRow.resources.unlimited")
                }
                resourceType={t("components.userManagement.userRow.resources.cpus")}
              />
              <ResourceUsageBadge
                currentValue="calculate_me"
                limit={
                  props.user.docker_hardware_limits?.docker_memory_limit != null
                    ? formatMemoryLimit(props.user.docker_hardware_limits.docker_memory_limit)
                    : t("components.userManagement.userRow.resources.unlimited")
                }
                resourceType={t("components.userManagement.userRow.resources.memory")}
              />
            </div>
          )}
          <div>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild disabled={!canOpenMoreOptions}>
                <Button className="h-10 w-10">
                  <Ellipsis className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {userActions.map((action) => (
                  <DropdownMenuItem
                    key={action.label}
                    onClick={action.onClick}
                    className={action.className}
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <DeleteUserConfirmationModal
        user={props.user}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
      <ChangePasswordByAdminModal
        user={props.user}
        open={passwordChangeDialogOpen}
        onClose={() => setPasswordChangeDialogOpen(false)}
      />
    </>
  );
};

export default UserRow;
