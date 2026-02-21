import { GameServerAccessGroupDtoPermissionsItem } from "@/api/generated/model";

export const containsPermission = (
  permissions: GameServerAccessGroupDtoPermissionsItem[],
  permission: GameServerAccessGroupDtoPermissionsItem,
) => {
  if (!permissions) return false;
  if (permissions.includes(GameServerAccessGroupDtoPermissionsItem.ADMIN)) {
    return true;
  }
  if (permissions.includes(GameServerAccessGroupDtoPermissionsItem.READ_SERVER_LOGS)) {
    permissions.includes(GameServerAccessGroupDtoPermissionsItem.SEE_SERVER);
  }
  if (permissions.includes(GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS)) {
    permissions.includes(GameServerAccessGroupDtoPermissionsItem.SEE_SERVER);
  }
  return (
    permissions.includes(GameServerAccessGroupDtoPermissionsItem.SEE_SERVER) &&
    permissions.includes(permission)
  );
};
