/**
 * Status Bar Management
 *
 * Displays the current identity in VS Code's status bar.
 * Clicking opens the identity selection quick pick.
 * Shows visual warning when profile is out of sync with git config.
 */

import * as path from 'node:path';
import * as vscode from 'vscode';
import { Identity, getIdentityLabel } from '../identity/identity';
import type { SyncCheckResult, SyncMismatch } from '../core/syncChecker';
import { truncateForStatusBar } from './displayLimits';

/**
 * Status bar item wrapper
 */
export class IdentityStatusBar implements vscode.Disposable {
  private readonly statusBarItem: vscode.StatusBarItem;
  private currentIdentity: Identity | undefined;
  private currentSyncState: SyncCheckResult | undefined;

  constructor() {
    // Create status bar item on the right side with high priority
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );

    // Set command to trigger when clicked
    this.statusBarItem.command = 'git-id-switcher.selectIdentity';

    // Set initial state
    this.setNoIdentity();

    // Show the status bar item
    this.statusBarItem.show();
  }

  /**
   * Update status bar with current identity
   * Shows emoji icon only if configured
   */
  setIdentity(identity: Identity): void {
    this.currentIdentity = identity;
    this.currentSyncState = undefined;
    this.statusBarItem.text = truncateForStatusBar(this.buildDisplayText(identity));
    this.statusBarItem.tooltip = new vscode.MarkdownString(
      this.buildTooltip(identity)
    );
    this.statusBarItem.backgroundColor = undefined;
    this.statusBarItem.command = 'git-id-switcher.selectIdentity';
  }

  /**
   * Update status bar to reflect sync state between profile and git config.
   *
   * - synced: normal display with sync confirmation in tooltip
   * - out_of_sync: warning background, ⚠️ prefix, mismatch details in tooltip
   * - unknown: no change (preserves current display)
   */
  setSyncState(result: SyncCheckResult): void {
    this.currentSyncState = result;

    if (!this.currentIdentity) {
      return;
    }

    if (result.state === 'unknown') {
      return;
    }

    if (result.state === 'synced') {
      // Restore normal display
      this.statusBarItem.text = truncateForStatusBar(
        this.buildDisplayText(this.currentIdentity)
      );
      this.statusBarItem.tooltip = new vscode.MarkdownString(
        this.buildTooltip(this.currentIdentity)
      );
      this.statusBarItem.backgroundColor = undefined;
      this.statusBarItem.command = 'git-id-switcher.selectIdentity';
      return;
    }

    // out_of_sync: show warning
    this.statusBarItem.text = truncateForStatusBar(
      `⚠️ ${this.buildDisplayText(this.currentIdentity)}`
    );
    this.statusBarItem.tooltip = new vscode.MarkdownString(
      buildMismatchTooltip(result.mismatches)
    );
    this.statusBarItem.backgroundColor = new vscode.ThemeColor(
      'statusBarItem.warningBackground'
    );
    this.statusBarItem.command = 'git-id-switcher.resolveSyncMismatch';
  }

  /**
   * Get current sync state
   */
  getSyncState(): SyncCheckResult | undefined {
    return this.currentSyncState;
  }

  /**
   * Set status bar to "no identity selected" state
   */
  setNoIdentity(): void {
    this.currentIdentity = undefined;
    this.statusBarItem.text = '❓ ' + vscode.l10n.t('Select Identity');
    this.statusBarItem.tooltip = vscode.l10n.t('Click to select a Git identity');
    this.statusBarItem.backgroundColor = new vscode.ThemeColor(
      'statusBarItem.warningBackground'
    );
  }

  /**
   * Set status bar to loading state
   */
  setLoading(): void {
    this.statusBarItem.text = '⏳ ' + vscode.l10n.t('Switching...');
    this.statusBarItem.tooltip = vscode.l10n.t('Switching identity...');
  }

  /**
   * Set status bar to error state
   */
  setError(message: string): void {
    this.statusBarItem.text = '❌ ' + vscode.l10n.t('Identity Error');
    this.statusBarItem.tooltip = message;
    this.statusBarItem.backgroundColor = new vscode.ThemeColor(
      'statusBarItem.errorBackground'
    );
  }

  /**
   * Get current identity
   */
  getCurrentIdentity(): Identity | undefined {
    return this.currentIdentity;
  }

  /**
   * Build display text for the status bar (icon + name)
   */
  private buildDisplayText(identity: Identity): string {
    return identity.icon ? `${identity.icon} ${identity.name}` : identity.name;
  }

  /**
   * Build tooltip content with detailed identity information
   */
  private buildTooltip(identity: Identity): string {
    const lines = [
      `### ${getIdentityLabel(identity)}`,
      '',
    ];

    // Add description if available
    if (identity.description) {
      lines.push(`**${identity.description}**`, '');
    }

    // Identity details
    lines.push('---', '', '- ' + vscode.l10n.t('**Email:** {0}', identity.email));

    if (identity.sshHost) {
      lines.push('- ' + vscode.l10n.t('**SSH Host:** {0}', identity.sshHost));
    }

    if (identity.sshKeyPath) {
      lines.push('- ' + vscode.l10n.t('**SSH Key:** {0}', maskSshKeyPath(identity.sshKeyPath)));
    }

    if (identity.gpgKeyId) {
      lines.push('- ' + vscode.l10n.t('**GPG Key:** {0}', maskGpgKeyId(identity.gpgKeyId)));
    }

    lines.push('', '---', '', vscode.l10n.t('*Click to switch identity*'));

    return lines.join('\n');
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.statusBarItem.dispose();
  }
}

// ============================================================================
// Pure Functions (exported for testing)
// ============================================================================

/** GPG short key ID length (last 8 hex characters, per OpenPGP convention) */
const GPG_SHORT_KEY_ID_LENGTH = 8;

/**
 * Mask SSH key path to show only the filename.
 * Prevents full filesystem path exposure in tooltip during screen sharing.
 */
export function maskSshKeyPath(keyPath: string): string {
  return path.basename(keyPath);
}

/**
 * Mask GPG key ID to show only the last 8 characters.
 * Prevents full key ID exposure in tooltip during screen sharing.
 */
export function maskGpgKeyId(keyId: string): string {
  return keyId.slice(-GPG_SHORT_KEY_ID_LENGTH);
}

/**
 * Field display labels for mismatch tooltip.
 * Maps internal field names to user-facing labels.
 */
const FIELD_LABELS: Readonly<Record<SyncMismatch['field'], string>> = {
  name: 'name',
  email: 'email',
  signingKey: 'signingKey',
};

/**
 * Build markdown tooltip content showing mismatch details.
 *
 * Uses vscode.l10n.t() for localization of header text.
 *
 * @param mismatches - Array of field mismatches between profile and git config
 * @returns Markdown string with mismatch table
 */
export function buildMismatchTooltip(mismatches: readonly SyncMismatch[]): string {
  const lines = [
    `⚠️ **${vscode.l10n.t('Profile out of sync')}**`,
    '',
    `| ${vscode.l10n.t('Field')} | ${vscode.l10n.t('Profile')} | ${vscode.l10n.t('Git Config')} |`,
    '|-------|---------|------------|',
  ];

  for (const mismatch of mismatches) {
    lines.push(
      `| ${FIELD_LABELS[mismatch.field]} | ${mismatch.expected} | ${mismatch.actual} |`
    );
  }

  lines.push('', vscode.l10n.t('*Click to resolve*'));

  return lines.join('\n');
}

/**
 * Create and return a new status bar instance
 */
export function createStatusBar(): IdentityStatusBar {
  return new IdentityStatusBar();
}
