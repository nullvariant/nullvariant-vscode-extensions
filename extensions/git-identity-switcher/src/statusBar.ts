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
    this.statusBarItem.command = 'git-identity-switcher.selectIdentity';

    // Set initial state
    this.setNoIdentity();

    // Show the status bar item
    this.statusBarItem.show();
  }

  /**
   * Update status bar with current identity
   */
  setIdentity(identity: Identity): void {
    this.currentIdentity = identity;
    this.statusBarItem.text = `$(person) ${getIdentityLabel(identity)}`;
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
    this.statusBarItem.text = '$(question) Select Identity';
    this.statusBarItem.tooltip = 'Click to select a Git identity';
    this.statusBarItem.backgroundColor = new vscode.ThemeColor(
      'statusBarItem.warningBackground'
    );
  }

  /**
   * Set status bar to loading state
   */
  setLoading(): void {
    this.statusBarItem.text = '$(loading~spin) Switching...';
    this.statusBarItem.tooltip = 'Switching identity...';
  }

  /**
   * Set status bar to error state
   */
  setError(message: string): void {
    this.statusBarItem.text = '$(error) Identity Error';
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
   * Build tooltip content
   */
  private buildTooltip(identity: Identity): string {
    const lines = [
      `### ${getIdentityLabel(identity)}`,
      '',
      `**Email:** ${identity.email}`,
    ];

    if (identity.sshKeyPath) {
      lines.push(`**SSH Key:** ${identity.sshKeyPath}`);
    }

    if (identity.gpgKeyId) {
      lines.push(`**GPG Key:** ${identity.gpgKeyId}`);
    }

    lines.push('', '---', '', '*Click to switch identity*');

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
