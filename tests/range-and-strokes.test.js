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
