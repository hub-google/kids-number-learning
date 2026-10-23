import test from 'node:test';
import assert from 'node:assert/strict';
import { clampNumber, normalizeRange } from '../src/utils/numberRange.js';
import { DIGIT_PATHS, generateCheckpoints } from '../src/utils/strokeData.js';

test('ranges stay finite, ordered and within 1 to 1000', () => {
  assert.deepEqual(normalizeRange(2000, -1), { start: 1000, end: 1000 });
  assert.deepEqual(normalizeRange(25, 10), { start: 25, end: 25 });
  assert.deepEqual(normalizeRange('bad', Infinity), { start: 1, end: 1000 });
  assert.equal(clampNumber(-20), 1);
  assert.equal(clampNumber('55.8'), 55);
});

test('digit 9 uses a continuous loop and tail without a printed-style bottom hook', () => {
  assert.equal(DIGIT_PATHS['9'].length, 1);
  assert.equal(generateCheckpoints('9', 360, 400).length, 1);
  const cmds = DIGIT_PATHS['9'][0];
  assert.equal(cmds.at(-1).cmd, 'L');
  assert.ok(cmds.at(-1).y > 0.85);
});

test('every stroke includes its true pen-down point', () => {
  for (const digit of Object.keys(DIGIT_PATHS)) {
    const strokes = generateCheckpoints(digit, 360, 400);
    assert.equal(strokes.length, DIGIT_PATHS[digit].length);
    for (const stroke of strokes) {
      assert.equal(stroke[0].isStart, true);
      assert.ok(stroke.length > 1);
    }
  }
});

test('digit 1 is a single vertical downstroke with no hook', () => {
  assert.deepEqual(DIGIT_PATHS['1'], [[
    { cmd: 'M', x: 0.5, y: 0.08 },
    { cmd: 'L', x: 0.5, y: 0.92 }
  ]]);
  const strokes = generateCheckpoints('1', 360, 400);
  assert.equal(strokes.length, 1);
  assert.ok(strokes[0].length > 1);
  const x = strokes[0][0].x;
  assert.ok(strokes[0].every(point => Math.abs(point.x - x) < 0.00001));
  assert.ok(strokes[0][0].y < strokes[0].at(-1).y);
});

test('all 1-9 characters have valid handwritten drawing commands', () => {
  for (let number = 1; number <= 9; number++) {
    const strokes = DIGIT_PATHS[String(number)];
    assert.ok(strokes.length >= 1);
    for (const stroke of strokes) {
      assert.equal(stroke[0].cmd, 'M');
      assert.ok(stroke.length >= 2);
      for (const command of stroke) {
        assert.ok(['M', 'L', 'Q', 'C'].includes(command.cmd));
        for (const [name, value] of Object.entries(command)) {
          if (name === 'cmd') continue;
          assert.ok(Number.isFinite(value), `${number} ${name} is finite`);
          assert.ok(value >= 0 && value <= 1, `${number} ${name} is normalized`);
        }
      }
    }
    assert.ok(generateCheckpoints(String(number), 360, 400).flat().length >= 4);
  }
});

test('workbook handwritten 7 has a short left notch and diagonal downstroke', () => {
  const seven = DIGIT_PATHS['7'];
  assert.equal(seven.length, 2);
  assert.deepEqual(seven[0].map(command => command.cmd), ['M', 'L', 'L']);
  const [topLeft, topRight, bottom] = seven[0];
  assert.ok(topLeft.x < topRight.x && topLeft.y === topRight.y);
  assert.ok(bottom.x < topRight.x && bottom.y > topRight.y);
  assert.ok(seven[1][1].y > seven[1][0].y);
  assert.ok(seven[1][1].y < bottom.y);
});

test('workbook handwritten 4 is open at top, not a closed printed numeral', () => {
  const four = DIGIT_PATHS['4'];
  assert.equal(four.length, 2);
  assert.deepEqual(four[0].map(command => command.cmd), ['M', 'L', 'L']);
  assert.equal(four[1][0].cmd, 'M');
});
