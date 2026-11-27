/**
 * Serial Runner Tests
 *
 * Tasks run one at a time in the order submitted, and a failed task does not
 * stop the queue.
 */

import * as assert from 'node:assert';
import { createSerialRunner } from '../core/serialRunner';

async function testSerialRunner(): Promise<void> {
  console.log('  Testing createSerialRunner()...');
  const runSerially = createSerialRunner();
  const events: string[] = [];
  let releaseFirst: () => void = () => undefined;
  const first = runSerially(
    () =>
      new Promise<string>((resolve) => {
        events.push('first start');
        releaseFirst = () => {
          events.push('first end');
          resolve('one');
        };
      }),
  );
  const second = runSerially(async () => {
    events.push('second start');
    throw new Error('second failed');
  });
  const third = runSerially(async () => {
    events.push('third start');
    return 3;
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepStrictEqual(events, ['first start'], 'later tasks wait');
  releaseFirst();
  assert.strictEqual(await first, 'one');
  await assert.rejects(second, /second failed/);
  assert.strictEqual(await third, 3, 'a failure does not stop the queue');
  assert.deepStrictEqual(events, ['first start', 'first end', 'second start', 'third start']);
}

export async function runSerialRunnerTests(): Promise<void> {
  console.log('\n🚦 Running Serial Runner Tests...\n');
  await testSerialRunner();
  console.log('\n✅ All Serial Runner Tests Passed!\n');
}
