import {Button} from "@components/ui/button.tsx";
import {DialogContent, DialogFooter, DialogMain, DialogTitle} from "@components/ui/dialog.tsx";
import {createContext, type Dispatch, type SetStateAction, useCallback, useState} from "react";
import {useTranslation} from "react-i18next";
import {parse as parseCommand} from "shell-quote";
import type {GameDto, GameServerCreationDto} from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import Step1 from "./CreationSteps/Step1.tsx";
import Step2 from "./CreationSteps/Step2.tsx";
import Step3 from "./CreationSteps/Step3.tsx";

type UtilState = {
  gameEntity?: GameDto;
};

interface CreationState {
  gameServerState: Partial<GameServerCreationDto>;
  utilState: UtilState;
}

export interface GameServerCreationContext {
  creationState: CreationState;
  setGameServerState: <K extends keyof GameServerCreationDto>(
    gameStateKey: K,
  ) => (value: GameServerCreationDto[K]) => void;
  setCurrentPageValid: (isValid: boolean) => void;
  triggerNextPage: () => void;
  setUtilState: <K extends keyof UtilState>(utilStateKey: K) => (value: UtilState[K]) => void;
}

export const GameServerCreationContext = createContext<GameServerCreationContext>({
  creationState: {gameServerState: {}, utilState: {gameEntity: undefined}},
  setGameServerState: () => () => {
  },
  setCurrentPageValid: () => {
  },
  triggerNextPage: () => {
  },
  setUtilState: () => () => {
  },
});

const PAGES = [<Step1 key="step1"/>, <Step2 key="step2"/>, <Step3 key="step3"/>];

interface Props {
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const CreateGameServerModal = ({setOpen}: Props) => {
  const {createGameServer} = useDataInteractions();
  const [creationState, setCreationState] = useState<CreationState>({
    gameServerState: {},
    utilState: {},
  });
  const [isPageValid, setPageValid] = useState<{ [key: number]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const {t} = useTranslation();
  const isLastPage = currentPage === PAGES.length - 1;

  const handleNextPage = useCallback(() => {
    if (isLastPage) {
      const gameServerCreationObject = {
        ...creationState.gameServerState,
        game_uuid: creationState.gameServerState.game_uuid != "0" ? creationState.gameServerState.game_uuid : undefined,
        execution_command: creationState.gameServerState.execution_command ? parseCommand(
          creationState.gameServerState.execution_command as unknown as string,
        ) : undefined,
        port_mappings: creationState.gameServerState.port_mappings?.map((portMapping) => ({
          ...portMapping,
        }))
      };
      createGameServer(gameServerCreationObject as GameServerCreationDto);
      setCreationState({gameServerState: {}, utilState: {}});
      setPageValid({});
      setCurrentPage(0);
      setOpen(false);
      return;
    }

    setCurrentPage((currentPage) => currentPage + 1);
  }, [createGameServer, creationState, isLastPage, setOpen]);

  const triggerNextPage = useCallback(() => {
    if (isPageValid[currentPage]) {
      handleNextPage();
    }
  }, [handleNextPage, isPageValid, currentPage]);

  const setCurrentPageValid = useCallback(
    (isValid: boolean) => {
      setPageValid((prev) => ({...prev, [currentPage]: isValid}));
    },
    [currentPage],
  );

  const setGameServerState: GameServerCreationContext["setGameServerState"] = useCallback(
    (gameStateKey) => (value) =>
      setCreationState((prev) => ({
        ...prev,
        gameServerState: {...prev.gameServerState, [gameStateKey]: value},
      })),
    [],
  );

  const setUtilState: GameServerCreationContext["setUtilState"] = useCallback(
    (utilStateKey) => (value) =>
      setCreationState((prev) => ({
        ...prev,
        utilState: {...prev.utilState, [utilStateKey]: value},
      })),
    [],
  );

  return (
    <DialogContent className="sm:max-w-150 max-h-[80vh] p-0">
      <GameServerCreationContext.Provider
        value={{
          setGameServerState,
          creationState,
          setCurrentPageValid,
          triggerNextPage,
          setUtilState,
        }}
      >
        <div className="flex flex-col max-h-[80vh] p-4">
          <DialogTitle>
            {t(`components.CreateGameServer.steps.step${currentPage + 1}.title`)}
          </DialogTitle>
          <DialogMain className="overflow-auto p-6">
            <div>{PAGES[currentPage]}</div>
          </DialogMain>
          <DialogFooter className="shrink-0 pt-4">
            <div className="flex-none w-40 flex items-start justify-center">
              {creationState.utilState.gameEntity?.logo_url && (
                <img
                  src={creationState.utilState.gameEntity.logo_url}
                  alt="Selected game logo"
                  className="max-h-36 w-auto object-contain rounded-md"
                />
              )}
            </div>
            {currentPage > 0 && (
              <Button
                variant="secondary"
                onClick={() => setCurrentPage((currentPage) => currentPage - 1)}
                disabled={currentPage === 0}
              >
                {t("components.CreateGameServer.backButton")}
              </Button>
            )}
            <Button
              type="button"
              variant="primary"
              onClick={handleNextPage}
              className={
                isLastPage
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500"
                  : ""
              }
              disabled={!isPageValid[currentPage]}
            >
              {isLastPage
                ? t("components.CreateGameServer.createServerButton")
                : t("components.CreateGameServer.nextStepButton")}
            </Button>
          </DialogFooter>
        </div>
      </GameServerCreationContext.Provider>
    </DialogContent>
  );
};

export default CreateGameServerModal;
