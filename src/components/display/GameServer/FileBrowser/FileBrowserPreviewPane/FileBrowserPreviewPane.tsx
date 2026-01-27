export const FileBrowserPreviewPane = ({
  show,
  children,
}: {
  show: boolean;
  children?: React.ReactNode;
}) => {
  if (!show) return null;
  return <div className="flex-1 p-2 overflow-auto">{children}</div>;
};
