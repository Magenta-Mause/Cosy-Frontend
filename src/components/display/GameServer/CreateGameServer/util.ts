import type { HTMLInputTypeAttribute } from "react";

// All keys must be a key of HTMLInputTypeAttribute
const InputType = {
  text: "text",
  number: "number",
  email: "email",
} as const satisfies Record<string, HTMLInputTypeAttribute>;
export type InputType = (typeof InputType)[keyof typeof InputType];

export function preProcessInputValue(value: string, inputType: InputType): string | number {
  if (inputType === InputType.number) {
    return Number(value);
  }
  return value;
}
