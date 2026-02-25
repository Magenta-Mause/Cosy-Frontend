import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

interface UpdateModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onLeave: () => void;
  onSaveAndLeave: () => void;
  warningMessage?: string;
}

const UnsavedModal = ({ open, setOpen, onLeave, onSaveAndLeave, warningMessage }: UpdateModalProps) => {
  const { t } = useTranslationPrefix("genericModal.unsavedModal");

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("message")}
            {warningMessage && (
              <p className="text-sm text-destructive mt-2">{warningMessage}</p>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="destructive" onClick={onLeave}>
            {t("leave")}
          </Button>
          <Button onClick={onSaveAndLeave}>{t("saveAndLeave")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnsavedModal;
