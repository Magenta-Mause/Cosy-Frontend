import type { GameServerAccessGroupDto } from "@/api/generated/model";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { accessGroupToggleItemClassName } from "./accessGroupToggleStyles";
import CreateAccessGroupDialog from "./CreateAccessGroupDialog";

const AccessGroupList = (props: {
  accessGroups: GameServerAccessGroupDto[];
  onAccessGroupSelection: (accessGroup: GameServerAccessGroupDto) => void;
  selectedAccessGroup: string | null;
  onCreateAccessGroup: (groupName: string) => Promise<void>;
}) => {
  return (
    <div className="pl-2">
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={1}
        value={props.selectedAccessGroup ?? ""}
        onValueChange={(value) => {
          if (!value) return;
          const group = props.accessGroups.find((g) => g.uuid === value);
          if (group) props.onAccessGroupSelection(group);
        }}
        className="flex-wrap"
      >
        {props.accessGroups.map((accessGroup) => (
          <ToggleGroupItem
            key={accessGroup.uuid}
            value={accessGroup.uuid}
            className={accessGroupToggleItemClassName}
          >
            {accessGroup.group_name}
          </ToggleGroupItem>
        ))}
        <CreateAccessGroupDialog
          onCreate={props.onCreateAccessGroup}
          accessGroups={props.accessGroups}
        />
      </ToggleGroup>
    </div>
  );
};

export default AccessGroupList;
