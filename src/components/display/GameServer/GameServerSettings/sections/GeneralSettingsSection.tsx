import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { GameServerUpdateDto } from "@/api/generated/model/gameServerUpdateDto";
import useActiveGameServer from "@/hooks/useActiveGameServer/useActiveGameServer";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import EditGameServerPage from "../../EditGameServer/EditGameServerPage";

const GeneralSettingsSection = () => {
  const { t } = useTranslation();
  const { updateGameServer } = useDataInteractions();
  const { gameServer } = useActiveGameServer();

  const handleUpdateGameServer = async (updatedState: GameServerUpdateDto) => {
    if (!gameServer.uuid) {
      toast.error(t("toasts.missingUuid"));
      return;
    }
    await updateGameServer(gameServer.uuid, updatedState);
  };

  return (
    <EditGameServerPage
      serverName={gameServer.server_name ?? ""}
      gameServer={gameServer}
      onConfirm={handleUpdateGameServer}
    />
  );
};

export default GeneralSettingsSection;
