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
import { useCallback, useState } from "react";
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
}

export default function TemplateVariableForm({
  template,
  onValueChange,
  initialValues = {},
}: TemplateVariableFormProps) {
  const { t } = useTranslationPrefix("components.TemplateVariableForm");

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

  const validateValue = useCallback((variable: Variable, value: string | number | boolean): boolean => {
    const stringValue = String(value);

    // Check if empty (and not optional based on default value)
    if (stringValue === "" && variable.default_value === undefined) {
      return false;
    }

    // Validate based on type
    switch (variable.type) {
      case "number":
        return !isNaN(Number(stringValue));
      case "boolean":
        return stringValue === "true" || stringValue === "false";
      case "select":
        return variable.options?.includes(stringValue) ?? false;
      case "string":
      default:
        // Validate regex if provided
        if (variable.regex) {
          try {
            const regex = new RegExp(variable.regex);
            return regex.test(stringValue);
          } catch {
            return true; // Invalid regex, skip validation
          }
        }
        return true;
    }
  }, []);

  const handleValueChange = useCallback(
    (variable: Variable, newValue: string | number | boolean) => {
      const placeholder = variable.placeholder ?? "";
      const isValid = validateValue(variable, newValue);

      setVariableStates((prev) => ({
        ...prev,
        [placeholder]: {
          value: newValue,
          isValid,
          touched: true,
        },
      }));

      if (isValid) {
        // Convert value to correct type before calling callback
        let typedValue: string | number | boolean = newValue;
        if (variable.type === "number") {
          typedValue = Number(newValue);
        } else if (variable.type === "boolean") {
          typedValue = String(newValue) === "true";
        }
        onValueChange(placeholder, typedValue);
      }
    },
    [validateValue, onValueChange]
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
            {showError && <FieldError>{t("validationError")}</FieldError>}
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
            {showError && <FieldError>{t("validationError")}</FieldError>}
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
              className={showError ? "border-red-500" : ""}
            />
            {variable.example && (
              <FieldLabel htmlFor={placeholder} className="text-muted-foreground text-sm">
                {t("example")}: {variable.example}
              </FieldLabel>
            )}
            {showError && <FieldError>{t("validationError")}</FieldError>}
          </div>
        );

      case "string":
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
              className={showError ? "border-red-500" : ""}
            />
            {variable.example && (
              <FieldLabel htmlFor={placeholder} className="text-muted-foreground text-sm">
                {t("example")}: {variable.example}
              </FieldLabel>
            )}
            {showError && <FieldError>{t("validationError")}</FieldError>}
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
        {!template || !hasVariables ? (
          <div className="text-muted-foreground text-center py-8">{t("noTemplateSelected")}</div>
        ) : (
          <div className="space-y-6">
            {template.variables?.map((variable) => renderVariableInput(variable))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
