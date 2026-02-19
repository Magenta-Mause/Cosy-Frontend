import useAccessGroupDataInteractions from "@/hooks/useAccessGroupDataInteractions/useAccessGroupDataInteractions";
import useGameServerConfigDataInteractions from "@/hooks/useGameServerConfigDataInteractions/useGameServerConfigDataInteractions";
import useGameServerDataInteractions from "@/hooks/useGameServerDataInteractions/useGameServerDataInteractions";
import useUserDataInteractions from "@/hooks/useUserDataInteractions/useUserDataInteractions";

const useDataInteractions = () => {
  const gameServerDataInteractions = useGameServerDataInteractions();
  const userDataInteractions = useUserDataInteractions();
  const accessGroupDataInteractions = useAccessGroupDataInteractions();
  const gameServerConfigDataInteractions = useGameServerConfigDataInteractions();

  return {
    ...gameServerDataInteractions,
    ...userDataInteractions,
    ...accessGroupDataInteractions,
    ...gameServerConfigDataInteractions,
  };
};

export default useDataInteractions;
