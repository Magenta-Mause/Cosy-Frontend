export type DashboardTypes = (typeof DashboardTypes)[keyof typeof DashboardTypes];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DashboardTypes = {
  METRIC: "METRIC",
  LOGS: "LOGS",
  FREETEXT: "FREETEXT",
} as const;
