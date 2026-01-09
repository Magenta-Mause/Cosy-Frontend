import ListInput from "@components/display/GameServer/CreateGameServer/ListInput.tsx";
import { Input } from "@components/ui/input.tsx";
import { Fragment, useCallback } from "react";
import type { ZodType } from "zod";
import type { GameServerCreationDto } from "@/api/generated/model/gameServerCreationDto.ts";
import { type InputType, preProcessInputValue } from "./util";

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

function KeyValueInput({
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
  const validateKeyValuePair = useCallback(
    (key?: string, value?: string) => {
      if (!key && !value && !required) {
        return true;
      } else if (!key || !value) {
        return false;
      }

      const preProcessedKey = preProcessInputValue(key, inputType);
      const preProcessedValue = preProcessInputValue(value, inputType);

      const keyValid = (key: string | number) => keyValidator.safeParse(key).success;
      const valueValid = (value: string | number) => valueValidator.safeParse(value).success;

      return keyValid(preProcessedKey) && valueValid(preProcessedValue);
    },
    [keyValidator, valueValidator, required, inputType],
  );

  const checkValidity = useCallback(
    (item: KeyValueItem) => validateKeyValuePair(item.key, item.value),
    [validateKeyValuePair],
  );

  const computeValue = useCallback(
    (items: KeyValueItem[]) => {
      const mappedItems: { [objectKey]: string | number;[objectValue]: string | number }[] = [];
      items.forEach((item) => {
        mappedItems.push({
          [objectKey]: preProcessInputValue(item.key, inputType),
          [objectValue]: preProcessInputValue(item.value, inputType),
        });
      });
      return mappedItems as unknown as GameServerCreationDto[keyof GameServerCreationDto];
    },
    [inputType, objectKey, objectValue],
  );

  return (
    <ListInput
      attribute={attribute}
      checkValidity={checkValidity}
      errorLabel={errorLabel}
      fieldLabel={fieldLabel}
      computeValue={computeValue}
      fieldDescription={fieldDescription}
      renderRow={(changeCallback, rowError) => (keyValuePair) => (
        <Fragment key={keyValuePair.uuid}>
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
            onChange={(e) => {
              changeCallback({ ...keyValuePair, value: e.target.value });
            }}
            type={inputType}
          />
        </Fragment>
      )}
    />
  );
}

export type { InputType };

export default KeyValueInput;
