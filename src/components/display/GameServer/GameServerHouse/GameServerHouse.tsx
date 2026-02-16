import RightClickMenu, {
  type RightClickAction,
} from "@components/display/configurations/RightClickMenu/RightClickMenu.tsx";
import { DeleteGameServerAlertDialog } from "@components/display/GameServer/DeleteGameServerAlertDialog/DeleteGameServerAlertDialog.tsx";
import NameAndStatusBanner from "@components/display/GameServer/NameAndStatusBanner/NameAndStatusBanner.tsx";
import Link from "@components/ui/Link.tsx";
import { useRouter } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { GameServerDto } from "@/api/generated/model";
import castle from "@/assets/MainPage/castle.png";
import house from "@/assets/MainPage/house.png";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useServerInteractions from "@/hooks/useServerInteractions/useServerInteractions.tsx";
import { cn } from "@/lib/utils.ts";

const hashUUID = (uuid: string): number => {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    const char = uuid.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const GameServerHouse = (props: {
  gameServer: GameServerDto;
  className?: string;
  style?: CSSProperties;
}) => {
  const { t } = useTranslation();
  const { deleteGameServer } = useDataInteractions();
  const { startServer, stopServer } = useServerInteractions();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const serverHouseImage = useMemo(() => {
    const hash = hashUUID(props.gameServer.uuid);
    return hash % 2 === 0 ? castle : house;
  }, [props.gameServer.uuid]);

  const isCastle = useMemo(() => {
    const hash = hashUUID(props.gameServer.uuid);
    return hash % 2 === 0;
  }, [props.gameServer.uuid]);

  const handleClick = () => {
    sessionStorage.setItem("homeScrollPosition", window.scrollY.toString());
  };

  const actions: RightClickAction[] = [
    ...(props.gameServer.status === "STOPPED" || props.gameServer.status === "FAILED"
      ? [
          {
            label: t("rightClickMenu.startServer"),
            onClick: async () => {
              try {
                toast.info("Starting server...");
                startServer(props.gameServer.uuid, true);
              } catch (e) {
                toast.error(t("toasts.serverStartError", { error: e }), { duration: 5000 });
              }
            },
          },
        ]
      : props.gameServer.status === "RUNNING"
        ? [
            {
              label: t("rightClickMenu.stopServer"),
              onClick: async () => {
                try {
                  await stopServer(props.gameServer.uuid, true);
                } catch (e) {
                  toast.error(t("toasts.serverStopError", { error: e }));
                }
              },
            },
          ]
        : props.gameServer.status === "AWAITING_UPDATE" ||
            props.gameServer.status === "PULLING_IMAGE" ||
            props.gameServer.status === "STOPPING"
          ? [
              {
                label: t("rightClickMenu.loading"),
                disabled: true,
              },
            ]
          : []),
    {
      label: t("rightClickMenu.viewLogs"),
      onClick: () => {
        handleClick();
        router.navigate({
          to: `/server/${props.gameServer.uuid}`,
        });
      },
    },
    {
      label: t("rightClickMenu.delete"),
      onClick: () => {
        setIsDeleteDialogOpen(true);
      },
      closeOnClick: false,
    },
  ];

  return (
    <>
      <RightClickMenu actions={actions}>
        <Link
          className={cn(
            "block h-auto overflow-visible aspect-square select-none relative",
            props.className,
          )}
          to={`/server/${props.gameServer.uuid}`}
          aria-label={t("aria.gameServerConfiguration", {
            serverName: props.gameServer.server_name,
          })}
          style={{
            ...props.style,
            width: "19vw",
            height: "19vw",
          }}
          onClick={handleClick}
        >
          <NameAndStatusBanner
            className={
              isCastle
                ? "absolute translate-x-[7%] -translate-y-[65%] whitespace-nowrap z-10"
                : "absolute translate-x-[10%] -translate-y-[50%] whitespace-nowrap z-10"
            }
            classNameTextChildren={"-translate-y-[1.1vw]"}
            status={props.gameServer.status}
          >
            {props.gameServer.server_name}
          </NameAndStatusBanner>
          <img
            alt={t("aria.gameServerConfiguration", {
              serverName: props.gameServer.server_name,
            })}
            className="w-full h-full object-cover overflow-visible"
            aria-label={t("aria.gameServerConfiguration", {
              serverName: props.gameServer.server_name,
            })}
            style={{
              imageRendering: "pixelated",
            }}
            src={serverHouseImage}
          />
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
