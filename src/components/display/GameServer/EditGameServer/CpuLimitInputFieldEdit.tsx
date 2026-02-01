import InputFieldEditGameServer from "@components/display/GameServer/EditGameServer/InputFieldEditGameServer.tsx";
import * as z from "zod";

interface CpuLimitInputFieldEditProps {
  label: string;
  description: string;
  errorLabel: string;
  placeholder: string;
  optional: boolean;
  value: number | undefined;
  onChange: (value: string | null) => void;
}

const CpuLimitInputFieldEdit = ({
  label,
  description,
  errorLabel,
  placeholder,
  optional,
  value,
  onChange,
}: CpuLimitInputFieldEditProps) => {
  return (
    <InputFieldEditGameServer
      validator={z.string().min(1)}
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
