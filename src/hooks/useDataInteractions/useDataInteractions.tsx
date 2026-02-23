import useAccessGroupDataInteractions from "@/hooks/useAccessGroupDataInteractions/useAccessGroupDataInteractions";
import useFooterDataInteractions from "@/hooks/useFooterDataInteractions/useFooterDataInteractions";
import useGameServerConfigDataInteractions from "@/hooks/useGameServerConfigDataInteractions/useGameServerConfigDataInteractions";
import useGameServerDataInteractions from "@/hooks/useGameServerDataInteractions/useGameServerDataInteractions";
import useUserDataInteractions from "@/hooks/useUserDataInteractions/useUserDataInteractions";
import useWebhookDataInteractions from "@/hooks/useWebhookDataInteractions/useWebhookDataInteractions";

const useDataInteractions = () => {
  const gameServerDataInteractions = useGameServerDataInteractions();
  const userDataInteractions = useUserDataInteractions();
  const accessGroupDataInteractions = useAccessGroupDataInteractions();
  const gameServerConfigDataInteractions = useGameServerConfigDataInteractions();
  const webhookDataInteractions = useWebhookDataInteractions();
  const footerDataInteractions = useFooterDataInteractions();

  return {
    ...gameServerDataInteractions,
    ...userDataInteractions,
    ...accessGroupDataInteractions,
    ...gameServerConfigDataInteractions,
    ...webhookDataInteractions,
    ...footerDataInteractions,
  };
};

export default useDataInteractions;
