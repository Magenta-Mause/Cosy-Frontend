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
import { useMemo, useState } from "react";
import { parse as parseCommand } from "shell-quote";
import { toast } from "sonner";
import * as z from "zod";
import type {
  GameServerDto,
  GameServerUpdateDto,
  PortMappingProtocol,
} from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import EditKeyValueInput from "./EditKeyValueInput";
import GameServerEditInputField from "./GameServerEditInputField";

const EditGameServerModal = (props: {
  serverName: string;
  gameServer: GameServerDto;
  onConfirm: (updatedState: GameServerUpdateDto) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslationPrefix("components.editGameServer");
  const [loading, setLoading] = useState(false);

  const originalState: GameServerUpdateDto = useMemo(
    () => ({
      game_uuid: props.gameServer.game_uuid,
      server_name: props.gameServer.server_name,
      docker_image_name: props.gameServer.docker_image_name,
      docker_image_tag: props.gameServer.docker_image_tag,
      port_mappings: props.gameServer.port_mappings,
      environment_variables: props.gameServer.environment_variables,
      execution_command: props.gameServer.execution_command,
      volume_mounts: props.gameServer.volume_mounts?.map((v) => ({
        host_path: v.host_path ?? "",
        container_path: v.container_path ?? "",
      })),
    }),
    [props.gameServer],
  );

  const [gameServerState, setGameServerState] = useState<GameServerUpdateDto>(originalState);

  const [executionCommandRaw, setExecutionCommandRaw] = useState(
    (originalState.execution_command ?? []).join(" "),
  );

  const allFieldsValid = useMemo(() => {
    const serverNameValid = z.string().min(1).safeParse(gameServerState.server_name).success;
    const gameUuidValid = z.string().min(1).safeParse(gameServerState.game_uuid).success;
    const dockerImageNameValid = z.string().min(1).safeParse(gameServerState.docker_image_name).success;
    const dockerImageTagValid = z.string().min(1).safeParse(gameServerState.docker_image_tag).success;
    const executionCommandValid = z.string().min(1).safeParse(executionCommandRaw).success;
    const portMappingsValid = gameServerState.port_mappings && gameServerState.port_mappings.length > 0;

    return serverNameValid && gameUuidValid && dockerImageNameValid && dockerImageTagValid && executionCommandValid && portMappingsValid;
  }, [gameServerState, executionCommandRaw]);

  const isChanged = useMemo(() => {
    const withParsedCommand: GameServerUpdateDto = {
      ...gameServerState,
      execution_command: executionCommandRaw.trim()
        ? parseCommand(executionCommandRaw).filter((x): x is string => typeof x === "string")
        : [],
    };

    return JSON.stringify(withParsedCommand) !== JSON.stringify(originalState);
  }, [gameServerState, executionCommandRaw, originalState]);

  const isConfirmButtonDisabled = loading || !isChanged || !allFieldsValid;

  const handleConfirm = async () => {
    if (!props.gameServer.uuid) {
      toast.error(t("missingUuidError"));
      return;
    }

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
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setGameServerState(originalState);
      setExecutionCommandRaw((originalState.execution_command ?? []).join(" "));
    }

    props.onOpenChange(open);
  };

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent className="font-mono">
        <DialogHeader>
          <DialogTitle>{t("title", { serverName: props.serverName })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <DialogMain>
          <GameServerEditInputField
            id="server_name"
            validator={z.string().min(1)}
            placeholder="My Game Server"
            label={t("serverNameSelection.title")}
            description={t("serverNameSelection.description")}
            errorLabel={t("serverNameSelection.errorLabel")}
            value={gameServerState.server_name}
            onChange={(v) => setGameServerState((s) => ({ ...s, server_name: v }))}
          />

          <GameServerEditInputField
            id="game_uuid"
            validator={z.string().min(1)}
            placeholder="Game"
            label={t("gameSelection.title")}
            description={t("gameSelection.description")}
            errorLabel={t("gameSelection.errorLabel")}
            value={gameServerState.game_uuid}
            onChange={(v) => setGameServerState((s) => ({ ...s, game_uuid: v }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <GameServerEditInputField
              id="docker_image_name"
              validator={z.string().min(1)}
              placeholder="nginx"
              label={t("dockerImageSelection.title")}
              description={t("dockerImageSelection.description")}
              errorLabel={t("dockerImageSelection.errorLabel")}
              value={gameServerState.docker_image_name}
              onChange={(v) => setGameServerState((s) => ({ ...s, docker_image_name: v }))}
            />

            <GameServerEditInputField
              id="docker_image_tag"
              validator={z.string().min(1)}
              placeholder="latest"
              label={t("imageTagSelection.title")}
              description={t("imageTagSelection.description")}
              errorLabel={t("imageTagSelection.errorLabel")}
              value={gameServerState.docker_image_tag}
              onChange={(v) => setGameServerState((s) => ({ ...s, docker_image_tag: v }))}
            />
          </div>

          <EditKeyValueInput
            label={t("portSelection.title")}
            description={t("portSelection.description")}
            value={gameServerState.port_mappings}
            onChange={(ports) => setGameServerState((s) => ({ ...s, port_mappings: ports }))}
            toRow={(pm) => ({
              key: pm.instance_port?.toString() ?? "",
              value: pm.container_port?.toString() ?? "",
            })}
            fromRow={(row) => ({
              instance_port: row.key ? Number(row.key) : undefined,
              container_port: row.value ? Number(row.value) : undefined,
              protocol: "TCP" as PortMappingProtocol,
            })}
            keyValidator={z.string().min(1).regex(/^\d+$/).refine(val => {
              const num = Number(val);
              return num >= 1 && num <= 65535;
            })}
            valueValidator={z.string().min(1).regex(/^\d+$/).refine(val => {
              const num = Number(val);
              return num >= 1 && num <= 65535;
            })}
            errorLabel={t("portSelection.errorLabel")}
            required={true}
          />
          <EditKeyValueInput
            label={t("environmentVariablesSelection.title")}
            description={t("environmentVariablesSelection.description")}
            value={gameServerState.environment_variables}
            onChange={(envs) =>
              setGameServerState((s) => ({
                ...s,
                environment_variables: envs,
              }))
            }
            toRow={(e) => ({ key: e.key, value: e.value })}
            fromRow={(row) => ({ key: row.key, value: row.value })}
            keyValidator={z.string().min(1)}
            valueValidator={z.string().min(1)}
            errorLabel={t("environmentVariablesSelection.errorLabel")}
          />

          <GameServerEditInputField
            id="execution_command"
            validator={z.string().min(1)}
            placeholder="./start.sh"
            label={t("executionCommandSelection.title")}
            description={t("executionCommandSelection.description")}
            errorLabel={t("executionCommandSelection.errorLabel")}
            value={executionCommandRaw}
            onChange={setExecutionCommandRaw}
          />

          <EditKeyValueInput
            label={t("volumeMountSelection.title")}
            description={t("volumeMountSelection.description")}
            value={gameServerState.volume_mounts}
            onChange={(volumes) => setGameServerState((s) => ({ ...s, volume_mounts: volumes }))}
            toRow={(v) => ({
              key: v.host_path ?? "",
              value: v.container_path ?? "",
            })}
            fromRow={(row) => ({
              host_path: row.key,
              container_path: row.value,
            })}
            keyValidator={z.string().min(1)}
            valueValidator={z.string().min(1)}
            errorLabel={t("volumeMountSelection.errorLabel")}
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
