import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { v7 as generateUuid } from "uuid";
import {
  getAllGameServers,
  getAllTemplates,
  getAllUserEntities,
  getAllUserInvites,
  getGameServerById,
  getLogs,
  getMetrics,
  getUserPermissions,
} from "@/api/generated/backend-api.ts";
import { gameServerLogSliceActions } from "@/stores/slices/gameServerLogSlice.ts";
import { gameServerMetricsSliceActions } from "@/stores/slices/gameServerMetrics";
import { gameServerPermissionsSliceActions } from "@/stores/slices/gameServerPermissionsSlice.ts";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";
import { templateSliceActions } from "@/stores/slices/templateSlice.ts";
import { userInviteSliceActions } from "@/stores/slices/userInviteSlice.ts";
import { userSliceActions } from "@/stores/slices/userSlice.ts";

const useDataLoading = () => {
  const dispatch = useDispatch();

  const loadTemplates = async () => {
    dispatch(templateSliceActions.setState("loading"));
    try {
      const templates = await getAllTemplates();
      dispatch(templateSliceActions.setTemplates(templates));
      dispatch(templateSliceActions.setState("idle"));
      return true;
    } catch (e) {
      console.error("Unexpected error while loading templates", e);
      dispatch(templateSliceActions.setState("failed"));
      return false;
    }
  };

  const loadGameServerPermissions = async (gameServerUuid: string) => {
    dispatch(
      gameServerPermissionsSliceActions.updateGameServerPermissionsStatus({
        gameServerUuid,
        status: "loading",
      }),
    );
    try {
      const permissions = await getUserPermissions(gameServerUuid);
      dispatch(
        gameServerPermissionsSliceActions.setGameServerPermissions({ gameServerUuid, permissions }),
      );
      dispatch(
        gameServerPermissionsSliceActions.updateGameServerPermissionsStatus({
          gameServerUuid,
          status: "idle",
        }),
      );
      return true;
    } catch (e) {
      console.error("Unexpected error while loading game server permissions", e);
      dispatch(
        gameServerPermissionsSliceActions.updateGameServerPermissionsStatus({
          gameServerUuid,
          status: "failed",
        }),
      );
      return false;
    }
  };

  const loadGameServer = async (gameServerUuid: string) => {
    dispatch(gameServerSliceActions.setState("loading"));
    try {
      const gameServer = await getGameServerById(gameServerUuid);
      dispatch(gameServerSliceActions.updateGameServer(gameServer));

      await loadAdditionalGameServerData(gameServerUuid);

      dispatch(gameServerSliceActions.setState("idle"));

      return true;
    } catch (e) {
      console.error("Unexpected error occured", e);
      dispatch(gameServerSliceActions.setState("failed"));
    }
  };

  const loadAdditionalGameServerData = async (gameServerUuid: string) => {
    console.log("loading additional game server data for game server: ", gameServerUuid, "");
    await Promise.allSettled([
      loadGameServerLogs(gameServerUuid),
      loadGameServerMetrics(gameServerUuid),
      loadGameServerPermissions(gameServerUuid),
    ]);
  };

  const loadGameServers = async () => {
    dispatch(gameServerSliceActions.setState("loading"));
    try {
      const gameServers = await getAllGameServers();
      dispatch(gameServerSliceActions.setState("idle"));
      dispatch(gameServerSliceActions.setGameServers(gameServers));
      await Promise.allSettled(
        gameServers.map((gameServer) => loadAdditionalGameServerData(gameServer.uuid)),
      );
      return true;
    } catch {
      dispatch(gameServerSliceActions.setState("failed"));
      return false;
    }
  };

  const loadUsers = async () => {
    dispatch(userSliceActions.setState("loading"));
    try {
      const users = await getAllUserEntities();
      dispatch(userSliceActions.setUsers(users));
      dispatch(userSliceActions.setState("idle"));
      return true;
    } catch {
      dispatch(userSliceActions.setState("failed"));
      return false;
    }
  };

  const loadInvites = async () => {
    dispatch(userInviteSliceActions.setState("loading"));
    try {
      const invites = await getAllUserInvites();
      dispatch(userInviteSliceActions.setInvites(invites));
      dispatch(userInviteSliceActions.setState("idle"));
      return true;
    } catch {
      dispatch(userInviteSliceActions.setState("failed"));
      return false;
    }
  };

  const loadGameServerLogs = async (gameServerUuid: string) => {
    dispatch(gameServerLogSliceActions.setState({ gameServerUuid, state: "loading" }));
    try {
      const logs = await getLogs(gameServerUuid);
      logs.sort(
        (a, b) =>
          (a.timestamp ? Date.parse(a.timestamp) : 0) - (b.timestamp ? Date.parse(b.timestamp) : 0),
      );
      const logsWithUuid = logs.map((log) => ({ ...log, uuid: generateUuid() }));
      dispatch(gameServerLogSliceActions.setGameServerLogs({ gameServerUuid, logs: logsWithUuid }));
      dispatch(gameServerLogSliceActions.setState({ gameServerUuid, state: "idle" }));
    } catch {
      dispatch(gameServerLogSliceActions.setState({ gameServerUuid, state: "failed" }));
    }
  };

  const loadGameServerMetrics = useCallback(
    async (gameServerUuid: string, start?: Date, end?: Date) => {
      dispatch(gameServerMetricsSliceActions.setState({ gameServerUuid, state: "loading" }));
      try {
        const metrics = await getMetrics(gameServerUuid, {
          start: start ? start.toISOString() : undefined,
          end: end ? end.toISOString() : undefined,
        });
        const metricsWithUuid = metrics.map((metric) => ({ ...metric, uuid: generateUuid() }));
        dispatch(
          gameServerMetricsSliceActions.setGameServerMetrics({
            gameServerUuid,
            metrics: metricsWithUuid,
          }),
        );
        dispatch(gameServerMetricsSliceActions.setState({ gameServerUuid, state: "idle" }));
      } catch {
        dispatch(gameServerMetricsSliceActions.setState({ gameServerUuid, state: "failed" }));
      }
    },
    [dispatch],
  );

  const loadAllData = async () => {
    const results = await Promise.allSettled([
      loadGameServers(),
      loadUsers(),
      loadInvites(),
      loadTemplates(),
    ]);

    const summary = {
      gameServers: results[0].status === "fulfilled" && results[0].value === true,
      users: results[1].status === "fulfilled" && results[1].value === true,
      invites: results[2].status === "fulfilled" && results[2].value === true,
    };

    results.forEach((result, idx) => {
      if (result.status === "rejected") {
        const names = ["gameServers", "users", "invites"];
        console.error(`Failed to load ${names[idx]}:`, result.reason);
      }
    });

    return summary;
  };

  return {
    loadGameServers,
    loadUsers,
    loadInvites,
    loadAllData,
    loadTemplates,
    loadGameServerMetrics,
    loadGameServerLogs,
    loadGameServerPermissions,
    loadAdditionalGameServerData,
    loadGameServer,
  };
};

export default useDataLoading;
