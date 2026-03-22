import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import {
  getGetAllUserInvitesQueryKey,
  useChangePasswordByAdmin,
  useChangeRole,
  useCreateInvite,
  useRevokeInvite,
  useUpdateDockerLimits,
  updateRestrictions,
  updateMcRouterRestrictions,
  updatePortRestrictions,
} from "@/api/generated/backend-api.ts";
import type {
  UserDockerLimitsUpdateDto,
  UserInviteCreationDto,
  UserMcRouterRestrictionsUpdateDto,
  UserPortRestrictionsUpdateDto,
  UserRestrictionsUpdateDto,
  UserRoleUpdateDtoRole,
} from "@/api/generated/model";
import { notificationModal } from "@/lib/notificationModal";
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
        notificationModal.error({
          message: t("inviteCreateError", { error: errorMessage }),
          cause: err,
        });
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
      },
      onError: (err) => {
        notificationModal.error({ message: t("toasts.inviteRevokeError"), cause: err });
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

  const { mutateAsync: mutateChangePasswordByAdmin } = useChangePasswordByAdmin({
    mutation: {
      onSuccess: () => {
        notificationModal.success({ message: t("adminChangePasswordSuccess") });
      },
      onError: (err) => {
        notificationModal.error({ message: t("adminChangePasswordError"), cause: err });
        throw err;
      },
    },
  });

  const changePasswordByAdmin = async (uuid: string, newPassword: string) => {
    await mutateChangePasswordByAdmin({ uuid, data: { new_password: newPassword } });
  };

  const updateUserRestrictions = async (uuid: string, data: UserRestrictionsUpdateDto) => {
    try {
      const updatedUser = await updateRestrictions(uuid, data);
      dispatch(userSliceActions.updateUser(updatedUser));
    } catch (err) {
      notificationModal.error({ message: t("updateRestrictionsError"), cause: err as Error });
      throw err;
    }
  };

  const updateUserMcRouterRestrictions = async (
    uuid: string,
    data: UserMcRouterRestrictionsUpdateDto,
  ) => {
    try {
      const updatedUser = await updateMcRouterRestrictions(uuid, data);
      dispatch(userSliceActions.updateUser(updatedUser));
    } catch (err) {
      notificationModal.error({ message: t("updateRestrictionsError"), cause: err as Error });
      throw err;
    }
  };

  const updateUserPortRestrictions = async (
    uuid: string,
    data: UserPortRestrictionsUpdateDto,
  ) => {
    try {
      const updatedUser = await updatePortRestrictions(uuid, data);
      dispatch(userSliceActions.updateUser(updatedUser));
    } catch (err) {
      notificationModal.error({ message: t("updateRestrictionsError"), cause: err as Error });
      throw err;
    }
  };

  return {
    createInvite,
    revokeInvite,
    changeRole,
    updateDockerLimits,
    changePasswordByAdmin,
    updateUserRestrictions,
    updateUserMcRouterRestrictions,
    updateUserPortRestrictions,
  };
};

export default useUserDataInteractions;
