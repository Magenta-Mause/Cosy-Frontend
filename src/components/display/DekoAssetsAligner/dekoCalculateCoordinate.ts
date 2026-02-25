const UNIQUE_POSITIONS = [
  { x: 0.35, y: 0.218 },
  { x: 0.08, y: 0.228 },

  { x: 0.57, y: 0.199 },
  { x: 0.82, y: 0.25 },
];

const REPEATING_POSITIONS = [
  { x: 0.62, y: 0.29 },
  { x: 0.87, y: 0.37 },

  { x: 0.12, y: 0.31 },
  { x: 0.38, y: 0.38 },

  { x: 0.48, y: 0.43 },
  { x: 0.17, y: 0.48 },

  { x: 0.69, y: 0.46 },
  { x: 0.86, y: 0.59 },

  { x: 0.11, y: 0.62 },
  { x: 0.34, y: 0.56 },

  { x: 0.33, y: 0.65 },
  { x: 0.56, y: 0.58 },
];

const VERTICAL_OFFSET = 0.371;

function calculateCoordinate(index: number) {
  if (index < UNIQUE_POSITIONS.length) {
    const position = UNIQUE_POSITIONS[index];
    return position ?? { x: 0, y: 0 };
  }

  const adjustedIndex = index - UNIQUE_POSITIONS.length;
  const positionIndex = adjustedIndex % REPEATING_POSITIONS.length;
  const rowMultiplier = Math.floor(adjustedIndex / REPEATING_POSITIONS.length);

  const base = REPEATING_POSITIONS[positionIndex];

  if (base === undefined) {
    return { x: 0, y: 0 };
  }

  return {
    x: base.x,
    y: base.y + VERTICAL_OFFSET * rowMultiplier,
  };
}

export default calculateCoordinate;
