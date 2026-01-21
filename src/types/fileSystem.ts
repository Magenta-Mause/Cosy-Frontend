import type { FileSystemObjectDto } from "@/api/generated/model";

export type FSCacheEntry = {
  fetchDepth: number;
  objects: FileSystemObjectDto[];
};
