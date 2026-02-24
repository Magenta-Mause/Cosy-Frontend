import { getAuthToken } from "@/api/axiosInstance";
import { baseNameFromPath } from "./fileSystemUtils";

export async function zipAndDownload(opts: {
  serverUuid: string;
  startPath: string;
  onProgress?: (done: number, total: number) => void;
}) {
  const { serverUuid, startPath } = opts;

  const token = getAuthToken();
  const params = new URLSearchParams({ path: startPath });

  const response = await fetch(
    `/api/game-server/${serverUuid}/file-system/download-as-zip?${params}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const blob = await response.blob();

  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = `${baseNameFromPath(startPath)}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
