import RightClickMenu, {
  type RightClickAction,
} from "@components/display/configurations/RightClickMenu/RightClickMenu.tsx";
import Link from "@components/ui/Link.tsx";
import { useRouter } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { type GameServerDto, GameServerDtoStatus } from "@/api/generated/model";
import serverHouseImage1 from "@/assets/MainPage/house1.png";
import serverHouseImage2 from "@/assets/MainPage/house2.png";
import useServerInteractions from "@/hooks/useServerInteractions/useServerInteractions.tsx";
import { cn } from "@/lib/utils.ts";
import GameSign from "../GameSign/GameSign";

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
  const { startServer, stopServer } = useServerInteractions();
  const router = useRouter();

  const serverHouseImage = useMemo(() => {
    const hash = hashUUID(props.gameServer.uuid);
    return hash % 2 === 0 ? serverHouseImage1 : serverHouseImage2;
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
  ];

  return (
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
        <GameSign className="bottom-[2%] right-[5%] w-[21%]">
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
  );
};

export default GameServerHouse;
