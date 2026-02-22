import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useUpdateDesign, useUpdateRconConfiguration } from "@/api/generated/backend-api.ts";
import type {
  GameServerDesignUpdateDtoDesign,
  GameServerDto,
  RCONConfiguration,
} from "@/api/generated/model";
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

  const { mutateAsync: updateGameServerDesignMutateAsync } = useUpdateDesign({
    mutation: {
      onSuccess: (updatedGameServer: GameServerDto) => {
        dispatch(gameServerSliceActions.updateGameServer(updatedGameServer));
        toast.success(t("updateGameServerSuccess"));
      },
      onError: (err: unknown) => {
        toast.error(t("updateGameServerError"));
        throw err;
      },
    },
  });

  const updateGameServerDesign = async (uuid: string, design: GameServerDesignUpdateDtoDesign) => {
    return await updateGameServerDesignMutateAsync({
      uuid,
      data: { design },
    });
  };

  return {
    updateRconConfiguration,
    updateGameServerDesign,
  };
};

export default useGameServerConfigDataInteractions;
