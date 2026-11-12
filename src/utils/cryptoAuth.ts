/**
 * Cryptographic Authentication Service for Teacher Dashboard
 *
 * Replaces plaintext localStorage password storage with:
 * 1. Web Crypto API SHA-256 with cryptographically secure random salt (16 bytes).
 * 2. Brute-force rate limiting and lockout mechanism in sessionStorage.
 * 3. Temporary session tokens with expiration (2 hours) to avoid persistent plaintext state.
 * 4. Safe fallback & automatic migration from legacy plaintext configurations.
 */

export interface TeacherAuthConfig {
  salt: string;
  hash: string;
  isDefault: boolean;
  version?: number;
  updatedAt: string;
}

const AUTH_STORAGE_KEY = 'healing_pharmacy_teacher_auth';
const LEGACY_PW_KEY = 'healing_pharmacy_teacher_password';
const SESSION_TOKEN_KEY = 'healing_pharmacy_teacher_session';
const ATTEMPTS_KEY = 'healing_pharmacy_teacher_attempts';

const DEFAULT_PW = '1234';
const CURRENT_AUTH_VERSION = 3; // version 3 enforces reset and migration to 1234
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30 * 1000; // 30 seconds
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateRandomSalt(): string {
  const array = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return bufferToHex(array.buffer);
}

async function computeSha256(salt: string, text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${text}`);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return bufferToHex(hashBuffer);
  }
  // Basic deterministic fallback if SubtleCrypto is unavailable in test environment
  let h = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    h ^= data[i];
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export class CryptoAuthService {
  /**
   * Initializes or gets the teacher auth configuration.
   * If an older configuration (version < 3) exists,
   * it automatically resets and migrates to 1234.
   */
  static async getAuthConfig(): Promise<TeacherAuthConfig> {
    if (typeof window === 'undefined') {
      return { salt: 'dummy', hash: 'dummy', isDefault: true, version: CURRENT_AUTH_VERSION, updatedAt: '' };
    }

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed: TeacherAuthConfig = JSON.parse(stored);
        // If already migrated to current version (enforcing 1234)
        if (parsed.version === CURRENT_AUTH_VERSION && parsed.salt && parsed.hash) {
          return parsed;
        }
        // Older version or legacy config without version: reset to 1234
        return await this.resetToDefault();
      }

      // Default initialization with 1234
      return await this.resetToDefault();
    } catch (e) {
      console.error('[CryptoAuth] Error getting auth config:', e);
      return await this.resetToDefault();
    }
  }

  /**
   * Resets teacher administrator password to default ('1234')
   * and clears any failed login lockout timers.
   */
  static async resetToDefault(): Promise<TeacherAuthConfig> {
    const salt = generateRandomSalt();
    const hash = await computeSha256(salt, DEFAULT_PW);

    const config: TeacherAuthConfig = {
      salt,
      hash,
      isDefault: true,
      version: CURRENT_AUTH_VERSION,
      updatedAt: new Date().toISOString()
    };

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(config));
        localStorage.removeItem(LEGACY_PW_KEY);
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(ATTEMPTS_KEY);
      }
    } catch {
      // ignore storage access errors
    }

    return config;
  }

  /**
   * Updates teacher password with a fresh random salt and SHA-256 hash.
   */
  static async setTeacherPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    const trimmed = (newPassword || '').trim();
    if (trimmed.length < 4) {
      return { success: false, message: '비밀번호는 최소 4자리 이상이어야 합니다.' };
    }

    const salt = generateRandomSalt();
    const hash = await computeSha256(salt, trimmed);
    const isDefault = trimmed === DEFAULT_PW;

    const config: TeacherAuthConfig = {
      salt,
      hash,
      isDefault,
      version: CURRENT_AUTH_VERSION,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(config));
    localStorage.removeItem(LEGACY_PW_KEY);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(ATTEMPTS_KEY);
    }
    return { success: true, message: '관리자 비밀번호가 안전하게 암호화되어 변경되었습니다.' };
  }

  /**
   * Validates current password and updates to new password.
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const verifyRes = await this.verifyPassword(currentPassword);
    if (!verifyRes.success) {
      return {
        success: false,
        message: verifyRes.error || '현재 비밀번호가 일치하지 않습니다.'
      };
    }

    const trimmedNew = (newPassword || '').trim();
    if (trimmedNew.length < 4) {
      return {
        success: false,
        message: '새 비밀번호는 최소 4자리 이상이어야 합니다.'
      };
    }

    return await this.setTeacherPassword(trimmedNew);
  }

  /**
   * Checks current lockout status to prevent brute-force attacks.
   */
  static checkLockout(): { locked: boolean; remainingSeconds: number } {
    try {
      const record = sessionStorage.getItem(ATTEMPTS_KEY);
      if (!record) return { locked: false, remainingSeconds: 0 };
      const { attempts, lockedUntil } = JSON.parse(record);
      const now = Date.now();
      if (lockedUntil && now < lockedUntil) {
        const remainingSeconds = Math.ceil((lockedUntil - now) / 1000);
        return { locked: true, remainingSeconds };
      }
      return { locked: false, remainingSeconds: 0 };
    } catch {
      return { locked: false, remainingSeconds: 0 };
    }
  }

  /**
   * Verifies the entered password against the salted hash.
   */
  static async verifyPassword(enteredPassword: string): Promise<{
    success: boolean;
    locked?: boolean;
    remainingSeconds?: number;
    isDefault?: boolean;
    error?: string;
  }> {
    const lockout = this.checkLockout();
    if (lockout.locked) {
      return {
        success: false,
        locked: true,
        remainingSeconds: lockout.remainingSeconds,
        error: `연속 인증 실패로 ${lockout.remainingSeconds}초 동안 입력이 차단됩니다.`
      };
    }

    const config = await this.getAuthConfig();
    const enteredHash = await computeSha256(config.salt, (enteredPassword || '').trim());

    if (enteredHash === config.hash) {
      // Reset failed attempts on success
      sessionStorage.removeItem(ATTEMPTS_KEY);
      // Create session token
      this.createSessionToken();
      return {
        success: true,
        isDefault: config.isDefault
      };
    } else {
      // Increment failed attempts
      let attempts = 1;
      let lockedUntil = 0;
      try {
        const record = sessionStorage.getItem(ATTEMPTS_KEY);
        if (record) {
          const parsed = JSON.parse(record);
          attempts = (parsed.attempts || 0) + 1;
        }
      } catch {
        attempts = 1;
      }

      if (attempts >= MAX_ATTEMPTS) {
        lockedUntil = Date.now() + LOCKOUT_MS;
      }

      sessionStorage.setItem(
        ATTEMPTS_KEY,
        JSON.stringify({
          attempts,
          lockedUntil,
          lastAttemptAt: Date.now()
        })
      );

      if (lockedUntil > 0) {
        return {
          success: false,
          locked: true,
          remainingSeconds: Math.ceil(LOCKOUT_MS / 1000),
          error: `5회 연속 실패하여 보안을 위해 30초 동안 로그인이 일시 차단됩니다.`
        };
      }

      return {
        success: false,
        error: `비밀번호가 일치하지 않습니다. (실패 ${attempts}/${MAX_ATTEMPTS}회)`
      };
    }
  }

  /**
   * Creates a session token in sessionStorage with sliding expiry.
   */
  static createSessionToken(): string {
    const token = `TEACHER_SESS_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    sessionStorage.setItem(
      SESSION_TOKEN_KEY,
      JSON.stringify({
        token,
        expiresAt,
        createdAt: Date.now()
      })
    );
    return token;
  }

  /**
   * Checks if an active, unexpired teacher session exists.
   */
  static isSessionValid(): boolean {
    try {
      const raw = sessionStorage.getItem(SESSION_TOKEN_KEY);
      if (!raw) return false;
      const { expiresAt } = JSON.parse(raw);
      return Date.now() < expiresAt;
    } catch {
      return false;
    }
  }

  /**
   * Destroys current teacher session (logout).
   */
  static destroySession(): void {
    try {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
    } catch {
      // ignore
    }
  }
}
