import { Input } from "@components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select.tsx";
import { Label } from "@radix-ui/react-label";
import { useTranslation } from "react-i18next";
import { UserEntityDtoRole } from "@/api/generated/model";

interface InviteFormProps {
  username: string;
  memory: string | null;
  cpu: number | null;
  userRole: UserEntityDtoRole;
  onUsernameChange: (value: string) => void;
  onUserRoleChange: (value: UserEntityDtoRole) => void;
  onMemoryChange: (value: string | null) => void;
  onCpuChange: (value: number | null) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isCreating: boolean;
}

import { MemoryLimitInput } from "@components/common/MemoryLimitInput.tsx";

export const InviteForm = ({
  username,
  userRole,
  memory,
  cpu,
  onUsernameChange,
  onMemoryChange,
  onCpuChange,
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
            <Label htmlFor="memory-limit">{t("userModal.memoryLimit")}</Label>
            <MemoryLimitInput
              id="memory-limit"
              placeholder={t("userModal.placeholder")}
              value={memory}
              onChange={(val) => onMemoryChange(val === "" ? null : val)}
              className="no-spinner"
            />
            <p className="text-xs text-muted-foreground">{t("userModal.memoryDescription")}</p>
          </div>
          <div className="w-[45%]">
            <Label htmlFor="cpu-limit">{t("userModal.cpuLimit")}</Label>
            <Input
              id="cpu-limit"
              type="number"
              placeholder={t("userModal.placeholder")}
              endDecorator="CPUs"
              value={cpu ?? ""}
              onChange={(e) => onCpuChange(e.target.value === "" ? null : Number(e.target.value))}
              className="no-spinner"
            />
            <p className="text-xs text-muted-foreground">{t("userModal.cpuDescription")}</p>
          </div>
        </div>
        <Label htmlFor="invite-role">{t("userModal.roleLabel")}</Label>
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
