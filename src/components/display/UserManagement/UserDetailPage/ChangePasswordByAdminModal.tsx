import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { useState } from "react";
import { useChangePasswordByAdmin } from "@/api/generated/backend-api";
import type { UserEntityDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

const ChangePasswordByAdminModal = (props: {
  user: UserEntityDto;
  open: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslationPrefix("components.userManagement.admin.changePasswordDialog");
  const [newPassword, setNewPassword] = useState("");
  const { mutate: changePasswordByAdmin } = useChangePasswordByAdmin({
    mutation: {
      onSuccess: () => {
        props.onClose();
        setNewPassword("");
      },
    },
  });

  const hasPasswordError = newPassword.length > 0 && newPassword.length < 8;

  const handleChangePassword = () => {
    if (!props.user.uuid) return;
    changePasswordByAdmin({ uuid: props.user.uuid, data: { new_password: newPassword } });
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogMain>
          <Input
            type="password"
            header={t("newPasswordLabel")}
            description={t("newPasswordDescription")}
            placeholder={t("newPasswordPlaceholder")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={hasPasswordError ? t("newPasswordError") : undefined}
          />
        </DialogMain>
        <DialogFooter>
          <Button variant="secondary" onClick={props.onClose}>
            {t("cancelButton")}
          </Button>
          <Button variant="destructive" disabled={hasPasswordError || newPassword.length === 0} onClick={handleChangePassword}>
            {t("confirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordByAdminModal;
