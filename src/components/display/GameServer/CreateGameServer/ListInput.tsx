import {Button} from "@components/ui/button.tsx";
import {Field, FieldDescription, FieldLabel} from "@components/ui/field.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@components/ui/tooltip.tsx";
import {CircleAlertIcon, CircleX} from "lucide-react";
import {type ReactNode, useCallback, useContext, useState} from "react";
import {v7 as generateUuid} from "uuid";
import type {GameServerCreationDto} from "@/api/generated/model/gameServerCreationDto.ts";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import {GameServerCreationContext} from "./CreateGameServerModal.tsx";
import {GameServerCreationPageContext} from "./GenericGameServerCreationPage.tsx";

interface Props<T extends { uuid: string }> {
  attribute: keyof GameServerCreationDto;
  onChange?: (vals: T[]) => void;
  checkValidity: (val: T) => boolean;
  errorLabel: string;
  fieldLabel: ReactNode;
  computeValue: (vals: T[]) => GameServerCreationDto[keyof GameServerCreationDto];
  fieldDescription: ReactNode;
  renderRow: (changeCallback: (newVal: T) => void, rowError: boolean) => (item: T) => ReactNode;
  defaultNewItem?: () => Partial<T>;
}

function ListInput<T extends { uuid: string }>({
                                                 onChange,
                                                 attribute,
                                                 errorLabel,
                                                 fieldDescription,
                                                 fieldLabel,
                                                 checkValidity,
                                                 computeValue,
                                                 renderRow,
                                                 defaultNewItem
                                               }: Props<T>) {
  const {setGameServerState} = useContext(GameServerCreationContext);
  const {setAttributeTouched, setAttributeValid, attributesTouched} = useContext(
    GameServerCreationPageContext,
  );
  const [rowErrors, setRowErrors] = useState<{ [uuid: string]: boolean }>({});
  const [values, setValuesInternal] = useState<T[]>([{
    ...(defaultNewItem ? defaultNewItem() : {}),
    uuid: generateUuid()
  } as T]);
  const {t} = useTranslationPrefix("components.CreateGameServer");

  const setValues = useCallback(
    (callback: (prevVals: T[]) => T[]) => {
      const newVal = callback(values);
      setValuesInternal(newVal);
      setGameServerState(attribute)(computeValue(newVal));
      setAttributeTouched(attribute, true);

      const newRowErrors: { [uuid: string]: boolean } = {};
      newVal.forEach((item, _index) => {
        newRowErrors[item.uuid] = !checkValidity(item);
      });
      setRowErrors(newRowErrors);
      setAttributeValid(attribute, Object.values(newRowErrors).filter((err) => err).length === 0);
      if (onChange) {
        onChange(newVal);
      }
    },
    [
      attribute,
      checkValidity,
      computeValue,
      onChange,
      setAttributeTouched,
      setAttributeValid,
      setGameServerState,
      values,
    ],
  );

  const changeCallback = useCallback(
    (uuid: string) => (value: T) => {
      const newVals = values.map((item) => (item.uuid === uuid ? value : item));
      setValues(() => newVals);
    },
    [values, setValues],
  );

  const removeValue = useCallback(
    (uuid: string) => {
      setValues((prev) => prev.filter((pair) => pair.uuid !== uuid));
    },
    [setValues],
  );

  const addNewValue = useCallback(() => {
    setValues((prev) => [...prev, {...(defaultNewItem ? defaultNewItem() : {}), uuid: generateUuid()} as T]);
  }, [setValues]);

  return (
    <Field>
      <FieldLabel htmlFor="key-value-input">{fieldLabel}</FieldLabel>

      <div className="space-y-2 w-full">
        {values.map((keyValuePair, index) => {
          const rowError = attributesTouched[attribute] && rowErrors[keyValuePair.uuid];
          return (
            <div key={keyValuePair.uuid} className="flex items-center gap-2 w-full h-fit">
              {renderRow(changeCallback(keyValuePair.uuid), rowError ?? false)(keyValuePair)}
              {index > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => removeValue(keyValuePair.uuid)}
                  className="h-9 w-9 p-0 flex items-center justify-center"
                  aria-label="Remove entry"
                >
                  <CircleX className="w-full h-full"/>
                </Button>
              )}
              {rowError && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CircleAlertIcon className="text-red-500 w-5 h-5"/>
                  </TooltipTrigger>
                  <TooltipContent>{errorLabel}</TooltipContent>
                </Tooltip>
              )}
            </div>
          );
        })}
      </div>
      <Button className="ml-2" onClick={addNewValue}>
        {t("listInput.addButton")}
      </Button>
      <FieldDescription>{fieldDescription}</FieldDescription>
    </Field>
  );
}

export default ListInput;
