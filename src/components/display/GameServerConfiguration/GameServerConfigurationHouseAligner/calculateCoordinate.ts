function calculateCoordinate(index: number) {
  function noise(seed: number) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  // ----- X (bounded, alternating) -----
  const baseX = index % 2 === 0 ? 0.25 : 0.75;
  const xJitter = (noise(index) - 0.5) * 0.15; // ±7.5%

  const x = clamp(baseX + xJitter, 0.05, 0.95);

  // ----- Y (unbounded, flowing down) -----
  const baseStepPx = 160;                // average vertical distance
  const variationPx = noise(index + 999) * 40; // variation per step

  const y = index * baseStepPx + variationPx;

  return { x, y };
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

export default calculateCoordinate;
