import RightClickMenu, {
  type RightClickAction,
} from "@components/display/Configurations/RightClickMenu/RightClickMenu.tsx";
import NameAndStatusBanner from "@components/display/GameServer/NameAndStatusBanner/NameAndStatusBanner.tsx";
import Link from "@components/ui/Link.tsx";
import { useRouter } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { GameServerDto } from "@/api/generated/model";
import castle from "@/assets/MainPage/castle.png";
import house from "@/assets/MainPage/house.png";
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
  const { startServer, stopServer } = useServerInteractions();
  const router = useRouter();

  const isHouse = useMemo(() => {
    if (props.gameServer.design !== undefined) {
      return props.gameServer.design === "HOUSE";
    }
    const hash = hashUUID(props.gameServer.uuid);
    return hash % 2 === 0;
  }, [props.gameServer.uuid, props.gameServer.design]);

  const serverHouseImage = useMemo(() => {
    return {
      image: isHouse ? house : castle,
      size: isHouse ? "18vw" : "22vw",
    };
  }, [isHouse]);

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
          width: serverHouseImage.size,
          height: serverHouseImage.size,
        }}
        onClick={handleClick}
        preload={"viewport"}
      >
        <NameAndStatusBanner
          className={
            isHouse
              ? "absolute translate-x-[5.5%] translate-y-[-15%] whitespace-nowrap z-10"
              : "absolute translate-x-[13%] translate-y-[78%] whitespace-nowrap z-10"
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
          className="w-full h-full object-contain overflow-visible"
          aria-label={t("aria.gameServerConfiguration", {
            serverName: props.gameServer.server_name,
          })}
          style={{
            imageRendering: "pixelated",
          }}
          src={serverHouseImage.image}
        />
      </Link>
    </RightClickMenu>
  );
};

export default GameServerHouse;
