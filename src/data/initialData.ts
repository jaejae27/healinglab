import { Student, SchoolClass, GachaPrize, AppSettings, Visit, CookieLog } from '../types';

export const INITIAL_CLASSES: SchoolClass[] = [
  { grade: 1, classNum: 1, active: true },
  { grade: 1, classNum: 2, active: true },
  { grade: 1, classNum: 3, active: true }
];

export const INITIAL_STUDENTS: Student[] = [
  // 1학년 1반
  {
    id: 'S-101-01',
    grade: 1,
    classNum: 1,
    number: 1,
    name: '강다온',
    cookieBalance: 8,
    createdAt: '2026-09-01',
    privacyConsent: { agreed: true, agreedAt: '2026-09-01T09:00:00Z' },
    preTest: {
      completed: true,
      completedAt: '2026-09-01T09:10:00Z',
      answers: { Q1: 3, Q2: 3, Q3: 2, Q4: 3, Q5: 2, Q6: 3, Q7: 2, Q8: 3, Q9: 3, Q10: 2, Q11: 3, Q12: 3, Q13: 3, Q14: 4, Q15: 3, Q16: 3, Q17: 4, Q18: 3, Q19: 3, Q20: 3 },
      totalScore: 58,
      averageScore: 2.9,
      domainScores: {
        self_awareness: 2.75,
        self_regulation: 2.5,
        self_care: 2.75,
        help_seeking: 3.25,
        empathy_action: 3.25
      },
      kpiScore: 2,
      descriptiveAnswers: {
        q21_feelings: '걱정, 조급함, 피곤함',
        q22_stressCoping: '혼자 방에서 스마트폰을 보면서 생각을 잊으려고 해요.'
      }
    },
    postTest: {
      completed: true,
      completedAt: '2026-09-12T14:30:00Z',
      answers: { Q1: 4, Q2: 4, Q3: 4, Q4: 4, Q5: 4, Q6: 4, Q7: 4, Q8: 4, Q9: 4, Q10: 4, Q11: 4, Q12: 4, Q13: 4, Q14: 5, Q15: 4, Q16: 4, Q17: 5, Q18: 4, Q19: 4, Q20: 4 },
      totalScore: 82,
      averageScore: 4.1,
      domainScores: {
        self_awareness: 4.0,
        self_regulation: 4.0,
        self_care: 4.0,
        help_seeking: 4.25,
        empathy_action: 4.25
      },
      kpiScore: 5,
      descriptiveAnswers: {
        q21_feelings: '뿌듯함, 편안함, 기대감',
        q22_stressCoping: '마음신호를 알아차리고 5분 타이머로 심호흡을 하거나 산책을 해요.',
        q28_mindChanged: '예전에는 할 일을 미루면 자책만 했는데, 이제는 "계획만거창해증" 신호를 알아차리고 딱 5분만 먼저 시작하게 되었어요.',
        q29_favoritePrescription: '계획을 3단계로 쪼개고 첫 단추 5분만 집중하기 처방전',
        q30_friendAction: '친구가 시험 때문에 스트레스 받을 때 조언보다 이야기를 묵묵히 들어주고 비타민을 건넬 거예요.'
      },
      programEffectScores: { PE1: 5, PE2: 5, PE3: 4, PE4: 4, PE5: 5 },
      programEffectAverage: 4.6
    }
  },
  {
    id: 'S-101-02',
    grade: 1,
    classNum: 1,
    number: 2,
    name: '김민준',
    cookieBalance: 7,
    createdAt: '2026-09-01',
    privacyConsent: { agreed: true, agreedAt: '2026-09-01T09:00:00Z' },
    preTest: {
      completed: true,
      completedAt: '2026-09-01T09:12:00Z',
      answers: { Q1: 3, Q2: 4, Q3: 3, Q4: 3, Q5: 3, Q6: 3, Q7: 3, Q8: 3, Q9: 3, Q10: 3, Q11: 3, Q12: 3, Q13: 3, Q14: 3, Q15: 3, Q16: 4, Q17: 4, Q18: 3, Q19: 3, Q20: 3 },
      totalScore: 63,
      averageScore: 3.15,
      domainScores: {
        self_awareness: 3.25,
        self_regulation: 3.0,
        self_care: 3.0,
        help_seeking: 3.25,
        empathy_action: 3.25
      },
      kpiScore: 3,
      descriptiveAnswers: {
        q21_feelings: '보통, 지루함, 졸림',
        q22_stressCoping: '친구랑 게임하거나 간식을 먹어요.'
      }
    },
    postTest: {
      completed: true,
      completedAt: '2026-09-12T15:10:00Z',
      answers: { Q1: 4, Q2: 4, Q3: 4, Q4: 4, Q5: 4, Q6: 4, Q7: 4, Q8: 3, Q9: 4, Q10: 4, Q11: 4, Q12: 4, Q13: 4, Q14: 4, Q15: 4, Q16: 4, Q17: 4, Q18: 4, Q19: 4, Q20: 4 },
      totalScore: 79,
      averageScore: 3.95,
      domainScores: {
        self_awareness: 4.0,
        self_regulation: 3.75,
        self_care: 4.0,
        help_seeking: 4.0,
        empathy_action: 4.0
      },
      kpiScore: 4,
      descriptiveAnswers: {
        q21_feelings: '여유로움, 안정감',
        q22_stressCoping: '내가 피곤한지 배고픈지 먼저 확인하고 따뜻한 물을 마셔요.',
        q28_mindChanged: '마음에도 감기처럼 약이 필요하다는 걸 알게 되었고 내 기분을 더 챙기게 되었습니다.',
        q29_favoritePrescription: '속마음 털어놓기 및 감사노트 1줄 적기',
        q30_friendAction: '우울해 보이는 친구에게 먼저 말을 걸어줄 생각입니다.'
      },
      programEffectScores: { PE1: 4, PE2: 4, PE3: 4, PE4: 4, PE5: 4 },
      programEffectAverage: 4.0
    }
  },
  {
    id: 'S-101-03',
    grade: 1,
    classNum: 1,
    number: 3,
    name: '박서현',
    cookieBalance: 4,
    createdAt: '2026-09-01',
    privacyConsent: { agreed: true, agreedAt: '2026-09-01T09:00:00Z' },
    preTest: {
      completed: true,
      completedAt: '2026-09-01T09:15:00Z',
      answers: { Q1: 3, Q2: 2, Q3: 2, Q4: 2, Q5: 3, Q6: 2, Q7: 2, Q8: 2, Q9: 3, Q10: 2, Q11: 2, Q12: 3, Q13: 4, Q14: 4, Q15: 3, Q16: 3, Q17: 4, Q18: 3, Q19: 3, Q20: 3 },
      totalScore: 55,
      averageScore: 2.75,
      domainScores: {
        self_awareness: 2.25,
        self_regulation: 2.25,
        self_care: 2.5,
        help_seeking: 3.5,
        empathy_action: 3.25
      },
      kpiScore: 2,
      descriptiveAnswers: {
        q21_feelings: '불안, 초조함',
        q22_stressCoping: '친한 친구에게 전화해서 속상한 일을 이야기해요.'
      }
    }
  },
  {
    id: 'S-101-04',
    grade: 1,
    classNum: 1,
    number: 4,
    name: '이지우',
    cookieBalance: 8,
    createdAt: '2026-09-01',
    privacyConsent: { agreed: true, agreedAt: '2026-09-01T09:00:00Z' }
  },
  {
    id: 'S-101-05',
    grade: 1,
    classNum: 1,
    number: 5,
    name: '정하은',
    cookieBalance: 3,
    createdAt: '2026-09-01',
    privacyConsent: { agreed: true, agreedAt: '2026-09-01T09:00:00Z' }
  },

  // 1학년 2반
  { id: 'S-102-01', grade: 1, classNum: 2, number: 1, name: '송예준', cookieBalance: 6, createdAt: '2026-09-01' },
  { id: 'S-102-02', grade: 1, classNum: 2, number: 2, name: '윤채원', cookieBalance: 9, createdAt: '2026-09-01' },
  { id: 'S-102-03', grade: 1, classNum: 2, number: 3, name: '임도윤', cookieBalance: 2, createdAt: '2026-09-01' },
  { id: 'S-102-04', grade: 1, classNum: 2, number: 4, name: '최수아', cookieBalance: 5, createdAt: '2026-09-01' },

  // 1학년 3반
  { id: 'S-103-01', grade: 1, classNum: 3, number: 1, name: '한도현', cookieBalance: 4, createdAt: '2026-09-01' },
  { id: 'S-103-02', grade: 1, classNum: 3, number: 2, name: '홍유진', cookieBalance: 8, createdAt: '2026-09-01' }
];

export const GACHA_PRIZES: GachaPrize[] = [
  { id: 'GP-01', name: '달콤 아이스크림 쿠폰', emoji: '🍦', rarity: 'rare', description: '급식 후 교탁에서 교환할 수 있는 시원한 아이스크림!' },
  { id: 'GP-02', name: '바삭 과자 한 봉지', emoji: '🍪', rarity: 'common', description: '친구들과 나눠 먹기 좋은 힐링 스낵!' },
  { id: 'GP-03', name: '행복 초콜릿 바', emoji: '🍫', rarity: 'common', description: '지친 오후 당 충전이 필요할 때 딱!' },
  { id: 'GP-04', name: '비밀의 실물 포춘쿠키', emoji: '🥠', rarity: 'common', description: '바삭 쪼개서 마음의 메시지를 확인해요.' },
  { id: 'GP-05', name: '칭찬쿠키 +1개 추가', emoji: '🍪', rarity: 'common', description: '내 지갑에 쿠키가 1개 더 쏙!' },
  { id: 'GP-06', name: '칭찬쿠키 +3개 대박', emoji: '✨', rarity: 'rare', description: '한 번 더 뽑기를 돌릴 수 있는 기회!' },
  { id: 'GP-07', name: '칭찬쿠키 +3개 대박 선물', emoji: '🍪', rarity: 'rare', description: '달콤한 칭찬쿠키 3개 보너스 적립!' },
  { id: 'GP-08', name: '친구와 함께 먹는 짝꿍 간식권', emoji: '👭', rarity: 'rare', description: '친구 한 명과 함께 간식을 나눠 먹어요.' },
  { id: 'GP-09', name: '원하는 간식 선택 황금패', emoji: '👑', rarity: 'super_rare', description: '선생님 약장의 모든 간식 중 1개 자유 선택!' }
];

export const DEFAULT_SETTINGS: AppSettings = {
  startDate: '2026-09-01',
  endDate: '2026-10-31',
  allowRepeat: true,
  repeatCooldownDays: 7,
  maxConcurrentPrescriptions: 1,
  recommendationCount: 3,
  gachaCookiePrice: 3,
  allowStudentPdf: true,
  enableNewConditionLab: true,
  enableWorryGacha: true,
  enableFortune: true,
  enableRecordHelper: true,
  refreshIntervalSec: 15
};

export const INITIAL_VISITS: Visit[] = [
  {
    visitId: 'V-20260902-01',
    studentId: 'S-101-01', // 강다온
    studentName: '강다온',
    grade: 1,
    classNum: 1,
    number: 1,
    createdAt: '2026-09-02T09:15:00Z',
    status: 'rewarded',
    categoryId: 'study',
    primaryConditionId: 'A-06',
    primaryConditionName: '계획만거창해증',
    secondaryConditionIds: ['A-07', 'A-08'],
    missions: [
      {
        missionId: 'A-06-M1',
        type: 'notice',
        title: '마음 신호 알아차리기',
        description: '오늘 하루 "계획만거창해증" 신호가 켜졌을 때 내 몸의 상태 관찰하기',
        completed: true,
        rating: 5
      },
      {
        missionId: 'A-06-M3',
        type: 'action',
        title: '5분 미니 행동 실천',
        description: '부담 없이 딱 5분만 타이머를 켜고 지금 당장 할 수 있는 가장 쉬운 작은 행동 1가지만 실행해보기 (예: 교재 첫 페이지만 펼치기, 책상 위 컵 치우기, 가장 쉬운 문제 1개 풀기)',
        completed: true,
        rating: 5
      },
      {
        missionId: 'A-06-M5',
        type: 'environment',
        title: '나만의 안전 환경 만들기',
        description: '스마트폰을 서랍에 넣고 체크리스트 1개만 지워보기',
        completed: true,
        rating: 4
      }
    ],
    dailyCheckIns: [
      {
        day: 1,
        date: '2026-08-27',
        missionId: 'A-06-M1',
        missionTitle: '마음 신호 알아차리기',
        completed: true,
        completedAt: '2026-08-27T15:00:00Z',
        mood: 'neutral',
        note: '계획이 밀릴 때 가슴이 답답해지는 걸 알아차렸어요.',
        allCompleted: true,
        items: [
          { missionId: 'A-06-M1', missionTitle: '마음 신호 알아차리기', completed: true, actionNote: '수업 시간에 가슴이 답답해질 때 심호흡 3번을 했습니다.' },
          { missionId: 'A-06-M3', missionTitle: '5분 미니 행동 실천', completed: true, actionNote: '타이머 5분 맞춰두고 수학 1번 문제 바로 풀기 시작함' },
          { missionId: 'A-06-M5', missionTitle: '나만의 안전 환경 만들기', completed: true, actionNote: '책상 위 장난감과 필기구 깔끔하게 정리' }
        ]
      },
      {
        day: 2,
        date: '2026-08-28',
        missionId: 'A-06-M3',
        missionTitle: '5분 미니 행동 실천',
        completed: true,
        completedAt: '2026-08-28T16:20:00Z',
        mood: 'good',
        note: '5분만 책상에 앉아봤더니 생각보다 술술 풀렸어요!',
        allCompleted: true,
        items: [
          { missionId: 'A-06-M1', missionTitle: '마음 신호 알아차리기', completed: true, actionNote: '딴짓하고 싶어질 때 마음신호 알림 카드 보기' },
          { missionId: 'A-06-M3', missionTitle: '5분 미니 행동 실천', completed: true, actionNote: '사회 숙제 5분 동안 단어 3개 먼저 외우기' },
          { missionId: 'A-06-M5', missionTitle: '나만의 안전 환경 만들기', completed: true, actionNote: '핸드폰 서랍에 넣고 알림 끄기' }
        ]
      },
      {
        day: 3,
        date: '2026-08-29',
        missionId: 'A-06-M3',
        missionTitle: '5분 미니 행동 실천',
        completed: true,
        completedAt: '2026-08-29T17:10:00Z',
        mood: 'great',
        note: '수학 숙제를 드디어 미루지 않고 30분 만에 끝냈습니다.',
        allCompleted: true,
        items: [
          { missionId: 'A-06-M1', missionTitle: '마음 신호 알아차리기', completed: true, actionNote: '계획표 거창하게 쓰지 않고 1가지만 적기' },
          { missionId: 'A-06-M3', missionTitle: '5분 미니 행동 실천', completed: true, actionNote: '5분 미니 행동 성공하고 이어서 끝까지 해냄' },
          { missionId: 'A-06-M5', missionTitle: '나만의 안전 환경 만들기', completed: true, actionNote: '방문 닫고 조용한 환경 만들기' }
        ]
      },
      {
        day: 4,
        date: '2026-08-30',
        missionId: 'A-06-M5',
        missionTitle: '나만의 안전 환경 만들기',
        completed: true,
        completedAt: '2026-08-30T14:40:00Z',
        mood: 'good',
        note: '핸드폰을 서랍에 넣으니까 집중력이 두 배가 되었어요.',
        allCompleted: true,
        items: [
          { missionId: 'A-06-M1', missionTitle: '마음 신호 알아차리기', completed: true, actionNote: '머릿속이 복잡해질 때 창문 열고 바람 쐬기' },
          { missionId: 'A-06-M3', missionTitle: '5분 미니 행동 실천', completed: true, actionNote: '영어 단어장 5분 읽기' },
          { missionId: 'A-06-M5', missionTitle: '나만의 안전 환경 만들기', completed: true, actionNote: '책상 서랍에 휴대폰 넣어두기' }
        ]
      },
      {
        day: 5,
        date: '2026-08-31',
        missionId: 'A-06-M3',
        missionTitle: '5분 미니 행동 실천',
        completed: true,
        completedAt: '2026-08-31T18:00:00Z',
        mood: 'great',
        note: '5일 동안 3개 미션을 모두 완벽하게 실천해냈어요!',
        allCompleted: true,
        items: [
          { missionId: 'A-06-M1', missionTitle: '마음 신호 알아차리기', completed: true, actionNote: '계획 욕심 버리고 오늘의 핵심 1개 정하기' },
          { missionId: 'A-06-M3', missionTitle: '5분 미니 행동 실천', completed: true, actionNote: '오늘의 핵심 과제 5분 집중 실천' },
          { missionId: 'A-06-M5', missionTitle: '나만의 안전 환경 만들기', completed: true, actionNote: '미션 체크리스트에 3개 모두 동그라미 치기' }
        ]
      }
    ],
    submittedAt: '2026-09-02T14:20:00Z',
    bestMissionIndex: 1,
    reflectionWhy: '계획을 거창하게 안 세우고 5분만 먼저 시작하니까 부담이 확 줄어서 계속 할 수 있었어요.',
    willUseAgain: '네, 시험 기간이나 숙제할 때마다 쓸 거예요.',
    reflectionLearned: '시작하기 전 생각의 무게가 실제 행동보다 훨씬 무거웠다는 걸 알게 되었습니다.',
    futurePlan: '다음에도 할 일이 밀리면 5분 타이머부터 먼저 켤게요.',
    paperVerified: true,
    webVerified: true,
    rewardGiven: true,
    rewardGivenAt: '2026-09-02T16:00:00Z',
    rewardSnackNote: '심플실천제(간식) + 조언카드 지급 완료'
  },
  {
    visitId: 'V-20260903-02',
    studentId: 'S-101-02', // 김민준
    studentName: '김민준',
    grade: 1,
    classNum: 1,
    number: 2,
    createdAt: '2026-09-03T10:30:00Z',
    status: 'submitted',
    categoryId: 'worries',
    primaryConditionId: 'W-01',
    primaryConditionName: '생각과다증',
    secondaryConditionIds: ['W-06'],
    missions: [
      {
        missionId: 'W-01-M1',
        type: 'notice',
        title: '마음 신호 알아차리기',
        description: '머릿속 브라우저 탭이 많아질 때 어깨 힘 빼기',
        completed: true,
        rating: 4
      },
      {
        missionId: 'W-01-M2',
        type: 'notice',
        title: '생각 한 줄 적어보기',
        description: '머릿속을 맴도는 걱정을 메모지에 적어두기',
        completed: true,
        rating: 5
      },
      {
        missionId: 'W-01-M4',
        type: 'action',
        title: '신체 리셋 & 심호흡 3번',
        description: '창밖을 보며 깊은 심호흡 3번 하기',
        completed: true,
        rating: 4
      }
    ],
    submittedAt: '2026-09-03T16:00:00Z',
    bestMissionIndex: 1,
    reflectionWhy: '종이에 적으니까 머릿속에서 계속 맴돌던 게 밖으로 나와서 덜 답답해졌어요.',
    willUseAgain: '네, 밤에 잠 안 올 때 유용할 것 같아요.',
    reflectionLearned: '생각을 머릿속에만 담아두면 더 커진다는 걸 배웠어요.',
    futurePlan: '메모장에 적어두고 내일 아침에 다시 보기',
    paperVerified: true,
    webVerified: true,
    rewardGiven: false
  },
  {
    visitId: 'V-20260903-03',
    studentId: 'S-101-03', // 박서현
    studentName: '박서현',
    grade: 1,
    classNum: 1,
    number: 3,
    createdAt: '2026-09-03T13:00:00Z',
    status: 'prescribed',
    categoryId: 'friends',
    primaryConditionId: 'R-03',
    primaryConditionName: '친구눈치보여증',
    secondaryConditionIds: ['R-09'],
    missions: [
      {
        missionId: 'R-03-M1',
        type: 'notice',
        title: '마음 신호 알아차리기',
        description: '친구 반응에 긴장될 때 숨을 깊게 들이쉬기',
        completed: false
      },
      {
        missionId: 'R-03-M3',
        type: 'action',
        title: '5분 미니 행동 실천',
        description: '내 생각이나 기분을 가볍게 한마디 표현해보기',
        completed: false
      },
      {
        missionId: 'R-03-M6',
        type: 'environment',
        title: '다정한 지지자와 대화 또는 자기 칭찬',
        description: '"오늘도 내 몫을 잘 해냈어" 나에게 말해주기',
        completed: false
      }
    ]
  }
];

export const INITIAL_COOKIE_LOGS: CookieLog[] = [
  {
    id: 'CK-INIT-01',
    studentId: 'S-101-01',
    studentName: '강다온',
    amount: 2,
    reason: '사회정서 사전검사 참여 완료 보너스',
    balanceAfter: 2,
    createdAt: '2026-09-01T09:10:00.000Z'
  },
  {
    id: 'CK-INIT-02',
    studentId: 'S-101-01',
    studentName: '강다온',
    amount: 1,
    reason: '1일차 행동처방 미션 실천 (+1쿠키)',
    balanceAfter: 3,
    createdAt: '2026-09-02T10:15:00.000Z'
  },
  {
    id: 'CK-INIT-03',
    studentId: 'S-101-01',
    studentName: '강다온',
    amount: 1,
    reason: '🌱 1회차 실천 달성 보너스 (+1쿠키)',
    balanceAfter: 4,
    createdAt: '2026-09-02T10:15:00.000Z'
  },
  {
    id: 'CK-INIT-04',
    studentId: 'S-101-01',
    studentName: '강다온',
    amount: 1,
    reason: '🔥 3회차 꾸준 실천 보너스 (+1쿠키)',
    balanceAfter: 5,
    createdAt: '2026-09-04T11:20:00.000Z'
  },
  {
    id: 'CK-INIT-05',
    studentId: 'S-101-01',
    studentName: '강다온',
    amount: 2,
    reason: '👑 5일 주간 루틴 완주 축하 보너스 (+2쿠키)',
    balanceAfter: 7,
    createdAt: '2026-09-06T15:00:00.000Z'
  },
  {
    id: 'CK-INIT-06',
    studentId: 'S-101-01',
    studentName: '강다온',
    amount: 3,
    reason: '처방 미션 실천 및 워크북 확인 완료 (계획만거창해증)',
    balanceAfter: 10,
    createdAt: '2026-09-07T09:30:00.000Z'
  },
  {
    id: 'CK-INIT-07',
    studentId: 'S-101-01',
    studentName: '강다온',
    amount: -3,
    reason: '고민 가챠 뽑기 참여 (위로 스티커)',
    balanceAfter: 7,
    createdAt: '2026-09-08T12:40:00.000Z'
  },
  {
    id: 'CK-INIT-08',
    studentId: 'S-101-01',
    studentName: '강다온',
    amount: 1,
    reason: '📅 오늘의 감정 달력 기록 (2026-09-10)',
    balanceAfter: 8,
    createdAt: '2026-09-10T14:10:00.000Z'
  },
  {
    id: 'CK-INIT-09',
    studentId: 'S-101-02',
    studentName: '김민준',
    amount: 2,
    reason: '사회정서 사전검사 참여 완료 보너스',
    balanceAfter: 2,
    createdAt: '2026-09-01T09:12:00.000Z'
  },
  {
    id: 'CK-INIT-10',
    studentId: 'S-101-02',
    studentName: '김민준',
    amount: 1,
    reason: '1일차 행동처방 미션 실천 (+1쿠키)',
    balanceAfter: 3,
    createdAt: '2026-09-03T11:00:00.000Z'
  },
  {
    id: 'CK-INIT-11',
    studentId: 'S-101-02',
    studentName: '김민준',
    amount: 1,
    reason: '2일차 행동처방 미션 실천 (+1쿠키)',
    balanceAfter: 4,
    createdAt: '2026-09-04T10:45:00.000Z'
  },
  {
    id: 'CK-INIT-12',
    studentId: 'S-101-02',
    studentName: '김민준',
    amount: 3,
    reason: '처방 미션 실천 및 워크북 확인 완료 (발표울렁증후군)',
    balanceAfter: 7,
    createdAt: '2026-09-08T13:20:00.000Z'
  },
  {
    id: 'CK-INIT-13',
    studentId: 'S-101-03',
    studentName: '박서현',
    amount: 2,
    reason: '사회정서 사전검사 참여 완료 보너스',
    balanceAfter: 2,
    createdAt: '2026-09-01T09:15:00.000Z'
  },
  {
    id: 'CK-INIT-14',
    studentId: 'S-101-03',
    studentName: '박서현',
    amount: 1,
    reason: '1일차 행동처방 미션 실천 (+1쿠키)',
    balanceAfter: 3,
    createdAt: '2026-09-04T08:50:00.000Z'
  },
  {
    id: 'CK-INIT-15',
    studentId: 'S-101-03',
    studentName: '박서현',
    amount: 1,
    reason: '🎯 1일차 3개 미션 완벽 실천 올클리어 보너스 (+1쿠키)',
    balanceAfter: 4,
    createdAt: '2026-09-04T08:50:00.000Z'
  }
];

