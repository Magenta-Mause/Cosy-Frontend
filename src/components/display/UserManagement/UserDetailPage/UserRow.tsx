import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Ellipsis } from "lucide-react";
import type { UserEntityDto, UserEntityDtoRole } from "@/api/generated/model";
import { cn } from "@/lib/utils";
import ResourceUsageBadge from "./ResourceUsageBadge";

const UserRow = (props: { user: UserEntityDto; userName: string; userRole: UserEntityDtoRole }) => {

  return (
    <Card>
      <CardContent className="flex gap-7 items-center m-3 justify-between">
        <div className="flex gap-2">
          {props.user.username}
          <Badge
            className={cn(
              "rounded-xl text-sm px-3",
              props.user.role === "OWNER" && "bg-[#eaaded]",
              props.user.role === "ADMIN" && "bg-[#8fd3ff]",
              props.user.role === "QUOTA_USER" && "bg-white",
            )}
          >
            {props.userRole === 'QUOTA_USER' ? 'QUOTA' : props.user.role}
          </Badge>
        </div>
        {(props.userRole === 'QUOTA_USER' || props.userRole === 'ADMIN') && (
          <div className="flex gap-3 flex-1 justify-end">
            {props.user.max_cpu != null &&
              <ResourceUsageBadge currentValue="2" limit={props.user.max_cpu} resourceTyp="CPUs" />
            }
            {props.user.max_memory != null &&
              <ResourceUsageBadge currentValue="4,3" limit={props.user.max_memory} unit="GB" resourceTyp="Memory" />
            }
            <ResourceUsageBadge currentValue="55" limit={299} unit="GB" resourceTyp="Storage" />
            <ResourceUsageBadge currentValue="1" limit={99} resourceTyp="Instances" />
          </div>
        )}
        <div>
          <Button>
            <Ellipsis />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRow;
