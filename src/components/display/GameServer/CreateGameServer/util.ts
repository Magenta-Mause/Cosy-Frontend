// All keys must be a key of HTMLInputTypeAttribute
export enum InputType {
  text = "text",
  number = "number",
}

export function preProcessInputValue(value: string, inputType: InputType): string | number {
  if (inputType === InputType.number) {
    return Number(value);
  }
  return value;
}
