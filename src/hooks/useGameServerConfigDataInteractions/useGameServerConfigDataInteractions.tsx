import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useUpdateRconConfiguration } from "@/api/generated/backend-api.ts";
import type { RCONConfiguration } from "@/api/generated/model";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";
import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useGameServerConfigDataInteractions = () => {
  const dispatch = useDispatch();
  const { t } = useTranslationPrefix("toasts");

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

  return {
    updateRconConfiguration,
  };
};

export default useGameServerConfigDataInteractions;
