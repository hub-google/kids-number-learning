export const DIGIT_STROKES = {
  '0': [
    [ {x: 0.5, y: 0.1}, {x: 0.3, y: 0.3}, {x: 0.3, y: 0.7}, {x: 0.5, y: 0.9}, {x: 0.7, y: 0.7}, {x: 0.7, y: 0.3}, {x: 0.5, y: 0.1} ]
  ],
  '1': [
    [ {x: 0.5, y: 0.1}, {x: 0.5, y: 0.5}, {x: 0.5, y: 0.9} ]
  ],
  '2': [
    [ {x: 0.32, y: 0.25}, {x: 0.5, y: 0.1}, {x: 0.68, y: 0.25}, {x: 0.52, y: 0.55}, {x: 0.32, y: 0.9}, {x: 0.52, y: 0.9}, {x: 0.7, y: 0.9} ]
  ],
  '3': [
    [ {x: 0.32, y: 0.18}, {x: 0.5, y: 0.1}, {x: 0.68, y: 0.25}, {x: 0.48, y: 0.48}, {x: 0.7, y: 0.7}, {x: 0.5, y: 0.9}, {x: 0.32, y: 0.82} ]
  ],
  '4': [
    [ {x: 0.35, y: 0.1}, {x: 0.35, y: 0.55}, {x: 0.75, y: 0.55} ],
    [ {x: 0.65, y: 0.2}, {x: 0.65, y: 0.55}, {x: 0.65, y: 0.9} ]
  ],
  '5': [
    [ {x: 0.35, y: 0.1}, {x: 0.35, y: 0.45}, {x: 0.65, y: 0.48}, {x: 0.68, y: 0.72}, {x: 0.5, y: 0.9}, {x: 0.32, y: 0.8} ],
    [ {x: 0.35, y: 0.1}, {x: 0.55, y: 0.1}, {x: 0.72, y: 0.1} ]
  ],
  '6': [
    [ {x: 0.65, y: 0.1}, {x: 0.4, y: 0.3}, {x: 0.32, y: 0.55}, {x: 0.4, y: 0.9}, {x: 0.68, y: 0.8}, {x: 0.65, y: 0.58}, {x: 0.35, y: 0.55} ]
  ],
  '7': [
    [ {x: 0.3, y: 0.1}, {x: 0.52, y: 0.1}, {x: 0.72, y: 0.1}, {x: 0.55, y: 0.5}, {x: 0.42, y: 0.9} ]
  ],
  '8': [
    [ {x: 0.62, y: 0.2}, {x: 0.5, y: 0.1}, {x: 0.38, y: 0.2}, {x: 0.5, y: 0.5}, {x: 0.68, y: 0.72}, {x: 0.5, y: 0.9}, {x: 0.32, y: 0.72}, {x: 0.5, y: 0.5}, {x: 0.62, y: 0.2} ]
  ],
  '9': [
    [ {x: 0.68, y: 0.35}, {x: 0.5, y: 0.1}, {x: 0.32, y: 0.28}, {x: 0.48, y: 0.5}, {x: 0.68, y: 0.35}, {x: 0.68, y: 0.65}, {x: 0.68, y: 0.9} ]
  ]
};

export const generateCheckpoints = (numberStr, canvasWidth, canvasHeight) => {
  const digits = numberStr.toString().split('');
  const numDigits = digits.length;
  // Dynamic padding based on number of digits so it scales well
  const paddingX = canvasWidth * (numDigits === 1 ? 0.16 : 0.08);
  const paddingY = canvasHeight * 0.1;
  const usableWidth = canvasWidth - paddingX * 2;
  const usableHeight = canvasHeight - paddingY * 2;
  
  // Calculate width per digit
  const digitSpacing = Math.min(20, usableWidth * 0.05);
  const totalSpacing = digitSpacing * (numDigits - 1);
  const digitWidth = (usableWidth - totalSpacing) / numDigits;
  
  const allCheckpoints = [];
  
  digits.forEach((digit, index) => {
    const strokes = DIGIT_STROKES[digit] || DIGIT_STROKES['0'];
    const offsetX = paddingX + index * (digitWidth + digitSpacing);
    const offsetY = paddingY;
    
    strokes.forEach(stroke => {
      const actualStrokePoints = stroke.map((pt, pIdx) => ({
        x: offsetX + pt.x * digitWidth,
        y: offsetY + pt.y * usableHeight,
        isStart: pIdx === 0,
        isEnd: pIdx === stroke.length - 1,
        hit: false
      }));
      allCheckpoints.push(actualStrokePoints);
    });
  });
  
  return allCheckpoints;
};

