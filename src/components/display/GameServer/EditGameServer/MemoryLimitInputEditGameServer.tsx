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
  maxLimit?: number | string | null;
}) => {
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const isError = touched && !isValid;

  const validate = useCallback(
    (value: unknown) => {
      if (props.optional && (value === null || value === undefined || value === "")) return true;

      if (props.maxLimit !== undefined && props.maxLimit !== null) {
        let maxLimit = props.maxLimit;
        if (typeof maxLimit === "string") {
          const lower = maxLimit.toLowerCase();
          const val = parseFloat(lower);
          if (!Number.isNaN(val)) {
            maxLimit = lower.includes("g") ? val * 1024 : val;
          } else {
            maxLimit = Number.MAX_VALUE;
          }
        }

        let numVal = typeof value === "string" ? parseFloat(value) : Number(value);
        if (typeof value === "string" && !Number.isNaN(numVal)) {
          if (value.endsWith("GiB")) {
            numVal = numVal * 1024;
          }
        }

        if (!Number.isNaN(numVal) && numVal > maxLimit) {
          return false;
        }
      }

      return props.validator.safeParse(value).success;
    },
    [props.optional, props.validator, props.maxLimit],
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

  const formatLimit = (limit: number | string | null | undefined) => {
    if (limit === null) return "∞";
    if (limit === undefined) return "";
    if (typeof limit === "string") return limit;
    if (limit >= 1024 && limit % 1024 === 0) {
      return `${limit / 1024} GiB`;
    }
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
      />
      {(props.description || props.maxLimit !== undefined) && (
        <Label htmlFor={props.id} className="pt-2 text-muted-foreground">
          {props.description}
          {props.maxLimit !== undefined && <span> (Limit: {formatLimit(props.maxLimit)})</span>}
        </Label>
      )}
      {isError && <FieldError>{props.errorLabel}</FieldError>}
    </div>
  );
};

export default MemoryLimitInputEditGameServer;
