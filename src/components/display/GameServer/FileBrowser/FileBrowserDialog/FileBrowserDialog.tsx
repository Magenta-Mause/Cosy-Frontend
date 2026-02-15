import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import TooltipWrapper from "@components/ui/TooltipWrapper";
import { Download, Search, Upload, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  uploadFileToVolume,
  useCreateDirectoryInVolume,
  useDeleteInVolume,
  useReadFileFromVolume,
  useRenameInVolume,
} from "@/api/generated/backend-api";
import type { FileSystemObjectDto, VolumeMountConfiguration } from "@/api/generated/model";
import { useFileBrowserCache } from "@/hooks/useFileBrowserCache/useFileBrowserCache";
import { useFileSelection } from "@/hooks/useFileSelection/useFileSelection";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { downloadSingleFile, joinDir, joinRemotePath, normalizePath } from "@/lib/fileSystemUtils";
import { cn } from "@/lib/utils";
import { zipAndDownload } from "@/lib/zipDownload";
import { type FileBrowserContextValue, FileBrowserProvider } from "../FileBrowserContext";
import { FileBrowserList } from "../FileBrowserList/FileBrowserList";
import { FilePreview } from "../FilePreview/FilePreview";

type FileBrowserDialogProps = {
  width?: number;
  height?: number;
  padding?: number;
  path?: string;
  serverUuid: string;
  volumes: VolumeMountConfiguration[];
  canReadFiles?: boolean;
  canChangeFiles?: boolean;
};

export const FileBrowserDialog = (props: FileBrowserDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    currentPath,
    setCurrentPath,
    fetchDepth,
    objects,
    loading,
    error,
    setError,
    ensurePathFetched,
  } = useFileBrowserCache({
    serverUuid: props.serverUuid,
    initialPath: props.path ?? "/",
    initialDepth: 1,
    volumes: props.volumes,
  });

  const {
    selectedFilePath,
    selectedFileName,
    closePreview,
    hasSelection,
    setSelectedFileName,
    setSelectedFilePath,
    setSelectedObj,
  } = useFileSelection();

  const canReadFiles = props.canReadFiles ?? true;
  const canChangeFiles = props.canChangeFiles ?? true;

  const [search, setSearch] = useState("");

  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  const renameMutation = useRenameInVolume();
  const mkdirMutation = useCreateDirectoryInVolume();
  const deleteMutation = useDeleteInVolume();

  const isSynthetic = useMemo(() => {
    return !props.volumes?.some(
      (v) => v.container_path && currentPath.startsWith(v.container_path),
    );
  }, [props.volumes, currentPath]);

  const { t } = useTranslationPrefix("components.fileBrowser.fileBrowserDialog");

  // biome-ignore lint/correctness/useExhaustiveDependencies: remove search when changing directories
  useEffect(() => {
    setSearch("");
  }, [currentPath]);

  useEffect(() => {
    closePreview();
  }, [closePreview]);

  const filteredObjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return objects;
    return objects.filter((o) => (o.name ?? "").toLowerCase().includes(q));
  }, [objects, search]);

  useEffect(() => {
    ensurePathFetched(currentPath, fetchDepth);
  }, [currentPath, fetchDepth, ensurePathFetched]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const uploadSelectedFile = async (file: File) => {
    const path = joinRemotePath(currentPath, file.name);
    const apiPath = path === "/" ? "" : path;

    await uploadFileToVolume(props.serverUuid, file, { path: apiPath });
    await ensurePathFetched(currentPath, fetchDepth, true);
  };

  const onFilePicked: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadSelectedFile(file);
    } catch (err) {
      console.error(err);
      setError("Failed to upload file");
    } finally {
      e.target.value = "";
    }
  };

  const onEntryClick = useCallback(
    async (obj: FileSystemObjectDto) => {
      if (obj.type === "DIRECTORY") {
        const nextPath = joinDir(currentPath, obj.name);
        setCurrentPath(nextPath);
        return;
      }

      const fullPath = joinRemotePath(currentPath, obj.name);
      setSelectedFilePath(fullPath);
      setSelectedFileName(obj.name);
      setSelectedObj(obj);
    },
    [currentPath, setCurrentPath, setSelectedFilePath, setSelectedFileName, setSelectedObj],
  );

  const onCrumbClick = useCallback(
    (path: string) => setCurrentPath(normalizePath(path)),
    [setCurrentPath],
  );

  const onDownloadAll = async () => {
    setDownloadingAll(true);
    setDownloadProgress(null);

    try {
      await zipAndDownload({
        serverUuid: props.serverUuid,
        startPath: currentPath,
        onProgress: (done, total) => setDownloadProgress({ done, total }),
      });
    } catch (e) {
      console.error(e);
      setError(t("downloadZipFailure"));
    } finally {
      setDownloadingAll(false);
      setDownloadProgress(null);
    }
  };

  const readParams = selectedFilePath
    ? { path: selectedFilePath === "/" ? "" : selectedFilePath }
    : null;

  const fileQuery = useReadFileFromVolume(props.serverUuid, readParams ?? { path: "" }, {
    query: {
      enabled: !!readParams,
      staleTime: 30_000,
    },
  });

  const previewNode = useMemo(() => {
    return (
      <div className="min-w-0 h-full flex flex-col overflow-hidden">
        <div className="px-2 py-2 border-b border-b-border flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{selectedFileName || "Preview"}</div>
            {selectedFilePath ? (
              <div className="text-xs text-muted-foreground truncate" title={selectedFilePath}>
                {selectedFilePath}
              </div>
            ) : null}
          </div>

          <Button
            size="icon"
            onClick={closePreview}
            aria-label="Close preview"
            title="Close preview"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <FilePreview
          fileName={selectedFileName}
          blob={(fileQuery.data as Blob) ?? null}
          loading={fileQuery.isLoading}
          error={fileQuery.error}
        />
      </div>
    );
  }, [
    selectedFileName,
    selectedFilePath,
    closePreview,
    fileQuery.data,
    fileQuery.isLoading,
    fileQuery.error,
  ]);

  const ctxValue: FileBrowserContextValue = useMemo(
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

      onEntryClick: (obj) => {
        onEntryClick(obj);
      },
      onCrumbClick,
      onRefresh: () => ensurePathFetched(currentPath, fetchDepth, true),

      onMkdir: async ({ parentPath, name }) => {
        const apiParent = parentPath === "/" ? "" : parentPath;
        const newPath = `${apiParent}/${name}`;

        await mkdirMutation.mutateAsync({
          uuid: props.serverUuid,
          params: { path: newPath },
        });

        await ensurePathFetched(parentPath, fetchDepth, true);
      },

      onRename: async ({ parentPath, oldName, newName }) => {
        const apiParent = parentPath === "/" ? "" : parentPath;

        await renameMutation.mutateAsync({
          uuid: props.serverUuid,
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

      onDelete: async ({ parentPath, name }) => {
        const apiParent = parentPath === "/" ? "" : parentPath;

        await deleteMutation.mutateAsync({
          uuid: props.serverUuid,
          params: { path: `${apiParent}/${name}` },
        });

        if (selectedFilePath === joinRemotePath(parentPath, name)) {
          closePreview();
        }

        await ensurePathFetched(parentPath, fetchDepth, true);
      },

      onDownload: async (obj) => {
        downloadSingleFile({
          serverUuid: props.serverUuid,
          parentPath: currentPath,
          name: obj.name,
        });
      },
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
      mkdirMutation,
      renameMutation,
      deleteMutation,
      props.serverUuid,
      setSelectedFilePath,
      setSelectedFileName,
      onCrumbClick,
      onEntryClick,
      isSynthetic,
      canChangeFiles,
    ],
  );

  return (
    <div
      className={cn("border-border border-3 rounded-lg flex flex-col gap-2 h-full p-4 relative")}
      style={{
        width: props.width !== undefined ? `${props.width}px` : undefined,
        height: props.height !== undefined ? `${props.height}px` : undefined,
        padding: props.padding !== undefined ? `${props.padding}px` : undefined,
      }}
    >
      <Input
        startDecorator={<Search />}
        endDecorator={
          <X
            className="pointer-events-auto"
            onClick={() => {
              setSearch("");
            }}
          />
        }
        type="text"
        placeholder="Search"
        className="h-12 pl-10 border-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <FileBrowserProvider value={ctxValue}>
        <FileBrowserList />
      </FileBrowserProvider>

      <div className="flex gap-4">
        <TooltipWrapper
          tooltip={
            isSynthetic
              ? t("uploadInSyntheticDir")
              : !canChangeFiles
                ? t("uploadNoPermission")
                : null
          }
          side="top"
          align="center"
        >
          <Button onClick={openFileDialog} disabled={isSynthetic || !canChangeFiles} className="transition-all duration-300">
            <Upload />
            {t("uploadFile")}
          </Button>
        </TooltipWrapper>

        <Button
          onClick={onDownloadAll}
          data-loading={downloadingAll || loading}
          disabled={downloadingAll || loading || !canReadFiles}
        >
          <Download />
          {downloadingAll
            ? downloadProgress
              ? t("downloadingFile", { done: downloadProgress.done, total: downloadProgress.total })
              : t("preparing")
            : t("downloadAllAction")}
        </Button>

        <input ref={fileInputRef} type="file" className="hidden" onChange={onFilePicked} />
      </div>

      {!canReadFiles && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-muted-foreground text-center">
            <div className="text-lg font-semibold mb-2">{t("noFilesPermission")}</div>
            <div className="text-sm">{t("noFilesPermissionDesc")}</div>
          </div>
        </div>
      )}
    </div>
  );
};
