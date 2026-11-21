import type { TFunction } from "i18next";
import { useEffect, useMemo, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import {
  blobToTextIfLikely,
  getExt,
  PREVIEW_MODES,
  type PreviewMode,
  previewModeForExt,
} from "@/lib/fileSystemUtils";
import { cn } from "@/lib/utils";

type FilePreviewProps = {
  fileName: string;
  blob: Blob | null;
  loading?: boolean;
  error?: unknown;
  /** How the user asked to display the file ("Open as"); overrides the extension. */
  modeOverride?: PreviewMode | null;
  /** Shows the inline type picker for files whose extension doesn't identify them. */
  onModeChange?: (mode: PreviewMode) => void;
};

/** Whether the browser has decoded the object URL as the current media mode yet. */
type MediaStatus = { mode: PreviewMode; status: "ready" | "failed" } | null;

async function loadTextPreview(
  blob: Blob,
  force: boolean,
  isCancelled: () => boolean,
  onSuccess: (text: string) => void,
  onError: (reason: string) => void,
  t: TFunction<"translation", "components.fileBrowser.filePreview">,
) {
  try {
    const res = await blobToTextIfLikely(blob, { force });
    if (isCancelled()) return;

    if (res.ok) onSuccess(res.text);
    else onError(res.reason);
  } catch {
    if (!isCancelled()) onError(t("previewFailure"));
  }
}

export function FilePreview(props: FilePreviewProps) {
  const ext = useMemo(() => getExt(props.fileName), [props.fileName]);
  const modeOverride = props.modeOverride ?? null;
  const detectedMode = previewModeForExt(ext);
  const mode: PreviewMode = modeOverride ?? detectedMode ?? "text";
  const showPicker = detectedMode === null && !!props.onModeChange;
  const isMedia = mode !== "text";

  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>(null);
  const [textPreview, setTextPreview] = useState<{ text: string } | null>(null);
  const [textError, setTextError] = useState<string | null>(null);
  const { t } = useTranslationPrefix("components.fileBrowser.filePreview");

  useEffect(() => {
    setTextPreview(null);
    setTextError(null);
    setMediaStatus(null);

    if (!props.blob) {
      setObjectUrl(null);
      return;
    }

    if (isMedia) {
      const url = URL.createObjectURL(props.blob);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    let cancelled = false;

    loadTextPreview(
      props.blob,
      modeOverride === "text",
      () => cancelled,
      (text) => setTextPreview({ text }),
      (reason) => setTextError(reason),
      t,
    );

    return () => {
      cancelled = true;
      setObjectUrl(null);
    };
  }, [props.blob, isMedia, modeOverride, t]);

  if (props.loading) {
    return <div className="p-3 text-sm text-muted-foreground">{t("loadingPreview")}</div>;
  }

  if (props.error) {
    return <div className="p-3 text-sm text-destructive">{t("previewFailure")}</div>;
  }

  if (!props.blob) {
    return <div className="p-3 text-sm text-muted-foreground">{t("selectPreview")}</div>;
  }

  if (!showPicker) return renderBody();

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-2 pt-2 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">{t("viewAs")}</span>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={1}
          value={mode}
          // Re-clicking the active item pins it, which turns the automatic text attempt
          // into "show it as text anyway".
          onValueChange={(value) => props.onModeChange?.((value || mode) as PreviewMode)}
          data-testid="file-preview-mode"
        >
          {PREVIEW_MODES.map((m) => (
            <ToggleGroupItem key={m} value={m} data-testid={`file-preview-mode-${m}`}>
              {t(`modes.${m}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      {renderBody()}
    </div>
  );

  function renderBody() {
    if (isMedia && objectUrl) {
      const status = mediaStatus?.mode === mode ? mediaStatus.status : "pending";
      const onReady = () => setMediaStatus({ mode, status: "ready" });
      const onFailed = () => setMediaStatus({ mode, status: "failed" });

      if (status === "failed") {
        return (
          <div className="p-3 text-sm text-muted-foreground">
            {t("cannotDisplayAs", { mode: t(`modes.${mode}`) })}
          </div>
        );
      }

      // The element stays mounted but invisible until the browser has decoded the file, so
      // a file that turns out not to be this type never flashes an empty player first.
      const hiddenUntilReady = status === "pending" ? "hidden" : undefined;

      return (
        <div className="p-2 scroller">
          {status === "pending" && (
            <div className="text-sm text-muted-foreground">{t("loadingPreview")}</div>
          )}
          {mode === "image" && (
            <img
              key={`${mode}:${objectUrl}`}
              src={objectUrl}
              alt={props.fileName}
              onLoad={onReady}
              onError={onFailed}
              className={cn("max-w-full h-auto rounded-md border border-border", hiddenUntilReady)}
            />
          )}
          {mode === "video" && (
            // biome-ignore lint/a11y/useMediaCaption: no captions for arbitrary media files from volumes
            <video
              key={`${mode}:${objectUrl}`}
              src={objectUrl}
              controls
              onLoadedMetadata={onReady}
              onError={onFailed}
              className={cn("w-full rounded-md border border-border", hiddenUntilReady)}
            />
          )}
          {mode === "audio" && (
            // biome-ignore lint/a11y/useMediaCaption: no captions for arbitrary media files from volumes
            <audio
              key={`${mode}:${objectUrl}`}
              src={objectUrl}
              controls
              onLoadedMetadata={onReady}
              onError={onFailed}
              className={cn("w-full", hiddenUntilReady)}
            />
          )}
        </div>
      );
    }

    if (!textPreview && !textError) {
      return <div className="p-3 text-sm text-muted-foreground">{t("loadingPreview")}</div>;
    }

    if (textPreview) {
      return (
        <div className="p-2 flex-1 flex flex-col scroller h-full">
          <pre
            className={cn(
              "text-xs whitespace-pre-wrap wrap-break-words",
              "rounded-md border border-border bg-background p-3",
              "flex-1 min-h-0 scroller",
            )}
          >
            {textPreview.text}
          </pre>
        </div>
      );
    }

    return (
      <div className="p-3 text-sm text-muted-foreground">
        {t("noPreviewAvailable", { textError: textError ? ` (${textError})` : "" })}
        {/* With the picker on screen, pointing to the ⋯ menu would only distract. */}
        {!showPicker && ` ${t("openAsHint")}`}
      </div>
    );
  }
}
