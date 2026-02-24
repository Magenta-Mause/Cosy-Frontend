import RightClickMenu, {
  type RightClickAction,
} from "@components/display/Configurations/RightClickMenu/RightClickMenu.tsx";
import CreateGameServer from "@components/display/GameServer/CreateGameServer/CreateGameServer";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { type ReactNode, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading.tsx";

const GameServerOverviewPageRightClickHandler = (props: { children: ReactNode }) => {
  const { t } = useTranslation();
  const { loadGameServers } = useDataLoading();
  const { authorized } = useContext(AuthContext);

  const [openIsGameServerCreationModalOpen, setIsOpenGameServerCreationModalOpen] = useState(false);

  const actions: RightClickAction[] = [
    {
      label: t("rightClickMenu.refresh"),
      onClick: async () => {
        if (await loadGameServers()) {
          toast.success(t("toasts.refreshGameServersSuccess"));
        } else {
          toast.error(t("toasts.refreshGameServersError"));
        }
      },
    },
    ...(authorized
      ? [
          {
            label: t("rightClickMenu.createNewGameServer"),
            onClick: () => {
              setIsOpenGameServerCreationModalOpen(true);
            },
          },
        ]
      : []),
  ];

  return (
    <RightClickMenu actions={actions}>
      <div>
        {authorized && (
          <CreateGameServer
            isModalOpen={openIsGameServerCreationModalOpen}
            setIsModalOpen={setIsOpenGameServerCreationModalOpen}
          />
        )}
        {props.children}
      </div>
    </RightClickMenu>
  );
};

export default GameServerOverviewPageRightClickHandler;
