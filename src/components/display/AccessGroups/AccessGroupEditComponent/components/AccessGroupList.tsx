import type { GameServerAccessGroupDto } from "@/api/generated/model";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import CreateAccessGroupDialog from "./CreateAccessGroupDialog";

export const accessGroupToggleItemClassName = [
  "bg-button-secondary-default text-button-primary-click",
  "border-2 border-button-secondary-border",
  "shadow-md shadow-button-drop-shadow",
  "hover:bg-button-secondary-hover hover:text-button-primary-click",
  "data-[state=on]:bg-button-secondary-click data-[state=on]:text-button-primary-click",
].join(" ");

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
        <CreateAccessGroupDialog onCreate={props.onCreateAccessGroup} />
      </ToggleGroup>
    </div>
  );
};

export default AccessGroupList;
