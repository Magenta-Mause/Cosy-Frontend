import InputFieldEditGameServer from "@components/display/GameServer/EditGameServer/InputFieldEditGameServer.tsx";
import { Button } from "@components/ui/button.tsx";
import { Checkbox } from "@components/ui/checkbox.tsx";
import { useEffect, useMemo, useState } from "react";
import * as z from "zod";
import type { GameServerDto, RCONConfiguration } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

const RconSettings = (props: {
  serverName: string;
  gameServer: GameServerDto;
  onConfirm: (updatedState: RCONConfiguration) => Promise<void>;
}) => {
  const { t } = useTranslationPrefix("components.gameServerSettings.rconSettings");
  const [loading, setLoading] = useState(false);
  const [rconState, setRconState] = useState<RCONConfiguration | undefined>(
    () => props.gameServer.rcon_configuration,
  );
  const [rconEnabled, setRconEnabled] = useState(rconState?.enabled ?? false);
  const [rconPort, setRconPort] = useState<string | undefined>(rconState?.port?.toString() ?? "");
  const [rconPassword, setRconPassword] = useState<string | undefined>(rconState?.password);

  useEffect(() => {
    const newRconConfig = props.gameServer.rcon_configuration;
    setRconState(newRconConfig);
    setRconEnabled(newRconConfig?.enabled ?? false);
    setRconPort(
      newRconConfig?.port !== undefined && newRconConfig?.port !== null
        ? newRconConfig.port.toString()
        : "",
    );
    setRconPassword(newRconConfig?.password);
  }, [props.gameServer]);

  const allFieldsValid = useMemo(() => {
    const rconPortValid = z.coerce.number().min(1).max(65535).safeParse(rconPort).success;
    const rconPasswordValid = z.string().min(1).safeParse(rconPassword).success;

    return (rconPasswordValid && rconPortValid) || !rconEnabled;
  }, [rconPassword, rconPort, rconEnabled]);

  const isChanged = useMemo(() => {
    const rconEnabledChanged = rconEnabled !== rconState?.enabled;
    const rconPasswordChanged = rconPassword !== rconState?.password;
    const rconPortChanged = !(
      (rconPort === "" && (rconState?.port === undefined || rconState?.port === null)) ||
      Number(rconPort) === rconState?.port
    );

    return rconPasswordChanged || rconPortChanged || rconEnabledChanged;
  }, [
    rconPassword,
    rconPort,
    rconState?.password,
    rconState?.port,
    rconEnabled,
    rconState?.enabled,
  ]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await props.onConfirm({
        enabled: rconEnabled,
        password: rconPassword,
        ...(rconPort !== "" && { port: Number(rconPort) }),
      });
    } finally {
      setLoading(false);
    }
  };

  const isConfirmButtonDisabled = loading || !isChanged || !allFieldsValid;

  return (
    <div className="relative pr-3 pb-10 gap-5 flex flex-col">
      <div>
        <h2>{t("title")}</h2>
        <p className={"text-sm text-muted-foreground leading-none"}>
          {t("description.part1")} <br />
          {t("description.part2")}{" "}
          <a
            href={"https://developer.valvesoftware.com/wiki/Source_RCON_Protocol"}
            className={"text-button-primary-active/80 underline"}
            target={"_blank"}
            rel="noopener"
          >
            RCON
          </a>{" "}
          {t("description.part3")}
        </p>
      </div>

      <div className="flex flex-col gap-4" style={{ maxHeight: "calc(100vh - 20rem)" }}>
        <button
          type="button"
          className={"cursor-pointer flex gap-2 align-middle items-center select-none grow-0 w-fit"}
          onClick={() => setRconEnabled((prev) => !prev)}
        >
          <Checkbox
            checked={rconEnabled}
            className={"size-5"}
          />
          <span className={"text-sm"}>{t("enableRcon")}</span>
        </button>
        <InputFieldEditGameServer
          label={t("rconPort.title")}
          value={rconPort}
          onChange={(v) => setRconPort((v as string) ?? "")}
          validator={z.coerce.number().min(1).max(65535)}
          placeholder="25575"
          description={t("rconPort.description")}
          errorLabel={t("rconPort.errorLabel")}
          optional={!rconEnabled}
          disabled={!rconEnabled}
          onEnterPress={isConfirmButtonDisabled ? undefined : handleConfirm}
        />

        <InputFieldEditGameServer
          label={t("rconPassword.title")}
          value={rconPassword === undefined ? "" : String(rconPassword)}
          onChange={(v) => setRconPassword(v as string)}
          validator={z.string().min(1)}
          placeholder="mysecretpassword"
          description={t("rconPassword.description")}
          errorLabel={t("rconPassword.errorLabel")}
          optional={!rconEnabled}
          disabled={!rconEnabled}
          onEnterPress={isConfirmButtonDisabled ? undefined : handleConfirm}
        />
      </div>

      <div className="sticky bottom-4 w-fit ml-auto flex gap-4">
        <Button
          className="h-12.5"
          variant="secondary"
          disabled={loading || !isChanged}
          onClick={() => {
            setRconEnabled(rconState?.enabled ?? false);
            setRconPort(rconState?.port?.toString() ?? "");
            setRconPassword(rconState?.password);
          }}
        >
          {t("revert")}
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          className="h-12.5"
          disabled={isConfirmButtonDisabled}
        >
          {t("confirm")}
        </Button>
      </div>
    </div>
  );
};

export default RconSettings;
