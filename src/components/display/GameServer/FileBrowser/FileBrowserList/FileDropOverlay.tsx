import { Fragment, useEffect, useMemo, useState } from "react";
import arrowRightIcon from "@/assets/icons/arrowRight.webp";
import folderIcon from "@/assets/icons/folder.webp";
import uploadIcon from "@/assets/icons/upload.webp";
import Icon from "@/components/ui/Icon.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { cn } from "@/lib/utils";
import type { DropUploadState } from "../FileBrowserDialog/hooks/useFileBrowserActions";

type Props = {
  isDragging: boolean;
  dropTarget: string | null;
  isDroppingIntoCurrent: boolean;
  uploadState?: DropUploadState | null;
  onCancelUpload?: () => void;
};

/** Segments shown before the path collapses to "… › a › b › c". */
const MAX_SEGMENTS = 3;

/**
 * Keeps the last value seen while `active`, so a layer fading out still shows what it showed
 * instead of going blank mid-transition.
 */
function useStickyValue<T>(value: T, active: boolean): T {
  // `value` must be referentially stable (a primitive or memoized), or this effect re-runs
  // every render. On the render that deactivates, `kept` already holds the last active value.
  const [kept, setKept] = useState(value);
  useEffect(() => {
    if (active) setKept(value);
  }, [active, value]);
  return active ? value : kept;
}

type Pill =
  | { kind: "folder"; path: string }
  | { kind: "blocked"; whileUploading: boolean }
  | { kind: "preparing" }
  | { kind: "uploading"; done: number; total: number; cancelling: boolean };

/** The drop destination as plain breadcrumb text, matching the file browser header. */
const DropPath = ({ path, className }: { path: string; className?: string }) => {
  const segments = path.split("/").filter(Boolean);
  const shown = segments.length > MAX_SEGMENTS ? ["…", ...segments.slice(-MAX_SEGMENTS)] : segments;
  const labels = shown.length === 0 ? ["HOME"] : shown;

  return (
    <span
      title={path}
      className={cn("inline-flex min-w-0 max-w-full items-center gap-1.5 text-sm", className)}
    >
      <Icon src={folderIcon} variant="foreground" className="size-4 shrink-0" />
      {labels.map((label, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: path segments can repeat ("a/a"); position is the identity
        <Fragment key={i}>
          {i > 0 && (
            <Icon
              src={arrowRightIcon}
              variant="foreground"
              className="size-3 shrink-0 opacity-50"
            />
          )}
          <span
            className={cn(
              "truncate",
              i === labels.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </span>
        </Fragment>
      ))}
    </span>
  );
};

/**
 * Feedback for OS file drags over the file browser. Every layer stays mounted and fades, and
 * none takes pointer events, so the drop zone underneath still sees which folder row or
 * breadcrumb the cursor is on.
 */
export const FileDropOverlay = ({
  isDragging,
  dropTarget,
  isDroppingIntoCurrent,
  uploadState,
  onCancelUpload,
}: Props) => {
  const { t } = useTranslationPrefix("components.fileBrowser.fileBrowserList");

  const showCenter = isDragging && isDroppingIntoCurrent && dropTarget !== null;
  const showPill = (isDragging && !isDroppingIntoCurrent) || (!isDragging && Boolean(uploadState));

  const centerPath = useStickyValue(dropTarget ?? "/", showCenter);
  const currentPill = useMemo((): Pill => {
    if (!isDragging && uploadState) {
      return uploadState.phase === "preparing"
        ? { kind: "preparing" }
        : { kind: "uploading", ...uploadState };
    }
    if (dropTarget) return { kind: "folder", path: dropTarget };
    return { kind: "blocked", whileUploading: Boolean(uploadState) };
  }, [isDragging, uploadState, dropTarget]);
  const pill = useStickyValue(currentPill, showPill);
  // The cancel button is the only part of the overlay that takes clicks.
  const canCancel =
    showPill && pill.kind === "uploading" && !pill.cancelling && Boolean(onCancelUpload);

  const fade = "transition-opacity duration-200 ease-out";

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20"
      aria-hidden={!isDragging && !showPill}
    >
      {/* Dimmed backdrop + message: dropping into the open folder. */}
      <div
        data-testid="file-browser-drop-overlay"
        data-visible={showCenter || undefined}
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-lg bg-background/75 p-6 backdrop-blur-[2px]",
          fade,
          showCenter ? "opacity-100" : "opacity-0",
        )}
      >
        <div
          className={cn(
            "flex max-w-full flex-col items-center gap-3 text-center transition-transform duration-200 ease-out",
            showCenter ? "scale-100" : "scale-95",
          )}
        >
          <div className="rounded-full bg-foreground/10 p-3">
            <Icon src={uploadIcon} variant="foreground" className="size-8" />
          </div>
          <div className="text-lg font-semibold">{t("dropOverlayTitle")}</div>
          <DropPath path={centerPath} className="-mt-1" />
        </div>
      </div>

      {/* Dashed frame for any file drag; accent colour when the drop would be accepted. */}
      <div
        className={cn(
          "absolute inset-0 rounded-lg border-2 border-dashed transition-[opacity,border-color] duration-200 ease-out",
          dropTarget ? "border-ring" : "border-border",
          isDragging ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Bottom hint: folder-row target, blocked drop, or upload progress. */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-3 flex justify-center px-4 transition-[opacity,transform] duration-200 ease-out",
          showPill ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <span
          data-testid="file-browser-drop-hint"
          className={cn(
            "flex min-w-0 max-w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm shadow-md",
            pill.kind === "blocked" && "text-muted-foreground",
          )}
        >
          {pill.kind === "folder" && (
            <>
              <span className="shrink-0">{t("dropToUpload")}</span>
              <DropPath path={pill.path} />
            </>
          )}
          {pill.kind === "preparing" && t("preparingDrop")}
          {pill.kind === "uploading" &&
            (pill.cancelling
              ? t("cancellingUpload")
              : pill.total === 0
                ? t("creatingFolders")
                : t("uploadingFiles", { done: pill.done, total: pill.total }))}
          {pill.kind === "uploading" && !pill.cancelling && (
            <button
              type="button"
              data-testid="file-browser-cancel-upload"
              disabled={!canCancel}
              onClick={onCancelUpload}
              className={cn(
                "shrink-0 font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline",
                canCancel ? "pointer-events-auto cursor-pointer" : "pointer-events-none",
              )}
            >
              {t("cancelUpload")}
            </button>
          )}
          {pill.kind === "blocked" &&
            (pill.whileUploading ? t("dropWhileUploading") : t("dropNotAllowed"))}
        </span>
      </div>
    </div>
  );
};
