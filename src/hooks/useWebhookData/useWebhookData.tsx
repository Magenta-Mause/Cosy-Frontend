import { useDispatch } from "react-redux";
import { getAllWebhooks } from "@/api/generated/backend-api";
import { webhookSliceActions } from "@/stores/slices/webhookSlice";

const useWebhookData = () => {
  const dispatch = useDispatch();

  const loadWebhooks = async (gameServerUuid: string) => {
    dispatch(webhookSliceActions.setState("loading"));
    try {
      const webhooks = await getAllWebhooks(gameServerUuid);
      dispatch(webhookSliceActions.setWebhooks({ gameServerUuid, webhooks }));
      dispatch(webhookSliceActions.setState("idle"));
      return true;
    } catch (e) {
      console.error("Unexpected error while loading webhooks", e);
      dispatch(webhookSliceActions.setState("failed"));
      return false;
    }
  };

  return {
    loadWebhooks,
  };
};

export default useWebhookData;
