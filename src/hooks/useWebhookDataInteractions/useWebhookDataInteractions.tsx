import { toast } from "sonner";
import {
  useCreateWebhook,
  useDeleteWebhook,
  useUpdateWebhook,
} from "@/api/generated/backend-api.ts";
import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useWebhookDataInteractions = () => {
  const { t } = useTranslationPrefix("toasts");

  const { mutateAsync: createWebhook, isPending: isCreatingWebhook } = useCreateWebhook({
    mutation: {
      onSuccess: async () => {
        toast.success(t("createWebhookSuccess"));
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
        // WebSocket will update Redux with full GameServerDto
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
        // WebSocket will update Redux with full GameServerDto
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
