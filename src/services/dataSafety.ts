import {
  Student,
  SchoolClass,
  Visit,
  CookieLog,
  GachaLog,
  AppSettings,
  NewConditionRequest,
  EmotionLog
} from '../types';

export interface DataBackupPayload {
  version: string;
  exportedAt: string;
  source: string;
  data: {
    students: Student[];
    classes: SchoolClass[];
    visits: Visit[];
    cookieLogs: CookieLog[];
    gachaLogs: GachaLog[];
    settings?: AppSettings;
    newConditions?: NewConditionRequest[];
    emotionLogs?: EmotionLog[];
  };
}

export interface SnapshotRecord {
  id: string;
  createdAt: string;
  reason: string;
  counts: {
    students: number;
    visits: number;
    cookieLogs: number;
  };
  payload: DataBackupPayload;
}

const STORAGE_KEYS = {
  CLASSES: 'healing_pharmacy_classes',
  STUDENTS: 'healing_pharmacy_students',
  VISITS: 'healing_pharmacy_visits',
  COOKIE_LOGS: 'healing_pharmacy_cookie_logs',
  GACHA_LOGS: 'healing_pharmacy_gacha_logs',
  NEW_CONDITION_REQUESTS: 'healing_pharmacy_new_conditions',
  SETTINGS: 'healing_pharmacy_settings',
  EMOTION_LOGS: 'healing_pharmacy_emotion_logs',
  // Safety & Redundancy Keys
  SNAPSHOTS: 'healing_pharmacy_snapshots',
  SAFE_VAULT: 'healing_pharmacy_vault_safe',
  LAST_BACKUP_TIME: 'healing_pharmacy_last_backup_time'
};

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined' || raw === 'null') return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`[DataSafety] Error reading ${key}:`, e);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`[DataSafety] Error writing ${key}:`, e);
    return false;
  }
}

export class DataSafetyService {
  private static readonly MAX_SNAPSHOTS = 8;
  private static lastSnapshotTimestamp = 0;

  /**
   * Reads all current state into a full backup payload.
   */
  static getCurrentPayload(reason: string = 'Current State'): DataBackupPayload {
    return {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      source: reason,
      data: {
        students: safeGet<Student[]>(STORAGE_KEYS.STUDENTS, []),
        classes: safeGet<SchoolClass[]>(STORAGE_KEYS.CLASSES, []),
        visits: safeGet<Visit[]>(STORAGE_KEYS.VISITS, []),
        cookieLogs: safeGet<CookieLog[]>(STORAGE_KEYS.COOKIE_LOGS, []),
        gachaLogs: safeGet<GachaLog[]>(STORAGE_KEYS.GACHA_LOGS, []),
        settings: safeGet<AppSettings | undefined>(STORAGE_KEYS.SETTINGS, undefined),
        newConditions: safeGet<NewConditionRequest[]>(STORAGE_KEYS.NEW_CONDITION_REQUESTS, []),
        emotionLogs: safeGet<EmotionLog[]>(STORAGE_KEYS.EMOTION_LOGS, [])
      }
    };
  }

  /**
   * Automatically creates a rolling snapshot if data is healthy.
   * Throttled to prevent flooding localStorage.
   */
  static createSnapshot(reason: string, force: boolean = false): void {
    const now = Date.now();
    // Throttle automated snapshots to at most once every 10 seconds unless forced
    if (!force && now - this.lastSnapshotTimestamp < 10000) {
      return;
    }

    try {
      const payload = this.getCurrentPayload(reason);
      const studentCount = payload.data.students.length;
      const visitCount = payload.data.visits.length;
      const cookieLogCount = payload.data.cookieLogs.length;

      // Only take snapshot if there is valid data (do NOT snapshot empty states)
      if (studentCount === 0 && visitCount === 0) {
        return;
      }

      // 1. Update Safe Vault (Mirrored infallible copy)
      safeSet(STORAGE_KEYS.SAFE_VAULT, payload);
      safeSet(STORAGE_KEYS.LAST_BACKUP_TIME, new Date().toISOString());

      // 2. Add to rolling snapshots list
      const snapshots = safeGet<SnapshotRecord[]>(STORAGE_KEYS.SNAPSHOTS, []);
      const newSnapshot: SnapshotRecord = {
        id: `SNAP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
        reason,
        counts: {
          students: studentCount,
          visits: visitCount,
          cookieLogs: cookieLogCount
        },
        payload
      };

      const updatedSnapshots = [newSnapshot, ...snapshots].slice(0, this.MAX_SNAPSHOTS);
      safeSet(STORAGE_KEYS.SNAPSHOTS, updatedSnapshots);
      this.lastSnapshotTimestamp = now;
      console.log(`[DataSafety] Snapshot created: "${reason}" (${studentCount} students, ${visitCount} visits)`);
    } catch (err) {
      console.error('[DataSafety] Failed to create snapshot:', err);
    }
  }

  /**
   * Returns list of saved recovery snapshots.
   */
  static getSnapshots(): SnapshotRecord[] {
    return safeGet<SnapshotRecord[]>(STORAGE_KEYS.SNAPSHOTS, []);
  }

  /**
   * Records an intentional reset so autoHeal will not treat empty state as data loss.
   */
  static markIntentionalReset(reason: string): void {
    safeSet('healing_pharmacy_intentional_reset', {
      timestamp: Date.now(),
      reason
    });
  }

  /**
   * Auto-heals local storage if data was accidentally cleared or corrupted.
   * Returns true if healing was performed.
   */
  static autoHealIfCorrupted(): boolean {
    try {
      // If user deliberately performed a reset, do NOT auto-heal!
      const resetMarker = safeGet<{ timestamp: number; reason: string } | null>(
        'healing_pharmacy_intentional_reset',
        null
      );
      if (resetMarker && Date.now() - resetMarker.timestamp < 3600000 * 24 * 7) {
        // Valid intentional reset within last 7 days; respect user action
        return false;
      }

      const studentsRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.STUDENTS) : null;
      const classesRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.CLASSES) : null;

      // Only heal if storage keys were unexpectedly wiped/missing entirely
      if (studentsRaw === null && classesRaw === null) {
        const safeVault = safeGet<DataBackupPayload | null>(STORAGE_KEYS.SAFE_VAULT, null);
        if (
          safeVault &&
          safeVault.data &&
          safeVault.data.students &&
          safeVault.data.students.length > 0
        ) {
          console.warn('[DataSafety] Missing storage keys detected! Restoring from Safe Vault...');
          this.applyPayload(safeVault);
          return true;
        }

        const snapshots = this.getSnapshots();
        if (snapshots.length > 0 && snapshots[0].payload) {
          console.warn('[DataSafety] Missing storage keys detected! Restoring from latest snapshot...');
          this.applyPayload(snapshots[0].payload);
          return true;
        }
      }
    } catch (e) {
      console.error('[DataSafety] Auto-heal check error:', e);
    }
    return false;
  }

  /**
   * Restores data to a specific snapshot.
   */
  static restoreSnapshot(snapshotId: string): { success: boolean; message: string } {
    const snapshots = this.getSnapshots();
    const target = snapshots.find((s) => s.id === snapshotId);
    if (!target) {
      return { success: false, message: '복원할 스냅샷 지점을 찾을 수 없습니다.' };
    }

    try {
      this.applyPayload(target.payload);
      this.createSnapshot(`스냅샷 복원 (${target.reason})`, true);
      return {
        success: true,
        message: `스냅샷 [${new Date(target.createdAt).toLocaleTimeString()}] 복원이 완료되었습니다.`
      };
    } catch (e: any) {
      return { success: false, message: `복원 중 오류 발생: ${e.message || e}` };
    }
  }

  /**
   * Applies a full backup payload to localStorage.
   */
  static applyPayload(payload: DataBackupPayload): void {
    if (!payload.data) throw new Error('올바르지 않은 백업 데이터 구조입니다.');

    if (Array.isArray(payload.data.students)) {
      safeSet(STORAGE_KEYS.STUDENTS, payload.data.students);
    }
    if (Array.isArray(payload.data.classes) && payload.data.classes.length > 0) {
      safeSet(STORAGE_KEYS.CLASSES, payload.data.classes);
    }
    if (Array.isArray(payload.data.visits)) {
      safeSet(STORAGE_KEYS.VISITS, payload.data.visits);
    }
    if (Array.isArray(payload.data.cookieLogs)) {
      safeSet(STORAGE_KEYS.COOKIE_LOGS, payload.data.cookieLogs);
    }
    if (Array.isArray(payload.data.gachaLogs)) {
      safeSet(STORAGE_KEYS.GACHA_LOGS, payload.data.gachaLogs);
    }
    if (payload.data.settings) {
      safeSet(STORAGE_KEYS.SETTINGS, payload.data.settings);
    }
    if (Array.isArray(payload.data.newConditions)) {
      safeSet(STORAGE_KEYS.NEW_CONDITION_REQUESTS, payload.data.newConditions);
    }
    if (Array.isArray(payload.data.emotionLogs)) {
      safeSet(STORAGE_KEYS.EMOTION_LOGS, payload.data.emotionLogs);
    }

    // Refresh safe vault
    safeSet(STORAGE_KEYS.SAFE_VAULT, payload);
  }

  /**
   * Exports full data to a timestamped JSON file download.
   */
  static exportBackupFile(): void {
    try {
      const payload = this.getCurrentPayload('수동 내보내기 백업');
      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const nowStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `힐링약국_전체데이터_안전백업_${nowStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('[DataSafety] Backup export error:', e);
      alert('백업 파일 다운로드 중 오류가 발생했습니다.');
    }
  }

  /**
   * Imports a backup JSON file and restores all data.
   */
  static async importBackupFile(file: File): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (!content) {
            resolve({ success: false, message: '파일 내용이 비어 있습니다.' });
            return;
          }
          const parsed = JSON.parse(content) as DataBackupPayload;

          if (!parsed.data || !Array.isArray(parsed.data.students)) {
            resolve({
              success: false,
              message: '올바른 힐링약국 백업 JSON 형식이 아닙니다.'
            });
            return;
          }

          // Create snapshot of current data before applying imported data
          this.createSnapshot('백업 파일 가져오기 전 자동 백업', true);

          this.applyPayload(parsed);

          resolve({
            success: true,
            message: `성공적으로 복원되었습니다! (학생: ${parsed.data.students.length}명, 처방전: ${parsed.data.visits?.length || 0}건)`
          });
        } catch (err: any) {
          resolve({ success: false, message: `파일 파싱 오류: ${err.message || err}` });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, message: '파일을 읽는 도중 오류가 발생했습니다.' });
      };
      reader.readAsText(file);
    });
  }

  /**
   * Returns statistics about current data safety.
   */
  static getSafetyStatus(): {
    lastBackupTime: string | null;
    snapshotCount: number;
    hasSafeVault: boolean;
  } {
    const lastBackupTime = safeGet<string | null>(STORAGE_KEYS.LAST_BACKUP_TIME, null);
    const snapshots = this.getSnapshots();
    const safeVault = safeGet<any | null>(STORAGE_KEYS.SAFE_VAULT, null);
    return {
      lastBackupTime,
      snapshotCount: snapshots.length,
      hasSafeVault: !!safeVault
    };
  }
}
