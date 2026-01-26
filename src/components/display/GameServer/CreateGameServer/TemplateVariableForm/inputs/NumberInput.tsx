import { FieldError, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import type { VariableInputProps } from "./types";

export default function NumberInput({
  variable,
  value,
  showError,
  errorMessage,
  onValueChange,
  onEnterKey,
  t,
}: VariableInputProps) {
  const placeholder = variable.placeholder ?? "";

  return (
    <div key={placeholder} className="space-y-2">
      <FieldLabel htmlFor={placeholder} className="text-lg">
        {variable.name}
      </FieldLabel>
      <Input
        id={placeholder}
        type="number"
        placeholder={variable.placeholder}
        value={String(value ?? "")}
        onChange={(e) => onValueChange(variable, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEnterKey();
          }
        }}
        className={showError ? "border-red-500" : ""}
      />
      {variable.example && (
        <FieldLabel htmlFor={placeholder} className="text-muted-foreground text-sm">
          {t("example")}: {variable.example}
        </FieldLabel>
      )}
      {showError && (
        <FieldError>{errorMessage ? t(errorMessage) : t("validationError")}</FieldError>
      )}
    </div>
  );
}
