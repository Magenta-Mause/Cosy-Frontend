import ResourceUsageBadge from "@components/display/ResourceUsageBadge/ResourceUsageBadge";
import { UserProfileModal } from "@components/display/UserManagement/UserProfileModal/UserProfileModal.tsx";
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
import Icon from "@components/ui/Icon.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper";
import { useContext, useState } from "react";
import { type UserEntityDto, UserEntityDtoRole } from "@/api/generated/model";
import dotsIcon from "@/assets/icons/dots.svg";
import userIcon from "@/assets/icons/user.svg";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { useUserResourceUsage } from "@/hooks/useUserResourceUsage/useUserResourceUsage";
import { formatMemoryLimit } from "@/lib/memoryFormatUtil";
import ChangePasswordByAdminModal from "./ChangePasswordByAdminModal";
import ChangeRoleModal from "./ChangeRoleModal";
import DeleteUserConfirmationModal from "./DeleteUserConfirmationModal";
import UpdateDockerLimitsModal from "./UpdateDockerLimitsModal";

type UserAction = {
  label: string;
  onClick: () => void;
  className?: string;
  hidden?: boolean;
};

const UserRow = (props: { user: UserEntityDto; userName: string; userRole: UserEntityDtoRole }) => {
  const { t } = useTranslationPrefix("components.userManagement.userRow");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordChangeDialogOpen, setPasswordChangeDialogOpen] = useState(false);
  const [dockerLimitsDialogOpen, setDockerLimitsDialogOpen] = useState(false);
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const { role, uuid } = useContext(AuthContext);
  const isCurrentUser = uuid === props.user.uuid;
  const { cpuUsage, memoryUsage } = useUserResourceUsage(props.user.uuid);

  const canUpdateDockerLimits =
    role === UserEntityDtoRole.OWNER ||
    (role === UserEntityDtoRole.ADMIN && props.userRole === UserEntityDtoRole.QUOTA_USER);

  const canChangeRole =
    role === UserEntityDtoRole.OWNER && props.userRole !== UserEntityDtoRole.OWNER;

  const userActions: UserAction[] = [
    {
      label: t("actions.editPassword"),
      onClick: () => setPasswordChangeDialogOpen(true),
    },
    {
      label: t("actions.editDockerLimits"),
      onClick: () => setDockerLimitsDialogOpen(true),
      hidden: !canUpdateDockerLimits,
    },
    {
      label: t("actions.editRole"),
      onClick: () => setChangeRoleDialogOpen(true),
      hidden: !canChangeRole,
    },
    {
      label: t("actions.deleteUser"),
      onClick: () => setDeleteDialogOpen(true),
      className: "text-destructive focus:text-destructive",
      hidden: props.userRole === UserEntityDtoRole.OWNER,
    },
  ];

  const canOpenMoreOptions =
    role === UserEntityDtoRole.OWNER ||
    (role === UserEntityDtoRole.ADMIN &&
      props.userRole !== UserEntityDtoRole.OWNER &&
      props.userRole !== UserEntityDtoRole.ADMIN) ||
    isCurrentUser;

  return (
    <>
      <Card className={isCurrentUser ? "border-primary bg-primary/5" : undefined}>
        <CardContent className="flex gap-7 items-center my-3 justify-between">
          <div className="flex gap-2 font-semibold items-center">
            {props.user.username}
            <UserRoleBadge role={props.userRole} />
            {isCurrentUser && (
              <TooltipWrapper tooltip={t("yourProfile")}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setUserModalOpen(true)}
                >
                  <Icon src={userIcon} className="size-4" variant="foreground" bold="sm" />
                </Button>
              </TooltipWrapper>
            )}
          </div>

          <div className="flex gap-3 flex-1 justify-end">
            <ResourceUsageBadge
              currentValue={cpuUsage}
              limit={
                props.user.docker_hardware_limits?.docker_max_cpu_cores != null
                  ? props.user.docker_hardware_limits.docker_max_cpu_cores
                  : t("resources.unlimited")
              }
              resourceType={t("resources.cpus")}
            />

            <ResourceUsageBadge
              currentValue={memoryUsage}
              limit={
                props.user.docker_hardware_limits?.docker_memory_limit != null
                  ? formatMemoryLimit(props.user.docker_hardware_limits.docker_memory_limit)
                  : t("resources.unlimited")
              }
              resourceType={t("resources.memory")}
            />
          </div>

          <div>
            <DropdownMenu modal={false}>
              <TooltipWrapper tooltip={t("moreOptions")}>
                <DropdownMenuTrigger asChild disabled={!canOpenMoreOptions}>
                  <Button className="h-10 w-10">
                    <Icon src={dotsIcon} className="size-6" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipWrapper>

              <DropdownMenuContent align="end">
                {userActions
                  .filter((action) => !action.hidden)
                  .map((action) => (
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

      <UpdateDockerLimitsModal
        user={props.user}
        open={dockerLimitsDialogOpen}
        onClose={() => setDockerLimitsDialogOpen(false)}
      />

      <ChangeRoleModal
        user={props.user}
        open={changeRoleDialogOpen}
        onClose={() => setChangeRoleDialogOpen(false)}
      />

      <UserProfileModal open={userModalOpen} onOpenChange={setUserModalOpen} />
    </>
  );
};

export default UserRow;
