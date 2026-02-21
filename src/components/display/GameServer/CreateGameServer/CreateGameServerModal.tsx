import GameServerCreationNextPageButton from "@components/display/GameServer/CreateGameServer/GameServerCreationButton.tsx";
import HouseBuildingProcess from "@components/display/GameServer/CreateGameServer/HouseBuildingProcess.tsx";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog.tsx";
import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { parse as parseCommand } from "shell-quote";
import type { GameDto, GameServerCreationDto, TemplateEntity } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import Step1 from "./CreationSteps/Step1.tsx";
import Step2 from "./CreationSteps/Step2.tsx";
import Step3 from "./CreationSteps/Step3.tsx";
import { processEscapeSequences } from "./util";
import { applyTemplate } from "./utils/templateSubstitution.ts";

export const GENERIC_GAME_PLACEHOLDER_VALUE = -1;

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
  gameServerState: GameServerCreationFormState;
  utilState: UtilState;
}

export type GameServerCreationFormState = Omit<
  Partial<GameServerCreationDto>,
  "docker_hardware_limits"
> & {
  docker_max_cpu?: string;
  docker_max_memory?: string;
};

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

const PAGES = [<Step1 key="step1" />, <Step2 key="step2" />, <Step3 key="step3" />];

interface Props {
  setOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
}

const CreateGameServerModal = ({ setOpen, isOpen }: Props) => {
  const { createGameServer } = useDataInteractions();
  const [creationState, setCreationState] = useState<CreationState>(() => ({
    gameServerState: { design: Math.random() < 0.5 ? "HOUSE" : "CASTLE" },
    utilState: {},
  }));
  useEffect(() => {
    if (!isOpen) return;
    setCreationState((prev) => ({
      ...prev,
      gameServerState: {
        ...prev.gameServerState,
        design: Math.random() < 0.5 ? "HOUSE" : "CASTLE",
      },
    }));
  }, [isOpen]);
  const [isPageValid, setPageValid] = useState<{ [key: number]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [showReapplyDialog, setShowReapplyDialog] = useState(false);
  const [pendingPageChange, setPendingPageChange] = useState<number | null>(null);
  const { t } = useTranslation();
  const isLastPage = currentPage === PAGES.length - 1;

  const applyTemplateToState = useCallback(() => {
    const { selectedTemplate, templateVariables } = creationState.utilState;

    if (selectedTemplate && templateVariables) {
      const updatedState = applyTemplate(
        selectedTemplate,
        templateVariables,
        creationState.gameServerState,
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
  }, [creationState.utilState, creationState.gameServerState]);

  const handleNextPage = useCallback(() => {
    if (isLastPage) {
      const formState = creationState.gameServerState;

      const gameServerCreationObject: GameServerCreationDto = {
        server_name: formState.server_name ?? "",
        docker_image_name: formState.docker_image_name ?? "",
        docker_image_tag: formState.docker_image_tag ?? "",
        external_game_id:
          formState.external_game_id !== GENERIC_GAME_PLACEHOLDER_VALUE
            ? formState.external_game_id
            : undefined,
        execution_command: formState.execution_command
          ? (parseCommand(formState.execution_command as unknown as string) as string[])
          : undefined,
        port_mappings: formState.port_mappings,
        environment_variables: formState.environment_variables?.map((env) => ({
          ...env,
          value: processEscapeSequences(env.value),
        })),
        volume_mounts: formState.volume_mounts,
        docker_hardware_limits:
          formState.docker_max_cpu || formState.docker_max_memory
            ? {
                docker_max_cpu_cores: formState.docker_max_cpu
                  ? parseFloat(formState.docker_max_cpu)
                  : undefined,
                docker_memory_limit: formState.docker_max_memory || undefined,
              }
            : undefined,
        design: formState.design,
      };
      createGameServer(gameServerCreationObject);
      setCreationState({
        gameServerState: { design: Math.random() < 0.5 ? "HOUSE" : "CASTLE" },
        utilState: {},
      });
      setPageValid({});
      setCurrentPage(0);
      setOpen(false);
      return;
    }

    // Moving from Step 2 to Step 3 - apply template if needed
    if (currentPage === 1) {
      const { selectedTemplate, templateApplied } = creationState.utilState;

      // If template is selected
      if (selectedTemplate) {
        // If template has variables and was already applied, ask user if they want to reapply
        if (
          templateApplied &&
          selectedTemplate.variables &&
          selectedTemplate.variables.length > 0
        ) {
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
  }, [
    createGameServer,
    setOpen,
    currentPage,
    applyTemplateToState,
    creationState.gameServerState,
    creationState.utilState,
    isLastPage,
  ]);

  const triggerNextPage = useCallback(() => {
    if (isPageValid[currentPage]) {
      handleNextPage();
    }
  }, [handleNextPage, isPageValid, currentPage]);

  const setCurrentPageValid = useCallback(
    (isValid: boolean) => {
      setPageValid((prev) => ({ ...prev, [currentPage]: isValid }));
    },
    [currentPage],
  );

  const setGameServerState: GameServerCreationContext["setGameServerState"] = useCallback(
    (gameStateKey) => (value) =>
      setCreationState((prev) => ({
        ...prev,
        gameServerState: { ...prev.gameServerState, [gameStateKey]: value },
      })),
    [],
  );

  const setUtilState: GameServerCreationContext["setUtilState"] = useCallback(
    (utilStateKey) => (value) =>
      setCreationState((prev) => ({
        ...prev,
        utilState: { ...prev.utilState, [utilStateKey]: value },
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
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <GameServerCreationContext.Provider
        value={{
          setGameServerState,
          creationState,
          setCurrentPageValid,
          triggerNextPage,
          setUtilState,
          isLastPage,
          isPageValid,
          currentPage,
        }}
      >
        <DialogPortal>
          <DialogOverlay />

          {/* Full-screen layout container living in the same portal */}
          <div className="fixed inset-0 z-50 items-center justify-center gap-5 flex pr-[7vw]">
            {/* Left side (outside the main dialog box) */}
            <aside>
              <HouseBuildingProcess
                houseType={creationState.gameServerState.design ?? "HOUSE"}
                currentStep={currentPage}
              />
            </aside>

            {/* The actual dialog */}
            <DialogContent
              className="static translate-x-0 translate-y-0 flex min-w-[30vw] max-w-[50vw]"
              asChild
            >
              <DialogHeader>
                <DialogTitle className={"mr-5"}>
                  {t("components.CreateGameServer.steps.title")}
                </DialogTitle>
              </DialogHeader>

              <DialogMain className="overflow-auto p-6">
                <div>{PAGES[currentPage]}</div>
              </DialogMain>
              <DialogFooter className="shrink-0 pt-4">
                {currentPage > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage((currentPage) => currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    {t("components.CreateGameServer.backButton")}
                  </Button>
                )}
                <GameServerCreationNextPageButton />
              </DialogFooter>
            </DialogContent>
          </div>
        </DialogPortal>
      </GameServerCreationContext.Provider>

      <AlertDialog open={showReapplyDialog} onOpenChange={setShowReapplyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("components.CreateGameServer.reapplyDialog.title")}
            </AlertDialogTitle>
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
    </Dialog>
  );
};

export default CreateGameServerModal;
export type { AutoCompleteSelections };
