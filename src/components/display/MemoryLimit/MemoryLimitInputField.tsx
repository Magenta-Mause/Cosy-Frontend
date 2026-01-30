import { MemoryLimitInput } from "@components/display/MemoryLimit/MemoryLimitInput.tsx";
import { FieldError } from "@components/ui/field.tsx";
import { Label } from "@components/ui/label.tsx";
import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import type { ZodType } from "zod";

const MemoryLimitInputField = (props: {
  id: string;
  value?: string | number | null;
  onChange: (value: string | null) => void;
  validator: ZodType;
  placeholder: string;
  errorLabel: string;
  label?: string;
  description?: string;
  optional?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  maxLimit?: number | string | null;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onValidityChange?: (isValid: boolean) => void;
  onTouchedChange?: (touched: boolean) => void;
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

  const reportValidity = useCallback(
    (valid: boolean, isTouched: boolean) => {
      props.onValidityChange?.(valid);
      props.onTouchedChange?.(isTouched);
    },
    [props.onTouchedChange, props.onValidityChange],
  );

  const changeCallback = useCallback(
    (value: string) => {
      setTouched(true);

      if (value === "" && props.defaultValue !== undefined) {
        props.onChange(props.defaultValue);
        const valid = validate(props.defaultValue);
        setIsValid(valid);
        reportValidity(valid, true);
        return;
      }

      const valToSend = value === "" ? null : value;
      props.onChange(valToSend);
      const valid = validate(valToSend);
      setIsValid(valid);
      reportValidity(valid, true);
    },
    [props.defaultValue, props.onChange, reportValidity, validate],
  );

  useEffect(() => {
    if (props.defaultValue !== undefined && (props.value === undefined || props.value === null)) {
      props.onChange(props.defaultValue);
      const valid = validate(props.defaultValue);
      setIsValid(valid);
      reportValidity(valid, touched);
    }
  }, [props.defaultValue, props.onChange, props.value, reportValidity, touched, validate]);

  useEffect(() => {
    if (props.optional) {
      setIsValid(true);
      setTouched(true);
      reportValidity(true, true);
    }
  }, [props.optional, reportValidity]);

  useEffect(() => {
    if (!props.onTouchedChange && !props.onValidityChange) return;

    const isEmpty = props.value === null || props.value === undefined || props.value === "";
    const isTouched = props.optional ? true : !isEmpty;
    const valid = isEmpty ? !!props.optional : validate(props.value);
    reportValidity(valid, isTouched);
  }, [props.value, props.optional, validate, reportValidity, props.onTouchedChange, props.onValidityChange]);

  const formatLimit = (limit: number | string | null | undefined) => {
    if (limit === null) return "∞";
    if (limit === undefined) return "";
    if (typeof limit === "string") return limit;
    return `${limit} MiB`;
  };

  return (
    <div className="py-2">
      {props.label && (
        <Label htmlFor={props.id} className="pb-2 font-bold">
          {props.label}
        </Label>
      )}
      <MemoryLimitInput
        id={props.id}
        className={isError ? "border-red-500" : ""}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(val) => changeCallback(val)}
        onKeyDown={props.onKeyDown}
      />
      {(props.description || props.maxLimit !== undefined) && (
        <Label htmlFor={props.id} className="pt-2 text-muted-foreground">
          {props.description}
          {props.maxLimit !== undefined && <span>(limit{":"} {formatLimit(props.maxLimit)})</span>}
        </Label>
      )}
      {isError && <FieldError>{props.errorLabel}</FieldError>}
    </div>
  );
};

export default MemoryLimitInputField;
