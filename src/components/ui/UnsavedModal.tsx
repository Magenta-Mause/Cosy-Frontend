import {Button} from "@components/ui/button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogMain, DialogTitle} from "@components/ui/dialog";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import * as React from "react";
import {useEffect, useMemo} from "react";
import {useBlocker} from "@tanstack/react-router";

interface UnsavedModalProps {
  warningMessage?: string;
  isChanged: boolean;
  onSave: () => Promise<void>;
}

const UnsavedModal = ({ isChanged, onSave, warningMessage }: UnsavedModalProps) => {
  const { t } = useTranslationPrefix("genericModal.unsavedModal");
  const [isSaving, setIsSaving] = React.useState(false);
  useEffect(() => {
    console.log("isChanged: ", isChanged);
  }, [isChanged]);

  // Move blocker logic here—modal now self-contained
  const blocker = useBlocker({
    shouldBlockFn: () => {
      console.log("In blocker:", isChanged)
      return isChanged
    },
    withResolver: true,
    enableBeforeUnload: isChanged,
  });

  const showUnsavedModal = blocker.status === 'blocked';

  if (!showUnsavedModal) return null;

  const handleLeave = () => {
    blocker.proceed?.();
  };

  const handleStay = () => {
    blocker.reset?.();
  };

  const handleSaveAndLeave = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      await onSave();
      blocker.proceed?.(); // proceed after successful save
    } catch {
      blocker.reset?.(); // stay if save fails
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(v) => { if (!v && !isSaving) handleStay(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={"pr-6"}>{t("title")}</DialogTitle>
        </DialogHeader>
        <DialogMain className="text-base">
          {t("message")}
          {blocker.next && (
            <p className="text-sm text-muted-foreground mt-1">
              Leaving to: {blocker.next.pathname}
            </p>
          )}
          {warningMessage && (
            <p className="text-sm text-destructive mt-2">{warningMessage}</p>
          )}
        </DialogMain>
        <DialogFooter>
          <Button onClick={handleSaveAndLeave} disabled={isSaving}>
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

