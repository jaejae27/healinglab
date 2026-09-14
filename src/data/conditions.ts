import { VirtualCondition } from '../types';
import { RAW_CONDITIONS } from './conditionsRaw';
import { RAW_CONDITIONS_PART2 } from './conditionsRawPart2';
import { RAW_CONDITIONS_PART3 } from './conditionsRawPart3';
import { generateTailoredMissionsForCondition } from './tailoredMissions';

const allRawConditions = [...RAW_CONDITIONS, ...RAW_CONDITIONS_PART2, ...RAW_CONDITIONS_PART3];

export const VIRTUAL_CONDITIONS: VirtualCondition[] = allRawConditions.map((item) => ({
  conditionId: item.id,
  categoryId: item.categoryId,
  name: item.name,
  summary: item.summary,
  checkItemsSample: item.sampleItems,
  prescriptionCandidates: generateTailoredMissionsForCondition(item),
  prescriptionMedicineName: item.medicine,
  prescriptionAdvice: item.advice,
  status: 'active'
}));

export const CONDITIONS_MAP: Record<string, VirtualCondition> = VIRTUAL_CONDITIONS.reduce(
  (acc, cond) => {
    acc[cond.conditionId] = cond;
    return acc;
  },
  {} as Record<string, VirtualCondition>
);
