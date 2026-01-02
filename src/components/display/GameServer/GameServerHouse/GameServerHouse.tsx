import RightClickMenu from "@components/display/configurations/RightClickMenu/RightClickMenu.tsx";
import { DeleteGameServerAlertDialog } from "@components/display/GameServer/DeleteGameServerAlertDialog/DeleteGameServerAlertDialog.tsx";
import Link from "@components/ui/Link.tsx";
import type { CSSProperties } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { stopService } from "@/api/generated/backend-api";
import type { GameServerDto } from "@/api/generated/model";
import { startServiceSse } from "@/api/sse";
import serverHouseImage from "@/assets/ai-generated/main-page/house.png";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import { cn } from "@/lib/utils.ts";
import GameSign from "../GameSign/GameSign";

const GameServerHouse = (props: {
  gameServer: GameServerDto;
  className?: string;
  style?: CSSProperties;
}) => {
  const { t } = useTranslation();
  const { deleteGameServer } = useDataInteractions();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const actions = [
    {
      label: t("rightClickMenu.edit"),
      onClick: () => {
        toast.info(t("toasts.notImplemented"));
      },
    },
    {
      label: t("rightClickMenu.delete"),
      onClick: () => {
        setIsDeleteDialogOpen(true);
      },
      closeOnClick: false,
    },
    {
      label: t("rightClickMenu.startServer"),
      onClick: async () => {
        try {
          toast.info("Starting server...")
          const res = await startServiceSse(props.gameServer.uuid as string);
          const hostname = window.location.hostname;
          const listeningOn = res.map((num) => (
            <div key={num}>
              <a
                className="text-link"
                href={`http://${hostname}:${num}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                - {hostname}:{num}
              </a>
            </div>
          ));

          toast.success(
            <div style={{ userSelect: "text" }}>
              <div>{t("toasts.serverStartSuccess")}</div>
              {listeningOn}
            </div>,
            {
              duration: 5000,
            },
          );
        } catch (e) {
          toast.error(t("toasts.serverStartError", { error: e }), { duration: 5000 });
        }
      },
    },
    {
      label: t("rightClickMenu.stopServer"),
      onClick: async () => {
        try {
          await stopService(props.gameServer.uuid as string);
          toast.success(t("toasts.serverStopSuccess"));
        } catch (e) {
          toast.error(t("toasts.serverStopError", { error: e }));
        }
      },
    },
  ];

  return (
    <>
      <RightClickMenu actions={actions}>
        <Link
          className={cn("block w-[14%] h-auto aspect-square select-none", props.className)}
          to={`/game-server-configuration/${props.gameServer.uuid}`}
          aria-label={t("aria.gameServerConfiguration", {
            serverName: props.gameServer.server_name,
          })}
          style={props.style}
        >
          <img
            alt={t("aria.gameServerConfiguration", {
              serverName: props.gameServer.server_name,
            })}
            className="w-full h-full object-cover"
            aria-label={t("aria.gameServerConfiguration", {
              serverName: props.gameServer.server_name,
            })}
            src={serverHouseImage}
          />
          <GameSign
            className="bottom-[-2%] right-[5%] w-[25%]"
            classNameTextChildren="!text-[.5vw]"
          >
            {props.gameServer.server_name}
          </GameSign>
        </Link>
      </RightClickMenu>
      <DeleteGameServerAlertDialog
        serverName={props.gameServer.server_name ?? ""}
        onConfirm={() => deleteGameServer(props.gameServer.uuid ?? "")}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
};

export default GameServerHouse;
