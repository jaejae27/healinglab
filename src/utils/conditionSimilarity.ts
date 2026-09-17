import { VirtualCondition } from '../types';
import { VIRTUAL_CONDITIONS } from '../data/conditions';

export interface ConditionSimilarityResult {
  duplicateRate: number; // 0 ~ 100
  level: 'low' | 'medium' | 'high';
  levelLabel: string;
  levelColor: string;
  matchedCondition?: {
    conditionId: string;
    name: string;
    summary: string;
    score: number;
  };
  matchingKeywords: string[];
  aiReviewAdvice: string;
}

// Korean stop-words to exclude from keyword extraction
const STOP_WORDS = new Set([
  '이', '그', '저', '것', '수', '등', '들', '및', '때', '때문', '안', '못', '더', '또', '다시',
  '그리고', '하지만', '그런데', '있는', '없는', '하는', '하다', '된다', '되다', '같다', '싶다',
  '너무', '아주', '정말', '계속', '자꾸', '그냥', '모든', '많은', '조금', '약간', '항상',
  '에서', '으로', '까지', '부터', '에게', '한테', '처럼', '보다'
]);

function extractKeywords(text: string): string[] {
  if (!text) return [];
  // Clean punctuation and split by whitespace
  const cleaned = text.replace(/[^가-힣a-zA-Z0-9\s]/g, ' ');
  const words = cleaned.split(/\s+/).filter((w) => w.length >= 2);
  
  // Strip common Korean particles (조사)
  const stripped = words.map((word) => {
    return word.replace(/(은|는|이|가|을|를|에|의|로|와|과|도|만|나|요|서|고|면|며)$/, '');
  }).filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  return Array.from(new Set(stripped));
}

function getCharBigrams(str: string): Set<string> {
  const s = str.replace(/\s+/g, '').toLowerCase();
  const bigrams = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) {
    bigrams.add(s.slice(i, i + 2));
  }
  return bigrams;
}

function computeBigramDice(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  const b1 = getCharBigrams(str1);
  const b2 = getCharBigrams(str2);
  if (b1.size === 0 || b2.size === 0) return 0;

  let intersection = 0;
  b1.forEach((bg) => {
    if (b2.has(bg)) intersection++;
  });

  return (2 * intersection) / (b1.size + b2.size);
}

export function checkConditionSimilarity(
  proposal: {
    suggestedName: string;
    whenAppears: string;
    symptoms?: string;
    missionIdeas?: string[];
    categoryId?: string;
  },
  existingConditions: VirtualCondition[] = VIRTUAL_CONDITIONS
): ConditionSimilarityResult {
  const proposalKeywords = extractKeywords(
    `${proposal.suggestedName} ${proposal.whenAppears} ${proposal.symptoms || ''} ${(proposal.missionIdeas || []).join(' ')}`
  );
  const proposalBigrams = getCharBigrams(
    `${proposal.suggestedName} ${proposal.whenAppears} ${proposal.symptoms || ''}`
  );

  let bestMatch: VirtualCondition | null = null;
  let bestScore = 0;
  let bestMatchedKeywords: string[] = [];

  for (const cond of existingConditions) {
    // 1. Name similarity (Direct substring, character dice)
    const nameDice = computeBigramDice(proposal.suggestedName, cond.name);
    const isSubstring = cond.name.includes(proposal.suggestedName) || proposal.suggestedName.includes(cond.name);
    const nameScore = isSubstring ? Math.max(0.7, nameDice) : nameDice;

    // 2. Symptoms & Situation text similarity
    const condText = `${cond.name} ${cond.summary} ${(cond.checkItemsSample || []).join(' ')} ${cond.prescriptionAdvice || ''}`;
    const condKeywords = extractKeywords(condText);
    const condBigrams = getCharBigrams(condText);

    // Jaccard keyword overlap
    const commonKeywords = proposalKeywords.filter((k) => condKeywords.includes(k));
    const keywordOverlapScore = proposalKeywords.length > 0
      ? commonKeywords.length / Math.min(proposalKeywords.length, 8)
      : 0;

    // Bigram overlap
    let bgIntersection = 0;
    proposalBigrams.forEach((bg) => {
      if (condBigrams.has(bg)) bgIntersection++;
    });
    const bigramScore = proposalBigrams.size > 0 ? bgIntersection / proposalBigrams.size : 0;

    // Category match bonus
    const catBonus = (proposal.categoryId && (cond.categoryId === proposal.categoryId || (cond as any).category === proposal.categoryId)) ? 0.05 : 0;

    // Weighted total score
    const totalScore = Math.min(
      1,
      nameScore * 0.4 + keywordOverlapScore * 0.35 + bigramScore * 0.2 + catBonus
    );

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestMatch = cond;
      bestMatchedKeywords = commonKeywords;
    }
  }

  const duplicateRate = Math.min(99, Math.max(5, Math.round(bestScore * 100)));

  let level: 'low' | 'medium' | 'high' = 'low';
  let levelLabel = '독창적 아이디어';
  let levelColor = 'emerald';
  let advice = '';

  if (duplicateRate >= 60) {
    level = 'high';
    levelLabel = '높은 중복률 주의';
    levelColor = 'rose';
    advice = `기존 [${bestMatch?.conditionId}] ${bestMatch?.name}과(와) 발생 상황 및 증상 표현이 ${duplicateRate}% 유사합니다. 제안된 행동 처방이 기존 약과 차별화되는지 중점적으로 검토해 주세요.`;
  } else if (duplicateRate >= 35) {
    level = 'medium';
    levelLabel = '보통 유사도 (일부 겹침)';
    levelColor = 'amber';
    advice = `기존 [${bestMatch?.conditionId}] ${bestMatch?.name}과(와) 공통 키워드(${bestMatchedKeywords.slice(0, 3).join(', ') || '유사한 감정'})가 일부 겹칩니다. 학생만의 고유한 표현이나 차별화 포인트가 있다면 채택 가능합니다.`;
  } else {
    level = 'low';
    levelLabel = '독창적인 신약';
    levelColor = 'emerald';
    advice = `기존 130종 마음신호에 없는 매우 신선하고 독창적인 증상입니다! 학생의 섬세한 자기관찰과 창의적 시각이 돋보입니다. 적극 채택을 권장합니다.`;
  }

  return {
    duplicateRate,
    level,
    levelLabel,
    levelColor,
    matchedCondition: bestMatch
      ? {
          conditionId: bestMatch.conditionId,
          name: bestMatch.name,
          summary: bestMatch.summary,
          score: duplicateRate
        }
      : undefined,
    matchingKeywords: bestMatchedKeywords.slice(0, 5),
    aiReviewAdvice: advice
  };
}
