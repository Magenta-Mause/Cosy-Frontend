import { createContext, useContext, useMemo } from "react";
import type { FileSystemObjectDto, VolumeMountConfiguration } from "@/api/generated/model";
import type { PreviewMode } from "@/lib/fileSystemUtils";
import type { DropUploadState } from "./FileBrowserDialog/hooks/useFileBrowserActions";

export type FileBrowserActions = {
  onEntryClick?: (obj: FileSystemObjectDto) => void;
  onPreviewAs?: (obj: FileSystemObjectDto, mode: PreviewMode) => void;
  onCrumbClick?: (path: string) => void;
  onRefresh?: () => void;

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
  onEditFile?: (obj: FileSystemObjectDto) => void;
  onChangePermissions?: (obj: FileSystemObjectDto) => void;

  /** Uploads files/folders dragged in from the OS into `targetPath`. */
  onDropFiles?: (targetPath: string, dataTransfer: DataTransfer) => void;
  /** Whether a drop may land in `path` (writable, inside a volume). */
  canDropAt?: (path: string) => boolean;
  /** Stops a running drop upload after the current file. */
  onCancelUpload?: () => void;
};

export type FileBrowserState = {
  currentPath: string;
  objects: FileSystemObjectDto[];

  loading?: boolean;
  error?: string | null;

  fetchDepth: number;

  preview?: React.ReactNode;
  showPreview?: boolean;
  previewedPath?: string | null;

  readOnly?: boolean;
  isSynthetic: boolean;
  navigating?: boolean;

  downloadingFiles: string[];
  downloadProgress?: { done: number; total: number } | null;
  uploadState?: DropUploadState | null;

  volumes?: VolumeMountConfiguration[];
};

export type FileBrowserContextValue = FileBrowserState & FileBrowserActions;

const FileBrowserContext = createContext<FileBrowserContextValue | null>(null);

export function FileBrowserProvider(props: {
  value: FileBrowserContextValue;
  children: React.ReactNode;
}) {
  const memoed = useMemo(() => props.value, [props.value]);
  return <FileBrowserContext.Provider value={memoed}>{props.children}</FileBrowserContext.Provider>;
}

export function useFileBrowser() {
  const ctx = useContext(FileBrowserContext);
  if (!ctx) {
    throw new Error("useFileBrowser must be used within a FileBrowserProvider");
  }
  return ctx;
}
