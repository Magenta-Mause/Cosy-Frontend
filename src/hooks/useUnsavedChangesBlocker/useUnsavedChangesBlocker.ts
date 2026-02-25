import { useBlocker } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseUnsavedChangesBlockerOptions {
  isChanged: boolean;
  onSave: () => void | Promise<void>;
  onRevert: () => void;
  warningMessage?: string;
}

const globalIsChangedRef = { current: false };

export default function useUnsavedChangesBlocker({
  isChanged,
  onSave,
  onRevert,
  warningMessage,
}: UseUnsavedChangesBlockerOptions) {
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const resolverRef = useRef<((block: boolean) => void) | null>(null);

  useEffect(() => {
    globalIsChangedRef.current = isChanged;
  }, [isChanged]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!globalIsChangedRef.current || !warningMessage) return;
      e.preventDefault();
      e.returnValue = warningMessage;
      return warningMessage;
    };
    window.addEventListener("beforeunload", handler, { capture: true });
    return () => window.removeEventListener("beforeunload", handler, { capture: true });
  }, [warningMessage]);

  useBlocker({
    shouldBlockFn: useCallback(() => {
      if (!globalIsChangedRef.current) return false;
      return new Promise<boolean>((resolve) => {
        resolverRef.current = (block) => resolve(block);
        setShowUnsavedModal(true);
      });
    }, []),
    enableBeforeUnload: false,
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
