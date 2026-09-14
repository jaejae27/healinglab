import { AssessmentQuestion } from '../types';

export const ASSESSMENT_DOMAINS = {
  self_awareness: {
    key: 'self_awareness',
    name: '자기 인식',
    description: '자신의 감정과 마음신호, 강점과 한계를 정확하게 알아차리는 능력',
    color: '#EC4899', // Pink
    icon: '🪞'
  },
  self_management: {
    key: 'self_management',
    name: '자기 관리',
    description: '스트레스와 충동을 조절하고 목표를 향해 행동을 주도적으로 실행하는 능력',
    color: '#3B82F6', // Blue
    icon: '🧘'
  },
  social_awareness: {
    key: 'social_awareness',
    name: '사회적 인식',
    description: '타인의 감정과 처지를 공감하고 다양한 관점을 존중하는 능력',
    color: '#8B5CF6', // Purple
    icon: '🤝'
  },
  relationship_skills: {
    key: 'relationship_skills',
    name: '대인관계 기술',
    description: '친구와 긍정적인 관계를 맺고 갈등을 평화롭고 건설적으로 해결하는 능력',
    color: '#10B981', // Emerald
    icon: '💬'
  },
  responsible_decision: {
    key: 'responsible_decision',
    name: '책임 있는 의사결정',
    description: '자신의 행동이 미칠 영향을 고려하여 윤리적이고 안전한 선택을 하는 능력',
    color: '#F59E0B', // Amber
    icon: '⚖️'
  }
} as const;

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'Q1_SELF_AWARE',
    domain: 'self_awareness',
    domainName: '자기 인식',
    statement: '나는 화가 나거나 지칠 때 내 몸과 마음에 어떤 마음신호가 켜졌는지 잘 알아차린다.'
  },
  {
    id: 'Q2_SELF_MANAGE',
    domain: 'self_management',
    domainName: '자기 관리',
    statement: '마음이 힘들거나 해야 할 일을 미루고 싶을 때, 나만의 진정 방법이나 작은 5분 행동을 실천한다.'
  },
  {
    id: 'Q3_SOCIAL_AWARE',
    domain: 'social_awareness',
    domainName: '사회적 인식',
    statement: '친구의 표정이나 태도를 관찰하며 친구가 지금 어떤 마음일지 먼저 이해하려고 노력한다.'
  },
  {
    id: 'Q4_RELATION_SKILLS',
    domain: 'relationship_skills',
    domainName: '대인관계 기술',
    statement: '친구에게 서운한 점이 있거나 도움이 필요할 때, 비난하지 않고 솔직하고 차분하게 대화한다.'
  },
  {
    id: 'Q5_RESPONSIBLE_DECISION',
    domain: 'responsible_decision',
    domainName: '책임 있는 의사결정',
    statement: '나의 말과 행동이 나와 주변 친구들에게 어떤 결과를 가져올지 미리 생각하고 신중하게 결정한다.'
  }
];
