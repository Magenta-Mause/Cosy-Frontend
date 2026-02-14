import { Button } from "@components/ui/button.tsx";
import { PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { ButtonProps } from "react-day-picker";
import type { GameServerAccessGroupDto, GameServerDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import { cn } from "@/lib/utils.ts";

const AccessGroupEditComponent = (props: { gameServer: GameServerDto }) => {
  const [selectedAccessGroup, setSelectedAccessGroup] = useState<string | null>(null);
  const accessGroups = props.gameServer?.access_groups;
  const selectedAccessGroupIndex = useMemo(
    () => accessGroups?.findIndex((accessGroup) => accessGroup.uuid === selectedAccessGroup),
    [accessGroups, selectedAccessGroup],
  );

  if (!accessGroups) return <div>No access groups</div>;

  return (
    <div>
      <AccessGroupList
        accessGroups={accessGroups}
        gameServer={props.gameServer}
        onAccessGroupSelection={(accessGroup) => setSelectedAccessGroup(accessGroup.uuid)}
      />
      {accessGroups[selectedAccessGroupIndex] && (
        <SelectedAccessGroupDisplay accessGroup={accessGroups[selectedAccessGroupIndex]} />
      )}
    </div>
  );
};

const AccessGroupList = (props: {
  accessGroups: GameServerAccessGroupDto[];
  gameServer: GameServerDto;
  onAccessGroupSelection: (accessGroup: GameServerAccessGroupDto) => void;
}) => {
  const { createGameServerAccessGroup } = useDataInteractions();

  return (
    <div className={"flex gap-2"}>
      {props.accessGroups.map((accessGroup) => (
        <AccessGroupListItem
          key={accessGroup.uuid}
          accessGroup={accessGroup}
          onRemove={() => {}}
          onSelect={() => props.onAccessGroupSelection(accessGroup)}
        />
      ))}
      <CreateGameServerAccessGroupButton
        onCreate={(accessGroupName: string) =>
          createGameServerAccessGroup(props.gameServer.uuid, { name: accessGroupName })
        }
      />
    </div>
  );
};

const AccessGroupListItem = (props: {
  accessGroup: GameServerAccessGroupDto;
  onRemove: () => void;
  onSelect: () => void;
}) => {
  return (
    <AccessGroupButton onClick={props.onSelect}>{props.accessGroup.group_name}</AccessGroupButton>
  );
};

const CreateGameServerAccessGroupButton = (props: { onCreate: (groupName: string) => void }) => {
  return (
    <AccessGroupButton onClick={() => props.onCreate(prompt("G"))}>
      <PlusIcon />
      <span>Create new access group</span>
    </AccessGroupButton>
  );
};

const AccessGroupButton = (props: ButtonProps) => {
  return (
    <button
      {...props}
      type={"button"}
      className={cn(
        "flex align-middle items-center gap-1 bg-primary p-1.5 rounded-xl",
        props.className,
      )}
    />
  );
};

const SelectedAccessGroupDisplay = ({ accessGroup }: { accessGroup: GameServerAccessGroupDto }) => {
  const { deleteGameServerAccessGroup } = useDataInteractions();
  return (
    <Button
      onClick={() => deleteGameServerAccessGroup(accessGroup.game_server_uuid, accessGroup.uuid)}
    >
      Remove access group
    </Button>
  );
};

export default AccessGroupEditComponent;
