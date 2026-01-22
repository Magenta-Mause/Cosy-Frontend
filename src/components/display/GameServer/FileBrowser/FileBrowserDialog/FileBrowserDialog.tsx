import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Download, Search, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { downloadSingleFile, joinDir, joinRemotePath, normalizePath } from "@/lib/fileSystemUtils";
import { cn } from "@/lib/utils";
import { zipAndDownload } from "@/lib/zipDownload";
import { FileBrowserList } from "../FileBrowserList/FileBrowserList";
import { FilePreview } from "../FilePreview/FilePreview";

type FileBrowserDialogProps = {
  width?: number;
  height?: number;
  padding?: number;
  path?: string;
  serverUuid: string;
  volumes: VolumeMountConfiguration[];
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

  const [search, setSearch] = useState("");

  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  const renameMutation = useRenameInVolume();
  const mkdirMutation = useCreateDirectoryInVolume();
  const deleteMutation = useDeleteInVolume();

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
    void ensurePathFetched(currentPath, fetchDepth);
  }, [currentPath, fetchDepth, ensurePathFetched]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const uploadSelectedFile = async (file: File) => {
    const path = joinRemotePath(currentPath, file.name);
    const apiPath = path === "/" ? "" : path;

    await uploadFileToVolume(props.serverUuid, file, { path: apiPath });
    await ensurePathFetched(currentPath, fetchDepth, { force: true });
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

  const onEntryClick = async (obj: FileSystemObjectDto) => {
    if (obj.type === "DIRECTORY") {
      const nextPath = joinDir(currentPath, obj.name);
      setCurrentPath(nextPath);
      return;
    }

    const fullPath = joinRemotePath(currentPath, obj.name);
    setSelectedFilePath(fullPath);
    setSelectedFileName(obj.name);
    setSelectedObj(obj);
  };

  const onCrumbClick = (path: string) => setCurrentPath(normalizePath(path));

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
      setError("Failed to download zip");
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

  return (
    <div
      className={cn("border-border border-3 rounded-lg flex flex-col gap-2 w-400 h-200 p-4")}
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

      <FileBrowserList
        currentPath={currentPath}
        objects={filteredObjects}
        loading={loading}
        error={error}
        fetchDepth={fetchDepth}
        onEntryClick={onEntryClick}
        onCrumbClick={onCrumbClick}
        onRefresh={() => ensurePathFetched(currentPath, fetchDepth, { force: true })}
        showPreview={hasSelection}
        previewedPath={selectedFilePath}
        onClosePreview={closePreview}
        preview={
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
        }
        onMkdir={async ({ parentPath, name }) => {
          const apiParent = parentPath === "/" ? "" : parentPath;
          const newPath = `${apiParent}/${name}`;

          await mkdirMutation.mutateAsync({
            uuid: props.serverUuid,
            params: { path: newPath },
          });

          await ensurePathFetched(parentPath, fetchDepth, { force: true });
        }}
        onRename={async ({ parentPath, oldName, newName }) => {
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

          await ensurePathFetched(parentPath, fetchDepth, { force: true });
        }}
        onDelete={async ({ parentPath, name }) => {
          const apiParent = parentPath === "/" ? "" : parentPath;

          await deleteMutation.mutateAsync({
            uuid: props.serverUuid,
            params: { path: `${apiParent}/${name}` },
          });

          if (selectedFilePath === joinRemotePath(parentPath, name)) {
            closePreview();
          }

          await ensurePathFetched(parentPath, fetchDepth, { force: true });
        }}
        onDownload={async (obj) => {
          downloadSingleFile({
            serverUuid: props.serverUuid,
            parentPath: currentPath,
            name: obj.name,
          });
        }}
      />

      <div className="flex gap-4">
        <Button onClick={openFileDialog}>
          <Upload />
          Upload
        </Button>

        <Button onClick={onDownloadAll} disabled={downloadingAll || loading}>
          <Download />
          {downloadingAll
            ? downloadProgress
              ? `Downloading ${downloadProgress.done}/${downloadProgress.total}`
              : "Preparing..."
            : "Download All"}
        </Button>
      </div>

      <input ref={fileInputRef} type="file" className="hidden" onChange={onFilePicked} />
    </div>
  );
};
