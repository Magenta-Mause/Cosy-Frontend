import { useBlocker } from "@tanstack/react-router";
import * as React from "react";

interface UseUnsavedChangesBlockerOptions {
  isChanged: boolean;
  onSave: () => Promise<void>;
}

const useUnsavedChangesBlocker = ({ isChanged, onSave }: UseUnsavedChangesBlockerOptions) => {
  const [showUnsavedModal, setShowUnsavedModal] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // When withResolver is true, the hook gives you `proceed`, `reset`, `status`, etc.
  // You decide in UI whether to continue or cancel. [web:2]
  const blocker = useBlocker({
    shouldBlockFn: () => isChanged,
    withResolver: true,
  });

  // Open/close modal based on blocker status. [web:2]
  React.useEffect(() => {
    if (blocker.status === "blocked") {
      setShowUnsavedModal(true);
    } else {
      setShowUnsavedModal(false);
      setIsSaving(false);
    }
  }, [blocker.status]);

  const handleLeave = React.useCallback(() => {
    // Only callable when status === 'blocked' in the docs examples (guard it). [web:2]
    if (blocker.status !== "blocked") return;
    blocker.proceed();
  }, [blocker]);

  const handleStay = React.useCallback(() => {
    if (blocker.status !== "blocked") return;
    blocker.reset();
  }, [blocker]);

  const handleSaveAndLeave = React.useCallback(async () => {
    if (blocker.status !== "blocked") return;

    try {
      setIsSaving(true);
      await onSave();
      blocker.proceed();
    } catch {
      // Save failed → keep user here, keep modal open (don’t proceed).
      setIsSaving(false);
    }
  }, [blocker, onSave]);

  return {
    showUnsavedModal,
    isSaving,
    handleLeave,
    handleSaveAndLeave,
    handleStay,
    // Optional: sometimes useful for rendering “navigating to …”
    nextLocation: blocker.status === "blocked" ? blocker.next : undefined,
  };
};

export default useUnsavedChangesBlocker;
