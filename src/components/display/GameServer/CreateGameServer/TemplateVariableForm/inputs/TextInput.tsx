import { FieldLabel } from "@components/ui/field";
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
      <Input
        id={placeholder}
        header={variable.name}
        type="text"
        placeholder={variable.placeholder}
        value={String(value ?? "")}
        onChange={(e) => onValueChange(variable, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEnterKey();
          }
        }}
        error={showError ? (errorMessage ? t(errorMessage) : t("validationError")) : undefined}
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
    </div>
  );
}
