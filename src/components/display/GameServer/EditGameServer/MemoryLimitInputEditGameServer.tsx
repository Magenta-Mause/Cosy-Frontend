import { MemoryLimitInput } from "@components/common/MemoryLimitInput.tsx";
import { FieldError } from "@components/ui/field.tsx";
import { Label } from "@components/ui/label.tsx";
import { useCallback, useEffect, useState } from "react";
import type { ZodType } from "zod";

const MemoryLimitInputEditGameServer = (props: {
  id: string;
  value?: string | null;
  onChange: (value: string | null) => void;
  validator: ZodType;
  placeholder: string;
  errorLabel: string;
  label?: string;
  description?: string;
  optional?: boolean;
  defaultValue?: string;
  disabled?: boolean;
}) => {
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const isError = touched && !isValid;

  const validate = useCallback(
    (value: unknown) => {
      if (props.optional && (value === null || value === undefined || value === "")) return true;
      return props.validator.safeParse(value).success;
    },
    [props.optional, props.validator],
  );

  const changeCallback = useCallback(
    (value: string) => {
      setTouched(true);

      if (value === "" && props.defaultValue !== undefined) {
        props.onChange(props.defaultValue);
        setIsValid(validate(props.defaultValue));
        return;
      }

      const valToSend = value === "" ? null : value;
      props.onChange(valToSend);
      setIsValid(validate(valToSend));
    },
    [props, validate],
  );

  useEffect(() => {
    if (props.defaultValue !== undefined && props.value === undefined) {
      props.onChange(props.defaultValue);
      setIsValid(validate(props.defaultValue));
    }
  }, [props, validate]);

  useEffect(() => {
    if (props.optional) {
      setIsValid(true);
      setTouched(true);
    }
  }, [props.optional]);

  return (
    <div className="py-2">
      {props.label && (
        <div className="flex flex-col gap-1.5 mb-2">
          <Label htmlFor={props.id}>{props.label}</Label>
          {props.description && (
            <p className="text-sm text-muted-foreground">{props.description}</p>
          )}
        </div>
      )}
      <MemoryLimitInput
        id={props.id}
        className={isError ? "border-red-500" : ""}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(val) => changeCallback(val)}
      />
      {isError && <FieldError>{props.errorLabel}</FieldError>}
    </div>
  );
};

export default MemoryLimitInputEditGameServer;
