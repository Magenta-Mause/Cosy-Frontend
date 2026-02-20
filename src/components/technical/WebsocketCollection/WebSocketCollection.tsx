import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { useDispatch } from "react-redux";
import { useSubscription } from "react-stomp-hooks";
import { v7 as generateUuid } from "uuid";
import { getGetAllWebhooksQueryKey } from "@/api/generated/backend-api";
import type {
  GameServerAccessGroupDtoPermissionsItem,
  GameServerDtoStatus,
  GameServerLogMessageEntity,
  MetricPointDto,
} from "@/api/generated/model";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading.tsx";
import { useTypedSelector } from "@/stores/rootReducer.ts";
import { gameServerLogSliceActions } from "@/stores/slices/gameServerLogSlice.ts";
import { gameServerMetricsSliceActions } from "@/stores/slices/gameServerMetrics";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";

interface GameServerStatusUpdateDto {
  server_uuid: string;
  new_status: GameServerDtoStatus;
}

interface DockerPullProgressDtoResponse {
  status: string;
  id?: string;
  progress_detail?: string;
  current?: number;
  total?: number;
}

interface GameServerDockerProgressUpdateDto {
  server_uuid: string;
  progress: DockerPullProgressDtoResponse;
}

const WebSocketCollection = () => {
  const gameServer = useTypedSelector((state) => state.gameServerSliceReducer.data);
  const gameServerMetrics = useTypedSelector((state) => state.gameServerMetricsSliceReducer.data);
  const { uuid: userUuid, authorized } = useContext(AuthContext);
  const { loadGameServer } = useDataLoading();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  useSubscription(
    gameServer ? gameServer.map((server) => `/topics/game-servers/status/${server.uuid}`) : [],
    (message) => {
      const messageBody = JSON.parse(message.body) as GameServerStatusUpdateDto;
      if (messageBody.server_uuid && messageBody.new_status) {
        dispatch(
          gameServerSliceActions.updateGameServerStatus({
            uuid: messageBody.server_uuid,
            status: messageBody.new_status,
          }),
        );
      }
    },
  );

  useSubscription(
    gameServer
      ? gameServer.map((server) => `/topics/game-servers/docker-progress/${server.uuid}`)
      : [],
    (message) => {
      const messageBody = JSON.parse(message.body) as GameServerDockerProgressUpdateDto;
      if (messageBody.server_uuid && messageBody.progress) {
        dispatch(
          gameServerSliceActions.updatePullProgress({
            uuid: messageBody.server_uuid,
            progress: {
              ...messageBody.progress,
              progressDetail: messageBody.progress.progress_detail,
            },
          }),
        );
      }
    },
  );

  useSubscription(
    gameServer
      ? gameServer.map((server) => `/topics/game-server-logs/creation/${server.uuid}`)
      : [],
    (message) => {
      const messageBody = JSON.parse(message.body) as GameServerLogMessageEntity;
      dispatch(
        gameServerLogSliceActions.addLog({
          ...messageBody,
          uuid: generateUuid(),
        }),
      );
    },
  );

  useSubscription(
    gameServer ? gameServer.map((server) => `/topics/game-servers/metrics/${server.uuid}`) : [],
    (message) => {
      const messageBody = JSON.parse(message.body) as MetricPointDto;
      const serverMetricState = gameServerMetrics[messageBody.game_server_uuid ?? ""];

      if (!serverMetricState || !serverMetricState.enableMetricsLiveUpdates) {
        return;
      }

      dispatch(
        gameServerMetricsSliceActions.addMetrics({
          ...messageBody,
          uuid: generateUuid(),
        }),
      );
    },
  );

  useSubscription(
    authorized && userUuid ? `/topics/game-servers/permissions-config-change/${userUuid}` : [],
    (message) => {
      const messageBody = JSON.parse(message.body) as {
        game_server_uuid: string;
        permissions: GameServerAccessGroupDtoPermissionsItem[];
      };
      loadGameServer(messageBody.game_server_uuid, true, messageBody.permissions);
    },
  );

  useSubscription(
    gameServer ? gameServer.map((server) => `/topics/game-servers/webhooks/${server.uuid}`) : [],
    (message) => {
      const destination = message.headers?.destination;
      if (!destination) return;
      const match = destination.match(/\/topics\/game-servers\/webhooks\/([^/]+)/);
      const gameServerUuid = match?.[1];
      if (!gameServerUuid) return;
      queryClient.invalidateQueries({
        queryKey: getGetAllWebhooksQueryKey(gameServerUuid),
      });
    },
  );

  return null;
};

export default WebSocketCollection;
