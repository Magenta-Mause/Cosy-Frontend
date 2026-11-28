import fileIcon from "@/assets/icons/file.webp";
import folderIcon from "@/assets/icons/folder.webp";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/Icon.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import type { DropClash } from "@/lib/droppedFiles";

type Props = {
  /** The drop waiting for confirmation; null keeps the dialog closed. */
  pending: { targetPath: string; clashes: DropClash[] } | null;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Asks before a drop overwrites names that already exist in the target. Cancel is the first
 * button, so it gets the initial focus and a stray Enter does not overwrite anything.
 */
export const DropOverwriteDialog = ({ pending, onConfirm, onCancel }: Props) => {
  const { t } = useTranslationPrefix("components.fileBrowser.fileBrowserList");

  return (
    <Dialog open={pending !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dropOverwriteTitle")}</DialogTitle>
          <DialogDescription>
            {pending ? t("dropOverwriteDescription", { path: pending.targetPath }) : null}
          </DialogDescription>
        </DialogHeader>

        <DialogMain>
          <ul className="max-h-40 space-y-1 overflow-y-auto" data-testid="drop-overwrite-list">
            {pending?.clashes.map((c) => (
              <li key={c.name} className="flex min-w-0 items-center gap-2 text-sm">
                <Icon
                  src={c.isDirectory ? folderIcon : fileIcon}
                  variant="foreground"
                  className="size-4 shrink-0"
                />
                <span className="truncate">{c.name}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">{t("dropOverwriteNote")}</p>
        </DialogMain>

        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} data-testid="drop-overwrite-confirm">
            {t("dropOverwriteConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
