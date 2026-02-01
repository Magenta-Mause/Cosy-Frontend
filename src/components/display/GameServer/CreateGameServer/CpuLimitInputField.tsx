import GenericGameServerCreationInputField from "@components/display/GameServer/CreateGameServer/GenericGameServerCreationInputField.tsx";
import * as z from "zod";

interface CpuLimitInputFieldProps {
  label: string;
  description: string;
  errorLabel: string;
  placeholder: string;
  optional: boolean;
}

const CpuLimitInputField = ({
  label,
  description,
  errorLabel,
  placeholder,
  optional,
}: CpuLimitInputFieldProps) => {
  return (
    <GenericGameServerCreationInputField
      attribute="docker_max_cpu"
      validator={z.coerce.number().min(0)}
      placeholder={placeholder}
      optional={optional}
      inputType="number"
      inputMode="decimal"
      step="any"
      label={label}
      description={description}
      errorLabel={errorLabel}
    />
  );
};

export default CpuLimitInputField;
