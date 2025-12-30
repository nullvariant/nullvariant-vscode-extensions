/**
 * SSH Key Format Validation Tests
 *
 * Tests for SSH key file format validation.
 * These tests do NOT depend on the vscode module and can run standalone.
 */

import * as assert from 'assert';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

/**
 * Valid SSH private key format headers (copied from sshAgent.ts for testing)
 */
const VALID_SSH_KEY_HEADERS = [
  '-----BEGIN OPENSSH PRIVATE KEY-----',
  '-----BEGIN RSA PRIVATE KEY-----',
  '-----BEGIN DSA PRIVATE KEY-----',
  '-----BEGIN EC PRIVATE KEY-----',
  '-----BEGIN PRIVATE KEY-----',
  '-----BEGIN ENCRYPTED PRIVATE KEY-----',
  'PuTTY-User-Key-File-2:',
  'PuTTY-User-Key-File-3:',
] as const;

/**
 * Create a temporary test directory
 */
async function createTempDir(): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'git-id-switcher-format-test-'));
  return tmpDir;
}

/**
 * Clean up temporary test directory
 */
async function cleanupTempDir(tmpDir: string): Promise<void> {
  try {
    await fs.rm(tmpDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Check if file content starts with a valid SSH private key header
 * (Test implementation, matching sshAgent.ts logic)
 */
async function isValidSshKeyFormat(filePath: string): Promise<boolean> {
  let fileHandle: Awaited<ReturnType<typeof fs.open>> | null = null;
  try {
    fileHandle = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(64);
    const { bytesRead } = await fileHandle.read(buffer, 0, 64, 0);

    if (bytesRead === 0) {
      return false;
    }

    const header = buffer.subarray(0, bytesRead).toString('utf8').trimStart();

    return VALID_SSH_KEY_HEADERS.some(validHeader =>
      header.startsWith(validHeader)
    );
  } catch {
    return false;
  } finally {
    if (fileHandle) {
      await fileHandle.close();
    }
  }
}

/**
 * Test valid SSH key formats are recognized
 */
async function testValidFormats(): Promise<void> {
  console.log('Testing valid SSH key formats...');

  const tmpDir = await createTempDir();
  try {
    // Test OpenSSH format
    const opensshKey = path.join(tmpDir, 'openssh_key');
    await fs.writeFile(opensshKey, '-----BEGIN OPENSSH PRIVATE KEY-----\nbase64data\n-----END OPENSSH PRIVATE KEY-----\n');
    await fs.chmod(opensshKey, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(opensshKey), true, 'OpenSSH format should be valid');

    // Test RSA PEM format
    const rsaKey = path.join(tmpDir, 'rsa_key');
    await fs.writeFile(rsaKey, '-----BEGIN RSA PRIVATE KEY-----\nbase64data\n-----END RSA PRIVATE KEY-----\n');
    await fs.chmod(rsaKey, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(rsaKey), true, 'RSA PEM format should be valid');

    // Test DSA PEM format
    const dsaKey = path.join(tmpDir, 'dsa_key');
    await fs.writeFile(dsaKey, '-----BEGIN DSA PRIVATE KEY-----\nbase64data\n-----END DSA PRIVATE KEY-----\n');
    await fs.chmod(dsaKey, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(dsaKey), true, 'DSA PEM format should be valid');

    // Test EC PEM format
    const ecKey = path.join(tmpDir, 'ec_key');
    await fs.writeFile(ecKey, '-----BEGIN EC PRIVATE KEY-----\nbase64data\n-----END EC PRIVATE KEY-----\n');
    await fs.chmod(ecKey, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(ecKey), true, 'EC PEM format should be valid');

    // Test PKCS#8 unencrypted format
    const pkcs8Key = path.join(tmpDir, 'pkcs8_key');
    await fs.writeFile(pkcs8Key, '-----BEGIN PRIVATE KEY-----\nbase64data\n-----END PRIVATE KEY-----\n');
    await fs.chmod(pkcs8Key, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(pkcs8Key), true, 'PKCS#8 format should be valid');

    // Test PKCS#8 encrypted format
    const pkcs8EncKey = path.join(tmpDir, 'pkcs8_enc_key');
    await fs.writeFile(pkcs8EncKey, '-----BEGIN ENCRYPTED PRIVATE KEY-----\nbase64data\n-----END ENCRYPTED PRIVATE KEY-----\n');
    await fs.chmod(pkcs8EncKey, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(pkcs8EncKey), true, 'PKCS#8 encrypted format should be valid');

    // Test PuTTY PPK v2 format
    const puttyV2Key = path.join(tmpDir, 'putty_v2_key');
    await fs.writeFile(puttyV2Key, 'PuTTY-User-Key-File-2: ssh-rsa\nEncryption: none\n');
    await fs.chmod(puttyV2Key, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(puttyV2Key), true, 'PuTTY PPK v2 format should be valid');

    // Test PuTTY PPK v3 format
    const puttyV3Key = path.join(tmpDir, 'putty_v3_key');
    await fs.writeFile(puttyV3Key, 'PuTTY-User-Key-File-3: ssh-rsa\nEncryption: none\n');
    await fs.chmod(puttyV3Key, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(puttyV3Key), true, 'PuTTY PPK v3 format should be valid');

    // Test with leading whitespace (should still be valid)
    const whitespaceKey = path.join(tmpDir, 'whitespace_key');
    await fs.writeFile(whitespaceKey, '\n\n-----BEGIN OPENSSH PRIVATE KEY-----\nbase64data\n');
    await fs.chmod(whitespaceKey, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(whitespaceKey), true, 'Key with leading whitespace should be valid');

    console.log('✅ All valid SSH key formats recognized!');
  } finally {
    await cleanupTempDir(tmpDir);
  }
}

/**
 * Test invalid formats are rejected
 */
async function testInvalidFormats(): Promise<void> {
  console.log('Testing invalid SSH key formats...');

  const tmpDir = await createTempDir();
  try {
    // Test random text file
    const randomText = path.join(tmpDir, 'random_text');
    await fs.writeFile(randomText, 'This is not an SSH key file\nJust some random text');
    await fs.chmod(randomText, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(randomText), false, 'Random text should be invalid');

    // Test JSON file
    const jsonFile = path.join(tmpDir, 'config.json');
    await fs.writeFile(jsonFile, '{"key": "value"}');
    await fs.chmod(jsonFile, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(jsonFile), false, 'JSON file should be invalid');

    // Test public key (not private key)
    const publicKey = path.join(tmpDir, 'id_rsa.pub');
    await fs.writeFile(publicKey, 'ssh-rsa AAAAB3NzaC1yc2EAAA... user@host');
    await fs.chmod(publicKey, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(publicKey), false, 'Public key should be invalid');

    // Test certificate (not private key)
    const certFile = path.join(tmpDir, 'cert.pem');
    await fs.writeFile(certFile, '-----BEGIN CERTIFICATE-----\nbase64data\n-----END CERTIFICATE-----\n');
    await fs.chmod(certFile, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(certFile), false, 'Certificate should be invalid');

    // Test CSR (not private key)
    const csrFile = path.join(tmpDir, 'request.csr');
    await fs.writeFile(csrFile, '-----BEGIN CERTIFICATE REQUEST-----\nbase64data\n-----END CERTIFICATE REQUEST-----\n');
    await fs.chmod(csrFile, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(csrFile), false, 'CSR should be invalid');

    // Test empty file
    const emptyFile = path.join(tmpDir, 'empty');
    await fs.writeFile(emptyFile, '');
    await fs.chmod(emptyFile, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(emptyFile), false, 'Empty file should be invalid');

    // Test binary file
    const binaryFile = path.join(tmpDir, 'binary');
    await fs.writeFile(binaryFile, Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff, 0xfe]));
    await fs.chmod(binaryFile, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(binaryFile), false, 'Binary file should be invalid');

    // Test similar but incorrect header
    const almostValid = path.join(tmpDir, 'almost_valid');
    await fs.writeFile(almostValid, '-----BEGIN SSH PRIVATE KEY-----\nbase64data\n');
    await fs.chmod(almostValid, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(almostValid), false, 'Incorrect header should be invalid');

    // Test PuTTY v1 (unsupported old format)
    const puttyV1Key = path.join(tmpDir, 'putty_v1');
    await fs.writeFile(puttyV1Key, 'PuTTY-User-Key-File-1: ssh-rsa\n');
    await fs.chmod(puttyV1Key, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(puttyV1Key), false, 'PuTTY v1 should be invalid');

    console.log('✅ All invalid SSH key formats rejected!');
  } finally {
    await cleanupTempDir(tmpDir);
  }
}

/**
 * Test edge cases
 */
async function testEdgeCases(): Promise<void> {
  console.log('Testing edge cases...');

  const tmpDir = await createTempDir();
  try {
    // Test non-existent file
    const nonExistent = path.join(tmpDir, 'does_not_exist');
    assert.strictEqual(await isValidSshKeyFormat(nonExistent), false, 'Non-existent file should return false');

    // Test directory instead of file
    const dirPath = path.join(tmpDir, 'a_directory');
    await fs.mkdir(dirPath);
    assert.strictEqual(await isValidSshKeyFormat(dirPath), false, 'Directory should return false');

    // Test file with only whitespace
    const whitespaceOnly = path.join(tmpDir, 'whitespace_only');
    await fs.writeFile(whitespaceOnly, '   \n\t\n   ');
    await fs.chmod(whitespaceOnly, 0o600);
    assert.strictEqual(await isValidSshKeyFormat(whitespaceOnly), false, 'Whitespace-only file should be invalid');

    console.log('✅ All edge cases handled correctly!');
  } finally {
    await cleanupTempDir(tmpDir);
  }
}

/**
 * Run all SSH key format tests
 */
export async function runSshKeyFormatTests(): Promise<void> {
  console.log('\n=== SSH Key Format Validation Tests ===\n');

  try {
    await testValidFormats();
    await testInvalidFormats();
    await testEdgeCases();

    console.log('\n✅ All SSH key format tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runSshKeyFormatTests().catch(console.error);
}
