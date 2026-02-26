interface UseUnsavedChangesBlockerOptions {
  isChanged: boolean;
  onSave: () => Promise<void>;
}

const useUnsavedChangesBlocker = (_: UseUnsavedChangesBlockerOptions) => {
  // TODO: Fix this unsaved blocker stuff, was previously completely broken

  return {
    showUnsavedModal: false,
    handleLeave: () => {},
    handleSaveAndLeave: () => {},
    handleStay: () => {},
  };
};

export default useUnsavedChangesBlocker;
