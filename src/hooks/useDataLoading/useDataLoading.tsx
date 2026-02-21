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
import { GameServerAccessGroupDtoPermissionsItem, type GameServerDto } from "@/api/generated/model";
import { containsPermission } from "@/lib/permissionCalculations.ts";
import { gameServerLogSliceActions } from "@/stores/slices/gameServerLogSlice.ts";
import { gameServerMetricsSliceActions } from "@/stores/slices/gameServerMetrics";
import { gameServerPermissionsSliceActions } from "@/stores/slices/gameServerPermissionsSlice.ts";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";
import { templateSliceActions } from "@/stores/slices/templateSlice.ts";
import { userInviteSliceActions } from "@/stores/slices/userInviteSlice.ts";
import { userSliceActions } from "@/stores/slices/userSlice.ts";
import { DashboardElementTypes } from "@/types/dashboardTypes";

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

  const loadGameServerPermissions = async (
    gameServerUuid: string,
    permissions?: GameServerAccessGroupDtoPermissionsItem[],
  ) => {
    dispatch(
      gameServerPermissionsSliceActions.updateGameServerPermissionsStatus({
        gameServerUuid,
        status: "loading",
      }),
    );
    try {
      const fetchedPermissions = permissions || (await getUserPermissions(gameServerUuid));
      dispatch(
        gameServerPermissionsSliceActions.setGameServerPermissions({
          gameServerUuid,
          permissions: fetchedPermissions,
        }),
      );
      dispatch(
        gameServerPermissionsSliceActions.updateGameServerPermissionsStatus({
          gameServerUuid,
          status: "idle",
        }),
      );
      return fetchedPermissions;
    } catch (e) {
      console.error("Unexpected error while loading game server permissions", e);
      dispatch(
        gameServerPermissionsSliceActions.updateGameServerPermissionsStatus({
          gameServerUuid,
          status: "failed",
        }),
      );
      return null;
    }
  };

  const removeGameServer = async (gameServerUuid: string) => {
    dispatch(gameServerSliceActions.removeGameServer(gameServerUuid));
    dispatch(gameServerLogSliceActions.removeLogsFromServer(gameServerUuid));
    dispatch(gameServerMetricsSliceActions.removeMetricsFromServer(gameServerUuid));
    dispatch(gameServerPermissionsSliceActions.removeGameServerPermissions(gameServerUuid));
  };

  const loadGameServer = async (
    gameServerUuid: string,
    deleteIfNotFound?: boolean,
    permissions?: GameServerAccessGroupDtoPermissionsItem[],
  ) => {
    if (
      permissions !== undefined &&
      !containsPermission(permissions ?? [], GameServerAccessGroupDtoPermissionsItem.SEE_SERVER)
    ) {
      removeGameServer(gameServerUuid);
      return false;
    }

    dispatch(gameServerSliceActions.setState("loading"));
    try {
      const gameServer = await getGameServerById(gameServerUuid);
      dispatch(gameServerSliceActions.updateGameServer(gameServer));
    } catch (e) {
      if (deleteIfNotFound) {
        console.error("Game server not found, deleting from store", e);
        dispatch(gameServerSliceActions.removeGameServer(gameServerUuid));
        return false;
      } else {
        console.error("Unexpected error while loading game server", e);
        dispatch(gameServerSliceActions.setState("failed"));
        return false;
      }
    }

    try {
      await loadAdditionalGameServerData(gameServerUuid, permissions);

      dispatch(gameServerSliceActions.setState("idle"));
      return true;
    } catch (e) {
      console.error("Could not load ", e);
      return false;
    }
  };

  const loadAdditionalGameServerData = async (
    gameServerUuid: string,
    permissions?: GameServerAccessGroupDtoPermissionsItem[],
  ) => {
    const fetchedPermissions =
      (await loadGameServerPermissions(gameServerUuid, permissions)) || undefined;

    await Promise.allSettled([
      loadGameServerLogs(gameServerUuid, fetchedPermissions),
      loadGameServerMetrics(gameServerUuid, undefined, undefined, fetchedPermissions),
    ]);
  };

  const loadPublicEvaluableGameServerData = async (gameServer: GameServerDto) => {
    if (
      gameServer.public_dashboard_layouts.some(
        (layout) => layout.public_dashboard_types === DashboardElementTypes.LOGS,
      )
    ) {
      const permissions = await loadGameServerPermissions(gameServer.uuid, [GameServerAccessGroupDtoPermissionsItem.READ_SERVER_LOGS]) || undefined;
      await loadGameServerLogs(gameServer.uuid, permissions);
    }
    if (
      gameServer.public_dashboard_layouts.some(
        (layout) => layout.public_dashboard_types === DashboardElementTypes.METRIC,
      )
    ) {
      const permissions = await loadGameServerPermissions(gameServer.uuid, [GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS]) || undefined;
      await loadGameServerMetrics(gameServer.uuid, undefined, undefined, permissions);
    }
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

  const loadPublicGameServer = async () => {
    dispatch(gameServerSliceActions.setState("loading"));
    try {
      const gameServers = await getAllGameServers();
      dispatch(gameServerSliceActions.setState("idle"));
      dispatch(gameServerSliceActions.setGameServers(gameServers));
      const allowedGameServers = gameServers.filter(
        (gameServer) => gameServer.public_dashboard_enabled,
      );

      await Promise.allSettled(
        allowedGameServers.map((gs) => loadPublicEvaluableGameServerData(gs)),
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

  const loadGameServerLogs = async (
    gameServerUuid: string,
    permissions?: GameServerAccessGroupDtoPermissionsItem[],
  ) => {
    console.log("logs",
      !containsPermission(
        permissions ?? [],
        GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS,
      ))
    if (
      !containsPermission(
        permissions ?? [],
        GameServerAccessGroupDtoPermissionsItem.READ_SERVER_LOGS,
      )
    ) {
      dispatch(gameServerLogSliceActions.removeLogsFromServer(gameServerUuid));
      return;
    }
    console.log("Loading logs for server", gameServerUuid);
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
    async (
      gameServerUuid: string,
      start?: Date,
      end?: Date,
      permissions?: GameServerAccessGroupDtoPermissionsItem[],
    ) => {
      console.log("metrics",
        !containsPermission(
          permissions ?? [],
          GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS,
        ))
      if (
        permissions !== undefined &&
        !containsPermission(
          permissions ?? [],
          GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS,
        )
      ) {
        dispatch(gameServerMetricsSliceActions.removeMetricsFromServer(gameServerUuid));
        return;
      }
      dispatch(gameServerMetricsSliceActions.setState({ gameServerUuid, state: "loading" }));
      try {
        const metrics = await getMetrics(gameServerUuid, {
          start: start ? start.toISOString() : undefined,
          end: end ? end.toISOString() : undefined,
        });
        console.log("fetched metrics", metrics);
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

  const loadAllData = async (isAdmin: boolean = false) => {
    const tasks = [loadGameServers(), loadTemplates()];
    const taskNames = ["gameServers", "templates"];

    // Only load users and invites for admin users
    if (isAdmin) {
      tasks.push(loadUsers(), loadInvites());
      taskNames.push("users", "invites");
    }

    const results = await Promise.allSettled(tasks);

    const summary = {
      gameServers: results[0].status === "fulfilled" && results[0].value === true,
      templates: results[1].status === "fulfilled" && results[1].value === true,
      users:
        isAdmin && results[2]
          ? results[2].status === "fulfilled" && results[2].value === true
          : undefined,
      invites:
        isAdmin && results[3]
          ? results[3].status === "fulfilled" && results[3].value === true
          : undefined,
    };

    results.forEach((result, idx) => {
      if (result.status === "rejected") {
        console.error(`Failed to load ${taskNames[idx]}:`, result.reason);
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
    loadPublicGameServer,
  };
};

export default useDataLoading;
