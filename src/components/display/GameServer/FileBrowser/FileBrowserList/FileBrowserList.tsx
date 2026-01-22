import { cn } from "@/lib/utils";
import * as React from "react";
import type { FileSystemObjectDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import {
  buildPathCrumbs,
  joinRemotePath,
  normalizePath,
  sortDirsFirst,
  validateName,
} from "@/lib/fileSystemUtils";
import { DeleteDialog } from "../dialogs/DeleteDialog";
import { MkdirDialog } from "../dialogs/MkdirDialog";
import { RenameDialog } from "../dialogs/RenameDialog";
import { FileBrowserBody } from "../FileBrowserBody/FileBrowserBody";
import { FileBrowserHeader } from "../FileBrowserHeader/FileBrowserHeader";
import { FileBrowserPreviewPane } from "../FileBrowserPreviewPane/FileBrowserPreviewPane";

export type FileBrowserListProps = {
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

  onDownload?: (obj: FileSystemObjectDto) => Promise<unknown>;

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

  const { t } = useTranslationPrefix("components.fileBrowser.fileBrowserList");

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
      setActionError(t("failedToCreateFolder"));
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
      setActionError(t("failedToRename"));
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
      setActionError(t("failedToDelete"));
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
          <FileBrowserHeader
            crumbs={crumbs}
            loading={props.loading}
            canWrite={!!canWrite}
            canMkdir={!!props.onMkdir && !!canWrite}
            onHome={() => props.onCrumbClick?.("/")}
            onCrumbClick={(p) => props.onCrumbClick?.(p)}
            onRefresh={props.onRefresh}
            onNewFolder={openMkdir}
          />

          <FileBrowserBody
            loading={props.loading}
            error={props.error}
            emptyText={t("noFiles")}
            objects={sorted}
            canWrite={!!canWrite}
            onEntryClick={props.onEntryClick}
            onRename={props.onRename ? openRename : undefined}
            onDelete={props.onDelete ? openDelete : undefined}
            onDownload={props.onDownload}
          />
        </div>

        <FileBrowserPreviewPane show={!!showPreview}>{props.preview}</FileBrowserPreviewPane>
      </div>

      <MkdirDialog
        open={mkdirOpen}
        onOpenChange={setMkdirOpen}
        currentPath={props.currentPath}
        value={mkdirName}
        onChange={setMkdirName}
        busy={actionBusy === "mkdir"}
        error={actionError}
        t={t}
        onSubmit={submitMkdir}
      />

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        currentPath={props.currentPath}
        obj={renameObj}
        value={renameName}
        onChange={setRenameName}
        busy={actionBusy === "rename"}
        error={actionError}
        t={t}
        onSubmit={submitRename}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        obj={deleteObj}
        busy={actionBusy === "delete"}
        error={actionError}
        t={t}
        onSubmit={submitDelete}
      />
    </>
  );
};
