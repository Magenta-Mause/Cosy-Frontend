import { GameServerAccessGroupDtoPermissionsItem } from "@/api/generated/model";

export const containsPermission = (
  permissions: GameServerAccessGroupDtoPermissionsItem[],
  permission: GameServerAccessGroupDtoPermissionsItem,
) => {
  if (!permissions) return false;
  if (permissions.includes(GameServerAccessGroupDtoPermissionsItem.ADMIN)) {
    return true;
  }
  return permissions.includes(permission);
};
