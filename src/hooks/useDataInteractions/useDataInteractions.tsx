import useAccessGroupDataInteractions from "@/hooks/useAccessGroupDataInteractions/useAccessGroupDataInteractions";
import useFooterDataInteractions from "@/hooks/useFooterDataInteractions/useFooterDataInteractions";
import useGameServerConfigDataInteractions from "@/hooks/useGameServerConfigDataInteractions/useGameServerConfigDataInteractions";
import useGameServerDataInteractions from "@/hooks/useGameServerDataInteractions/useGameServerDataInteractions";
import useServerInteractions from "@/hooks/useServerInteractions/useServerInteractions";
import useUserDataInteractions from "@/hooks/useUserDataInteractions/useUserDataInteractions";
import useWebhookDataInteractions from "@/hooks/useWebhookDataInteractions/useWebhookDataInteractions";

const useDataInteractions = () => {
  const gameServerDataInteractions = useGameServerDataInteractions();
  const userDataInteractions = useUserDataInteractions();
  const accessGroupDataInteractions = useAccessGroupDataInteractions();
  const gameServerConfigDataInteractions = useGameServerConfigDataInteractions();
  const webhookDataInteractions = useWebhookDataInteractions();
  const footerDataInteractions = useFooterDataInteractions();
  const serverInteractions = useServerInteractions();

  return {
    ...gameServerDataInteractions,
    ...userDataInteractions,
    ...accessGroupDataInteractions,
    ...gameServerConfigDataInteractions,
    ...webhookDataInteractions,
    ...footerDataInteractions,
    ...serverInteractions,
  };
};

export default useDataInteractions;
