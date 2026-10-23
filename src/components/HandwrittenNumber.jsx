import { DIGIT_PATHS } from '../utils/strokeData';

// The selection grid and tracing guide share the exact same handwritten strokes.
// This avoids teaching one shape in the grid and asking the child to trace another.
const X = value => Number((value * 100).toFixed(2));
const Y = value => Number((value * 110 + 5).toFixed(2));

export function pathToSvg(commands) {
  return commands.map(command => {
    switch (command.cmd) {
      case 'M': return `M ${X(command.x)} ${Y(command.y)}`;
      case 'L': return `L ${X(command.x)} ${Y(command.y)}`;
      case 'Q': return `Q ${X(command.cx)} ${Y(command.cy)} ${X(command.x)} ${Y(command.y)}`;
      case 'C': return `C ${X(command.cx1)} ${Y(command.cy1)} ${X(command.cx2)} ${Y(command.cy2)} ${X(command.x)} ${Y(command.y)}`;
      default: throw new Error(`Unknown handwriting command: ${command.cmd}`);
    }
  }).join(' ');
}

export default function HandwrittenNumber({ value }) {
  const digits = String(value).split('');
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${digits.length * 100} 120`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', maxHeight: '52px', display: 'block', overflow: 'visible' }}
    >
      {digits.map((digit, index) => (
        <g key={index} transform={`translate(${index * 100} 0)`}>
          {(DIGIT_PATHS[digit] || []).map((stroke, strokeIndex) => (
            <path
              key={strokeIndex}
              d={pathToSvg(stroke)}
              fill="none"
              stroke="currentColor"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
