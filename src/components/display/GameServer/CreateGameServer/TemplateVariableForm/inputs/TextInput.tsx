import { FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { Info } from "lucide-react";
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
        endDecorator={
          variable.regex ? (
            <TooltipWrapper
              tooltip={`${t("pattern")}: ${variable.regex}`}
              side="top"
              asChild={false}
            >
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipWrapper>
          ) : undefined
        }
      />
      {variable.example && (
        <FieldLabel htmlFor={placeholder} className="text-muted-foreground text-sm">
          {t("example")}: {variable.example}
        </FieldLabel>
      )}
    </div>
  );
}
