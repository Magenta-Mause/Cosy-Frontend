import GameServerDetailPageHeader from "@components/display/GameServer/GameServerDetailPageLayout/GameServerDetailPageHeader/GameServerDetailPageHeader.tsx";
import { Button } from "@components/ui/button.tsx";
import Link from "@components/ui/Link.tsx";
import {
  ChartAreaIcon,
  DoorClosedIcon,
  DoorOpenIcon,
  FolderIcon,
  HomeIcon,
  SettingsIcon,
  SquareTerminalIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { GameServerDto } from "@/api/generated/model";
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
  },
  {
    label: "metrics",
    icon: <ChartAreaIcon style={iconStyles} />,
    path: "/server/$serverId/metrics",
  },
  {
    label: "file_explorer",
    icon: <FolderIcon style={iconStyles} />,
    path: "/server/$serverId/file-explorer",
  },
  {
    label: "settings",
    icon: <SettingsIcon style={iconStyles} />,
    path: "/server/$serverId/settings/general",
  },
];

const GameServerDetailPageLayout = (props: {
  gameServer: GameServerDto;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex w-full min-h-screen">
      <div id={"gameServerDetailPage:exitButton"} className={"flex h-25 items-end w-[10%]"}>
        <Link to={"/"} tabIndex={-1}>
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
      <div className="grow py-5 flex flex-col gap-6 h-[92vh]">
        <GameServerDetailPageHeader gameServer={props.gameServer} />
        <div className={"grow"}>{props.children}</div>
      </div>

      <div className="flex flex-col justify-center items-end w-[10%]">
        {TABS.map(({ label, icon, path }) => (
          <div key={`${label}:${path}`} className={"relative"}>
            <Link key={label} to={path} activeOptions={{ exact: true }} className={"group"}>
              {({ isActive }) => (
                <FancyNavigationButton isActive={isActive} label={t(`serverPage.navbar.${label}`)}>
                  {icon}
                </FancyNavigationButton>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

const SIDE_MARGIN = 15;
const FancyNavigationButton = (
  props: {
    isActive: boolean;
    label: React.ReactNode;
    children: React.ReactNode;
    direction?: "left" | "right";
  } & React.ComponentProps<"button">,
) => {
  const compiledDirection = props.direction ?? "left";
  const compiledMargin = compiledDirection === "left" ? "mr" : "ml";
  return (
    <Button
      style={buttonStyles}
      tabIndex={-1}
      {...props}
      className={cn(props.isActive ? "bg-button-primary-active!" : "", "gap-0", props.className)}
    >
      {compiledDirection === "right" && props.children}
      <div
        className={cn(
          `group-focus:max-w-28 group-focus:${compiledMargin}-1 group-focus:opacity-100`,
          `group-hover:max-w-25 group-hover:${compiledMargin}-1 group-hover:opacity-100`,
          "top-[50%] max-w-0 opacity-0 duration-400 transition-all",
          `align-middle justify-center m-auto relative ${compiledMargin}-0 overflow-clip`,
        )}
        style={{
          transform:
            "translateX(" +
            (compiledDirection === "left" ? "-" : "") +
            SIDE_MARGIN +
            "px) translateY(-50%)",
        }}
      >
        {props.label}
      </div>
      {compiledDirection === "left" && props.children}
    </Button>
  );
};

export default GameServerDetailPageLayout;
