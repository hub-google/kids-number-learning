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
  '1': [
    [
      { cmd: 'M', x: 0.35, y: 0.22 },
      { cmd: 'Q', cx: 0.45, cy: 0.15, x: 0.55, y: 0.08 },
      { cmd: 'L', x: 0.55, y: 0.92 },
    ]
  ],
  '2': [
    [
      { cmd: 'M', x: 0.22, y: 0.32 },
      { cmd: 'C', cx1: 0.22, cy1: 0.1,  cx2: 0.78, cy2: 0.1,  x: 0.78, y: 0.32 },
      { cmd: 'Q', cx: 0.78, cy: 0.52, x: 0.5,  y: 0.62 },
      { cmd: 'L', x: 0.22, y: 0.92 },
      { cmd: 'L', x: 0.78, y: 0.92 },
    ]
  ],
  '3': [
    [
      { cmd: 'M', x: 0.22, y: 0.22 },
      { cmd: 'C', cx1: 0.22, cy1: 0.08, cx2: 0.78, cy2: 0.08, x: 0.78, y: 0.28 },
      { cmd: 'Q', cx: 0.78, cy: 0.48, x: 0.48, y: 0.5  },
      { cmd: 'Q', cx: 0.78, cy: 0.52, x: 0.78, y: 0.72 },
      { cmd: 'C', cx1: 0.78, cy1: 0.92, cx2: 0.22, cy2: 0.92, x: 0.22, y: 0.78 },
    ]
  ],
  '4': [
    [
      { cmd: 'M', x: 0.68, y: 0.08 },
      { cmd: 'L', x: 0.22, y: 0.62 },
      { cmd: 'L', x: 0.82, y: 0.62 },
    ],
    [
      { cmd: 'M', x: 0.68, y: 0.08 },
      { cmd: 'L', x: 0.68, y: 0.92 },
    ]
  ],
  '5': [
    [
      { cmd: 'M', x: 0.75, y: 0.08 },
      { cmd: 'L', x: 0.28, y: 0.08 },
      { cmd: 'L', x: 0.28, y: 0.45 },
      { cmd: 'C', cx1: 0.28, cy1: 0.38, cx2: 0.78, cy2: 0.38, x: 0.78, y: 0.65 },
      { cmd: 'C', cx1: 0.78, cy1: 0.9,  cx2: 0.22, cy2: 0.92, x: 0.22, y: 0.8  },
    ]
  ],
  '6': [
    [
      { cmd: 'M', x: 0.72, y: 0.15 },
      { cmd: 'C', cx1: 0.5,  cy1: 0.02, cx2: 0.18, cy2: 0.2,  x: 0.18, y: 0.5  },
      { cmd: 'C', cx1: 0.18, cy1: 0.78, cx2: 0.32, cy2: 0.95, x: 0.5,  y: 0.95 },
      { cmd: 'C', cx1: 0.72, cy1: 0.95, cx2: 0.82, cy2: 0.78, x: 0.82, y: 0.65 },
      { cmd: 'C', cx1: 0.82, cy1: 0.5,  cx2: 0.62, cy2: 0.45, x: 0.42, y: 0.5  },
      { cmd: 'C', cx1: 0.28, cy1: 0.53, cx2: 0.18, cy2: 0.55, x: 0.18, y: 0.5  },
    ]
  ],
  '7': [
    [
      { cmd: 'M', x: 0.2,  y: 0.08 },
      { cmd: 'L', x: 0.8,  y: 0.08 },
      { cmd: 'Q', cx: 0.7,  cy: 0.35, x: 0.42, y: 0.92 },
    ]
  ],
  '8': [
    [
      { cmd: 'M', x: 0.5,  y: 0.5  },
      { cmd: 'C', cx1: 0.82, cy1: 0.5,  cx2: 0.82, cy2: 0.08, x: 0.5,  y: 0.08 },
      { cmd: 'C', cx1: 0.18, cy1: 0.08, cx2: 0.18, cy2: 0.5,  x: 0.5,  y: 0.5  },
      { cmd: 'C', cx1: 0.82, cy1: 0.5,  cx2: 0.82, cy2: 0.92, x: 0.5,  y: 0.92 },
      { cmd: 'C', cx1: 0.18, cy1: 0.92, cx2: 0.18, cy2: 0.5,  x: 0.5,  y: 0.5  },
    ]
  ],
  '9': [
    [
      { cmd: 'M', x: 0.5,  y: 0.08 },
      { cmd: 'C', cx1: 0.82, cy1: 0.08, cx2: 0.82, cy2: 0.5,  x: 0.5,  y: 0.5  },
      { cmd: 'C', cx1: 0.18, cy1: 0.5,  cx2: 0.18, cy2: 0.08, x: 0.5,  y: 0.08 },
      { cmd: 'M', x: 0.82, y: 0.35 },
      { cmd: 'C', cx1: 0.82, cy1: 0.65, cx2: 0.75, cy2: 0.92, x: 0.5,  y: 0.92 },
      { cmd: 'C', cx1: 0.35, cy1: 0.92, cx2: 0.25, cy2: 0.85, x: 0.22, y: 0.78 },
    ]
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

  const allCheckpoints = [];

  digits.forEach((digit, index) => {
    const paths = DIGIT_PATHS[digit] || DIGIT_PATHS['0'];
    const offsetX = paddingX + index * (digitWidth + digitSpacing);
    const offsetY = paddingY;

    // Merge all strokes into one stroke's checkpoints (simplified for child tracing)
    paths.forEach((cmds, strokeIdx) => {
      const rawPts = samplePath(cmds, 12);
      const scaledPts = rawPts.map((pt, pIdx) => ({
        x: offsetX + pt.x * digitWidth,
        y: offsetY + pt.y * usableHeight,
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
