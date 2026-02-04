import { useState } from "react";
import type { FileSystemObjectDto } from "@/api/generated/model";

export function useFileSelection() {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [selectedObj, setSelectedObj] = useState<FileSystemObjectDto | null>(null);

  const closePreview = () => {
    setSelectedFilePath(null);
    setSelectedFileName("");
    setSelectedObj(null);
  };

  return {
    selectedFilePath,
    selectedFileName,
    selectedObj,
    setSelectedFilePath,
    setSelectedFileName,
    setSelectedObj,
    closePreview,
    hasSelection: selectedFilePath !== null,
  };
}
