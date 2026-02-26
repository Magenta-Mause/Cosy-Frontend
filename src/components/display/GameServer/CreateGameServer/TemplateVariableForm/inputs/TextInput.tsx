import { Button } from "@components/ui/button.tsx";
import { FieldLabel } from "@components/ui/field";
import Icon from "@components/ui/Icon.tsx";
import { Input } from "@components/ui/input";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import infoIcon from "@/assets/icons/info.svg?raw";
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
              <Button variant={"ghost"} tabIndex={0} className={"p-0! m-0!"}>
                <Icon src={infoIcon} className="size-4" variant="foreground" />
              </Button>
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
