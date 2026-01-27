import type { Variable } from "@/api/generated/model";

export interface VariableInputProps {
  variable: Variable;
  value: string | number | boolean;
  showError: boolean;
  errorMessage?: string;
  onValueChange: (variable: Variable, value: string | number | boolean) => void;
  onEnterKey: () => void;
  t: (key: string) => string;
}
