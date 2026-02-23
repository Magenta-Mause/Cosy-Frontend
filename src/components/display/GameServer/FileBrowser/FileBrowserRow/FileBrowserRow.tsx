import TooltipWrapper from "@components/ui/TooltipWrapper";
import { Download, File, Folder, FolderDown, Pencil, Trash2 } from "lucide-react";
import type { FileSystemObjectDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { formatBytes, formatUnixPerms, isDirectory } from "@/lib/fileSystemUtils";
import { cn } from "@/lib/utils";

type Props = {
  obj: FileSystemObjectDto;
  loading?: boolean;

  canWrite: boolean;

  onEntryClick?: (obj: FileSystemObjectDto) => void;
  onRename?: (obj: FileSystemObjectDto) => void;
  onDelete?: (obj: FileSystemObjectDto) => void;
  onDownload?: (obj: FileSystemObjectDto) => Promise<unknown>;
};

const actionButtonClass = cn(
  "inline-flex items-center rounded-md p-2 sm:w-22",
  "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 justify-center",
);

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
    <button
      type={"button"}
      onClick={() => onEntryClick?.(obj)}
      className={cn("w-full flex items-center gap-6 rounded-md hover:bg-black/5 px-2 py-2")}
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 text-left rounded-md pl-1",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        )}
      >
        {dir ? <Folder className="h-4 w-4 shrink-0" /> : <File className="h-4 w-4 shrink-0" />}

        <span className="truncate text-sm ml-2">{obj.name}</span>

        <div
          className={cn(
            "ml-auto shrink-0 text-s text-muted-foreground",
            "hidden md:inline-flex items-center gap-6",
          )}
        >
          <TooltipWrapper
            tooltip={
              obj.type === "FILE"
                ? t("fileSizeTooltip", { size: obj.size ?? "?" })
                : t("directoryType")
            }
          >
            <span
              className={cn(
                "ml-auto shrink-0 text-muted-foreground tabular-nums",
                "hidden md:inline-flex w-24 justify-end",
              )}
            >
              {obj.type === "FILE" ? formatBytes(obj.size) : "—"}
            </span>
          </TooltipWrapper>

          <TooltipWrapper tooltip={t("fileModeTooltip", { octal: perms.octal, rwx: perms.rwx })}>
            <span
              className={cn(
                "ml-auto shrink-0 text-muted-foreground",
                "hidden md:inline-flex items-center gap-6",
              )}
            >
              <span>{perms.rwx}</span>
              <span>{perms.octal}</span>
            </span>
          </TooltipWrapper>
        </div>
      </div>

      {canWrite ? (
        <div className="flex items-center gap-1 shrink-0">
          {onRename ? (
            <TooltipWrapper tooltip={t("renameAction")}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(obj);
                }}
                className={cn(
                  "inline-flex items-center rounded-md p-2",
                  "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                )}
                disabled={loading}
                data-loading={loading}
                aria-label={`${t("renameAction")} ${obj.name}`}
              >
                <Pencil className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{t("renameAction")}</span>
              </button>
            </TooltipWrapper>
          ) : null}

          {onDelete ? (
            <TooltipWrapper tooltip={t("deleteAction")}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(obj);
                }}
                className={cn(
                  "inline-flex items-center rounded-md p-2",
                  "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                )}
                disabled={loading}
                data-loading={loading}
                aria-label={`${t("deleteAction")} ${obj.name}`}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{t("deleteAction")}</span>
              </button>
            </TooltipWrapper>
          ) : null}

          {onDownload && !dir ? (
            <TooltipWrapper tooltip={t("downloadAction")}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(obj);
                }}
                className={actionButtonClass}
                disabled={loading}
                data-loading={loading}
                aria-label={`${t("downloadAction")} ${obj.name}`}
              >
                <Download className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{t("downloadAction")}</span>
              </button>
            </TooltipWrapper>
          ) : null}

          {onDownload && dir ? (
            <TooltipWrapper tooltip={t("exportAction")}>
              <button
                type="button"
                onClick={() => onDownload(obj)}
                className={actionButtonClass}
                disabled={loading}
                data-loading={loading}
                aria-label={`${t("exportAction")} ${obj.name}`}
              >
                <FolderDown className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{t("exportAction")}</span>
              </button>
            </TooltipWrapper>
          ) : null}
        </div>
      ) : null}
    </button>
  );
};
