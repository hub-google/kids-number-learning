import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceTracing, eraseTracing, getTracingScore } from '../src/utils/tracingLogic.js';

const points = () => [[0, 20, 40, 60, 80].map(x => ({ x, y: 0, hit: false }))];
const p = x => ({ x, y: 0 });

test('one tap at the end never grants earlier checkpoints', () => {
  const result = advanceTracing(points(), p(80), p(80), 8);
  assert.equal(result[0].filter(x => x.hit).length, 0);
  assert.equal(getTracingScore(result), 1);
});

test('following the guide in order grants full credit', () => {
  let result = points();
  for (let x = 0; x <= 80; x += 20) {
    result = advanceTracing(result, p(x), p(x), 8);
  }
  assert.equal(result[0].filter(x => x.hit).length, 5);
  assert.equal(getTracingScore(result), 3);
});

test('a pointer move checks the entire traced line segment', () => {
  const result = advanceTracing(points(), p(0), p(80), 8);
  assert.equal(getTracingScore(result), 3);
});

test('erasing an early checkpoint resets following checkpoints', () => {
  const completed = advanceTracing(points(), p(0), p(80), 8);
  const erased = eraseTracing(completed, p(40), p(40), 8);
  assert.deepEqual(erased[0].map(x => x.hit), [true, true, false, false, false]);
  assert.equal(getTracingScore(erased), 1);
});

test('zero checkpoints do not earn a perfect score', () => {
  assert.equal(getTracingScore([]), 1);
});
