import AutoCompleteInputField, {
  type AutoCompleteItem,
} from "@components/display/GameServer/CreateGameServer/AutoCompleteInputField.tsx";
import {GameServerCreationContext} from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import {useContext} from "react";
import type {TemplateEntity} from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import {useTypedSelector} from "@/stores/rootReducer.ts";
import GenericGameServerCreationPage from "../GenericGameServerCreationPage.tsx";

export default function Step2() {
  const {t} = useTranslationPrefix("components.CreateGameServer.steps.step2");
  const {creationState} = useContext(GameServerCreationContext);
  const templates = useTypedSelector((state) => state.templateSliceReducer.data);
  const templatesForGame = templates.filter(
    (template) => template.game_id?.toString() === creationState.gameServerState.external_game_id,
  );
  const convertTemplateToAutoCompleteItem = (
    template: TemplateEntity,
  ): AutoCompleteItem<TemplateEntity, string> => {
    return {
      data: template,
      value: template.path ?? "",
      label: template.name ?? "Unknown",
    };
  };

  return (
    <GenericGameServerCreationPage>
      <AutoCompleteInputField
        attribute={"template"}
        validator={(value) => value !== ""}
        placeholder={"Select a template"}
        description={t("templateSelection.description")}
        label={t("templateSelection.title") + " (Optional)"}
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
        disableDebounce
        defaultOpen
      />
    </GenericGameServerCreationPage>
  );
}
