export const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"]);
export const VIDEO_EXTS = new Set(["mp4", "webm", "ogg", "mov", "m4v"]);

export function getExt(name: string) {
  const i = name.lastIndexOf(".");
  if (i === -1) return "";
  return name.slice(i + 1).toLowerCase();
}
