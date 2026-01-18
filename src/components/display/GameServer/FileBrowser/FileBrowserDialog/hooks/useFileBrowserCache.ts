import { useCallback, useState } from "react";
import { getFileSystemForVolume } from "@/api/generated/backend-api";
import type { FileSystemObjectDto } from "@/api/generated/model";
import { normalizePath } from "../utils/paths";
import type { CacheEntry } from "../utils/types";

export function useFileBrowserCache(opts: {
  serverUuid: string;
  volumeUuid: string;
  initialPath: string;
  initialDepth?: number;
}) {
  const [currentPath, setCurrentPath] = useState<string>(normalizePath(opts.initialPath));
  const [fetchDepth] = useState<number>(opts.initialDepth ?? 1);

  const [cache, setCache] = useState<Map<string, CacheEntry>>(() => new Map());
  const [objects, setObjects] = useState<FileSystemObjectDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensurePathFetched = useCallback(
    async (path: string, depth: number, opts2?: { force?: boolean }) => {
      const norm = normalizePath(path);

      const existing = cache.get(norm);
      if (!opts2?.force && existing && existing.fetchDepth >= depth) {
        setObjects(existing.objects);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const apiPath = norm === "/" ? "" : norm;

        const dto = await getFileSystemForVolume(opts.serverUuid, opts.volumeUuid, {
          path: apiPath,
          fetch_depth: depth,
        });

        const nextObjects = dto.objects ?? [];
        setObjects(nextObjects);

        setCache((prev) => {
          const next = new Map(prev);
          next.set(norm, { fetchDepth: depth, objects: nextObjects });
          return next;
        });
      } catch (e) {
        console.error(e);
        setError("Failed to load file system");
      } finally {
        setLoading(false);
      }
    },
    [cache, opts.serverUuid, opts.volumeUuid],
  );

  return {
    currentPath,
    setCurrentPath,
    fetchDepth,
    objects,
    setObjects,
    loading,
    error,
    setError,
    ensurePathFetched,
  };
}
