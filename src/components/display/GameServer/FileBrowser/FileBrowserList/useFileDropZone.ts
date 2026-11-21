import { useEffect, useRef, useState } from "react";
import { isFileDrag } from "@/lib/droppedFiles";
import { normalizePath } from "@/lib/fileSystemUtils";

type Args = {
  currentPath: string;
  canDropAt?: (path: string) => boolean;
  onDropFiles?: (targetPath: string, dataTransfer: DataTransfer) => void;
};

/**
 * Drag-and-drop of OS files onto the file browser. The drop target is the nearest element
 * carrying `data-drop-path` (a folder row or a breadcrumb), otherwise the open directory.
 */
export const useFileDropZone = ({ currentPath, canDropAt, onDropFiles }: Args) => {
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // dragenter/dragleave fire for every child element; count them to know when the drag really left.
  const depth = useRef(0);
  // Set by Esc: the rest of this drag is ignored until it leaves the zone or is dropped.
  const cancelled = useRef(false);

  const resolveTarget = (e: React.DragEvent) => {
    const el = (e.target as HTMLElement | null)?.closest?.("[data-drop-path]");
    return normalizePath(el?.getAttribute("data-drop-path") ?? currentPath);
  };

  const reset = () => {
    depth.current = 0;
    cancelled.current = false;
    setDropTarget(null);
    setIsDragging(false);
  };

  const onDragEnter = (e: React.DragEvent) => {
    if (!isFileDrag(e.dataTransfer)) return;
    depth.current += 1;
    if (!cancelled.current) setIsDragging(true);
  };

  const onDragOver = (e: React.DragEvent) => {
    if (!isFileDrag(e.dataTransfer)) return;
    // Always claim the drag: an unhandled file drop makes the browser open the file and leave Cosy.
    e.preventDefault();
    if (cancelled.current) {
      e.dataTransfer.dropEffect = "none";
      return;
    }
    const target = resolveTarget(e);
    const allowed = Boolean(onDropFiles && canDropAt?.(target));
    e.dataTransfer.dropEffect = allowed ? "copy" : "none";
    setIsDragging(true);
    setDropTarget(allowed ? target : null);
  };

  const onDragLeave = (e: React.DragEvent) => {
    if (!isFileDrag(e.dataTransfer)) return;
    depth.current -= 1;
    if (depth.current <= 0) reset();
  };

  const onDrop = (e: React.DragEvent) => {
    if (!isFileDrag(e.dataTransfer)) return;
    e.preventDefault();
    const wasCancelled = cancelled.current;
    const target = resolveTarget(e);
    reset();
    if (wasCancelled) return;
    if (onDropFiles && canDropAt?.(target)) onDropFiles(target, e.dataTransfer);
  };

  // Esc cancels the drop. Most browsers hand Esc to the OS during a file drag (which then
  // cancels the drag and only fires dragleave), but where the page does get it, honour it too.
  useEffect(() => {
    if (!isDragging) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      cancelled.current = true;
      setDropTarget(null);
      setIsDragging(false);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [isDragging]);

  return {
    isDragging,
    dropTarget,
    isDroppingIntoCurrent: dropTarget !== null && dropTarget === normalizePath(currentPath),
    dropZoneProps: { onDragEnter, onDragOver, onDragLeave, onDrop },
  };
};
