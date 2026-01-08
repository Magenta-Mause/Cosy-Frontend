import type { InputType } from "@components/display/GameServer/CreateGameServer/KeyValueInput.tsx";

export const preProcessValue = (value: string, inputType: InputType) => {
  if (inputType === "number") {
    return Number(value);
  }
  return value;
};
