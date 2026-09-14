import { Student, SchoolClass, GachaPrize, AppSettings, Visit } from '../types';

export const INITIAL_CLASSES: SchoolClass[] = [
  { grade: 1, classNum: 1, active: true },
  { grade: 1, classNum: 2, active: true },
  { grade: 1, classNum: 3, active: true }
];

export const INITIAL_STUDENTS: Student[] = [
  // 1학년 1반
  { id: 'S-101-01', grade: 1, classNum: 1, number: 1, name: '강다온', cookieBalance: 5, createdAt: '2026-09-01' },
  { id: 'S-101-02', grade: 1, classNum: 1, number: 2, name: '김민준', cookieBalance: 7, createdAt: '2026-09-01' },
  { id: 'S-101-03', grade: 1, classNum: 1, number: 3, name: '박서현', cookieBalance: 4, createdAt: '2026-09-01' },
  { id: 'S-101-04', grade: 1, classNum: 1, number: 4, name: '이지우', cookieBalance: 8, createdAt: '2026-09-01' },
  { id: 'S-101-05', grade: 1, classNum: 1, number: 5, name: '정하은', cookieBalance: 3, createdAt: '2026-09-01' },

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
        description: '타이머 5분을 켜고 오늘 제일 중요한 한 가지 바로 시작하기',
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
