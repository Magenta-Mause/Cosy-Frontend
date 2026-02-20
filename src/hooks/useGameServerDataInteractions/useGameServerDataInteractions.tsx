import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  type CreateGameServerMutationBody,
  getGetAllGameServersQueryKey,
  type UpdateGameServerMutationBody,
  useCreateGameServer,
  useDeleteGameServerById,
  useTransferOwnership,
  useUpdateGameServer,
} from "@/api/generated/backend-api.ts";
import type { TransferOwnershipDto } from "@/api/generated/model";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading.tsx";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";

import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useGameServerDataInteractions = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslationPrefix("toasts");
  const { loadGameServer } = useDataLoading();

  const { mutateAsync: deleteGameServerById } = useDeleteGameServerById({
    mutation: {
      onSuccess: (_data, variables) => {
        dispatch(gameServerSliceActions.removeGameServer(variables.uuid));
        toast.success(t("deleteGameServerSuccess"));
      },
      onError: (err) => {
        toast.error(t("deleteGameServerError"));
        throw err;
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: getGetAllGameServersQueryKey(),
        });
      },
    },
  });

  const deleteGameServer = async (uuid: string) => {
    await deleteGameServerById({ uuid });
  };

  const { mutateAsync: createGameServerMutateAsync } = useCreateGameServer({
    mutation: {
      onSuccess: async (data) => {
        await loadGameServer(data.uuid);
        toast.success(t("createGameServerSuccess"));
      },
      onError: (err) => {
        toast.error(t("createGameServerError"));
        throw err;
      },
    },
  });

  const createGameServer = async (data: CreateGameServerMutationBody) => {
    return await createGameServerMutateAsync({ data });
  };

  const { mutateAsync: updateGameServerMutateAsync } = useUpdateGameServer({
    mutation: {
      onSuccess: (updatedGameServer) => {
        dispatch(gameServerSliceActions.updateGameServer(updatedGameServer));
        toast.success(t("updateGameServerSuccess"));
      },
      onError: (err) => {
        toast.error(t("updateGameServerError"));
        throw err;
      },
    },
  });

  const updateGameServer = async (uuid: string, data: UpdateGameServerMutationBody) => {
    return await updateGameServerMutateAsync({
      data,
      uuid,
    });
  };

  const { mutateAsync: transferOwnershipMutateAsync } = useTransferOwnership({
    mutation: {
      onSuccess: (updatedGameServer) => {
        dispatch(gameServerSliceActions.updateGameServer(updatedGameServer));
      },
      onError: (err) => {
        toast.error("Failed to transfer ownership");
        throw err;
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: getGetAllGameServersQueryKey(),
        });
      },
    },
  });

  const transferOwnership = async (uuid: string, newOwnerName: TransferOwnershipDto) => {
    return await transferOwnershipMutateAsync({
      uuid,
      data: newOwnerName,
    });
  };

  return {
    deleteGameServer,
    createGameServer,
    updateGameServer,
    transferOwnership,
  };
};

export default useGameServerDataInteractions;
