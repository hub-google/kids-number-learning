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

test('digit 9 does not join disconnected pen strokes', () => {
  assert.equal(DIGIT_PATHS['9'].length, 2);
  assert.equal(generateCheckpoints('9', 360, 400).length, 2);
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
