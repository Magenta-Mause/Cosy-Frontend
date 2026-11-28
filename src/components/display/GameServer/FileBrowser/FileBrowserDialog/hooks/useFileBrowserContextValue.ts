import type { ReactNode } from "react";
import { useMemo } from "react";
import type { FileSystemObjectDto, VolumeMountConfiguration } from "@/api/generated/model";
import { isPathInVolumes } from "@/lib/droppedFiles";
import type { PreviewMode } from "@/lib/fileSystemUtils";
import type { FileBrowserContextValue } from "../../FileBrowserContext";
import type { useFileBrowserActions } from "./useFileBrowserActions";

interface UseFileBrowserContextValueArgs {
  currentPath: string;
  filteredObjects: FileSystemObjectDto[];
  loading?: boolean;
  error?: string | null;
  fetchDepth: number;
  previewNode: ReactNode;
  hasSelection: boolean;
  selectedFilePath?: string | null;
  closePreview: () => void;
  isSynthetic: boolean;
  canChangeFiles: boolean;
  navigating: boolean;
  volumes?: VolumeMountConfiguration[];
  ensurePathFetched: (path: string, depth: number, force?: boolean) => Promise<void>;
  onEntryClick: (obj: FileSystemObjectDto) => void;
  onPreviewAs: (obj: FileSystemObjectDto, mode: PreviewMode) => void;
  onCrumbClick: (path: string) => void;
  actions: ReturnType<typeof useFileBrowserActions>;
}

/**
 * Builds the memoized FileBrowser context value from the dialog's view state and the
 * action handlers, keeping the dependency array narrow so the provider only re-memos when
 * something it actually renders changes.
 */
export const useFileBrowserContextValue = ({
  currentPath,
  filteredObjects,
  loading,
  error,
  fetchDepth,
  previewNode,
  hasSelection,
  selectedFilePath,
  closePreview,
  isSynthetic,
  canChangeFiles,
  navigating,
  volumes,
  ensurePathFetched,
  onEntryClick,
  onPreviewAs,
  onCrumbClick,
  actions,
}: UseFileBrowserContextValueArgs): FileBrowserContextValue => {
  const {
    downloading,
    downloadProgress,
    onMkdir,
    onRename,
    onDelete,
    onDownload,
    openEditModal,
    setPermissionsObj,
    uploadDropped,
    uploadState,
    cancelUpload,
  } = actions;

  return useMemo(
    () => ({
      currentPath,
      objects: filteredObjects,
      loading,
      error,
      fetchDepth,

      preview: previewNode,
      showPreview: hasSelection,
      previewedPath: selectedFilePath,
      onClosePreview: closePreview,
      isSynthetic,
      readOnly: !canChangeFiles,
      navigating,
      downloadingFiles: downloading,
      downloadProgress,
      uploadState,
      volumes,

      onEntryClick: (obj) => {
        onEntryClick(obj);
      },
      onPreviewAs,
      onCrumbClick,
      onRefresh: () => ensurePathFetched(currentPath, fetchDepth, true),

      onMkdir,
      onRename,
      onDelete,
      onDownload,

      onEditFile: (obj) => openEditModal(obj),
      onChangePermissions: (obj) => setPermissionsObj(obj),

      onDropFiles: (targetPath, dataTransfer) => {
        void uploadDropped(targetPath, dataTransfer);
      },
      // A running upload does not block the drop itself: the drop must still fire so
      // uploadDropped can explain in an error modal why nothing was uploaded.
      canDropAt: (path) => canChangeFiles && isPathInVolumes(path, volumes),
      onCancelUpload: cancelUpload,
    }),
    [
      currentPath,
      filteredObjects,
      loading,
      error,
      fetchDepth,
      previewNode,
      hasSelection,
      selectedFilePath,
      closePreview,
      ensurePathFetched,
      onMkdir,
      onRename,
      onDelete,
      onDownload,
      onCrumbClick,
      onEntryClick,
      onPreviewAs,
      isSynthetic,
      canChangeFiles,
      navigating,
      downloading,
      downloadProgress,
      openEditModal,
      setPermissionsObj,
      uploadDropped,
      uploadState,
      cancelUpload,
      volumes,
    ],
  );
};
