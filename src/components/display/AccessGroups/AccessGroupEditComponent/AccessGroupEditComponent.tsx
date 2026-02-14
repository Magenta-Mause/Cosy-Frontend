import {Button} from "@components/ui/button.tsx";
import {PlusIcon, XIcon} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import type {ButtonProps} from "react-day-picker";
import type {
  GameServerAccessGroupDto,
  GameServerAccessGroupDtoPermissionsItem,
  GameServerDto,
  UserEntityDto,
} from "@/api/generated/model";
import {getUUIDByUsername} from "@/api/generated/backend-api.ts";
import {GameServerAccessGroupDtoPermissionsItem as PermissionEnum} from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import {cn} from "@/lib/utils.ts";
import {Checkbox} from "@components/ui/checkbox.tsx";
import InputFieldEditGameServer from "@components/display/GameServer/EditGameServer/InputFieldEditGameServer.tsx";
import * as z from "zod";
import {Card} from "@components/ui/card.tsx";
import {useNavigate, useSearch} from "@tanstack/react-router";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog.tsx";

const AccessGroupEditComponent = (props: { gameServer: GameServerDto }) => {
  const navigate = useNavigate();
  const search = useSearch({strict: false}) as { groupId?: string };
  const accessGroups = props.gameServer?.access_groups;

  // Initialize from URL or default to first group
  const [selectedAccessGroup, setSelectedAccessGroup] = useState<string | null>(() => {
    if (search.groupId) return search.groupId;
    return accessGroups?.[0]?.uuid ?? null;
  });

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
      />
      {accessGroups[selectedAccessGroupIndex] && (
        <SelectedAccessGroupDisplay accessGroup={accessGroups[selectedAccessGroupIndex]}/>
      )}
    </div>
  );
};

const AccessGroupList = (props: {
  accessGroups: GameServerAccessGroupDto[];
  gameServer: GameServerDto;
  onAccessGroupSelection: (accessGroup: GameServerAccessGroupDto) => void;
  selectedAccessGroup: string | null;
}) => {
  const {createGameServerAccessGroup} = useDataInteractions();

  return (
    <div className={"flex gap-2 pl-2"}>
      {props.accessGroups.map((accessGroup) => (
        <AccessGroupListItem
          key={accessGroup.uuid}
          accessGroup={accessGroup}
          onRemove={() => {
          }}
          onSelect={() => props.onAccessGroupSelection(accessGroup)}
          isSelected={props.selectedAccessGroup === accessGroup.uuid}
        />
      ))}
      <CreateGameServerAccessGroupButton
        onCreate={(accessGroupName: string) =>
          createGameServerAccessGroup(props.gameServer.uuid, {name: accessGroupName})
        }
      />
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

const CreateGameServerAccessGroupButton = (props: { onCreate: (groupName: string) => void }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    
    setLoading(true);
    try {
      await props.onCreate(groupName.trim());
      setDialogOpen(false);
      setGroupName("");
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
        <PlusIcon/>
        <span>Create new access group</span>
      </AccessGroupButton>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Access Group</DialogTitle>
            <DialogDescription>
              Enter a name for the new access group.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <InputFieldEditGameServer
              label="Group Name"
              value={groupName}
              onChange={(v) => setGroupName(v as string)}
              validator={z.string().min(1)}
              placeholder="Enter group name"
              errorLabel="Group name is required"
              disabled={loading}
              onEnterPress={groupName.trim() ? handleCreate : undefined}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button className="h-[50px]" variant="secondary" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleCreate}
              className="h-[50px]"
              disabled={loading || !groupName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const AccessGroupButton = (props: ButtonProps & { isSelected?: boolean }) => {
  return (
    <button
      {...props}
      type={"button"}
      className={cn(
        "flex align-middle items-center gap-1 bg-primary p-1.5 rounded-xl transition-all",
        props.isSelected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        props.className,
      )}
    />
  );
};

const SelectedAccessGroupDisplay = ({accessGroup}: { accessGroup: GameServerAccessGroupDto }) => {
  const {deleteGameServerAccessGroup, updateGameServerAccessGroups} = useDataInteractions();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // User management state
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState<UserEntityDto[]>([]);

  // Group name state
  const [localGroupName, setLocalGroupName] = useState("");

  // Permissions state
  const [localPermissions, setLocalPermissions] = useState<GameServerAccessGroupDtoPermissionsItem[]>([]);

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

  // Add user by username
  const handleAddUser = async () => {
    if (!usernameInput.trim()) return;

    setUsernameError(null);
    try {
      const userUuid = await getUUIDByUsername(usernameInput.trim());

      // Check if user already exists
      if (localUsers.some((u) => u.uuid === userUuid)) {
        setUsernameError("User already in group");
        return;
      }

      // Add user to local state
      setLocalUsers((prev) => [...prev, {uuid: userUuid, username: usernameInput.trim()}]);
      setUsernameInput("");
    } catch (_error) {
      setUsernameError("Username not found");
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
          <h2 className="text-lg font-semibold">Access Group Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure users and permissions for this access group
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Group Name Section */}
          <div className="flex flex-col gap-3">
            <InputFieldEditGameServer
              label="Group Name"
              value={localGroupName}
              onChange={(v) => setLocalGroupName(v as string)}
              validator={z.string().min(1)}
              placeholder="Enter group name"
              errorLabel="Group name is required"
              disabled={loading}
              onEnterPress={isConfirmButtonDisabled ? undefined : handleConfirm}
            />
          </div>
          {/* User Management Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">Members</h3>

            {/* User List */}
            <div className="flex flex-col gap-2">
              {localUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users assigned</p>
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
                      <XIcon className="size-4"/>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add User Input */}
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <InputFieldEditGameServer
                  label="Add user by username"
                  value={usernameInput}
                  onChange={(v) => {
                    setUsernameInput(v as string);
                    setUsernameError(null);
                  }}
                  validator={z.string().min(1)}
                  placeholder="Enter username"
                  errorLabel={usernameError || "Invalid username"}
                  disabled={loading}
                  optional={true}
                  onEnterPress={handleAddUser}
                />
                {usernameError && (
                  <p className="text-xs text-destructive mt-1">{usernameError}</p>
                )}
              </div>
              <Button
                type="button"
                onClick={handleAddUser}
                disabled={loading || !usernameInput.trim()}
                className="mt-8"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">Permissions</h3>
            <div className="flex flex-col gap-2">
              {Object.values(PermissionEnum).map((permission) => {
                const isChecked = localPermissions.includes(permission);
                const isDisabled = loading || (isAdminChecked && permission !== PermissionEnum.ADMIN);

                return (
                  <button
                    key={permission}
                    type="button"
                    className={cn(
                      "cursor-pointer flex gap-2 align-middle items-center select-none grow-0 w-fit",
                      isDisabled && "opacity-50 cursor-not-allowed",
                    )}
                    onClick={() => !isDisabled && handleTogglePermission(permission)}
                    disabled={isDisabled}
                  >
                    <Checkbox checked={isChecked} className="size-4"/>
                    <span className="text-sm">{formatPermissionName(permission)}</span>
                  </button>
                );
              })}
            </div>
            {isAdminChecked && (
              <p className="text-xs text-muted-foreground">
                ADMIN permission grants all other permissions
              </p>
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
            Revert
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="h-12.5"
            disabled={isConfirmButtonDisabled}
          >
            Confirm
          </Button>
        </div>

        {/* Delete Group Button */}
        <div className="pt-4 border-t">
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={loading}
          >
            Delete Access Group
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Access Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the access group "{accessGroup.group_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button className="h-[50px]" variant="secondary" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="h-[50px]"
              disabled={loading}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper function to format permission names
const formatPermissionName = (permission: string): string => {
  return permission
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

export default AccessGroupEditComponent;
