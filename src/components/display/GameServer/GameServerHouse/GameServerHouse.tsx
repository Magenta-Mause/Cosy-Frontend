import RightClickMenu from "@components/display/configurations/RightClickMenu/RightClickMenu.tsx";
import { DeleteGameServerAlertDialog } from "@components/display/GameServer/DeleteGameServerAlertDialog/DeleteGameServerAlertDialog.tsx";
import Link from "@components/ui/Link.tsx";
import type { CSSProperties } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { parse as parseCommand } from "shell-quote";
import type {
  GameServerConfigurationEntity,
  GameServerCreationDto,
  GameServerUpdateDto,
} from "@/api/generated/model";
import serverHouseImage from "@/assets/ai-generated/main-page/house.png";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import { cn } from "@/lib/utils.ts";
import EditGameServerModal from "../EditGameServer/EditGameServerModal";
import GameSign from "../GameSign/GameSign";

const GameServerHouse = (props: {
  gameServer: GameServerConfigurationEntity;
  className?: string;
  style?: CSSProperties;
}) => {
  const { t } = useTranslation();
  const { deleteGameServer } = useDataInteractions();
  const { updateGameServer } = useDataInteractions();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [gameServerState, setGameServerInternalState] = useState<Partial<GameServerCreationDto>>(
    {},
  );
  const onEdit = async () => {
    if (!props.gameServer.uuid) {
      console.error("GameServer UUID is missing");
      return;
    }

    await updateGameServer(props.gameServer.uuid, {
      game_uuid: "Game-5678",
      server_name: "Ein Mega Server",
      docker_image_name: "Game image 123",
      docker_image_tag: "42",

      port_mappings: [
        {
          instance_port: 22222,
          container_port: 33333,
          protocol: "UDP",
        },
      ],

      execution_command: ["./start.sh"],

      environment_variables: [
        { key: "JAVA_OPT", value: "-Xmx2G" },
        { key: "EULA", value: "FALSE" },
      ],

      volume_mounts: [
        {
          host_path: "/data/minecraft/mini",
          container_path: "/servers",
        },
      ],
    });
  };

  const actions = [
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

  const handleUpdateGameServer = async () => {
    if (props.gameServer.uuid)
      updateGameServer(props.gameServer.uuid, {
        ...gameServerState,
        execution_command: parseCommand(gameServerState.execution_command as unknown as string),
        port_mappings: gameServerState.port_mappings?.map((portMapping) => ({
          ...portMapping,
          protocol: "TCP", // Default to TCP for now - change this later!!!
        })),
      } as GameServerUpdateDto);
    setIsEditDialogOpen(false);
    return;
  };

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
      <EditGameServerModal
        serverName={props.gameServer.server_name ?? ""}
        gameServer={props.gameServer}
        onConfirm={handleUpdateGameServer}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
};

export default GameServerHouse;
