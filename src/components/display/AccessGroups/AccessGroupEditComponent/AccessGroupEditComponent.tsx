import InputFieldEditGameServer from "@components/display/GameServer/EditGameServer/InputFieldEditGameServer.tsx";
import { Button } from "@components/ui/button.tsx";
import { Card } from "@components/ui/card.tsx";
import { Checkbox } from "@components/ui/checkbox.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { PlusIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ButtonProps } from "react-day-picker";
import * as z from "zod";
import { getUUIDByUsername } from "@/api/generated/backend-api.ts";
import type {
  GameServerAccessGroupDto,
  GameServerAccessGroupDtoPermissionsItem,
  GameServerDto,
  UserEntityDto,
} from "@/api/generated/model";
import { GameServerAccessGroupDtoPermissionsItem as PermissionEnum } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { cn } from "@/lib/utils.ts";

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
        gameServer={props.gameServer}
        onAccessGroupSelection={handleAccessGroupSelection}
        selectedAccessGroup={selectedAccessGroup}
        onCreateAccessGroup={handleCreateAccessGroup}
      />
      {accessGroups[selectedAccessGroupIndex] && (
        <SelectedAccessGroupDisplay
          accessGroup={accessGroups[selectedAccessGroupIndex]}
          onChangeStatusUpdate={handleChangeStatusUpdate}
        />
      )}
    </div>
  );
};

const AccessGroupList = (props: {
  accessGroups: GameServerAccessGroupDto[];
  gameServer: GameServerDto;
  onAccessGroupSelection: (accessGroup: GameServerAccessGroupDto) => void;
  selectedAccessGroup: string | null;
  onCreateAccessGroup: (groupName: string) => Promise<void>;
}) => {
  return (
    <div className={"flex gap-2 pl-2"}>
      {props.accessGroups.map((accessGroup) => (
        <AccessGroupListItem
          key={accessGroup.uuid}
          accessGroup={accessGroup}
          onRemove={() => {}}
          onSelect={() => props.onAccessGroupSelection(accessGroup)}
          isSelected={props.selectedAccessGroup === accessGroup.uuid}
        />
      ))}
      <CreateGameServerAccessGroupButton onCreate={props.onCreateAccessGroup} />
    </div>
  );
};

const AccessGroupListItem = (props: {
  accessGroup: GameServerAccessGroupDto;
  onRemove: () => void;
  onSelect: () => void;
  isSelected: boolean;
}) => {
  return (
    <AccessGroupButton onClick={props.onSelect} isSelected={props.isSelected}>
      {props.accessGroup.group_name}
    </AccessGroupButton>
  );
};

const CreateGameServerAccessGroupButton = (props: {
  onCreate: (groupName: string) => Promise<void>;
}) => {
  const { t } = useTranslationPrefix("components.gameServerSettings.accessManagement");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim()) return;

    setLoading(true);
    try {
      await props.onCreate(groupName.trim());
      setDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (loading) return;
    setDialogOpen(open);
    if (!open) {
      setGroupName("");
    }
  };

  return (
    <>
      <AccessGroupButton onClick={() => setDialogOpen(true)}>
        <PlusIcon />
        <span>{t("createNewGroup")}</span>
      </AccessGroupButton>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createGroupTitle")}</DialogTitle>
            <DialogDescription>{t("createGroupDescription")}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <InputFieldEditGameServer
              label={t("groupNameLabel")}
              value={groupName}
              onChange={(v) => setGroupName(v as string)}
              validator={z.string().min(1)}
              placeholder={t("groupNamePlaceholder")}
              errorLabel={t("groupNameRequired")}
              disabled={loading}
              onEnterPress={groupName.trim() ? handleCreate : undefined}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button className="h-[50px]" variant="secondary" disabled={loading}>
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleCreate}
              className="h-[50px]"
              disabled={loading || !groupName.trim()}
            >
              {t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const AccessGroupButton = (props: ButtonProps & { isSelected?: boolean }) => {
  const { isSelected, ...rest } = props;
  return (
    <button
      {...rest}
      type={"button"}
      className={cn(
        "flex align-middle items-center gap-1 bg-primary p-1.5 rounded-xl transition-all",
        isSelected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        props.className,
      )}
    />
  );
};

const SelectedAccessGroupDisplay = ({
  accessGroup,
  onChangeStatusUpdate,
}: {
  accessGroup: GameServerAccessGroupDto;
  onChangeStatusUpdate: (hasChanges: boolean) => void;
}) => {
  const { t } = useTranslationPrefix("components.gameServerSettings.accessManagement");
  const { deleteGameServerAccessGroup, updateGameServerAccessGroups } = useDataInteractions();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // User management state
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState<UserEntityDto[]>([]);

  // Group name state
  const [localGroupName, setLocalGroupName] = useState("");

  // Permissions state
  const [localPermissions, setLocalPermissions] = useState<
    GameServerAccessGroupDtoPermissionsItem[]
  >([]);

  // Initialize state from props
  useEffect(() => {
    setLocalUsers(accessGroup.users);
    setLocalPermissions(accessGroup.permissions);
    setLocalGroupName(accessGroup.group_name);
    setUsernameInput("");
    setUsernameError(null);
  }, [accessGroup]);

  // Check if ADMIN permission is enabled
  const isAdminChecked = useMemo(
    () => localPermissions.includes(PermissionEnum.ADMIN),
    [localPermissions],
  );

  // Validate all fields
  const allFieldsValid = useMemo(() => {
    const groupNameValid = z.string().min(1).safeParse(localGroupName).success;
    return groupNameValid;
  }, [localGroupName]);

  // Detect changes
  const isChanged = useMemo(() => {
    const nameChanged = localGroupName !== accessGroup.group_name;

    const usersChanged =
      localUsers.length !== accessGroup.users.length ||
      !localUsers.every((user) => accessGroup.users.some((u) => u.uuid === user.uuid));

    const permissionsChanged =
      localPermissions.length !== accessGroup.permissions.length ||
      !localPermissions.every((perm) => accessGroup.permissions.includes(perm));

    return nameChanged || usersChanged || permissionsChanged;
  }, [localGroupName, localUsers, localPermissions, accessGroup]);

  // Notify parent when change status updates
  useEffect(() => {
    onChangeStatusUpdate(isChanged);
  }, [isChanged, onChangeStatusUpdate]);

  // Add user by username
  const handleAddUser = async () => {
    if (!usernameInput.trim()) return;

    setUsernameError(null);
    try {
      const userUuid = await getUUIDByUsername(usernameInput.trim());

      // Check if user already exists
      if (localUsers.some((u) => u.uuid === userUuid)) {
        setUsernameError(t("userAlreadyInGroup"));
        return;
      }

      // Add user to local state
      setLocalUsers((prev) => [...prev, { uuid: userUuid, username: usernameInput.trim() }]);
      setUsernameInput("");
    } catch (_error) {
      setUsernameError(t("usernameNotFound"));
    }
  };

  // Remove user
  const handleRemoveUser = (userUuid: string) => {
    setLocalUsers((prev) => prev.filter((u) => u.uuid !== userUuid));
  };

  // Toggle permission
  const handleTogglePermission = (permission: GameServerAccessGroupDtoPermissionsItem) => {
    setLocalPermissions((prev) => {
      if (prev.includes(permission)) {
        return prev.filter((p) => p !== permission);
      }
      return [...prev, permission];
    });
  };

  // Confirm changes
  const handleConfirm = async () => {
    setLoading(true);
    try {
      await updateGameServerAccessGroups(accessGroup.game_server_uuid, accessGroup.uuid, {
        access_group_name: localGroupName,
        user_uuids: localUsers.map((u) => u.uuid ?? "").filter(Boolean),
        permissions: localPermissions,
      });
    } finally {
      setLoading(false);
    }
  };

  // Revert changes
  const handleRevert = () => {
    setLocalUsers(accessGroup.users);
    setLocalPermissions(accessGroup.permissions);
    setLocalGroupName(accessGroup.group_name);
    setUsernameInput("");
    setUsernameError(null);
  };

  const isConfirmButtonDisabled = loading || !isChanged || !allFieldsValid;

  // Handle delete
  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteGameServerAccessGroup(accessGroup.game_server_uuid, accessGroup.uuid);
      setDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="relative p-3 gap-5 flex flex-col mt-5">
        <div>
          <h2 className="text-lg font-semibold">{t("groupSettings")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Group Name Section */}
          <div className="flex flex-col gap-3">
            <InputFieldEditGameServer
              label={t("groupNameLabel")}
              value={localGroupName}
              onChange={(v) => setLocalGroupName(v as string)}
              validator={z.string().min(1)}
              placeholder={t("groupNamePlaceholder")}
              errorLabel={t("groupNameRequired")}
              disabled={loading}
              onEnterPress={isConfirmButtonDisabled ? undefined : handleConfirm}
            />
          </div>
          {/* User Management Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">{t("members")}</h3>

            {/* User List */}
            <div className="flex flex-col gap-2">
              {localUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noUsersAssigned")}</p>
              ) : (
                localUsers.map((user) => (
                  <div
                    key={user.uuid}
                    className="flex items-center justify-between bg-secondary/50 p-2 rounded-md"
                  >
                    <span className="text-sm">{user.username}</span>
                    <button
                      type="button"
                      onClick={() => user.uuid && handleRemoveUser(user.uuid)}
                      disabled={loading}
                      className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                    >
                      <XIcon className="size-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add User Input */}
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <InputFieldEditGameServer
                  label={t("addUserLabel")}
                  value={usernameInput}
                  onChange={(v) => {
                    setUsernameInput(v as string);
                    setUsernameError(null);
                  }}
                  validator={z.string().min(1)}
                  placeholder={t("addUserPlaceholder")}
                  errorLabel={usernameError || t("addUserError")}
                  disabled={loading}
                  optional={true}
                  onEnterPress={handleAddUser}
                />
                {usernameError && <p className="text-xs text-destructive mt-1">{usernameError}</p>}
              </div>
              <Button
                type="button"
                onClick={handleAddUser}
                disabled={loading || !usernameInput.trim()}
                className="mt-8"
              >
                {t("addUserButton")}
              </Button>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">{t("permissions")}</h3>
            <div className="flex flex-col gap-2">
              {Object.values(PermissionEnum).map((permission) => {
                const isChecked = localPermissions.includes(permission);

                // Admin disables all others
                const disabledByAdmin = isAdminChecked && permission !== PermissionEnum.ADMIN;

                // SEE_SERVER must be enabled for all others (except ADMIN and SEE_SERVER itself)
                const needsSeeServer =
                  permission !== PermissionEnum.ADMIN &&
                  permission !== PermissionEnum.SEE_SERVER &&
                  !localPermissions.includes(PermissionEnum.SEE_SERVER);

                const isDisabled = loading || disabledByAdmin || needsSeeServer;

                // Dangerous permissions get red styling
                const isDangerous =
                  permission === PermissionEnum.DELETE_SERVER ||
                  permission === PermissionEnum.TRANSFER_SERVER_OWNERSHIP;

                const permissionKey = permission as keyof typeof PermissionEnum;
                const permissionName = t(`permissionDescriptions.${permissionKey}.name`);
                const permissionDescription = t(
                  `permissionDescriptions.${permissionKey}.description`,
                );

                return (
                  <div key={permission} className="flex flex-col gap-1">
                    {/* biome-ignore lint/a11y/noStaticElementInteractions: Checkbox wrapper needs to be clickable */}
                    <div
                      className={cn(
                        "cursor-pointer flex gap-2 align-middle items-center select-none grow-0 w-fit",
                        isDisabled && "opacity-50 cursor-not-allowed",
                      )}
                      onClick={() => !isDisabled && handleTogglePermission(permission)}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
                          e.preventDefault();
                          handleTogglePermission(permission);
                        }
                      }}
                    >
                      <Checkbox
                        checked={isChecked}
                        className="size-4"
                        disabled={isDisabled}
                        tabIndex={-1}
                      />
                      <span
                        className={cn("text-sm font-medium", isDangerous && "text-destructive")}
                      >
                        {permissionName}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">{permissionDescription}</p>
                  </div>
                );
              })}
            </div>
            {isAdminChecked && <p className="text-xs text-muted-foreground">{t("adminNote")}</p>}
            {!isAdminChecked && !localPermissions.includes(PermissionEnum.SEE_SERVER) && (
              <p className="text-xs text-muted-foreground">{t("seeServerNote")}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-4 w-fit ml-auto flex gap-4">
          <Button
            className="h-12.5"
            variant="secondary"
            disabled={loading || !isChanged}
            onClick={handleRevert}
          >
            {t("revert")}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="h-12.5"
            disabled={isConfirmButtonDisabled}
          >
            {t("confirm")}
          </Button>
        </div>

        {/* Delete Group Button */}
        <div className="pt-4 border-t">
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={loading}
          >
            {t("deleteGroup")}
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteGroupTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteGroupDescription", { groupName: accessGroup.group_name })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button className="h-[50px]" variant="secondary" disabled={loading}>
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="h-[50px]"
              disabled={loading}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccessGroupEditComponent;
