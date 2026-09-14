export type CategoryId =
  | 'self'
  | 'friends'
  | 'study'
  | 'worries'
  | 'emotions'
  | 'vitality'
  | 'future'
  | 'school';

export interface Category {
  id: CategoryId;
  code: string; // S, R, A, W, E, L, G, D
  name: string;
  subName: string;
  icon: string;
  color: string;
  bgLight: string;
  borderColor: string;
  desc: string;
}

export interface PrescriptionCandidate {
  id: string;
  type: 'notice' | 'action' | 'environment';
  title: string;
  description: string;
}

export interface VirtualCondition {
  conditionId: string; // e.g. S-01, A-06
  categoryId: CategoryId;
  name: string; // e.g. 계획만거창해증
  summary: string; // e.g. 계획은 완벽한데 시작이 잘 안 되는 상태
  badge?: string;
  checkItemsSample: string[]; // 3~4 items shown on workbook
  prescriptionCandidates: PrescriptionCandidate[]; // 6 distinct prescriptions
  prescriptionMedicineName: string; // e.g. 일단시작정, 생각정리제
  prescriptionAdvice: string; // Advice printed on reward card
  isStudentProposed?: boolean;
  proposedBy?: string;
  status: 'active' | 'inactive';
}

export interface CheckItem {
  checkId: string;
  categoryId: CategoryId;
  statement: string;
  matches: {
    conditionId: string;
    weight: number;
  }[];
}

export type AssessmentDomainKey =
  | 'self_awareness'
  | 'self_regulation'
  | 'self_care'
  | 'help_seeking'
  | 'empathy_action';

export interface AssessmentQuestion {
  id: string;
  num: number;
  domain: AssessmentDomainKey;
  domainName: string;
  statement: string;
}

export interface DescriptiveAnswers {
  q21_feelings?: string; // 요즘 자주 느끼는 감정 (1~3개 말)
  q22_stressCoping?: string; // 힘들거나 스트레스 받을 때 대처법
  q28_mindChanged?: string; // 힐링약국 전후 마음 대하는 법 달라진 점
  q29_favoritePrescription?: string; // 실생활에서 쓰고 싶은 마음 처방
  q30_friendAction?: string; // 친구가 힘들어할 때 행동 계획
}

export interface AssessmentResult {
  completed: boolean;
  completedAt: string;
  answers: Record<string, number>; // questionId -> 1~5
  totalScore: number; // 100점 만점 환산 (20문항 * 5점)
  averageScore: number; // 5점 척도 평균
  domainScores: Record<string, number>; // domain -> score 1~5
  kpiScore?: number; // 나의 마음 처방 자신감 (1~5)
  descriptiveAnswers?: DescriptiveAnswers;
  programEffectScores?: Record<string, number>; // 사후 프로그램 효과 5문항
  programEffectAverage?: number; // 사후 효과 5문항 평균
}

export interface EmotionLog {
  id: string;
  studentId: string;
  studentName?: string;
  date: string; // YYYY-MM-DD
  mood: 'great' | 'good' | 'neutral' | 'tired' | 'stressed' | 'sad' | 'angry' | 'excited';
  moodLabel: string;
  emoji: string;
  note?: string; // 짧은 메모
  createdAt: string;
}

export interface PrivacyConsent {
  agreed: boolean;
  agreedAt: string;
  guardianAgreed?: boolean;
}

export interface Student {
  id: string;
  grade: number;
  classNum: number;
  number: number;
  name: string;
  cookieBalance: number;
  gachaTickets?: number;
  lastVisitDate?: string;
  createdAt: string;
  privacyConsent?: PrivacyConsent;
  preTest?: AssessmentResult;
  postTest?: AssessmentResult;
}

export interface MissionItemCheck {
  missionId: string;
  missionTitle: string;
  completed: boolean;
  actionNote?: string;
}

export interface DailyMissionCheckIn {
  day: number; // 1 to 5 (주말 제외 5일)
  date: string; // YYYY-MM-DD
  missionId?: string;
  missionTitle?: string;
  completed: boolean;
  completedAt?: string;
  note?: string; // 짧은 한줄 실천 소감
  mood?: 'great' | 'good' | 'neutral' | 'tired' | 'stressed';
  items?: MissionItemCheck[]; // 3개 개별 미션 체크 및 실천 메모
  allCompleted?: boolean; // 3개 모두 완벽 실천 여부
}

export interface ActiveMission {
  missionId: string;
  type: 'notice' | 'action' | 'environment';
  title: string;
  description: string;
  completed?: boolean;
  rating?: number; // 1~5
}

export interface Visit {
  visitId: string;
  studentId: string;
  studentName: string;
  grade: number;
  classNum: number;
  number: number;
  createdAt: string;
  status: 'prescribed' | 'submitted' | 'completed' | 'rewarded';
  categoryId: CategoryId;
  primaryConditionId: string;
  primaryConditionName: string;
  secondaryConditionIds: string[];
  missions: ActiveMission[];
  dailyCheckIns?: DailyMissionCheckIn[]; // 7일 매일 미션 실천 기록
  // Completion data
  submittedAt?: string;
  bestMissionIndex?: number;
  bestMissionIndices?: number[]; // 복수 선택 가능
  participationRate?: number; // 실천 참여율 (%)
  reflectionParticipation?: string; // 참여율에 대한 솔직한 자기 성찰
  reflectionWhy?: string; // 왜 도움이 되었나요?
  willUseAgain?: string; // 다음에도 사용할지?
  reflectionLearned?: string; // 이번 활동을 하며 알게 된 것
  futurePlan?: string; // 다음에 비슷한 상황에서 해보고 싶은 방법
  // Teacher verification
  paperVerified?: boolean; // 교실 종이 워크북 확인
  webVerified?: boolean; // 웹 제출 확인
  rewardGiven?: boolean; // 처방약(간식+카드) 지급 완료
  rewardGivenAt?: string;
  rewardSnackNote?: string;
  isRepeat?: boolean;
  previousEffectiveMission?: string;
}

export interface Fortune {
  id: string; // e.g. CARD #001
  number: number;
  title: string; // e.g. The Rest (온전한 쉼)
  romanNumeral?: string; // e.g. I, II, III
  archetype?: string; // e.g. 치유와 충전
  icon: string; // e.g. 🌙, 🦁, 🌿
  message: string;
  subText?: string;
  element?: string; // e.g. 빛, 바람, 대지, 물, 별
  tags?: string[];
  gradient?: string;
}

export interface SavedFortune {
  id: string;
  fortuneId: string;
  number: number;
  title?: string;
  romanNumeral?: string;
  archetype?: string;
  icon?: string;
  message: string;
  subText?: string;
  tags?: string[];
  gradient?: string;
  isBest: boolean;
  savedAt: string;
}

export interface WorryHint {
  id: string;
  hint: string;
  category: string;
}

export interface WorryChallenge {
  id: string;
  studentId: string;
  hint: string;
  tested: boolean;
  rating?: number; // 1~5
  willUseAgain?: boolean;
  reflection?: string;
  createdAt: string;
}

export interface NewConditionRequest {
  id: string;
  studentId: string;
  studentName: string;
  grade?: number;
  classNum?: number;
  number?: number;
  suggestedName: string;
  categoryId: CategoryId;
  whenAppears: string;
  helpNeeded: string;
  missionIdea: string;
  missionIdeas?: string[];
  rewardCookies?: number;
  status: 'new' | 'pending' | 'reviewing' | 'accepted' | 'approved' | 'merged' | 'hold' | 'rejected';
  assignedId?: string;
  assignedConditionId?: string;
  teacherNote?: string;
  createdAt: string;
}

export interface CookieLog {
  id: string;
  studentId: string;
  studentName: string;
  amount: number; // e.g. +1, +2, +3, -3
  reason: string;
  balanceAfter: number;
  createdAt: string;
}

export interface GachaPrize {
  id: string;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'super_rare';
  description: string;
}

export interface GachaLog {
  id: string;
  studentId: string;
  studentName: string;
  grade: number;
  classNum: number;
  number: number;
  prize: GachaPrize;
  claimed: boolean;
  claimedAt?: string;
  createdAt: string;
}

export interface SchoolClass {
  grade: number;
  classNum: number;
  active: boolean;
}

export interface AppSettings {
  startDate: string;
  endDate: string;
  allowRepeat: boolean;
  repeatCooldownDays: number; // default 7
  maxConcurrentPrescriptions: number; // default 1
  recommendationCount: number; // 3~5
  gachaCookiePrice: number; // default 3
  allowStudentPdf: boolean;
  enableNewConditionLab: boolean;
  enableWorryGacha: boolean;
  enableFortune: boolean;
  enableRecordHelper: boolean;
  refreshIntervalSec: number;
  postTestActive?: boolean;
  postTestActivatedAt?: string;
}
