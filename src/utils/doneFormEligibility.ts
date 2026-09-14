import { Visit } from '../types';
import { StorageService } from '../services/storage';

export interface DoneFormEligibility {
  canOpen: boolean;
  reason: 'eligible' | 'no_visit' | 'before_day_5' | 'day_5_mission_not_done';
  daysSince: number;
  day5MissionDone: boolean;
  completedDaysCount: number;
  remainingDays: number;
}

/**
 * Checks whether the '처방 다했어요' (DoneForm) can be opened.
 * Rules requested by user:
 * 1. Must be Day 5 or later (cannot open before Day 5).
 * 2. On Day 5, must have completed at least 1 mission for Day 5 (if 0 missions done, cannot open).
 */
export function checkDoneFormEligibility(
  visit?: Visit | null,
  customSimulatedDays?: number | null
): DoneFormEligibility {
  if (!visit) {
    return {
      canOpen: false,
      reason: 'no_visit',
      daysSince: 0,
      day5MissionDone: false,
      completedDaysCount: 0,
      remainingDays: 5
    };
  }

  // Calculate real calendar days since visit creation
  const createdDate = new Date(visit.createdAt || Date.now());
  const realDaysSince = Math.max(
    1,
    Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  // Check stored simulated days (for evaluator/teacher preview)
  const storedSim = StorageService.getVisitSimulatedDays(visit.visitId);
  const effectiveDaysSince = customSimulatedDays ?? storedSim ?? realDaysSince;

  const checkIns = Array.isArray(visit.dailyCheckIns) ? visit.dailyCheckIns : [];
  const completedDaysCount = checkIns.filter((c) => c.completed).length;

  // 1. 5일차 전에는 못 열게 함 (Days 1, 2, 3, 4)
  if (effectiveDaysSince < 5) {
    return {
      canOpen: false,
      reason: 'before_day_5',
      daysSince: effectiveDaysSince,
      day5MissionDone: false,
      completedDaysCount,
      remainingDays: Math.max(1, 5 - effectiveDaysSince)
    };
  }

  // 2. 5일차 미션을 하나도 안했으면 아예 안열리고 1개라도 해야 열리게 함
  const day5CheckIn = checkIns.find((c) => c.day === 5);
  const day5MissionDone = !!day5CheckIn && (
    (Array.isArray(day5CheckIn.items) && day5CheckIn.items.some((it) => it.completed)) ||
    day5CheckIn.completed === true
  );

  if (!day5MissionDone) {
    return {
      canOpen: false,
      reason: 'day_5_mission_not_done',
      daysSince: effectiveDaysSince,
      day5MissionDone: false,
      completedDaysCount,
      remainingDays: 0
    };
  }

  return {
    canOpen: true,
    reason: 'eligible',
    daysSince: effectiveDaysSince,
    day5MissionDone: true,
    completedDaysCount,
    remainingDays: 0
  };
}
