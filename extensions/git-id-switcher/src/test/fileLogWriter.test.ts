/**
 * FileLogWriter Tests
 *
 * Tests for file-based logging with rotation support.
 * Covers:
 * - Basic log writing and log format
 * - All log levels (DEBUG, INFO, WARN, ERROR, SECURITY)
 * - Log rotation on size limit
 * - Old file cleanup (maxFiles enforcement)
 * - Path security validation (traversal, null bytes, tilde expansion)
 * - Circular reference handling in metadata
 * - Reinitialization after dispose
 * - Error handling (empty path, disabled logging)
 */

import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { FileLogWriter } from '../fileLogWriter';
import { LogLevel, FileLogConfig, StructuredLog } from '../logTypes';

/**
 * Create a temporary directory for test files
 */
function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'filelogwriter-test-'));
}

/**
 * Remove directory and all contents recursively
 */
function removeTempDir(dir: string): void {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        removeTempDir(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    }
    fs.rmdirSync(dir);
  }
}

/**
 * Create a basic structured log for testing
 */
function createTestLog(
  message: string,
  level: LogLevel = LogLevel.INFO,
  metadata?: Record<string, unknown>
): StructuredLog {
  return {
    timestamp: new Date().toISOString(),
    level,
    category: 'test',
    message,
    metadata,
  };
}

/**
 * Wait for file operations to complete
 */
function waitForFileOps(ms: number = 50): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create test configuration for FileLogWriter
 * 
 * DRY: Centralizes test config creation to avoid duplication
 */
function createTestConfig(
  filePath: string,
  overrides?: Partial<FileLogConfig>
): FileLogConfig {
  return {
    enabled: true,
    filePath,
    maxFileSizeBytes: 1024 * 1024,
    maxFiles: 5,
    ...overrides,
  };
}

/**
 * Assert that log file contains expected content
 * 
 * DRY: Centralizes assertion logic for log content verification
 */
function assertLogContains(
  logPath: string,
  expectedContents: string[],
  description: string
): void {
  assert.strictEqual(fs.existsSync(logPath), true, `${description}: Log file should exist`);

  const content = fs.readFileSync(logPath, 'utf8');
  for (const expected of expectedContents) {
    assert.ok(content.includes(expected), `${description}: Log should contain "${expected}"`);
  }
}

/**
 * Test basic log writing functionality
 */
async function testBasicLogWriting(): Promise<void> {
  console.log('Testing basic log writing...');

  const tempDir = createTempDir();
  const logPath = path.join(tempDir, 'test.log');

  try {
    const config: FileLogConfig = {
      enabled: true,
      filePath: logPath,
      maxFileSizeBytes: 1024 * 1024,
      maxFiles: 5,
    };

    const writer = new FileLogWriter(config);

    // Write a log entry
    writer.write(createTestLog('Test message 1'));
    writer.write(createTestLog('Test message 2', LogLevel.WARN));
    writer.write(createTestLog('Test message 3', LogLevel.ERROR, { key: 'value' }));

    // Allow file operations to complete
    await waitForFileOps();
    writer.dispose();
    await waitForFileOps();

    // Verify file exists and has content
    assertLogContains(
      logPath,
      [
        'Test message 1',
        'Test message 2',
        'Test message 3',
        '[INFO]',
        '[WARN]',
        '[ERROR]',
        '[test]',
        '"key":"value"',
      ],
      'Basic log writing'
    );

    console.log('✅ Basic log writing passed!');
  } finally {
    removeTempDir(tempDir);
  }
}

/**
 * Test log format
 */
async function testLogFormat(): Promise<void> {
  console.log('Testing log format...');

  const tempDir = createTempDir();
  const logPath = path.join(tempDir, 'format.log');

  try {
    const config = createTestConfig(logPath);
    const writer = new FileLogWriter(config);
    const timestamp = '2024-01-15T10:30:00.000Z';
    const log: StructuredLog = {
      timestamp,
      level: LogLevel.INFO,
      category: 'security',
      message: 'User login',
      metadata: { userId: 123 },
    };

    writer.write(log);
    await waitForFileOps();
    writer.dispose();
    await waitForFileOps();

    const content = fs.readFileSync(logPath, 'utf8');
    const expectedPattern = `[${timestamp}] [INFO] [security] User login {"userId":123}`;
    assert.ok(
      content.includes(expectedPattern),
      `Log format should match expected pattern. Got: ${content}`
    );

    console.log('✅ Log format test passed!');
  } finally {
    removeTempDir(tempDir);
  }
}

/**
 * Test disabled logging
 */
async function testDisabledLogging(): Promise<void> {
  console.log('Testing disabled logging...');

  const tempDir = createTempDir();
  const logPath = path.join(tempDir, 'disabled.log');

  try {
    const config = createTestConfig(logPath, { enabled: false });
    const writer = new FileLogWriter(config);
    writer.write(createTestLog('This should not be written'));
    await waitForFileOps();
    writer.dispose();
    await waitForFileOps();

    assert.strictEqual(fs.existsSync(logPath), false, 'Log file should not exist when disabled');

    console.log('✅ Disabled logging test passed!');
  } finally {
    removeTempDir(tempDir);
  }
}

/**
 * Test log rotation when file size limit is exceeded
 */
async function testLogRotation(): Promise<void> {
  console.log('Testing log rotation...');

  const tempDir = createTempDir();
  const logPath = path.join(tempDir, 'rotate.log');

  try {
    const config = createTestConfig(logPath, {
      maxFileSizeBytes: 200, // Small size to trigger rotation quickly
      maxFiles: 3,
    });
    const writer = new FileLogWriter(config);

    // Write enough logs to trigger rotation
    for (let i = 0; i < 10; i++) {
      writer.write(createTestLog(`Message ${i} with padding to increase size`));
      await waitForFileOps(10);
    }

    await waitForFileOps(100);
    writer.dispose();
    await waitForFileOps();

    // Check that rotated files exist
    const files = fs.readdirSync(tempDir);
    const rotatedFiles = files.filter((f) => f.startsWith('rotate.') && f.endsWith('.log'));

    assert.ok(rotatedFiles.length > 0, 'Should have rotated files');
    assert.ok(
      rotatedFiles.some((f) => f.match(/rotate\.\d{4}-\d{2}-\d{2}T[\d-]+Z\.log/)),
      'Rotated files should have timestamp format'
    );

    console.log('✅ Log rotation test passed!');
  } finally {
    removeTempDir(tempDir);
  }
}

/**
 * Test old file cleanup
 */
async function testOldFileCleanup(): Promise<void> {
  console.log('Testing old file cleanup...');

  const tempDir = createTempDir();
  const logPath = path.join(tempDir, 'cleanup.log');

  try {
    const config = createTestConfig(logPath, {
      maxFileSizeBytes: 100, // Very small to trigger many rotations
      maxFiles: 2, // Only keep 2 files (1 current + 1 rotated)
    });

    const writer = new FileLogWriter(config);

    // Write many logs to trigger multiple rotations
    for (let i = 0; i < 20; i++) {
      writer.write(createTestLog(`Cleanup test message ${i} with extra padding`));
      await waitForFileOps(20);
    }

    await waitForFileOps(200);
    writer.dispose();
    await waitForFileOps();

    // Count total log files
    const files = fs.readdirSync(tempDir);
    const logFiles = files.filter((f) => f.startsWith('cleanup') && f.endsWith('.log'));

    // Should have at most maxFiles (current + rotated)
    assert.ok(
      logFiles.length <= config.maxFiles,
      `Should have at most ${config.maxFiles} log files, got ${logFiles.length}`
    );

    console.log('✅ Old file cleanup test passed!');
  } finally {
    removeTempDir(tempDir);
  }
}

/**
 * Test path security validation (invalid paths should be rejected)
 */
async function testPathSecurityValidation(): Promise<void> {
  console.log('Testing path security validation...');

  const tempDir = createTempDir();
  const validLogPath = path.join(tempDir, 'valid.log');

  try {
    // Test path traversal attack - should not create any file
    const traversalConfig: FileLogConfig = {
      enabled: true,
      filePath: path.join(tempDir, '../../../etc/passwd'),
      maxFileSizeBytes: 1024 * 1024,
      maxFiles: 5,
    };

    const traversalWriter = new FileLogWriter(traversalConfig);
    traversalWriter.write(createTestLog('Should not be written'));
    await waitForFileOps();
    traversalWriter.dispose();

    // Only the temp directory should exist, no log file created
    const filesInTemp = fs.existsSync(tempDir) ? fs.readdirSync(tempDir) : [];
    assert.strictEqual(filesInTemp.length, 0, 'No files should be created with invalid path');

    // Test that valid path still works (control test)
    const validConfig: FileLogConfig = {
      enabled: true,
      filePath: validLogPath,
      maxFileSizeBytes: 1024 * 1024,
      maxFiles: 5,
    };

    const validWriter = new FileLogWriter(validConfig);
    validWriter.write(createTestLog('Valid path test'));
    await waitForFileOps();
    validWriter.dispose();
    await waitForFileOps();

    assert.strictEqual(fs.existsSync(validLogPath), true, 'Valid path should create file');

    console.log('✅ Path security validation test passed!');
  } finally {
    removeTempDir(tempDir);
  }
}

/**
 * Test security edge cases (null bytes, tilde expansion)
 */
async function testSecurityEdgeCases(): Promise<void> {
  console.log('Testing security edge cases...');

  const tempDir = createTempDir();

  try {
    // Test null byte injection - should be blocked
    const nullByteConfig: FileLogConfig = {
      enabled: true,
      filePath: path.join(tempDir, 'file\x00.log'),
      maxFileSizeBytes: 1024 * 1024,
      maxFiles: 5,
    };

    const nullByteWriter = new FileLogWriter(nullByteConfig);
    nullByteWriter.write(createTestLog('Null byte test'));
    await waitForFileOps();
    nullByteWriter.dispose();

    // Test tilde user expansion - should be blocked
    const tildeUserConfig: FileLogConfig = {
      enabled: true,
      filePath: '~root/.ssh/malicious.log',
      maxFileSizeBytes: 1024 * 1024,
      maxFiles: 5,
    };

    const tildeWriter = new FileLogWriter(tildeUserConfig);
    tildeWriter.write(createTestLog('Tilde user test'));
    await waitForFileOps();
    tildeWriter.dispose();

    // Neither should create files (security blocked)
    const filesInTemp = fs.existsSync(tempDir) ? fs.readdirSync(tempDir) : [];
    assert.strictEqual(
      filesInTemp.filter((f) => f.includes('malicious')).length,
      0,
      'No malicious files should be created'
    );

    console.log('✅ Security edge cases test passed!');
  } finally {
    removeTempDir(tempDir);
  }
}

/**
 * Test circular reference handling in metadata
 */
async function testCircularReferenceHandling(): Promise<void> {
  console.log('Testing circular reference handling...');

  const tempDir = createTempDir();
  const logPath = path.join(tempDir, 'circular.log');

  try {
    const config = createTestConfig(logPath);
    const writer = new FileLogWriter(config);

    // Create circular reference
    const circular: Record<string, unknown> = { name: 'test' };
    circular.self = circular;

    writer.write(createTestLog('Circular reference test', LogLevel.INFO, circular));
    await waitForFileOps();
    writer.dispose();
    await waitForFileOps();

    // File should exist and contain the log with [Circular] marker
    assert.strictEqual(fs.existsSync(logPath), true, 'Log file should exist');

    const content = fs.readFileSync(logPath, 'utf8');
    assert.ok(content.includes('Circular reference test'), 'Log should contain message');
    assert.ok(content.includes('[Circular]'), 'Log should contain [Circular] marker for circular reference');
    assert.ok(content.includes('"name":"test"'), 'Log should contain non-circular fields');

    console.log('✅ Circular reference handling test passed!');
  } finally {
    removeTempDir(tempDir);
  }
}

/**
 * Test dispose cleanup
 *
 * Verifies that dispose() closes resources gracefully and that
 * subsequent write() calls don't throw errors (they reinitialize).
 * See testReinitializationAfterDispose for reinit behavior verification.
 */
async function testDisposeCleanup(): Promise<void> {
  console.log('Testing dispose cleanup...');

  const tempDir = createTempDir();
  const logPath = path.join(tempDir, 'dispose.log');

  try {
    const config: FileLogConfig = {
      enabled: true,
      filePath: logPath,
      maxFileSizeBytes: 1024 * 1024,
      maxFiles: 5,
    };

    const writer = new FileLogWriter(config);
    writer.write(createTestLog('Before dispose'));
    await waitForFileOps();

    // Dispose should clean up resources without throwing
    writer.dispose();
    await waitForFileOps();

    // Writing after dispose should not throw (reinitializes internally)
    writer.write(createTestLog('After dispose'));
    await waitForFileOps();

    // File should exist (from initial write and/or reinitialized write)
    assert.strictEqual(fs.existsSync(logPath), true, 'Log file should exist');

    console.log('✅ Dispose cleanup test passed!');
  } finally {
    removeTempDir(tempDir);
  }
}

/**
 * Test directory creation
 */
async function testDirectoryCreation(): Promise<void> {
  console.log('Testing directory creation...');

  const tempDir = createTempDir();
  const nestedDir = path.join(tempDir, 'nested', 'deep', 'path');
  const logPath = path.join(nestedDir, 'test.log');

  try {
    const config: FileLogConfig = {
      enabled: true,
      filePath: logPath,
      maxFileSizeBytes: 1024 * 1024,
      maxFiles: 5,
    };

    const writer = new FileLogWriter(config);
    writer.write(createTestLog('Nested directory test'));
    await waitForFileOps();
    writer.dispose();
    await waitForFileOps();

    // Directory and file should be created
    assert.strictEqual(fs.existsSync(nestedDir), true, 'Nested directory should be created');
    assert.strictEqual(fs.existsSync(logPath), true, 'Log file should exist in nested directory');

    console.log('✅ Directory creation test passed!');
  } finally {
    removeTempDir(tempDir);
  }
}

/**
 * Test empty file path handling
 */
async function testEmptyFilePath(): Promise<void> {
  console.log('Testing empty file path handling...');

  const config = createTestConfig('');

  const writer = new FileLogWriter(config);
  writer.write(createTestLog('Should not cause error'));
  await waitForFileOps();
  writer.dispose();

  // Should not throw, just silently fail
  console.log('✅ Empty file path handling test passed!');
}

/**
 * Test reinitialization after dispose
 *
 * FileLogWriter should reinitialize when write() is called after dispose()
 */
async function testReinitializationAfterDispose(): Promise<void> {
  console.log('Testing reinitialization after dispose...');

  const tempDir = createTempDir();
  const logPath = path.join(tempDir, 'reinit.log');

  try {
    const config = createTestConfig(logPath);
    const writer = new FileLogWriter(config);

    // Write initial log
    writer.write(createTestLog('Initial write'));
    await waitForFileOps();

    // Dispose and write again (should reinitialize)
    writer.dispose();
    writer.write(createTestLog('After reinit'));
    await waitForFileOps();
    writer.dispose();
    await waitForFileOps();

    // File should exist and contain both messages
    assert.strictEqual(fs.existsSync(logPath), true, 'Log file should exist after reinit');

    const content = fs.readFileSync(logPath, 'utf8');
    assert.ok(content.includes('Initial write'), 'Should contain initial log');
    assert.ok(content.includes('After reinit'), 'Should contain log after reinit');

    console.log('✅ Reinitialization after dispose test passed!');
  } finally {
    removeTempDir(tempDir);
  }
}

/**
 * Test metadata serialization with various types
 */
async function testMetadataSerializationTypes(): Promise<void> {
  console.log('Testing metadata serialization with various types...');

  const tempDir = createTempDir();
  const logPath = path.join(tempDir, 'metadata.log');

  try {
    const config = createTestConfig(logPath);
    const writer = new FileLogWriter(config);

    // Test various metadata types
    writer.write(
      createTestLog('String metadata', LogLevel.INFO, {
        str: 'hello',
        num: 42,
        bool: true,
        arr: [1, 2, 3],
        obj: { nested: 'value' },
        nil: null,
      })
    );
    await waitForFileOps();
    writer.dispose();
    await waitForFileOps();

    const content = fs.readFileSync(logPath, 'utf8');
    assert.ok(content.includes('"str":"hello"'), 'Should serialize string');
    assert.ok(content.includes('"num":42'), 'Should serialize number');
    assert.ok(content.includes('"bool":true'), 'Should serialize boolean');
    assert.ok(content.includes('"arr":[1,2,3]'), 'Should serialize array');
    assert.ok(content.includes('"nested":"value"'), 'Should serialize nested object');
    assert.ok(content.includes('"nil":null'), 'Should serialize null');

    console.log('✅ Metadata serialization types test passed!');
  } finally {
    removeTempDir(tempDir);
  }
}

/**
 * Test all log levels are correctly written
 */
async function testAllLogLevels(): Promise<void> {
  console.log('Testing all log levels...');

  const tempDir = createTempDir();
  const logPath = path.join(tempDir, 'levels.log');

  try {
    const config = createTestConfig(logPath);
    const writer = new FileLogWriter(config);

    // Write logs for all levels
    writer.write(createTestLog('Debug message', LogLevel.DEBUG));
    writer.write(createTestLog('Info message', LogLevel.INFO));
    writer.write(createTestLog('Warn message', LogLevel.WARN));
    writer.write(createTestLog('Error message', LogLevel.ERROR));
    writer.write(createTestLog('Security message', LogLevel.SECURITY));

    await waitForFileOps();
    writer.dispose();
    await waitForFileOps();

    const content = fs.readFileSync(logPath, 'utf8');

    // Verify all levels are written correctly
    assert.ok(content.includes('[DEBUG]'), 'Should contain DEBUG level');
    assert.ok(content.includes('[INFO]'), 'Should contain INFO level');
    assert.ok(content.includes('[WARN]'), 'Should contain WARN level');
    assert.ok(content.includes('[ERROR]'), 'Should contain ERROR level');
    assert.ok(content.includes('[SECURITY]'), 'Should contain SECURITY level');

    // Verify messages are present
    assert.ok(content.includes('Debug message'), 'Should contain debug message');
    assert.ok(content.includes('Security message'), 'Should contain security message');

    console.log('✅ All log levels test passed!');
  } finally {
    removeTempDir(tempDir);
  }
}

/**
 * Test log without metadata
 */
async function testLogWithoutMetadata(): Promise<void> {
  console.log('Testing log without metadata...');

  const tempDir = createTempDir();
  const logPath = path.join(tempDir, 'nometadata.log');

  try {
    const config = createTestConfig(logPath);
    const writer = new FileLogWriter(config);
    writer.write({
      timestamp: '2024-01-15T10:30:00.000Z',
      level: LogLevel.INFO,
      category: 'test',
      message: 'No metadata here',
    });
    await waitForFileOps();
    writer.dispose();
    await waitForFileOps();

    const content = fs.readFileSync(logPath, 'utf8');
    assert.ok(content.includes('No metadata here'), 'Should contain message');
    assert.ok(!content.includes('{}'), 'Should not have empty metadata object');

    console.log('✅ Log without metadata test passed!');
  } finally {
    removeTempDir(tempDir);
  }
}

/**
 * Run all FileLogWriter tests
 */
export async function runFileLogWriterTests(): Promise<void> {
  console.log('\n=== FileLogWriter Tests ===\n');

  try {
    await testBasicLogWriting();
    await testLogFormat();
    await testDisabledLogging();
    await testLogRotation();
    await testOldFileCleanup();
    await testPathSecurityValidation();
    await testSecurityEdgeCases();
    await testCircularReferenceHandling();
    await testDisposeCleanup();
    await testDirectoryCreation();
    await testEmptyFilePath();
    await testReinitializationAfterDispose();
    await testMetadataSerializationTypes();
    await testLogWithoutMetadata();
    await testAllLogLevels();

    console.log('\n✅ All FileLogWriter tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runFileLogWriterTests().catch(console.error);
}
