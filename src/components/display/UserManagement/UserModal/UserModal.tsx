import ResourceUsageBadge from "@components/display/ResourceUsageBadge/ResourceUsageBadge.tsx";
import UserRoleBadge from "@components/display/UserRoleBadge/UserRoleBadge.tsx";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import { Input } from "@components/ui/input.tsx";
import { Check, Edit } from "lucide-react";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useChangePassword } from "@/api/generated/backend-api";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserModal({ open, onOpenChange }: UserModalProps) {
  const { t } = useTranslationPrefix("userProfileModal");
  const { t: tCommon } = useTranslation();
  const { username, role, memoryLimit, cpuLimit, uuid } = useContext(AuthContext);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const { mutate: changePassword, isPending } = useChangePassword();

  const handlePasswordChange = () => {
    if (!uuid) {
      toast.error(tCommon("toasts.missingUuid"));
      return;
    }

    if (!isEditingPassword) {
      setIsEditingPassword(true);
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t("passwordTooShort"));
      return;
    }

    changePassword(
      { uuid, data: { new_password: newPassword } },
      {
        onSuccess: () => {
          toast.success(t("passwordChangeSuccess"));
          setNewPassword("");
          setIsEditingPassword(false);
        },
        onError: () => {
          toast.error(t("passwordChangeError"));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <DialogMain>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input header={t("username")} value={username || ""} readOnly disabled />
              </div>
              {role && <UserRoleBadge role={role} className="mt-6" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Input
                  type="password"
                  header={t("password")}
                  value={isEditingPassword ? newPassword : ""}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="*****"
                  disabled={!isEditingPassword || isPending}
                />
                <Button size="icon" onClick={handlePasswordChange} disabled={isPending}>
                  {isEditingPassword ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <p className="font-semibold">{t("limits")}:</p>
              <div className="flex gap-2 mt-2">
                <ResourceUsageBadge
                  currentValue="calculate_me"
                  limit={
                    cpuLimit != null
                      ? cpuLimit
                      : tCommon("components.userManagement.userRow.resources.unlimited")
                  }
                  resourceType={tCommon("components.userManagement.userRow.resources.cpus")}
                />
                <ResourceUsageBadge
                  currentValue="calculate_me"
                  limit={
                    memoryLimit != null
                      ? memoryLimit
                      : tCommon("components.userManagement.userRow.resources.unlimited")
                  }
                  resourceType={tCommon("components.userManagement.userRow.resources.memory")}
                />
              </div>
            </div>
          </div>
        </DialogMain>
      </DialogContent>
    </Dialog>
  );
}
