import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { startService, stopService } from "@/api/generated/backend-api.ts";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";
import {GameServerDtoStatus} from "@/api/generated/model";

const useServerInteractions = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const startServer = async (gameServerId: string, includeToastNotification?: boolean) => {
    try {
      const startPromise = startService(gameServerId);
      dispatch(gameServerSliceActions.awaitPendingUpdate(gameServerId));
      await startPromise;
      if (includeToastNotification) {
        toast.success(t("toasts.serverStartSuccess"), {
          duration: 5000,
        });
      }
    } catch (e) {
      const typedE = e as { response: { status: number }};
      if (typedE.response?.status === 400) {
        dispatch(gameServerSliceActions.setGameServerState({ gameServerUuid: gameServerId, serverState: GameServerDtoStatus.FAILED }));
      } else {
        toast.error(t("toasts.serverStartError", { error: e }), { duration: 5000 });
      }
    }
  };

  const stopServer = async (gameServerId: string, includeToastNotification?: boolean) => {
    try {
      const stopPromise = stopService(gameServerId, { timeout: 1000 });
      dispatch(gameServerSliceActions.awaitPendingUpdate(gameServerId));
      await stopPromise;
      if (includeToastNotification) {
        toast.success(t("toasts.serverStopSuccess"));
      }
    } catch (e) {
      toast.error(t("toasts.serverStopError", { error: e }), { duration: 5000 });
    }
  };

  return { startServer, stopServer };
};

export default useServerInteractions;
