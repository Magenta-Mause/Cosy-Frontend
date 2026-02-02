const POSITIONS = [
  { x: 0.105, y: 0.21 },
  { x: 0.705, y: 0.23 },
  { x: 0.19, y: 0.45 },
  { x: 0.64, y: 0.48 },
  { x: 0.32, y: 0.65 }, //
  { x: 0.77, y: 0.75 }, //
  { x: 0.12, y: 0.79 }, //
  { x: 0.423, y: 0.87 }, //
  { x: 0.19, y: 0.45 + 0.6 },
  { x: 0.64, y: 0.48 + 0.6 },
  { x: 0.32, y: 0.65 + 0.6 }, //
  { x: 0.77, y: 0.75 + 0.6 }, //
  { x: 0.12, y: 0.79 + 0.6 }, //
  { x: 0.423, y: 0.87 + 0.6 },
];

function calculateCoordinate(index: number) {
  const base = POSITIONS[index % POSITIONS.length];

  if (base === undefined) {
    return { x: 0, y: 0 };
  }

  return {
    x: base.x,
    y: base.y,
  };
}

export default calculateCoordinate;
