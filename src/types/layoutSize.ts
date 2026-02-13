export type LayoutSize = (typeof LayoutSize)[keyof typeof LayoutSize];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LayoutSize = {
  SMALL: "SMALL",
  MEDIUM: "MEDIUM",
  LARGE: "LARGE",
} as const;
