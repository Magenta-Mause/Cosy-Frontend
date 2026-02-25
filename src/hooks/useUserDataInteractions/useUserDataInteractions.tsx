import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  getGetAllUserInvitesQueryKey,
  useChangeRole,
  useCreateInvite,
  useRevokeInvite,
  useUpdateDockerLimits,
} from "@/api/generated/backend-api.ts";
import type {
  UserDockerLimitsUpdateDto,
  UserInviteCreationDto,
  UserRoleUpdateDtoRole,
} from "@/api/generated/model";
import { userInviteSliceActions } from "@/stores/slices/userInviteSlice.ts";
import { userSliceActions } from "@/stores/slices/userSlice.ts";
import type { InvalidRequestError } from "@/types/errors.ts";
import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useUserDataInteractions = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslationPrefix("toasts");

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

  const { mutateAsync: mutateChangeRole } = useChangeRole({
    mutation: {
      onSuccess: (updatedUser) => {
        dispatch(userSliceActions.updateUser(updatedUser));
      },
    },
  });

  const changeRole = async (uuid: string, role: UserRoleUpdateDtoRole) => {
    await mutateChangeRole({ uuid, data: { role } });
  };

  const { mutateAsync: mutateUpdateDockerLimits } = useUpdateDockerLimits({
    mutation: {
      onSuccess: (updatedUser) => {
        dispatch(userSliceActions.updateUser(updatedUser));
      },
    },
  });

  const updateDockerLimits = async (uuid: string, data: UserDockerLimitsUpdateDto) => {
    await mutateUpdateDockerLimits({ uuid, data });
  };

  return {
    createInvite,
    revokeInvite,
    changeRole,
    updateDockerLimits,
  };
};

export default useUserDataInteractions;
