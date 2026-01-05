import ListInput from "@components/display/GameServer/CreateGameServer/ListInput.tsx";
import { Input } from "@components/ui/input.tsx";
import { useCallback } from "react";
import type { ZodType } from "zod";
import type { GameServerCreationDto } from "@/api/generated/model/gameServerCreationDto.ts";

// All keys must be a key of HTMLInputTypeAttribute
enum InputType {
  text = "text",
  number = "number",
}

interface KeyValueItem {
  key: string;
  value: string;
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
  inputType: InputType;
  objectKey: string; // This is the property name for the key in the object
  objectValue: string; // This is the property name for the value in the object
}

export default function KeyValueInput({
  attribute,
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
}: Props) {
  const preProcessValue = useCallback(
    (value: string): string | number => {
      if (inputType === InputType.number) {
        return Number(value);
      }
      return value;
    },
    [inputType],
  );

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

  const checkValidity = (item: KeyValueItem) => validateKeyValuePair(item.key, item.value);
  const computeValue = (items: KeyValueItem[]) => {
    const map: Record<string | number, string | number> = {};
    items.forEach((item) => {
      map[preProcessValue(item.key)] = preProcessValue(item.value);
    });
    return map as unknown as GameServerCreationDto[keyof GameServerCreationDto];
  };

  return (
    <ListInput
      attribute={attribute}
      checkValidity={checkValidity}
      errorLabel={errorLabel}
      fieldLabel={fieldLabel}
      computeValue={computeValue}
      fieldDescription={fieldDescription}
      renderRow={(changeCallback, rowError) => (keyValuePair) => (
        <>
          <Input
            className={rowError ? "border-red-500" : ""}
            id={`key-value-input-key-${keyValuePair.uuid}`}
            placeholder={placeHolderKeyInput}
            value={(keyValuePair.key as string | undefined) || ""}
            onChange={(e) => changeCallback({ ...keyValuePair, key: e.target.value })}
            type={inputType}
          />
          <Input
            className={rowError ? "border-red-500" : ""}
            id={`key-value-input-value-${keyValuePair.uuid}`}
            placeholder={placeHolderValueInput}
            value={(keyValuePair.value as string | undefined) || ""}
            onChange={(e) => changeCallback({ ...keyValuePair, value: e.target.value })}
            type={inputType}
          />
        </>
      )}
    />
  );
}

export { InputType };
