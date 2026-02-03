import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import { Input } from "@components/ui/input.tsx";
import { useState } from "react";
import { toast } from "sonner";
import { useChangePassword } from "@/api/generated/backend-api";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uuid: string | null;
}

export function ChangePasswordModal({ open, onOpenChange, uuid }: ChangePasswordModalProps) {
  const { t } = useTranslationPrefix("changePasswordModal");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { mutate: changePassword, isPending } = useChangePassword();

  const hasPasswordError = newPassword.length > 0 && newPassword.length < 8;
  const isFormValid =
    oldPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  const handlePasswordSubmit = () => {
    if (!uuid) {
      toast.error(t("missingUuid"));
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t("passwordTooShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    changePassword(
      { uuid, data: { old_password: oldPassword, new_password: newPassword } },
      {
        onSuccess: () => {
          toast.success(t("passwordChangeSuccess"));
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
          onOpenChange(false);
        },
        onError: () => {
          toast.error(t("passwordChangeError"));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md ml-auto mr-0 mb-0 mt-auto h-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <DialogMain>
          <div className="flex flex-col gap-4">
            <Input
              type="password"
              header={t("oldPassword")}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder={t("oldPasswordPlaceholder")}
              disabled={isPending}
              className="w-full"
            />
            <Input
              type="password"
              header={t("newPassword")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("newPasswordPlaceholder")}
              disabled={isPending}
              className="w-full"
            />
            <Input
              type="password"
              header={t("confirmPassword")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("confirmPasswordPlaceholder")}
              disabled={isPending}
              className="w-full"
            />
            {hasPasswordError && (
              <p className="text-sm text-destructive">{t("passwordTooShort")}</p>
            )}
            <Button
              onClick={handlePasswordSubmit}
              disabled={!isFormValid || isPending || hasPasswordError}
              className="w-full"
            >
              {t("changePassword")}
            </Button>
          </div>
        </DialogMain>
      </DialogContent>
    </Dialog>
  );
}
