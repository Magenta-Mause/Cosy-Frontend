import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

interface LogOutAlertDialogProps {
  onConfirm: () => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogOutAlertDialog({ onConfirm, open, onOpenChange }: LogOutAlertDialogProps) {
  const { t } = useTranslationPrefix("logOutDialog");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
      navigate({ to: "/" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (loading) return;
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogMain>{t("description")}</DialogMain>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button className="h-[50px]" variant="secondary" disabled={loading}>
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={"destructive"}
            onClick={handleConfirm}
            className={"h-[50px]"}
            disabled={loading}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
