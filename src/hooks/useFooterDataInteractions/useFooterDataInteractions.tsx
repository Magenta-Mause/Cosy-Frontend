import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { modal } from "@/lib/notificationModal";
import { getGetFooterQueryKey, useUpdateFooter } from "@/api/generated/backend-api.ts";
import type { FooterUpdateDto } from "@/api/generated/model";
import { footerSliceActions } from "@/stores/slices/footerSlice.ts";
import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useFooterDataInteractions = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslationPrefix("toasts");

  const { mutateAsync: updateFooterMutateAsync } = useUpdateFooter({
    mutation: {
      onSuccess: (updatedFooter) => {
        dispatch(footerSliceActions.updateFooter(updatedFooter));
        modal.success({ message: t("updateFooterSuccess") });
      },
      onError: (err) => {
        modal.error({ message: t("updateFooterError"), cause: err });
        throw err;
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: getGetFooterQueryKey(),
        });
      },
    },
  });

  const updateFooter = async (data: FooterUpdateDto) => {
    return await updateFooterMutateAsync({ data });
  };

  return {
    updateFooter,
  };
};

export default useFooterDataInteractions;
