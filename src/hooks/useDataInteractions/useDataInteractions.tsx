import useAccessGroupDataInteractions from "@/hooks/useAccessGroupDataInteractions/useAccessGroupDataInteractions";
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

  return {
    ...gameServerDataInteractions,
    ...userDataInteractions,
    ...accessGroupDataInteractions,
    ...gameServerConfigDataInteractions,
    ...webhookDataInteractions,
  };
};

export default useDataInteractions;
