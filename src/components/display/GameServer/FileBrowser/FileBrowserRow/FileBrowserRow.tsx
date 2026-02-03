import { Download, File, Folder, Pencil, Trash2 } from "lucide-react";
import type { FileSystemObjectDto } from "@/api/generated/model";
import { formatBytes, formatUnixPerms, isDirectory } from "@/lib/fileSystemUtils";
import { cn } from "@/lib/utils";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

type Props = {
  obj: FileSystemObjectDto;
  loading?: boolean;

  canWrite: boolean;

  onEntryClick?: (obj: FileSystemObjectDto) => void;
  onRename?: (obj: FileSystemObjectDto) => void;
  onDelete?: (obj: FileSystemObjectDto) => void;
  onDownload?: (obj: FileSystemObjectDto) => Promise<unknown>;
};

export const FileBrowserRow = ({
  obj,
  loading,
  canWrite,
  onEntryClick,
  onRename,
  onDelete,
  onDownload,
}: Props) => {
  const dir = isDirectory(obj);
  const perms = formatUnixPerms(obj.permissions);
  const { t } = useTranslationPrefix("components.fileBrowser.fileBrowserList");

  return (
    <div className={cn("w-full flex items-center gap-2 rounded-md px-2 py-2", "hover:bg-black/5")}>
      <button
        type="button"
        onClick={() => onEntryClick?.(obj)}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 text-left rounded-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        )}
      >
        {dir ? <Folder className="h-4 w-4 shrink-0" /> : <File className="h-4 w-4 shrink-0" />}

        <span className="truncate text-sm">{obj.name}</span>

        <div
          className={cn(
            "ml-auto shrink-0 text-xs font-mono text-muted-foreground",
            "hidden md:inline-flex items-center gap-2",
          )}
        >
          <span
            className={cn(
              "ml-auto shrink-0 text-xs text-muted-foreground tabular-nums",
              "hidden md:inline-flex w-24 justify-end",
            )}
            title={obj.type === "FILE" ? `${obj.size ?? "unknown"} bytes` : "Directory"}
          >
            {obj.type === "FILE" ? formatBytes(obj.size) : "—"}
          </span>

          <span
            className={cn(
              "ml-auto shrink-0 text-xs font-mono text-muted-foreground",
              "hidden md:inline-flex items-center gap-2",
            )}
            title={`mode: ${perms.octal} (${perms.rwx})`}
          >
            <span>{perms.rwx}</span>
            <span>{perms.octal}</span>
          </span>
        </div>
      </button>

      {canWrite ? (
        <div className="flex items-center gap-1 shrink-0">
          {onRename ? (
            <button
              type="button"
              onClick={() => onRename(obj)}
              className={cn(
                "inline-flex items-center rounded-md p-2",
                "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              )}
              disabled={loading}
              data-loading={loading}
              aria-label={`${t("renameAction")} ${obj.name}`}
              title={t("renameAction")}
            >
              <Pencil className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{t("renameAction")}</span>
            </button>
          ) : null}

          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(obj)}
              className={cn(
                "inline-flex items-center rounded-md p-2",
                "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              )}
              disabled={loading}
              data-loading={loading}
              aria-label={`${t("deleteAction")} ${obj.name}`}
              title={t("deleteAction")}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{t("deleteAction")}</span>
            </button>
          ) : null}

          {onDownload ? (
            <button
              type="button"
              onClick={() => onDownload(obj)}
              className={cn(
                "inline-flex items-center rounded-md p-2",
                "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                dir ? "opacity-0" : "",
              )}
              disabled={loading}
              data-loading={loading}
              aria-label={`${t("downloadAction")} ${obj.name}`}
              title={t("downloadAction")}
            >
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{t("downloadAction")}</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
