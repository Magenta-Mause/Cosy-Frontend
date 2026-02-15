import { Button } from "@components/ui/button";
import Link from "@components/ui/Link";
import { Separator } from "@components/ui/separator.tsx";
import {
  ChartAreaIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  SquareTerminalIcon,
  User,
  WebhookIcon,
} from "lucide-react";
import {
  type CSSProperties,
  createContext,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

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

const ResizableLabel = ({ label }: { label: string }) => {
  const ref = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const computed = getComputedStyle(el);
    let fontSize = parseFloat(computed.fontSize) || 16;
    el.style.fontSize = `${fontSize}px`;

    let iterations = 0;
    while (el.scrollWidth > el.clientWidth && fontSize > 12 && iterations < 50) {
      fontSize -= 1;
      el.style.fontSize = `${fontSize}px`;
      iterations += 1;
    }
  }, []);

  return (
    <p ref={ref} className="truncate overflow-hidden text-left" style={{ margin: 0 }}>
      {label}
    </p>
  );
};

const iconStyles: CSSProperties = {
  transform: "scale(1.8)",
};

interface GameServerSettingsProps {
  initialSettings: ServerSettingsState;
  children: React.ReactNode;
}

const GameServerSettingsLayout = ({ initialSettings, children }: GameServerSettingsProps) => {
  const [serverSettings, setServerSettings] = useState<ServerSettingsState>(initialSettings);

  const { t } = useTranslationPrefix("components.GameServerSettings");

  const TABS = [
    {
      label: t("tabs.general"),
      icon: <SettingsIcon style={iconStyles} className="mr-2" />,
      path: "/server/$serverId/settings/general",
    },
    {
      label: t("tabs.privateDashboard"),
      icon: <LayoutDashboardIcon style={iconStyles} className="mr-2" />,
      path: "/server/$serverId/settings/private-dashboard",
    },
    {
      label: t("tabs.publicDashboard"),
      icon: <LayoutDashboardIcon style={iconStyles} className="mr-2" />,
      path: "/server/$serverId/settings/public-dashboard",
    },
    {
      label: t("tabs.metrics"),
      icon: <ChartAreaIcon style={iconStyles} className="mr-2" />,
      path: "/server/$serverId/settings/metrics",
    },
    {
      label: t("tabs.rcon"),
      icon: <SquareTerminalIcon style={iconStyles} className="mr-2" />,
      path: "/server/$serverId/settings/rcon",
    },
    {
      label: t("tabs.webhooks"),
      icon: <WebhookIcon style={iconStyles} className="mr-2" />,
      path: "/server/$serverId/settings/webhooks",
    },
    {
      label: t("tabs.accessManagement"),
      icon: <User style={iconStyles} className="mr-2" />,
      path: "/server/$serverId/settings/access-management",
    },
  ];

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
      <div className="flex gap-4 h-full overflow-clip">
        <div className="flex flex-col justify-center items-end w-[20%] min-w-0 align-top h-fit">
          {TABS.map(({ label, icon, path }) => (
            <div key={`${label}:${path}`} className={"relative w-full py-0.5"}>
              <Link
                key={label}
                to={path}
                activeOptions={{ exact: true }}
                className={"group w-full"}
                tabIndex={-1}
              >
                {({ isActive }) => (
                  <Button
                    className={`w-full min-w-0 flex justify-start border-0 shadow-none bg-button-primary-default ${
                      isActive && "bg-button-primary-active hover:bg-button-primary-default"
                    }`}
                  >
                    {icon}
                    <ResizableLabel label={label} />
                  </Button>
                )}
              </Link>
            </div>
          ))}
        </div>
        <Separator className="m-4" orientation="vertical" />
        <div className="w-full max-w-full overflow-y-auto">{children}</div>
      </div>
    </SettingsProvider.Provider>
  );
};

export default GameServerSettingsLayout;
export { SettingsProvider, type ServerSettingsState };
