import {InputType} from "@components/display/GameServer/CreateGameServer/KeyValueInput.tsx";

export const preProcessValue = (value: string, inputType: InputType) => {
  if (inputType === InputType.number) {
    return Number(value);
  }
  return value;
};
