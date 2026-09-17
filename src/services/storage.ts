import {
  Student,
  SchoolClass,
  Visit,
  VirtualCondition,
  CookieLog,
  GachaLog,
  SavedFortune,
  WorryChallenge,
  NewConditionRequest,
  AppSettings,
  GachaPrize,
  AssessmentResult,
  DailyMissionCheckIn,
  MissionItemCheck,
  Fortune,
  EmotionLog
} from '../types';
import { INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_VISITS, DEFAULT_SETTINGS, GACHA_PRIZES, INITIAL_COOKIE_LOGS } from '../data/initialData';
import { VIRTUAL_CONDITIONS } from '../data/conditions';
import { CATEGORIES, normalizeCategory, getCategoryFormatted } from '../data/categories';
import { FirestoreSync } from './firestoreSync';
import { DataSafetyService } from './dataSafety';

const STORAGE_KEYS = {
  CLASSES: 'healing_pharmacy_classes',
  STUDENTS: 'healing_pharmacy_students',
  VISITS: 'healing_pharmacy_visits',
  CONDITIONS: 'healing_pharmacy_conditions',
  COOKIE_LOGS: 'healing_pharmacy_cookie_logs',
  GACHA_LOGS: 'healing_pharmacy_gacha_logs',
  SAVED_FORTUNES: 'healing_pharmacy_saved_fortunes',
  WORRY_CHALLENGES: 'healing_pharmacy_worry_challenges',
  NEW_CONDITION_REQUESTS: 'healing_pharmacy_new_conditions',
  SETTINGS: 'healing_pharmacy_settings',
  EMOTION_LOGS: 'healing_pharmacy_emotion_logs',
  CURRENT_STUDENT_ID: 'healing_pharmacy_current_student_id',
  TEACHER_PASSWORD: 'healing_pharmacy_teacher_password'
};

function getStoredItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return defaultValue;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined' || raw === 'null') return defaultValue;
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return defaultValue;
    // Auto-heal if an array is expected but non-array was stored
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      console.warn(`Type mismatch for ${key}: expected array, resetting to default.`);
      setStoredItem(key, defaultValue);
      return defaultValue;
    }
    return parsed;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
    // Handle QuotaExceededError defensively by trimming transient log collections
    try {
      if (key === STORAGE_KEYS.COOKIE_LOGS && Array.isArray(value)) {
        localStorage.setItem(key, JSON.stringify(value.slice(0, 100)));
      } else if (key === STORAGE_KEYS.GACHA_LOGS && Array.isArray(value)) {
        localStorage.setItem(key, JSON.stringify(value.slice(0, 50)));
      } else if (key === STORAGE_KEYS.NEW_CONDITION_REQUESTS && Array.isArray(value)) {
        localStorage.setItem(key, JSON.stringify(value.slice(0, 50)));
      }
    } catch (quotaErr) {
      console.error(`Critical storage quota error for ${key}:`, quotaErr);
    }
  }
}

export class StorageService {
  static init() {
    // 0. Auto-healing safeguard: check if data was accidentally cleared
    DataSafetyService.autoHealIfCorrupted();

    // 1. Local fallback initial check
    if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
      setStoredItem(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      setStoredItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VISITS)) {
      setStoredItem(STORAGE_KEYS.VISITS, INITIAL_VISITS);
    }
    const existingConds = getStoredItem<VirtualCondition[]>(STORAGE_KEYS.CONDITIONS, []);
    if (!existingConds || existingConds.length < 130 || existingConds.some((c) => !(c.category || c.categoryId))) {
      setStoredItem(STORAGE_KEYS.CONDITIONS, VIRTUAL_CONDITIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      setStoredItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COOKIE_LOGS)) {
      setStoredItem(STORAGE_KEYS.COOKIE_LOGS, INITIAL_COOKIE_LOGS);
    }

    // Take baseline snapshot
    DataSafetyService.createSnapshot('앱 부팅 시점 자동 스냅샷');

    // 2. Initialize Firestore Cloud Real-time Synchronization
    FirestoreSync.init(
      (cloudStudents) => {
        setStoredItem(STORAGE_KEYS.STUDENTS, cloudStudents);
      },
      (cloudClasses) => {
        setStoredItem(STORAGE_KEYS.CLASSES, cloudClasses);
      },
      (cloudVisits) => {
        setStoredItem(STORAGE_KEYS.VISITS, cloudVisits);
      },
      (cloudCookieLogs) => {
        setStoredItem(STORAGE_KEYS.COOKIE_LOGS, cloudCookieLogs);
      },
      (cloudGachaLogs) => {
        setStoredItem(STORAGE_KEYS.GACHA_LOGS, cloudGachaLogs);
      },
      (cloudSettings) => {
        setStoredItem(STORAGE_KEYS.SETTINGS, cloudSettings);
      },
      (cloudNewConditions) => {
        setStoredItem(STORAGE_KEYS.NEW_CONDITION_REQUESTS, cloudNewConditions);
      },
      (cloudEmotionLogs) => {
        setStoredItem(STORAGE_KEYS.EMOTION_LOGS, cloudEmotionLogs);
      }
    );
  }

  // Subscribe to real-time cloud data updates
  static subscribe(listener: () => void): () => void {
    return FirestoreSync.subscribe(listener);
  }

  static isCloudConnected(): boolean {
    return FirestoreSync.isConnected;
  }

  static getLastSyncTime(): string | null {
    return FirestoreSync.lastSyncTime;
  }

  // Classes
  static getClasses(): SchoolClass[] {
    return getStoredItem(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  }

  static saveClasses(classes: SchoolClass[]) {
    setStoredItem(STORAGE_KEYS.CLASSES, classes);
    FirestoreSync.saveClasses(classes);
  }

  // Students
  static getStudents(): Student[] {
    return getStoredItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }

  static saveStudents(students: Student[]) {
    setStoredItem(STORAGE_KEYS.STUDENTS, students);
    FirestoreSync.saveStudentsBatch(students);
  }

  static getStudentById(id: string): Student | undefined {
    const students = this.getStudents();
    return students.find((s) => s.id === id);
  }

  static updateStudent(studentId: string, updates: Partial<Student>): Student | null {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.id === studentId);
    if (idx === -1) return null;
    students[idx] = { ...students[idx], ...updates };
    setStoredItem(STORAGE_KEYS.STUDENTS, students);
    FirestoreSync.saveStudent(students[idx]);
    return students[idx];
  }

  static addStudentsBatch(newStudents: Student[]): Student[] {
    const currentStudents = this.getStudents();
    const existingMap = new Map(currentStudents.map(s => [s.id, s]));

    newStudents.forEach(st => {
      existingMap.set(st.id, {
        ...existingMap.get(st.id),
        ...st,
        cookieBalance: existingMap.get(st.id)?.cookieBalance ?? st.cookieBalance ?? 5,
        createdAt: existingMap.get(st.id)?.createdAt ?? st.createdAt ?? new Date().toISOString()
      });
    });

    const updatedList = Array.from(existingMap.values()).sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      if (a.classNum !== b.classNum) return a.classNum - b.classNum;
      return a.number - b.number;
    });

    setStoredItem(STORAGE_KEYS.STUDENTS, updatedList);
    FirestoreSync.saveStudentsBatch(newStudents);
    return updatedList;
  }

  static deleteStudentsBatch(studentIds: string[]): Student[] {
    // Safety guard: create snapshot before destructive batch deletion
    DataSafetyService.createSnapshot(`학생 ${studentIds.length}명 일괄 삭제 전 안전 백업`, true);

    const currentStudents = this.getStudents();
    const idSet = new Set(studentIds);
    const updated = currentStudents.filter(s => !idSet.has(s.id));
    setStoredItem(STORAGE_KEYS.STUDENTS, updated);
    FirestoreSync.deleteStudentsBatch(studentIds);

    // Also remove visits and cookie logs for deleted students
    try {
      const currentVisits = this.getVisits();
      const toDeleteVisits = currentVisits.filter(v => idSet.has(v.studentId));
      toDeleteVisits.forEach(v => FirestoreSync.deleteVisit(v.visitId));

      const updatedVisits = currentVisits.filter(v => !idSet.has(v.studentId));
      setStoredItem(STORAGE_KEYS.VISITS, updatedVisits);

      const currentLogs = this.getCookieLogs();
      const updatedLogs = currentLogs.filter(l => !idSet.has(l.studentId));
      setStoredItem(STORAGE_KEYS.COOKIE_LOGS, updatedLogs);
    } catch (err) {
      console.warn('Error cascading student deletion:', err);
    }

    return updated;
  }

  static deleteStudentsByClass(grade: number, classNum: number): Student[] {
    const currentStudents = this.getStudents();
    const toDeleteIds = currentStudents
      .filter(s => s.grade === grade && s.classNum === classNum)
      .map(s => s.id);
    return this.deleteStudentsBatch(toDeleteIds);
  }

  // Student PIN / Password Management
  static resetStudentPin(studentId: string, defaultPin: string = '0000'): Student | null {
    return this.updateStudent(studentId, { pin: defaultPin });
  }

  static resetStudentsPinBatch(studentIds: string[], defaultPin: string = '0000'): number {
    let count = 0;
    studentIds.forEach((id) => {
      const res = this.resetStudentPin(id, defaultPin);
      if (res) count++;
    });
    return count;
  }

  static updateStudentPin(studentId: string, newPin: string): Student | null {
    const trimmed = (newPin || '').trim();
    if (!trimmed) return null;
    return this.updateStudent(studentId, { pin: trimmed });
  }

  // Teacher Password Management
  static getTeacherPassword(): string {
    return getStoredItem<string>(STORAGE_KEYS.TEACHER_PASSWORD, '1234');
  }

  static setTeacherPassword(newPassword: string): boolean {
    const trimmed = (newPassword || '').trim();
    if (trimmed.length < 4) return false;
    setStoredItem(STORAGE_KEYS.TEACHER_PASSWORD, trimmed);
    FirestoreSync.notify();
    return true;
  }

  // Privacy Consent & Assessment
  static savePrivacyConsent(studentId: string): Student | null {
    return this.updateStudent(studentId, {
      privacyConsent: {
        agreed: true,
        agreedAt: new Date().toISOString(),
        guardianAgreed: true
      }
    });
  }

  static savePreTest(studentId: string, result: AssessmentResult): Student | null {
    // Also give +2 bonus cookies for completing pre-test
    this.addCookieLog(studentId, 2, '사회정서 사전검사 참여 완료 보너스');
    return this.updateStudent(studentId, { preTest: result });
  }

  static savePostTest(studentId: string, result: AssessmentResult): Student | null {
    // Also give +3 bonus cookies for completing post-test
    this.addCookieLog(studentId, 3, '사회정서 사후검사 참여 완료 보너스');
    return this.updateStudent(studentId, { postTest: result });
  }

  static setPostTestActive(active: boolean): AppSettings {
    const settings = this.getSettings();
    const updated: AppSettings = {
      ...settings,
      postTestActive: active,
      postTestActivatedAt: active ? new Date().toISOString() : undefined
    };
    this.saveSettings(updated);
    return updated;
  }

  // Daily Mission Check-in
  static recordDailyMissionCheckIn(
    visitId: string,
    dayNumber: number,
    missionId: string,
    missionTitle: string,
    note?: string,
    mood?: 'great' | 'good' | 'neutral' | 'tired' | 'stressed',
    items?: MissionItemCheck[]
  ): { visit: Visit; bonusCookies: number; allThreeCompleted: boolean } | null {
    const visit = this.getVisits().find(v => v.visitId === visitId);
    if (!visit) return null;

    const currentCheckIns = visit.dailyCheckIns ? [...visit.dailyCheckIns] : [];
    const existingIdx = currentCheckIns.findIndex(c => c.day === dayNumber);
    const isEdit = existingIdx !== -1;

    const allThreeCompleted = !!(items && items.length >= 3 && items.every(it => it.completed));

    const checkInRecord: DailyMissionCheckIn = {
      day: dayNumber,
      date: isEdit && currentCheckIns[existingIdx].date ? currentCheckIns[existingIdx].date : new Date().toISOString().split('T')[0],
      missionId,
      missionTitle,
      completed: true,
      completedAt: new Date().toISOString(),
      note: note || '오늘의 미션을 성공적으로 실천했습니다.',
      mood: mood || 'good',
      items: items || [],
      allCompleted: allThreeCompleted
    };

    if (isEdit) {
      currentCheckIns[existingIdx] = checkInRecord;
    } else {
      currentCheckIns.push(checkInRecord);
    }
    currentCheckIns.sort((a, b) => a.day - b.day);

    let bonusCookies = 0;
    // Only give cookies on fresh check-ins, NOT on edits!
    if (!isEdit) {
      // Base +1 cookie for daily check-in
      this.addCookieLog(visit.studentId, 1, `${dayNumber}일차 행동처방 미션 실천 (+1쿠키)`);

      // 1, 3, 5회 주간 마일스톤 보너스 쿠키 (주말 제외 5일제)
      if (dayNumber === 1) {
        bonusCookies += 1;
        this.addCookieLog(visit.studentId, 1, `🌱 1회차 실천 달성 보너스 (+1쿠키)`);
      } else if (dayNumber === 3) {
        bonusCookies += 1;
        this.addCookieLog(visit.studentId, 1, `🔥 3회차 꾸준 실천 보너스 (+1쿠키)`);
      } else if (dayNumber === 5) {
        bonusCookies += 2;
        this.addCookieLog(visit.studentId, 2, `👑 5일 주간 루틴 완주 축하 보너스 (+2쿠키)`);
      }

      // Special bonus for completing ALL 3 missions of the day!
      if (allThreeCompleted) {
        bonusCookies += 1;
        this.addCookieLog(visit.studentId, 1, `🎯 ${dayNumber}일차 3개 미션 완벽 실천 올클리어 보너스 (+1쿠키)`);
      }
    }

    const updated = this.updateVisit(visitId, { dailyCheckIns: currentCheckIns });
    return updated ? { visit: updated, bonusCookies, allThreeCompleted } : null;
  }

  // Daily 1-time limit for Mind Card (Fortune) and Worry Gacha
  static getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  static getTodayMindCard(studentId: string): { date: string; fortune: Fortune } | null {
    const key = `hp_today_mindcard_${studentId}`;
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      const parsed = JSON.parse(data);
      if (parsed.date === this.getTodayString()) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  static saveTodayMindCard(studentId: string, fortune: Fortune) {
    const key = `hp_today_mindcard_${studentId}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        date: this.getTodayString(),
        fortune,
        drawnAt: new Date().toISOString()
      })
    );
  }

  static getTodayWorryChallenge(studentId: string): { date: string; hint: string } | null {
    const key = `hp_today_worry_${studentId}`;
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      const parsed = JSON.parse(data);
      if (parsed.date === this.getTodayString()) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  static getWorryChallengeByDate(studentId: string, date: string): { date: string; hint: string; drawnAt?: string } | null {
    // Check in history map
    const histKey = `hp_worry_history_${studentId}`;
    const data = localStorage.getItem(histKey);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed && parsed[date]) {
          return parsed[date];
        }
      } catch {}
    }
    // Fallback to today record
    const today = this.getTodayWorryChallenge(studentId);
    if (today && today.date === date) {
      return { date: today.date, hint: today.hint };
    }
    return null;
  }

  static getAllWorryChallengesHistory(studentId: string): { date: string; hint: string; drawnAt: string }[] {
    const histKey = `hp_worry_history_${studentId}`;
    const data = localStorage.getItem(histKey);
    const list: { date: string; hint: string; drawnAt: string }[] = [];
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          Object.values(parsed).forEach((item: any) => {
            if (item && item.hint && item.date) {
              list.push(item);
            }
          });
        }
      } catch {}
    }
    // Also merge with today if not present
    const today = this.getTodayWorryChallenge(studentId);
    if (today && !list.some((i) => i.date === today.date)) {
      list.push({ date: today.date, hint: today.hint, drawnAt: new Date().toISOString() });
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static saveTodayWorryChallenge(studentId: string, hint: string) {
    const todayStr = this.getTodayString();
    const key = `hp_today_worry_${studentId}`;
    const record = {
      date: todayStr,
      hint,
      drawnAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(record));

    // Save to history map
    const histKey = `hp_worry_history_${studentId}`;
    let history: Record<string, typeof record> = {};
    const existing = localStorage.getItem(histKey);
    if (existing) {
      try {
        history = JSON.parse(existing) || {};
      } catch {}
    }
    history[todayStr] = record;
    localStorage.setItem(histKey, JSON.stringify(history));

    // Dispatch global event for instant UI reactive sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hp:worry-gacha-updated', { detail: { studentId, hint, date: todayStr } }));
    }
  }

  // Current logged in student
  static getCurrentStudentId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT_ID);
  }

  static setCurrentStudentId(studentId: string | null) {
    if (studentId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT_ID, studentId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT_ID);
    }
  }

  // Conditions
  static getConditions(): VirtualCondition[] {
    const stored = getStoredItem<VirtualCondition[]>(STORAGE_KEYS.CONDITIONS, VIRTUAL_CONDITIONS);
    if (!stored || stored.length === 0) return VIRTUAL_CONDITIONS;
    const canonicalMap = new Map(VIRTUAL_CONDITIONS.map((c) => [c.conditionId, c]));
    return stored.map((s) => {
      const canonical = canonicalMap.get(s.conditionId);
      if (canonical) {
        return {
          ...s,
          categoryId: canonical.categoryId,
          category: canonical.categoryId,
          categoryLabel: canonical.categoryLabel,
          categoryName: canonical.categoryName,
          categoryIcon: canonical.categoryIcon,
          name: canonical.name,
          summary: canonical.summary,
          prescriptionMedicineName: canonical.prescriptionMedicineName,
          prescriptionAdvice: canonical.prescriptionAdvice,
          prescriptionCandidates: canonical.prescriptionCandidates,
          checkItemsSample: canonical.checkItemsSample
        };
      }
      const catNorm = normalizeCategory(s.categoryId || s.category) as any;
      return {
        ...s,
        categoryId: catNorm,
        category: catNorm,
        categoryLabel: getCategoryFormatted(catNorm)
      };
    });
  }

  static saveConditions(conditions: VirtualCondition[]) {
    setStoredItem(STORAGE_KEYS.CONDITIONS, conditions);
  }

  static getConditionById(conditionId: string): VirtualCondition | undefined {
    const conditions = this.getConditions();
    return conditions.find((c) => c.conditionId === conditionId);
  }

  // Visits
  static getVisits(): Visit[] {
    return getStoredItem(STORAGE_KEYS.VISITS, INITIAL_VISITS);
  }

  static saveVisits(visits: Visit[]) {
    setStoredItem(STORAGE_KEYS.VISITS, visits);
    visits.forEach((v) => FirestoreSync.saveVisit(v));
  }

  static getActiveVisitForStudent(studentId: string): Visit | undefined {
    const visits = this.getVisits();
    return visits.find((v) => v.studentId === studentId && v.status === 'prescribed');
  }

  static getVisitsForStudent(studentId: string): Visit[] {
    const visits = this.getVisits();
    return visits.filter((v) => v.studentId === studentId);
  }

  static createVisit(newVisit: Visit) {
    const visits = this.getVisits();
    visits.unshift(newVisit);
    setStoredItem(STORAGE_KEYS.VISITS, visits);
    FirestoreSync.saveVisit(newVisit);
    DataSafetyService.createSnapshot(`처방전 발급: ${newVisit.studentName} (${newVisit.primaryConditionName})`);
    return newVisit;
  }

  static updateVisit(visitId: string, updates: Partial<Visit>): Visit | null {
    const visits = this.getVisits();
    const idx = visits.findIndex((v) => v.visitId === visitId);
    if (idx === -1) return null;
    // Defensive merge preserving critical immutable keys
    visits[idx] = {
      ...visits[idx],
      ...updates,
      visitId: visits[idx].visitId,
      studentId: visits[idx].studentId,
      createdAt: visits[idx].createdAt
    };
    setStoredItem(STORAGE_KEYS.VISITS, visits);
    FirestoreSync.saveVisit(visits[idx]);
    FirestoreSync.notify();
    DataSafetyService.createSnapshot(`처방전 실천/상태 업데이트 (${visitId})`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('school_mind_pharmacy_storage_updated', {
          detail: { key: 'visits', visitId }
        })
      );
    }
    return visits[idx];
  }

  static confirmPhysicalMedicine(visitId: string, teacherName: string = '담당 선생님'): Visit | null {
    const visits = this.getVisits();
    const visit = visits.find((v) => v.visitId === visitId);
    if (!visit) return null;

    // If cookies weren't given yet, reward cookies
    if (!visit.rewardGiven) {
      this.addCookieLog(
        visit.studentId,
        3,
        `실물 마음 약(간식) 수령 확인 완료 (+3 칭찬쿠키)`
      );
    }

    return this.updateVisit(visitId, {
      rewardGiven: true,
      rewardGivenAt: new Date().toISOString(),
      rewardTeacherName: teacherName,
      status: 'rewarded',
      rewardSnackNote: '선생님 실물 마음 약(간식) 수령 확인 완료'
    });
  }

  static cancelPhysicalMedicine(visitId: string): Visit | null {
    return this.updateVisit(visitId, {
      rewardGiven: false,
      rewardGivenAt: undefined,
      rewardTeacherName: undefined,
      status: 'submitted',
      rewardSnackNote: '실물 마음 약 수령 대기 중'
    });
  }

  static confirmPhysicalMedicineBatch(visitIds: string[], teacherName: string = '담당 선생님'): Visit[] {
    const updated: Visit[] = [];
    for (const vid of visitIds) {
      const res = this.confirmPhysicalMedicine(vid, teacherName);
      if (res) updated.push(res);
    }
    return updated;
  }

  // Visit day simulation for testing and evaluations
  static getVisitSimulatedDays(visitId: string): number | null {
    try {
      const raw = localStorage.getItem(`hp_sim_days_${visitId}`);
      if (!raw) return null;
      const n = parseInt(raw, 10);
      return isNaN(n) ? null : n;
    } catch {
      return null;
    }
  }

  static setVisitSimulatedDays(visitId: string, days: number): void {
    try {
      localStorage.setItem(`hp_sim_days_${visitId}`, days.toString());
    } catch (e) {
      console.error('Failed to set simulated days:', e);
    }
  }

  static clearVisitSimulatedDays(visitId: string): void {
    try {
      localStorage.removeItem(`hp_sim_days_${visitId}`);
    } catch (e) {
      console.error('Failed to clear simulated days:', e);
    }
  }

  // Cookie Logs
  static getCookieLogs(): CookieLog[] {
    return getStoredItem(STORAGE_KEYS.COOKIE_LOGS, INITIAL_COOKIE_LOGS);
  }

  static getCookieLogsForStudent(studentId: string): CookieLog[] {
    return this.getCookieLogs().filter((l) => l.studentId === studentId);
  }

  static batchAddCookieLogs(
    studentIds: string[],
    amount: number,
    reason: string
  ): { updatedCount: number; logs: CookieLog[] } {
    let count = 0;
    const createdLogs: CookieLog[] = [];
    studentIds.forEach((id) => {
      const res = this.addCookieLog(id, amount, reason);
      if (res) count++;
    });
    return { updatedCount: count, logs: createdLogs };
  }

  static addCookieLog(studentId: string, amount: number, reason: string): Student | null {
    const student = this.getStudentById(studentId);
    if (!student) return null;

    const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    const newBalance = Math.max(0, (student.cookieBalance || 0) + safeAmount);
    this.updateStudent(studentId, { cookieBalance: newBalance });

    const logs = this.getCookieLogs();
    const newLog: CookieLog = {
      id: `CK-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      studentId,
      studentName: student.name,
      amount: safeAmount,
      reason,
      balanceAfter: newBalance,
      createdAt: new Date().toISOString()
    };
    // Keep max 200 logs to prevent localStorage quota exhaustion
    const updatedLogs = [newLog, ...logs].slice(0, 200);
    setStoredItem(STORAGE_KEYS.COOKIE_LOGS, updatedLogs);
    FirestoreSync.addCookieLog(newLog);
    DataSafetyService.createSnapshot(`칭찬쿠키 변동: ${student.name} (${safeAmount > 0 ? `+${safeAmount}` : safeAmount}개)`);

    return this.getStudentById(studentId) || null;
  }

  // Reset Cookies for Single Student (preserves all other data!)
  static resetStudentCookies(
    studentId: string,
    reason: string = '선생님에 의한 쿠키 초기화 (0개로 변경)',
    clearLogs: boolean = false,
    clearCumulative: boolean = false
  ): Student | null {
    const student = this.getStudentById(studentId);
    if (!student) return null;

    const oldBalance = student.cookieBalance || 0;
    this.updateStudent(studentId, { cookieBalance: 0 });

    if (clearLogs || clearCumulative) {
      const logs = this.getCookieLogs().filter((l) => l.studentId !== studentId);
      setStoredItem(STORAGE_KEYS.COOKIE_LOGS, logs);
    } else if (oldBalance !== 0) {
      const logs = this.getCookieLogs();
      const newLog: CookieLog = {
        id: `CK-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        studentId,
        studentName: student.name,
        amount: -oldBalance,
        reason,
        balanceAfter: 0,
        createdAt: new Date().toISOString()
      };
      const updatedLogs = [newLog, ...logs].slice(0, 200);
      setStoredItem(STORAGE_KEYS.COOKIE_LOGS, updatedLogs);
      FirestoreSync.addCookieLog(newLog);
    }

    DataSafetyService.createSnapshot(`칭찬쿠키 초기화: ${student.name} (0개로 변경)`);
    return this.getStudentById(studentId) || null;
  }

  // Batch Reset Cookies for multiple students (preserves all other data!)
  static resetStudentsCookiesBatch(
    studentIds: string[],
    reason: string = '선생님에 의한 학생 쿠키 일괄 초기화 (0개)',
    clearLogs: boolean = false
  ): { updatedCount: number } {
    let count = 0;
    const now = new Date().toISOString();
    const students = this.getStudents();
    const idSet = new Set(studentIds);
    const logs = this.getCookieLogs();
    const newLogs: CookieLog[] = [];

    const updatedStudents = students.map((st) => {
      if (idSet.has(st.id)) {
        count++;
        const oldBalance = st.cookieBalance || 0;
        if (!clearLogs && oldBalance !== 0) {
          const newLog: CookieLog = {
            id: `CK-${Date.now()}-${Math.random().toString(36).substr(2, 4)}-${count}`,
            studentId: st.id,
            studentName: st.name,
            amount: -oldBalance,
            reason,
            balanceAfter: 0,
            createdAt: now
          };
          newLogs.push(newLog);
          FirestoreSync.addCookieLog(newLog);
        }
        return { ...st, cookieBalance: 0 };
      }
      return st;
    });

    setStoredItem(STORAGE_KEYS.STUDENTS, updatedStudents);
    const targetStudents = updatedStudents.filter((s) => idSet.has(s.id));
    FirestoreSync.saveStudentsBatch(targetStudents);

    if (clearLogs) {
      const remainingLogs = logs.filter((l) => !idSet.has(l.studentId));
      setStoredItem(STORAGE_KEYS.COOKIE_LOGS, remainingLogs);
    } else if (newLogs.length > 0) {
      const mergedLogs = [...newLogs, ...logs].slice(0, 200);
      setStoredItem(STORAGE_KEYS.COOKIE_LOGS, mergedLogs);
    }

    DataSafetyService.createSnapshot(`칭찬쿠키 일괄 초기화 (${count}명)`);
    return { updatedCount: count };
  }

  // Reset All Students' Cookies across the school (preserves all other data!)
  static resetAllStudentsCookies(
    reason: string = '선생님에 의한 전교생 쿠키 전체 초기화 (0개)',
    clearLogs: boolean = false
  ): { updatedCount: number } {
    const students = this.getStudents();
    const allIds = students.map((s) => s.id);
    return this.resetStudentsCookiesBatch(allIds, reason, clearLogs);
  }

  // Clear all cookie logs history (preserves all other data!)
  static clearCookieLogs(): void {
    setStoredItem(STORAGE_KEYS.COOKIE_LOGS, []);
    DataSafetyService.createSnapshot('칭찬쿠키 변동 로그 내역 전체 초기화');
  }

  // Reset Cumulative Rewarded Cookies ('누적 지급 칭찬쿠키' +0개 초기화)
  static resetCumulativeRewarded(targetStudentIds?: string[]): { affectedLogsCount: number } {
    DataSafetyService.createSnapshot('누적 지급 칭찬쿠키 통계 초기화');
    const logs = this.getCookieLogs();
    const idSet = targetStudentIds && targetStudentIds.length > 0 ? new Set(targetStudentIds) : null;

    const remainingLogs = logs.filter((log) => {
      if (idSet && !idSet.has(log.studentId)) return true;
      return log.amount <= 0; // retain deductions/spins, clear rewards
    });

    const affectedLogsCount = logs.length - remainingLogs.length;
    setStoredItem(STORAGE_KEYS.COOKIE_LOGS, remainingLogs);
    return { affectedLogsCount };
  }

  // Reset Cumulative Spent Cookies ('누적 쿠키 사용(가챠)' -0개 초기화)
  static resetCumulativeSpent(
    targetStudentIds?: string[],
    clearGachaLogs: boolean = false
  ): { affectedLogsCount: number } {
    DataSafetyService.createSnapshot('누적 쿠키 사용(가챠) 통계 초기화');
    const logs = this.getCookieLogs();
    const idSet = targetStudentIds && targetStudentIds.length > 0 ? new Set(targetStudentIds) : null;

    const remainingLogs = logs.filter((log) => {
      if (idSet && !idSet.has(log.studentId)) return true;
      return log.amount >= 0; // retain rewards, clear deductions
    });

    const affectedLogsCount = logs.length - remainingLogs.length;
    setStoredItem(STORAGE_KEYS.COOKIE_LOGS, remainingLogs);

    if (clearGachaLogs) {
      if (idSet) {
        const remainingGacha = this.getGachaLogs().filter((gl) => !idSet.has(gl.studentId));
        setStoredItem(STORAGE_KEYS.GACHA_LOGS, remainingGacha);
      } else {
        setStoredItem(STORAGE_KEYS.GACHA_LOGS, []);
      }
    }

    return { affectedLogsCount };
  }

  // Comprehensive Multi-Option Reset for Cookies and Cumulative Stats
  static resetCookieSystemComprehensive(options: {
    targetStudentIds?: string[];
    resetBalances: boolean;
    resetRewarded: boolean;
    resetSpent: boolean;
    clearGachaLogs?: boolean;
    reason?: string;
  }): {
    updatedStudentsCount: number;
    clearedLogsCount: number;
  } {
    DataSafetyService.createSnapshot('칭찬쿠키 및 누적 통계 종합 초기화');
    const {
      targetStudentIds,
      resetBalances,
      resetRewarded,
      resetSpent,
      clearGachaLogs = false
    } = options;

    const idSet = targetStudentIds && targetStudentIds.length > 0 ? new Set(targetStudentIds) : null;
    let updatedStudentsCount = 0;

    // 1. Reset balances if requested
    if (resetBalances) {
      const students = this.getStudents();
      const updatedStudents = students.map((st) => {
        if (!idSet || idSet.has(st.id)) {
          if ((st.cookieBalance || 0) !== 0) updatedStudentsCount++;
          return { ...st, cookieBalance: 0 };
        }
        return st;
      });
      setStoredItem(STORAGE_KEYS.STUDENTS, updatedStudents);
      const affected = updatedStudents.filter((s) => !idSet || idSet.has(s.id));
      FirestoreSync.saveStudentsBatch(affected);
    }

    // 2. Filter cookie logs based on resetRewarded & resetSpent
    const currentLogs = this.getCookieLogs();
    const remainingLogs = currentLogs.filter((log) => {
      if (idSet && !idSet.has(log.studentId)) return true;
      if (resetRewarded && log.amount > 0) return false;
      if (resetSpent && log.amount < 0) return false;
      if (resetBalances && resetRewarded && resetSpent) return false;
      return true;
    });

    const clearedLogsCount = currentLogs.length - remainingLogs.length;
    setStoredItem(STORAGE_KEYS.COOKIE_LOGS, remainingLogs);

    // 3. Clear gacha logs if requested
    if (clearGachaLogs) {
      if (idSet) {
        const remainingGacha = this.getGachaLogs().filter((gl) => !idSet.has(gl.studentId));
        setStoredItem(STORAGE_KEYS.GACHA_LOGS, remainingGacha);
      } else {
        setStoredItem(STORAGE_KEYS.GACHA_LOGS, []);
      }
    }

    return {
      updatedStudentsCount,
      clearedLogsCount
    };
  }

  // Clear Gacha Logs
  static clearGachaLogs(targetStudentIds?: string[]): void {
    if (targetStudentIds && targetStudentIds.length > 0) {
      const idSet = new Set(targetStudentIds);
      const remaining = this.getGachaLogs().filter((l) => !idSet.has(l.studentId));
      setStoredItem(STORAGE_KEYS.GACHA_LOGS, remaining);
    } else {
      setStoredItem(STORAGE_KEYS.GACHA_LOGS, []);
    }
    DataSafetyService.createSnapshot('칭찬가챠 뽑기 기록 초기화');
  }

  // Gacha System
  static getGachaLogs(): GachaLog[] {
    return getStoredItem(STORAGE_KEYS.GACHA_LOGS, []);
  }

  static spinGacha(studentId: string, prize: GachaPrize): { student: Student; log: GachaLog } | null {
    const student = this.getStudentById(studentId);
    if (!student) return null;

    const settings = this.getSettings();
    const price = settings.gachaCookiePrice || 3;

    if (student.cookieBalance < price) {
      throw new Error(`칭찬쿠키가 부족해요! (필요: ${price}개, 보유: ${student.cookieBalance}개)`);
    }

    // Deduct cookies, handle bonus prize
    let newCookieBalance = student.cookieBalance - price;

    if (prize.id === 'GP-05') newCookieBalance += 1;
    if (prize.id === 'GP-06') newCookieBalance += 3;
    if (prize.id === 'GP-07') newCookieBalance += 3; // 칭찬쿠키 +3개 대박 선물!

    const updatedStudent = this.updateStudent(studentId, {
      cookieBalance: newCookieBalance
    })!;

    // Log cookie deduction
    const cookieLogs = this.getCookieLogs();
    const cookieDeductLog: CookieLog = {
      id: `CK-SPIN-${Date.now()}`,
      studentId,
      studentName: student.name,
      amount: -price,
      reason: `칭찬가챠 1회 이용 (${prize.name})`,
      balanceAfter: newCookieBalance,
      createdAt: new Date().toISOString()
    };
    cookieLogs.unshift(cookieDeductLog);
    setStoredItem(STORAGE_KEYS.COOKIE_LOGS, cookieLogs);
    FirestoreSync.addCookieLog(cookieDeductLog);

    // Log gacha result
    const gachaLogs = this.getGachaLogs();
    const newGachaLog: GachaLog = {
      id: `GACHA-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      studentId,
      studentName: student.name,
      grade: student.grade,
      classNum: student.classNum,
      number: student.number,
      prize,
      claimed: false,
      createdAt: new Date().toISOString()
    };
    gachaLogs.unshift(newGachaLog);
    setStoredItem(STORAGE_KEYS.GACHA_LOGS, gachaLogs);
    FirestoreSync.addGachaLog(newGachaLog);

    return { student: updatedStudent, log: newGachaLog };
  }

  static claimGachaLog(logId: string) {
    const logs = this.getGachaLogs();
    const idx = logs.findIndex((l) => l.id === logId);
    if (idx !== -1) {
      logs[idx].claimed = true;
      logs[idx].claimedAt = new Date().toISOString();
      setStoredItem(STORAGE_KEYS.GACHA_LOGS, logs);
      FirestoreSync.updateGachaLog(logId, { claimed: true, claimedAt: logs[idx].claimedAt });
    }
  }

  // Saved Fortunes
  static getSavedFortunes(studentId: string): SavedFortune[] {
    const all = getStoredItem<SavedFortune[]>(STORAGE_KEYS.SAVED_FORTUNES, []);
    return all.filter((f) => f.id.startsWith(studentId));
  }

  static saveFortune(
    studentId: string,
    fortuneId: string,
    number: number,
    message: string,
    cardMeta?: {
      title?: string;
      romanNumeral?: string;
      archetype?: string;
      icon?: string;
      subText?: string;
      tags?: string[];
      gradient?: string;
    }
  ) {
    const all = getStoredItem<SavedFortune[]>(STORAGE_KEYS.SAVED_FORTUNES, []);
    const exists = all.find((f) => f.id === `${studentId}-${fortuneId}`);
    if (exists) return exists;

    const item: SavedFortune = {
      id: `${studentId}-${fortuneId}`,
      fortuneId,
      number,
      message,
      title: cardMeta?.title,
      romanNumeral: cardMeta?.romanNumeral,
      archetype: cardMeta?.archetype,
      icon: cardMeta?.icon,
      subText: cardMeta?.subText,
      tags: cardMeta?.tags,
      gradient: cardMeta?.gradient,
      isBest: false,
      savedAt: new Date().toISOString()
    };
    all.unshift(item);
    setStoredItem(STORAGE_KEYS.SAVED_FORTUNES, all);
    return item;
  }

  static toggleBestFortune(fortuneRecordId: string) {
    const all = getStoredItem<SavedFortune[]>(STORAGE_KEYS.SAVED_FORTUNES, []);
    const idx = all.findIndex((f) => f.id === fortuneRecordId);
    if (idx !== -1) {
      all[idx].isBest = !all[idx].isBest;
      setStoredItem(STORAGE_KEYS.SAVED_FORTUNES, all);
    }
  }

  // Worry Challenge
  static getWorryChallenges(studentId: string): WorryChallenge[] {
    const all = getStoredItem<WorryChallenge[]>(STORAGE_KEYS.WORRY_CHALLENGES, []);
    return all.filter((w) => w.studentId === studentId);
  }

  static addWorryChallenge(challenge: WorryChallenge) {
    const all = getStoredItem<WorryChallenge[]>(STORAGE_KEYS.WORRY_CHALLENGES, []);
    all.unshift(challenge);
    setStoredItem(STORAGE_KEYS.WORRY_CHALLENGES, all);
  }

  // New Condition Requests (신약개발소)
  static getNewConditionRequests(): NewConditionRequest[] {
    return getStoredItem<NewConditionRequest[]>(STORAGE_KEYS.NEW_CONDITION_REQUESTS, []);
  }

  static hasSubmittedNewConditionToday(studentId: string): boolean {
    const todayStr = this.getTodayString();
    const all = this.getNewConditionRequests();
    return all.some((r) => r.studentId === studentId && r.createdAt.startsWith(todayStr));
  }

  static resetTodayNewConditionSubmission(studentId: string) {
    const todayStr = this.getTodayString();
    const all = this.getNewConditionRequests();
    const filtered = all.filter((r) => !(r.studentId === studentId && r.createdAt.startsWith(todayStr)));
    setStoredItem(STORAGE_KEYS.NEW_CONDITION_REQUESTS, filtered);
  }

  static addNewConditionRequest(req: NewConditionRequest) {
    const all = this.getNewConditionRequests();
    all.unshift(req);
    setStoredItem(STORAGE_KEYS.NEW_CONDITION_REQUESTS, all);
    FirestoreSync.addNewConditionRequest(req);
  }

  static updateNewConditionRequest(requestId: string, updates: Partial<NewConditionRequest>) {
    const all = this.getNewConditionRequests();
    const idx = all.findIndex((r) => r.id === requestId);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates };
      setStoredItem(STORAGE_KEYS.NEW_CONDITION_REQUESTS, all);
      FirestoreSync.updateNewConditionRequest(requestId, updates);
    }
  }

  // Settings
  static getSettings(): AppSettings {
    return getStoredItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  static saveSettings(settings: AppSettings) {
    setStoredItem(STORAGE_KEYS.SETTINGS, settings);
    FirestoreSync.saveSettings(settings);
  }

  // Today's Emotion Calendar Logs
  static getEmotionLogs(studentId?: string): EmotionLog[] {
    const all = getStoredItem<EmotionLog[]>(STORAGE_KEYS.EMOTION_LOGS, []);
    if (!studentId) return all;
    return all.filter((l) => l.studentId === studentId);
  }

  static saveEmotionLog(log: EmotionLog): { success: boolean; isFirstToday: boolean } {
    const all = this.getEmotionLogs();
    // Check if there is already an entry for this student and date
    const existingIdx = all.findIndex((l) => l.studentId === log.studentId && l.date === log.date);
    const isFirstToday = existingIdx === -1;

    if (existingIdx !== -1) {
      all[existingIdx] = { ...all[existingIdx], ...log };
    } else {
      all.push(log);
    }

    setStoredItem(STORAGE_KEYS.EMOTION_LOGS, all);
    FirestoreSync.saveEmotionLog(log);

    // If first record of the day, award +1 Praise Cookie!
    if (isFirstToday) {
      this.addCookieLog(log.studentId, 1, `📅 오늘의 감정 달력 기록 (${log.date})`);
    }

    return { success: true, isFirstToday };
  }

  static syncEmotionLogs(logs: EmotionLog[]) {
    setStoredItem(STORAGE_KEYS.EMOTION_LOGS, logs);
  }

  // Reset to initial
  static resetAllData() {
    // Safety guard: create emergency snapshot before clearing
    DataSafetyService.createSnapshot('전체 데이터 초기화 전 긴급 안전 스냅샷', true);

    localStorage.removeItem(STORAGE_KEYS.CLASSES);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.VISITS);
    localStorage.removeItem(STORAGE_KEYS.CONDITIONS);
    localStorage.removeItem(STORAGE_KEYS.COOKIE_LOGS);
    localStorage.removeItem(STORAGE_KEYS.GACHA_LOGS);
    localStorage.removeItem(STORAGE_KEYS.SAVED_FORTUNES);
    localStorage.removeItem(STORAGE_KEYS.WORRY_CHALLENGES);
    localStorage.removeItem(STORAGE_KEYS.NEW_CONDITION_REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT_ID);
    this.init();
  }

  // --- DATA SAFETY & BACKUP RECOVERY ---
  static exportDataBackup(): void {
    DataSafetyService.exportBackupFile();
    FirestoreSync.recordBackupTimestamp().catch((e) => console.warn('Record backup timestamp notice:', e));
  }

  static async importDataBackup(file: File): Promise<{ success: boolean; message: string }> {
    const res = await DataSafetyService.importBackupFile(file);
    if (res.success) {
      // Sync imported students & visits to Firestore
      const students = this.getStudents();
      const visits = this.getVisits();
      FirestoreSync.saveStudentsBatch(students);
      FirestoreSync.saveVisitsBatch(visits);
      FirestoreSync.recordBackupTimestamp().catch((e) => console.warn('Record backup timestamp notice:', e));
    }
    return res;
  }

  static getSafetyStatus() {
    return DataSafetyService.getSafetyStatus();
  }

  static getSnapshots() {
    return DataSafetyService.getSnapshots();
  }

  static restoreSnapshot(id: string) {
    const res = DataSafetyService.restoreSnapshot(id);
    if (res.success) {
      const students = this.getStudents();
      const visits = this.getVisits();
      FirestoreSync.saveStudentsBatch(students);
      FirestoreSync.saveVisitsBatch(visits);
    }
    return res;
  }

  static createManualSnapshot(reason: string) {
    DataSafetyService.createSnapshot(reason, true);
    FirestoreSync.recordBackupTimestamp().catch((e) => console.warn('Record backup timestamp notice:', e));
  }
}
