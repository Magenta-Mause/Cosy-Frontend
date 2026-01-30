import { FieldError } from "@components/ui/field.tsx";
import { Input } from "@components/ui/input.tsx";
import { useCallback, useEffect, useState } from "react";
import type { ZodType } from "zod";

const InputFieldEditGameServer = (props: {
  value?: string | number;
  onChange: (value: string | number | undefined) => void;
  validator: ZodType;
  placeholder: string;
  errorLabel: string;
  label?: string;
  description?: string;
  optional?: boolean;
  disabled?: boolean;
}) => {
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const isError = touched && !isValid;

  const validate = useCallback(
    (value: unknown) => {
      if (props.optional) return true;
      return props.validator.safeParse(value).success;
    },
    [props.optional, props.validator],
  );

  const changeCallback = useCallback(
    (value: string) => {
      setTouched(true);

      props.onChange(value);
      setIsValid(validate(value));
    },
    [props, validate],
  );

  useEffect(() => {
    if (props.value !== undefined) {
      setIsValid(validate(props.value));
    }
  }, [props.value, validate]);

  useEffect(() => {
    if (props.optional) {
      setIsValid(true);
      setTouched(true);
    }
  }, [props.optional]);

  return (
    <div className="py-2">
      <Input
        header={props.label}
        description={props.description}
        className={isError ? "border-red-500" : ""}
        placeholder={props.placeholder}
        value={props.value ?? ""}
        onChange={(e) => changeCallback(e.target.value)}
        disabled={props.disabled}
      />
      {isError && <FieldError>{props.errorLabel}</FieldError>}
    </div>
  );
};

export default InputFieldEditGameServer;
