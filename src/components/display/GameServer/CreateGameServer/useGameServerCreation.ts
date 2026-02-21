import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { parse as parseCommand } from "shell-quote";
import type { GameServerCreationDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import {
  GENERIC_GAME_PLACEHOLDER_VALUE,
  type CreationState,
  type GameServerCreationContext,
  type GameServerCreationFormState,
  type UtilState,
} from "./context.ts";
import { processEscapeSequences } from "./util";
import { applyTemplate } from "./utils/templateSubstitution.ts";

const TOTAL_PAGES = 3;

interface UseGameServerCreationProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
}

interface UseGameServerCreationReturn {
  creationState: CreationState;
  isPageValid: { [key: number]: boolean };
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  showReapplyDialog: boolean;
  showSuccessDialog: boolean;
  setShowSuccessDialog: Dispatch<SetStateAction<boolean>>;
  successInfo: { design: GameServerCreationFormState["design"]; serverName: string } | null;
  isLastPage: boolean;
  setGameServerState: GameServerCreationContext["setGameServerState"];
  setUtilState: GameServerCreationContext["setUtilState"];
  setCurrentPageValid: GameServerCreationContext["setCurrentPageValid"];
  triggerNextPage: GameServerCreationContext["triggerNextPage"];
  handleConfirmReapply: () => void;
  handleCancelReapply: () => void;
}

const useGameServerCreation = ({
  setOpen,
  isOpen,
}: UseGameServerCreationProps): UseGameServerCreationReturn => {
  const { createGameServer } = useDataInteractions();
  const [creationState, setCreationState] = useState<CreationState>(() => ({
    gameServerState: { design: Math.random() < 0.5 ? "HOUSE" : "CASTLE" },
    utilState: {},
  }));
  const [isPageValid, setPageValid] = useState<{ [key: number]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [showReapplyDialog, setShowReapplyDialog] = useState(false);
  const [pendingPageChange, setPendingPageChange] = useState<number | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    design: GameServerCreationFormState["design"];
    serverName: string;
  } | null>(null);

  const isLastPage = currentPage === TOTAL_PAGES - 1;

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

  const handleNextPage = useCallback(async () => {
    if (isLastPage) {
      const formState = creationState.gameServerState;
      const capturedDesign = formState.design ?? "HOUSE";
      const capturedName = formState.server_name ?? "";

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

      try {
        await createGameServer(gameServerCreationObject);
        setCreationState({
          gameServerState: { design: Math.random() < 0.5 ? "HOUSE" : "CASTLE" },
          utilState: {},
        });
        setPageValid({});
        setCurrentPage(0);
        setOpen(false);
        setSuccessInfo({ design: capturedDesign, serverName: capturedName });
        setShowSuccessDialog(true);
      } catch {
        // error already toasted by the hook; keep modal open
      }
      return;
    }

    // Moving from Step 2 to Step 3 - apply template if needed
    if (currentPage === 1) {
      const { selectedTemplate, templateApplied } = creationState.utilState;

      if (selectedTemplate) {
        if (
          templateApplied &&
          selectedTemplate.variables &&
          selectedTemplate.variables.length > 0
        ) {
          setShowReapplyDialog(true);
          setPendingPageChange(currentPage + 1);
          return;
        }

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

  return {
    creationState,
    isPageValid,
    currentPage,
    setCurrentPage,
    showReapplyDialog,
    showSuccessDialog,
    setShowSuccessDialog,
    successInfo,
    isLastPage,
    setGameServerState,
    setUtilState,
    setCurrentPageValid,
    triggerNextPage,
    handleConfirmReapply,
    handleCancelReapply,
  };
};

export default useGameServerCreation;
