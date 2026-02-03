const UNIQUE_POSITIONS = [
  { x: 0.105, y: 0.27 },
  { x: 0.705, y: 0.28 },
];

const REPEATING_POSITIONS = [
  { x: 0.645, y: 0.59 },
  { x: 0.2, y: 0.55 },
  { x: 0.32, y: 0.8 },
  { x: 0.756, y: 0.92 },
  { x: 0.12, y: 0.97 },
  { x: 0.423, y: 1.06 },
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
