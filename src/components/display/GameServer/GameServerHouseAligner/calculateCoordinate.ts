const UNIQUE_POSITIONS = [
  { x: 0.102, y: 0.248 },
  { x: 0.665, y: 0.265 },
];

const REPEATING_POSITIONS = [
  { x: 0.625, y: 0.552 },
  { x: 0.198, y: 0.51 },
  { x: 0.315, y: 0.745 },
  { x: 0.733, y: 0.86 },
  { x: 0.12, y: 0.904 },
  { x: 0.41, y: 0.995 },
];

const VERTICAL_OFFSET = 0.668;

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
