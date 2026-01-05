import ListInput from "@components/display/GameServer/CreateGameServer/ListInput.tsx";
import {Input} from "@components/ui/input.tsx";
import {useCallback} from "react";
import type {ZodType} from "zod";
import type {GameServerCreationDto} from "@/api/generated/model/gameServerCreationDto.ts";
import {type PortMapping, PortMappingProtocol} from "@/api/generated/model";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@components/ui/select.tsx";
import {cn} from "@/lib/utils.ts";

// All keys must be a key of HTMLInputTypeAttribute
enum InputType {
  text = "text",
  number = "number",
}

interface PortItem {
  key: string;
  value: string;
  protocol: PortMappingProtocol;
  uuid: string;
}

interface Props {
  attribute: keyof GameServerCreationDto;
  placeHolderKeyInput: string;
  placeHolderValueInput: string;
  fieldLabel: string;
  fieldDescription: string;
  keyValidator: ZodType;
  valueValidator: ZodType;
  errorLabel: string;
  required?: boolean;
}

const inputType = InputType.number;

function PortInput({
                     attribute,
                     placeHolderKeyInput,
                     placeHolderValueInput,
                     fieldLabel,
                     fieldDescription,
                     keyValidator,
                     valueValidator,
                     errorLabel,
                     required,
                   }: Props) {
  const preProcessValue = Number;

  const validateKeyValuePair = useCallback(
    (key?: string, value?: string) => {
      if (!key && !value && !required) {
        return true;
      } else if (!key || !value) {
        return false;
      }

      const preProcessedKey = preProcessValue(key);
      const preProcessedValue = preProcessValue(value);

      const keyValid = (key: string | number) => keyValidator.safeParse(key).success;
      const valueValid = (value: string | number) => valueValidator.safeParse(value).success;

      return keyValid(preProcessedKey) && valueValid(preProcessedValue);
    },
    [keyValidator, valueValidator, required, preProcessValue],
  );

  const checkValidity = (item: PortItem) => validateKeyValuePair(item.key, item.value);

  const computeValue = (items: PortItem[]) => {
    const mappedItems: PortMapping[] = [];
    items.forEach((item) => {
      mappedItems.push({
        instance_port: preProcessValue(item.key),
        container_port: preProcessValue(item.value),
        protocol: item.protocol
      });
    });
    return mappedItems;
  };

  return (
    <ListInput
      defaultNewItem={() => ({protocol: PortMappingProtocol.TCP})}
      attribute={attribute}
      checkValidity={checkValidity}
      errorLabel={errorLabel}
      fieldLabel={fieldLabel}
      computeValue={computeValue}
      fieldDescription={fieldDescription}
      renderRow={(changeCallback, rowError) => (keyValuePair) => (
        <>
          <Input
            className={cn(rowError ? "border-red-500" : "", "w-30")}
            id={`key-value-input-key-${keyValuePair.uuid}`}
            placeholder={placeHolderKeyInput}
            value={(keyValuePair.key as string | undefined) || ""}
            onChange={(e) => changeCallback({...keyValuePair, key: e.target.value})}
            type={inputType}
          />
          <Input
            className={cn(rowError ? "border-red-500" : "", "w-30")}
            id={`key-value-input-value-${keyValuePair.uuid}`}
            placeholder={placeHolderValueInput}
            value={(keyValuePair.value as string | undefined) || ""}
            onChange={(e) => {
              changeCallback({...keyValuePair, value: e.target.value});
            }}
            type={inputType}
          />
          <Select value={keyValuePair.protocol} onValueChange={(newVal) => changeCallback({
            ...keyValuePair,
            protocol: newVal as PortMappingProtocol
          })}>
            <SelectTrigger className={"w-20"}>
              <SelectValue placeholder={"Protocol"}/>
            </SelectTrigger>
            <SelectContent>
              {Object.values(PortMappingProtocol).map(protocol =>
                <SelectItem value={protocol} key={protocol}>{protocol}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </>
      )}
    />
  );
}

export {InputType};

export default PortInput;
