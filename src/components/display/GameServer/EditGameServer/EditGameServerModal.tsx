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
import axios from "axios";
import type { KeyboardEvent } from "react";
import { useState } from "react";
import * as z from "zod";
import { updateGameServer } from "@/api/generated/backend-api";
import type { GameServerConfigurationEntity, GameServerUpdateDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import EditKeyValueInput from "./EditKeyValueInput";
import GenericGameServerInputField from "./GenericGameServerEditInputField";

const EditGameServerModal = (props: {
  serverName: string;
  gameServer: GameServerConfigurationEntity;
  onConfirm: (updatedState: GameServerUpdateDto) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslationPrefix("EditGameServerDialog");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const isConfirmButtonDisabled = inputValue !== props.serverName || loading;

  const [gameServerState, setGameServerState] = useState<GameServerUpdateDto>({
    game_uuid: props.gameServer.game_uuid ?? "",
    server_name: props.gameServer.server_name ?? "",
    docker_image_name: props.gameServer.docker_image_name ?? "",
    docker_image_tag: props.gameServer.docker_image_tag ?? "",
    port_mappings: props.gameServer.port_mappings ?? [],
    environment_variables: props.gameServer.environment_variables ?? [],
    execution_command:
      (props.gameServer as any).execution_command ??
      props.gameServer.docker_execution_command ??
      [],
    volume_mounts:
      props.gameServer.volume_mounts?.map((v) => ({
        host_path: v.hostPath ?? "",
        container_path: v.containerPath ?? "",
      })) ?? [],
  });

  const handleConfirm = () => {
    if (!props.gameServer.uuid) {
      console.error("GameServer UUID is missing");
      return;
    }

    // Wir rufen nur die Parent-Funktion auf
    props.onConfirm(gameServerState);
    props.onOpenChange(false); // Modal schließen
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog open={props.open}>
      <DialogContent className={"font-mono"}>
        <DialogHeader>
          <DialogTitle>{t("title", { serverName: props.serverName })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <DialogMain>
          <GenericGameServerInputField
            id="game_uuid"
            validator={z.string().min(1)}
            placeholder="Game"
            label={t("gameSelection.title")}
            description={t("gameSelection.description")}
            errorLabel={t("gameSelection.errorLabel")}
            onChange={(v) => setGameServerState((s) => ({ ...s, game_uuid: v }))}
            value={gameServerState.game_uuid}
          />

          <GenericGameServerInputField
            id="server_name"
            validator={z.string().min(1)}
            placeholder="My Game Server"
            label={t("serverNameSelection.title")}
            description={t("serverNameSelection.description")}
            errorLabel={t("serverNameSelection.errorLabel")}
            onChange={(v) => setGameServerState((s) => ({ ...s, server_name: v }))}
            value={gameServerState.server_name}
          />

          <div className="grid grid-cols-2 gap-4">
            <GenericGameServerInputField
              id="docker_image_name"
              validator={z.string().min(1)}
              placeholder="nginx"
              label={t("dockerImageSelection.title")}
              description={t("dockerImageSelection.description")}
              errorLabel={t("dockerImageSelection.errorLabel")}
              onChange={(v) => setGameServerState((s) => ({ ...s, docker_image_name: v }))}
              value={gameServerState.docker_image_name}
            />

            <GenericGameServerInputField
              id="docker_image_tag"
              validator={z.string().min(1)}
              placeholder="latest"
              label={t("imageTagSelection.title")}
              description={t("imageTagSelection.description")}
              errorLabel={t("imageTagSelection.errorLabel")}
              onChange={(v) => setGameServerState((s) => ({ ...s, docker_image_tag: v }))}
              value={gameServerState.docker_image_tag}
            />
          </div>

          <EditKeyValueInput
            label="Ports"
            value={gameServerState.port_mappings}
            onChange={(ports) =>
              setGameServerState((s) => ({
                ...s,
                port_mappings: ports,
              }))
            }
            toRow={(pm) => ({
              key: pm.instance_port?.toString() ?? "",
              value: pm.container_port?.toString() ?? "",
            })}
            fromRow={(row) => ({
              instance_port: row.key ? Number(row.key) : undefined,
              container_port: row.value ? Number(row.value) : undefined,
              protocol: "TCP" as any,
            })}
            keyValidator={z.string().regex(/^\d{1,5}$/)}
            valueValidator={z.string().regex(/^\d{1,5}$/)}
            errorLabel="Invalid port"
          />

          <EditKeyValueInput
            label="Environment Variables"
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
            errorLabel="Invalid entry"
          />

          <GenericGameServerInputField
            id="execution_command"
            validator={z.string().min(1)}
            placeholder="./start.sh --config server.yml"
            label={t("executionCommandSelection.title")}
            description={t("executionCommandSelection.description")}
            errorLabel={t("executionCommandSelection.errorLabel")}
            value={gameServerState.execution_command?.join(" ") ?? ""}
            onChange={(exe) =>
              setGameServerState((s) => ({
                ...s,
                execution_command: exe.trim() ? exe.trim().split(/\s+/) : [],
              }))
            }
          />

          <EditKeyValueInput
            label="Volume Mounts"
            value={gameServerState.volume_mounts}
            onChange={(volumes) =>
              setGameServerState((s) => ({
                ...s,
                volume_mounts: volumes,
              }))
            }
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
            errorLabel="Invalid path"
          />
        </DialogMain>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="h-[50px]" variant="secondary" disabled={loading}>
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleConfirm} className={"h-[50px]"}>
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default EditGameServerModal;
