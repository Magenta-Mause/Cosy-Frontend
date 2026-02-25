import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { GameServerUpdateDto } from "@/api/generated/model/gameServerUpdateDto";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useSelectedGameServer from "@/hooks/useSelectedGameServer/useSelectedGameServer";
import EditGameServerPage from "../../EditGameServer/EditGameServerPage";
import UncosyZone from "../../EditGameServer/UncosyZone";

const GeneralSettingsSection = () => {
  const { t } = useTranslation();
  const { updateGameServer } = useDataInteractions();
  const { gameServer } = useSelectedGameServer();

  const handleUpdateGameServer = async (updatedState: GameServerUpdateDto) => {
    if (!gameServer.uuid) {
      toast.error(t("toasts.missingUuid"));
      return;
    }
    await updateGameServer(gameServer.uuid, updatedState);
  };

  return (
    <div className="flex flex-col gap-3 relative">
      <EditGameServerPage
        serverName={gameServer.server_name ?? ""}
        gameServer={gameServer}
        onConfirm={handleUpdateGameServer}
      />
      <UncosyZone gameServer={gameServer} />
    </div>
  );
};

export default GeneralSettingsSection;
