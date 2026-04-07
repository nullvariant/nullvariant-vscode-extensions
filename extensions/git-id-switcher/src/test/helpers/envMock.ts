/**
 * Shared environment variable save/restore helpers for tests that mock
 * process.platform and home-directory env vars (HOME, HOMEDRIVE, etc.).
 *
 * Restore order matters: env vars first (simple assignment), then platform
 * (Object.defineProperty is the riskier operation).
 */

const ENV_KEYS = ['HOME', 'HOMEDRIVE', 'HOMEPATH', 'USERPROFILE'] as const;

export interface EnvSnapshot {
  platform: string;
  HOME: string | undefined;
  HOMEDRIVE: string | undefined;
  HOMEPATH: string | undefined;
  USERPROFILE: string | undefined;
}

export function saveEnv(): EnvSnapshot {
  return {
    platform: process.platform,
    HOME: process.env.HOME,
    HOMEDRIVE: process.env.HOMEDRIVE,
    HOMEPATH: process.env.HOMEPATH,
    USERPROFILE: process.env.USERPROFILE,
  };
}

export function restoreEnv(snap: EnvSnapshot): void {
  // Restore env vars first (simple assignment, unlikely to fail)
  for (const key of ENV_KEYS) {
    if (snap[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = snap[key];
    }
  }
  // Restore platform last (Object.defineProperty is the riskier operation)
  Object.defineProperty(process, 'platform', { value: snap.platform, writable: true });
}
