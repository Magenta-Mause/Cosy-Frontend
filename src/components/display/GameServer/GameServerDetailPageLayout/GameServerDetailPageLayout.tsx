import BackToHomeLink from "@components/display/GameServer/GameServerDetailPageLayout/BackToHomeLink.tsx";
import FancyNavigationButton from "@components/display/GameServer/GameServerDetailPageLayout/FancyNavigationButton.tsx";
import GameServerDetailPageHeader from "@components/display/GameServer/GameServerDetailPageLayout/GameServerDetailPageHeader/GameServerDetailPageHeader.tsx";
import Link from "@components/ui/Link.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { useLocation } from "@tanstack/react-router";
import {
  ChartAreaIcon,
  FolderIcon,
  HomeIcon,
  SettingsIcon,
  SquareTerminalIcon,
} from "lucide-react";
import { type CSSProperties, createContext } from "react";
import { useTranslation } from "react-i18next";
import { GameServerAccessGroupDtoPermissionsItem, type GameServerDto } from "@/api/generated/model";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions.tsx";

const iconStyles: CSSProperties = {
  scale: 1.8,
};

const TABS = [
  {
    label: "overview",
    icon: <HomeIcon style={iconStyles} />,
    path: "/server/$serverId",
  },
  {
    label: "console",
    icon: <SquareTerminalIcon style={iconStyles} />,
    path: "/server/$serverId/console",
    permissions: [
      GameServerAccessGroupDtoPermissionsItem.READ_SERVER_LOGS,
      GameServerAccessGroupDtoPermissionsItem.SEND_COMMANDS,
    ],
  },
  {
    label: "metrics",
    icon: <ChartAreaIcon style={iconStyles} />,
    path: "/server/$serverId/metrics",
    permissions: [GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS],
  },
  {
    label: "file_explorer",
    icon: <FolderIcon style={iconStyles} />,
    path: "/server/$serverId/files",
    activePathPattern: /\/server\/.*\/files/,
    permissions: [
      GameServerAccessGroupDtoPermissionsItem.READ_SERVER_SERVER_FILES,
      GameServerAccessGroupDtoPermissionsItem.CHANGE_SERVER_FILES,
    ],
  },
  {
    label: "settings",
    icon: <SettingsIcon style={iconStyles} />,
    path: "/server/$serverId/settings/general",
    activePathPattern: /\/server\/.*\/settings/,
    permissions: [
      GameServerAccessGroupDtoPermissionsItem.CHANGE_SERVER_CONFIGS,
      GameServerAccessGroupDtoPermissionsItem.CHANGE_PERMISSIONS_SETTINGS,
      GameServerAccessGroupDtoPermissionsItem.CHANGE_METRICS_SETTINGS,
      GameServerAccessGroupDtoPermissionsItem.CHANGE_RCON_SETTINGS,
    ],
  },
];

interface GameServerDetailContext {
  gameServer: GameServerDto;
}

const GameServerDetailContext = createContext<GameServerDetailContext>({
  gameServer: {} as GameServerDto,
});

const GameServerDetailPageLayout = (props: {
  gameServer: GameServerDto;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { hasPermission } = useGameServerPermissions(props.gameServer.uuid);

  return (
    <GameServerDetailContext.Provider value={{ gameServer: props.gameServer }}>
      <div className="flex w-full min-h-screen">
        <div
          id={"gameServerDetailPage:exitButton"}
          className={"flex h-25 items-end w-[10%] flex-shrink-0 relative z-10"}
        >
          <BackToHomeLink />
        </div>
        <div className="grow py-5 flex flex-col gap-6 h-[92vh] min-w-0">
          <GameServerDetailPageHeader gameServer={props.gameServer} />
          <div className={"grow overflow-y-auto"}>{props.children}</div>
        </div>

        <div className="flex flex-col justify-center items-end w-[10%] flex-shrink-0">
          {TABS.map(({ label, icon, path, activePathPattern, permissions }) => {
            const isLinkReachable = permissions
              ? permissions.some((perm) => hasPermission(perm))
              : true;

            return (
              <div key={`${label}:${path}`} className={"relative"}>
                <Link
                  key={label}
                  to={path}
                  activeOptions={{ exact: !activePathPattern }}
                  className={"group"}
                  preload={"viewport"}
                  disabled={!isLinkReachable}
                >
                  {({ isActive }) => (
                    <TooltipWrapper
                      tooltip={
                        !isLinkReachable
                          ? t("serverPage.noAccessFor", {
                              element: t(`serverPage.navbar.${label}`),
                            })
                          : null
                      }
                      side={"left"}
                      align="center"
                    >
                      <FancyNavigationButton
                        isActive={
                          activePathPattern ? activePathPattern.test(location.pathname) : isActive
                        }
                        label={t(`serverPage.navbar.${label}`)}
                        disabled={!isLinkReachable}
                      >
                        {icon}
                      </FancyNavigationButton>
                    </TooltipWrapper>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </GameServerDetailContext.Provider>
  );
};

export default GameServerDetailPageLayout;
export { GameServerDetailContext };
