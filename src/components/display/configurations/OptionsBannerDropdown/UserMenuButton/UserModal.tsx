import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import { useContext } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserModal({ open, onOpenChange }: UserModalProps) {
  const { t } = useTranslationPrefix("userProfileModal");
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
              <p>{role}</p>
            </div>
            
            <div>
              <p className="font-semibold">{t("limits")}:</p>
              <p>{t("memory")}: {memoryLimit}</p>
              <p>{t("cpu")}: {cpuLimit}</p>
            </div>
          </div>
        </DialogMain>
      </DialogContent>
    </Dialog>
  );
}
