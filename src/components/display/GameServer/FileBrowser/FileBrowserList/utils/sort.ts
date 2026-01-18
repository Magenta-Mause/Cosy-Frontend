import type { FileSystemObjectDto } from "@/api/generated/model";

export function isDirectory(obj: FileSystemObjectDto) {
  return obj.type === "DIRECTORY";
}

export function sortDirsFirst(a: FileSystemObjectDto, b: FileSystemObjectDto) {
  const ad = isDirectory(a);
  const bd = isDirectory(b);
  if (ad !== bd) return ad ? -1 : 1;
  return a.name.localeCompare(b.name);
}
