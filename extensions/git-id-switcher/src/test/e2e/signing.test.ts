/**
 * E2E Tests for Commit Signing
 *
 * Through the real extension: its registered command, the real user and
 * workspace settings, its own workspace state, and real git in the test
 * workspace (made a repository for these tests and put back afterwards).
 *
 * - git-id-switcher.selectIdentity writes the three signing keys of a GPG
 *   identity, and an unsigned identity puts them back (the record the switch
 *   left is found again by the next one)
 * - a signing key set in workspace settings is not used: the one in user
 *   settings is (same id, name and email), and a workspace identity without
 *   a user identity is applied without signing
 * - a value the extension cannot restore, and a signing key that cannot be
 *   checked, stop the switch before anything is written
 * - a submodule's signing keys are written and put back with the workspace's
 * - the identity screens work on the user settings, not the merged ones
 * - what the switch tells the user when a submodule was left undone, that it
 *   stops when it cannot tell whether the folder is a repository, and that a
 *   switch that waited reads its identity again
 * - switching the authentication key in a real ssh-agent keeps the signing key
 * - the form and the status bar: one signing field at a time, key paths,
 *   masked keys, and a Sync Check that could not be made
 *
 * The messages shown to the user are recorded by wrapping vscode.window for
 * the test; failure injection with fake stores (a record that cannot be
 * saved, for one) lives in the unit tests (repositoryConfigWriter.test.ts,
 * signingKeyCheck.test.ts).
 */

import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import * as vscode from 'vscode';
import { getIdentityLabel, getManagedIdentities, invalidateIdentityCache, type Identity } from '../../identity/identity';
import { getUserSafeMessage } from '../../core/errors';
import { runInSwitchQueue } from '../../services/switcher';
import { switchToIdentitySshKey } from '../../ssh/sshAgent';
import { getOtherSigningValue, validateFieldInput } from '../../ui/identityFormValidation';
import { showEditProfileFlow } from '../../ui/identityEditFlow';
import {
  buildMismatchTooltip,
  createStatusBar,
  displayMismatchValue,
  maskSigningKey,
} from '../../ui/identityStatusBar';

const EXTENSION_ID = 'nullvariant.git-id-switcher';
const SECTION = 'gitIdSwitcher';

const GPG_IDENTITY: Identity = { id: 'gpg', name: 'GPG User', email: 'gpg@example.com', gpgKeyId: 'ABCD1234ABCD1234' };
const PLAIN_IDENTITY: Identity = { id: 'plain', name: 'Plain User', email: 'plain@example.com' };

function git(cwd: string, args: string[]): string {
  const output = execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  // Only the line ending git adds is removed
  return output.endsWith('\n') ? output.slice(0, -1) : output;
}

/** `git config --get` exits 1 when the key is not set */
const EXIT_GET_KEY_NOT_SET = 1;

/**
 * Read a key from the repository's --local config (undefined when not set).
 * Only exit 1 means "not set": git failing to run or any other failure
 * throws, so a failed read never passes for a missing value.
 */
function readLocal(repository: string, key: string): string | undefined {
  try {
    return git(repository, ['config', '--local', '--get', key]);
  } catch (error) {
    if ((error as { status?: number }).status === EXIT_GET_KEY_NOT_SET) {
      return undefined;
    }
    throw error;
  }
}

function readSigning(repository: string): Array<string | undefined> {
  return ['gpg.format', 'user.signingkey', 'commit.gpgsign'].map((key) => readLocal(repository, key));
}

type MessageKind = 'showWarningMessage' | 'showErrorMessage';

/**
 * Record the messages of one kind that are shown while `run` runs (they are
 * not shown).
 */
async function recordMessages(kind: MessageKind, run: () => Promise<unknown>): Promise<string[]> {
  const window = vscode.window as unknown as Record<MessageKind, (message: string) => Thenable<undefined>>;
  const original = window[kind];
  const messages: string[] = [];
  window[kind] = (message: string) => {
    messages.push(message);
    return Promise.resolve(undefined);
  };
  try {
    await run();
  } finally {
    window[kind] = original;
  }
  return messages;
}

/** Resolves when the next quick pick is shown */
function nextQuickPickShown(): Promise<void> {
  const window = vscode.window as unknown as { createQuickPick: typeof vscode.window.createQuickPick };
  const original = window.createQuickPick;
  return new Promise((resolve) => {
    window.createQuickPick = <T extends vscode.QuickPickItem>(): vscode.QuickPick<T> => {
      window.createQuickPick = original;
      const quickPick = original<T>();
      const show = quickPick.show.bind(quickPick);
      quickPick.show = (): void => {
        show();
        resolve();
      };
      return quickPick;
    };
  });
}

function configuration(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(SECTION);
}

/** Set the identities of one settings scope (undefined removes the setting) */
async function setIdentities(identities: Identity[] | undefined, target: vscode.ConfigurationTarget): Promise<void> {
  await configuration().update('identities', identities, target);
  invalidateIdentityCache();
}

/**
 * Run git-id-switcher.selectIdentity and accept the item the quick pick
 * shows first (the only identity in these tests).
 *
 * @returns The error the command rejected with (a security error is passed
 *   on by the command after it is shown), or undefined
 */
async function selectWithCommand(): Promise<unknown> {
  const shown = nextQuickPickShown();
  const command = (async (): Promise<unknown> => {
    try {
      await vscode.commands.executeCommand('git-id-switcher.selectIdentity');
      return undefined;
    } catch (error) {
      return error;
    }
  })();
  await shown;
  await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
  return command;
}

/** Switch to the only identity in user settings, through the command */
async function switchTo(identity: Identity): Promise<unknown> {
  await setIdentities([identity], vscode.ConfigurationTarget.Global);
  return selectWithCommand();
}

describe('Commit signing: through the command and the real settings', function () {
  this.timeout(60_000);

  let workspacePath: string;
  /** Set once the suite starts: nothing to put back before that */
  let settingsFile: string | undefined;
  let settingsBefore: string | undefined;
  let isSettingsFolderPresent = false;
  let isRepositoryCreated = false;
  /** The values of each scope before the tests, put back afterwards */
  let identitiesBefore: { global: unknown; workspace: unknown } | undefined;
  let autoSwitchSshKeyBefore: { global: unknown; workspace: unknown } | undefined;

  before(async function () {
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder || !vscode.workspace.isTrusted) {
      // The command does nothing in an untrusted workspace; the suite needs both
      this.skip();
    }
    workspacePath = folder.uri.fsPath;
    settingsFile = path.join(workspacePath, '.vscode', 'settings.json');
    isSettingsFolderPresent = fs.existsSync(path.dirname(settingsFile));
    settingsBefore = fs.existsSync(settingsFile) ? fs.readFileSync(settingsFile, 'utf8') : undefined;
    // The test host keeps one user data folder: what the user settings hold
    // there before these tests is put back afterwards
    const identities = configuration().inspect('identities');
    identitiesBefore = { global: identities?.globalValue, workspace: identities?.workspaceValue };
    const autoSwitchSshKey = configuration().inspect('autoSwitchSshKey');
    autoSwitchSshKeyBefore = { global: autoSwitchSshKey?.globalValue, workspace: autoSwitchSshKey?.workspaceValue };
    if (fs.existsSync(path.join(workspacePath, '.git'))) {
      throw new Error('The test workspace is already a repository; these tests would change it');
    }
    git(workspacePath, ['init', '-q']);
    isRepositoryCreated = true;
    await vscode.extensions.getExtension(EXTENSION_ID)?.activate();
    // The authentication key is not part of these tests: ssh-agent is left
    // alone (a workspace value would win over the user value)
    await configuration().update('autoSwitchSshKey', false, vscode.ConfigurationTarget.Global);
    await configuration().update('autoSwitchSshKey', false, vscode.ConfigurationTarget.Workspace);
  });

  beforeEach(() => {
    git(workspacePath, ['config', '--local', 'user.name', 'Before']);
    git(workspacePath, ['config', '--local', 'user.email', 'before@example.com']);
  });

  after(async () => {
    if (identitiesBefore !== undefined) {
      await configuration().update('identities', identitiesBefore.workspace, vscode.ConfigurationTarget.Workspace);
      await configuration().update('identities', identitiesBefore.global, vscode.ConfigurationTarget.Global);
      invalidateIdentityCache();
    }
    if (autoSwitchSshKeyBefore !== undefined) {
      await configuration().update('autoSwitchSshKey', autoSwitchSshKeyBefore.workspace, vscode.ConfigurationTarget.Workspace);
      await configuration().update('autoSwitchSshKey', autoSwitchSshKeyBefore.global, vscode.ConfigurationTarget.Global);
    }
    if (isRepositoryCreated) {
      fs.rmSync(path.join(workspacePath, '.git'), { recursive: true, force: true });
    }
    // The workspace settings file as it was: its text, or no file (and no
    // folder) when there was none
    if (settingsFile === undefined) {
      return;
    }
    if (settingsBefore === undefined) {
      fs.rmSync(settingsFile, { force: true });
      if (!isSettingsFolderPresent) {
        fs.rmSync(path.dirname(settingsFile), { recursive: true, force: true });
      }
    } else {
      fs.writeFileSync(settingsFile, settingsBefore);
    }
  });

  it('writes the signing keys of a GPG identity, and an unsigned identity puts them back', async () => {
    await switchTo(GPG_IDENTITY);
    assert.deepStrictEqual(readSigning(workspacePath), ['openpgp', GPG_IDENTITY.gpgKeyId, 'true']);
    assert.strictEqual(readLocal(workspacePath, 'user.name'), 'GPG User');

    // The record the first switch left in the workspace state is found again
    await switchTo(PLAIN_IDENTITY);
    assert.deepStrictEqual(readSigning(workspacePath), [undefined, undefined, undefined]);
    assert.strictEqual(readLocal(workspacePath, 'user.name'), 'Plain User');
  });

  it('applies the current identity again when its values were changed by hand', async () => {
    await switchTo(GPG_IDENTITY);
    git(workspacePath, ['config', '--local', 'commit.gpgsign', 'false']);
    git(workspacePath, ['config', '--local', 'user.name', 'By Hand']);
    await switchTo(GPG_IDENTITY);
    assert.deepStrictEqual(readSigning(workspacePath), ['openpgp', GPG_IDENTITY.gpgKeyId, 'true']);
    assert.strictEqual(readLocal(workspacePath, 'user.name'), 'GPG User');
    // The values set by hand are the ones put back
    await switchTo(PLAIN_IDENTITY);
    assert.deepStrictEqual(readSigning(workspacePath), ['openpgp', GPG_IDENTITY.gpgKeyId, 'false']);
    for (const key of ['gpg.format', 'user.signingkey', 'commit.gpgsign']) {
      git(workspacePath, ['config', '--local', '--unset', key]);
    }
  });

  it('applies the current identity again when its signing key changed since it was applied', async () => {
    await switchTo(GPG_IDENTITY);
    assert.deepStrictEqual(readSigning(workspacePath), ['openpgp', GPG_IDENTITY.gpgKeyId, 'true']);
    // Same ID, another signing key: the new key is written
    const changed: Identity = { ...GPG_IDENTITY, gpgKeyId: 'FFFF0000FFFF0000' };
    await switchTo(changed);
    assert.deepStrictEqual(readSigning(workspacePath), ['openpgp', changed.gpgKeyId, 'true']);
    await switchTo(PLAIN_IDENTITY);
    assert.deepStrictEqual(readSigning(workspacePath), [undefined, undefined, undefined]);
  });

  it('takes the signing key from user settings, never from workspace settings', async () => {
    await setIdentities([GPG_IDENTITY], vscode.ConfigurationTarget.Global);
    // The workspace's identities replace the user's in the merged value
    await setIdentities([{ ...GPG_IDENTITY, gpgKeyId: 'EEEEFFFF00001111' }], vscode.ConfigurationTarget.Workspace);
    await selectWithCommand();
    assert.deepStrictEqual(readSigning(workspacePath), ['openpgp', GPG_IDENTITY.gpgKeyId, 'true']);

    // An identity only in workspace settings signs with nothing
    await setIdentities([PLAIN_IDENTITY], vscode.ConfigurationTarget.Global);
    await setIdentities([{ ...PLAIN_IDENTITY, id: 'repo', gpgKeyId: 'EEEEFFFF00001111' }], vscode.ConfigurationTarget.Workspace);
    await selectWithCommand();
    assert.deepStrictEqual(readSigning(workspacePath), [undefined, undefined, undefined]);
    assert.strictEqual(readLocal(workspacePath, 'user.name'), 'Plain User');
    await setIdentities(undefined, vscode.ConfigurationTarget.Workspace);
  });

  it('stops before writing anything when a value cannot be restored', async () => {
    await switchTo(PLAIN_IDENTITY);
    git(workspacePath, ['config', '--local', 'user.name', 'Before']);
    git(workspacePath, ['config', '--local', 'gpg.format', 'x509']);
    // Shown to the user, not passed on (not a security error)
    let result: unknown;
    const errors = await recordMessages('showErrorMessage', async () => {
      result = await switchTo(GPG_IDENTITY);
    });
    assert.strictEqual(result, undefined);
    assert.deepStrictEqual(errors, [
      "Git ID Switcher: Failed to select identity: The repository's Git config has a value for gpg.format that Git ID Switcher cannot restore. Remove it from the repository's config and try again.",
    ]);
    assert.deepStrictEqual(readSigning(workspacePath), ['x509', undefined, undefined]);
    assert.strictEqual(readLocal(workspacePath, 'user.name'), 'Before');
    git(workspacePath, ['config', '--local', '--unset', 'gpg.format']);
  });

  it('stops before writing anything when the signing key cannot be checked', async () => {
    await switchTo(PLAIN_IDENTITY);
    git(workspacePath, ['config', '--local', 'user.name', 'Before']);
    const keyDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'git-id-switcher-signing-e2e-'));
    try {
      const keyPath = path.join(keyDirectory, 'id_sign');
      // A broken key: ssh-keygen cannot read it, and it is no public key either
      fs.writeFileSync(keyPath, '-----BEGIN OPENSSH PRIVATE KEY-----\nAAAA\n-----END OPENSSH PRIVATE KEY-----\n', { mode: 0o600 });
      const error = await switchTo({ id: 'ssh', name: 'SSH User', email: 'ssh@example.com', sshSigningKeyPath: keyPath });
      assert.strictEqual(
        getUserSafeMessage(error),
        'The public key of the SSH signing key could not be read without a passphrase, so Git config was not changed. Set sshSigningKeyPath to its public key file (.pub) and add the key to ssh-agent.',
      );
      assert.deepStrictEqual(readSigning(workspacePath), [undefined, undefined, undefined]);
      assert.strictEqual(readLocal(workspacePath, 'user.name'), 'Before');
    } finally {
      fs.rmSync(keyDirectory, { recursive: true, force: true });
    }
  });

  /**
   * Add a submodule to the workspace repository for `run`, then remove it
   * (its folder, its entry and its repository under .git/modules).
   */
  async function withSubmodule(run: (submodulePath: string) => Promise<void>): Promise<void> {
    const name = 'git-id-switcher-e2e-submodule';
    const submodulePath = path.join(workspacePath, name);
    const sourceDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'git-id-switcher-submodule-source-'));
    if (fs.existsSync(submodulePath) || fs.existsSync(path.join(workspacePath, '.gitmodules'))) {
      throw new Error('The test workspace already has the submodule folder or .gitmodules');
    }
    try {
      git(sourceDirectory, ['init', '-q']);
      git(sourceDirectory, ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.com', '-c', 'commit.gpgsign=false', 'commit', '-q', '--allow-empty', '-m', 'init']);
      git(workspacePath, ['-c', 'protocol.file.allow=always', 'submodule', 'add', '-q', sourceDirectory, name]);
      await run(submodulePath);
    } finally {
      git(workspacePath, ['rm', '-q', '-f', name]);
      fs.rmSync(path.join(workspacePath, '.gitmodules'), { force: true });
      git(workspacePath, ['rm', '-q', '--cached', '--ignore-unmatch', '.gitmodules']);
      fs.rmSync(path.join(workspacePath, '.git', 'modules', name), { recursive: true, force: true });
      fs.rmSync(sourceDirectory, { recursive: true, force: true });
    }
  }

  it('writes and puts back the signing keys of a submodule with those of the workspace', async () => {
    await switchTo(PLAIN_IDENTITY);
    await withSubmodule(async (submodulePath) => {
      await switchTo(GPG_IDENTITY);
      assert.deepStrictEqual(readSigning(submodulePath), ['openpgp', GPG_IDENTITY.gpgKeyId, 'true']);
      assert.strictEqual(readLocal(submodulePath, 'user.name'), 'GPG User');
      await switchTo(PLAIN_IDENTITY);
      assert.deepStrictEqual(readSigning(submodulePath), [undefined, undefined, undefined]);
      assert.deepStrictEqual(readSigning(workspacePath), [undefined, undefined, undefined]);
      assert.strictEqual(readLocal(submodulePath, 'user.name'), 'Plain User');
    });
  });

  describe('what the switch tells the user', () => {
    // The values the switch wrote are put back through the extension's own record
    afterEach(async () => {
      await switchTo(PLAIN_IDENTITY);
    });

    it('tells the user when a submodule could not be written', async () => {
      await withSubmodule(async (submodulePath) => {
        git(submodulePath, ['config', '--local', 'gpg.format', 'x509']);
        const warnings = await recordMessages('showWarningMessage', () => switchTo(GPG_IDENTITY));
        assert.deepStrictEqual(readSigning(workspacePath), ['openpgp', GPG_IDENTITY.gpgKeyId, 'true']);
        assert.deepStrictEqual(readSigning(submodulePath), ['x509', undefined, undefined]);
        assert.deepStrictEqual(warnings, [
          `Switched to ${getIdentityLabel(GPG_IDENTITY)}, but Git config could not be fully updated in 1 submodule(s); some may keep a mix of the previous and new values.`,
        ]);
      });
    });

    it('tells the user when the submodules could not all be listed', async () => {
      // A submodule in the index without an entry in .gitmodules: git submodule status fails
      git(workspacePath, ['update-index', '--add', '--cacheinfo', '160000,0123456789abcdef0123456789abcdef01234567,orphan-submodule']);
      try {
        const warnings = await recordMessages('showWarningMessage', () => switchTo(GPG_IDENTITY));
        assert.deepStrictEqual(readSigning(workspacePath), ['openpgp', GPG_IDENTITY.gpgKeyId, 'true']);
        assert.deepStrictEqual(warnings, [
          `Switched to ${getIdentityLabel(GPG_IDENTITY)}, but the submodules could not all be listed; some may keep the previous Git config.`,
        ]);
      } finally {
        git(workspacePath, ['update-index', '--force-remove', 'orphan-submodule']);
      }
    });

    it('stops when it cannot tell whether the folder is in a repository', async () => {
      const configPath = path.join(workspacePath, '.git', 'config');
      const configBefore = fs.readFileSync(configPath, 'utf8');
      // git exits 128 on a broken config, and the folder has a .git: not known
      fs.writeFileSync(configPath, `${configBefore}[broken\n`);
      let errors: string[];
      try {
        errors = await recordMessages('showErrorMessage', () => switchTo(GPG_IDENTITY));
      } finally {
        fs.writeFileSync(configPath, configBefore);
      }
      assert.deepStrictEqual(errors, [
        'Git ID Switcher: Failed to select identity: Could not tell whether the workspace folder is in a Git repository; nothing was changed.',
      ]);
      assert.deepStrictEqual(readSigning(workspacePath), [undefined, undefined, undefined]);
      assert.strictEqual(readLocal(workspacePath, 'user.name'), 'Before');
    });

    it('reads the identity again when a switch that waited gets its turn', async () => {
      await setIdentities([GPG_IDENTITY], vscode.ConfigurationTarget.Global);
      let release: () => void = () => undefined;
      // eslint-disable-next-line unicorn/prefer-promise-with-resolvers -- the Node.js of VS Code 1.85 (engines.vscode) has no Promise.withResolvers
      const held = runInSwitchQueue(() => new Promise<void>((resolve) => {
        release = resolve;
      }));
      // The identity is picked while the queue is held; then its signing key is
      // removed from the user settings before the switch gets its turn
      const shown = nextQuickPickShown();
      const command = Promise.resolve(vscode.commands.executeCommand('git-id-switcher.selectIdentity'));
      await shown;
      await setIdentities([{ id: GPG_IDENTITY.id, name: GPG_IDENTITY.name, email: GPG_IDENTITY.email }], vscode.ConfigurationTarget.Global);
      await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
      release();
      await held;
      await command;
      assert.deepStrictEqual(readSigning(workspacePath), [undefined, undefined, undefined]);
      assert.strictEqual(readLocal(workspacePath, 'user.name'), 'GPG User');
    });
  });

  it('keeps the signing key in ssh-agent when the authentication key is switched', async function () {
    // ssh-agent on a socket of its own (Windows uses a named pipe, not started here)
    if (process.platform === 'win32') {
      this.skip();
    }
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-id-switcher-agent-e2e-'));
    const dir = fs.realpathSync.native(tempDir);
    const socket = path.join(dir, 'agent.sock');
    const agent = spawn('ssh-agent', ['-D', '-a', socket], { stdio: 'ignore' });
    const savedSocket = process.env.SSH_AUTH_SOCK;
    try {
      for (let attempt = 0; attempt < 50 && !fs.existsSync(socket); attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      assert.ok(fs.existsSync(socket), 'ssh-agent started');
      const keyA = path.join(dir, 'id_a');
      const keyB = path.join(dir, 'id_b');
      for (const [keyPath, comment] of [[keyA, 'key-a'], [keyB, 'key-b']]) {
        execFileSync('ssh-keygen', ['-q', '-t', 'ed25519', '-N', '', '-C', comment, '-f', keyPath], { stdio: 'ignore' });
      }
      const env = { ...process.env, SSH_AUTH_SOCK: socket };
      const loadedKeys = (): string[] =>
        execFileSync('ssh-add', ['-l'], { env, encoding: 'utf8' }).split('\n').filter(Boolean).map((line) => line.split(' ', 3)[2]);
      execFileSync('ssh-add', [keyA], { env, stdio: 'ignore' });
      process.env.SSH_AUTH_SOCK = socket;

      // Identity B authenticates with key B and signs with key A, which is identity A's authentication key
      const identityA: Identity = { id: 'a', name: 'A', email: 'a@example.com', sshKeyPath: keyA };
      const identityB: Identity = { id: 'b', name: 'B', email: 'b@example.com', sshKeyPath: keyB, sshSigningKeyPath: `${keyA}.pub` };
      await setIdentities([identityA, identityB], vscode.ConfigurationTarget.Global);
      await switchToIdentitySshKey(identityB);
      assert.deepStrictEqual(loadedKeys(), ['key-a', 'key-b'], 'the signing key stays');
      // An identity that signs with nothing: the other identities' keys are removed, as before
      await switchToIdentitySshKey(identityA);
      assert.deepStrictEqual(loadedKeys(), ['key-a']);
    } finally {
      process.env.SSH_AUTH_SOCK = savedSocket;
      agent.kill();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('manages the identities in user settings, not the merged ones', async () => {
    await setIdentities([PLAIN_IDENTITY], vscode.ConfigurationTarget.Global);
    const workspaceOnly: Identity = { id: 'repo', name: 'Repo', email: 'repo@example.com' };
    const sameIdOtherName: Identity = { ...PLAIN_IDENTITY, name: 'Workspace Name' };
    await setIdentities([workspaceOnly, sameIdOtherName], vscode.ConfigurationTarget.Workspace);
    try {
      assert.deepStrictEqual(getManagedIdentities(), [PLAIN_IDENTITY]);
      // An identity defined only in workspace settings is not edited here
      assert.strictEqual(await showEditProfileFlow(workspaceOnly), false);
    } finally {
      await setIdentities(undefined, vscode.ConfigurationTarget.Workspace);
    }
  });
});

describe('Commit signing: identity form', () => {
  it('returns the other signing field only for a signing field', () => {
    const values = { gpgKeyId: 'ABCD1234', sshSigningKeyPath: '~/.ssh/k', name: 'N' };
    assert.strictEqual(getOtherSigningValue(values, 'gpgKeyId'), '~/.ssh/k');
    assert.strictEqual(getOtherSigningValue(values, 'sshSigningKeyPath'), 'ABCD1234');
    assert.strictEqual(getOtherSigningValue(values, 'name'), undefined);
    assert.strictEqual(getOtherSigningValue({}, 'gpgKeyId'), undefined);
    // A value of only spaces is not set
    assert.strictEqual(getOtherSigningValue({ sshSigningKeyPath: ' '.repeat(3) }, 'gpgKeyId'), undefined);
  });

  it('rejects a signing field when the other one is set', () => {
    const bothSet = 'GPG key ID and SSH signing key path cannot both be set. Clear the other one first.';
    assert.strictEqual(validateFieldInput(vscode, 'gpgKeyId', 'ABCD1234', true, 'a', '~/.ssh/k'), bothSet);
    assert.strictEqual(validateFieldInput(vscode, 'sshSigningKeyPath', '~/.ssh/k', true, 'a', 'ABCD1234'), bothSet);
    // The other value is only spaces, or this value is cleared: allowed
    assert.strictEqual(validateFieldInput(vscode, 'gpgKeyId', 'ABCD1234', true, 'a', '  '), null);
    assert.strictEqual(validateFieldInput(vscode, 'gpgKeyId', '', true, 'a', '~/.ssh/k'), null);
    // Other fields ignore the other signing value
    assert.strictEqual(validateFieldInput(vscode, 'sshHost', 'github-work', true, 'a', 'ABCD1234'), null);
  });

  it('accepts key paths that are absolute, ~/ or a Windows drive, and nothing else', () => {
    for (const field of ['sshKeyPath', 'sshSigningKeyPath'] as const) {
      for (const accepted of ['/keys/id_sign', '~/.ssh/id_sign', String.raw`C:\Users\me\.ssh\id_sign`, 'D:/keys/id_sign']) {
        assert.strictEqual(validateFieldInput(vscode, field, accepted, true, 'a'), null, `${field}: ${accepted}`);
      }
      for (const rejected of ['keys/id_sign', '~other/.ssh/id_sign', 'C:id_sign']) {
        assert.ok(validateFieldInput(vscode, field, rejected, true, 'a'), `${field}: ${rejected}`);
      }
    }
  });
});

describe('Commit signing: status bar', () => {
  it('masks signing keys: a path shows only the file name, a GPG key ID its last 8 characters', () => {
    assert.strictEqual(maskSigningKey('/home/u/.ssh/id_sign'), 'id_sign');
    assert.strictEqual(maskSigningKey('0123456789ABCDEF'), '89ABCDEF');
  });

  it('masks user.signingkey in mismatches only', () => {
    const signingKey = { field: 'user.signingkey' as const, expected: '/home/u/.ssh/a', actual: '/home/u/.ssh/b' };
    assert.strictEqual(displayMismatchValue(signingKey, signingKey.expected), 'a');
    assert.strictEqual(displayMismatchValue(signingKey, ''), '', 'a value that is not set stays empty');
    const format = { field: 'gpg.format' as const, expected: 'ssh', actual: 'openpgp' };
    assert.strictEqual(displayMismatchValue(format, 'openpgp'), 'openpgp');

    const tooltip = buildMismatchTooltip([signingKey, format]);
    assert.ok(tooltip.includes('| user.signingkey | a | b |'), tooltip);
    assert.ok(tooltip.includes('| gpg.format | ssh | openpgp |'), tooltip);
    assert.ok(!tooltip.includes('/home/u/.ssh'), 'no full path in the tooltip');
  });

  function tooltipOf(statusBar: ReturnType<typeof createStatusBar>): string {
    const item = (statusBar as unknown as { statusBarItem: vscode.StatusBarItem }).statusBarItem;
    return item.tooltip instanceof vscode.MarkdownString ? item.tooltip.value : String(item.tooltip);
  }

  it('shows the authentication key and the signing key apart in the tooltip, without full paths', () => {
    const statusBar = createStatusBar();
    try {
      statusBar.setIdentity({
        id: 'ssh',
        name: 'SSH User',
        email: 'ssh@example.com',
        sshKeyPath: '/home/u/.ssh/id_auth',
        sshSigningKeyPath: '/home/u/.ssh/id_sign.pub',
      });
      const tooltip = tooltipOf(statusBar);
      assert.ok(tooltip.includes('**SSH Authentication Key:** id\\_auth'), tooltip);
      assert.ok(tooltip.includes('**SSH Signing Key:** id\\_sign.pub'), tooltip);
      assert.ok(!tooltip.includes('/home/u/.ssh'), 'no full path in the tooltip');
    } finally {
      statusBar.dispose();
    }
  });

  it('says so when Sync Check could not be made, instead of keeping an earlier result', () => {
    const statusBar = createStatusBar();
    const unknownLine = 'Could not check whether the Git config matches this profile.';
    try {
      statusBar.setIdentity(PLAIN_IDENTITY);
      statusBar.setSyncState({ state: 'out_of_sync', mismatches: [{ field: 'user.name', expected: 'a', actual: 'b' }] });
      statusBar.setSyncState({ state: 'unknown', mismatches: [] });
      assert.ok(tooltipOf(statusBar).includes(unknownLine), 'unknown is shown');
      assert.ok(!tooltipOf(statusBar).includes('| user.name |'), 'the earlier mismatch is not shown');
      statusBar.setSyncState({ state: 'synced', mismatches: [] });
      assert.ok(!tooltipOf(statusBar).includes(unknownLine), 'synced does not say unknown');
    } finally {
      statusBar.dispose();
    }
  });
});
