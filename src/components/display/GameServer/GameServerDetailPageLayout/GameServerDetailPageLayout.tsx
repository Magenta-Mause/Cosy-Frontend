import GameServerDetailPageHeader from "@components/display/GameServer/GameServerDetailPageLayout/GameServerDetailPageHeader/GameServerDetailPageHeader.tsx";
import { Button } from "@components/ui/button.tsx";
import Link from "@components/ui/Link.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { useLocation } from "@tanstack/react-router";
import {
  ChartAreaIcon,
  DoorClosedIcon,
  DoorOpenIcon,
  FolderIcon,
  HomeIcon,
  SettingsIcon,
  SquareTerminalIcon,
} from "lucide-react";
import { type CSSProperties, createContext } from "react";
import { useTranslation } from "react-i18next";
import { GameServerAccessGroupDtoPermissionsItem, type GameServerDto } from "@/api/generated/model";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions.tsx";
import { cn } from "@/lib/utils.ts";

const iconStyles: CSSProperties = {
  scale: 1.8,
};

const buttonStyles: CSSProperties = {
  padding: "25px",
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
        <div id={"gameServerDetailPage:exitButton"} className={"flex h-25 items-end w-[10%] flex-shrink-0"}>
          <Link to={"/"} tabIndex={-1} preload={"viewport"}>
            <FancyNavigationButton
              isActive={false}
              label={t("serverPage.back")}
              tabIndex={0}
              direction={"right"}
              className={"group"}
            >
              <DoorClosedIcon
                className={"group-hover:hidden group-focus:hidden"}
                style={iconStyles}
              />
              <DoorOpenIcon
                className={"hidden group-hover:inline-block group-focus:inline-block"}
                style={iconStyles}
              />
            </FancyNavigationButton>
          </Link>
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

const SIDE_MARGIN = 15;
const FancyNavigationButton = (
  props: {
    isActive: boolean;
    label: React.ReactNode;
    children: React.ReactNode;
    direction?: "left" | "right";
    disabled?: boolean;
  } & React.ComponentProps<"button">,
) => {
  const { isActive, label, children, direction, disabled, ...buttonProps } = props;
  const compiledDirection = direction ?? "left";
  const compiledMargin = compiledDirection === "left" ? "mr" : "ml";

  // Calculate max-width based on label length (approximately 5px per character)
  const labelLength = typeof label === "string" ? label.length : 20;
  const calculatedMaxWidth = labelLength * 13;

  return (
    <Button
      style={buttonStyles}
      tabIndex={-1}
      {...buttonProps}
      disabled={disabled}
      className={cn(
        isActive ? "bg-button-primary-active!" : "",
        "gap-0",
        "transition-all duration-300",
        disabled && "cursor-not-allowed opacity-50",
        buttonProps.className,
      )}
    >
      {compiledDirection === "right" && children}
      <div
        className={cn(
          // Only apply hover/focus effects when NOT disabled
          !disabled && `group-focus:${compiledMargin}-1 group-focus:opacity-100`,
          !disabled && `group-hover:${compiledMargin}-1 group-hover:opacity-100`,
          !disabled &&
            "group-hover:[max-width:var(--label-max-width)] group-focus:[max-width:var(--label-max-width)]",
          // Base classes always apply
          "top-[50%] max-w-0 opacity-0 duration-400 transition-all",
          `align-middle justify-center m-auto relative ${compiledMargin}-0 overflow-clip`,
        )}
        style={{
          transform:
            "translateX(" +
            (compiledDirection === "left" ? "-" : "") +
            SIDE_MARGIN +
            "px) translateY(-50%)",
          ["--label-max-width" as string]: `${calculatedMaxWidth}px`,
        }}
      >
        {label}
      </div>
      {compiledDirection === "left" && children}
    </Button>
  );
};

export default GameServerDetailPageLayout;
export { GameServerDetailContext };
