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
import dashboardBackgroundImage from "@/assets/gameServerDetailPage/dashboard-bg.webp";
import dashboardForegroundImage from "@/assets/gameServerDetailPage/dashboard-fg.webp";
import filesBackgroundImage from "@/assets/gameServerDetailPage/files-bg.webp";
import logsMetricsBackgroundImage from "@/assets/gameServerDetailPage/logs-metrics-bg.webp";
import settingsBackgroundImage from "@/assets/gameServerDetailPage/settings-bg.webp";
import settingsForegroundImage from "@/assets/gameServerDetailPage/settings-fg.webp";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions.tsx";

const iconStyles: CSSProperties = {
  scale: 1.8,
};

interface Tab {
  label: string;
  icon: React.ReactNode;
  path: string;
  activePathPattern?: RegExp;
  permissions?: GameServerAccessGroupDtoPermissionsItem[];
  background: string;
  foreground?: string;
  foregroundColor: string;
  buttonVariant?: "primary" | "secondary";
}

const TABS: Tab[] = [
  {
    label: "overview",
    icon: <HomeIcon style={iconStyles} />,
    path: "/server/$serverId",
    background: dashboardBackgroundImage,
    foreground: dashboardForegroundImage,
    foregroundColor: "var(--button-secondary-default)",
    buttonVariant: "secondary",
  },
  {
    label: "console",
    icon: <SquareTerminalIcon style={iconStyles} />,
    path: "/server/$serverId/console",
    permissions: [
      GameServerAccessGroupDtoPermissionsItem.READ_SERVER_LOGS,
      GameServerAccessGroupDtoPermissionsItem.SEND_COMMANDS,
    ],
    background: logsMetricsBackgroundImage,
    foregroundColor: "var(--button-secondary-default)",
    buttonVariant: "secondary",
  },
  {
    label: "metrics",
    icon: <ChartAreaIcon style={iconStyles} />,
    path: "/server/$serverId/metrics",
    permissions: [GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS],
    background: logsMetricsBackgroundImage,
    foregroundColor: "var(--button-secondary-default)",
    buttonVariant: "secondary",
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
    background: filesBackgroundImage,
    foregroundColor: "var(--button-primary-default)",
    buttonVariant: "primary",
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
    background: settingsBackgroundImage,
    foreground: settingsForegroundImage,
    foregroundColor: "var(--button-secondary-default)",
    buttonVariant: "secondary",
  },
];

function getActiveTab(pathname: string): Tab {
  // Tabs with an explicit regex pattern take priority
  const patternMatch = TABS.find(
    (tab) => tab.activePathPattern && tab.activePathPattern.test(pathname),
  );
  if (patternMatch) return patternMatch;

  // For the rest, build an exact-match regex from the TanStack Router path
  // e.g. "/server/$serverId/console" → /^\/server\/[^/]+\/console$/
  const exactMatch = TABS.find((tab) => {
    const regexStr = tab.path.replace(/\$[^/]+/g, "[^/]+").replace(/\//g, "\\/");
    return new RegExp(`^${regexStr}$`).test(pathname);
  });
  return exactMatch ?? TABS[0];
}

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
  const location = useLocation();

  const activeTab = getActiveTab(location.pathname);

  return (
    <GameServerDetailContext.Provider value={{ gameServer: props.gameServer }}>
      <div
        className="flex w-full min-h-screen relative bg-cover"
        style={{
          backgroundImage: `url(${activeTab.background})`,
          imageRendering: "pixelated",
          backgroundPosition: "center center",
          backgroundSize: "100% auto",
          height: "100vh",
        }}
      >
        <div
          id={"gameServerDetailPage:exitButton"}
          className={"flex h-25 items-end w-[10%] shrink-0 relative z-10 aspect-[0.1]"}
        >
          <BackToHomeLink />
        </div>
        <div className="grow flex flex-col min-w-0 relative z-10 justify-center h-auto">
          <GameServerDetailPageHeader
            gameServer={props.gameServer}
            className={"h-[12%] overflow-y-hidden flex justify-end pb-[1.7vw]"}
            style={
              {
                "--foreground": activeTab.foregroundColor,
              } as CSSProperties
            }
            buttonVariant={activeTab.buttonVariant}
          />
          <div className={"overflow-y-auto h-auto w-full aspect-514/241 bg-background"}>
            {props.children}
          </div>
          <div id={"lowerCenterPlaceholder"} className={"h-[12%] overflow-y-auto"}></div>
        </div>

        <div className="flex flex-col justify-center items-end w-[10%] shrink-0 relative z-10 aspect-[0.1]">
          <SideBar gameServer={props.gameServer} />
        </div>
      </div>
    </GameServerDetailContext.Provider>
  );
};

const SideBar = (props: { gameServer: GameServerDto }) => {
  const { hasPermission } = useGameServerPermissions(props.gameServer.uuid);
  const { t } = useTranslation();
  const location = useLocation();

  return TABS.map(({ label, icon, path, activePathPattern, permissions }) => {
    const isLinkReachable = permissions ? permissions.some((perm) => hasPermission(perm)) : true;

    return (
      <div key={`${label}:${path}`} className={"relative"}>
        <Link
          key={label}
          to={path}
          activeOptions={{ exact: !activePathPattern }}
          className={
            "group block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          }
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
                isActive={activePathPattern ? activePathPattern.test(location.pathname) : isActive}
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
  });
};

export default GameServerDetailPageLayout;
export { GameServerDetailContext };
