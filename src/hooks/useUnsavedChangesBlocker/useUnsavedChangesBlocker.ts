import { useBlocker } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";

interface UseUnsavedChangesBlockerOptions {
  isChanged: boolean;
  onSave: () => void | Promise<void>;
  onRevert: () => void;
  warningMessage?: string;
}

export default function useUnsavedChangesBlocker({
  isChanged,
  onSave,
  onRevert,
  warningMessage,
}: UseUnsavedChangesBlockerOptions) {
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const resolverRef = useRef<((block: boolean) => void) | null>(null);

  useBlocker({
    shouldBlockFn: useCallback(() => {
      if (!isChanged) return false;
      return new Promise<boolean>((resolve) => {
        resolverRef.current = (block) => resolve(block);
        setShowUnsavedModal(true);
      });
    }, [isChanged]),
    enableBeforeUnload: isChanged,
  });

  const handleLeave = useCallback(() => {
    setShowUnsavedModal(false);
    onRevert();
    resolverRef.current?.(false);
  }, [onRevert]);

  const handleSaveAndLeave = useCallback(() => {
    setShowUnsavedModal(false);
    resolverRef.current?.(false);
    onSave();
  }, [onSave]);

  return {
    showUnsavedModal,
    setShowUnsavedModal,
    handleLeave,
    handleSaveAndLeave,
    warningMessage,
  };
}
