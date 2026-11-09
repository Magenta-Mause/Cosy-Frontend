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
};

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
  const detectedMode = useMemo(() => previewModeForExt(ext), [ext]);

  // Only offered when the extension doesn't tell us how to render the file.
  const [chosenMode, setChosenMode] = useState<PreviewMode | null>(null);
  const mode: PreviewMode = detectedMode ?? chosenMode ?? "text";
  const isMedia = mode !== "text";

  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  // The mode the browser failed to decode this file as, so switching modes clears it.
  const [failedMode, setFailedMode] = useState<PreviewMode | null>(null);
  const [textPreview, setTextPreview] = useState<{ text: string } | null>(null);
  const [textError, setTextError] = useState<string | null>(null);
  const { t } = useTranslationPrefix("components.fileBrowser.filePreview");

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset the manual choice per file
  useEffect(() => {
    setChosenMode(null);
  }, [props.fileName]);

  useEffect(() => {
    setTextPreview(null);
    setTextError(null);
    setFailedMode(null);

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
      chosenMode === "text",
      () => cancelled,
      (text) => setTextPreview({ text }),
      (reason) => setTextError(reason),
      t,
    );

    return () => {
      cancelled = true;
      setObjectUrl(null);
    };
  }, [props.blob, isMedia, chosenMode, t]);

  if (props.loading) {
    return <div className="p-3 text-sm text-muted-foreground">{t("loadingPreview")}</div>;
  }

  if (props.error) {
    return <div className="p-3 text-sm text-destructive">{t("previewFailure")}</div>;
  }

  if (!props.blob) {
    return <div className="p-3 text-sm text-muted-foreground">{t("selectPreview")}</div>;
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {detectedMode === null && (
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
            onValueChange={(value) => setChosenMode((value || mode) as PreviewMode)}
            data-testid="file-preview-mode"
          >
            {PREVIEW_MODES.map((m) => (
              <ToggleGroupItem key={m} value={m} data-testid={`file-preview-mode-${m}`}>
                {t(`modes.${m}`)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {renderContent()}
    </div>
  );

  function renderContent() {
    if (isMedia && failedMode === mode) {
      return (
        <div className="p-3 text-sm text-muted-foreground">
          {t("cannotDisplayAs", { mode: t(`modes.${mode}`) })}
        </div>
      );
    }

    if (objectUrl && mode === "image") {
      return (
        <div className="p-2 scroller">
          <img
            key={objectUrl}
            src={objectUrl}
            alt={props.fileName}
            onError={() => setFailedMode(mode)}
            className="max-w-full h-auto rounded-md border border-border"
          />
        </div>
      );
    }

    if (objectUrl && mode === "video") {
      return (
        <div className="p-2 scroller">
          {/** biome-ignore lint/a11y/useMediaCaption: no captions for arbitrary media files from volumes */}
          <video
            key={objectUrl}
            src={objectUrl}
            controls
            onError={() => setFailedMode(mode)}
            className="w-full rounded-md border border-border"
          />
        </div>
      );
    }

    if (objectUrl && mode === "audio") {
      return (
        <div className="p-2">
          {/** biome-ignore lint/a11y/useMediaCaption: no captions for arbitrary media files from volumes */}
          <audio
            key={objectUrl}
            src={objectUrl}
            controls
            onError={() => setFailedMode(mode)}
            className="w-full"
          />
        </div>
      );
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
      </div>
    );
  }
}
