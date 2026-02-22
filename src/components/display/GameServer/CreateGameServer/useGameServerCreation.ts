import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useState } from "react";
import { parse as parseCommand } from "shell-quote";
import type { GameServerCreationDto, GameServerDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import {
  type CreationState,
  type GameServerCreationContext,
  GENERIC_GAME_PLACEHOLDER_VALUE,
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
  showConfirmDialog: boolean;
  isCreating: boolean;
  showSuccessDialog: boolean;
  setShowSuccessDialog: Dispatch<SetStateAction<boolean>>;
  successInfo: { server: GameServerDto } | null;
  isLastPage: boolean;
  setGameServerState: GameServerCreationContext["setGameServerState"];
  setUtilState: GameServerCreationContext["setUtilState"];
  setCurrentPageValid: GameServerCreationContext["setCurrentPageValid"];
  triggerNextPage: GameServerCreationContext["triggerNextPage"];
  handleConfirmReapply: () => void;
  handleCancelReapply: () => void;
  handleConfirmCreate: () => Promise<void>;
  handleCancelConfirm: () => void;
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    server: GameServerDto;
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

  const handleConfirmCreate = useCallback(async () => {
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

    setIsCreating(true);
    try {
      const createdGameServer = await createGameServer(gameServerCreationObject);
      setShowConfirmDialog(false);
      setIsCreating(false);
      setCreationState({
        gameServerState: { design: Math.random() < 0.5 ? "HOUSE" : "CASTLE" },
        utilState: {},
      });
      setPageValid({});
      setCurrentPage(0);
      setOpen(false);
      setSuccessInfo({ server: createdGameServer });
      setShowSuccessDialog(true);
    } catch {
      // error already toasted by the hook; keep dialog open for retry
      setIsCreating(false);
    }
  }, [createGameServer, setOpen, creationState.gameServerState]);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirmDialog(false);
  }, []);

  const handleNextPage = useCallback(async () => {
    if (isLastPage) {
      setShowConfirmDialog(true);
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
  }, [currentPage, applyTemplateToState, creationState.utilState, isLastPage]);

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
    showConfirmDialog,
    isCreating,
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
    handleConfirmCreate,
    handleCancelConfirm,
  };
};

export default useGameServerCreation;
