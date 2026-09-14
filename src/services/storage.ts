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
import { INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_VISITS, DEFAULT_SETTINGS, GACHA_PRIZES } from '../data/initialData';
import { VIRTUAL_CONDITIONS } from '../data/conditions';
import { FirestoreSync } from './firestoreSync';

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
    if (!localStorage.getItem(STORAGE_KEYS.CONDITIONS)) {
      setStoredItem(STORAGE_KEYS.CONDITIONS, VIRTUAL_CONDITIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      setStoredItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }

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
    return getStoredItem(STORAGE_KEYS.CONDITIONS, VIRTUAL_CONDITIONS);
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
    return getStoredItem(STORAGE_KEYS.COOKIE_LOGS, []);
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

    return this.getStudentById(studentId) || null;
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
}
