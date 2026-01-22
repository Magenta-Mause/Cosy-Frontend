import AutoCompleteInputField, {
  type AutoCompleteItem,
} from "@components/display/GameServer/CreateGameServer/AutoCompleteInputField";
import GenericGameServerCreationInputField from "@components/display/GameServer/CreateGameServer/GenericGameServerCreationInputField.tsx";
import GenericGameServerCreationPage from "@components/display/GameServer/CreateGameServer/GenericGameServerCreationPage.tsx";
import { Label } from "@components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useContext } from "react";
import { z } from "zod";
import { queryGames } from "@/api/generated/backend-api.ts";
import type { GameDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { distinctBy } from "@/lib/arrayUtils.ts";
import { useTypedSelector } from "@/stores/rootReducer.ts";
import { GameServerCreationContext } from "../CreateGameServerModal";

const Step1 = () => {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step1");
  const { setUtilState, setGameServerState, creationState } = useContext(GameServerCreationContext);
  const queryClient = useQueryClient();
  const templates = useTypedSelector((state) => state.templateSliceReducer.data);

  const mapGamesDtoToAutoCompleteItems = useCallback(
    (games: GameDto[]) =>
      distinctBy(games, (game) => game.external_game_id).map(
        (game): AutoCompleteItem<GameDto, string> => {
          const templateCount = templates.filter(
            (template) => template.game_id === game.external_game_id,
          ).length;
          return {
            data: game,
            value: (game.external_game_id ?? 0).toString(),
            label: game.name,
            additionalInformation:
              templateCount > 0
                ? `${templateCount} template${templateCount > 1 ? "s" : ""}`
                : undefined,
          };
        },
      ),
    [templates],
  );

  return (
    <GenericGameServerCreationPage>
      <div className="flex flex-col gap-4">
        <GenericGameServerCreationInputField
          attribute="server_name"
          validator={z.string().min(1)}
          placeholder="My Game Server"
          label={t("serverNameSelection.title")}
          description={t("serverNameSelection.description")}
          errorLabel={t("serverNameSelection.errorLabel")}
        />
        <AutoCompleteInputField
          attribute="external_game_id"
          validator={(value) => value.length > 0}
          label={t("gameSelection.title")}
          placeholder={t("gameSelection.placeholder")}
          onItemSelect={(selectedItem: AutoCompleteItem<GameDto, string>) => {
            // update game entity
            setUtilState("gameEntity")(selectedItem.data ?? undefined);

            // reset dependent state
            setGameServerState("template")("");
            setUtilState("templateVariables")({});
            setUtilState("selectedTemplate")(undefined);

            // remove `external_game_id` from autoCompleteSelections
            const { external_game_id: _external_game_id, ...rest } =
              creationState.utilState.autoCompleteSelections ?? {};

            setUtilState("autoCompleteSelections")(rest);
          }}
          noAutoCompleteItemsLabelRenderer={(displayValue) => (
            <Label>
              {queryClient.getQueryState(["gameInfo", displayValue])?.error
                ? t("gameSelection.noGamesFound")
                : t("gameSelection.noResultsLabel")}
            </Label>
          )}
          noAutoCompleteItemsLabel={t("gameSelection.noResultsLabel")}
          fallbackValue={"0" as string}
          searchId="gameInfo"
          searchCallback={(gameNameQuery) =>
            queryGames({ query: gameNameQuery }).then((games) =>
              mapGamesDtoToAutoCompleteItems(games),
            )
          }
        />
      </div>
    </GenericGameServerCreationPage>
  );
};

export default Step1;
