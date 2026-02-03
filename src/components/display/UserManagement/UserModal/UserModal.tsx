import UserRoleBadge from "@components/display/UserRoleBadge/UserRoleBadge.tsx";
import ResourceUsageBadge from "@components/display/ResourceUsageBadge/ResourceUsageBadge.tsx";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { UserEntityDtoRole } from "@/api/generated/model";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserModal({ open, onOpenChange }: UserModalProps) {
  const { t } = useTranslationPrefix("userProfileModal");
  const { t: tCommon } = useTranslation();
  const { username, role, memoryLimit, cpuLimit } = useContext(AuthContext);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <DialogMain>
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-semibold">{t("username")}:</p>
              <p>{username}</p>
            </div>

            <div>
              <p className="font-semibold">{t("role")}:</p>
              {role && <UserRoleBadge role={role} />}
            </div>

            {(role === UserEntityDtoRole.QUOTA_USER || role === UserEntityDtoRole.ADMIN) && (
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
            )}
          </div>
        </DialogMain>
      </DialogContent>
    </Dialog>
  );
}
