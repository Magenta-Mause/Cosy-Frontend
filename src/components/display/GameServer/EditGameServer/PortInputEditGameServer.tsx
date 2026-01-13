import { Input } from "@components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select.tsx";
import { useCallback } from "react";
import type { ZodType } from "zod";
import { type PortMapping, PortMappingProtocol } from "@/api/generated/model";
import ListInputEdit from "./ListInputEditGameServer";

interface PortItem {
  key: string;
  value: string;
  protocol: PortMappingProtocol;
  uuid: string;
}

interface Props {
  value?: PortMapping[];
  onChange?: (vals: PortMapping[]) => void;

  fieldLabel: string;
  fieldDescription: string;

  keyValidator: ZodType;
  valueValidator: ZodType;
  errorLabel: string;
  required?: boolean;
}

function PortInputEditGameServer({
  value,
  onChange,
  fieldLabel,
  fieldDescription,
  keyValidator,
  valueValidator,
  errorLabel,
  required,
}: Props) {
  const inputType: "number" = "number";

  // Validation function
  const validateKeyValuePair = useCallback(
    (key?: string, value?: string) => {
      // define preProcessValue here to avoid dependency issues
      const preProcessValue = (v: string) => Number(v);

      if (!key && !value && !required) return true;
      if (!key || !value) return false;

      return (
        keyValidator.safeParse(preProcessValue(key)).success &&
        valueValidator.safeParse(preProcessValue(value)).success
      );
    },
    [keyValidator, valueValidator, required],
  );

  const checkValidity = useCallback(
    (item: PortItem) => validateKeyValuePair(item.key, item.value),
    [validateKeyValuePair],
  );

  return (
    <ListInputEdit<PortItem>
      value={
        value?.map((v) => ({
          key: v.instance_port?.toString() ?? "",
          value: v.container_port?.toString() ?? "",
          protocol: v.protocol ?? PortMappingProtocol.TCP,
          uuid: crypto.randomUUID(),
        })) ?? []
      }
      onChange={(rows) => {
        const preProcessValue = (v: string) => Number(v); // also here for mapping
        const mapped: PortMapping[] = rows.map((row) => ({
          instance_port: preProcessValue(row.key),
          container_port: preProcessValue(row.value),
          protocol: row.protocol,
        }));
        onChange?.(mapped);
      }}
      checkValidity={checkValidity}
      errorLabel={errorLabel}
      fieldLabel={fieldLabel}
      fieldDescription={fieldDescription}
      renderRow={(changeCallback, rowError) => (row) => (
        <>
          <Input
            className={rowError ? "border-red-500 flex-1" : "flex-1"}
            placeholder="Instance Port"
            value={row.key}
            onChange={(e) => changeCallback({ ...row, key: e.target.value })}
            type={inputType}
          />
          <Input
            className={rowError ? "border-red-500 flex-1" : "flex-1"}
            placeholder="Container Port"
            value={row.value}
            onChange={(e) => changeCallback({ ...row, value: e.target.value })}
            type={inputType}
          />
          <Select
            value={row.protocol}
            onValueChange={(newVal) =>
              changeCallback({ ...row, protocol: newVal as PortMappingProtocol })
            }
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Protocol" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PortMappingProtocol).map((protocol) => (
                <SelectItem key={protocol} value={protocol}>
                  {protocol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    />
  );
}

export default PortInputEditGameServer;
