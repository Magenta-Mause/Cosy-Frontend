import { Input } from "@components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select.tsx";
import { useTranslation } from "react-i18next";
import { UserEntityDtoRole } from "@/api/generated/model";

interface InviteFormProps {
  username: string;
  memory: number | null;
  cores: number | null;
  userRole: UserEntityDtoRole;
  onUsernameChange: (value: string) => void;
  onUserRoleChange: (value: UserEntityDtoRole) => void;
  onMemoryChange: (value: number | null) => void;
  onCoresChange: (value: number | null) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isCreating: boolean;
}

export const InviteForm = ({
  username,
  userRole,
  memory,
  cores,
  onUsernameChange,
  onMemoryChange,
  onCoresChange,
  onSubmit,
  onUserRoleChange,
}: InviteFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="space-y-2">
        <label htmlFor="invite-username">{t("userModal.usernameLabel")}</label>
        <Input
          id="invite-username"
          placeholder={t("userModal.usernamePlaceholder")}
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmit();
            }
          }}
        />
        <p className="text-xs text-muted-foreground">{t("userModal.usernameDescription")}</p>
        <div className="flex justify-between">
          <div className="w-[45%]">
            <label htmlFor="memory-limit">{t("userModal.memoryLimit")}</label>
            <Input
              id="memory-limit"
              placeholder="512MB"
              value={memory ?? ""}
              onChange={(e) =>
                onMemoryChange(e.target.value === "" ? null : Number(e.target.value))
              }
            />
            <p className="text-xs text-muted-foreground">{t("userModal.memoryDescription")}</p>
          </div>
          <div className="w-[45%]">
            <label htmlFor="cpu-limit">{t("userModal.cpuLimit")}</label>
            <Input
              id="cpu-limit"
              placeholder={t("userModal.cpuPlaceholder")}
              value={cores ?? ""}
              onChange={(e) => onCoresChange(e.target.value === "" ? null : Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{t("userModal.cpuDescription")}</p>
          </div>
        </div>
        <label htmlFor="invite-rol">{t("userModal.roleLabel")}</label>
        <Select defaultValue={userRole} onValueChange={onUserRoleChange}>
          <SelectTrigger id={"invite-role"}>
            <SelectValue placeholder={t("userModal.rolePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(UserEntityDtoRole)
              .filter((role) => role !== UserEntityDtoRole.OWNER)
              .map((role) => (
                <SelectItem value={role} key={role}>
                  {t(`userRoles.${role}`)}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
