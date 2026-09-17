import { ResearcherTitle } from '../types';

export const RESEARCHER_TITLES: ResearcherTitle[] = [
  {
    tier: 0,
    requiredApprovals: 0,
    name: '신약 연구 꿈나무',
    emoji: '🧪',
    bonusCookies: 0,
    description: '첫 마음신호 제안을 준비하거나 선생님의 첫 채택을 기다리는 중입니다.'
  },
  {
    tier: 1,
    requiredApprovals: 1,
    name: '주니어 연구원',
    emoji: '🌱',
    bonusCookies: 2,
    description: '첫 번째 제안이 정식 마음신호로 채택되었습니다! (+2🍪 달성 보너스)'
  },
  {
    tier: 2,
    requiredApprovals: 2,
    name: '어시스턴트 연구원',
    emoji: '🌿',
    bonusCookies: 2,
    description: '꾸준한 마음 관찰로 두 번째 채택을 달성했습니다! (+2🍪 달성 보너스)'
  },
  {
    tier: 3,
    requiredApprovals: 3,
    name: '선임 신약 연구원',
    emoji: '🔬',
    bonusCookies: 3,
    description: '학급 친구들의 깊은 공감을 이끌어내는 정식 연구원입니다. (+3🍪 달성 보너스)'
  },
  {
    tier: 4,
    requiredApprovals: 5,
    name: '수석 마음치유사',
    emoji: '💡',
    bonusCookies: 5,
    description: '마음의 원리를 통찰하고 5개 이상의 훌륭한 처방을 창작했습니다. (+5🍪 달성 보너스)'
  },
  {
    tier: 5,
    requiredApprovals: 7,
    name: '마음약학 명예교수',
    emoji: '🌟',
    bonusCookies: 7,
    description: '힐링약국 연구소의 든든한 기둥이자 마음 상담의 대가입니다. (+7🍪 달성 보너스)'
  },
  {
    tier: 6,
    requiredApprovals: 10,
    name: '전설의 신약개발 명장',
    emoji: '👑',
    bonusCookies: 10,
    description: '10개 이상의 마음신호를 개발하여 전교생의 마음을 치유한 전설의 명장입니다. (+10🍪 달성 보너스)'
  }
];

export function getResearcherTitle(approvedCount: number): ResearcherTitle {
  let highest = RESEARCHER_TITLES[0];
  for (const title of RESEARCHER_TITLES) {
    if (approvedCount >= title.requiredApprovals) {
      highest = title;
    }
  }
  return highest;
}

export function getNextResearcherTitle(approvedCount: number): { nextTitle: ResearcherTitle; remaining: number } | null {
  for (const title of RESEARCHER_TITLES) {
    if (title.requiredApprovals > approvedCount) {
      return {
        nextTitle: title,
        remaining: title.requiredApprovals - approvedCount
      };
    }
  }
  return null;
}

export function checkTitleRewardOnApproval(
  previousCount: number,
  newCount: number
): { reachedTitle: ResearcherTitle; bonusCookies: number } | null {
  const prevTitle = getResearcherTitle(previousCount);
  const newTitle = getResearcherTitle(newCount);

  if (newTitle.tier > prevTitle.tier && newTitle.bonusCookies > 0) {
    return {
      reachedTitle: newTitle,
      bonusCookies: newTitle.bonusCookies
    };
  }
  return null;
}
