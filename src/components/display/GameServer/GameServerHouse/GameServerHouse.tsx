import RightClickMenu, {
  type RightClickAction
} from "@components/display/configurations/RightClickMenu/RightClickMenu.tsx";
import {
  DeleteGameServerAlertDialog
} from "@components/display/GameServer/DeleteGameServerAlertDialog/DeleteGameServerAlertDialog.tsx";
import Link from "@components/ui/Link.tsx";
import {useRouter} from "@tanstack/react-router";
import type {CSSProperties} from "react";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {
  type GameServerDto,
  GameServerDtoStatus,
  type GameServerUpdateDto,
} from "@/api/generated/model";
import serverHouseImage from "@/assets/ai-generated/main-page/house.png";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import {cn} from "@/lib/utils.ts";
import EditGameServerModal from "../EditGameServer/EditGameServerModal";
import GameSign from "../GameSign/GameSign";
import useServerInteractions from "@/hooks/useServerInteractions/useServerInteractions.tsx";

const GameServerHouse = (props: {
  gameServer: GameServerDto;
  className?: string;
  style?: CSSProperties;
}) => {
  const {t} = useTranslation();
  const {deleteGameServer, updateGameServer} = useDataInteractions();
  const {startServer, stopServer} = useServerInteractions();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

  const actions: RightClickAction[] = [
    ...(props.gameServer.status === "STOPPED" ? [{
      label: t("rightClickMenu.startServer"),
      onClick: async () => {
        try {
          toast.info("Starting server...");
          startServer(props.gameServer.uuid, true);
        } catch (e) {
          toast.error(t("toasts.serverStartError", {error: e}), {duration: 5000});
        }
      },
    }] : props.gameServer.status === "RUNNING" ?
      [{
        label: t("rightClickMenu.stopServer"),
        onClick: async () => {
          try {
            await stopServer(props.gameServer.uuid, true);
          } catch (e) {
            toast.error(t("toasts.serverStopError", {error: e}));
          }
        },
      }] : props.gameServer.status === "AWAITING_UPDATE" || props.gameServer.status === "PULLING_IMAGE" ?
        [{
          label: t("rightClickMenu.loading"),
          disabled: true,
        }]
        : [{
          label: t("rightClickMenu.failed"),
          disabled: true,
          destructive: true
        }]),
    {
      label: t("rightClickMenu.viewLogs"),
      onClick: () => {
        router.navigate({
          to: `/server/${props.gameServer.uuid}`,
        });
      },
    },
    {
      label: t("rightClickMenu.edit"),
      onClick: () => {
        setIsEditDialogOpen(true);
      },
      closeOnClick: false,
    },
    {
      label: t("rightClickMenu.delete"),
      onClick: () => {
        setIsDeleteDialogOpen(true);
      },
      closeOnClick: false,
    },

  ];

  const handleUpdateGameServer = async (updatedState: GameServerUpdateDto) => {
    if (!props.gameServer.uuid) {
      toast.error(t("toasts.missingUuid"));
      return;
    }
    await updateGameServer(props.gameServer.uuid, updatedState);
  };

  return (
    <>
      <RightClickMenu actions={actions}>
        <Link
          className={cn("block w-[14%] h-auto aspect-square select-none relative", props.className)}
          to={`/server/${props.gameServer.uuid}`}
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
          <div
            className={cn(
              "absolute -top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[0.6rem] font-bold text-white shadow-md whitespace-nowrap z-10",
              {
                "bg-green-500": props.gameServer.status === GameServerDtoStatus.RUNNING,
                "bg-red-500":
                  props.gameServer.status === GameServerDtoStatus.STOPPED ||
                  props.gameServer.status === GameServerDtoStatus.FAILED,
                "bg-yellow-500": props.gameServer.status === GameServerDtoStatus.PULLING_IMAGE,
              },
            )}
          >
            {t(`serverStatus.${props.gameServer.status}`)}
          </div>
        </Link>
      </RightClickMenu>
      <DeleteGameServerAlertDialog
        serverName={props.gameServer.server_name ?? ""}
        onConfirm={() => deleteGameServer(props.gameServer.uuid ?? "")}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
      <EditGameServerModal
        serverName={props.gameServer.server_name ?? ""}
        gameServer={props.gameServer}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onConfirm={handleUpdateGameServer}
      />
    </>
  );
};

export default GameServerHouse;
