import { Button } from "@components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { CircleAlertIcon, CircleX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { v7 as uuidv7 } from "uuid";
import type { ZodType } from "zod";

type Row = {
  uuid: string;
  key: string;
  value: string;
  valid: boolean;
};

interface Props<T> {
  label: string;
  description?: string;
  value?: T[];
  onChange: (value: T[]) => void;
  /** maps DTO -> row */
  toRow: (item: T) => { key: string; value: string };
  /** maps row -> DTO */
  fromRow: (row: { key: string; value: string }) => T;
  keyValidator: ZodType;
  valueValidator: ZodType;
  errorLabel: string;
}

export default function EditKeyValueInput<T>({
  label,
  description,
  value,
  onChange,
  toRow,
  fromRow,
  keyValidator,
  valueValidator,
  errorLabel,
}: Props<T>) {
  const [rows, setRows] = useState<Row[]>(() =>
    value && value.length > 0
      ? value.map((v) => ({
          uuid: uuidv7(),
          ...toRow(v),
          valid: true,
        }))
      : [{ uuid: uuidv7(), key: "", value: "", valid: true }],
  );

  const validateRow = useCallback(
    (key: string, value: string) =>
      keyValidator.safeParse(key).success && valueValidator.safeParse(value).success,
    [keyValidator, valueValidator],
  );

  const lastEmittedRef = useRef<string>("");

  /** propagate to parent */
  useEffect(() => {
    const nextValue = rows
      .filter((r) => r.key !== "" && r.value !== "" && r.valid)
      .map((r) => fromRow({ key: r.key, value: r.value }));

    const serialized = JSON.stringify(nextValue);
    if (serialized !== lastEmittedRef.current) {
      lastEmittedRef.current = serialized;
      onChange(nextValue);
    }
  }, [rows, fromRow, onChange]);

  const updateRow = (uuid: string, field: "key" | "value") => (val: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.uuid === uuid
          ? {
              ...r,
              [field]: val,
              valid: validateRow(field === "key" ? val : r.key, field === "value" ? val : r.value),
            }
          : r,
      ),
    );
  };

  const removeRow = (uuid: string) => setRows((prev) => prev.filter((r) => r.uuid !== uuid));
  const addRow = () =>
    setRows((prev) => [...prev, { uuid: uuidv7(), key: "", value: "", valid: true }]);

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={row.uuid} className="flex gap-2 items-center">
            <Input
              value={row.key}
              onChange={(e) => updateRow(row.uuid, "key")(e.target.value)}
              placeholder="Key"
              className={!row.valid ? "border-red-500" : ""}
            />
            <Input
              value={row.value}
              onChange={(e) => updateRow(row.uuid, "value")(e.target.value)}
              placeholder="Value"
              className={!row.valid ? "border-red-500" : ""}
            />
            {index > 0 && (
              <Button
                variant="destructive"
                onClick={() => removeRow(row.uuid)}
                className="h-9 w-9 p-0"
              >
                <CircleX />
              </Button>
            )}
            {index === rows.length - 1 && <Button onClick={addRow}>+</Button>}
            {!row.valid && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleAlertIcon className="text-red-500 w-5 h-5" />
                </TooltipTrigger>
                <TooltipContent>{errorLabel}</TooltipContent>
              </Tooltip>
            )}
          </div>
        ))}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
}
