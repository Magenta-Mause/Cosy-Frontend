import type { MetricLayout } from "@/api/generated/model";

export type MetricsType = (typeof MetricsType)[keyof typeof MetricsType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MetricsType = {
  CPU_PERCENT: "CPU_PERCENT",
  MEMORY_LIMIT: "MEMORY_LIMIT",
  MEMORY_PERCENT: "MEMORY_PERCENT",
  MEMORY_USAGE: "MEMORY_USAGE",
  NETWORK_INPUT: "NETWORK_INPUT",
  NETWORK_OUTPUT: "NETWORK_OUTPUT",
  BLOCK_READ: "BLOCK_READ",
  BLOCK_WRITE: "BLOCK_WRITE",
} as const;

export type MetricLayoutUI = MetricLayout & { _uiUuid: string };
