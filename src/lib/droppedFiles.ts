import type { VolumeMountConfiguration } from "@/api/generated/model";
import { normalizePath } from "@/lib/fileSystemUtils";

/** A file the user dropped, with its path relative to the drop (e.g. "world/level.dat"). */
export type DroppedFile = { relativePath: string; file: File };

/** Everything a drop carried: files plus every directory, so empty folders survive too. */
export type DroppedItems = { files: DroppedFile[]; directories: string[] };

/** Absolute remote paths to create and write, in the order they must happen. */
export type DropUploadPlan = {
  directories: string[];
  files: { path: string; file: File }[];
};

/** True while the drag carries files from the OS (not text, links or in-page elements). */
export function isFileDrag(dataTransfer: DataTransfer | null): boolean {
  return Boolean(dataTransfer && Array.from(dataTransfer.types).includes("Files"));
}

/** True when `path` lies inside one of the server's mounted volumes, so writes can land there. */
export function isPathInVolumes(path: string, volumes: VolumeMountConfiguration[] | undefined) {
  const p = normalizePath(path);
  return (volumes ?? []).some((v) => {
    if (!v.container_path) return false;
    const root = normalizePath(v.container_path);
    return p === root || p.startsWith(root === "/" ? "/" : `${root}/`);
  });
}

function readAllEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  // readEntries returns results in batches (100 in Chromium); keep reading until it comes back empty.
  return new Promise((resolve, reject) => {
    const all: FileSystemEntry[] = [];
    const next = () =>
      reader.readEntries((batch) => {
        if (batch.length === 0) {
          resolve(all);
          return;
        }
        all.push(...batch);
        next();
      }, reject);
    next();
  });
}

function entryFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

async function walkEntry(entry: FileSystemEntry, prefix: string, out: DroppedItems) {
  const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
  if (entry.isFile) {
    out.files.push({ relativePath, file: await entryFile(entry as FileSystemFileEntry) });
    return;
  }
  if (entry.isDirectory) {
    out.directories.push(relativePath);
    const children = await readAllEntries((entry as FileSystemDirectoryEntry).createReader());
    for (const child of children) {
      await walkEntry(child, relativePath, out);
    }
  }
}

/**
 * Reads a drop's files and folders. Must be called synchronously inside the drop handler:
 * the DataTransfer items are emptied as soon as the event returns, so the entries are taken
 * up front and only the folder traversal runs asynchronously.
 */
export function collectDroppedItems(dataTransfer: DataTransfer): Promise<DroppedItems> {
  const entries: FileSystemEntry[] = [];
  const looseFiles: File[] = [];

  for (const item of Array.from(dataTransfer.items ?? [])) {
    if (item.kind !== "file") continue;
    const entry = item.webkitGetAsEntry?.();
    if (entry) {
      entries.push(entry);
    } else {
      const file = item.getAsFile();
      if (file) looseFiles.push(file);
    }
  }
  // Browsers without DataTransferItem support still expose plain files.
  if (entries.length === 0 && looseFiles.length === 0) {
    looseFiles.push(...Array.from(dataTransfer.files ?? []));
  }

  return (async () => {
    const out: DroppedItems = { files: [], directories: [] };
    for (const file of looseFiles) out.files.push({ relativePath: file.name, file });
    for (const entry of entries) await walkEntry(entry, "", out);
    return out;
  })();
}

/**
 * Turns a drop into absolute remote paths under `targetPath`. Directories are ordered
 * parents first, because the backend's mkdir is not recursive and an upload needs its
 * parent directory to exist.
 */
export function planDropUpload(targetPath: string, items: DroppedItems): DropUploadPlan {
  const base = normalizePath(targetPath);
  const abs = (rel: string) => (base === "/" ? `/${rel}` : `${base}/${rel}`);

  const dirs = new Set<string>();
  for (const d of items.directories) dirs.add(d);
  for (const f of items.files) {
    const parts = f.relativePath.split("/");
    for (let i = 1; i < parts.length; i++) dirs.add(parts.slice(0, i).join("/"));
  }

  const depth = (p: string) => p.split("/").length;
  return {
    directories: [...dirs].sort((a, b) => depth(a) - depth(b) || a.localeCompare(b)).map(abs),
    files: items.files.map((f) => ({ path: abs(f.relativePath), file: f.file })),
  };
}
