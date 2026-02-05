import type { FileSystemObjectDto } from "@/api/generated/model";
import { FileBrowserRow } from "../FileBrowserRow/FileBrowserRow";

type Props = {
  loading?: boolean;
  error?: string | null;

  objects: FileSystemObjectDto[];
  canWrite: boolean;

  onEntryClick?: (obj: FileSystemObjectDto) => void;
  onRename?: (obj: FileSystemObjectDto) => void;
  onDelete?: (obj: FileSystemObjectDto) => void;
  onDownload?: (obj: FileSystemObjectDto) => Promise<unknown>;
};

export const FileBrowserBody = ({
  loading,
  error,
  objects,
  canWrite,
  onEntryClick,
  onRename,
  onDelete,
  onDownload,
}: Props) => {
  if (error) return <div className="p-3 text-sm text-destructive">{error}</div>;

  return (
    <div className="flex-1 overflow-auto">
      <ul className="p-2">
        <li>
          <FileBrowserRow
            obj={{ name: "..", type: "DIRECTORY" }}
            canWrite={false}
            onEntryClick={onEntryClick}
          />
        </li>
        {objects.map((obj) => (
          <li key={`${obj.type ?? "UNKNOWN"}:${obj.name}`}>
            <FileBrowserRow
              obj={obj}
              loading={loading}
              canWrite={canWrite}
              onEntryClick={onEntryClick}
              onRename={onRename}
              onDelete={onDelete}
              onDownload={onDownload}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
