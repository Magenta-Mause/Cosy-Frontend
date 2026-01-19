import { Input } from "@components/ui/input.tsx";
import { Fragment, useCallback } from "react";
import type { ZodType } from "zod";
import { type InputType, preProcessInputValue } from "../CreateGameServer/util";
import ListInputEdit from "./ListInputEditGameServer";

interface KeyValueItem {
  key: string;
  value: string;
  uuid: string;
}

interface Props<T> {
  value?: T[];
  onChange?: (vals: T[]) => void;

  placeHolderKeyInput: string;
  placeHolderValueInput: string;
  fieldLabel: string;
  fieldDescription: string;

  keyValidator: ZodType;
  valueValidator: ZodType;
  errorLabel: string;
  required?: boolean;

  inputType: InputType;
  objectKey: keyof T;
  objectValue: keyof T;
}

function EditKeyValueInput<T extends Record<string, string>>({
  value,
  onChange,
  placeHolderKeyInput,
  placeHolderValueInput,
  fieldLabel,
  fieldDescription,
  keyValidator,
  valueValidator,
  errorLabel,
  required,
  inputType,
  objectKey,
  objectValue,
}: Props<T>) {
  const validateKeyValuePair = useCallback(
    (key?: string, value?: string) => {
      if (!key && !value && !required) {
        return true;
      } else if (!key || !value) {
        return false;
      }

      const preProcessedKey = preProcessInputValue(key, inputType);
      const preProcessedValue = preProcessInputValue(value, inputType);

      return (
        keyValidator.safeParse(preProcessedKey).success &&
        valueValidator.safeParse(preProcessedValue).success
      );
    },
    [keyValidator, valueValidator, required, inputType],
  );

  const checkValidity = useCallback(
    (item: KeyValueItem) => validateKeyValuePair(item.key, item.value),
    [validateKeyValuePair],
  );

  return (
    <ListInputEdit<KeyValueItem>
      value={
        value?.map((v) => ({
          key: String(v[objectKey] ?? ""),
          value: String(v[objectValue] ?? ""),
          uuid: crypto.randomUUID(),
        })) ?? []
      }
      onChange={(rows) => {
        const mapped = rows.map((row) => ({
          ...({} as T),
          [objectKey]: preProcessInputValue(row.key, inputType),
          [objectValue]: preProcessInputValue(row.value, inputType),
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
              placeholder={placeHolderKeyInput}
              value={row.key}
              onChange={(e) => changeCallback({ ...row, key: e.target.value })}
              type={inputType}
            />
            <Input
              className={rowError ? "border-red-500" : ""}
              placeholder={placeHolderValueInput}
              value={row.value}
              onChange={(e) => changeCallback({ ...row, value: e.target.value })}
              type={inputType}
            />
          </div>
        </Fragment>
      )}
    />
  );
}

export default EditKeyValueInput;
