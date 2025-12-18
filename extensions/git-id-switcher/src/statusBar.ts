/**
 * Status Bar Management
 *
 * Displays the current identity in VS Code's status bar.
 * Clicking opens the identity selection quick pick.
 */

import * as vscode from 'vscode';
import { Identity, getIdentityLabel } from './identity';

/**
 * Status bar item wrapper
 */
export class IdentityStatusBar implements vscode.Disposable {
  private statusBarItem: vscode.StatusBarItem;
  private currentIdentity: Identity | undefined;

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
   * Shows emoji icon if configured, otherwise uses default 👤
   */
  setIdentity(identity: Identity): void {
    this.currentIdentity = identity;
    // Use identity's icon if available, otherwise default emoji
    const icon = identity.icon || '👤';
    this.statusBarItem.text = `${icon} ${identity.name}`;
    this.statusBarItem.tooltip = new vscode.MarkdownString(
      this.buildTooltip(identity)
    );
    this.statusBarItem.backgroundColor = undefined;
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

    lines.push('---', '');

    // Identity details
    lines.push('- ' + vscode.l10n.t('**Email:** {0}', identity.email));

    if (identity.sshHost) {
      lines.push('- ' + vscode.l10n.t('**SSH Host:** {0}', identity.sshHost));
    }

    if (identity.sshKeyPath) {
      lines.push('- ' + vscode.l10n.t('**SSH Key:** {0}', identity.sshKeyPath));
    }

    if (identity.gpgKeyId) {
      lines.push('- ' + vscode.l10n.t('**GPG Key:** {0}', identity.gpgKeyId));
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

/**
 * Create and return a new status bar instance
 */
export function createStatusBar(): IdentityStatusBar {
  return new IdentityStatusBar();
}
