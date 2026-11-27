/**
 * Repository Check
 *
 * Tells three answers apart for the workspace folder: inside a Git work tree,
 * outside any repository, or not known (git timed out, could not start, or
 * refused for another reason). A switch writes git config only in the first
 * case, goes on without it in the second, and stops in the third: a check
 * that failed is never taken as "not a repository".
 *
 * `git rev-parse --is-inside-work-tree` prints `true` or `false` when it
 * succeeds. It exits 128 both outside a repository and for other fatal
 * errors (a repository owned by another user, a broken config file), and its
 * message depends on the user's language. So exit 128 counts as "outside"
 * only when git could not have found a repository: no `.git` entry exists in
 * the folder or above it, and no environment variable points git elsewhere.
 *
 * @see https://git-scm.com/docs/git-rev-parse
 * @see https://git-scm.com/docs/git#_environment_variables
 */

import * as path from 'node:path';
import type { GitExecResult } from '../security/secureExec';

export type RepositoryCheck = 'repository' | 'outside' | 'error';

/** git exits 128 on a fatal error, which includes "not a git repository" */
const EXIT_FATAL = 128;

/**
 * What a successful call prints: 'false' means inside the .git directory (or
 * a bare repository), not in a work tree.
 */
const SUCCESS_ANSWERS: ReadonlyMap<string, RepositoryCheck> = new Map([
  ['true', 'repository'],
  ['false', 'outside'],
]);

/** Environment variables that make git use a repository other than the one it finds */
const REPOSITORY_ENVIRONMENT_VARIABLES = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR'] as const;

/**
 * Whether a `.git` entry (directory, or file of a worktree or submodule)
 * exists in `startPath` or a folder above it. An entry that cannot be
 * checked counts as existing (the answer is then "not known").
 *
 * @param exists - Whether a path exists: true, false, or 'error'
 */
export async function hasGitEntryUpwards(
  startPath: string,
  exists: (entryPath: string) => Promise<boolean | 'error'>,
): Promise<boolean> {
  let folder = path.resolve(startPath);
  while ((await exists(path.join(folder, '.git'))) === false) {
    const parent = path.dirname(folder);
    if (parent === folder) {
      return false;
    }
    folder = parent;
  }
  return true;
}

/**
 * Classify the result of `git rev-parse --is-inside-work-tree`.
 *
 * @param result - The git result
 * @param environment - The environment git runs with (a variable that is set,
 *   even to an empty value, makes exit 128 not known)
 * @param hasGitEntry - Asked only when git exited 128
 */
export async function classifyRepositoryCheck(
  result: GitExecResult,
  environment: Readonly<Record<string, string | undefined>>,
  hasGitEntry: () => Promise<boolean>,
): Promise<RepositoryCheck> {
  if (result.success) {
    return SUCCESS_ANSWERS.get(result.stdout) ?? 'error';
  }
  const isRepositorySetInEnvironment = REPOSITORY_ENVIRONMENT_VARIABLES.some(
    (name) => environment[name] !== undefined,
  );
  const isOutside = result.exitCode === EXIT_FATAL && !isRepositorySetInEnvironment && !(await hasGitEntry());
  return isOutside ? 'outside' : 'error';
}

/**
 * Where git keeps the repository of a submodule whose work tree is removed
 * (`git submodule deinit`): `modules/<path>` in the git directory of the
 * repository whose work tree holds the folder. Undefined when the folder is
 * not inside another repository's work tree, or git cannot tell.
 *
 * A submodule whose name is not its path (added with `--name`, or moved
 * since) is kept under its name, and is not found here.
 *
 * @param runGit - Runs git in a folder (gitExec)
 */
export async function findSubmoduleRepository(
  folder: string,
  runGit: (args: string[], cwd: string) => Promise<GitExecResult>,
): Promise<string | undefined> {
  const [topLevel, gitDirectory] = await Promise.all([
    runGit(['rev-parse', '--show-toplevel'], folder),
    runGit(['rev-parse', '--git-dir'], folder),
  ]);
  if (!topLevel.success || !gitDirectory.success) {
    return undefined;
  }
  const submodulePath = path.relative(topLevel.stdout, folder);
  const isInside = submodulePath !== '' && !submodulePath.startsWith('..');
  return isInside ? path.resolve(folder, gitDirectory.stdout, 'modules', submodulePath) : undefined;
}

/**
 * Whether the repository a record belongs to (a workspace root or a
 * submodule) is gone: its folder does not exist, or its `.git` entry does
 * not and neither does the repository git keeps for a deinitialized
 * submodule (which a later `git submodule init` uses again, with its config).
 * When that cannot be told (a folder that cannot be read), it is not gone.
 *
 * @param exists - Whether a path exists: true, false, or 'error'
 * @param findKeptRepository - See findSubmoduleRepository
 */
export async function isRepositoryGone(
  repositoryPath: string,
  exists: (entryPath: string) => Promise<boolean | 'error'>,
  findKeptRepository: (folder: string) => Promise<string | undefined>,
): Promise<boolean> {
  const folder = await exists(repositoryPath);
  if (folder !== true) {
    return folder === false;
  }
  if ((await exists(path.join(repositoryPath, '.git'))) !== false) {
    return false;
  }
  const keptRepository = await findKeptRepository(repositoryPath);
  return keptRepository === undefined || (await exists(keptRepository)) === false;
}
