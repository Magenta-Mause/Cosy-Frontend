import { GameServerCreationContext } from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { FieldError, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useCallback, useContext, useState } from "react";
import type { TemplateEntity, Variable } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

interface TemplateVariableFormProps {
  template: TemplateEntity | null;
  onValueChange: (placeholder: string, value: string | number | boolean) => void;
  initialValues?: Record<string, string | number | boolean>;
}

interface VariableState {
  value: string | number | boolean;
  isValid: boolean;
  touched: boolean;
  errorMessage?: string;
}

export default function TemplateVariableForm({
  template,
  onValueChange,
  initialValues = {},
}: TemplateVariableFormProps) {
  const { t } = useTranslationPrefix("components.TemplateVariableForm");
  const { triggerNextPage } = useContext(GameServerCreationContext);

  // Initialize state for all variables
  const [variableStates, setVariableStates] = useState<Record<string, VariableState>>(() => {
    const states: Record<string, VariableState> = {};
    template?.variables?.forEach((variable) => {
      const placeholder = variable.placeholder ?? "";
      const initialValue = initialValues[placeholder] ?? variable.default_value ?? "";
      states[placeholder] = {
        value: initialValue,
        isValid: true,
        touched: false,
      };
    });
    return states;
  });

  const validateValue = useCallback(
    (
      variable: Variable,
      value: string | number | boolean,
    ): { isValid: boolean; errorMessage?: string } => {
      const stringValue = String(value);

      // Check if empty (and not optional based on default value)
      if (stringValue === "" && variable.default_value === undefined) {
        return { isValid: false, errorMessage: "validationErrorRequired" };
      }

      // Validate based on type
      switch (variable.type) {
        case "number":
          if (Number.isNaN(Number(stringValue))) {
            return { isValid: false, errorMessage: "validationErrorNumber" };
          }
          return { isValid: true };
        case "boolean":
          if (stringValue !== "true" && stringValue !== "false") {
            return { isValid: false, errorMessage: "validationErrorBoolean" };
          }
          return { isValid: true };
        case "select":
          if (!(variable.options?.includes(stringValue) ?? false)) {
            return { isValid: false, errorMessage: "validationErrorSelect" };
          }
          return { isValid: true };
        default:
          // Validate regex if provided (full match)
          if (variable.regex) {
            try {
              const regex = new RegExp(`^(?:${variable.regex})$`);
              if (!regex.test(stringValue)) {
                return { isValid: false, errorMessage: "validationErrorPattern" };
              }
            } catch {
              return { isValid: true }; // Invalid regex, skip validation
            }
          }
          return { isValid: true };
      }
    },
    [],
  );

  const handleValueChange = useCallback(
    (variable: Variable, newValue: string | number | boolean) => {
      const placeholder = variable.placeholder ?? "";
      const validation = validateValue(variable, newValue);

      setVariableStates((prev) => ({
        ...prev,
        [placeholder]: {
          value: newValue,
          isValid: validation.isValid,
          touched: true,
          errorMessage: validation.errorMessage,
        },
      }));

      // Always call onValueChange so parent can validate with current value
      let typedValue: string | number | boolean = newValue;
      if (variable.type === "number" && !Number.isNaN(Number(newValue))) {
        typedValue = Number(newValue);
      } else if (variable.type === "boolean") {
        typedValue = String(newValue) === "true";
      }
      onValueChange(placeholder, typedValue);
    },
    [validateValue, onValueChange],
  );

  const renderVariableInput = (variable: Variable) => {
    const placeholder = variable.placeholder ?? "";
    const state = variableStates[placeholder];
    const showError = state?.touched && !state?.isValid;

    switch (variable.type) {
      case "select":
        return (
          <div key={placeholder} className="space-y-2">
            <FieldLabel htmlFor={placeholder} className="text-lg">
              {variable.name}
            </FieldLabel>
            <Select
              value={String(state?.value ?? "")}
              onValueChange={(value) => handleValueChange(variable, value)}
            >
              <SelectTrigger id={placeholder} className={showError ? "border-red-500" : ""}>
                <SelectValue placeholder={t("selectPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {variable.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {variable.example && (
              <FieldLabel htmlFor={placeholder} className="text-muted-foreground text-sm">
                {t("example")}: {variable.example}
              </FieldLabel>
            )}
            {showError && (
              <FieldError>
                {state?.errorMessage ? t(state.errorMessage) : t("validationError")}
              </FieldError>
            )}
          </div>
        );

      case "boolean":
        return (
          <div key={placeholder} className="space-y-2">
            <FieldLabel htmlFor={placeholder} className="text-lg">
              {variable.name}
            </FieldLabel>
            <Select
              value={String(state?.value ?? "false")}
              onValueChange={(value) => handleValueChange(variable, value)}
            >
              <SelectTrigger id={placeholder} className={showError ? "border-red-500" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">{t("booleanTrue")}</SelectItem>
                <SelectItem value="false">{t("booleanFalse")}</SelectItem>
              </SelectContent>
            </Select>
            {variable.example && (
              <FieldLabel htmlFor={placeholder} className="text-muted-foreground text-sm">
                {t("example")}: {variable.example}
              </FieldLabel>
            )}
            {showError && (
              <FieldError>
                {state?.errorMessage ? t(state.errorMessage) : t("validationError")}
              </FieldError>
            )}
          </div>
        );

      case "number":
        return (
          <div key={placeholder} className="space-y-2">
            <FieldLabel htmlFor={placeholder} className="text-lg">
              {variable.name}
            </FieldLabel>
            <Input
              id={placeholder}
              type="number"
              placeholder={variable.placeholder}
              value={String(state?.value ?? "")}
              onChange={(e) => handleValueChange(variable, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  triggerNextPage();
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
              <FieldError>
                {state?.errorMessage ? t(state.errorMessage) : t("validationError")}
              </FieldError>
            )}
          </div>
        );
      default:
        return (
          <div key={placeholder} className="space-y-2">
            <FieldLabel htmlFor={placeholder} className="text-lg">
              {variable.name}
            </FieldLabel>
            <Input
              id={placeholder}
              type="text"
              placeholder={variable.placeholder}
              value={String(state?.value ?? "")}
              onChange={(e) => handleValueChange(variable, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  triggerNextPage();
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
              <FieldError>
                {state?.errorMessage ? t(state.errorMessage) : t("validationError")}
              </FieldError>
            )}
          </div>
        );
    }
  };

  const hasVariables = template?.variables && template.variables.length > 0;

  return (
    <Card className={"py-5"}>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {!template ? (
          <div className="text-muted-foreground text-center py-8">{t("noTemplateSelected")}</div>
        ) : !hasVariables ? (
          <div className="text-muted-foreground text-center py-8">{t("noVariables")}</div>
        ) : (
          <div className="space-y-6">
            {template.variables?.map((variable) => renderVariableInput(variable))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
