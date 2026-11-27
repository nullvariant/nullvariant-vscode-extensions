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
import { classifyRepositoryCheck, findSubmoduleRepository, hasGitEntryUpwards, isRepositoryGone } from '../core/repositoryCheck';
import { gitExec, type GitExecResult } from '../security/secureExec';
import { git, initRepository, makeTempDir } from './helpers/signingFixtures';

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
  const kept = path.join(path.parse(process.cwd()).root, 'parent', '.git', 'modules', 'repo');
  const answers = (folder: boolean | 'error', entry: boolean | 'error', keptEntry: boolean | 'error' = false) =>
    async (entryPath: string) => {
      if (entryPath === repository) {
        return folder;
      }
      return entryPath === gitEntryPath ? entry : keptEntry;
    };
  const noKept = async (): Promise<undefined> => undefined;
  const keptAt = async (): Promise<string> => kept;
  assert.strictEqual(await isRepositoryGone(repository, answers(true, true), noKept), false);
  // The folder is gone, or it is no longer a repository (its .git is gone, and no repository is kept for it)
  assert.strictEqual(await isRepositoryGone(repository, answers(false, 'error'), noKept), true);
  assert.strictEqual(await isRepositoryGone(repository, answers(true, false), noKept), true);
  assert.strictEqual(await isRepositoryGone(repository, answers(true, false, false), keptAt), true);
  // A deinitialized submodule: its repository is kept (or cannot be checked), so it is not gone
  assert.strictEqual(await isRepositoryGone(repository, answers(true, false, true), keptAt), false);
  assert.strictEqual(await isRepositoryGone(repository, answers(true, false, 'error'), keptAt), false);
  // Either cannot be checked: not gone (the record is kept)
  assert.strictEqual(await isRepositoryGone(repository, answers('error', true), noKept), false);
  assert.strictEqual(await isRepositoryGone(repository, answers(true, 'error'), noKept), false);
  const asked: string[] = [];
  await isRepositoryGone(repository, async (entryPath) => {
    asked.push(entryPath);
    return true;
  }, async () => assert.fail('the kept repository is looked for only when .git is gone'));
  assert.deepStrictEqual(asked, [repository, gitEntryPath]);

  // findSubmoduleRepository(): git answers for the folder (fake git)
  const root = path.parse(process.cwd()).root;
  const folder = path.join(root, 'parent', 'libs', 'sub');
  const gitAnswering = (topLevel: GitExecResult, gitDirectory: GitExecResult) =>
    async (args: string[]): Promise<GitExecResult> => (args[1] === '--show-toplevel' ? topLevel : gitDirectory);
  const ok = (stdout: string): GitExecResult => ({ success: true, stdout });
  const parentGitDirectory = ok(path.join(root, 'parent', '.git'));
  const parentTopLevel = ok(path.join(root, 'parent'));
  const notRepository = failed(128);
  assert.strictEqual(
    await findSubmoduleRepository(folder, gitAnswering(parentTopLevel, parentGitDirectory)),
    path.join(root, 'parent', '.git', 'modules', 'libs', 'sub'),
  );
  // Not in a repository, or git fails for either question
  for (const [topLevel, gitDirectory] of [[notRepository, notRepository], [parentTopLevel, notRepository], [notRepository, parentGitDirectory]]) {
    assert.strictEqual(await findSubmoduleRepository(folder, gitAnswering(topLevel, gitDirectory)), undefined);
  }
  // The folder is the top level itself, or not under it
  for (const topLevel of [ok(folder), ok(path.join(root, 'elsewhere'))]) {
    const answer = gitAnswering(topLevel, parentGitDirectory);
    assert.strictEqual(await findSubmoduleRepository(folder, answer), undefined, JSON.stringify(topLevel));
  }
}

/**
 * A deinitialized submodule, with real git: its work tree is removed but git
 * keeps its repository (and its config) under the parent's .git/modules, so
 * its record is kept until that is gone too.
 */
async function testDeinitializedSubmodule(): Promise<void> {
  console.log('  Testing isRepositoryGone() for a deinitialized submodule (real git)...');
  const dir = makeTempDir('repository-check-deinit-');
  const isOnDisk = async (entryPath: string): Promise<boolean> => fs.existsSync(entryPath);
  const findKept = (folder: string): Promise<string | undefined> => findSubmoduleRepository(folder, gitExec);
  try {
    const source = path.join(dir, 'source');
    const parent = path.join(dir, 'parent');
    fs.mkdirSync(source);
    fs.mkdirSync(parent);
    initRepository(source);
    initRepository(parent);
    git(parent, ['-c', 'protocol.file.allow=always', 'submodule', 'add', '-q', source, path.join('libs', 'sub')]);
    const submodule = path.join(parent, 'libs', 'sub');
    const kept = path.join(parent, '.git', 'modules', 'libs', 'sub');
    assert.strictEqual(await isRepositoryGone(submodule, isOnDisk, findKept), false);

    git(parent, ['submodule', 'deinit', '-q', '-f', path.join('libs', 'sub')]);
    assert.ok(fs.existsSync(submodule) && !fs.existsSync(path.join(submodule, '.git')), 'the work tree is removed, the folder stays');
    assert.strictEqual(await findKept(submodule), kept);
    assert.strictEqual(await isRepositoryGone(submodule, isOnDisk, findKept), false, 'its repository is kept');

    fs.rmSync(kept, { recursive: true, force: true });
    assert.strictEqual(await isRepositoryGone(submodule, isOnDisk, findKept), true, 'its repository is gone too');
    // The work tree root of the parent itself is no submodule of it
    assert.strictEqual(await findKept(parent), undefined);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export async function runRepositoryCheckTests(): Promise<void> {
  console.log('\n📁 Running Repository Check Tests...\n');
  await testClassify();
  await testHasGitEntryUpwards();
  await testWithRealGit();
  await testIsRepositoryGone();
  await testDeinitializedSubmodule();
  console.log('\n✅ All Repository Check Tests Passed!\n');
}
