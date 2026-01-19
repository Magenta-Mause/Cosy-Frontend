import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Ellipsis } from "lucide-react";
import type { UserEntityDtoRole } from "@/api/generated/model";
import { cn } from "@/lib/utils";
import ResourceUsageBadge from "./ResourceUsageBadge";

const UserRow = (props: { userName: string; userRole: UserEntityDtoRole }) => {

  return (
    <Card>
      <CardContent className="flex gap-7 items-center m-3 justify-between">
        <div className="flex gap-2">
          {props.userName}
          <Badge
            className={cn(
              "rounded-xl text-sm px-3",
              props.userRole === "OWNER" && "bg-[#eaaded]",
              props.userRole === "ADMIN" && "bg-[#8fd3ff]",
              props.userRole === "QUOTA_USER" && "bg-white",
            )}
          >
            {props.userRole === 'QUOTA_USER' ? 'QUOTA' : props.userRole}
          </Badge>
        </div>
        {props.userRole === 'QUOTA_USER' && (
          <div className="flex gap-3 flex-1 justify-end">
            <ResourceUsageBadge currentValue="2" limit="3" resourceTyp="CPUs" />
            <ResourceUsageBadge currentValue="4,3" limit="7" unit="GB" resourceTyp="Memory" />
            <ResourceUsageBadge currentValue="55" limit="200" unit="GB" resourceTyp="Storage" />
            <ResourceUsageBadge currentValue="1" limit="4" resourceTyp="Instances" />
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
