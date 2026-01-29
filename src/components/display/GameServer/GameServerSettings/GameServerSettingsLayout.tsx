import { Button } from "@components/ui/button";
import Link from "@components/ui/Link";
import { Separator } from "@components/ui/separator.tsx";
import { ChartAreaIcon, LayoutDashboardIcon, SettingsIcon, User } from "lucide-react";
import { type CSSProperties, createContext, useCallback, useState } from "react";

interface ServerSettingsState {
  serverName: string;
}

interface SettingsContextType {
  settings: ServerSettingsState;
  setSettings: <K extends keyof ServerSettingsState>(
    ServerSettingsStateKey: K,
  ) => (value: ServerSettingsState[K]) => void;
}

const SettingsProvider = createContext<SettingsContextType>({
  settings: { serverName: "" },
  setSettings: () => () => {},
});

const iconStyles: CSSProperties = {
  scale: 1.8,
};

const TABS = [
  {
    label: "general",
    icon: <SettingsIcon style={iconStyles} className="mr-2" />,
    path: "/server/$serverId/settings/general",
  },
  {
    label: "privateDashboard",
    icon: <LayoutDashboardIcon style={iconStyles} className="mr-2" />,
    path: "/server/$serverId/settings/privateDashboard",
  },
  {
    label: "publicDashboard",
    icon: <LayoutDashboardIcon style={iconStyles} className="mr-2" />,
    path: "/server/$serverId/settings/publicDashboard",
  },
  {
    label: "metrics",
    icon: <ChartAreaIcon style={iconStyles} className="mr-2" />,
    path: "/server/$serverId/settings/metrics",
  },
  {
    label: "accessManagement",
    icon: <User style={iconStyles} className="mr-2" />,
    path: "/server/$serverId/settings/accessManagement",
  },
];

interface GameServerSettingsProps {
  initialSettings: ServerSettingsState;
  children: React.ReactNode;
}

const GameServerSettingsLayout = ({ initialSettings, children }: GameServerSettingsProps) => {
  const [serverSettings, setServerSettings] = useState<ServerSettingsState>(initialSettings);

  const setSettings: SettingsContextType["setSettings"] = useCallback(
    (settingsKey) => (newValue) => {
      setServerSettings((prevSettings) => ({
        ...prevSettings,
        [settingsKey]: newValue,
      }));
    },
    [],
  );

  return (
    <SettingsProvider.Provider value={{ settings: serverSettings, setSettings }}>
      <div className="flex gap-4 h-full">
        <div className="flex flex-col justify-center items-end w-[20%] align-top h-fit">
          {TABS.map(({ label, icon, path }) => (
            <div key={`${label}:${path}`} className={"relative w-full py-0.5"}>
              <Link
                key={label}
                to={path}
                activeOptions={{ exact: true }}
                className={"group w-full"}
              >
                {({ isActive }) => (
                  <Button
                    className={`w-full flex justify-start border-0 shadow-none bg-button-primary-default ${
                      isActive && "bg-button-primary-active hover:bg-button-primary-default"
                    }`}
                  >
                    {icon}
                    <p>{label}</p>
                  </Button>
                )}
              </Link>
            </div>
          ))}
        </div>
        <Separator className="m-4" orientation="vertical" />
        <div className="w-full overflow-y-auto">{children}</div>
      </div>
    </SettingsProvider.Provider>
  );
};

export default GameServerSettingsLayout;
export { SettingsProvider, type ServerSettingsState };
