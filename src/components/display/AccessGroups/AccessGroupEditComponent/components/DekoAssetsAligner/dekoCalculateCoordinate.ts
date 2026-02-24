const UNIQUE_POSITIONS = [
  { x: 0.35, y: 0.17 },
  { x: 0.05, y: 0.22 },

  { x: 0.61, y: 0.16 },
  { x: 0.9, y: 0.2 },
];

const REPEATING_POSITIONS = [
  { x: 0.6, y: 0.3 },
  { x: 0.8, y: 0.4 },

  { x: 0.1, y: 0.3 },
  { x: 0.32, y: 0.39 },

  { x: 0.5, y: 0.43 },
  { x: 0.2, y: 0.48 },

  { x: 0.68, y: 0.46 },
  { x: 0.85, y: 0.59 },

  { x: 0.07, y: 0.6 },
  { x: 0.3, y: 0.57 },

  { x: 0.35, y: 0.65 },
  { x: 0.62, y: 0.64 },
];

const VERTICAL_OFFSET = 0.385;

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
