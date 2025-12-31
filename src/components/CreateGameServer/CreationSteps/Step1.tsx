import AutoCompleteInputField from "@components/CreateGameServer/AutoCompleteInputField";
import GenericGameServerCreationPage from "@components/CreateGameServer/GenericGameServerCreationPage.tsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useContext } from "react";
import * as z from "zod";
import { getGameInfo } from "@/api/generated/backend-api";
import type { GameDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { InputType } from "@/lib/utils";
import { GameServerCreationContext } from "../CreateGameServerModal";

const Step1 = () => {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step1");
  const { setUtilState } = useContext(GameServerCreationContext);
  const queryClient = useQueryClient();

  const mapGamesDtoToAutoCompleteItems = useCallback(
    (games: GameDto[]) =>
      games.map((game) => ({
        data: game,
        value: String(game.id),
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

  const queryGames = useCallback(
    (val: string) => {
      if (!val) return Promise.resolve([]);
      return queryClient
        .fetchQuery({
          queryKey: ["gameInfo", val],
          queryFn: () => getGameInfo({ query: val }),
          staleTime: 1000 * 60 * 5,
        })
        .then((games) => mapGamesDtoToAutoCompleteItems(games));
    },
    [queryClient, mapGamesDtoToAutoCompleteItems],
  );

  return (
    <GenericGameServerCreationPage>
      <AutoCompleteInputField
        attribute="game_id"
        validator={z.number().min(0)}
        placeholder={t("gameSelection.placeholder")}
        getAutoCompleteItems={queryGames}
        inputType={InputType.number}
        selectItemCallback={(selectedItem) =>
          setUtilState("gameEntity")(selectedItem.data ?? undefined)
        }
        noAutoCompleteItemsLabelCallback={(displayValue) =>
          queryClient.getQueryState(["gameInfo", displayValue])?.error
            ? t("gameSelection.noGamesFound")
            : t("gameSelection.noResultsLabel")
        }
        noAutoCompleteItemsLabel={t("gameSelection.noResultsLabel")}
        fallbackValue="0"
      />
    </GenericGameServerCreationPage>
  );
};

export default Step1;
