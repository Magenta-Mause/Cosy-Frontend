import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogMain, DialogTitle } from "@components/ui/dialog";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useDeleteUserEntity } from "@/api/generated/backend-api";
import type { UserEntityDto } from "@/api/generated/model";
import { userSliceActions } from "@/stores/slices/userSlice";

const DeleteUserConfirmationModal = (props: {
  user: UserEntityDto;
  open: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { mutate: deleteUser } = useDeleteUserEntity({
    mutation: {
      onSuccess: () => {
        if (!props.user.uuid) return;
        dispatch(userSliceActions.removeUser(props.user.uuid));
        props.onClose();
      },
    },
  });

  const handleDeletion = () => {
    if (!props.user.uuid) return;
    deleteUser({ uuid: props.user.uuid });
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("components.userManagement.deleteUserDialog.title")}</DialogTitle>
        </DialogHeader>
        <DialogMain>
          <p className="text-base">{t("components.userManagement.deleteUserDialog.message")}</p>
        </DialogMain>
        <DialogFooter>
          <Button variant="secondary" onClick={props.onClose}>
            {t("components.userManagement.deleteUserDialog.cancelButton")}
          </Button>
          <Button variant="destructive" onClick={handleDeletion}>
            {t("components.userManagement.deleteUserDialog.confirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserConfirmationModal;
