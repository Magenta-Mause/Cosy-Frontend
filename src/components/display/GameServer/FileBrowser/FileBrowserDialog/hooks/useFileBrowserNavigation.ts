import type { Dispatch, SetStateAction } from "react";
import { useCallback, useState } from "react";
import type { FileSystemObjectDto } from "@/api/generated/model";
import { joinDir, joinRemotePath, normalizePath, type PreviewMode } from "@/lib/fileSystemUtils";

interface UseFileBrowserNavigationArgs {
  currentPath: string;
  fetchDepth: number;
  setCurrentPath: (path: string) => void;
  prefetchPath: (path: string, depth: number) => Promise<unknown>;
  setSelectedFilePath: Dispatch<SetStateAction<string | null>>;
  setSelectedFileName: Dispatch<SetStateAction<string>>;
  setSelectedObj: Dispatch<SetStateAction<FileSystemObjectDto | null>>;
  setPreviewMode: Dispatch<SetStateAction<PreviewMode | null>>;
}

/** Directory navigation + file selection on entry/breadcrumb clicks. */
export const useFileBrowserNavigation = ({
  currentPath,
  fetchDepth,
  setCurrentPath,
  prefetchPath,
  setSelectedFilePath,
  setSelectedFileName,
  setSelectedObj,
  setPreviewMode,
}: UseFileBrowserNavigationArgs) => {
  const [navigating, setNavigating] = useState(false);

  const onEntryClick = useCallback(
    async (obj: FileSystemObjectDto) => {
      if (obj.type === "DIRECTORY") {
        const nextPath = joinDir(currentPath, obj.name);
        setNavigating(true);
        try {
          await prefetchPath(nextPath, fetchDepth);
        } catch {
          // prefetch failed — navigate anyway, ensurePathFetched will retry
        }
        setCurrentPath(nextPath);
        setNavigating(false);
        return;
      }

      const fullPath = joinRemotePath(currentPath, obj.name);
      setSelectedFilePath(fullPath);
      setSelectedFileName(obj.name);
      setSelectedObj(obj);
      setPreviewMode(null);
    },
    [
      currentPath,
      setCurrentPath,
      prefetchPath,
      fetchDepth,
      setSelectedFilePath,
      setSelectedFileName,
      setSelectedObj,
      setPreviewMode,
    ],
  );

  /** "Open as" from a file's menu: select it and display it as the chosen type. */
  const onPreviewAs = useCallback(
    (obj: FileSystemObjectDto, mode: PreviewMode) => {
      setSelectedFilePath(joinRemotePath(currentPath, obj.name));
      setSelectedFileName(obj.name);
      setSelectedObj(obj);
      setPreviewMode(mode);
    },
    [currentPath, setSelectedFilePath, setSelectedFileName, setSelectedObj, setPreviewMode],
  );

  const onCrumbClick = useCallback(
    (path: string) => setCurrentPath(normalizePath(path)),
    [setCurrentPath],
  );

  return { navigating, onEntryClick, onPreviewAs, onCrumbClick };
};
