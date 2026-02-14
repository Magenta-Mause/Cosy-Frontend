import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  type CreateGameServerMutationBody,
  getGetAllGameServersQueryKey,
  getGetAllUserInvitesQueryKey,
  type UpdateGameServerMutationBody,
  useCreateGameServer,
  useCreateGameServerAccessGroup,
  useCreateInvite,
  useDeleteGameServerAccessGroup,
  useDeleteGameServerById,
  useRevokeInvite,
  useUpdateGameServer,
  useUpdateGameServerAccessGroups,
  useUpdateRconConfiguration,
} from "@/api/generated/backend-api.ts";
import type {
  AccessGroupCreationDto,
  AccessGroupUpdateDto,
  RCONConfiguration,
  UserInviteCreationDto,
} from "@/api/generated/model";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";
import { userInviteSliceActions } from "@/stores/slices/userInviteSlice.ts";
import type { InvalidRequestError } from "@/types/errors.ts";
import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useDataInteractions = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslationPrefix("toasts");

  const { mutateAsync: deleteGameServerById } = useDeleteGameServerById({
    mutation: {
      onSuccess: (_data, variables) => {
        dispatch(gameServerSliceActions.removeGameServer(variables.uuid));
        toast.success(t("deleteGameServerSuccess"));
      },
      onError: (err) => {
        toast.error(t("deleteGameServerError"));
        // rethrow error to allow for individual error handling
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

  // Invite Creation
  const { mutateAsync: mutateCreateInvite } = useCreateInvite({
    mutation: {
      onSuccess: (data) => {
        dispatch(userInviteSliceActions.addInvite(data));
        toast.success(t("inviteCreatedSuccess"));
      },
      onError: (err) => {
        const typedError = err as InvalidRequestError;
        const errorData = typedError.response?.data.data;
        let errorMessage = "Unknown Error";
        if (errorData && typeof errorData === "object") {
          const error = Object.entries(errorData)[0];
          errorMessage = error ? error[1] : "Unknown Error";
        } else if (errorData) {
          errorMessage = errorData;
        }
        toast.error(t("inviteCreateError", { error: errorMessage }));
        throw err;
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: getGetAllUserInvitesQueryKey(),
        });
      },
    },
  });

  const createInvite = async (data: UserInviteCreationDto) => {
    return await mutateCreateInvite({ data });
  };

  // Invite Revocation
  const { mutateAsync: mutateRevokeInvite } = useRevokeInvite({
    mutation: {
      onSuccess: (_data, variables) => {
        dispatch(userInviteSliceActions.removeInvite(variables.uuid));
        toast.success(t("toasts.inviteRevokedSuccess"));
      },
      onError: (err) => {
        toast.error(t("toasts.inviteRevokeError"));
        throw err;
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: getGetAllUserInvitesQueryKey(),
        });
      },
    },
  });

  const revokeInvite = async (uuid: string) => {
    await mutateRevokeInvite({ uuid });
  };

  const { mutateAsync: createGameServerMutateAsync } = useCreateGameServer({
    mutation: {
      onSuccess: (data) => {
        dispatch(gameServerSliceActions.addGameServer(data));
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

  const { mutateAsync: updateRconConfigurationMutateAsync } = useUpdateRconConfiguration({
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

  const updateRconConfiguration = async (uuid: string, rconConfiguration: RCONConfiguration) => {
    return await updateRconConfigurationMutateAsync({
      uuid,
      data: rconConfiguration,
    });
  };

  const { mutateAsync: createGameServerAccessGroupMutateAsync } = useCreateGameServerAccessGroup({
    mutation: {
      onSuccess: (createdAccessGroup) => {
        dispatch(
          gameServerSliceActions.addGameServerAccessGroup({
            gameServerUuid: createdAccessGroup.game_server_uuid,
            accessGroup: createdAccessGroup,
          }),
        );
        toast.success(t("updateGameServerSuccess"));
      },
      onError: (err) => {
        toast.error(t("updateGameServerError"));
        throw err;
      },
    },
  });

  const createGameServerAccessGroup = async (
    gameServerUuid: string,
    accessGroupCreationDto: AccessGroupCreationDto,
  ) => {
    return await createGameServerAccessGroupMutateAsync({
      gameServerUuid: gameServerUuid,
      data: accessGroupCreationDto,
    });
  };

  const { mutateAsync: deleteGameServerAccessGroupMutateAsync } = useDeleteGameServerAccessGroup({
    mutation: {
      onSuccess: (_, props) => {
        dispatch(
          gameServerSliceActions.removeGameServerAccessGroup({
            gameServerUuid: props.gameServerUuid,
            accessGroupUuid: props.accessGroupUuid,
          }),
        );
        toast.success(t("updateGameServerSuccess"));
      },
      onError: (err) => {
        toast.error(t("updateGameServerError"));
        throw err;
      },
    },
  });

  const deleteGameServerAccessGroup = async (gameServerUuid: string, accessGroupUuid: string) => {
    return await deleteGameServerAccessGroupMutateAsync({
      gameServerUuid: gameServerUuid,
      accessGroupUuid: accessGroupUuid,
    });
  };

  const { mutateAsync: updateGameServerAccessGroupsMutateAsync } = useUpdateGameServerAccessGroups({
    mutation: {
      onSuccess: (updatedAccessGroups, props) => {
        dispatch(
          gameServerSliceActions.updateGameServerAccessGroups({
            gameServerUuid: props.gameServerUuid,
            newAccessGroups: updatedAccessGroups,
          }),
        );
        toast.success(t("updateGameServerSuccess"));
      },
      onError: (err) => {
        toast.error(t("updateGameServerError"));
        throw err;
      },
    },
  });

  const updateGameServerAccessGroups = async (
    gameServerUuid: string,
    accessGroupUuid: string,
    accessGroupUpdateDto: AccessGroupUpdateDto,
  ) => {
    return await updateGameServerAccessGroupsMutateAsync({
      gameServerUuid: gameServerUuid,
      accessGroupUuid: accessGroupUuid,
      data: accessGroupUpdateDto,
    });
  };

  return {
    deleteGameServer,
    createInvite,
    revokeInvite,
    createGameServer,
    updateGameServer,
    updateRconConfiguration,
    createGameServerAccessGroup,
    deleteGameServerAccessGroup,
    updateGameServerAccessGroups,
  };
};

export default useDataInteractions;
