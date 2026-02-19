import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

interface UpdateModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onStay: () => void;
  onLeave: () => void;
  onSaveAndLeave: () => void;
}

const UnsavedModal = ({ open, setOpen, onLeave, onStay, onSaveAndLeave }: UpdateModalProps) => {
  const { t } = useTranslationPrefix("genericModal.unsavedModal");

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <DialogMain>
          <p>{t("message")}</p>
        </DialogMain>
        <DialogFooter>
          <Button variant="destructive" onClick={onLeave}>
            {t("leave")}
          </Button>
          <Button variant="secondary" onClick={onStay}>
            {t("stay")}
          </Button>
          <Button onClick={onSaveAndLeave}>{t("saveAndLeave")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnsavedModal;
