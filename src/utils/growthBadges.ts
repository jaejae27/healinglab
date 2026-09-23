import { GrowthBadgeDefinition, Student, StudentBadgeRecord, Visit } from '../types';

export const GROWTH_BADGE_DEFINITIONS: GrowthBadgeDefinition[] = [
  // 1. 방문·출석 (방문 횟수 - 하루 1회만 계산, 새로고침/중복 방지)
  {
    id: 'visit_first',
    title: '설레는 첫 발걸음',
    category: 'visit',
    categoryLabel: '방문·출석',
    conditionDescription: '힐링약국 1일 방문하기',
    achievedDescription: '힐링약국 문을 열고 마음 돌봄의 첫 발을 내딛었어요!',
    icon: '🚪',
    badgeGraphic: 'door_seed',
    colorTheme: 'emerald',
    targetProgress: 1,
    progressUnit: '일'
  },
  {
    id: 'visit_three',
    title: '꾸준한 발걸음',
    category: 'visit',
    categoryLabel: '방문·출석',
    conditionDescription: '서로 다른 날 3일 방문하기',
    achievedDescription: '서로 다른 날 3일간 꾸준히 힐링약국을 찾아와 마음을 살폈어요.',
    icon: '🐾',
    badgeGraphic: 'steps_sparkle',
    colorTheme: 'sky',
    targetProgress: 3,
    progressUnit: '일'
  },
  {
    id: 'visit_five',
    title: '마음약국 단골손님',
    category: 'visit',
    categoryLabel: '방문·출석',
    conditionDescription: '서로 다른 날 5일 방문하기',
    achievedDescription: '힐링약국과 단짝이 되어 스스로의 마음을 돌보는 든든한 습관을 만들었어요.',
    icon: '🏡',
    badgeGraphic: 'house_heart',
    colorTheme: 'indigo',
    targetProgress: 5,
    progressUnit: '일'
  },

  // 2. 진료·처방
  {
    id: 'prescribe_first',
    title: '마음 알아차림',
    category: 'prescription',
    categoryLabel: '진료·처방',
    conditionDescription: '나의 첫 마음 처방전 발급받기',
    achievedDescription: '내 안의 마음신호를 솔직하게 관찰하고 첫 마음 처방전을 발급받았어요.',
    icon: '🩺',
    badgeGraphic: 'stethoscope_star',
    colorTheme: 'teal',
    targetProgress: 1,
    progressUnit: '회'
  },

  // 3. 루틴·실천 (5일 미션)
  {
    id: 'routine_day1',
    title: '첫 실천의 싹',
    category: 'routine',
    categoryLabel: '루틴·실천',
    conditionDescription: '5일 처방 미션 1일차 실천 완료',
    achievedDescription: '처방 미션을 처음으로 직접 실천하고 마음 변화의 새싹을 틔웠어요.',
    icon: '🌱',
    badgeGraphic: 'sprout_water',
    colorTheme: 'lime',
    targetProgress: 1,
    progressUnit: '일'
  },
  {
    id: 'routine_day3',
    title: '3일 연속 돌봄',
    category: 'routine',
    categoryLabel: '루틴·실천',
    conditionDescription: '처방 미션 3일 이상 꾸준히 실천하기',
    achievedDescription: '작심삼일을 넘어 3일 이상 포기하지 않고 정성껏 마음을 돌보았어요.',
    icon: '🔥',
    badgeGraphic: 'flame_heart',
    colorTheme: 'amber',
    targetProgress: 3,
    progressUnit: '일'
  },

  // 4. 완주·다했어요 성찰 (실제 저장된 기록 기준)
  {
    id: 'done_first',
    title: '처방 다했어요',
    category: 'done',
    categoryLabel: '완주·성찰',
    conditionDescription: "'처방 다했어요' 성찰 1회 작성 및 제출",
    achievedDescription: "5일간의 처방을 완주하고 '처방 다했어요' 성찰을 완성해 마음 약을 받았어요!",
    icon: '🎁',
    badgeGraphic: 'gift_ribbon',
    colorTheme: 'rose',
    targetProgress: 1,
    progressUnit: '건'
  },
  {
    id: 'done_two',
    title: '성실한 완주자',
    category: 'done',
    categoryLabel: '완주·성찰',
    conditionDescription: "'처방 다했어요' 성찰 2회 이상 완주 제출",
    achievedDescription: '다양한 마음신호를 마주하고 처방을 2회 이상 완주한 멋진 마음 박사예요.',
    icon: '🏆',
    badgeGraphic: 'trophy_crown',
    colorTheme: 'amber',
    targetProgress: 2,
    progressUnit: '건'
  },

  // 5. 생각·소감 작성
  {
    id: 'reflection_three',
    title: '다정한 생각 작가',
    category: 'reflection',
    categoryLabel: '생각·기록',
    conditionDescription: '한 줄 실천 소감 3개 이상 작성하기',
    achievedDescription: '마음 처방을 실천하며 느낀 솔직한 생각을 3번 이상 다정하게 기록했어요.',
    icon: '✍️',
    badgeGraphic: 'pen_scroll',
    colorTheme: 'purple',
    targetProgress: 3,
    progressUnit: '개'
  },

  // 6. 감정·특별 활동
  {
    id: 'mood_calendar',
    title: '오늘의 마음 날씨',
    category: 'special',
    categoryLabel: '감정·탐험',
    conditionDescription: '감정 달력에 마음 날씨 1회 이상 기록',
    achievedDescription: '오늘 하루 내 마음에 뜬 감정 날씨를 솔직하게 마주하고 달력에 남겼어요.',
    icon: '🌈',
    badgeGraphic: 'rainbow_sun',
    colorTheme: 'sky',
    targetProgress: 1,
    progressUnit: '회'
  },
  {
    id: 'new_medicine',
    title: '마음 신약 연구원',
    category: 'special',
    categoryLabel: '나눔·연구',
    conditionDescription: '신약 연구소에 새로운 마음신호 1건 제안',
    achievedDescription: '친구들의 마음 건강을 돕기 위해 나만의 따뜻한 새 마음신호를 연구 제안했어요.',
    icon: '🧪',
    badgeGraphic: 'flask_spark',
    colorTheme: 'violet',
    targetProgress: 1,
    progressUnit: '건'
  },
  {
    id: 'fortune_wisdom',
    title: '지혜의 탐험가',
    category: 'special',
    categoryLabel: '지혜·위로',
    conditionDescription: '고민 가챠 또는 힐링 포춘카드 1회 이상 보관',
    achievedDescription: '마음이 지칠 때 꺼내볼 나만의 인생 문장과 지혜를 서랍에 간직했어요.',
    icon: '🔮',
    badgeGraphic: 'crystal_star',
    colorTheme: 'fuchsia',
    targetProgress: 1,
    progressUnit: '건'
  }
];

export interface EvaluatedGrowthBadge {
  definition: GrowthBadgeDefinition;
  unlocked: boolean;
  unlockedAt?: string; // YYYY.MM.DD
  currentProgress: number;
  targetProgress: number;
  progressPercent: number;
  progressUnit: string;
}

/**
 * Format a date string (ISO or YYYY-MM-DD) into readable YYYY.MM.DD
 */
export function formatBadgeDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      // Direct YYYY-MM-DD check
      const parts = dateStr.split(/[-/]/);
      if (parts.length >= 3) {
        return `${parts[0]}.${parts[1].padStart(2, '0')}.${parts[2].slice(0, 2).padStart(2, '0')}`;
      }
      return dateStr;
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * Extract unique YYYY-MM-DD visit dates for a student, avoiding duplicates from reloads or multiple daily visits.
 */
export function extractUniqueVisitDates(
  student: Student,
  studentVisits: Visit[],
  emotionLogs: { date: string }[] = []
): string[] {
  const dates = new Set<string>();

  // 1. Recorded visit dates array on student
  if (Array.isArray(student.visitDates)) {
    student.visitDates.forEach((d) => {
      if (d && typeof d === 'string') {
        dates.add(d.split('T')[0]);
      }
    });
  }

  // 2. Student creation date
  if (student.createdAt) {
    dates.add(student.createdAt.split('T')[0]);
  }

  // 3. Activity dates from visits (creation, submission, daily check-ins)
  studentVisits.forEach((v) => {
    if (v.createdAt) dates.add(v.createdAt.split('T')[0]);
    if (v.submittedAt) dates.add(v.submittedAt.split('T')[0]);
    (v.dailyCheckIns || []).forEach((c) => {
      if (c.date) dates.add(c.date.split('T')[0]);
      if (c.completedAt) dates.add(c.completedAt.split('T')[0]);
    });
  });

  // 4. Emotion logs
  emotionLogs.forEach((e) => {
    if (e.date) dates.add(e.date.split('T')[0]);
  });

  return Array.from(dates).filter(Boolean).sort();
}

/**
 * Evaluates all Growth Badges for a student using actual stored records.
 * Ensures existing students receive credit and historical unlock dates.
 */
export function evaluateStudentGrowthBadges(
  student: Student,
  studentVisits: Visit[],
  proposals: { id: string; studentId: string; createdAt: string }[] = [],
  emotionLogs: { date: string }[] = [],
  savedFortunes: { savedAt: string }[] = []
): {
  badges: EvaluatedGrowthBadge[];
  newlyUnlockedMap: Record<string, StudentBadgeRecord>;
} {
  const uniqueDates = extractUniqueVisitDates(student, studentVisits, emotionLogs);
  const visitCount = uniqueDates.length;

  // Actual saved '다했어요' records
  const completedVisits = studentVisits.filter(
    (v) => !!v.submittedAt || v.status === 'submitted' || v.status === 'rewarded' || v.status === 'completed'
  );
  const doneCount = completedVisits.length;

  // Prescriptions issued
  const prescribeCount = studentVisits.length;

  // Daily check-ins (completed)
  const allDailyCheckIns = studentVisits.flatMap((v) => v.dailyCheckIns || []).filter((c) => c.completed);
  const totalDaysLogged = allDailyCheckIns.length;

  // Thoughts / reflection notes written
  const thoughtsWritten = allDailyCheckIns.filter((c) => c.note && c.note.trim().length > 0);
  const thoughtsLoggedCount = thoughtsWritten.length;

  // Existing badges map on student
  const existingBadges: Record<string, StudentBadgeRecord> = student.badges || {};
  const newlyUnlockedMap: Record<string, StudentBadgeRecord> = { ...existingBadges };

  const evaluated: EvaluatedGrowthBadge[] = GROWTH_BADGE_DEFINITIONS.map((def) => {
    let current = 0;
    let unlocked = false;
    let derivedUnlockDate = '';

    switch (def.id) {
      case 'visit_first':
        current = visitCount;
        unlocked = current >= 1;
        if (unlocked) {
          derivedUnlockDate = uniqueDates[0] || student.createdAt;
        }
        break;

      case 'visit_three':
        current = visitCount;
        unlocked = current >= 3;
        if (unlocked) {
          derivedUnlockDate = uniqueDates[2] || uniqueDates[uniqueDates.length - 1] || student.createdAt;
        }
        break;

      case 'visit_five':
        current = visitCount;
        unlocked = current >= 5;
        if (unlocked) {
          derivedUnlockDate = uniqueDates[4] || uniqueDates[uniqueDates.length - 1] || student.createdAt;
        }
        break;

      case 'prescribe_first':
        current = prescribeCount;
        unlocked = current >= 1;
        if (unlocked && studentVisits[0]) {
          derivedUnlockDate = studentVisits[0].createdAt;
        }
        break;

      case 'routine_day1':
        current = totalDaysLogged;
        unlocked = current >= 1;
        if (unlocked && allDailyCheckIns[0]) {
          derivedUnlockDate = allDailyCheckIns[0].date || allDailyCheckIns[0].completedAt || student.createdAt;
        }
        break;

      case 'routine_day3':
        current = totalDaysLogged;
        unlocked = current >= 3;
        if (unlocked && allDailyCheckIns[2]) {
          derivedUnlockDate = allDailyCheckIns[2].date || allDailyCheckIns[2].completedAt || student.createdAt;
        }
        break;

      case 'done_first':
        current = doneCount;
        unlocked = current >= 1;
        if (unlocked && completedVisits[0]) {
          derivedUnlockDate = completedVisits[0].submittedAt || completedVisits[0].createdAt;
        }
        break;

      case 'done_two':
        current = doneCount;
        unlocked = current >= 2;
        if (unlocked && completedVisits[1]) {
          derivedUnlockDate = completedVisits[1].submittedAt || completedVisits[1].createdAt;
        }
        break;

      case 'reflection_three':
        current = thoughtsLoggedCount;
        unlocked = current >= 3;
        if (unlocked && thoughtsWritten[2]) {
          derivedUnlockDate = thoughtsWritten[2].date || thoughtsWritten[2].completedAt || student.createdAt;
        }
        break;

      case 'mood_calendar':
        current = emotionLogs.length;
        unlocked = current >= 1;
        if (unlocked && emotionLogs[0]) {
          derivedUnlockDate = emotionLogs[0].date;
        }
        break;

      case 'new_medicine':
        current = proposals.length;
        unlocked = current >= 1;
        if (unlocked && proposals[0]) {
          derivedUnlockDate = proposals[0].createdAt;
        }
        break;

      case 'fortune_wisdom':
        current = savedFortunes.length;
        unlocked = current >= 1;
        if (unlocked && savedFortunes[0]) {
          derivedUnlockDate = savedFortunes[0].savedAt;
        }
        break;

      default:
        break;
    }

    // Preserve previously stored unlock date if available
    if (existingBadges[def.id]?.unlocked) {
      unlocked = true;
      if (existingBadges[def.id].unlockedAt) {
        derivedUnlockDate = existingBadges[def.id].unlockedAt;
      }
    }

    const formattedDate = unlocked ? formatBadgeDate(derivedUnlockDate || new Date().toISOString()) : undefined;

    // Update map for persistence
    if (unlocked && (!existingBadges[def.id] || !existingBadges[def.id].unlocked)) {
      newlyUnlockedMap[def.id] = {
        unlocked: true,
        unlockedAt: formattedDate || formatBadgeDate(new Date().toISOString())
      };
    }

    const progressPercent = Math.min(100, Math.round((current / def.targetProgress) * 100));

    return {
      definition: def,
      unlocked,
      unlockedAt: formattedDate,
      currentProgress: current,
      targetProgress: def.targetProgress,
      progressPercent,
      progressUnit: def.progressUnit
    };
  });

  return {
    badges: evaluated,
    newlyUnlockedMap
  };
}
