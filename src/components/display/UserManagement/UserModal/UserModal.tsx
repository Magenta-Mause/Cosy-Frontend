import ResourceUsageBadge from "@components/display/ResourceUsageBadge/ResourceUsageBadge.tsx";
import UserRoleBadge from "@components/display/UserRoleBadge/UserRoleBadge.tsx";
import { ChangePasswordModal } from "@components/display/UserManagement/ChangePasswordModal/ChangePasswordModal.tsx";
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
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserModal({ open, onOpenChange }: UserModalProps) {
  const { t } = useTranslationPrefix("userProfileModal");
  const { t: tCommon } = useTranslation();
  const { username, role, memoryLimit, cpuLimit, uuid } = useContext(AuthContext);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleChangePasswordClick = () => {
    setShowPasswordModal(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>

          <DialogMain>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Input header={t("username")} value={username || ""} readOnly disabled />
                </div>
                {role && <UserRoleBadge role={role} className="mt-7.5 h-9" />}
              </div>

              <Button onClick={handleChangePasswordClick} className="w-full">
                {t("changePasswordButton")}
              </Button>

              <div>
                <p className="text-sm font-bold">{t("limits")}:</p>
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

      <ChangePasswordModal 
        open={showPasswordModal} 
        onOpenChange={setShowPasswordModal}
        uuid={uuid}
      />
    </>
  );
}
