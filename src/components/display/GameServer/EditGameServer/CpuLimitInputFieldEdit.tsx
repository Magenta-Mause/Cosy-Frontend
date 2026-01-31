import InputFieldEditGameServer from "@components/display/GameServer/EditGameServer/InputFieldEditGameServer.tsx";
import * as z from "zod";

interface CpuLimitInputFieldEditProps {
  label: string;
  description: string;
  errorLabel: string;
  placeholder: string;
  optional: boolean;
  maxLimit: number | null;
  value: number | undefined;
  onChange: (value: string | null) => void;
}

const CpuLimitInputFieldEdit = ({
  label,
  description,
  errorLabel,
  placeholder,
  optional,
  maxLimit,
  value,
  onChange,
}: CpuLimitInputFieldEditProps) => {
  const descriptionWithLimit =
    maxLimit !== null ? `${description} (Your limit: ${maxLimit} cores)` : description;

  return (
    <InputFieldEditGameServer
      validator={z.string().min(1)}
      placeholder={placeholder}
      label={label}
      description={descriptionWithLimit}
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
