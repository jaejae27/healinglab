import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
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

type SyncListener = () => void;

class FirestoreSyncManager {
  private initialized = false;
  private listeners: Set<SyncListener> = new Set();
  public isConnected = false;
  public lastSyncTime: string | null = null;

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.lastSyncTime = new Date().toLocaleTimeString();
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error in FirestoreSync listener:', err);
      }
    });
  }

  async init(
    onStudentsSync: (students: Student[]) => void,
    onClassesSync: (classes: SchoolClass[]) => void,
    onVisitsSync: (visits: Visit[]) => void,
    onCookieLogsSync: (logs: CookieLog[]) => void,
    onGachaLogsSync: (logs: GachaLog[]) => void,
    onSettingsSync: (settings: AppSettings) => void,
    onNewConditionsSync: (requests: NewConditionRequest[]) => void
  ) {
    if (this.initialized) return;
    this.initialized = true;

    try {
      // 1. Seed initial data to Firestore if completely empty
      await this.checkAndSeedDefaults();

      // 2. Setup Real-time Listeners

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
          onVisitsSync(visits);
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
          onCookieLogsSync(logs.slice(0, 300));
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
          onGachaLogsSync(logs);
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

  // Check if Firestore is freshly provisioned and seed initial data
  private async checkAndSeedDefaults() {
    try {
      const studentSnap = await getDocs(collection(db, 'students'));
      if (studentSnap.empty) {
        console.log('Seeding initial students & classes to Firestore...');
        const batch = writeBatch(db);

        // Seed initial students
        INITIAL_STUDENTS.forEach((st) => {
          const ref = doc(db, 'students', st.id);
          batch.set(ref, cleanData(st));
        });

        // Seed initial classes
        INITIAL_CLASSES.forEach((cl) => {
          const ref = doc(db, 'classes', `C-${cl.grade}-${cl.classNum}`);
          batch.set(ref, cleanData(cl));
        });

        // Seed initial visits
        INITIAL_VISITS.forEach((vi) => {
          const ref = doc(db, 'visits', vi.visitId);
          batch.set(ref, cleanData(vi));
        });

        // Seed initial settings
        const settingsRef = doc(db, 'app_settings', 'global');
        batch.set(settingsRef, cleanData(DEFAULT_SETTINGS));

        await batch.commit();
        console.log('Initial Firestore seeding complete.');
      }
    } catch (err) {
      console.warn('Seeding check failed, will rely on local copy until connected:', err);
    }
  }

  // --- WRITE METHODS (Async Cloud Sync) ---

  async saveStudent(student: Student) {
    try {
      await setDoc(doc(db, 'students', student.id), cleanData(student), { merge: true });
    } catch (err) {
      console.error(`Failed to save student ${student.id} to Firestore:`, err);
    }
  }

  async saveStudentsBatch(students: Student[]) {
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
    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch (err) {
      console.error(`Failed to delete student ${studentId} from Firestore:`, err);
    }
  }

  async deleteStudentsBatch(studentIds: string[]) {
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
    try {
      await setDoc(doc(db, 'visits', visit.visitId), cleanData(visit), { merge: true });
    } catch (err) {
      console.error(`Failed to save visit ${visit.visitId} to Firestore:`, err);
    }
  }

  async deleteVisit(visitId: string) {
    try {
      await deleteDoc(doc(db, 'visits', visitId));
    } catch (err) {
      console.error(`Failed to delete visit ${visitId} from Firestore:`, err);
    }
  }

  async addCookieLog(log: CookieLog) {
    try {
      await setDoc(doc(db, 'cookie_logs', log.id), cleanData(log));
    } catch (err) {
      console.error(`Failed to save cookie log ${log.id} to Firestore:`, err);
    }
  }

  async addGachaLog(log: GachaLog) {
    try {
      await setDoc(doc(db, 'gacha_logs', log.id), cleanData(log));
    } catch (err) {
      console.error(`Failed to save gacha log ${log.id} to Firestore:`, err);
    }
  }

  async updateGachaLog(logId: string, updates: Partial<GachaLog>) {
    try {
      await setDoc(doc(db, 'gacha_logs', logId), cleanData(updates), { merge: true });
    } catch (err) {
      console.error(`Failed to update gacha log ${logId} in Firestore:`, err);
    }
  }

  async saveSettings(settings: AppSettings) {
    try {
      await setDoc(doc(db, 'app_settings', 'global'), cleanData(settings), { merge: true });
    } catch (err) {
      console.error('Failed to save settings to Firestore:', err);
    }
  }

  async saveClasses(classes: SchoolClass[]) {
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
    try {
      await setDoc(doc(db, 'new_conditions', req.id), cleanData(req));
    } catch (err) {
      console.error(`Failed to save new condition request ${req.id} to Firestore:`, err);
    }
  }

  async updateNewConditionRequest(requestId: string, updates: Partial<NewConditionRequest>) {
    try {
      await setDoc(doc(db, 'new_conditions', requestId), cleanData(updates), { merge: true });
    } catch (err) {
      console.error(`Failed to update new condition request ${requestId} in Firestore:`, err);
    }
  }

  async saveEmotionLog(log: EmotionLog) {
    try {
      await setDoc(doc(db, 'emotion_logs', log.id), cleanData(log), { merge: true });
    } catch (err) {
      console.error(`Failed to save emotion log ${log.id} to Firestore:`, err);
    }
  }
}

export const FirestoreSync = new FirestoreSyncManager();
