import { Input } from "@components/ui/input";
import { useContext, useState } from "react";
import { SettingsProvider } from "../GameServerSettingsLayout";

const GeneralSettingsSection = () => {
  const { settings, setSettings } = useContext(SettingsProvider);
  const [displayValue, setDisplayValue] = useState(settings.serverName);

  return (
    <Input
      value={displayValue}
      onChange={(e) => {
        setDisplayValue(e.target.value);
        setSettings("serverName")(e.target.value);
      }}
    ></Input>
  );
};

export default GeneralSettingsSection;
