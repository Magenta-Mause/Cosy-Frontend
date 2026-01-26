import { Badge } from "@components/ui/badge";

const ResourceUsageBadge = (props: {
  currentValue: string;
  limit: number;
  unit?: string;
  resourceType: string;
}) => {

  return (
    <Badge className="px-3 text-sm bg-accent">
      {props.currentValue} / {props.limit} {props.unit} {props.resourceType}
    </Badge>
  );
};

export default ResourceUsageBadge;
