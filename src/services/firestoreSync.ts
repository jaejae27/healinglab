import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, getProjectSafetyCheck, getDeploymentEnvironment } from './firebase';
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
import { INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_VISITS, DEFAULT_SETTINGS } from '../data/initialData';

// Clean undefined values before writing to Firestore
function cleanData<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

export interface SystemMeta {
  id: string;
  schemaVersion: number;
  appVersion: string;
  lastMigrationAt: string | null;
  lastBackupAt: string | null;
  lastSuccessfulConnectionAt: string | null;
  firebaseProjectId: string;
  initializedAt: string;
  environment: string;
}

export const CURRENT_SCHEMA_VERSION = 2;
export const APP_VERSION = '2.5.0';

type SyncListener = () => void;

class FirestoreSyncManager {
  private initialized = false;
  private listeners: Set<SyncListener> = new Set();
  public isConnected = false;
  public connectionError: string | null = null;
  public lastSyncTime: string | null = null;
  public lastSuccessfulConnectionAt: string | null = null;
  public systemMeta: SystemMeta | null = null;
  public migrationError: string | null = null;
  public isProjectMismatch = false;

  constructor() {
    const check = getProjectSafetyCheck();
    this.isProjectMismatch = !check.isMatch;
    if (this.isProjectMismatch) {
      console.warn(
        `[FirestoreSync Safety] WARNING: Configured project ID (${check.currentProjectId}) does not match expected (${check.expectedProjectId})!`
      );
    }
  }

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public notify() {
    this.lastSyncTime = new Date().toLocaleTimeString();
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error in FirestoreSync listener:', err);
      }
    });
  }

  /**
   * Returns current safety and synchronization status
   */
  public getStatus() {
    const safety = getProjectSafetyCheck();
    return {
      isConnected: this.isConnected,
      connectionError: this.connectionError,
      lastSyncTime: this.lastSyncTime,
      lastSuccessfulConnectionAt: this.lastSuccessfulConnectionAt,
      systemMeta: this.systemMeta,
      schemaVersion: this.systemMeta?.schemaVersion || CURRENT_SCHEMA_VERSION,
      appVersion: APP_VERSION,
      migrationError: this.migrationError,
      isProjectMismatch: !safety.isMatch,
      currentProjectId: safety.currentProjectId,
      expectedProjectId: safety.expectedProjectId,
      environment: safety.environment,
      databaseId: safety.databaseId
    };
  }

  /**
   * Non-destructive schema check & version migration
   */
  public async checkAndMigrateSchema(): Promise<void> {
    if (this.isProjectMismatch) {
      console.warn('[FirestoreSync Safety] Project mismatch detected: Schema migration aborted.');
      return;
    }

    try {
      const metaRef = doc(db, 'system', 'meta');
      const snap = await getDoc(metaRef);
      const env = getDeploymentEnvironment();
      const safety = getProjectSafetyCheck();

      if (!snap.exists()) {
        // First-time metadata record creation (without wiping anything)
        const initialMeta: SystemMeta = {
          id: 'meta',
          schemaVersion: CURRENT_SCHEMA_VERSION,
          appVersion: APP_VERSION,
          lastMigrationAt: new Date().toISOString(),
          lastBackupAt: null,
          lastSuccessfulConnectionAt: new Date().toISOString(),
          firebaseProjectId: safety.currentProjectId,
          initializedAt: new Date().toISOString(),
          environment: env
        };
        await setDoc(metaRef, cleanData(initialMeta), { merge: true });
        this.systemMeta = initialMeta;
        console.log('[FirestoreSync Safety] Initialized system/meta document at version', CURRENT_SCHEMA_VERSION);
      } else {
        const currentData = snap.data() as SystemMeta;
        this.systemMeta = currentData;

        // Perform non-destructive schema migration if version is older
        if (currentData.schemaVersion < CURRENT_SCHEMA_VERSION) {
          console.log(
            `[FirestoreSync Safety] Migrating schema from v${currentData.schemaVersion} to v${CURRENT_SCHEMA_VERSION}...`
          );

          const updatedMeta: Partial<SystemMeta> = {
            schemaVersion: CURRENT_SCHEMA_VERSION,
            appVersion: APP_VERSION,
            lastMigrationAt: new Date().toISOString(),
            lastSuccessfulConnectionAt: new Date().toISOString(),
            environment: env
          };

          await setDoc(metaRef, cleanData(updatedMeta), { merge: true });
          this.systemMeta = { ...currentData, ...updatedMeta } as SystemMeta;
          console.log(`[FirestoreSync Safety] Migration to v${CURRENT_SCHEMA_VERSION} successfully applied.`);
        }
      }
      this.lastSuccessfulConnectionAt = new Date().toISOString();
      this.connectionError = null;
    } catch (err: any) {
      console.warn('[FirestoreSync Safety] Schema check error:', err);
      this.migrationError = err?.message || String(err);
    }
  }

  /**
   * Health Check: tests read capability on core collections without mutating data
   */
  public async verifyDatabaseHealth(): Promise<{
    healthy: boolean;
    studentCount: number;
    hasSettings: boolean;
    hasSystemMeta: boolean;
    schemaVersion: number;
    error?: string;
  }> {
    try {
      const studentSnap = await getDocs(collection(db, 'students'));
      const settingsSnap = await getDoc(doc(db, 'app_settings', 'global'));
      const metaSnap = await getDoc(doc(db, 'system', 'meta'));

      this.isConnected = true;
      this.lastSuccessfulConnectionAt = new Date().toISOString();
      this.connectionError = null;

      const meta = metaSnap.exists() ? (metaSnap.data() as SystemMeta) : null;
      if (meta) {
        this.systemMeta = meta;
      }

      return {
        healthy: true,
        studentCount: studentSnap.size,
        hasSettings: settingsSnap.exists(),
        hasSystemMeta: metaSnap.exists(),
        schemaVersion: meta?.schemaVersion || CURRENT_SCHEMA_VERSION
      };
    } catch (err: any) {
      this.connectionError = err?.message || 'Firestore 연결 실패';
      return {
        healthy: false,
        studentCount: 0,
        hasSettings: false,
        hasSystemMeta: false,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        error: err?.message || String(err)
      };
    }
  }

  /**
   * Record last backup timestamp in system/meta
   */
  public async recordBackupTimestamp(): Promise<void> {
    if (this.isProjectMismatch) return;
    try {
      const metaRef = doc(db, 'system', 'meta');
      const now = new Date().toISOString();
      await setDoc(metaRef, { lastBackupAt: now }, { merge: true });
      if (this.systemMeta) {
        this.systemMeta.lastBackupAt = now;
      }
    } catch (err) {
      console.warn('[FirestoreSync Safety] Failed to record backup timestamp:', err);
    }
  }

  /**
   * Manual Seed (Admin-Only): strictly conditional, NEVER run automatically, NEVER deletes existing data
   */
  public async manualSeedInitialDataOnlyIfEmpty(): Promise<{ success: boolean; message: string }> {
    if (this.isProjectMismatch) {
      return {
        success: false,
        message: '프로젝트 불일치 상태에서는 데이터 오염 방지를 위해 생성이 차단됩니다.'
      };
    }

    try {
      const studentSnap = await getDocs(collection(db, 'students'));
      if (!studentSnap.empty) {
        return {
          success: false,
          message: `이미 학생 데이터(${studentSnap.size}명)가 존재하여 초기 생성을 실행하지 않습니다. 기존 데이터를 보존합니다.`
        };
      }

      const batch = writeBatch(db);

      // Seed initial students non-destructively
      INITIAL_STUDENTS.forEach((st) => {
        const ref = doc(db, 'students', st.id);
        batch.set(ref, cleanData(st), { merge: true });
      });

      // Seed initial classes non-destructively
      INITIAL_CLASSES.forEach((cl) => {
        const ref = doc(db, 'classes', `C-${cl.grade}-${cl.classNum}`);
        batch.set(ref, cleanData(cl), { merge: true });
      });

      // Seed initial visits non-destructively
      INITIAL_VISITS.forEach((vi) => {
        const ref = doc(db, 'visits', vi.visitId);
        batch.set(ref, cleanData(vi), { merge: true });
      });

      // Seed initial settings non-destructively
      const settingsRef = doc(db, 'app_settings', 'global');
      batch.set(settingsRef, cleanData(DEFAULT_SETTINGS), { merge: true });

      await batch.commit();

      // Ensure system meta is also written
      await this.checkAndMigrateSchema();

      return {
        success: true,
        message: '초기 기본 데이터가 Firestore에 안전하게 등록되었습니다.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: `초기 데이터 등록 중 오류: ${err?.message || err}`
      };
    }
  }

  async init(
    onStudentsSync: (students: Student[]) => void,
    onClassesSync: (classes: SchoolClass[]) => void,
    onVisitsSync: (visits: Visit[]) => void,
    onCookieLogsSync: (logs: CookieLog[]) => void,
    onGachaLogsSync: (logs: GachaLog[]) => void,
    onSettingsSync: (settings: AppSettings) => void,
    onNewConditionsSync: (requests: NewConditionRequest[]) => void,
    onEmotionLogsSync?: (logs: EmotionLog[]) => void
  ) {
    if (this.initialized) return;
    this.initialized = true;

    try {
      // Background schema check & migration (Non-destructive, never seeds or wipes)
      this.checkAndMigrateSchema().catch((err) => {
        console.warn('[FirestoreSync Safety] Schema check notice:', err);
      });

      // STUDENTS
      onSnapshot(
        collection(db, 'students'),
        (snapshot) => {
          this.isConnected = true;
          const students: Student[] = [];
          snapshot.forEach((docSnap) => {
            students.push(docSnap.data() as Student);
          });
          // Sort predictably by grade, class, number
          students.sort((a, b) => {
            if (a.grade !== b.grade) return a.grade - b.grade;
            if (a.classNum !== b.classNum) return a.classNum - b.classNum;
            return a.number - b.number;
          });
          if (students.length > 0) {
            onStudentsSync(students);
          }
          this.notify();
        },
        (error) => {
          console.warn('Firestore students listener error:', error);
        }
      );

      // CLASSES
      onSnapshot(
        collection(db, 'classes'),
        (snapshot) => {
          this.isConnected = true;
          const classes: SchoolClass[] = [];
          snapshot.forEach((docSnap) => {
            classes.push(docSnap.data() as SchoolClass);
          });
          if (classes.length > 0) {
            classes.sort((a, b) => {
              if (a.grade !== b.grade) return a.grade - b.grade;
              return a.classNum - b.classNum;
            });
            onClassesSync(classes);
          }
          this.notify();
        },
        (error) => {
          console.warn('Firestore classes listener error:', error);
        }
      );

      // VISITS
      onSnapshot(
        collection(db, 'visits'),
        (snapshot) => {
          this.isConnected = true;
          const visits: Visit[] = [];
          snapshot.forEach((docSnap) => {
            visits.push(docSnap.data() as Visit);
          });
          visits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          // Safety guard: never wipe local storage if cloud snapshot returns empty
          if (visits.length > 0) {
            onVisitsSync(visits);
          }
          this.notify();
        },
        (error) => {
          console.warn('Firestore visits listener error:', error);
        }
      );

      // COOKIE LOGS
      onSnapshot(
        collection(db, 'cookie_logs'),
        (snapshot) => {
          this.isConnected = true;
          const logs: CookieLog[] = [];
          snapshot.forEach((docSnap) => {
            logs.push(docSnap.data() as CookieLog);
          });
          logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          // Safety guard: only sync non-empty logs to prevent clearing local logs
          if (logs.length > 0) {
            onCookieLogsSync(logs.slice(0, 300));
          }
          this.notify();
        },
        (error) => {
          console.warn('Firestore cookie_logs listener error:', error);
        }
      );

      // GACHA LOGS
      onSnapshot(
        collection(db, 'gacha_logs'),
        (snapshot) => {
          this.isConnected = true;
          const logs: GachaLog[] = [];
          snapshot.forEach((docSnap) => {
            logs.push(docSnap.data() as GachaLog);
          });
          logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          if (logs.length > 0) {
            onGachaLogsSync(logs);
          }
          this.notify();
        },
        (error) => {
          console.warn('Firestore gacha_logs listener error:', error);
        }
      );

      // APP SETTINGS
      onSnapshot(
        doc(db, 'app_settings', 'global'),
        (docSnap) => {
          this.isConnected = true;
          if (docSnap.exists()) {
            onSettingsSync(docSnap.data() as AppSettings);
          }
          this.notify();
        },
        (error) => {
          console.warn('Firestore app_settings listener error:', error);
        }
      );

      // NEW CONDITIONS
      onSnapshot(
        collection(db, 'new_conditions'),
        (snapshot) => {
          this.isConnected = true;
          const reqs: NewConditionRequest[] = [];
          snapshot.forEach((docSnap) => {
            reqs.push(docSnap.data() as NewConditionRequest);
          });
          reqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onNewConditionsSync(reqs);
          this.notify();
        },
        (error) => {
          console.warn('Firestore new_conditions listener error:', error);
        }
      );
    } catch (err) {
      console.error('Failed to initialize Firestore real-time sync:', err);
    }
  }

  // --- WRITE METHODS (Non-destructive with { merge: true } & Safety Guard) ---

  async saveStudent(student: Student) {
    if (this.isProjectMismatch) return;
    try {
      await setDoc(doc(db, 'students', student.id), cleanData(student), { merge: true });
    } catch (err) {
      console.error(`Failed to save student ${student.id} to Firestore:`, err);
    }
  }

  async saveStudentsBatch(students: Student[]) {
    if (this.isProjectMismatch) return;
    try {
      const batch = writeBatch(db);
      students.forEach((st) => {
        batch.set(doc(db, 'students', st.id), cleanData(st), { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Failed to batch save students to Firestore:', err);
    }
  }

  async deleteStudent(studentId: string) {
    if (this.isProjectMismatch) return;
    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch (err) {
      console.error(`Failed to delete student ${studentId} from Firestore:`, err);
    }
  }

  async deleteStudentsBatch(studentIds: string[]) {
    if (this.isProjectMismatch) return;
    try {
      const batch = writeBatch(db);
      studentIds.forEach((id) => {
        batch.delete(doc(db, 'students', id));
      });
      await batch.commit();
    } catch (err) {
      console.error('Failed to batch delete students from Firestore:', err);
    }
  }

  async saveVisit(visit: Visit) {
    if (this.isProjectMismatch) return;
    try {
      await setDoc(doc(db, 'visits', visit.visitId), cleanData(visit), { merge: true });
    } catch (err) {
      console.error(`Failed to save visit ${visit.visitId} to Firestore:`, err);
    }
  }

  async saveVisitsBatch(visits: Visit[]) {
    if (this.isProjectMismatch) return;
    try {
      const batch = writeBatch(db);
      visits.forEach((vi) => {
        batch.set(doc(db, 'visits', vi.visitId), cleanData(vi), { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Failed to batch save visits to Firestore:', err);
    }
  }

  async deleteVisit(visitId: string) {
    if (this.isProjectMismatch) return;
    try {
      await deleteDoc(doc(db, 'visits', visitId));
    } catch (err) {
      console.error(`Failed to delete visit ${visitId} from Firestore:`, err);
    }
  }

  async addCookieLog(log: CookieLog) {
    if (this.isProjectMismatch) return;
    try {
      await setDoc(doc(db, 'cookie_logs', log.id), cleanData(log), { merge: true });
    } catch (err) {
      console.error(`Failed to save cookie log ${log.id} to Firestore:`, err);
    }
  }

  async addGachaLog(log: GachaLog) {
    if (this.isProjectMismatch) return;
    try {
      await setDoc(doc(db, 'gacha_logs', log.id), cleanData(log), { merge: true });
    } catch (err) {
      console.error(`Failed to save gacha log ${log.id} to Firestore:`, err);
    }
  }

  async updateGachaLog(logId: string, updates: Partial<GachaLog>) {
    if (this.isProjectMismatch) return;
    try {
      await setDoc(doc(db, 'gacha_logs', logId), cleanData(updates), { merge: true });
    } catch (err) {
      console.error(`Failed to update gacha log ${logId} in Firestore:`, err);
    }
  }

  async saveSettings(settings: AppSettings) {
    if (this.isProjectMismatch) return;
    try {
      await setDoc(doc(db, 'app_settings', 'global'), cleanData(settings), { merge: true });
    } catch (err) {
      console.error('Failed to save settings to Firestore:', err);
    }
  }

  async saveClasses(classes: SchoolClass[]) {
    if (this.isProjectMismatch) return;
    try {
      const batch = writeBatch(db);
      classes.forEach((cl) => {
        batch.set(doc(db, 'classes', `C-${cl.grade}-${cl.classNum}`), cleanData(cl), { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Failed to save classes to Firestore:', err);
    }
  }

  async addNewConditionRequest(req: NewConditionRequest) {
    if (this.isProjectMismatch) return;
    try {
      await setDoc(doc(db, 'new_conditions', req.id), cleanData(req), { merge: true });
    } catch (err) {
      console.error(`Failed to save new condition request ${req.id} to Firestore:`, err);
    }
  }

  async updateNewConditionRequest(requestId: string, updates: Partial<NewConditionRequest>) {
    if (this.isProjectMismatch) return;
    try {
      await setDoc(doc(db, 'new_conditions', requestId), cleanData(updates), { merge: true });
    } catch (err) {
      console.error(`Failed to update new condition request ${requestId} in Firestore:`, err);
    }
  }

  async saveEmotionLog(log: EmotionLog) {
    if (this.isProjectMismatch) return;
    try {
      await setDoc(doc(db, 'emotion_logs', log.id), cleanData(log), { merge: true });
    } catch (err) {
      console.error(`Failed to save emotion log ${log.id} to Firestore:`, err);
    }
  }

  /**
   * Completely clears all documents in a Firestore collection in batches of 400.
   */
  async clearCollection(collectionName: string) {
    if (this.isProjectMismatch) return;
    try {
      const snap = await getDocs(collection(db, collectionName));
      if (snap.empty) return;
      const docs = snap.docs;
      for (let i = 0; i < docs.length; i += 400) {
        const chunk = docs.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      console.log(`[FirestoreSync] Cleared ${docs.length} documents from ${collectionName}`);
    } catch (err) {
      console.error(`Failed to clear collection ${collectionName} from Firestore:`, err);
    }
  }

  async clearVisitsBatch(visitIds: string[]) {
    if (this.isProjectMismatch || visitIds.length === 0) return;
    try {
      for (let i = 0; i < visitIds.length; i += 400) {
        const chunk = visitIds.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach((id) => batch.delete(doc(db, 'visits', id)));
        await batch.commit();
      }
    } catch (err) {
      console.error('Failed to batch delete visits from Firestore:', err);
    }
  }

  async clearCookieLogsBatch(logIds: string[]) {
    if (this.isProjectMismatch || logIds.length === 0) return;
    try {
      for (let i = 0; i < logIds.length; i += 400) {
        const chunk = logIds.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach((id) => batch.delete(doc(db, 'cookie_logs', id)));
        await batch.commit();
      }
    } catch (err) {
      console.error('Failed to batch delete cookie logs from Firestore:', err);
    }
  }

  async clearGachaLogsBatch(logIds: string[]) {
    if (this.isProjectMismatch || logIds.length === 0) return;
    try {
      for (let i = 0; i < logIds.length; i += 400) {
        const chunk = logIds.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach((id) => batch.delete(doc(db, 'gacha_logs', id)));
        await batch.commit();
      }
    } catch (err) {
      console.error('Failed to batch delete gacha logs from Firestore:', err);
    }
  }

  async clearEmotionLogsBatch(logIds: string[]) {
    if (this.isProjectMismatch || logIds.length === 0) return;
    try {
      for (let i = 0; i < logIds.length; i += 400) {
        const chunk = logIds.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach((id) => batch.delete(doc(db, 'emotion_logs', id)));
        await batch.commit();
      }
    } catch (err) {
      console.error('Failed to batch delete emotion logs from Firestore:', err);
    }
  }
}

export const FirestoreSync = new FirestoreSyncManager();
