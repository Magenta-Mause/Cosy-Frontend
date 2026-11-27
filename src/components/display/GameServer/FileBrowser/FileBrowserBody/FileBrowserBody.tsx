import { useMemo } from "react";
import type { FileSystemObjectDto } from "@/api/generated/model";
import { joinDir, joinRemotePath, type PreviewMode } from "@/lib/fileSystemUtils";
import { cn } from "@/lib/utils";
import { useFileBrowser } from "../FileBrowserContext";
import { FileBrowserRow } from "../FileBrowserRow/FileBrowserRow";

type Props = {
  loading?: boolean;
  error?: string | null;
  emptyText: string;

  objects: FileSystemObjectDto[];
  canWrite: boolean;
  /** Folder currently hovered by an OS file drag, highlighted as the drop destination. */
  dropTargetPath?: string | null;

  onEntryClick?: (obj: FileSystemObjectDto) => void;
  onPreviewAs?: (obj: FileSystemObjectDto, mode: PreviewMode) => void;
  onRename?: (obj: FileSystemObjectDto) => void;
  onDelete?: (obj: FileSystemObjectDto) => void;
  onDownload?: (obj: FileSystemObjectDto) => Promise<unknown>;
  onEdit?: (obj: FileSystemObjectDto) => void;
  onChangePermissions?: (obj: FileSystemObjectDto) => void;
};

export const FileBrowserBody = ({
  loading,
  error,
  objects,
  emptyText,
  canWrite,
  dropTargetPath,
  onEntryClick,
  onPreviewAs,
  onRename,
  onDelete,
  onDownload,
  onEdit,
  onChangePermissions,
}: Props) => {
  const { currentPath, navigating, volumes } = useFileBrowser();

  const volumeUuidByPath = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of volumes ?? []) {
      if (v.container_path && v.uuid) {
        map.set(v.container_path.replace(/\/+$/, ""), v.uuid);
      }
    }
    return map;
  }, [volumes]);

  if (error) return <div className="p-3 text-sm text-destructive">{error}</div>;
  if (objects.length === 0 && !loading && currentPath === "/")
    return <div className="p-3 text-sm text-muted-foreground">{emptyText}</div>;

  const effectiveEntryClick = navigating ? undefined : onEntryClick;
  const effectiveLoading = loading || navigating;

  return (
    <div
      className={cn("flex-1 scroller", navigating && "opacity-50 transition-opacity")}
      data-loading={navigating || undefined}
    >
      <ul className="p-2">
        {currentPath !== "/" && (
          <li>
            <FileBrowserRow
              obj={{ name: "..", type: "DIRECTORY" }}
              dropPath={joinDir(currentPath, "..")}
              isDropTarget={dropTargetPath === joinDir(currentPath, "..")}
              loading={navigating}
              canWrite={false}
              onEntryClick={effectiveEntryClick}
            />
          </li>
        )}
        {objects.map((obj) => {
          const fullPath = joinRemotePath(currentPath, obj.name);
          const volumeUuid = obj.type === "DIRECTORY" ? volumeUuidByPath.get(fullPath) : undefined;
          return (
            <li key={`${obj.type ?? "UNKNOWN"}:${obj.name}`}>
              <FileBrowserRow
                obj={obj}
                dropPath={obj.type === "DIRECTORY" ? fullPath : undefined}
                isDropTarget={obj.type === "DIRECTORY" && dropTargetPath === fullPath}
                loading={effectiveLoading}
                canWrite={canWrite}
                volumeUuid={volumeUuid}
                onEntryClick={effectiveEntryClick}
                onPreviewAs={navigating ? undefined : onPreviewAs}
                onRename={navigating ? undefined : onRename}
                onDelete={navigating ? undefined : onDelete}
                onDownload={navigating ? undefined : onDownload}
                onEdit={navigating ? undefined : onEdit}
                onChangePermissions={navigating ? undefined : onChangePermissions}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};
