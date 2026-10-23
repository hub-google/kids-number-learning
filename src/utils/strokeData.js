// Stroke data using bezier curve commands for accurate number shapes.
// Each stroke is an array of commands:
//   { cmd: 'M', x, y }            - moveTo
//   { cmd: 'L', x, y }            - lineTo
//   { cmd: 'Q', cx, cy, x, y }    - quadraticCurveTo
//   { cmd: 'C', cx1, cy1, cx2, cy2, x, y } - bezierCurveTo
// All coordinates are 0..1 relative to (digitWidth, usableHeight).

export const DIGIT_PATHS = {
  '0': [
    [
      { cmd: 'M', x: 0.5,  y: 0.08 },
      { cmd: 'C', cx1: 0.78, cy1: 0.08, cx2: 0.85, cy2: 0.3,  x: 0.85, y: 0.5  },
      { cmd: 'C', cx1: 0.85, cy1: 0.7,  cx2: 0.78, cy2: 0.92, x: 0.5,  y: 0.92 },
      { cmd: 'C', cx1: 0.22, cy1: 0.92, cx2: 0.15, cy2: 0.7,  x: 0.15, y: 0.5  },
      { cmd: 'C', cx1: 0.15, cy1: 0.3,  cx2: 0.22, cy2: 0.08, x: 0.5,  y: 0.08 },
    ]
  ],
  // Handwritten digits based on the user's approved children's workbook reference.
  // All positions are normalized to 0..1 and use round pen caps.
  '1': [
    [
      { cmd: 'M', x: 0.5, y: 0.08 },
      { cmd: 'L', x: 0.5, y: 0.92 },
    ],
  ],
  '2': [
    [
      { cmd: 'M', x: 0.22, y: 0.28 },
      { cmd: 'C', cx1: 0.29, cy1: 0.02, cx2: 0.83, cy2: 0.02, x: 0.78, y: 0.33 },
      { cmd: 'C', cx1: 0.75, cy1: 0.53, cx2: 0.44, cy2: 0.70, x: 0.22, y: 0.91 },
      { cmd: 'L', x: 0.78, y: 0.91 },
    ],
  ],
  '3': [
    [
      { cmd: 'M', x: 0.24, y: 0.18 },
      { cmd: 'C', cx1: 0.39, cy1: 0.02, cx2: 0.83, cy2: 0.05, x: 0.76, y: 0.31 },
      { cmd: 'Q', cx: 0.72, cy: 0.44, x: 0.49, y: 0.49 },
      { cmd: 'C', cx1: 0.88, cy1: 0.43, cx2: 0.90, cy2: 0.79, x: 0.68, y: 0.89 },
      { cmd: 'C', cx1: 0.47, cy1: 1.00, cx2: 0.22, cy2: 0.89, x: 0.20, y: 0.79 },
    ],
  ],
  '4': [
    [
      // Open handwritten 4: left downstroke into the crossbar.
      { cmd: 'M', x: 0.33, y: 0.12 },
      { cmd: 'L', x: 0.30, y: 0.63 },
      { cmd: 'L', x: 0.80, y: 0.63 },
    ],
    [
      { cmd: 'M', x: 0.63, y: 0.34 },
      { cmd: 'L', x: 0.63, y: 0.92 },
    ],
  ],
  '5': [
    [
      { cmd: 'M', x: 0.77, y: 0.12 },
      { cmd: 'L', x: 0.29, y: 0.12 },
      { cmd: 'L', x: 0.27, y: 0.48 },
      { cmd: 'C', cx1: 0.45, cy1: 0.38, cx2: 0.80, cy2: 0.46, x: 0.80, y: 0.68 },
      { cmd: 'C', cx1: 0.80, cy1: 0.91, cx2: 0.37, cy2: 0.98, x: 0.22, y: 0.80 },
    ],
  ],
  '6': [
    [
      { cmd: 'M', x: 0.75, y: 0.12 },
      { cmd: 'C', cx1: 0.56, cy1: 0.27, cx2: 0.34, cy2: 0.45, x: 0.29, y: 0.65 },
      { cmd: 'C', cx1: 0.20, cy1: 0.89, cx2: 0.44, cy2: 0.98, x: 0.63, y: 0.87 },
      { cmd: 'C', cx1: 0.88, cy1: 0.74, cx2: 0.80, cy2: 0.49, x: 0.63, y: 0.50 },
      { cmd: 'C', cx1: 0.49, cy1: 0.47, cx2: 0.35, cy2: 0.53, x: 0.29, y: 0.65 },
    ],
  ],
  '7': [
    [
      // Top bar and descending diagonal (the approved workbook shape).
      { cmd: 'M', x: 0.22, y: 0.13 },
      { cmd: 'L', x: 0.81, y: 0.13 },
      { cmd: 'L', x: 0.45, y: 0.92 },
    ],
    [
      // The characteristic short downward notch at the upper left.
      { cmd: 'M', x: 0.22, y: 0.13 },
      { cmd: 'L', x: 0.25, y: 0.31 },
    ],
  ],
  '8': [
    [
      // Rounded figure-eight with a smaller top loop.
      { cmd: 'M', x: 0.50, y: 0.49 },
      { cmd: 'C', cx1: 0.80, cy1: 0.30, cx2: 0.76, cy2: 0.09, x: 0.50, y: 0.10 },
      { cmd: 'C', cx1: 0.19, cy1: 0.09, cx2: 0.22, cy2: 0.31, x: 0.50, y: 0.49 },
      { cmd: 'C', cx1: 0.84, cy1: 0.67, cx2: 0.79, cy2: 0.92, x: 0.50, y: 0.92 },
      { cmd: 'C', cx1: 0.19, cy1: 0.92, cx2: 0.15, cy2: 0.66, x: 0.50, y: 0.49 },
    ],
  ],
  '9': [
    [
      // A single rounded loop with a descending tail; no serif/hook at the bottom.
      { cmd: 'M', x: 0.73, y: 0.36 },
      { cmd: 'C', cx1: 0.82, cy1: 0.07, cx2: 0.35, cy2: 0.02, x: 0.23, y: 0.31 },
      { cmd: 'C', cx1: 0.11, cy1: 0.61, cx2: 0.61, cy2: 0.71, x: 0.73, y: 0.36 },
      { cmd: 'L', x: 0.62, y: 0.92 },
    ],
  ],
};

// Flatten a bezier/line path into a series of (x,y) sample points.
// t goes from 0..1 in `steps` steps, sampling each segment.
function samplePath(cmds, steps) {
  const pts = [];
  let cx = 0, cy = 0;
  for (const cmd of cmds) {
    if (cmd.cmd === 'M') {
      cx = cmd.x; cy = cmd.y;
      pts.push({ x: cx, y: cy });
    } else if (cmd.cmd === 'L') {
      const n = Math.max(3, Math.round(steps * 0.25));
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        pts.push({ x: cx + (cmd.x - cx) * t, y: cy + (cmd.y - cy) * t });
      }
      cx = cmd.x; cy = cmd.y;
    } else if (cmd.cmd === 'Q') {
      const n = Math.max(4, Math.round(steps * 0.4));
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        const mt = 1 - t;
        pts.push({
          x: mt * mt * cx + 2 * mt * t * cmd.cx + t * t * cmd.x,
          y: mt * mt * cy + 2 * mt * t * cmd.cy + t * t * cmd.y,
        });
      }
      cx = cmd.x; cy = cmd.y;
    } else if (cmd.cmd === 'C') {
      const n = Math.max(6, Math.round(steps * 0.5));
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        const mt = 1 - t;
        pts.push({
          x: mt*mt*mt*cx + 3*mt*mt*t*cmd.cx1 + 3*mt*t*t*cmd.cx2 + t*t*t*cmd.x,
          y: mt*mt*mt*cy + 3*mt*mt*t*cmd.cy1 + 3*mt*t*t*cmd.cy2 + t*t*t*cmd.y,
        });
      }
      cx = cmd.x; cy = cmd.y;
    }
  }
  return pts;
}

// Draw a DIGIT_PATH stroke onto a canvas context
export function drawDigitPath(context, cmds, offsetX, offsetY, digitWidth, usableHeight) {
  context.beginPath();
  for (const cmd of cmds) {
    const sx = (x) => offsetX + x * digitWidth;
    const sy = (y) => offsetY + y * usableHeight;
    if (cmd.cmd === 'M') {
      context.moveTo(sx(cmd.x), sy(cmd.y));
    } else if (cmd.cmd === 'L') {
      context.lineTo(sx(cmd.x), sy(cmd.y));
    } else if (cmd.cmd === 'Q') {
      context.quadraticCurveTo(sx(cmd.cx), sy(cmd.cy), sx(cmd.x), sy(cmd.y));
    } else if (cmd.cmd === 'C') {
      context.bezierCurveTo(sx(cmd.cx1), sy(cmd.cy1), sx(cmd.cx2), sy(cmd.cy2), sx(cmd.x), sy(cmd.y));
    }
  }
}

export const generateCheckpoints = (numberStr, canvasWidth, canvasHeight) => {
  const digits = numberStr.toString().split('');
  const numDigits = digits.length;
  const paddingX = canvasWidth * (numDigits === 1 ? 0.18 : 0.06);
  const paddingY = canvasHeight * 0.08;
  const usableWidth = canvasWidth - paddingX * 2;
  const usableHeight = canvasHeight - paddingY * 2;

  const digitSpacing = Math.min(16, usableWidth * 0.04);
  const totalSpacing = digitSpacing * (numDigits - 1);
  const digitWidth = (usableWidth - totalSpacing) / numDigits;

  // ── Inset: shrink each digit's drawing rect so thick strokes stay inside ──
  const guideStrokeW = Math.max(18, Math.min(numDigits >= 3 ? 28 : 38, digitWidth * 0.18));
  const inset = guideStrokeW / 2 + 4; // half stroke + 4px safety

  const allCheckpoints = [];

  digits.forEach((digit, index) => {
    const paths = DIGIT_PATHS[digit] || DIGIT_PATHS['0'];
    const baseX = paddingX + index * (digitWidth + digitSpacing);
    const baseY = paddingY;

    // Apply inset so checkpoints match the visually inset digit paths
    const innerX = baseX + inset;
    const innerY = baseY + inset;
    const innerW = digitWidth - inset * 2;
    const innerH = usableHeight - inset * 2;

    // Merge all strokes into one stroke's checkpoints (simplified for child tracing)
    paths.forEach((cmds, strokeIdx) => {
      const rawPts = samplePath(cmds, 12);
      const scaledPts = rawPts.map((pt, pIdx) => ({
        x: innerX + pt.x * innerW,
        y: innerY + pt.y * innerH,
        isStart: pIdx === 0,
        isEnd: pIdx === rawPts.length - 1,
        hit: false,
      }));
      if (scaledPts.length > 0) {
        scaledPts[0].isStart = true;
        scaledPts[scaledPts.length - 1].isEnd = true;
      }
      allCheckpoints.push(scaledPts);
    });
  });

  return allCheckpoints;
};
