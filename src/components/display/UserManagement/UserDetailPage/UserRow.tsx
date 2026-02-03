import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { Ellipsis } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type UserEntityDto, UserEntityDtoRole } from "@/api/generated/model";
import { formatMemoryLimit } from "@/lib/memoryFormatUtil.ts";
import UserRoleBadge from "@components/display/UserRoleBadge/UserRoleBadge";
import ResourceUsageBadge from "@components/display/ResourceUsageBadge/ResourceUsageBadge";

const UserRow = (props: { user: UserEntityDto; userName: string; userRole: UserEntityDtoRole }) => {
  const { t } = useTranslation();

  return (
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="h-10 w-10">
                <Ellipsis className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("components.userManagement.userRow.moreOptions")}</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRow;
