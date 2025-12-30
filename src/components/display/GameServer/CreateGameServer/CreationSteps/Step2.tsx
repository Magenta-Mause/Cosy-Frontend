import { DialogDescription } from "@components/ui/dialog.tsx";
import * as z from "zod";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import GenericGameServerCreationInputField from "../GenericGameServerCreationInputField.tsx";
import GenericGameServerCreationPage from "../GenericGameServerCreationPage.tsx";

export default function Step2() {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step2");

  return (
    <GenericGameServerCreationPage>
      <DialogDescription>{t("description")}</DialogDescription>

      <GenericGameServerCreationInputField
        attribute="template"
        validator={z.string().min(1)}
        placeholder="Select a template"
        label={t("templateSelection.title")}
        description={t("templateSelection.description")}
        errorLabel={t("templateSelection.errorLabel")}
      />
      <GenericGameServerCreationInputField
        attribute="server_name"
        validator={z.string().min(1)}
        placeholder="My Game Server"
        label={t("serverNameSelection.title")}
        description={t("serverNameSelection.description")}
        errorLabel={t("serverNameSelection.errorLabel")}
      />
    </GenericGameServerCreationPage>
  );
}
