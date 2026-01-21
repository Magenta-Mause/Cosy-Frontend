import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { ChevronRight, File, Folder, Home, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import * as React from "react";
import type { FileSystemObjectDto } from "@/api/generated/model";
import { cn } from "@/lib/utils";
import {
  buildPathCrumbs,
  sortDirsFirst,
  validateName,
  joinRemotePath,
  normalizePath,
  isDirectory,
  formatUnixPerms,
} from "@/lib/fileSystemUtils";

type FileBrowserListProps = {
  currentPath: string;
  objects: FileSystemObjectDto[];

  loading?: boolean;
  error?: string | null;

  fetchDepth: number;

  onEntryClick?: (obj: FileSystemObjectDto) => void;
  onCrumbClick?: (path: string) => void;

  onRefresh?: () => void;

  preview?: React.ReactNode;
  showPreview?: boolean;
  previewedPath?: string | null;
  onClosePreview?: () => void;

  onMkdir?: (args: { parentPath: string; name: string }) => Promise<unknown> | undefined;
  onRename?: (args: {
    parentPath: string;
    oldName: string;
    newName: string;
    obj: FileSystemObjectDto;
  }) => Promise<unknown>;
  onDelete?: (args: {
    parentPath: string;
    name: string;
    obj: FileSystemObjectDto;
  }) => Promise<unknown>;

  readOnly?: boolean;
};
export function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined) return "—";
  if (!Number.isFinite(bytes)) return "—";
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = bytes;
  let i = 0;

  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }

  const decimals = i === 0 ? 0 : v < 10 ? 2 : v < 100 ? 1 : 0;
  return `${v.toFixed(decimals)} ${units[i]}`;
}

export const FileBrowserList = (props: FileBrowserListProps) => {
  const crumbs = buildPathCrumbs(props.currentPath);
  const showPreview = props.showPreview && props.preview;
  const sorted = React.useMemo(() => [...props.objects].sort(sortDirsFirst), [props.objects]);

  const canWrite = !props.readOnly && (props.onMkdir || props.onRename || props.onDelete);

  const [mkdirOpen, setMkdirOpen] = React.useState(false);
  const [mkdirName, setMkdirName] = React.useState("");

  const [renameOpen, setRenameOpen] = React.useState(false);
  const [renameObj, setRenameObj] = React.useState<FileSystemObjectDto | null>(null);
  const [renameName, setRenameName] = React.useState("");

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteObj, setDeleteObj] = React.useState<FileSystemObjectDto | null>(null);

  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionBusy, setActionBusy] = React.useState<"mkdir" | "rename" | "delete" | null>(null);

  const openMkdir = () => {
    setActionError(null);
    setMkdirName("");
    setMkdirOpen(true);
  };

  const openRename = (obj: FileSystemObjectDto) => {
    setActionError(null);
    setRenameObj(obj);
    setRenameName(obj.name ?? "");
    setRenameOpen(true);
  };

  const openDelete = (obj: FileSystemObjectDto) => {
    setActionError(null);
    setDeleteObj(obj);
    setDeleteOpen(true);
  };

  const submitMkdir = async () => {
    if (!props.onMkdir) return;

    const err = validateName(mkdirName);
    if (err) return setActionError(err);

    setActionBusy("mkdir");
    setActionError(null);
    try {
      await props.onMkdir({ parentPath: props.currentPath || "/", name: mkdirName.trim() });
      setMkdirOpen(false);
      props.onRefresh?.();
    } catch (e) {
      console.error(e);
      setActionError("Failed to create folder.");
    } finally {
      setActionBusy(null);
    }
  };

  const submitRename = async () => {
    if (!props.onRename || !renameObj) return;

    const err = validateName(renameName);
    if (err) return setActionError(err);

    const newName = renameName.trim();
    if (newName === renameObj.name) {
      setRenameOpen(false);
      return;
    }

    setActionBusy("rename");
    setActionError(null);

    const oldPath =
      renameObj.name != null ? joinRemotePath(props.currentPath || "/", renameObj.name) : null;

    try {
      await props.onRename({
        parentPath: props.currentPath || "/",
        oldName: renameObj.name,
        newName,
        obj: renameObj,
      });

      if (oldPath && props.previewedPath && normalizePath(props.previewedPath) === oldPath) {
        props.onClosePreview?.();
      }

      setRenameOpen(false);
      props.onRefresh?.();
    } catch (e) {
      console.error(e);
      setActionError("Failed to rename.");
    } finally {
      setActionBusy(null);
    }
  };

  const submitDelete = async () => {
    if (!props.onDelete || !deleteObj) return;

    setActionBusy("delete");
    setActionError(null);

    const delPath =
      deleteObj.name != null ? joinRemotePath(props.currentPath || "/", deleteObj.name) : null;

    try {
      await props.onDelete({
        parentPath: props.currentPath || "/",
        name: deleteObj.name,
        obj: deleteObj,
      });

      if (delPath && props.previewedPath && normalizePath(props.previewedPath) === delPath) {
        props.onClosePreview?.();
      }

      setDeleteOpen(false);
      props.onRefresh?.();
    } catch (e) {
      console.error(e);
      setActionError("Failed to delete.");
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <>
      <div className="border-border border rounded-lg bg-primary-banner h-full flex overflow-hidden">
        <div
          className={cn("flex flex-col flex-1 min-w-0", showPreview && "border-r border-r-border")}
        >
          <div className="border-b border-b-border px-3 py-2 flex items-center gap-1 text-sm text-muted-foreground">
            <button
              type="button"
              className="flex items-center gap-1 hover:underline"
              onClick={() => props.onCrumbClick?.("/")}
            >
              <Home className="h-4 w-4" />
              <span className={cn(crumbs.length === 0 && "text-foreground font-medium")}>HOME</span>
            </button>

            {crumbs.map((c, i) => (
              <span key={c.path} className="flex items-center gap-1 min-w-0">
                <ChevronRight className="h-4 w-4" />
                <button
                  type="button"
                  className={cn(
                    "truncate hover:underline",
                    i === crumbs.length - 1 && "text-foreground font-medium",
                  )}
                  onClick={() => props.onCrumbClick?.(c.path)}
                  title={c.path}
                >
                  {c.label}
                </button>
              </span>
            ))}

            <span className="ml-auto flex items-center gap-2">
              {props.onMkdir && canWrite ? (
                <button
                  type="button"
                  onClick={openMkdir}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-1",
                    "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  )}
                  disabled={props.loading}
                  title="New folder"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New folder</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={props.onRefresh}
                className="inline-flex items-center"
                aria-label="Refresh"
                disabled={props.loading}
                title="Refresh"
              >
                <RefreshCw className={cn("h-4 w-4", props.loading && "animate-spin")} />
              </button>
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            {props.error ? (
              <div className="p-3 text-sm text-destructive">{props.error}</div>
            ) : sorted.length === 0 && !props.loading ? (
              <div className="p-3 text-sm text-muted-foreground">No files</div>
            ) : (
              <ul className="p-2">
                {sorted.map((obj) => {
                  const dir = isDirectory(obj);
                  const perms = formatUnixPerms(obj.permissions);
                  const key = `${obj.type ?? "UNKNOWN"}:${obj.name}`;

                  return (
                    <li key={key}>
                      <div
                        className={cn(
                          "w-full flex items-center gap-2 rounded-md px-2 py-2",
                          "hover:bg-black/5",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => props.onEntryClick?.(obj)}
                          className={cn(
                            "flex min-w-0 flex-1 items-center gap-2 text-left rounded-md",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                          )}
                        >
                          {dir ? (
                            <Folder className="h-4 w-4 shrink-0" />
                          ) : (
                            <File className="h-4 w-4 shrink-0" />
                          )}

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
                              title={
                                obj.type === "FILE" ? `${obj.size ?? "unknown"} bytes` : "Directory"
                              }
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
                            {props.onRename ? (
                              <button
                                type="button"
                                onClick={() => openRename(obj)}
                                className={cn(
                                  "inline-flex items-center rounded-md p-2",
                                  "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                                )}
                                disabled={props.loading}
                                aria-label={`Rename ${obj.name}`}
                                title="Rename"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            ) : null}

                            {props.onDelete ? (
                              <button
                                type="button"
                                onClick={() => openDelete(obj)}
                                className={cn(
                                  "inline-flex items-center rounded-md p-2",
                                  "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                                )}
                                disabled={props.loading}
                                aria-label={`Delete ${obj.name}`}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {showPreview ? <div className="flex-1 p-2 overflow-auto">{props.preview}</div> : null}
      </div>

      {/* MKDIR DIALOG */}
      <Dialog open={mkdirOpen} onOpenChange={setMkdirOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create folder</DialogTitle>
            <DialogDescription>Creates a folder inside: {props.currentPath}</DialogDescription>
          </DialogHeader>

          <DialogMain>
            <div className="flex flex-col gap-3">
              <span className="text-sm text-muted-foreground">Folder name</span>
              <Input
                autoFocus
                value={mkdirName}
                onChange={(e) => setMkdirName(e.target.value)}
                placeholder="e.g. logs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submitMkdir();
                }}
              />
              {actionError ? <div className="text-sm text-destructive">{actionError}</div> : null}
            </div>
          </DialogMain>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setMkdirOpen(false)}
              disabled={actionBusy === "mkdir"}
            >
              Cancel
            </Button>
            <Button onClick={submitMkdir} disabled={actionBusy === "mkdir"}>
              {actionBusy === "mkdir" ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RENAME DIALOG */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
            <DialogDescription>
              {renameObj ? `Rename "${renameObj.name}" in ${props.currentPath}` : null}
            </DialogDescription>
          </DialogHeader>

          <DialogMain>
            <div className="flex flex-col gap-3">
              <span className="text-sm text-muted-foreground">New name</span>
              <Input
                autoFocus
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                placeholder="e.g. server.log"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submitRename();
                }}
              />
              {actionError ? <div className="text-sm text-destructive">{actionError}</div> : null}
            </div>
          </DialogMain>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setRenameOpen(false)}
              disabled={actionBusy === "rename"}
            >
              Cancel
            </Button>
            <Button onClick={submitRename} disabled={actionBusy === "rename" || !renameObj}>
              {actionBusy === "rename" ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete</DialogTitle>
            <DialogDescription>
              {deleteObj ? `This will permanently delete "${deleteObj.name}".` : null}
            </DialogDescription>
          </DialogHeader>

          <DialogMain>
            <div className="text-sm">
              {deleteObj?.type === "DIRECTORY"
                ? "If this folder is not empty, the server may refuse the operation."
                : "This cannot be undone."}
              {actionError ? <div className="mt-3 text-destructive">{actionError}</div> : null}
            </div>
          </DialogMain>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteOpen(false)}
              disabled={actionBusy === "delete"}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitDelete}
              disabled={actionBusy === "delete" || !deleteObj}
            >
              {actionBusy === "delete" ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
