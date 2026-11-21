import { useState } from "react";
import type { FileSystemObjectDto } from "@/api/generated/model";
import type { PreviewMode } from "@/lib/fileSystemUtils";

export function useFileSelection() {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [selectedObj, setSelectedObj] = useState<FileSystemObjectDto | null>(null);
  // null = decide from the file extension; set via "Open as" in a row's menu.
  const [previewMode, setPreviewMode] = useState<PreviewMode | null>(null);

  const closePreview = () => {
    setSelectedFilePath(null);
    setSelectedFileName("");
    setSelectedObj(null);
    setPreviewMode(null);
  };

  return {
    selectedFilePath,
    selectedFileName,
    selectedObj,
    setSelectedFilePath,
    setSelectedFileName,
    setSelectedObj,
    previewMode,
    setPreviewMode,
    closePreview,
    hasSelection: selectedFilePath !== null,
  };
}
