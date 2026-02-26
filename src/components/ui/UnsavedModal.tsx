import {Button} from "@components/ui/button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogMain, DialogTitle} from "@components/ui/dialog";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

interface UpdateModalProps {
  open: boolean;
  handleLeave: () => void;
  onSaveAndLeave: () => void;
  handleStay: () => void;
  isSaving?: boolean;
  warningMessage?: string;
}

const UnsavedModal = ({ open,  handleLeave, onSaveAndLeave, isSaving, warningMessage, handleStay }: UpdateModalProps) => {
  const { t } = useTranslationPrefix("genericModal.unsavedModal");

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !isSaving) handleStay(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={"pr-6"}>{t("title")}</DialogTitle>
        </DialogHeader>
        <DialogMain className="text-base">
            {t("message")}
            {warningMessage && (
              <p className="text-sm text-destructive mt-2">{warningMessage}</p>
            )}
        </DialogMain>
        <DialogFooter>
          <Button onClick={onSaveAndLeave} disabled={isSaving}>
            {isSaving ? t("saving") : t("saveAndLeave")}
          </Button>
          <Button variant="destructive" onClick={handleLeave} disabled={isSaving}>
            {t("leave")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnsavedModal;
