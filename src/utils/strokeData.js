export const DIGIT_STROKES = {
  '0': [
    [ {x: 0.5, y: 0.1}, {x: 0.25, y: 0.2}, {x: 0.15, y: 0.5}, {x: 0.25, y: 0.8}, {x: 0.5, y: 0.9}, {x: 0.75, y: 0.8}, {x: 0.85, y: 0.5}, {x: 0.75, y: 0.2}, {x: 0.5, y: 0.1} ]
  ],
  '1': [
    [ {x: 0.4, y: 0.25}, {x: 0.5, y: 0.1}, {x: 0.5, y: 0.9} ]
  ],
  '2': [
    [ {x: 0.2, y: 0.3}, {x: 0.3, y: 0.15}, {x: 0.5, y: 0.1}, {x: 0.7, y: 0.15}, {x: 0.8, y: 0.3}, {x: 0.75, y: 0.5}, {x: 0.5, y: 0.7}, {x: 0.2, y: 0.9}, {x: 0.8, y: 0.9} ]
  ],
  '3': [
    [ {x: 0.2, y: 0.2}, {x: 0.5, y: 0.1}, {x: 0.8, y: 0.25}, {x: 0.65, y: 0.45}, {x: 0.5, y: 0.5}, {x: 0.7, y: 0.55}, {x: 0.85, y: 0.75}, {x: 0.5, y: 0.9}, {x: 0.2, y: 0.8} ]
  ],
  '4': [
    [ {x: 0.7, y: 0.1}, {x: 0.2, y: 0.7}, {x: 0.9, y: 0.7} ],
    [ {x: 0.7, y: 0.1}, {x: 0.7, y: 0.9} ]
  ],
  '5': [
    [ {x: 0.3, y: 0.45}, {x: 0.2, y: 0.1}, {x: 0.8, y: 0.1} ],
    [ {x: 0.3, y: 0.45}, {x: 0.6, y: 0.4}, {x: 0.8, y: 0.6}, {x: 0.75, y: 0.85}, {x: 0.5, y: 0.9}, {x: 0.2, y: 0.8} ]
  ],
  '6': [
    [ {x: 0.7, y: 0.15}, {x: 0.4, y: 0.2}, {x: 0.2, y: 0.5}, {x: 0.2, y: 0.7}, {x: 0.35, y: 0.9}, {x: 0.6, y: 0.9}, {x: 0.8, y: 0.7}, {x: 0.7, y: 0.5}, {x: 0.45, y: 0.5}, {x: 0.2, y: 0.7} ]
  ],
  '7': [
    [ {x: 0.2, y: 0.1}, {x: 0.8, y: 0.1}, {x: 0.5, y: 0.5}, {x: 0.35, y: 0.9} ]
  ],
  '8': [
    [ {x: 0.5, y: 0.5}, {x: 0.3, y: 0.4}, {x: 0.2, y: 0.25}, {x: 0.3, y: 0.1}, {x: 0.5, y: 0.1}, {x: 0.7, y: 0.1}, {x: 0.8, y: 0.25}, {x: 0.7, y: 0.4}, {x: 0.5, y: 0.5}, {x: 0.3, y: 0.6}, {x: 0.2, y: 0.75}, {x: 0.3, y: 0.9}, {x: 0.5, y: 0.9}, {x: 0.7, y: 0.9}, {x: 0.8, y: 0.75}, {x: 0.7, y: 0.6}, {x: 0.5, y: 0.5} ]
  ],
  '9': [
    [ {x: 0.8, y: 0.3}, {x: 0.55, y: 0.5}, {x: 0.3, y: 0.5}, {x: 0.2, y: 0.3}, {x: 0.4, y: 0.1}, {x: 0.7, y: 0.15}, {x: 0.8, y: 0.3}, {x: 0.8, y: 0.5}, {x: 0.6, y: 0.8}, {x: 0.3, y: 0.85} ]
  ]
};

export const generateCheckpoints = (numberStr, canvasWidth, canvasHeight) => {
  const digits = numberStr.toString().split('');
  const numDigits = digits.length;
  // Dynamic padding based on number of digits so it scales well
  const paddingX = canvasWidth * 0.15;
  const paddingY = canvasHeight * 0.2;
  const usableWidth = canvasWidth - paddingX * 2;
  const usableHeight = canvasHeight - paddingY * 2;
  
  // Calculate width per digit
  const digitSpacing = Math.min(30, usableWidth * 0.1);
  const totalSpacing = digitSpacing * (numDigits - 1);
  const digitWidth = (usableWidth - totalSpacing) / numDigits;
  
  const allCheckpoints = [];
  
  digits.forEach((digit, index) => {
    const strokes = DIGIT_STROKES[digit] || [];
    const offsetX = paddingX + index * (digitWidth + digitSpacing);
    const offsetY = paddingY;
    
    strokes.forEach(stroke => {
      const actualStrokePoints = stroke.map(pt => ({
        x: offsetX + pt.x * digitWidth,
        y: offsetY + pt.y * usableHeight,
        hit: false
      }));
      allCheckpoints.push(actualStrokePoints);
    });
  });
  
  return allCheckpoints;
};
