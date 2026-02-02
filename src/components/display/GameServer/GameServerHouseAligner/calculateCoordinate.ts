const POSITIONS = [
  { x: 0.105, y: 0.31 },
  { x: 0.705, y: 0.328 },
  { x: 0.2, y: 0.614 },
  { x: 0.64, y: 0.67 },
  { x: 0.32, y: 0.91 },
  { x: 0.77, y: 1.055 },
  { x: 0.12, y: 1.11 },
  { x: 0.435, y: 1.23 },
  { x: 0.28, y: 0.62 },
  { x: 0.72, y: 0.68 },
  { x: 0.24, y: 0.75 },
  { x: 0.76, y: 0.8 },
  { x: 0.3, y: 0.86 },
  { x: 0.7, y: 0.92 },
  { x: 0.5, y: 0.98 },
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
