import { useMemo } from "react";
import type { GameServerAccessGroupDtoPermissionsItem } from "@/api/generated/model";
import { containsPermission } from "@/lib/permissionCalculations.ts";
import { useTypedSelector } from "@/stores/rootReducer.ts";

const useGameServerPermissions = (gameServerId: string) => {
  const gameServerPermissions = useTypedSelector(
    (state) => state.gameServerPermissionsSliceReducer.data,
  );

  const permissions = useMemo(() => {
    if (!gameServerPermissions || !gameServerPermissions[gameServerId]) return [];
    return gameServerPermissions[gameServerId]
      .permissions as GameServerAccessGroupDtoPermissionsItem[];
  }, [gameServerPermissions, gameServerId]);

  const hasPermission = (permission: GameServerAccessGroupDtoPermissionsItem) => {
    return containsPermission(permissions, permission);
  };

  return { permissions, hasPermission };
};

export default useGameServerPermissions;
