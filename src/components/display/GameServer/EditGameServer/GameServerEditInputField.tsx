import { FieldError } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { useState } from "react";
import type { ZodType } from "zod";

type GameServerEditInputFieldProps = {
  id: string;
  value: string | string[];
  onChange: (value: string) => void;
  validator: ZodType;
  placeholder: string;
  errorLabel: string;
  label?: string;
  description?: string;
};

const GameServerEditInputField = ({
  id,
  value,
  onChange,
  validator,
  placeholder,
  errorLabel,
  label,
  description,
}: GameServerEditInputFieldProps) => {
  const [touched, setTouched] = useState(false);
  const isValid = validator.safeParse(value).success;
  const isError = touched && !isValid;

  return (
    <div className="py-2">
      <Input
        header={label}
        description={description}
        id={id}
        value={value as string | number | undefined}
        placeholder={placeholder}
        className={isError ? "border-red-500" : ""}
        onChange={(e) => {
          setTouched(true);
          onChange(e.target.value);
        }}
      />
      {isError && <FieldError>{errorLabel}</FieldError>}
    </div>
  );
};

export default GameServerEditInputField;
