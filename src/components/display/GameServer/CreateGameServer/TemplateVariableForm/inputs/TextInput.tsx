import { FieldError, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import type { VariableInputProps } from "./types";

export default function TextInput({
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
        type="text"
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
      {variable.regex && (
        <FieldLabel htmlFor={placeholder} className="text-muted-foreground text-sm">
          {t("pattern")}: <code className="text-xs">{variable.regex}</code>
        </FieldLabel>
      )}
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
