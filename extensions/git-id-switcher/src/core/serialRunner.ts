/**
 * Serial Runner
 *
 * Runs async tasks one at a time, in the order they were submitted. Used so
 * that two identity switches never write git config or ssh-agent at the same
 * time. A failed task does not stop the tasks queued after it.
 */

export type SerialRunner = <T>(task: () => Promise<T>) => Promise<T>;

/**
 * Wait for a task without passing on its failure: the queue continues after
 * a failed task, and the caller of that task still sees the rejection.
 */
async function settle(promise: Promise<unknown>): Promise<void> {
  try {
    await promise;
  } catch {
    // Reported to the task's own caller
  }
}

export function createSerialRunner(): SerialRunner {
  // Settles (never rejects) when the last queued task has finished
  let tail: Promise<void> = Promise.resolve();
  return <T>(task: () => Promise<T>): Promise<T> => {
    const previous = tail;
    const run = (async (): Promise<T> => {
      await previous;
      return await task();
    })();
    tail = settle(run);
    return run;
  };
}
