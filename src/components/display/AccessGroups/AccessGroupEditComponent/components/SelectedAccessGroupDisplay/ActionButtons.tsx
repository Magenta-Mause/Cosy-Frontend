import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

type Props = {
  loading: boolean;
  isChanged: boolean;
  isConfirmButtonDisabled: boolean;
  handleConfirm: () => void;
  handleRevert: () => void;
  handleDelete: () => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  accessGroupName: string;
};

const ActionButtons = ({
  loading,
  isChanged,
  isConfirmButtonDisabled,
  handleConfirm,
  handleRevert,
  handleDelete,
  deleteDialogOpen,
  setDeleteDialogOpen,
  accessGroupName,
}: Props) => {
  const { t } = useTranslationPrefix("components.gameServerSettings.accessManagement");

  return (
    <>
      {/* Action Buttons */}
      <div className="sticky bottom-4 w-fit ml-auto flex gap-4">
        <Button
          className="h-12.5"
          variant="secondary"
          disabled={loading || !isChanged}
          onClick={handleRevert}
        >
          {t("revert")}
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          className="h-12.5"
          disabled={isConfirmButtonDisabled}
        >
          {t("confirm")}
        </Button>
      </div>

      {/* Delete Group Button */}
      <div className="pt-4 border-t">
        <Button
          variant="destructive"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={loading}
        >
          {t("deleteGroup")}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteGroupTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteGroupDescription", { groupName: accessGroupName })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button className="h-[50px]" variant="secondary" disabled={loading}>
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="h-[50px]"
              disabled={loading}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionButtons;
