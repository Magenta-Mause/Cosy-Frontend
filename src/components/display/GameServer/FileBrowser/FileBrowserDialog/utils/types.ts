import type { FileSystemObjectDto } from "@/api/generated/model";

export type CacheEntry = {
  fetchDepth: number;
  objects: FileSystemObjectDto[];
};
