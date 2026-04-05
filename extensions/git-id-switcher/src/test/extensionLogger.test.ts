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
 * The singleton is shared, so we use dispose() + _resetCache() to reset state.
 */
function resetLogger(): void {
  extensionLogger.dispose();
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
  assert.ok(
    appendedLines[0].includes('[Git ID Switcher]'),
    'Should include extension prefix'
  );
  assert.ok(
    appendedLines[0].includes('Activating...'),
    'Should include message'
  );
  assert.ok(
    !appendedLines[0].includes('[debug]'),
    'Info messages should not have debug prefix'
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
  assert.ok(
    appendedLines[0].includes('[debug]'),
    'Debug messages should have [debug] prefix'
  );
  assert.ok(
    appendedLines[0].includes('Initialization cancelled'),
    'Should include message'
  );

  resetLogger();
  console.log('✅ extensionLogger.debug() with mock VS Code passed!');
}

/**
 * Test dispose() cleans up OutputChannel
 */
function testDispose(): void {
  console.log('Testing extensionLogger.dispose()...');

  resetLogger();

  let disposeCalled = false;
  const mockOutputChannel = {
    appendLine: () => {},
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

  // Dispose should clean up OutputChannel
  extensionLogger.dispose();
  assert.ok(disposeCalled, 'Should dispose OutputChannel');

  // After dispose + cache reset, no VS Code API available — logging is a no-op
  _resetCache();
  extensionLogger.info('after dispose');

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

export function runExtensionLoggerTests(): void {
  console.log('\n--- Extension Logger Tests ---\n');

  testLogWithoutVSCode();
  testInfoWithMockVSCode();
  testDebugWithMockVSCode();
  testDispose();
  testLazyInitialization();

  console.log('\n✅ All Extension Logger tests passed!\n');
}
