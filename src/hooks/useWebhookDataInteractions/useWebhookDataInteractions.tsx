import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  useCreateWebhook,
  useDeleteWebhook,
  useUpdateWebhook,
} from "@/api/generated/backend-api.ts";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";
import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useWebhookDataInteractions = (gameServerUuid?: string) => {
  const dispatch = useDispatch();
  const { t } = useTranslationPrefix("toasts");

  const { mutateAsync: createWebhook, isPending: isCreatingWebhook } = useCreateWebhook({
    mutation: {
      onSuccess: async (webhook) => {
        toast.success(t("createWebhookSuccess"));
        if (gameServerUuid && webhook) {
          dispatch(gameServerSliceActions.addWebhook({ gameServerUuid, webhook }));
        }
      },
      onError: (error) => {
        console.error("Create webhook error:", error);
        toast.error(t("createWebhookError"));
      },
    },
  });

  const { mutateAsync: updateWebhook } = useUpdateWebhook({
    mutation: {
      onSuccess: async (webhook) => {
        toast.success(t("updateWebhookSuccess"));
        if (gameServerUuid && webhook) {
          dispatch(gameServerSliceActions.updateWebhook({ gameServerUuid, webhook }));
        }
      },
      onError: (error) => {
        console.error("Update webhook error:", error);
        toast.error(t("updateWebhookError"));
      },
    },
  });

  const { mutateAsync: deleteWebhook } = useDeleteWebhook({
    mutation: {
      onSuccess: async (_, variables) => {
        toast.success(t("deleteWebhookSuccess"));
        if (gameServerUuid && variables.webhookUuid) {
          dispatch(
            gameServerSliceActions.removeWebhook({
              gameServerUuid,
              webhookUuid: variables.webhookUuid,
            }),
          );
        }
      },
      onError: (error) => {
        console.error("Delete webhook error:", error);
        toast.error(t("deleteWebhookError"));
      },
    },
  });

  return {
    createWebhook,
    updateWebhook,
    deleteWebhook,
    isCreatingWebhook,
  };
};

export default useWebhookDataInteractions;
