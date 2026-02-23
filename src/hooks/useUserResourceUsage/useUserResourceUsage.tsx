import { useSelector } from "react-redux";
import { GameServerDtoStatus } from "@/api/generated/model";
import type { RootState } from "@/stores";

interface UserResourceUsage {
  cpuUsage: string;
  memoryUsage: string;
}

const convertBytesToReadable = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
};

export const useUserResourceUsage = (userUuid: string | null | undefined): UserResourceUsage => {
  const gameServers = useSelector((state: RootState) => state.gameServerSliceReducer.data);
  const metricsData = useSelector((state: RootState) => state.gameServerMetricsSliceReducer.data);

  // Return zeros if no userUuid provided
  if (!userUuid) {
    return {
      cpuUsage: "0.00",
      memoryUsage: "0 Bytes",
    };
  }

  // Filter running gameservers owned by this user
  const userRunningServers = gameServers.filter(
    (server) => server.owner.uuid === userUuid && server.status === GameServerDtoStatus.RUNNING,
  );

  // Calculate total CPU and memory usage
  let totalCpuUsage = 0;
  let totalMemoryUsage = 0;

  userRunningServers.forEach((server) => {
    const serverMetrics = metricsData[server.uuid];
    if (serverMetrics?.metrics && serverMetrics.metrics.length > 0) {
      // Get the latest metric point
      const latestMetric = serverMetrics.metrics[serverMetrics.metrics.length - 1];
      const metricValues = latestMetric.metric_values;

      if (metricValues) {
        totalCpuUsage += metricValues.cpu_percent ?? 0;
        totalMemoryUsage += metricValues.memory_usage ?? 0;
      }
    }
  });

  return {
    cpuUsage: (totalCpuUsage / 1000).toFixed(2),
    memoryUsage: convertBytesToReadable(totalMemoryUsage),
  };
};
