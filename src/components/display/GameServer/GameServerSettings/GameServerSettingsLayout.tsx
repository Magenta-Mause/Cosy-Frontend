import { Button } from "@components/ui/button";
import Link from "@components/ui/Link";
import { ContainerIcon, NetworkIcon, SettingsIcon } from "lucide-react";
import { type CSSProperties, createContext, useCallback, useState } from "react";

interface ServerSettingsState {
  serverName: string;
}

interface SettingsProvider {
  settings: ServerSettingsState;
  setSettings: <K extends keyof ServerSettingsState>(
    ServerSettingsStateKey: K,
  ) => (value: ServerSettingsState[K]) => void;
}

const SettingsProvider = createContext<SettingsProvider>({
  settings: { serverName: "" },
  setSettings: () => () => {},
});

const iconStyles: CSSProperties = {
  scale: 1.8,
};

const TABS = [
  {
    label: "general",
    icon: <SettingsIcon style={iconStyles} />,
    path: "/server/$serverId/settings/general",
  },
  {
    label: "network",
    icon: <NetworkIcon style={iconStyles} />,
    path: "/server/$serverId/settings/network",
  },
  {
    label: "docker",
    icon: <ContainerIcon style={iconStyles} />,
    path: "/server/$serverId/settings/docker",
  },
];

interface GameServerSettingsProps {
  initialSettings: ServerSettingsState;
  children: React.ReactNode;
}

const GameServerSettingsLayout = ({ initialSettings, children }: GameServerSettingsProps) => {
  const [serverSettings, setServerSettings] = useState<ServerSettingsState>(initialSettings);

  const setSettings: SettingsProvider["setSettings"] = useCallback(
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
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col justify-center items-end w-[20%]">
          {TABS.map(({ label, icon, path }) => (
            <div key={`${label}:${path}`} className={"relative w-full"}>
              <Link
                key={label}
                to={path}
                activeOptions={{ exact: true }}
                className={"group w-full"}
              >
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "primary" : "secondary"}
                    className={"w-full flex justify-start"}
                  >
                    {icon}
                    <p>{label}</p>
                  </Button>
                )}
              </Link>
            </div>
          ))}
        </div>
        <div className="w-full">{children}</div>
      </div>
    </SettingsProvider.Provider>
  );
};

export default GameServerSettingsLayout;
export { SettingsProvider, type ServerSettingsState };
