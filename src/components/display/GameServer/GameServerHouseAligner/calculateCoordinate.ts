const UNIQUE_POSITIONS = [
  { x: 0.11, y: 0.28 },
  { x: 0.71, y: 0.29 },
];

const REPEATING_POSITIONS = [
  { x: 0.65, y: 0.6 },
  { x: 0.21, y: 0.56 },
  { x: 0.33, y: 0.81 },
  { x: 0.76, y: 0.93 },
  { x: 0.13, y: 0.98 },
  { x: 0.43, y: 1.07 },
];

const VERTICAL_OFFSET = 0.724;

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
