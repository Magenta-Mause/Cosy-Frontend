import type { FileSystemObjectDto } from "@/api/generated/model";
import { Download, File, Folder, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes, formatUnixPerms, isDirectory } from "@/lib/fileSystemUtils";
import { Button } from "@components/ui/button";

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

        <span className="truncate">{obj.name}</span>

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
              aria-label={`Rename ${obj.name}`}
              title="Rename"
            >
              <Pencil className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Rename</span>
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
              aria-label={`Delete ${obj.name}`}
              title="Delete"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          ) : null}

          {onDownload ? (
            <Button
              type="button"
              onClick={() => onDownload(obj)}
              className={cn(
                "inline-flex items-center rounded-md p-2",
                "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                dir ? "opacity-0" : "",
              )}
              disabled={loading}
              aria-label={`Download ${obj.name}`}
              title="Download"
            >
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
