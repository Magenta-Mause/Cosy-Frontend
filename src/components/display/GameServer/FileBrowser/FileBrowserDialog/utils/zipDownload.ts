import JSZip from "jszip";
import { getFileSystemForVolume, readFileFromVolume } from "@/api/generated/backend-api";
import {
  baseNameFromPath,
  joinDir,
  joinRemotePath,
  normalizePath,
  stripLeadingSlash,
} from "./paths";

async function listAllFilesRecursive(opts: {
  serverUuid: string;
  volumeUuid: string;
  startPath: string; // normalized, like "/foo"
}): Promise<Array<{ fullPath: string; relativePath: string }>> {
  const { serverUuid, volumeUuid, startPath } = opts;

  const files: Array<{ fullPath: string; relativePath: string }> = [];

  const walk = async (dir: string) => {
    const apiPath = dir === "/" ? "" : dir;

    const dto = await getFileSystemForVolume(serverUuid, volumeUuid, {
      path: apiPath,
      fetch_depth: 1,
    });

    const objs = dto.objects ?? [];
    for (const o of objs) {
      const name = o.name ?? "";
      if (!name) continue;

      if (o.type === "DIRECTORY") {
        const nextDir = joinDir(dir, name);
        await walk(nextDir);
      } else {
        const fullPath = joinRemotePath(dir, name);

        const normFull = normalizePath(fullPath);
        const normStart = normalizePath(startPath);

        const rel = normFull.startsWith(normStart) ? normFull.slice(normStart.length) : fullPath;
        const relClean = stripLeadingSlash(rel);

        files.push({ fullPath, relativePath: relClean || name });
      }
    }
  };

  await walk(startPath);
  return files;
}

export async function zipAndDownload(opts: {
  serverUuid: string;
  volumeUuid: string;
  startPath: string;
  onProgress?: (done: number, total: number) => void;
}) {
  const { serverUuid, volumeUuid, startPath, onProgress } = opts;

  const entries = await listAllFilesRecursive({ serverUuid, volumeUuid, startPath });

  const zip = new JSZip();
  let done = 0;
  const total = entries.length;

  for (const e of entries) {
    const apiFilePath = e.fullPath === "/" ? "" : e.fullPath;
    const blob = (await readFileFromVolume(serverUuid, volumeUuid, { path: apiFilePath })) as Blob;

    zip.file(e.relativePath, blob);

    done += 1;
    onProgress?.(done, total);
  }

  const outBlob = await zip.generateAsync({ type: "blob" });

  const a = document.createElement("a");
  const url = URL.createObjectURL(outBlob);
  a.href = url;

  a.download = `${baseNameFromPath(startPath)}.zip`;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
