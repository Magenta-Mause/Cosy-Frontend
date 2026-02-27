import {
  useCreateWebhook,
  useDeleteWebhook,
  useUpdateWebhook,
} from "@/api/generated/backend-api.ts";
import { modal } from "@/lib/notificationModal";
import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useWebhookDataInteractions = () => {
  const { t } = useTranslationPrefix("toasts");

  const { mutateAsync: createWebhook, isPending: isCreatingWebhook } = useCreateWebhook({
    mutation: {
      onSuccess: async () => {},
      onError: (error) => {
        console.error("Create webhook error:", error);
        modal.error({ message: t("createWebhookError"), cause: error });
      },
    },
  });

  const { mutateAsync: updateWebhook } = useUpdateWebhook({
    mutation: {
      onSuccess: async () => {
        // WebSocket will update Redux with full GameServerDto
      },
      onError: (error) => {
        console.error("Update webhook error:", error);
        modal.error({ message: t("updateWebhookError"), cause: error });
      },
    },
  });

  const { mutateAsync: deleteWebhook } = useDeleteWebhook({
    mutation: {
      onSuccess: async () => {
        // WebSocket will update Redux with full GameServerDto
      },
      onError: (error) => {
        console.error("Delete webhook error:", error);
        modal.error({ message: t("deleteWebhookError"), cause: error });
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
