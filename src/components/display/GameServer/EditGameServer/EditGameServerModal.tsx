import KeyValueInput, { InputType } from "@components/CreateGameServer/KeyValueInput";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
} from "@components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import * as z from "zod";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import GenericGameServerCreationInputField from "../../../CreateGameServer/GenericGameServerCreationInputField";
import GenericGameServerCreationPage from "../../../CreateGameServer/GenericGameServerCreationPage";

const EditGameServerModal = (props: { open: boolean }) => {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step3");

  return (
    <Dialog open={props.open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>test</DialogTitle>
          <DialogDescription>test</DialogDescription>
        </DialogHeader>
        <DialogMain>
          <GenericGameServerCreationPage>
            <GenericGameServerCreationInputField
              attribute="game_uuid"
              validator={z.string().min(1)}
              placeholder="Minecraft Server"
              label={t("gameSelection.title")}
              description={t("gameSelection.description")}
              errorLabel={t("gameSelection.errorLabel")}
            />

            <GenericGameServerCreationInputField
              attribute="server_name"
              validator={z.string().min(1)}
              placeholder="My Game Server"
              label={t("serverNameSelection.title")}
              description={t("serverNameSelection.description")}
              errorLabel={t("serverNameSelection.errorLabel")}
            />

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
            />

            <KeyValueInput
              attribute="port_mappings"
              fieldLabel={t("portSelection.title")}
              fieldDescription={t("portSelection.description")}
              errorLabel={t("portSelection.errorLabel")}
              placeHolderKeyInput="4433"
              placeHolderValueInput="4433"
              keyValidator={z.number().min(1).max(65535)}
              valueValidator={z.number().min(1).max(65535)}
              required
              inputType={InputType.number}
              objectKey="instance_port"
              objectValue="container_port"
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
              inputType={InputType.number}
              objectKey="key"
              objectValue="value"
            />

            <GenericGameServerCreationInputField
              attribute="execution_command"
              validator={z.string().min(1)}
              placeholder="./start.sh"
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
              inputType={InputType.text}
              objectKey="host_path"
              objectValue="container_path"
            />
          </GenericGameServerCreationPage>
        </DialogMain>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditGameServerModal;
