/**
 * Workspace Trust Tests
 *
 * Tests for workspace trust checking functionality including:
 * - isWorkspaceTrusted() behavior
 * - showUntrustedWorkspaceWarning() warning display
 * - initializeWorkspaceTrust() initialization flow
 * - requireWorkspaceTrust() command guard
 * - Trust granted callback execution
 *
 * Note: These tests use mocked VS Code API since workspace trust
 * cannot be easily manipulated in test environments.
 */

import * as assert from 'node:assert';
import {
  isWorkspaceTrusted,
  showUntrustedWorkspaceWarning,
  initializeWorkspaceTrust,
  requireWorkspaceTrust,
  _resetForTesting,
} from '../workspaceTrust';
import { _setMockVSCode, _resetCache } from '../vscodeLoader';

/**
 * Create a minimal mock VS Code API for testing
 */
function createMockVSCode(options: {
  isTrusted: boolean;
  onTrustGrantedCallback?: () => void;
}) {
  let trustGrantedCallback: (() => void) | undefined;
  const disposables: { dispose: () => void }[] = [];

  return {
    workspace: {
      isTrusted: options.isTrusted,
      onDidGrantWorkspaceTrust: (callback: () => void) => {
        trustGrantedCallback = callback;
        if (options.onTrustGrantedCallback) {
          options.onTrustGrantedCallback();
        }
        const disposable = {
          dispose: () => {
            trustGrantedCallback = undefined;
          },
        };
        disposables.push(disposable);
        return disposable;
      },
    },
    window: {
      showWarningMessage: () => Promise.resolve(undefined),
      showInformationMessage: () => Promise.resolve(undefined),
    },
    l10n: {
      t: (message: string) => message,
    },
    // Helper to simulate trust being granted (for testing)
    _simulateTrustGranted: () => {
      if (trustGrantedCallback) {
        trustGrantedCallback();
      }
    },
    _getDisposables: () => disposables,
  };
}

/**
 * Create a mock ExtensionContext
 */
function createMockContext() {
  const subscriptions: { dispose: () => void }[] = [];
  return {
    subscriptions,
    globalStorageUri: { fsPath: '/mock/global/storage' },
    workspaceState: {
      get: () => undefined,
      update: () => Promise.resolve(),
    },
    globalState: {
      get: () => undefined,
      update: () => Promise.resolve(),
    },
  } as unknown as import('vscode').ExtensionContext;
}

/**
 * Test isWorkspaceTrusted returns true when workspace is trusted
 */
function testIsWorkspaceTrustedTrue(): void {
  console.log('Testing isWorkspaceTrusted when trusted...');

  const mockVSCode = createMockVSCode({ isTrusted: true });
  _setMockVSCode(mockVSCode as never);

  const result = isWorkspaceTrusted();

  assert.strictEqual(result, true, 'Should return true for trusted workspace');

  _resetCache();
  console.log('✅ isWorkspaceTrusted when trusted passed!');
}

/**
 * Test isWorkspaceTrusted returns false when workspace is untrusted
 */
function testIsWorkspaceTrustedFalse(): void {
  console.log('Testing isWorkspaceTrusted when untrusted...');

  const mockVSCode = createMockVSCode({ isTrusted: false });
  _setMockVSCode(mockVSCode as never);

  const result = isWorkspaceTrusted();

  assert.strictEqual(result, false, 'Should return false for untrusted workspace');

  _resetCache();
  console.log('✅ isWorkspaceTrusted when untrusted passed!');
}

/**
 * Test showUntrustedWorkspaceWarning displays warning message
 */
function testShowUntrustedWorkspaceWarning(): void {
  console.log('Testing showUntrustedWorkspaceWarning...');

  let warningShown = false;
  let warningMessage = '';

  const mockVSCode = {
    workspace: {
      isTrusted: false,
      onDidGrantWorkspaceTrust: () => ({ dispose: () => {} }),
    },
    window: {
      showWarningMessage: (message: string) => {
        warningShown = true;
        warningMessage = message;
        return Promise.resolve(undefined);
      },
    },
    l10n: {
      t: (message: string) => message,
    },
  };
  _setMockVSCode(mockVSCode as never);

  showUntrustedWorkspaceWarning();

  assert.strictEqual(warningShown, true, 'Warning message should be shown');
  assert.ok(
    warningMessage.includes('disabled') || warningMessage.includes('untrusted'),
    'Warning message should mention disabled or untrusted'
  );

  _resetCache();
  console.log('✅ showUntrustedWorkspaceWarning passed!');
}

/**
 * Test initializeWorkspaceTrust returns true for trusted workspace
 */
function testInitializeWorkspaceTrustTrusted(): void {
  console.log('Testing initializeWorkspaceTrust with trusted workspace...');

  _resetForTesting();
  const mockVSCode = createMockVSCode({ isTrusted: true });
  _setMockVSCode(mockVSCode as never);

  const mockContext = createMockContext();
  let callbackCalled = false;

  const result = initializeWorkspaceTrust(mockContext, async () => {
    callbackCalled = true;
  });

  assert.strictEqual(result, true, 'Should return true for trusted workspace');
  assert.strictEqual(callbackCalled, false, 'Callback should not be called immediately for trusted workspace');

  _resetCache();
  _resetForTesting();
  console.log('✅ initializeWorkspaceTrust with trusted workspace passed!');
}

/**
 * Test initializeWorkspaceTrust returns false for untrusted workspace
 */
function testInitializeWorkspaceTrustUntrusted(): void {
  console.log('Testing initializeWorkspaceTrust with untrusted workspace...');

  _resetForTesting();
  let eventHandlerRegistered = false;

  const mockVSCode = {
    workspace: {
      isTrusted: false,
      onDidGrantWorkspaceTrust: () => {
        eventHandlerRegistered = true;
        return { dispose: () => {} };
      },
    },
    window: {
      showWarningMessage: () => Promise.resolve(undefined),
    },
    l10n: {
      t: (message: string) => message,
    },
  };
  _setMockVSCode(mockVSCode as never);

  const mockContext = createMockContext();
  let callbackCalled = false;

  const result = initializeWorkspaceTrust(mockContext, async () => {
    callbackCalled = true;
  });

  assert.strictEqual(result, false, 'Should return false for untrusted workspace');
  assert.strictEqual(callbackCalled, false, 'Callback should not be called for untrusted workspace');
  assert.strictEqual(eventHandlerRegistered, true, 'Trust granted event handler should be registered');

  _resetCache();
  _resetForTesting();
  console.log('✅ initializeWorkspaceTrust with untrusted workspace passed!');
}

/**
 * Test initializeWorkspaceTrust callback is called when trust is granted
 */
async function testInitializeWorkspaceTrustCallback(): Promise<void> {
  console.log('Testing initializeWorkspaceTrust callback on trust granted...');

  _resetForTesting();
  let trustGrantedHandler: (() => void) | undefined;

  const mockVSCode = {
    workspace: {
      isTrusted: false,
      onDidGrantWorkspaceTrust: (callback: () => void) => {
        trustGrantedHandler = callback;
        return { dispose: () => {} };
      },
    },
    window: {
      showWarningMessage: () => Promise.resolve(undefined),
    },
    l10n: {
      t: (message: string) => message,
    },
  };
  _setMockVSCode(mockVSCode as never);

  const mockContext = createMockContext();
  let callbackCalled = false;

  initializeWorkspaceTrust(mockContext, async () => {
    callbackCalled = true;
  });

  assert.strictEqual(callbackCalled, false, 'Callback should not be called initially');

  // Simulate trust being granted
  if (trustGrantedHandler) {
    await trustGrantedHandler();
  }

  assert.strictEqual(callbackCalled, true, 'Callback should be called when trust is granted');

  _resetCache();
  _resetForTesting();
  console.log('✅ initializeWorkspaceTrust callback on trust granted passed!');
}

/**
 * Test initializeWorkspaceTrust is idempotent
 */
function testInitializeWorkspaceTrustIdempotent(): void {
  console.log('Testing initializeWorkspaceTrust idempotency...');

  _resetForTesting();
  let eventHandlerCount = 0;

  const mockVSCode = {
    workspace: {
      isTrusted: false,
      onDidGrantWorkspaceTrust: () => {
        eventHandlerCount++;
        return { dispose: () => {} };
      },
    },
    window: {
      showWarningMessage: () => Promise.resolve(undefined),
    },
    l10n: {
      t: (message: string) => message,
    },
  };
  _setMockVSCode(mockVSCode as never);

  const mockContext = createMockContext();
  const callback = async () => {};

  // Call multiple times
  initializeWorkspaceTrust(mockContext, callback);
  initializeWorkspaceTrust(mockContext, callback);
  initializeWorkspaceTrust(mockContext, callback);

  assert.strictEqual(
    eventHandlerCount,
    1,
    'Event handler should only be registered once (idempotent)'
  );

  _resetCache();
  _resetForTesting();
  console.log('✅ initializeWorkspaceTrust idempotency passed!');
}

/**
 * Test requireWorkspaceTrust returns true for trusted workspace
 */
function testRequireWorkspaceTrustTrusted(): void {
  console.log('Testing requireWorkspaceTrust with trusted workspace...');

  const mockVSCode = createMockVSCode({ isTrusted: true });
  _setMockVSCode(mockVSCode as never);

  const result = requireWorkspaceTrust();

  assert.strictEqual(result, true, 'Should return true for trusted workspace');

  _resetCache();
  console.log('✅ requireWorkspaceTrust with trusted workspace passed!');
}

/**
 * Test requireWorkspaceTrust returns false and shows warning for untrusted workspace
 */
function testRequireWorkspaceTrustUntrusted(): void {
  console.log('Testing requireWorkspaceTrust with untrusted workspace...');

  let warningShown = false;

  const mockVSCode = {
    workspace: {
      isTrusted: false,
    },
    window: {
      showWarningMessage: () => {
        warningShown = true;
        return Promise.resolve(undefined);
      },
    },
    l10n: {
      t: (message: string) => message,
    },
  };
  _setMockVSCode(mockVSCode as never);

  const result = requireWorkspaceTrust();

  assert.strictEqual(result, false, 'Should return false for untrusted workspace');
  assert.strictEqual(warningShown, true, 'Warning should be shown for untrusted workspace');

  _resetCache();
  console.log('✅ requireWorkspaceTrust with untrusted workspace passed!');
}

/**
 * Test _resetForTesting clears internal state
 */
function testResetForTesting(): void {
  console.log('Testing _resetForTesting...');

  _resetForTesting();

  // After reset, initializeWorkspaceTrust should work again
  let eventHandlerCount = 0;

  const mockVSCode = {
    workspace: {
      isTrusted: false,
      onDidGrantWorkspaceTrust: () => {
        eventHandlerCount++;
        return { dispose: () => {} };
      },
    },
    window: {
      showWarningMessage: () => Promise.resolve(undefined),
    },
    l10n: {
      t: (message: string) => message,
    },
  };
  _setMockVSCode(mockVSCode as never);

  const mockContext = createMockContext();
  const callback = async () => {};

  initializeWorkspaceTrust(mockContext, callback);
  assert.strictEqual(eventHandlerCount, 1, 'First call should register handler');

  // Reset and try again
  _resetForTesting();
  initializeWorkspaceTrust(mockContext, callback);
  assert.strictEqual(eventHandlerCount, 2, 'After reset, handler should be registered again');

  _resetCache();
  _resetForTesting();
  console.log('✅ _resetForTesting passed!');
}

/**
 * Test callback error handling
 */
async function testCallbackErrorHandling(): Promise<void> {
  console.log('Testing callback error handling...');

  _resetForTesting();
  let trustGrantedHandler: (() => void) | undefined;
  const consoleLogs: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    consoleLogs.push(args.map(a => String(a)).join(' '));
  };

  const mockVSCode = {
    workspace: {
      isTrusted: false,
      onDidGrantWorkspaceTrust: (callback: () => void) => {
        trustGrantedHandler = callback;
        return { dispose: () => {} };
      },
    },
    window: {
      showWarningMessage: () => Promise.resolve(undefined),
    },
    l10n: {
      t: (message: string) => message,
    },
  };
  _setMockVSCode(mockVSCode as never);

  const mockContext = createMockContext();

  initializeWorkspaceTrust(mockContext, async () => {
    throw new Error('Test callback error');
  });

  // Simulate trust being granted
  if (trustGrantedHandler) {
    await trustGrantedHandler();
  }

  console.error = originalError;

  // Check that error was logged
  const hasErrorLog = consoleLogs.some(log =>
    log.includes('Failed to initialize') || log.includes('Test callback error')
  );
  assert.ok(hasErrorLog, 'Error should be logged when callback fails');

  _resetCache();
  _resetForTesting();
  console.log('✅ Callback error handling passed!');
}

/**
 * Test handler is disposed after trust is granted
 */
async function testHandlerDisposedAfterTrustGranted(): Promise<void> {
  console.log('Testing handler disposal after trust granted...');

  _resetForTesting();
  let trustGrantedHandler: (() => void) | undefined;
  let disposeCallCount = 0;

  const mockVSCode = {
    workspace: {
      isTrusted: false,
      onDidGrantWorkspaceTrust: (callback: () => void) => {
        trustGrantedHandler = callback;
        return {
          dispose: () => {
            disposeCallCount++;
          },
        };
      },
    },
    window: {
      showWarningMessage: () => Promise.resolve(undefined),
    },
    l10n: {
      t: (message: string) => message,
    },
  };
  _setMockVSCode(mockVSCode as never);

  const mockContext = createMockContext();

  initializeWorkspaceTrust(mockContext, async () => {});

  // Simulate trust being granted
  if (trustGrantedHandler) {
    await trustGrantedHandler();
  }

  assert.strictEqual(
    disposeCallCount,
    1,
    'Handler should be disposed after trust is granted'
  );

  _resetCache();
  _resetForTesting();
  console.log('✅ Handler disposal after trust granted passed!');
}

/**
 * Run all workspace trust tests
 */
export async function runWorkspaceTrustTests(): Promise<void> {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Workspace Trust Tests                    ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    testIsWorkspaceTrustedTrue();
    testIsWorkspaceTrustedFalse();
    testShowUntrustedWorkspaceWarning();
    testInitializeWorkspaceTrustTrusted();
    testInitializeWorkspaceTrustUntrusted();
    await testInitializeWorkspaceTrustCallback();
    testInitializeWorkspaceTrustIdempotent();
    testRequireWorkspaceTrustTrusted();
    testRequireWorkspaceTrustUntrusted();
    testResetForTesting();
    await testCallbackErrorHandling();
    await testHandlerDisposedAfterTrustGranted();

    console.log('\n✅ All workspace trust tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runWorkspaceTrustTests().catch(console.error);
}
