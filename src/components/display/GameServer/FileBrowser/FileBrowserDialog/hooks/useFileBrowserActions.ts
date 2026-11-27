import axios from "axios";
import type { TFunction } from "i18next";
import { useCallback, useRef, useState } from "react";
import { FILE_TRANSFER_OPTIONS } from "@/api/axiosInstance";
import {
  createDirectoryInVolume,
  getFileSystemForVolume,
  readFileFromVolume,
  setPermissions,
  uploadArchiveToVolume,
  uploadFileToVolume,
  useCreateDirectoryInVolume,
  useDeleteInVolume,
  useRenameInVolume,
} from "@/api/generated/backend-api";
import type { FileSystemObjectDto } from "@/api/generated/model";
import {
  collectDroppedItems,
  type DropClash,
  findDropClashes,
  planDropUpload,
} from "@/lib/droppedFiles";
import { downloadSingleFile, joinRemotePath, normalizePath } from "@/lib/fileSystemUtils";
import { notificationModal } from "@/lib/notificationModal";
import { zipAndDownload, zipAndDownloadChunked } from "@/lib/zipDownload";

type FileBrowserT = TFunction<"translation", "components.fileBrowser.fileBrowserDialog">;

/** A drop in flight: reading the dropped folders, then uploading file by file. */
export type DropUploadState =
  | { phase: "preparing" }
  | { phase: "uploading"; done: number; total: number; cancelling: boolean };

/** A drop waiting for the user to confirm overwriting names that already exist. */
export type PendingDropConfirm = {
  targetPath: string;
  clashes: DropClash[];
  resolve: (confirmed: boolean) => void;
};

interface UseFileBrowserActionsArgs {
  serverUuid: string;
  currentPath: string;
  fetchDepth: number;
  ensurePathFetched: (path: string, depth: number, force?: boolean) => Promise<void>;
  invalidatePathsUnder: (path: string) => void;
  selectedFilePath?: string | null;
  setSelectedFilePath: (path: string) => void;
  setSelectedFileName: (name: string) => void;
  closePreview: () => void;
  t: FileBrowserT;
}

export const useFileBrowserActions = ({
  serverUuid,
  currentPath,
  fetchDepth,
  ensurePathFetched,
  invalidatePathsUnder,
  selectedFilePath,
  setSelectedFilePath,
  setSelectedFileName,
  closePreview,
  t,
}: UseFileBrowserActionsArgs) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const archiveInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingArchives, setPendingArchives] = useState<File[] | null>(null);

  const [downloadModalPath, setDownloadModalPath] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  const [editingFile, setEditingFile] = useState<{
    obj: FileSystemObjectDto | null;
    content: string | null;
    fetching: boolean;
  } | null>(null);

  const [uploadState, setUploadState] = useState<DropUploadState | null>(null);
  const [pendingDropConfirm, setPendingDropConfirm] = useState<PendingDropConfirm | null>(null);
  const uploadingRef = useRef(false);
  const cancelUploadRef = useRef(false);
  // Drops can outlive a navigation; the post-upload refresh must target where the user is now.
  const currentPathRef = useRef(currentPath);
  currentPathRef.current = currentPath;

  const [permissionsObj, setPermissionsObj] = useState<FileSystemObjectDto | null>(null);

  const renameMutation = useRenameInVolume();
  const mkdirMutation = useCreateDirectoryInVolume();
  const deleteMutation = useDeleteInVolume();

  const uploadSelectedFile = async (file: File) => {
    const path = joinRemotePath(currentPath, file.name);
    const apiPath = path === "/" ? "" : path;

    await uploadFileToVolume(serverUuid, file, { path: apiPath }, FILE_TRANSFER_OPTIONS);
    await ensurePathFetched(currentPath, fetchDepth, true);
  };

  const onFilePicked: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadSelectedFile(file);
    } catch (e) {
      notificationModal.error({ message: t("fileUploadError"), cause: e });
    } finally {
      e.target.value = "";
    }
  };

  /**
   * Uploads whatever was dropped (files and whole folders) into `targetPath`. Directories are
   * created parents first; one that already exists (409) is reused, so dropping a folder onto
   * its own copy merges into it. When a dropped name already exists in the target, the user
   * confirms first, because same-named files are overwritten.
   */
  const uploadDropped = useCallback(
    async (targetPath: string, dataTransfer: DataTransfer) => {
      if (uploadingRef.current) {
        notificationModal.error({ message: t("dropWhileUploadingError") });
        return;
      }
      uploadingRef.current = true;
      cancelUploadRef.current = false;
      // Set before any await, so the overlay already warns about a second drop while folders
      // are still being read.
      setUploadState({ phase: "preparing" });
      // Taken synchronously: the browser empties the DataTransfer once the drop handler returns.
      const collecting = collectDroppedItems(dataTransfer);
      let failedPath: string | null = null;
      let uploaded = false;
      try {
        const items = await collecting;
        const plan = planDropUpload(targetPath, items);
        if (plan.files.length === 0 && plan.directories.length === 0) return;

        // A fresh listing, not the cache: the target may be a folder that was never opened.
        const target = normalizePath(targetPath);
        const listing = await getFileSystemForVolume(serverUuid, {
          path: target === "/" ? "" : target,
          fetch_depth: 1,
        });
        const clashes = findDropClashes(items, listing.objects ?? []);
        if (clashes.length > 0) {
          const confirmed = await new Promise<boolean>((resolve) =>
            setPendingDropConfirm({ targetPath: target, clashes, resolve }),
          );
          setPendingDropConfirm(null);
          if (!confirmed) return;
        }

        uploaded = true;
        const total = plan.files.length;
        setUploadState({ phase: "uploading", done: 0, total, cancelling: false });
        for (const dir of plan.directories) {
          if (cancelUploadRef.current) break;
          failedPath = dir;
          try {
            await createDirectoryInVolume(serverUuid, { path: dir });
          } catch (e) {
            if (!(axios.isAxiosError(e) && e.response?.status === 409)) throw e;
          }
        }
        let done = 0;
        // Cancelling stops between files: aborting a request mid-write would leave a
        // truncated file on the server.
        for (const { path, file } of plan.files) {
          if (cancelUploadRef.current) break;
          failedPath = path;
          await uploadFileToVolume(serverUuid, file, { path }, FILE_TRANSFER_OPTIONS);
          done += 1;
          setUploadState((prev) => (prev?.phase === "uploading" ? { ...prev, done } : prev));
        }
        failedPath = null;
        if (cancelUploadRef.current) {
          notificationModal.info({ message: t("dropUploadCancelled", { done, total }) });
        }
      } catch (e) {
        notificationModal.error({
          message: failedPath ? t("dropUploadError", { path: failedPath }) : t("fileUploadError"),
          cause: e,
        });
      } finally {
        uploadingRef.current = false;
        setUploadState(null);
        if (uploaded) {
          // Refresh whatever was touched, even after a partial failure. Deeper folders that
          // were cached earlier are dropped so they refetch when opened. ensurePathFetched also
          // swaps the visible listing, so the directory on screen must be fetched last.
          invalidatePathsUnder(targetPath);
          const target = normalizePath(targetPath);
          if (target !== normalizePath(currentPathRef.current)) {
            await ensurePathFetched(target, fetchDepth, true).catch(() => undefined);
          }
          await ensurePathFetched(currentPathRef.current, fetchDepth, true).catch(() => undefined);
        }
      }
    },
    [serverUuid, fetchDepth, ensurePathFetched, invalidatePathsUnder, t],
  );

  /** Stops a running drop upload after the file currently being sent. */
  const cancelUpload = useCallback(() => {
    cancelUploadRef.current = true;
    setUploadState((prev) => (prev?.phase === "uploading" ? { ...prev, cancelling: true } : prev));
  }, []);

  const onArchivePicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    setPendingArchives(picked);
    e.target.value = "";
  };

  const extractArchive = async (subdirectory: string, clear: boolean) => {
    if (!pendingArchives?.length) return;
    const base = currentPath === "/" ? "" : currentPath;
    const targetPath = subdirectory ? `${base}/${subdirectory}` : base;
    const sorted = [...pendingArchives].sort((a, b) => a.name.localeCompare(b.name));
    for (let i = 0; i < sorted.length; i++) {
      await uploadArchiveToVolume(
        serverUuid,
        sorted[i] as unknown as Blob,
        {
          path: targetPath,
          clear: i === 0 && clear,
        },
        FILE_TRANSFER_OPTIONS,
      );
    }
    await ensurePathFetched(currentPath, fetchDepth, true);
  };

  const openDownloadModal = useCallback((path: string) => setDownloadModalPath(path), []);

  const startZipDownload = async (path: string, totalBytes: number) => {
    setDownloading((prev) => [...prev, path]);
    setDownloadProgress(null);
    try {
      await zipAndDownload({
        serverUuid,
        startPath: path,
        onProgress: (done) => setDownloadProgress({ done, total: totalBytes }),
      });
    } catch (e) {
      console.error(e);
      notificationModal.error({ message: t("downloadZipFailure"), cause: e });
    } finally {
      setDownloading((prev) => prev.filter((p) => p !== path));
      setDownloadProgress(null);
    }
  };

  const startZipChunkDownload = async (path: string, chunkSizeMb: number) => {
    setDownloading((prev) => [...prev, path]);
    setDownloadProgress(null);
    try {
      await zipAndDownloadChunked({
        serverUuid,
        startPath: path,
        chunkSizeMb,
        onProgress: (done, total) => setDownloadProgress({ done, total }),
      });
    } catch (e) {
      console.error(e);
      notificationModal.error({ message: t("downloadZipFailure"), cause: e });
    } finally {
      setDownloading((prev) => prev.filter((p) => p !== path));
      setDownloadProgress(null);
    }
  };

  const openEditModal = useCallback(
    async (obj: FileSystemObjectDto) => {
      const path = joinRemotePath(currentPath, obj.name);
      const apiPath = path === "/" ? "" : path;
      setEditingFile({ obj, content: null, fetching: true });
      try {
        const blob = (await readFileFromVolume(
          serverUuid,
          { path: apiPath },
          FILE_TRANSFER_OPTIONS,
        )) as unknown as Blob;
        const text = await blob.text();
        setEditingFile({ obj, content: text, fetching: false });
      } catch (e) {
        notificationModal.error({ message: t("editFileFetchError"), cause: e });
        setEditingFile(null);
      }
    },
    [currentPath, serverUuid, t],
  );

  const saveEditedFile = async (content: string) => {
    if (!editingFile?.obj) return;
    const path = joinRemotePath(currentPath, editingFile.obj.name);
    const apiPath = path === "/" ? "" : path;
    await uploadFileToVolume(
      serverUuid,
      new Blob([content], { type: "text/plain" }),
      { path: apiPath },
      FILE_TRANSFER_OPTIONS,
    );
    await ensurePathFetched(currentPath, fetchDepth, true);
  };

  const savePermissions = async (obj: FileSystemObjectDto, mode: number, uid: number | null) => {
    const path = joinRemotePath(currentPath, obj.name);
    const apiPath = path === "/" ? "" : path;
    await setPermissions(serverUuid, {
      path: apiPath,
      mode,
      ...(uid !== null ? { uid } : {}),
    });
    await ensurePathFetched(currentPath, fetchDepth, true);
  };

  const onMkdir = useCallback(
    async ({ parentPath, name }: { parentPath: string; name: string }) => {
      const apiParent = parentPath === "/" ? "" : parentPath;
      const newPath = `${apiParent}/${name}`;

      await mkdirMutation.mutateAsync({
        uuid: serverUuid,
        params: { path: newPath },
      });

      await ensurePathFetched(parentPath, fetchDepth, true);
    },
    [serverUuid, fetchDepth, ensurePathFetched, mkdirMutation],
  );

  const onRename = useCallback(
    async ({
      parentPath,
      oldName,
      newName,
    }: {
      parentPath: string;
      oldName: string;
      newName: string;
    }) => {
      const apiParent = parentPath === "/" ? "" : parentPath;

      await renameMutation.mutateAsync({
        uuid: serverUuid,
        params: {
          oldPath: `${apiParent}/${oldName}`,
          newPath: `${apiParent}/${newName}`,
        },
      });

      if (selectedFilePath === joinRemotePath(parentPath, oldName)) {
        const newFull = joinRemotePath(parentPath, newName);
        setSelectedFilePath(newFull);
        setSelectedFileName(newName);
      }

      await ensurePathFetched(parentPath, fetchDepth, true);
    },
    [
      serverUuid,
      fetchDepth,
      ensurePathFetched,
      renameMutation,
      selectedFilePath,
      setSelectedFilePath,
      setSelectedFileName,
    ],
  );

  const onDelete = useCallback(
    async ({ parentPath, name }: { parentPath: string; name: string }) => {
      const apiParent = parentPath === "/" ? "" : parentPath;

      await deleteMutation.mutateAsync({
        uuid: serverUuid,
        params: { path: `${apiParent}/${name}` },
      });

      if (selectedFilePath === joinRemotePath(parentPath, name)) {
        closePreview();
      }

      await ensurePathFetched(parentPath, fetchDepth, true);
    },
    [serverUuid, fetchDepth, ensurePathFetched, deleteMutation, selectedFilePath, closePreview],
  );

  const onDownload = useCallback(
    async (obj: FileSystemObjectDto) => {
      const fullPath = joinRemotePath(currentPath, obj.name);

      if (obj.type === "DIRECTORY") {
        openDownloadModal(fullPath);
        return;
      }
      setDownloading((prev) => [...prev, fullPath]);
      try {
        await downloadSingleFile({
          serverUuid,
          parentPath: currentPath,
          name: obj.name,
        });
      } catch (e) {
        notificationModal.error({ message: t("errorWhileDownload"), cause: e });
      } finally {
        setDownloading((prev) => prev.filter((p) => p !== fullPath));
      }
    },
    [serverUuid, currentPath, openDownloadModal, t],
  );

  return {
    fileInputRef,
    archiveInputRef,
    pendingArchives,
    setPendingArchives,
    onFilePicked,
    onArchivePicked,
    uploadDropped,
    uploadState,
    cancelUpload,
    pendingDropConfirm,
    extractArchive,
    downloadModalPath,
    setDownloadModalPath,
    downloading,
    downloadProgress,
    openDownloadModal,
    startZipDownload,
    startZipChunkDownload,
    onDownload,
    editingFile,
    setEditingFile,
    openEditModal,
    saveEditedFile,
    permissionsObj,
    setPermissionsObj,
    savePermissions,
    onMkdir,
    onRename,
    onDelete,
  };
};
