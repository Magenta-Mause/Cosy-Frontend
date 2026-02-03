import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getFileSystemForVolume } from "@/api/generated/backend-api";
import type { FileSystemObjectDto, VolumeMountConfiguration } from "@/api/generated/model";
import { normalizePath } from "@/lib/fileSystemUtils";

type CacheEntry = {
  fetchDepth: number;
  objects: FileSystemObjectDto[];
};

type TrieNode = {
  children: Map<string, TrieNode>;
  isMountRoot: boolean;
};

function newNode(): TrieNode {
  return { children: new Map(), isMountRoot: false };
}

function splitSegments(absPath: string): string[] {
  const norm = normalizePath(absPath);
  if (norm === "/") return [];
  return norm.slice(1).split("/").filter(Boolean);
}

function buildMountTrie(volumes: VolumeMountConfiguration[]): TrieNode {
  const root = newNode();

  for (const v of volumes ?? []) {
    const cp = normalizePath(v.container_path ?? "");
    if (!cp || cp === "/") continue;

    const segs = splitSegments(cp);
    let cur = root;

    for (const s of segs) {
      let nxt = cur.children.get(s);
      if (!nxt) {
        nxt = newNode();
        cur.children.set(s, nxt);
      }
      cur = nxt;
    }

    cur.isMountRoot = true;
  }

  return root;
}

function getNodeForPath(trie: TrieNode, absPath: string): TrieNode | null {
  const segs = splitSegments(absPath);
  let cur: TrieNode = trie;

  for (const s of segs) {
    const nxt = cur.children.get(s);
    if (!nxt) return null;
    cur = nxt;
  }

  return cur;
}

function toSyntheticDirEntry(name: string): FileSystemObjectDto {
  return {
    name,
    type: "DIRECTORY",
    fetch_depth: 0,
    children: [],
  };
}

function buildSyntheticListing(trie: TrieNode, absPath: string): FileSystemObjectDto[] {
  const node = getNodeForPath(trie, absPath);
  if (!node) return [];

  const names = Array.from(node.children.keys()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );

  return names.map(toSyntheticDirEntry);
}

export function useFileBrowserCache(opts: {
  serverUuid: string;
  initialPath: string;
  initialDepth?: number;
  volumes: VolumeMountConfiguration[];
}) {
  const [currentPath, setCurrentPath] = useState<string>(normalizePath(opts.initialPath));
  const [fetchDepth] = useState<number>(opts.initialDepth ?? 1);

  const [cache, setCache] = useState<Map<string, CacheEntry>>(() => new Map());
  const [objects, setObjects] = useState<FileSystemObjectDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountTrie = useMemo(() => buildMountTrie(opts.volumes), [opts.volumes]);
  const cacheRef = useRef(cache);

  const navigate = useNavigate();

  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  const ensurePathFetched = useCallback(
    async (path: string, depth: number, force?: boolean) => {
      const norm = normalizePath(path);

      const existing = cacheRef.current.get(norm);
      if (!force && existing && existing.fetchDepth >= depth) {
        setObjects(existing.objects);
        return;
      }

      const node = getNodeForPath(mountTrie, norm);
      if (node && !node.isMountRoot) {
        const synthetic = buildSyntheticListing(mountTrie, norm);

        setError(null);
        setLoading(false);
        setObjects(synthetic);

        setCache((prev) => {
          const next = new Map(prev);
          next.set(norm, { fetchDepth: 0, objects: synthetic });
          return next;
        });

        return;
      }

      setLoading(true);
      setError(null);

      try {
        const apiPath = norm === "/" ? "" : norm;

        const dto = await getFileSystemForVolume(opts.serverUuid, {
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
    [mountTrie, opts.serverUuid],
  );

  useEffect(() => {
    const norm = normalizePath(currentPath);
    const node = getNodeForPath(mountTrie, norm);
    if (node && !node.isMountRoot) {
      const synthetic = buildSyntheticListing(mountTrie, norm);
      setObjects(synthetic);
      setCache((prev) => {
        const next = new Map(prev);
        next.set(norm, { fetchDepth: 0, objects: synthetic });
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountTrie, currentPath]);

  return {
    currentPath,
    setCurrentPath: (p: string) => {
      const path = normalizePath(p);
      navigate({
        to: `/server/$serverId/files${path}`,
        params: {
          serverId: opts.serverUuid,
        },
        replace: true,
      });
      setCurrentPath(path);
    },
    fetchDepth,
    objects,
    setObjects,
    loading,
    error,
    setError,
    ensurePathFetched,
  };
}
