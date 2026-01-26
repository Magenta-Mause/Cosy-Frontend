import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { Ellipsis } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserEntityDto, UserEntityDtoRole } from "@/api/generated/model";
import { cn } from "@/lib/utils";
import ResourceUsageBadge from "./ResourceUsageBadge";

const UserRow = (props: { user: UserEntityDto; userName: string; userRole: UserEntityDtoRole }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="flex gap-7 items-center my-3 justify-between">
        <div className="flex gap-2 font-semibold">
          {props.user.username}
          <Badge
            className={cn(
              "rounded-xl text-sm px-3 uppercase",
              props.user.role === "OWNER" && "bg-[#0eaf9b]",
              props.user.role === "ADMIN" && "bg-[#8ff8e2]",
              props.user.role === "QUOTA_USER" && "bg-white",
            )}
          >
            {t(`components.userManagement.userRow.roles.${props.userRole.toLowerCase()}`)}
          </Badge>
        </div>
        {(props.userRole === "QUOTA_USER" || props.userRole === "ADMIN") && (
          <div className="flex gap-3 flex-1 justify-end">
            <ResourceUsageBadge
              currentValue="2"
              limit={props.user.max_cpu != null ? props.user.max_cpu / 1000 : t("components.userManagement.userRow.resources.unlimited")}
              resourceType={t("components.userManagement.userRow.resources.cpus")}
            />
            <ResourceUsageBadge
              currentValue="4,3"
              limit={props.user.max_memory != null ? props.user.max_memory : t("components.userManagement.userRow.resources.unlimited")}
              unit={props.user.max_memory != null ? "MB" : undefined}
              resourceType={t("components.userManagement.userRow.resources.memory")}
            />
            <ResourceUsageBadge
              currentValue="55"
              limit={299}
              unit="GB"
              resourceType={t("components.userManagement.userRow.resources.storage")}
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
