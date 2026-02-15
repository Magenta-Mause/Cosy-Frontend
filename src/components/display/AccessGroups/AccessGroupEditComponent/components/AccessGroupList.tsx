import type { GameServerAccessGroupDto } from "@/api/generated/model";
import AccessGroupButton from "./AccessGroupButton";
import CreateAccessGroupDialog from "./CreateAccessGroupDialog";

const AccessGroupList = (props: {
  accessGroups: GameServerAccessGroupDto[];
  onAccessGroupSelection: (accessGroup: GameServerAccessGroupDto) => void;
  selectedAccessGroup: string | null;
  onCreateAccessGroup: (groupName: string) => Promise<void>;
}) => {
  return (
    <div className={"flex flex-wrap gap-2 pl-2"}>
      {props.accessGroups.map((accessGroup) => (
        <AccessGroupButton
          key={accessGroup.uuid}
          onClick={() => props.onAccessGroupSelection(accessGroup)}
          isSelected={props.selectedAccessGroup === accessGroup.uuid}
        >
          {accessGroup.group_name}
        </AccessGroupButton>
      ))}
      <CreateAccessGroupDialog onCreate={props.onCreateAccessGroup} />
    </div>
  );
};

export default AccessGroupList;
