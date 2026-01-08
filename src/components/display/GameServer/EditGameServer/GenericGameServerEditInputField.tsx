import { FieldError } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useState } from "react";
import type { ZodType } from "zod";

type GenericGameServerInputFieldProps = {
  id: string;
  value: string | string[];
  onChange: (value: string) => void;
  validator: ZodType;
  placeholder: string;
  errorLabel: string;
  label?: string;
  description?: string;
};

const GenericGameServerInputField = ({
  id,
  value,
  onChange,
  validator,
  placeholder,
  errorLabel,
  label,
  description,
}: GenericGameServerInputFieldProps) => {
  const [touched, setTouched] = useState(false);
  const isValid = validator.safeParse(value).success;
  const isError = touched && !isValid;

  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}

      <Input
        id={id}
        value={value as string | number | undefined}
        placeholder={placeholder}
        className={isError ? "border-red-500" : ""}
        onChange={(e) => {
          setTouched(true);
          onChange(e.target.value);
        }}
      />

      {description && <DialogDescription>{description}</DialogDescription>}
      {isError && <FieldError>{errorLabel}</FieldError>}
    </div>
  );
};

export default GenericGameServerInputField;
