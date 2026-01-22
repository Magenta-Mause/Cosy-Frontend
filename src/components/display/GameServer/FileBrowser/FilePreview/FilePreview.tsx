import { useEffect, useMemo, useState } from "react";
import { blobToTextIfLikely, getExt, IMAGE_EXTS, VIDEO_EXTS } from "@/lib/fileSystemUtils";
import { cn } from "@/lib/utils";

type FilePreviewProps = {
  fileName: string;
  blob: Blob | null;
  loading?: boolean;
  error?: unknown;
};

export function FilePreview(props: FilePreviewProps) {
  const ext = useMemo(() => getExt(props.fileName), [props.fileName]);

  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<{ text: string } | null>(null);
  const [textError, setTextError] = useState<string | null>(null);

  useEffect(() => {
    setTextPreview(null);
    setTextError(null);

    if (!props.blob) {
      setObjectUrl(null);
      return;
    }

    const isImage = IMAGE_EXTS.has(ext);
    const isVideo = VIDEO_EXTS.has(ext);

    if (isImage || isVideo) {
      const url = URL.createObjectURL(props.blob);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    let cancelled = false;
    (async () => {
      try {
        if (!props.blob) throw Error("Failed to preview");
        const res = await blobToTextIfLikely(props.blob);
        if (cancelled) return;
        if (res.ok) setTextPreview({ text: res.text });
        else setTextError(res.reason);
      } catch {
        if (!cancelled) setTextError("Failed to preview file");
      }
    })();

    return () => {
      cancelled = true;
      setObjectUrl(null);
    };
  }, [props.blob, ext]);

  if (props.loading) {
    return <div className="p-3 text-sm text-muted-foreground">Loading preview…</div>;
  }

  if (props.error) {
    return <div className="p-3 text-sm text-destructive">Failed to load preview</div>;
  }

  if (!props.blob) {
    return <div className="p-3 text-sm text-muted-foreground">Select a file to preview</div>;
  }

  if (objectUrl && IMAGE_EXTS.has(ext)) {
    return (
      <div className="p-2">
        <img
          src={objectUrl}
          alt={props.fileName}
          className="max-w-full h-auto rounded-md border border-border"
        />
      </div>
    );
  }

  if (objectUrl && VIDEO_EXTS.has(ext)) {
    return (
      <div className="p-2">
        {/** biome-ignore lint/a11y/useMediaCaption: no captions for arbitrary media files from volumes */}
        <video src={objectUrl} controls className="w-full rounded-md border border-border" />
      </div>
    );
  }

  if (textPreview) {
    return (
      <div className="p-2 flex-1 flex flex-col overflow-scroll h-full">
        <pre
          className={cn(
            "text-sm whitespace-pre-wrap wrap-break-words",
            "rounded-md border border-border bg-background p-3",
            "flex-1 min-h-0 overflow-auto",
          )}
        >
          {textPreview.text}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-3 text-sm text-muted-foreground">
      No preview available{textError ? ` (${textError})` : ""}.
    </div>
  );
}
