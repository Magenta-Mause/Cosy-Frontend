export const GameServerDesign = {
  HOUSE: "HOUSE",
  CASTLE: "CASTLE",
} as const;

export type GameServerDesign = (typeof GameServerDesign)[keyof typeof GameServerDesign];
