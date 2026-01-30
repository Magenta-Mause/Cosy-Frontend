import KeyValueInput from "@components/display/GameServer/CreateGameServer/KeyValueInput.tsx";
import PortInput from "@components/display/GameServer/CreateGameServer/PortInput.tsx";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { useCallback, useContext } from "react";
import * as z from "zod";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import GenericGameServerCreationInputField from "../GenericGameServerCreationInputField.tsx";
import GenericGameServerCreationPage from "../GenericGameServerCreationPage.tsx";
import { GameServerCreationContext } from "../CreateGameServerModal.tsx";
import { GameServerCreationPageContext } from "../GenericGameServerCreationPage.tsx";
import MemoryLimitInputField from "../../../MemoryLimit/MemoryLimitInputField.tsx";
import type { GameServerCreationDto } from "@/api/generated/model/gameServerCreationDto.ts";

export default function Step3() {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step3");
  const { cpuLimit, memoryLimit } = useContext(AuthContext);
  const { setGameServerState, creationState, triggerNextPage } =
    useContext(GameServerCreationContext);
  const { setAttributeTouched, setAttributeValid } = useContext(GameServerCreationPageContext);
  const memoryAttribute = "docker_max_memory" as keyof GameServerCreationDto;

  const handleMemoryChange = useCallback(
    (value: string | null) => {
      const nextValue = value === null || value === "" ? undefined : value;
      setGameServerState(memoryAttribute)(
        nextValue as GameServerCreationDto[keyof GameServerCreationDto],
      );
    },
    [setGameServerState, memoryAttribute],
  );

  const handleMemoryValidityChange = useCallback(
    (isValid: boolean) => {
      setAttributeValid(memoryAttribute, isValid);
    },
    [setAttributeValid, memoryAttribute],
  );

  const handleMemoryTouchedChange = useCallback(
    (touched: boolean) => {
      setAttributeTouched(memoryAttribute, touched);
    },
    [setAttributeTouched, memoryAttribute],
  );

  return (
    <GenericGameServerCreationPage>
      <div className="grid grid-cols-2 gap-4">
        <GenericGameServerCreationInputField
          attribute="docker_image_name"
          validator={z.string().min(1)}
          placeholder="nginx"
          label={t("dockerImageSelection.title")}
          description={t("dockerImageSelection.description")}
          errorLabel={t("dockerImageSelection.errorLabel")}
        />

        <GenericGameServerCreationInputField
          attribute="docker_image_tag"
          validator={z.string().min(1)}
          placeholder="latest"
          label={t("imageTagSelection.title")}
          description={t("imageTagSelection.description")}
          errorLabel={t("imageTagSelection.errorLabel")}
          defaultValue={"latest"}
          optional
        />
      </div>

      <PortInput
        attribute="port_mappings"
        fieldLabel={t("portSelection.title")}
        fieldDescription={t("portSelection.description")}
        errorLabel={t("portSelection.errorLabel")}
        placeHolderKeyInput="4433"
        placeHolderValueInput="4433"
        keyValidator={z.number().min(1).max(65535)}
        valueValidator={z.number().min(1).max(65535)}
        required
      />

      <KeyValueInput
        attribute="environment_variables"
        fieldLabel={t("environmentVariablesSelection.title")}
        fieldDescription={t("environmentVariablesSelection.description")}
        errorLabel={t("environmentVariablesSelection.errorLabel")}
        placeHolderKeyInput="KEY"
        placeHolderValueInput="VALUE"
        keyValidator={z.string().min(1)}
        valueValidator={z.string().min(1)}
        inputType={"text"}
        objectKey="key"
        objectValue="value"
      />

      <GenericGameServerCreationInputField
        attribute="execution_command"
        validator={z.string().min(1)}
        placeholder="./start.sh"
        optional
        label={t("executionCommandSelection.title")}
        description={t("executionCommandSelection.description")}
        errorLabel={t("executionCommandSelection.errorLabel")}
      />

      <KeyValueInput
        attribute="volume_mounts"
        fieldLabel={t("hostPathSelection.title")}
        fieldDescription={t("hostPathSelection.description")}
        errorLabel={t("hostPathSelection.errorLabel")}
        placeHolderKeyInput="Host Path"
        placeHolderValueInput="Container Path"
        keyValidator={z.string().min(1)}
        valueValidator={z.string().min(1)}
        inputType={"text"}
        objectKey="host_path"
        objectValue="container_path"
      />

      <div className="grid grid-cols-2 gap-4">
        <GenericGameServerCreationInputField
          attribute="docker_max_cpu"
          validator={z.string().min(1)}
          placeholder="0.5"
          optional={cpuLimit === null}
          maxLimit={cpuLimit}
          label={t("cpuLimitSelection.title") + (cpuLimit === null ? " (Optional)" : "")}
          description={t("cpuLimitSelection.description")}
          errorLabel={t("cpuLimitSelection.errorLabel")}
        />

        <MemoryLimitInputField
          id="docker_max_memory"
          validator={z.string().min(1)}
          placeholder="512"
          optional={memoryLimit === null}
          maxLimit={memoryLimit}
          label={t("memoryLimitSelection.title") + (memoryLimit === null ? " (Optional)" : "")}
          description={t("memoryLimitSelection.description")}
          errorLabel={t("memoryLimitSelection.errorLabel")}
          value={creationState.gameServerState[memoryAttribute] as string | number | undefined}
          onChange={handleMemoryChange}
          onValidityChange={handleMemoryValidityChange}
          onTouchedChange={handleMemoryTouchedChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              triggerNextPage();
            }
          }}
        />
      </div>
    </GenericGameServerCreationPage>
  );
}
