import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { stopService } from "@/api/generated/backend-api.ts";
import { startServiceSse } from "@/api/sse.ts";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";

const useServerInteractions = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const startServer = async (gameServerId: string, includeToastNotification?: boolean) => {
    try {
      const startPromise = startServiceSse(gameServerId);
      dispatch(gameServerSliceActions.awaitPendingUpdate(gameServerId));
      const res = await startPromise;
      if (includeToastNotification) {
        const hostname = window.location.hostname;
        const listeningOn = res.ports.map((num) => (
          <div key={num}>
            <a
              className="text-link"
              href={`http://${hostname}:${num}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              - {hostname}:{num}
            </a>
          </div>
        ));

        toast.success(
          <div style={{ userSelect: "text" }}>
            <div>{t("toasts.serverStartSuccess")}</div>
            {listeningOn}
          </div>,
          {
            duration: 5000,
          },
        );
      }
    } catch (e) {
      toast.error(t("toasts.serverStartError", { error: e }), { duration: 5000 });
    }
  };

  const stopServer = async (gameServerId: string, includeToastNotification?: boolean) => {
    try {
      const stopPromise = stopService(gameServerId);
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
