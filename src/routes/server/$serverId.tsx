import {Button} from "@components/ui/button.tsx";
import Link from "@components/ui/Link.tsx";
import {createFileRoute, Outlet} from "@tanstack/react-router";
import {
  ChartAreaIcon,
  DoorClosedIcon,
  DoorOpenIcon, FolderIcon,
  HomeIcon,
  LogsIcon,
  SettingsIcon,
} from "lucide-react";
import type {CSSProperties} from "react";
import {useTranslation} from "react-i18next";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import {cn} from "@/lib/utils.ts";

export const Route = createFileRoute("/server/$serverId")({
  component: GameServerDetailPage,
});

const iconStyles: CSSProperties = {
  scale: 1.8,
};

const buttonStyles: CSSProperties = {
  padding: "25px",
};

const TABS = [
  {
    label: "overview",
    icon: <HomeIcon style={iconStyles}/>,
    path: "/server/$serverId",
  },
  {
    label: "logs",
    icon: <LogsIcon style={iconStyles}/>,
    path: "/server/$serverId/logs",
  },
  {
    label: "metrics",
    icon: <ChartAreaIcon style={iconStyles}/>,
    path: "/server/$serverId/metrics",
  },
  {
    label: "fileexplorer",
    icon: <FolderIcon style={iconStyles}/>,
    path: "/server/$serverId/file-explorer",
  },
  {
    label: "settings",
    icon: <SettingsIcon style={iconStyles}/>,
    path: "/server/$serverId/settings",
  },
];

function GameServerDetailPage() {
  const {t} = useTranslation();
  const {serverId} = Route.useParams();
  const gameServer = useGameServer(serverId ?? "");

  if (!serverId || !gameServer) {
    return <div>{t("serverPage.notFound")}</div>;
  }

  return (
    <div className="flex w-full min-h-screen">
      <div id={"gameServerDetailPage:exitButton"} className={"flex h-25 items-end w-[10%]"}>
        <Link to={"/"} tabIndex={-1}>
          <FancyNavigationButton isActive={false} label={"Back"} tabIndex={0} direction={"right"} className={"group"}>
            <>
              <DoorClosedIcon className={"group-hover:hidden group-focus:hidden"} style={iconStyles}/>
              <DoorOpenIcon className={"hidden group-hover:inline-block group-focus:inline-block"} style={iconStyles}/>
            </>
          </FancyNavigationButton>
        </Link>
      </div>
      <div className="grow">
        <Outlet/>
      </div>

      <div className="flex flex-col justify-center items-end w-[10%]">
        {TABS.map(({label, icon, path}) => (
          <div className={"relative"}>
            <div>
              <Link
                key={label}
                to={path}
                params={{serverId}}
                activeOptions={{exact: true}}
                className={"group"}
              >
                {({isActive}) => (
                  <FancyNavigationButton isActive={isActive} label={label}>{icon}</FancyNavigationButton>
                )}
              </Link>
            </div>
          </div>
        ))}
        <div className={"bg-accent/5"}></div>
      </div>
    </div>
  );
}

const SIDE_MARGIN = 15;
const FancyNavigationButton = (props: {
  isActive: boolean,
  label: React.ReactNode,
  children: React.ReactNode,
  direction?: "left" | "right",
} & React.ComponentProps<"button">) => {
  const compiledDirection = props.direction ?? "left";
  const compiledMargin = compiledDirection === "left" ? "mr" : "ml";
  return <Button style={buttonStyles}
                 {...props}
                 className={cn(props.isActive ? "bg-button-primary-active" : "", "gap-0", props.className)}
                 tabIndex={-1}>
    {compiledDirection === "right" && props.children}
    <div
      className={cn("group-focus:max-w-25 group-focus:" + compiledMargin + "-1 group-focus:opacity-100",
        "group-hover:max-w-25 group-hover:" + compiledMargin + "-1 group-hover:opacity-100",
        "top-[50%] max-w-0 opacity-0 duration-400 transition-all",
        "align-middle justify-center m-auto relative " + compiledMargin + "-0 overflow-clip")}
      style={{
        transform: "translateX(" +
          ((compiledDirection === "left") ? "-" : "")
          + SIDE_MARGIN + "px) translateY(-50%)"
      }}
    >
      {props.label}
    </div>
    {compiledDirection === "left" && props.children}
  </Button>
}
