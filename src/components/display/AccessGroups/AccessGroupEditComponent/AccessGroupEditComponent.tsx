import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GameServerAccessGroupDto, GameServerDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import AccessGroupList from "./components/AccessGroupList";
import SelectedAccessGroupDisplay from "./components/SelectedAccessGroupDisplay";

const AccessGroupEditComponent = (props: { gameServer: GameServerDto }) => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { groupId?: string };
  const accessGroups = props.gameServer?.access_groups;
  const { createGameServerAccessGroup } = useDataInteractions();

  // Initialize from URL or default to first group
  const [selectedAccessGroup, setSelectedAccessGroup] = useState<string | null>(() => {
    if (search.groupId) return search.groupId;
    return accessGroups?.[0]?.uuid ?? null;
  });

  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Wrap in useCallback to prevent unnecessary re-renders
  const handleChangeStatusUpdate = useCallback((hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  }, []);

  const selectedAccessGroupIndex = useMemo(
    () => accessGroups?.findIndex((accessGroup) => accessGroup.uuid === selectedAccessGroup),
    [accessGroups, selectedAccessGroup],
  );

  // Sync URL with selected group
  const handleAccessGroupSelection = (accessGroup: GameServerAccessGroupDto) => {
    setSelectedAccessGroup(accessGroup.uuid);
    navigate({
      // @ts-expect-error - TanStack Router search param typing issue
      search: (prev: Record<string, unknown>) => ({ ...prev, groupId: accessGroup.uuid }),
      replace: true,
    });
  };

  // Handle creating new access group
  const handleCreateAccessGroup = async (groupName: string) => {
    const newGroup = await createGameServerAccessGroup(props.gameServer.uuid, { name: groupName });

    // If no unsaved changes, auto-select the new group
    if (!hasUnsavedChanges && newGroup) {
      handleAccessGroupSelection(newGroup);
    }
  };

  // Sync state from URL on mount
  useEffect(() => {
    if (search.groupId && accessGroups?.some((g) => g.uuid === search.groupId)) {
      setSelectedAccessGroup(search.groupId);
    } else if (!selectedAccessGroup && accessGroups?.[0]) {
      setSelectedAccessGroup(accessGroups[0].uuid);
      navigate({
        // @ts-expect-error - TanStack Router search param typing issue
        search: (prev: Record<string, unknown>) => ({ ...prev, groupId: accessGroups[0].uuid }),
        replace: true,
      });
    }
  }, [search.groupId, accessGroups, selectedAccessGroup, navigate]);

  if (!accessGroups) return <div>No access groups</div>;

  return (
    <div>
      <AccessGroupList
        accessGroups={accessGroups}
        onAccessGroupSelection={handleAccessGroupSelection}
        selectedAccessGroup={selectedAccessGroup}
        onCreateAccessGroup={handleCreateAccessGroup}
      />
      {selectedAccessGroupIndex !== undefined && accessGroups[selectedAccessGroupIndex] && (
        <SelectedAccessGroupDisplay
          accessGroup={accessGroups[selectedAccessGroupIndex]}
          onChangeStatusUpdate={handleChangeStatusUpdate}
        />
      )}
    </div>
  );
};

export default AccessGroupEditComponent;
