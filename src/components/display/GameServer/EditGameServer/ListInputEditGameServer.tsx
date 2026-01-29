import { Button } from "@components/ui/button.tsx";
import { Field, FieldDescription, FieldLabel } from "@components/ui/field.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip.tsx";
import { CircleAlertIcon, Plus, Trash2 } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { v7 as generateUuid } from "uuid";

interface Props<T extends { uuid: string }> {
  value?: T[];
  setParentValue: (vals: T[]) => void;
  onChange?: (vals: T[]) => void;
  checkValidity: (val: T) => boolean;
  errorLabel: string;
  fieldLabel: ReactNode;
  fieldDescription: ReactNode;
  renderRow: (changeCallback: (newVal: T) => void, rowError: boolean) => (item: T) => ReactNode;
  defaultNewItem: Omit<T, "uuid">;
}

function ListInputEditGameServer<T extends { uuid: string }>({
  value,
  setParentValue,
  onChange,
  errorLabel,
  fieldDescription,
  fieldLabel,
  checkValidity,
  renderRow,
  defaultNewItem,
}: Props<T>) {
  const [rowErrors, setRowErrors] = useState<{ [uuid: string]: boolean }>({});

  useEffect(() => {
    const newRowErrors: { [uuid: string]: boolean } = {};
    (value ?? []).forEach((item) => {
      newRowErrors[item.uuid] = !checkValidity(item);
    });
    setRowErrors(newRowErrors);
  }, [value, checkValidity]);

  const setValues = useCallback(
    (callback: (prevVals: T[]) => T[]) => {
      const newVals = callback(value ?? []);
      setParentValue(newVals);

      const newRowErrors: { [uuid: string]: boolean } = {};
      newVals.forEach((item) => {
        newRowErrors[item.uuid] = !checkValidity(item);
      });
      setRowErrors(newRowErrors);

      onChange?.(newVals);
    },
    [value, checkValidity, onChange, setParentValue],
  );

  const changeCallback = useCallback(
    (uuid: string) => (value: T) => {
      setValues((prev) => prev.map((item) => (item.uuid === uuid ? value : item)));
    },
    [setValues],
  );

  const removeValue = useCallback(
    (uuid: string) => {
      setValues((prev) => prev.filter((item) => item.uuid !== uuid));
    },
    [setValues],
  );

  const addNewValue = useCallback(() => {
    setValues((prev) => [...prev, { ...defaultNewItem, uuid: generateUuid() } as T]);
  }, [setValues, defaultNewItem]);

  return (
    <Field className="py-2">
      <FieldLabel className="pb-0 font-bold">{fieldLabel}</FieldLabel>

      <div className="space-y-2 w-full">
        {value?.map((item, index) => {
          const rowError = rowErrors[item.uuid];

          return (
            <div key={item.uuid} className="flex items-center gap-2 h-fit">
              {renderRow(changeCallback(item.uuid), !!rowError)(item)}

              <Button
                variant="destructive"
                onClick={() => removeValue(item.uuid)}
                className="h-9 w-9 p-0 flex items-center justify-center"
              >
                <Trash2 className="size-6" />
              </Button>
              {index === (value ?? []).length - 1 && (
                <Button className="h-9 w-9 p-0" onClick={addNewValue}>
                  <Plus className="size-6" />
                </Button>
              )}

              {rowError && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CircleAlertIcon className="text-red-500 w-5 h-5" />
                  </TooltipTrigger>
                  <TooltipContent>{errorLabel}</TooltipContent>
                </Tooltip>
              )}
            </div>
          );
        })}
        {value?.length === 0 && (
          <Button className="h-9 w-9 p-0" onClick={addNewValue}>
            <Plus className="size-6" />
          </Button>
        )}
      </div>
      <FieldDescription>{fieldDescription}</FieldDescription>
    </Field>
  );
}

export default ListInputEditGameServer;
