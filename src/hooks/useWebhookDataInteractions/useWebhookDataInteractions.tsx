import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getGetAllWebhooksQueryKey,
  useCreateWebhook,
  useDeleteWebhook,
  useUpdateWebhook,
} from "@/api/generated/backend-api.ts";
import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useWebhookDataInteractions = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslationPrefix("toasts");

  const { mutateAsync: createWebhook, isPending: isCreatingWebhook } = useCreateWebhook({
    mutation: {
      onSuccess: async () => {
        toast.success(t("createWebhookSuccess"));
        await queryClient.invalidateQueries({
          queryKey: getGetAllWebhooksQueryKey(),
        });
      },
      onError: () => {
        toast.error(t("createWebhookError"));
      },
    },
  });

  const { mutateAsync: updateWebhook } = useUpdateWebhook({
    mutation: {
      onSuccess: async () => {
        toast.success(t("updateWebhookSuccess"));
        await queryClient.invalidateQueries({
          queryKey: getGetAllWebhooksQueryKey(),
        });
      },
      onError: () => {
        toast.error(t("updateWebhookError"));
      },
    },
  });

  const { mutateAsync: deleteWebhook } = useDeleteWebhook({
    mutation: {
      onSuccess: async () => {
        toast.success(t("deleteWebhookSuccess"));
        await queryClient.invalidateQueries({
          queryKey: getGetAllWebhooksQueryKey(),
        });
      },
      onError: () => {
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
