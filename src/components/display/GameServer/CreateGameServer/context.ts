import { createContext } from "react";
import type { GameDto, GameServerCreationDto, TemplateEntity } from "@/api/generated/model";

export const GENERIC_GAME_PLACEHOLDER_VALUE = -1;

export type AutoCompleteSelections = {
  [key: string]: {
    label: string;
    value: unknown;
    additionalInformation?: string;
    data?: unknown;
  };
};

export type UtilState = {
  gameEntity?: GameDto;
  selectedTemplate?: TemplateEntity | null;
  templateVariables?: Record<string, string | number | boolean>;
  templateApplied?: boolean;
  autoCompleteSelections?: AutoCompleteSelections;
};

export type GameServerCreationFormState = Omit<
  Partial<GameServerCreationDto>,
  "docker_hardware_limits"
> & {
  docker_max_cpu?: string;
  docker_max_memory?: string;
};

export interface CreationState {
  gameServerState: GameServerCreationFormState;
  utilState: UtilState;
}

export interface GameServerCreationContext {
  creationState: CreationState;
  setGameServerState: <K extends keyof GameServerCreationFormState>(
    gameStateKey: K,
  ) => (value: GameServerCreationFormState[K]) => void;
  setCurrentPageValid: (isValid: boolean) => void;
  triggerNextPage: () => void;
  setUtilState: <K extends keyof UtilState>(utilStateKey: K) => (value: UtilState[K]) => void;
  isLastPage: boolean;
  isPageValid: { [key: number]: boolean };
  currentPage: number;
}

export const GameServerCreationContext = createContext<GameServerCreationContext>({
  creationState: { gameServerState: {}, utilState: { gameEntity: undefined } },
  setGameServerState: () => () => {},
  setCurrentPageValid: () => {},
  triggerNextPage: () => {},
  setUtilState: () => () => {},
  isLastPage: false,
  isPageValid: {},
  currentPage: 0,
});
