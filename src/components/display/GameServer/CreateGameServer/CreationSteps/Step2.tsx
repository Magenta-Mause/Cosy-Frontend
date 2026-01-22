import AutoCompleteInputField, {
  type AutoCompleteItem,
} from "@components/display/GameServer/CreateGameServer/AutoCompleteInputField";
import { GameServerCreationContext } from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import TemplateVariableForm from "@components/display/GameServer/CreateGameServer/TemplateVariableForm";
import { validateTemplateVariables } from "@components/display/GameServer/CreateGameServer/utils/templateSubstitution";
import { useContext, useEffect } from "react";
import type { TemplateEntity } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { useTypedSelector } from "@/stores/rootReducer.ts";
import GenericGameServerCreationPage from "../GenericGameServerCreationPage.tsx";

export default function Step2() {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step2");
  const { creationState, setUtilState, setCurrentPageValid } =
    useContext(GameServerCreationContext);
  const templates = useTypedSelector((state) => state.templateSliceReducer.data);
  const templatesForGame = templates.filter(
    (template) => template.game_id?.toString() === creationState.gameServerState.external_game_id,
  );

  const selectedTemplate = creationState.utilState.selectedTemplate ?? null;
  const templateVariables = creationState.utilState.templateVariables ?? {};

  const convertTemplateToAutoCompleteItem = (
    template: TemplateEntity,
  ): AutoCompleteItem<TemplateEntity, string> => {
    return {
      data: template,
      value: template.path ?? "",
      label: template.name ?? "Unknown",
    };
  };

  const handleTemplateVariableChange = (placeholder: string, value: string | number | boolean) => {
    setUtilState("templateVariables")({
      ...templateVariables,
      [placeholder]: value,
    });
  };

  useEffect(() => {
    const isValid = validateTemplateVariables(selectedTemplate, templateVariables);
    setCurrentPageValid(isValid);
  }, [selectedTemplate, templateVariables, setCurrentPageValid]);

  return (
    <GenericGameServerCreationPage>
      <div className={"flex flex-col gap-4"}>
        <AutoCompleteInputField
          attribute={"template"}
          validator={(value) => value !== ""}
          placeholder={"Select a template"}
          description={t("templateSelection.description")}
          label={`${t("templateSelection.title")} (Optional)`}
          fallbackValue={"" as string}
          searchId={`templates-${creationState.gameServerState.external_game_id}`}
          noAutoCompleteItemsLabel={t("templateSelection.noResultsLabel")}
          searchCallback={async (search) => {
            const filtered = templatesForGame.filter(
              (template) =>
                search === "" ||
                template.name?.toLowerCase().includes(search.toLowerCase()) ||
                template.description?.toLowerCase().includes(search.toLowerCase()),
            );
            return filtered.map(convertTemplateToAutoCompleteItem);
          }}
          onItemSelect={(item) => {
            setUtilState("selectedTemplate")(item.data);
            setUtilState("templateVariables")({});
            setUtilState("templateApplied")(false);
          }}
          disableDebounce
          defaultOpen
        />
        <TemplateVariableForm
          template={selectedTemplate}
          onValueChange={handleTemplateVariableChange}
          initialValues={templateVariables}
        />
      </div>
    </GenericGameServerCreationPage>
  );
}
