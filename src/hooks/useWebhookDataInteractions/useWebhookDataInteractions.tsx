import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getGetAllWebhooksQueryKey,
  useCreateWebhook,
  useDeleteWebhook,
  useUpdateWebhook,
} from "@/api/generated/backend-api.ts";
import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useWebhookDataInteractions = (gameServerUuid?: string) => {
  const queryClient = useQueryClient();
  const { t } = useTranslationPrefix("toasts");
  const queryKey = gameServerUuid ? getGetAllWebhooksQueryKey(gameServerUuid) : undefined;

  const { mutateAsync: createWebhook, isPending: isCreatingWebhook } = useCreateWebhook({
    mutation: {
      onSuccess: async () => {
        toast.success(t("createWebhookSuccess"));
        if (queryKey) {
          await queryClient.invalidateQueries({
            queryKey,
          });
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
      onSuccess: async () => {
        toast.success(t("updateWebhookSuccess"));
        if (queryKey) {
          await queryClient.invalidateQueries({
            queryKey,
          });
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
      onSuccess: async () => {
        toast.success(t("deleteWebhookSuccess"));
        if (queryKey) {
          await queryClient.invalidateQueries({
            queryKey,
          });
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
