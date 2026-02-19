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
        toast.success(t("createSuccess"));
        await queryClient.invalidateQueries({
          queryKey: getGetAllWebhooksQueryKey(),
        });
      },
    },
  });

  const { mutateAsync: updateWebhook } = useUpdateWebhook({
    mutation: {
      onSuccess: async () => {
        toast.success(t("updateSuccess"));
        await queryClient.invalidateQueries({
          queryKey: getGetAllWebhooksQueryKey(),
        });
      },
    },
  });

  const { mutateAsync: deleteWebhook } = useDeleteWebhook({
    mutation: {
      onSuccess: async () => {
        toast.success(t("deleteSuccess"));
        await queryClient.invalidateQueries({
          queryKey: getGetAllWebhooksQueryKey(),
        });
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
