import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { CircleX } from "lucide-react";
import React, { type Dispatch, type SetStateAction } from "react";

interface Props {
  placeHolderKeyInput: string;
  placeHolderValueInput: string;
  separator: string;
  values: Array<{ key: string; value: string }>;
  fieldLabel: string;
  fieldDescription: string;
  setKeyValue: Dispatch<
    SetStateAction<
      {
        key: string;
        value: string;
      }[]
    >
  >;
}

export default function FieldKeyValueInput({
  placeHolderKeyInput,
  placeHolderValueInput,
  separator,
  fieldLabel,
  fieldDescription,
  values,
  setKeyValue,
}: Props) {
  const [inputKey, setInputKey] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");

  const handleAdd = () => {
    if (!inputKey || !inputValue) return;

    setKeyValue((prev) => [...prev, { key: inputKey, value: inputValue }]);

    setInputKey("");
    setInputValue("");
  };

  const remove = (valueToRemove: { key: string; value: string }) => {
    setKeyValue((prev) => {
      const idx = prev.findIndex(
        (value) => value.key === valueToRemove.key && value.value === valueToRemove.value,
      );
      if (idx === -1) return prev;
      const next = prev.slice();
      next.splice(idx, 1);
      return next;
    });
  };

  return (
    <Field>
      <FieldLabel htmlFor="key-value-input">{fieldLabel}</FieldLabel>
      <div className="grid grid-cols-3 gap-4">
        <Input
          id="key-value-input-key"
          placeholder={placeHolderKeyInput}
          required
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
        />
        <Input
          id="key-value-input-value"
          placeholder={placeHolderValueInput}
          required
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Button className="ml-2" onClick={() => handleAdd()}>
          Add
        </Button>
      </div>
      <div className="flex w-full max-w-md flex-row flex-wrap gap-2 items-start">
        {values.map((value, index) => (
          <Badge key={`${value.key}-${value.value}-${index}`}>
            {value.key} {separator} {value.value}
            <Button className="p-0" size="icon-sm" variant="ghost" onClick={() => remove(value)}>
              <CircleX />
            </Button>
          </Badge>
        ))}
      </div>
      <FieldDescription>{fieldDescription}</FieldDescription>
    </Field>
  );
}
