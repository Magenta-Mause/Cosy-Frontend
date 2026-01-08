import AutoCompleteInputField, {
  type AutoCompleteItem,
} from "@components/display/GameServer/CreateGameServer/AutoCompleteInputField";
import GenericGameServerCreationPage from "@components/display/GameServer/CreateGameServer/GenericGameServerCreationPage.tsx";
import { Label } from "@components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useContext } from "react";
import { getGameInfo } from "@/api/generated/backend-api";
import type { GameDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { GameServerCreationContext } from "../CreateGameServerModal";

const Step1 = () => {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step1");
  const { setUtilState } = useContext(GameServerCreationContext);
  const queryClient = useQueryClient();

  const mapGamesDtoToAutoCompleteItems = useCallback(
    (games: GameDto[]) =>
      games.map((game) => ({
        data: game,
        value: game.game_uuid,
        label: game.name,
        leftSlot: game.logo_url ? (
          <img
            src={game.logo_url}
            alt={game.name}
            className="h-6 w-auto rounded-md mr-2 object-contain"
          />
        ) : null,
      })),
    [],
  );

  return (
    <GenericGameServerCreationPage>
      <AutoCompleteInputField
        attribute="game_uuid"
        validator={(value) => value.length > 0}
        placeholder={t("gameSelection.placeholder")}
        onItemSelect={(selectedItem: AutoCompleteItem<GameDto, string>) =>
          setUtilState("gameEntity")(selectedItem.data ?? undefined)
        }
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
          getGameInfo({ query: gameNameQuery }).then((games) =>
            mapGamesDtoToAutoCompleteItems(games),
          )
        }
      />
    </GenericGameServerCreationPage>
  );
};

export default Step1;
