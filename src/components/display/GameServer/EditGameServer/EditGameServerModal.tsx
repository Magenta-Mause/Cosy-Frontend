import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import { useEffect, useMemo, useState } from "react";
import { parse as parseCommand } from "shell-quote";
import * as z from "zod";
import {
  type GameServerDto,
  type GameServerUpdateDto,
  PortMappingProtocol,
} from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import InputFieldEditGameServer from "./InputFieldEditGameServer";
import EditKeyValueInput from "./KeyValueInputEditGameServer";
import PortInputEditGameServer from "./PortInputEditGameServer";

const mapGameServerDtoToUpdate = (server: GameServerDto): GameServerUpdateDto => ({
  server_name: server.server_name,
  docker_image_name: server.docker_image_name,
  docker_image_tag: server.docker_image_tag,
  port_mappings: server.port_mappings,
  environment_variables: server.environment_variables,
  volume_mounts: server.volume_mounts?.map((v) => ({
    host_path: "",
    container_path: v.container_path ?? "",
  })),
  execution_command: server.execution_command,
});

const EditGameServerModal = (props: {
  serverName: string;
  gameServer: GameServerDto;
  onConfirm: (updatedState: GameServerUpdateDto) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslationPrefix("components.editGameServer");
  const [loading, setLoading] = useState(false);
  const [gameServerState, setGameServerState] = useState<GameServerUpdateDto>(() =>
    mapGameServerDtoToUpdate(props.gameServer),
  );
  const [executionCommandRaw, setExecutionCommandRaw] = useState(
    (gameServerState.execution_command ?? []).join(" "),
  );

  useEffect(() => {
    if (!props.open) return;
    const updatedState = mapGameServerDtoToUpdate(props.gameServer);
    setGameServerState(updatedState);
    setExecutionCommandRaw((updatedState.execution_command ?? []).join(" "));
  }, [props.open, props.gameServer]);

  const allFieldsValid = useMemo(() => {
    const serverNameValid = z.string().min(1).safeParse(gameServerState.server_name).success;
    const gameUuidValid = true;
    const dockerImageNameValid = z
      .string()
      .min(1)
      .safeParse(gameServerState.docker_image_name).success;
    const dockerImageTagValid = z
      .string()
      .min(1)
      .safeParse(gameServerState.docker_image_tag).success;

    const portMappingsValid =
      !gameServerState.port_mappings ||
      gameServerState.port_mappings.length === 0 ||
      gameServerState.port_mappings.every((mapping) => {
        if (!mapping.container_port && !mapping.instance_port && mapping.protocol) return true;
        const keyValid = z
          .number()
          .min(1)
          .max(65535)
          .safeParse(Number(mapping.instance_port)).success;
        const valueValid = z
          .number()
          .min(1)
          .max(65535)
          .safeParse(Number(mapping.container_port)).success;
        const protocolValid = !!mapping.protocol;
        return keyValid && valueValid && protocolValid;
      });

    const envVarsValid =
      !gameServerState.environment_variables ||
      gameServerState.environment_variables.length === 0 ||
      gameServerState.environment_variables.every((env) => {
        if (!env.key && !env.value) return true;
        const keyValid = z.string().min(1).safeParse(env.key).success;
        const valueValid = z.string().min(1).safeParse(env.value).success;
        return keyValid && valueValid;
      });

    const volumeMountsValid =
      !gameServerState.volume_mounts ||
      gameServerState.volume_mounts.length === 0 ||
      gameServerState.volume_mounts.every((vol) => {
        if (!vol.host_path && !vol.container_path) return true;
        const hostPathValid = z.string().min(1).safeParse(vol.host_path).success;
        const containerPathValid = z.string().min(1).safeParse(vol.container_path).success;
        return hostPathValid && containerPathValid;
      });

    return (
      serverNameValid &&
      gameUuidValid &&
      dockerImageNameValid &&
      dockerImageTagValid &&
      portMappingsValid &&
      envVarsValid &&
      volumeMountsValid
    );
  }, [gameServerState]);

  const isChanged = useMemo(() => {
    const parsedCommand = executionCommandRaw.trim()
      ? parseCommand(executionCommandRaw).filter((x): x is string => typeof x === "string")
      : [];
    const commandsChanged =
      parsedCommand.length !== (props.gameServer.execution_command?.length ?? 0) ||
      parsedCommand.some((c, i) => c !== props.gameServer.execution_command?.[i]);

    const fieldsChanged =
      gameServerState.server_name !== props.gameServer.server_name ||
      gameServerState.docker_image_name !== props.gameServer.docker_image_name ||
      gameServerState.docker_image_tag !== props.gameServer.docker_image_tag;

    const portsChanged =
      JSON.stringify(gameServerState.port_mappings ?? []) !==
      JSON.stringify(props.gameServer.port_mappings ?? []);

    const envChanged =
      JSON.stringify(gameServerState.environment_variables ?? []) !==
      JSON.stringify(props.gameServer.environment_variables ?? []);

    const volumesChanged =
      JSON.stringify(
        gameServerState.volume_mounts?.map((v) => ({
          host_path: v.host_path ?? "",
          container_path: v.container_path ?? "",
        })) ?? [],
      ) !==
      JSON.stringify(
        props.gameServer.volume_mounts?.map((v) => ({
          host_path: "",
          container_path: v.container_path ?? "",
        })) ?? [],
      );
    return commandsChanged || fieldsChanged || portsChanged || envChanged || volumesChanged;
  }, [gameServerState, executionCommandRaw, props.gameServer]);

  const handleConfirm = async () => {
    const parsedExecutionCommand = executionCommandRaw.trim()
      ? parseCommand(executionCommandRaw).filter((x): x is string => typeof x === "string")
      : [];
    const payload: GameServerUpdateDto = {
      ...gameServerState,
      execution_command: parsedExecutionCommand,
    };
    setLoading(true);
    try {
      await props.onConfirm(payload);
      props.onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const isConfirmButtonDisabled = loading || !isChanged || !allFieldsValid;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title", { serverName: props.serverName })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <DialogMain className="overflow-y-scroll">
          <InputFieldEditGameServer
            id="server_name"
            label={t("serverNameSelection.title")}
            value={gameServerState.server_name}
            onChange={(v) => setGameServerState((s) => ({ ...s, server_name: v as string }))}
            validator={z.string().min(1)}
            placeholder="My Game Server"
            description={t("serverNameSelection.description")}
            errorLabel={t("serverNameSelection.errorLabel")}
          />

          <InputFieldEditGameServer
            id="external_game_id"
            validator={z.string().min(1)}
            placeholder="Game"
            label={t("gameSelection.title")}
            description={t("gameSelection.description")}
            errorLabel={t("gameSelection.errorLabel")}
            value={gameServerState.external_game_id}
            disabled={true}
            onChange={(v) => setGameServerState((s) => ({ ...s, game_uuid: v as string }))}
            optional={true}
          />

          <div className="grid grid-cols-2 gap-4">
            <InputFieldEditGameServer
              id="docker_image_name"
              validator={z.string().min(1)}
              placeholder="nginx"
              label={t("dockerImageSelection.title")}
              description={t("dockerImageSelection.description")}
              errorLabel={t("dockerImageSelection.errorLabel")}
              value={gameServerState.docker_image_name}
              onChange={(v) =>
                setGameServerState((s) => ({ ...s, docker_image_name: v as string }))
              }
            />

            <InputFieldEditGameServer
              id="docker_image_tag"
              validator={z.string().min(1)}
              placeholder="latest"
              label={t("imageTagSelection.title")}
              description={t("imageTagSelection.description")}
              errorLabel={t("imageTagSelection.errorLabel")}
              value={gameServerState.docker_image_tag}
              onChange={(v) => setGameServerState((s) => ({ ...s, docker_image_tag: v as string }))}
            />
          </div>

          <PortInputEditGameServer
            fieldLabel={t("portSelection.title")}
            fieldDescription={t("portSelection.description")}
            value={gameServerState.port_mappings}
            onChange={(ports) =>
              setGameServerState((s) => ({
                ...s,
                port_mappings: ports
                  .map((p) => {
                    const hasPorts = p.instance_port || p.container_port;

                    return {
                      ...p,
                      protocol: hasPorts ? p.protocol || PortMappingProtocol.TCP : undefined,
                    };
                  })
                  .filter((p) => p.instance_port || p.container_port),
              }))
            }
            keyValidator={z.number().min(1).max(65535)}
            valueValidator={z.number().min(1).max(65535)}
            errorLabel={t("portSelection.errorLabel")}
            required={false}
          />

          <EditKeyValueInput<{ key: string; value: string }>
            fieldLabel={t("environmentVariablesSelection.title")}
            fieldDescription={t("environmentVariablesSelection.description")}
            value={gameServerState.environment_variables}
            onChange={(envs) =>
              setGameServerState((s) => ({
                ...s,
                environment_variables: envs.filter((env) => env.key?.trim() || env.value?.trim()),
              }))
            }
            placeHolderKeyInput="KEY"
            placeHolderValueInput="VALUE"
            keyValidator={z.string().min(1)}
            valueValidator={z.string().min(1)}
            errorLabel={t("environmentVariablesSelection.errorLabel")}
            required={false}
            inputType="text"
            objectKey="key"
            objectValue="value"
          />

          <InputFieldEditGameServer
            id="execution_command"
            validator={z.string()}
            placeholder="./start.sh"
            label={t("executionCommandSelection.title")}
            description={t("executionCommandSelection.description")}
            errorLabel={t("executionCommandSelection.errorLabel")}
            value={executionCommandRaw}
            onChange={(v) => setExecutionCommandRaw((v ?? "") as string)}
          />

          <EditKeyValueInput<{
            host_path: string;
            container_path: string;
          }>
            fieldLabel={t("volumeMountSelection.title")}
            fieldDescription={t("volumeMountSelection.description")}
            value={gameServerState.volume_mounts}
            onChange={(volumes) =>
              setGameServerState((s) => ({
                ...s,
                volume_mounts: volumes.filter(
                  (vol) => vol.host_path?.trim() || vol.container_path?.trim(),
                ),
              }))
            }
            placeHolderKeyInput="Host Path"
            placeHolderValueInput="Container Path"
            keyValidator={z.string().min(1)}
            valueValidator={z.string().min(1)}
            errorLabel={t("volumeMountSelection.errorLabel")}
            required={false}
            inputType="text"
            objectKey="host_path"
            objectValue="container_path"
          />
        </DialogMain>

        <DialogFooter>
          <DialogClose asChild>
            <Button className="h-12.5" variant="secondary" disabled={loading}>
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleConfirm}
            className="h-12.5"
            disabled={isConfirmButtonDisabled}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditGameServerModal;
