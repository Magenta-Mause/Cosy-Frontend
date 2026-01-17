import { useDispatch } from "react-redux";
import { useSubscription } from "react-stomp-hooks";
import { v7 as generateUuid } from "uuid";
import type { GameServerDtoStatus, GameServerLogMessageEntity } from "@/api/generated/model";
import { useTypedSelector } from "@/stores/rootReducer.ts";
import { gameServerLogSliceActions } from "@/stores/slices/gameServerLogSlice.ts";
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
  const dispatch = useDispatch();

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
  return null;
};

export default WebSocketCollection;
