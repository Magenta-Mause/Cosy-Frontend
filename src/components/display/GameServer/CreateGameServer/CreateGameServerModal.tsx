import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog.tsx";
import {Button} from "@components/ui/button.tsx";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import {createContext, type Dispatch, type SetStateAction, useCallback, useState} from "react";
import {useTranslation} from "react-i18next";
import {parse as parseCommand} from "shell-quote";
import type {GameDto, GameServerCreationDto, TemplateEntity} from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import Step1 from "./CreationSteps/Step1.tsx";
import Step2 from "./CreationSteps/Step2.tsx";
import Step3 from "./CreationSteps/Step3.tsx";
import {applyTemplate} from "./utils/templateSubstitution.ts";

type AutoCompleteSelections = {
  [key: string]: {
    label: string;
    value: unknown;
    additionalInformation?: string;
    data?: unknown;
  };
};

type UtilState = {
  gameEntity?: GameDto;
  selectedTemplate?: TemplateEntity | null;
  templateVariables?: Record<string, string | number | boolean>;
  templateApplied?: boolean;
  autoCompleteSelections?: AutoCompleteSelections;
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
  const [showReapplyDialog, setShowReapplyDialog] = useState(false);
  const [pendingPageChange, setPendingPageChange] = useState<number | null>(null);
  const {t} = useTranslation();
  const isLastPage = currentPage === PAGES.length - 1;

  const applyTemplateToState = useCallback(() => {
    const {selectedTemplate, templateVariables} = creationState.utilState;

    if (selectedTemplate && templateVariables) {
      const updatedState = applyTemplate(
        selectedTemplate,
        templateVariables,
        creationState.gameServerState
      );

      setCreationState((prev) => ({
        ...prev,
        gameServerState: updatedState,
        utilState: {
          ...prev.utilState,
          templateApplied: true,
        },
      }));
    }
  }, [creationState]);

  const handleNextPage = useCallback(() => {
    if (isLastPage) {
      const gameServerCreationObject = {
        ...creationState.gameServerState,
        game_uuid:
          creationState.gameServerState.external_game_id !== "0"
            ? creationState.gameServerState.external_game_id
            : undefined,
        execution_command: creationState.gameServerState.execution_command
          ? parseCommand(creationState.gameServerState.execution_command as unknown as string)
          : undefined,
        port_mappings: creationState.gameServerState.port_mappings?.map((portMapping) => ({
          ...portMapping,
        })),
      };
      createGameServer(gameServerCreationObject as GameServerCreationDto);
      setCreationState({gameServerState: {}, utilState: {}});
      setPageValid({});
      setCurrentPage(0);
      setOpen(false);
      return;
    }

    // Moving from Step 2 to Step 3 - apply template if needed
    if (currentPage === 1) {
      const {selectedTemplate, templateApplied} = creationState.utilState;

      // If template is selected
      if (selectedTemplate) {
        // If template has variables and was already applied, ask user if they want to reapply
        if (templateApplied && selectedTemplate.variables && selectedTemplate.variables.length > 0) {
          setShowReapplyDialog(true);
          setPendingPageChange(currentPage + 1);
          return;
        }

        // Apply template (first time or no variables)
        if (!templateApplied) {
          applyTemplateToState();
        }
      }
    }

    setCurrentPage((currentPage) => currentPage + 1);
  }, [createGameServer, creationState, isLastPage, setOpen, currentPage, applyTemplateToState]);

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

  const handleConfirmReapply = useCallback(() => {
    applyTemplateToState();
    setShowReapplyDialog(false);
    if (pendingPageChange !== null) {
      setCurrentPage(pendingPageChange);
      setPendingPageChange(null);
    }
  }, [applyTemplateToState, pendingPageChange]);

  const handleCancelReapply = useCallback(() => {
    setShowReapplyDialog(false);
    if (pendingPageChange !== null) {
      setCurrentPage(pendingPageChange);
      setPendingPageChange(null);
    }
  }, [pendingPageChange]);

  return (
    <DialogContent>
      <GameServerCreationContext.Provider
        value={{
          setGameServerState,
          creationState,
          setCurrentPageValid,
          triggerNextPage,
          setUtilState,
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {t(`components.CreateGameServer.steps.step${currentPage + 1}.title`)}
          </DialogTitle>
        </DialogHeader>

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
      </GameServerCreationContext.Provider>

      <AlertDialog open={showReapplyDialog} onOpenChange={setShowReapplyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("components.CreateGameServer.reapplyDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("components.CreateGameServer.reapplyDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="secondary" onClick={handleCancelReapply}>
              {t("components.CreateGameServer.reapplyDialog.cancel")}
            </Button>
            <Button variant="primary" onClick={handleConfirmReapply}>
              {t("components.CreateGameServer.reapplyDialog.confirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogContent>
  );
};

export default CreateGameServerModal;
export type { AutoCompleteSelections };
