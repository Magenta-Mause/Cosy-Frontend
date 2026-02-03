import InputFieldEditGameServer from "@components/display/GameServer/EditGameServer/InputFieldEditGameServer.tsx";
import { Button } from "@components/ui/button.tsx";
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
  const [rconPort, setRconPort] = useState<string | undefined>(rconState?.port?.toString() ?? "");
  const [rconPassword, setRconPassword] = useState<string | undefined>(rconState?.password);

  useEffect(() => {
    setRconState(props.gameServer.rcon_configuration);
  }, [props.gameServer]);

  const allFieldsValid = useMemo(() => {
    const rconPortValid = z.coerce.number().min(1).max(65535).safeParse(rconPort).success;
    const rconPasswordValid = z.string().min(1).safeParse(rconPassword).success;

    return rconPasswordValid && rconPortValid;
  }, [rconPassword, rconPort]);

  const isChanged = useMemo(() => {
    const rconPasswordChanged = rconPassword !== rconState?.password;
    const rconPortChanged = !(
      (rconPort === "" && rconState?.port === undefined) ||
      Number(rconPort) === rconState?.port
    );

    return rconPasswordChanged || rconPortChanged;
  }, [rconPassword, rconPort, rconState?.password, rconState?.port]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await props.onConfirm({
        password: rconPassword,
        port: Number(rconPort) ?? rconState?.port ?? undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const isConfirmButtonDisabled = loading || !isChanged || !allFieldsValid;

  return (
    <div className="relative pr-3 pb-10">
      <div>
        <h2>{t("title")}</h2>
      </div>

      <div>
        <InputFieldEditGameServer
          label={t("rconPort.title")}
          value={rconPort}
          onChange={(v) => setRconPort((v as string) ?? "")}
          validator={z.coerce.number().min(1).max(65535)}
          placeholder="25575"
          description={t("rconPort.description")}
          errorLabel={t("rconPort.errorLabel")}
          optional
        />

        <InputFieldEditGameServer
          label={t("rconPassword.title")}
          value={rconPassword === undefined ? "" : String(rconPassword)}
          onChange={(v) => setRconPassword(v as string)}
          validator={z.string().min(1)}
          placeholder="mysecretpassword"
          description={t("rconPassword.description")}
          errorLabel={t("rconPassword.errorLabel")}
          optional
        />
      </div>

      <div className="sticky bottom-4 w-fit ml-auto flex gap-4">
        <Button
          className="h-12.5"
          variant="secondary"
          disabled={loading || !isChanged}
          onClick={() => {
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
