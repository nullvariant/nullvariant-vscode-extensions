/**
 * Repository Check Tests
 *
 * classifyRepositoryCheck(): inside a work tree, outside any repository, or
 * not known; a failed check is never "outside". hasGitEntryUpwards() with
 * fake and real file systems, the whole check against real git, and
 * isRepositoryGone().
 */

import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { classifyRepositoryCheck, hasGitEntryUpwards, isRepositoryGone } from '../core/repositoryCheck';
import { gitExec, type GitExecResult } from '../security/secureExec';
import { git, makeTempDir } from './helpers/signingFixtures';

const failed = (exitCode?: number): GitExecResult =>
  exitCode === undefined ? { success: false, error: new Error('x') } : { success: false, error: new Error('x'), exitCode };

/** A `.git` lookup that logs that it was asked */
function gitEntry(isFound: boolean, asked: string[] = []): () => Promise<boolean> {
  return async () => {
    asked.push('git-entry');
    return isFound;
  };
}

async function testClassify(): Promise<void> {
  console.log('  Testing classifyRepositoryCheck()...');
  const asked: string[] = [];
  const hasNoGitEntry = gitEntry(false, asked);

  assert.strictEqual(await classifyRepositoryCheck({ success: true, stdout: 'true' }, {}, hasNoGitEntry), 'repository');
  // Inside the .git directory: not a work tree
  assert.strictEqual(await classifyRepositoryCheck({ success: true, stdout: 'false' }, {}, hasNoGitEntry), 'outside');
  // Any other output of a successful call: not known
  for (const stdout of ['', 'True', 'true\r', 'yes']) {
    assert.strictEqual(await classifyRepositoryCheck({ success: true, stdout }, {}, hasNoGitEntry), 'error', JSON.stringify(stdout));
  }
  assert.deepStrictEqual(asked, [], 'the .git entry is looked for only after exit 128');

  // Exit 128 with no .git entry and nothing in the environment: outside
  assert.strictEqual(await classifyRepositoryCheck(failed(128), {}, hasNoGitEntry), 'outside');
  assert.deepStrictEqual(asked, ['git-entry']);

  // Exit 128 with a .git entry (git refused for another reason): not known
  assert.strictEqual(await classifyRepositoryCheck(failed(128), {}, gitEntry(true)), 'error');
  // Exit 128 with git pointed at a repository by the environment, an empty
  // value included (git takes it as a path): not known
  for (const name of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR']) {
    for (const value of ['/elsewhere', '']) {
      assert.strictEqual(await classifyRepositoryCheck(failed(128), { [name]: value }, gitEntry(false)), 'error', name);
    }
  }
  // Timed out, could not start, blocked, any other exit: not known
  for (const result of [failed(), failed(1), failed(129)]) {
    assert.strictEqual(await classifyRepositoryCheck(result, {}, hasNoGitEntry), 'error', JSON.stringify(result.success));
  }
}

async function testHasGitEntryUpwards(): Promise<void> {
  console.log('  Testing hasGitEntryUpwards()...');
  const root = path.parse(process.cwd()).root;
  const start = path.join(root, 'a', 'b');
  const checked: string[] = [];
  const isNowhere = async (entryPath: string): Promise<boolean> => {
    checked.push(entryPath);
    return false;
  };
  assert.strictEqual(await hasGitEntryUpwards(start, isNowhere), false);
  assert.deepStrictEqual(checked, [
    path.join(root, 'a', 'b', '.git'),
    path.join(root, 'a', '.git'),
    path.join(root, '.git'),
  ], 'every folder up to the root is checked');

  assert.strictEqual(await hasGitEntryUpwards(start, async (entryPath) => entryPath === path.join(root, 'a', '.git')), true);
  // An entry that cannot be checked counts as existing
  assert.strictEqual(await hasGitEntryUpwards(start, async () => 'error'), true);
}

async function testWithRealGit(): Promise<void> {
  console.log('  Testing the check against real git...');
  const dir = makeTempDir('repository-check-');
  const isOnDisk = async (entryPath: string): Promise<boolean> => fs.existsSync(entryPath);
  const check = async (cwd: string): Promise<string> =>
    classifyRepositoryCheck(await gitExec(['rev-parse', '--is-inside-work-tree'], cwd), process.env, () =>
      hasGitEntryUpwards(cwd, isOnDisk),
    );
  try {
    const repository = path.join(dir, 'repo');
    const sub = path.join(repository, 'sub');
    fs.mkdirSync(sub, { recursive: true });
    git(repository, ['init', '-q']);
    assert.strictEqual(await check(repository), 'repository');
    assert.strictEqual(await check(sub), 'repository', 'a subdirectory of a work tree');

    // A temporary folder may itself be under a repository; only when it is
    // not, the folder outside counts as outside
    const outside = path.join(dir, 'outside');
    fs.mkdirSync(outside);
    const expected = (await hasGitEntryUpwards(outside, isOnDisk)) ? 'repository' : 'outside';
    assert.strictEqual(await check(outside), expected);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function testIsRepositoryGone(): Promise<void> {
  console.log('  Testing isRepositoryGone()...');
  const repository = path.join(path.parse(process.cwd()).root, 'repo');
  const gitEntryPath = path.join(repository, '.git');
  const answers = (folder: boolean | 'error', entry: boolean | 'error') => async (entryPath: string) =>
    entryPath === repository ? folder : entry;
  assert.strictEqual(await isRepositoryGone(repository, answers(true, true)), false);
  // The folder is gone, or it is no longer a repository (its .git is gone)
  assert.strictEqual(await isRepositoryGone(repository, answers(false, 'error')), true);
  assert.strictEqual(await isRepositoryGone(repository, answers(true, false)), true);
  // Either cannot be checked: not gone (the record is kept)
  assert.strictEqual(await isRepositoryGone(repository, answers('error', true)), false);
  assert.strictEqual(await isRepositoryGone(repository, answers(true, 'error')), false);
  const asked: string[] = [];
  await isRepositoryGone(repository, async (entryPath) => {
    asked.push(entryPath);
    return true;
  });
  assert.deepStrictEqual(asked, [repository, gitEntryPath]);
}

export async function runRepositoryCheckTests(): Promise<void> {
  console.log('\n📁 Running Repository Check Tests...\n');
  await testClassify();
  await testHasGitEntryUpwards();
  await testWithRealGit();
  await testIsRepositoryGone();
  console.log('\n✅ All Repository Check Tests Passed!\n');
}
