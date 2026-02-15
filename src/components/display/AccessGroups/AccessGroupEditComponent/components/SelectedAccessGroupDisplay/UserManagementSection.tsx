import { Button } from "@components/ui/button.tsx";
import InputFieldEditGameServer from "@components/display/GameServer/EditGameServer/InputFieldEditGameServer.tsx";
import { XIcon } from "lucide-react";
import type { UserEntityDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import * as z from "zod";

type Props = {
  localUsers: UserEntityDto[];
  usernameInput: string;
  setUsernameInput: (username: string) => void;
  usernameError: string | null;
  setUsernameError: (error: string | null) => void;
  handleAddUser: () => void;
  handleRemoveUser: (userUuid: string) => void;
  loading: boolean;
};

const UserManagementSection = ({
  localUsers,
  usernameInput,
  setUsernameInput,
  usernameError,
  setUsernameError,
  handleAddUser,
  handleRemoveUser,
  loading,
}: Props) => {
  const { t } = useTranslationPrefix("components.gameServerSettings.accessManagement");

  return (
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
  );
};

export default UserManagementSection;
