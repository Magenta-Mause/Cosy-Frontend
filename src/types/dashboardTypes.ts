export type DashboardElementTypes =
  (typeof DashboardElementTypes)[keyof typeof DashboardElementTypes];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DashboardElementTypes = {
  METRIC: "METRIC",
  LOGS: "LOGS",
  FREETEXT: "FREETEXT",
} as const;
