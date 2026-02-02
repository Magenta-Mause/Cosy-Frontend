import CpuLimitInputFieldEdit from "@components/display/GameServer/EditGameServer/CpuLimitInputFieldEdit.tsx";
import MemoryLimitInputField from "@components/display/MemoryLimit/MemoryLimitInputField.tsx";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Button } from "@components/ui/button.tsx";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { parse as parseCommand, quote } from "shell-quote";
import * as z from "zod";
import {
  type EnvironmentVariableConfiguration,
  type GameServerDto,
  type GameServerUpdateDto,
  PortMappingProtocol,
} from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { formatMemoryLimit } from "@/lib/memoryFormatUtil.ts";
import {
  MEMORY_LIMIT_MIN_ERROR,
  memoryLimitValidator,
} from "@/lib/validators/memoryLimitValidator.ts";
import InputFieldEditGameServer from "./InputFieldEditGameServer";
import EditKeyValueInput from "./KeyValueInputEditGameServer";
import PortInputEditGameServer from "./PortInputEditGameServer";

const mapGameServerDtoToUpdate = (server: GameServerDto): GameServerUpdateDto => ({
  server_name: server.server_name,
  docker_image_name: server.docker_image_name,
  docker_image_tag: server.docker_image_tag,
  port_mappings: server.port_mappings?.map((pm) => ({
    ...pm,
  })),
  environment_variables: server.environment_variables,
  volume_mounts: server.volume_mounts?.map((v) => ({
    host_path: v.host_path ?? "",
    container_path: v.container_path ?? "",
  })),
  execution_command: server.execution_command,
  docker_hardware_limits: {
    docker_memory_limit: server.docker_hardware_limits?.docker_memory_limit,
    docker_max_cpu_cores: server.docker_hardware_limits?.docker_max_cpu_cores,
  },
});

const EditGameServerPage = (props: {
  serverName: string;
  gameServer: GameServerDto;
  onConfirm: (updatedState: GameServerUpdateDto) => Promise<void>;
}) => {
  const { t } = useTranslationPrefix("components.editGameServer");
  const { t: t_root } = useTranslation();
  const { cpuLimit, memoryLimit } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [gameServerState, setGameServerState] = useState<GameServerUpdateDto>(() =>
    mapGameServerDtoToUpdate(props.gameServer),
  );
  const [executionCommandRaw, setExecutionCommandRaw] = useState(
    quote(gameServerState.execution_command ?? []),
  );
  const [memoryErrorMessage, setMemoryErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const updatedState = mapGameServerDtoToUpdate(props.gameServer);
    setGameServerState(updatedState);
    setExecutionCommandRaw(quote(updatedState.execution_command ?? []));
  }, [props.gameServer]);

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
        return z.string().min(1).safeParse(vol.container_path).success;
      });

    const cpuLimitValid =
      cpuLimit === null ||
      (gameServerState.docker_hardware_limits?.docker_max_cpu_cores !== undefined &&
        gameServerState.docker_hardware_limits?.docker_max_cpu_cores !== null &&
        gameServerState.docker_hardware_limits?.docker_max_cpu_cores > 0);

    const memoryLimitValid =
      memoryLimit === null ||
      (gameServerState.docker_hardware_limits?.docker_memory_limit !== undefined &&
        gameServerState.docker_hardware_limits?.docker_memory_limit !== null &&
        gameServerState.docker_hardware_limits?.docker_memory_limit !== "" &&
        memoryLimitValidator.safeParse(gameServerState.docker_hardware_limits?.docker_memory_limit)
          .success);

    return (
      serverNameValid &&
      gameUuidValid &&
      dockerImageNameValid &&
      dockerImageTagValid &&
      portMappingsValid &&
      envVarsValid &&
      volumeMountsValid &&
      cpuLimitValid &&
      memoryLimitValid
    );
  }, [gameServerState, cpuLimit, memoryLimit]);

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
          host_path: v.host_path ?? "",
          container_path: v.container_path ?? "",
        })) ?? [],
      );

    const normalizeLimitValue = (val: string | number | null | undefined) =>
      val === null || val === undefined || val === "" ? null : val;

    const hardwareLimitsChanged =
      normalizeLimitValue(gameServerState.docker_hardware_limits?.docker_max_cpu_cores) !==
        normalizeLimitValue(props.gameServer.docker_hardware_limits?.docker_max_cpu_cores) ||
      normalizeLimitValue(gameServerState.docker_hardware_limits?.docker_memory_limit) !==
        normalizeLimitValue(props.gameServer.docker_hardware_limits?.docker_memory_limit);

    return (
      commandsChanged ||
      fieldsChanged ||
      portsChanged ||
      envChanged ||
      volumesChanged ||
      hardwareLimitsChanged
    );
  }, [gameServerState, executionCommandRaw, props.gameServer]);

  const handleConfirm = async () => {
    const parsedExecutionCommand = executionCommandRaw.trim()
      ? parseCommand(executionCommandRaw).filter((x): x is string => typeof x === "string")
      : [];
    const payload: GameServerUpdateDto = {
      ...gameServerState,
      execution_command: parsedExecutionCommand,
      port_mappings: gameServerState.port_mappings?.filter(
        (p) => p.instance_port || p.container_port,
      ),
      environment_variables: gameServerState.environment_variables?.filter(
        (env) => env.key?.trim() || env.value?.trim(),
      ),
      volume_mounts: gameServerState.volume_mounts
        ?.filter((vol) => vol.host_path?.trim() || vol.container_path?.trim())
        .map((v) => ({
          host_path: "DUMMY", // remove this with the host_path refactor
          container_path: v.container_path,
        })),
    };
    setLoading(true);
    try {
      await props.onConfirm(payload);
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
          label={t("serverNameSelection.title")}
          value={gameServerState.server_name}
          onChange={(v) => setGameServerState((s) => ({ ...s, server_name: v as string }))}
          validator={z.string().min(1)}
          placeholder="My Game Server"
          description={t("serverNameSelection.description")}
          errorLabel={t("serverNameSelection.errorLabel")}
        />

        <InputFieldEditGameServer
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
            validator={z.string().min(1)}
            placeholder="nginx"
            label={t("dockerImageSelection.title")}
            description={t("dockerImageSelection.description")}
            errorLabel={t("dockerImageSelection.errorLabel")}
            value={gameServerState.docker_image_name}
            onChange={(v) => setGameServerState((s) => ({ ...s, docker_image_name: v as string }))}
          />

          <InputFieldEditGameServer
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
          setValue={(vals) =>
            setGameServerState((s) => ({
              ...s,
              port_mappings: vals,
            }))
          }
          onChange={(ports) =>
            setGameServerState((s) => ({
              ...s,
              port_mappings: ports.map((p) => {
                const hasPorts = p.instance_port || p.container_port;

                return {
                  ...p,
                  protocol: hasPorts ? p.protocol || PortMappingProtocol.TCP : undefined,
                };
              }),
            }))
          }
          keyValidator={z.number().min(1).max(65535)}
          valueValidator={z.number().min(1).max(65535)}
          errorLabel={t("portSelection.errorLabel")}
          required={false}
        />

        <EditKeyValueInput<{
          key: string;
          value: string;
        }>
          fieldLabel={t("environmentVariablesSelection.title")}
          fieldDescription={t("environmentVariablesSelection.description")}
          value={gameServerState.environment_variables}
          setValue={(vals) =>
            setGameServerState((s) => ({
              ...s,
              environment_variables: vals as EnvironmentVariableConfiguration[] | undefined,
            }))
          }
          onChange={(envs) =>
            setGameServerState((s) => ({
              ...s,
              environment_variables: envs,
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
          setValue={(vals) =>
            setGameServerState((s) => ({
              ...s,
              volume_mounts: vals,
            }))
          }
          onChange={(volumes) =>
            setGameServerState((s) => ({
              ...s,
              volume_mounts: volumes,
            }))
          }
          placeHolderKeyInput="Host Path"
          placeHolderValueInput="Container Path"
          keyValidator={z.string()}
          valueValidator={z.string().min(1)}
          errorLabel={t("volumeMountSelection.errorLabel")}
          required={false}
          inputType="text"
          objectKey="host_path"
          objectValue="container_path"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CpuLimitInputFieldEdit
          placeholder="0.5"
          label={t("cpuLimitSelection.title") + (cpuLimit === null ? " (Optional)" : "")}
          description={
            cpuLimit !== null
              ? `${t("cpuLimitSelection.description")} ${t_root("common.yourLimit")}: ${cpuLimit} Cores)`
              : t("cpuLimitSelection.description")
          }
          errorLabel={t("cpuLimitSelection.errorLabel")}
          value={gameServerState.docker_hardware_limits?.docker_max_cpu_cores}
          onChange={(v) =>
            setGameServerState((s) => ({
              ...s,
              docker_hardware_limits: {
                ...s.docker_hardware_limits,
                docker_max_cpu_cores: v !== null && v !== "" ? Number(v) : undefined,
              },
            }))
          }
          optional={cpuLimit === null}
        />

        <MemoryLimitInputField
          id="memory_limit"
          validator={memoryLimitValidator}
          placeholder="512"
          label={`${t("memoryLimitSelection.title")} ${memoryLimit === null ? " (Optional)" : ""}`}
          description={
            memoryLimit !== null
              ? `${t("memoryLimitSelection.description")} (${t_root("common.yourLimit")}: ${formatMemoryLimit(memoryLimit)})`
              : t("memoryLimitSelection.description")
          }
          errorLabel={t("memoryLimitSelection.errorLabel")}
          value={gameServerState.docker_hardware_limits?.docker_memory_limit}
          onChange={(v) => {
            // Check if value is below 6MiB for custom error
            let customError: string | undefined;
            if (v && typeof v === "string") {
              const match = v.match(/^(\d+(?:\.\d+)?)(MiB|GiB)$/);
              if (match) {
                const [, numStr, unit] = match;
                const num = parseFloat(numStr);
                if (unit === "MiB" && num < 6) {
                  customError = MEMORY_LIMIT_MIN_ERROR;
                }
              }
            }
            setMemoryErrorMessage(customError);

            setGameServerState((s) => ({
              ...s,
              docker_hardware_limits: {
                ...s.docker_hardware_limits,
                docker_memory_limit: v && v !== "" ? v : undefined,
              },
            }));
          }}
          optional={memoryLimit === null}
          customErrorMessage={memoryErrorMessage}
        />
      </div>

      <div className="sticky bottom-4 w-fit ml-auto flex gap-4">
        <Button
          className="h-12.5"
          variant="secondary"
          disabled={loading || !isChanged}
          onClick={() => {
            setGameServerState(mapGameServerDtoToUpdate(props.gameServer));
            setExecutionCommandRaw(quote(props.gameServer.execution_command ?? []));
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

export default EditGameServerPage;
