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
  inputType?: React.ComponentProps<"input">["type"];
  inputMode?: React.ComponentProps<"input">["inputMode"];
  step?: React.ComponentProps<"input">["step"];
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
        error={isError ? props.errorLabel : undefined}
        placeholder={props.placeholder}
        value={props.value ?? ""}
        onChange={(e) => changeCallback(e.target.value)}
        disabled={props.disabled}
        type={props.inputType}
        inputMode={props.inputMode}
        step={props.step}
      />
    </div>
  );
};

export default InputFieldEditGameServer;
