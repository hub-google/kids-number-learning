// Pure tracing helpers, shared by the UI and Node regression tests.
// Checkpoints are awarded only in stroke order: a single tap near the end
// must never mark all the skipped points as completed.
const distanceToSegment = (point, a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared ? Math.max(0, Math.min(1,
    ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared)) : 0;
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
};

export function advanceTracing(checkpoints, from, to, radius) {
  if (!checkpoints.length) return checkpoints;
  const result = checkpoints.map(stroke => stroke.map(point => ({ ...point })));
  for (const stroke of result) {
    let next = stroke.findIndex(point => !point.hit);
    if (next < 0) continue;
    // Do not award later strokes until earlier ones are done.
    while (next < stroke.length && distanceToSegment(stroke[next], from, to) <= radius) {
      stroke[next].hit = true;
      next++;
    }
    break;
  }
  return result;
}

export function eraseTracing(checkpoints, from, to, radius) {
  return checkpoints.map(stroke => {
    const firstErased = stroke.findIndex(point =>
      point.hit && distanceToSegment(point, from, to) <= radius
    );
    // Once an earlier checkpoint is erased, downstream points also need retracing.
    return firstErased < 0 ? stroke : stroke.map((point, index) =>
      index >= firstErased ? { ...point, hit: false } : point
    );
  });
}

export function getTracingScore(checkpoints) {
  const points = checkpoints.flat();
  const ratio = points.length ? points.filter(point => point.hit).length / points.length : 0;
  return ratio >= 0.85 ? 3 : ratio >= 0.55 ? 2 : 1;
}
