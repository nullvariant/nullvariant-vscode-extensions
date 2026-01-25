/**
 * Identity Detection Services
 *
 * Handles identity detection from various sources:
 * - Saved workspace state
 * - Git configuration
 * - SSH agent
 *
 * @module services/detection
 */

import * as vscode from 'vscode';
import { Identity, getIdentityById } from '../identity/identity';
import { detectCurrentIdentity, isGitRepository } from '../core/gitConfig';
import { detectCurrentIdentityFromSsh } from '../sshAgent';
import { IdentityStatusBar } from '../statusBar';

/**
 * Result type for identity detection operations
 */
export type DetectionResult = { found: true; identity: Identity } | { found: false };

/**
 * Try to restore saved identity from workspace state.
 * @internal
 */
export function tryRestoreSavedIdentity(context: vscode.ExtensionContext): DetectionResult {
  const savedIdentityId = context.workspaceState.get<string>('currentIdentityId');
  if (!savedIdentityId) {
    return { found: false };
  }
  const savedIdentity = getIdentityById(savedIdentityId);
  if (savedIdentity) {
    return { found: true, identity: savedIdentity };
  }
  return { found: false };
}

/**
 * Try to detect identity from Git config.
 * @internal
 */
export async function tryDetectFromGit(token: vscode.CancellationToken): Promise<DetectionResult | 'cancelled'> {
  if (!await isGitRepository(token)) {
    return { found: false };
  }

  if (token.isCancellationRequested) {
    console.debug('[Git ID Switcher] Initialization cancelled after isGitRepository');
    return 'cancelled';
  }

  const detectedIdentity = await detectCurrentIdentity(token);

  if (token.isCancellationRequested) {
    console.debug('[Git ID Switcher] Initialization cancelled after detectCurrentIdentity');
    return 'cancelled';
  }

  if (detectedIdentity) {
    return { found: true, identity: detectedIdentity };
  }
  return { found: false };
}

/**
 * Try to detect identity from SSH agent.
 * @internal
 */
export async function tryDetectFromSsh(token: vscode.CancellationToken): Promise<DetectionResult | 'cancelled'> {
  const sshIdentity = await detectCurrentIdentityFromSsh(token);

  if (token.isCancellationRequested) {
    console.debug('[Git ID Switcher] Initialization cancelled after detectCurrentIdentityFromSsh');
    return 'cancelled';
  }

  if (sshIdentity) {
    return { found: true, identity: sshIdentity };
  }
  return { found: false };
}

/**
 * Apply detected identity to state and status bar.
 * @internal
 */
export async function applyDetectedIdentity(
  identity: Identity,
  context: vscode.ExtensionContext,
  saveToWorkspace: boolean,
  statusBar: IdentityStatusBar,
  setCurrentIdentity: (identity: Identity) => void
): Promise<void> {
  setCurrentIdentity(identity);
  statusBar.setIdentity(identity);
  if (saveToWorkspace) {
    await context.workspaceState.update('currentIdentityId', identity.id);
  }
}
