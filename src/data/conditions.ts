import { VirtualCondition } from '../types';
import { RAW_CONDITIONS } from './conditionsRaw';
import { RAW_CONDITIONS_PART2 } from './conditionsRawPart2';
import { RAW_CONDITIONS_PART3 } from './conditionsRawPart3';
import { generateTailoredMissionsForCondition } from './tailoredMissions';
import { CATEGORIES, CATEGORY_NAMES_WITH_ICON, normalizeCategory } from './categories';

const allRawConditions = [...RAW_CONDITIONS, ...RAW_CONDITIONS_PART2, ...RAW_CONDITIONS_PART3];

export const VIRTUAL_CONDITIONS: VirtualCondition[] = allRawConditions.map((item) => {
  const normCat = normalizeCategory(item.categoryId) as any;
  const catObj = CATEGORIES.find(c => c.id === normCat);
  const formattedCategory = CATEGORY_NAMES_WITH_ICON[normCat] || (catObj ? `${catObj.icon} ${catObj.name}` : normCat);

  return {
    conditionId: item.id,
    categoryId: normCat,
    category: normCat,
    categoryLabel: formattedCategory,
    categoryName: catObj ? catObj.name : normCat,
    categoryIcon: catObj ? catObj.icon : '💊',
    name: item.name,
    summary: item.summary,
    checkItemsSample: item.sampleItems,
    prescriptionCandidates: generateTailoredMissionsForCondition(item),
    prescriptionMedicineName: item.medicine,
    prescriptionAdvice: item.advice,
    status: 'active'
  };
});

export const CONDITIONS_MAP: Record<string, VirtualCondition> = VIRTUAL_CONDITIONS.reduce(
  (acc, cond) => {
    acc[cond.conditionId] = cond;
    return acc;
  },
  {} as Record<string, VirtualCondition>
);
