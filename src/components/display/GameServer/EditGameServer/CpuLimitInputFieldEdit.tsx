import InputFieldEditGameServer from "@components/display/GameServer/EditGameServer/InputFieldEditGameServer.tsx";
import type * as z from "zod";

interface CpuLimitInputFieldEditProps {
  label: string;
  description: string;
  errorLabel: string;
  placeholder: string;
  optional: boolean;
  value: number | undefined;
  onChange: (value: string | null) => void;
  validator: z.ZodType;
}

const CpuLimitInputFieldEdit = ({
  label,
  description,
  errorLabel,
  placeholder,
  optional,
  value,
  onChange,
  validator,
}: CpuLimitInputFieldEditProps) => {
  return (
    <InputFieldEditGameServer
      validator={validator}
      placeholder={placeholder}
      label={label}
      description={description}
      errorLabel={errorLabel}
      value={value}
      onChange={(v) => {
        if (typeof v === "string" && v === "") {
          onChange(null);
        } else {
          onChange(v as string);
        }
      }}
      optional={optional}
      inputType="number"
      inputMode="decimal"
      step="any"
    />
  );
};

export default CpuLimitInputFieldEdit;
