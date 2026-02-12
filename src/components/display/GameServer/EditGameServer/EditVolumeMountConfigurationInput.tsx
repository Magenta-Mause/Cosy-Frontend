import { Input } from "@components/ui/input.tsx";
import { Fragment, useCallback, useMemo, useRef } from "react";
import { v7 as generateUuid } from "uuid";
import type { ZodType } from "zod";
import { type InputType, preProcessInputValue } from "../CreateGameServer/util";
import ListInputEdit from "./ListInputEditGameServer";

interface VolumeMountRow {
  container_path: string;
  uuid: string;
}

interface Props<T> {
  value?: T[];
  setValue: (vals: T[]) => void;
  onChange?: (vals: T[]) => void;

  placeholder: string;
  fieldLabel: string;
  fieldDescription: string;

  validator: ZodType;
  errorLabel: string;
  required?: boolean;

  inputType: InputType;
  objectKey: keyof T;
}

function EditVolumeMountConfigurationInput<T extends Record<string, string>>({
  value,
  setValue,
  onChange,
  placeholder,
  fieldLabel,
  fieldDescription,
  validator,
  errorLabel,
  required,
  inputType,
  objectKey,
}: Props<T>) {
  const validateContainerPath = useCallback(
    (container_path?: string) => {
      if (!required) return true;
      if (container_path?.trim() === "/") return false;
      return validator.safeParse(container_path).success;
    },
    [required, validator],
  );

  const checkValidity = useCallback(
    (item: VolumeMountRow) => validateContainerPath(item.container_path),
    [validateContainerPath],
  );

  const uuidPerIndexRef = useRef<string[]>([]);

  const rows = useMemo(() => {
    const vals = value ?? [];

    const uuids = uuidPerIndexRef.current;
    if (uuids.length > vals.length) {
      uuidPerIndexRef.current = uuids.slice(0, vals.length);
    }
    while (uuidPerIndexRef.current.length < vals.length) {
      uuidPerIndexRef.current.push(generateUuid());
    }

    return vals.map((v, idx) => ({
      container_path: String(v[objectKey] ?? ""),
      uuid: uuidPerIndexRef.current[idx],
    }));
  }, [value, objectKey]);

  return (
    <ListInputEdit<VolumeMountRow>
      value={rows}
      setParentValue={(rows) => {
        setValue(
          rows?.map((row) => ({
            ...({} as T),
            [objectKey]: preProcessInputValue(row.container_path, inputType),
          })) ?? [],
        );
      }}
      onChange={(rows) => {
        const mapped = rows.map((row) => ({
          ...({} as T),
          [objectKey]: preProcessInputValue(row.container_path, inputType),
        }));
        onChange?.(mapped);
      }}
      checkValidity={checkValidity}
      errorLabel={errorLabel}
      fieldLabel={fieldLabel}
      fieldDescription={fieldDescription}
      renderRow={(changeCallback, rowError) => (row) => (
        <Fragment key={row.uuid}>
          <div className="flex gap-2 items-center">
            <Input
              className={rowError ? "border-red-500" : ""}
              placeholder={placeholder}
              value={row.container_path}
              onChange={(e) => changeCallback({ ...row, container_path: e.target.value })}
              type={inputType}
            />
          </div>
        </Fragment>
      )}
    />
  );
}

export default EditVolumeMountConfigurationInput;
