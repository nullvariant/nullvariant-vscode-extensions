/**
 * Extension Logger Tests
 *
 * Tests for the OutputChannel-based extension logger.
 * Verifies info/debug logging and dispose behavior
 * with both available and unavailable VS Code API.
 */

import * as assert from 'node:assert';
import { _resetCache, _setMockVSCode } from '../core/vscodeLoader';
import { extensionLogger } from '../logging/extensionLogger';

/**
 * Create a fresh extensionLogger instance for isolated testing.
 * The singleton is shared, so we use _resetForTest() + _resetCache() to reset state.
 * _resetForTest() clears disposed/initialized/outputChannel without setting disposed=true.
 */
function resetLogger(): void {
  extensionLogger._resetForTest();
  _resetCache();
}

/**
 * Test info() and debug() without VS Code API (graceful no-op)
 */
function testLogWithoutVSCode(): void {
  console.log('Testing extensionLogger without VS Code API...');

  resetLogger();

  // Should not throw when VS Code API is unavailable
  extensionLogger.info('test info message');
  extensionLogger.warn('test warn message');
  extensionLogger.error('test error message');
  extensionLogger.debug('test debug message');

  resetLogger();
  console.log('✅ extensionLogger without VS Code API passed!');
}

/**
 * Test info() with mock VS Code API
 */
function testInfoWithMockVSCode(): void {
  console.log('Testing extensionLogger.info() with mock VS Code...');

  resetLogger();

  const appendedLines: string[] = [];
  const mockOutputChannel = {
    appendLine: (line: string) => { appendedLines.push(line); },
    dispose: () => {},
  };

  const mockVSCode = {
    window: {
      createOutputChannel: () => mockOutputChannel,
    },
  };
  _setMockVSCode(mockVSCode as never);

  extensionLogger.info('Activating...');

  assert.strictEqual(appendedLines.length, 1, 'Should have one log entry');
  assert.strictEqual(
    appendedLines[0],
    '[Git ID Switcher] Activating...',
    'Info should format as PREFIX + message without level tag'
  );

  resetLogger();
  console.log('✅ extensionLogger.info() with mock VS Code passed!');
}

/**
 * Test debug() with mock VS Code API
 */
function testDebugWithMockVSCode(): void {
  console.log('Testing extensionLogger.debug() with mock VS Code...');

  resetLogger();

  const appendedLines: string[] = [];
  const mockOutputChannel = {
    appendLine: (line: string) => { appendedLines.push(line); },
    dispose: () => {},
  };

  const mockVSCode = {
    window: {
      createOutputChannel: () => mockOutputChannel,
    },
  };
  _setMockVSCode(mockVSCode as never);

  extensionLogger.debug('Initialization cancelled');

  assert.strictEqual(appendedLines.length, 1, 'Should have one log entry');
  assert.strictEqual(
    appendedLines[0],
    '[Git ID Switcher] [debug] Initialization cancelled',
    'Debug should format as PREFIX + [debug] + message'
  );

  resetLogger();
  console.log('✅ extensionLogger.debug() with mock VS Code passed!');
}

/**
 * Test warn() with mock VS Code API
 */
function testWarnWithMockVSCode(): void {
  console.log('Testing extensionLogger.warn() with mock VS Code...');

  resetLogger();

  const appendedLines: string[] = [];
  const mockOutputChannel = {
    appendLine: (line: string) => { appendedLines.push(line); },
    dispose: () => {},
  };

  const mockVSCode = {
    window: {
      createOutputChannel: () => mockOutputChannel,
    },
  };
  _setMockVSCode(mockVSCode as never);

  extensionLogger.warn('Submodule config failed');

  assert.strictEqual(appendedLines.length, 1, 'Should have one log entry');
  assert.strictEqual(
    appendedLines[0],
    '[Git ID Switcher] [warn] Submodule config failed',
    'Warn should format as PREFIX + [warn] + message'
  );

  resetLogger();
  console.log('✅ extensionLogger.warn() with mock VS Code passed!');
}

/**
 * Test error() with mock VS Code API
 */
function testErrorWithMockVSCode(): void {
  console.log('Testing extensionLogger.error() with mock VS Code...');

  resetLogger();

  const appendedLines: string[] = [];
  const mockOutputChannel = {
    appendLine: (line: string) => { appendedLines.push(line); },
    dispose: () => {},
  };

  const mockVSCode = {
    window: {
      createOutputChannel: () => mockOutputChannel,
    },
  };
  _setMockVSCode(mockVSCode as never);

  extensionLogger.error('Failed to initialize');

  assert.strictEqual(appendedLines.length, 1, 'Should have one log entry');
  assert.strictEqual(
    appendedLines[0],
    '[Git ID Switcher] [error] Failed to initialize',
    'Error should format as PREFIX + [error] + message'
  );

  resetLogger();
  console.log('✅ extensionLogger.error() with mock VS Code passed!');
}

/**
 * Test dispose() cleans up OutputChannel
 */
function testDispose(): void {
  console.log('Testing extensionLogger.dispose()...');

  resetLogger();

  let disposeCalled = false;
  const appendedLines: string[] = [];
  const mockOutputChannel = {
    appendLine: (line: string) => { appendedLines.push(line); },
    dispose: () => { disposeCalled = true; },
  };

  const mockVSCode = {
    window: {
      createOutputChannel: () => mockOutputChannel,
    },
  };
  _setMockVSCode(mockVSCode as never);

  // Trigger initialization
  extensionLogger.info('init');
  assert.strictEqual(appendedLines.length, 1, 'Should log before dispose');

  // Dispose should clean up OutputChannel
  extensionLogger.dispose();
  assert.ok(disposeCalled, 'Should dispose OutputChannel');

  // After dispose, logging is a permanent no-op (disposed flag prevents re-initialization)
  extensionLogger.info('after dispose');
  assert.strictEqual(appendedLines.length, 1, 'Should not log after dispose');

  resetLogger();
  console.log('✅ extensionLogger.dispose() passed!');
}

/**
 * Test lazy initialization (OutputChannel created on first use, not import)
 */
function testLazyInitialization(): void {
  console.log('Testing extensionLogger lazy initialization...');

  resetLogger();

  let createCalled = false;
  const mockOutputChannel = {
    appendLine: () => {},
    dispose: () => {},
  };

  const mockVSCode = {
    window: {
      createOutputChannel: () => {
        createCalled = true;
        return mockOutputChannel;
      },
    },
  };
  _setMockVSCode(mockVSCode as never);

  // OutputChannel should not be created yet (lazy)
  assert.strictEqual(createCalled, false, 'Should not create OutputChannel before first use');

  // First log call should trigger creation
  extensionLogger.info('first message');
  assert.ok(createCalled, 'Should create OutputChannel on first use');

  // Second call should not create again
  createCalled = false;
  extensionLogger.info('second message');
  assert.strictEqual(createCalled, false, 'Should not create OutputChannel again');

  resetLogger();
  console.log('✅ extensionLogger lazy initialization passed!');
}

/**
 * Test that info() and debug() are permanent no-ops after dispose().
 * Verifies that OutputChannel is not re-created after dispose.
 */
function testNoOpAfterDispose(): void {
  console.log('Testing extensionLogger no-op after dispose()...');

  resetLogger();

  const appendedLines: string[] = [];
  let createCallCount = 0;
  const mockOutputChannel = {
    appendLine: (line: string) => { appendedLines.push(line); },
    dispose: () => {},
  };

  const mockVSCode = {
    window: {
      createOutputChannel: () => {
        createCallCount++;
        return mockOutputChannel;
      },
    },
  };
  _setMockVSCode(mockVSCode as never);

  // Normal logging works before dispose
  extensionLogger.info('before dispose');
  assert.strictEqual(appendedLines.length, 1, 'Should log before dispose');
  assert.strictEqual(createCallCount, 1, 'Should create OutputChannel once');

  // Dispose the logger
  extensionLogger.dispose();

  // After dispose, logging should be a permanent no-op
  extensionLogger.info('after dispose info');
  extensionLogger.warn('after dispose warn');
  extensionLogger.error('after dispose error');
  extensionLogger.debug('after dispose debug');

  assert.strictEqual(appendedLines.length, 1, 'Should not log after dispose');
  assert.strictEqual(createCallCount, 1, 'Should not re-create OutputChannel after dispose');

  resetLogger();
  console.log('✅ extensionLogger no-op after dispose() passed!');
}

/**
 * Test dispose() before any logging — should not throw, subsequent calls are no-ops
 */
function testDisposeBeforeLogging(): void {
  console.log('Testing extensionLogger dispose before any logging...');

  resetLogger();

  let createCallCount = 0;
  const mockVSCode = {
    window: {
      createOutputChannel: () => {
        createCallCount++;
        return { appendLine: () => {}, dispose: () => {} };
      },
    },
  };
  _setMockVSCode(mockVSCode as never);

  // Dispose without ever logging — should not throw
  extensionLogger.dispose();

  // Subsequent logging should be a no-op
  extensionLogger.info('after early dispose');
  extensionLogger.warn('after early dispose warn');
  extensionLogger.error('after early dispose error');
  extensionLogger.debug('after early dispose debug');
  assert.strictEqual(createCallCount, 0, 'Should not create OutputChannel after early dispose');

  resetLogger();
  console.log('✅ extensionLogger dispose before any logging passed!');
}

/**
 * Test double dispose() — should not throw
 */
function testDoubleDispose(): void {
  console.log('Testing extensionLogger double dispose()...');

  resetLogger();

  let disposeCallCount = 0;
  const mockOutputChannel = {
    appendLine: () => {},
    dispose: () => { disposeCallCount++; },
  };

  const mockVSCode = {
    window: {
      createOutputChannel: () => mockOutputChannel,
    },
  };
  _setMockVSCode(mockVSCode as never);

  extensionLogger.info('init');

  extensionLogger.dispose();
  assert.strictEqual(disposeCallCount, 1, 'First dispose should call OutputChannel.dispose');

  // Second dispose should not throw and should not call OutputChannel.dispose again
  extensionLogger.dispose();
  assert.strictEqual(disposeCallCount, 1, 'Second dispose should not call OutputChannel.dispose');

  resetLogger();
  console.log('✅ extensionLogger double dispose() passed!');
}

export function runExtensionLoggerTests(): void {
  console.log('\n--- Extension Logger Tests ---\n');

  testLogWithoutVSCode();
  testInfoWithMockVSCode();
  testWarnWithMockVSCode();
  testErrorWithMockVSCode();
  testDebugWithMockVSCode();
  testDispose();
  testLazyInitialization();
  testNoOpAfterDispose();
  testDisposeBeforeLogging();
  testDoubleDispose();

  console.log('\n✅ All Extension Logger tests passed!\n');
}
