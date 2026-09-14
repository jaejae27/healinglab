import { AssessmentQuestion, AssessmentDomainKey } from '../types';

export const ASSESSMENT_DOMAINS: Record<
  AssessmentDomainKey,
  {
    key: AssessmentDomainKey;
    num: number;
    name: string;
    subName: string;
    description: string;
    color: string;
    icon: string;
  }
> = {
  self_awareness: {
    key: 'self_awareness',
    num: 1,
    name: '감정 알아차리기',
    subName: '자기인식',
    description: '자신의 감정과 마음 상태, 신체 및 심리 변화를 면밀히 알아차리는 능력',
    color: '#EC4899', // Pink
    icon: '🪞'
  },
  self_regulation: {
    key: 'self_regulation',
    num: 2,
    name: '감정 다루기',
    subName: '자기조절',
    description: '충동이나 격한 감정에 휩쓸리지 않고 스스로를 진정시키고 조절하는 능력',
    color: '#3B82F6', // Blue
    icon: '🧘'
  },
  self_care: {
    key: 'self_care',
    num: 3,
    name: '나를 돌보기',
    subName: '자기돌봄',
    description: '지치고 힘들 때 필요한 휴식을 찾고 긍정적인 자기 위로와 회복을 실천하는 능력',
    color: '#10B981', // Emerald
    icon: '🌿'
  },
  help_seeking: {
    key: 'help_seeking',
    num: 4,
    name: '도움 요청하기',
    subName: '관계·의사소통',
    description: '어려움 앞에서 도움을 요청하고 신뢰할 수 있는 이와 건강하게 소통하는 능력',
    color: '#8B5CF6', // Purple
    icon: '💬'
  },
  empathy_action: {
    key: 'empathy_action',
    num: 5,
    name: '타인을 이해하고 행동하기',
    subName: '공감·사회적 실천',
    description: '타인의 감정에 공감하고 주변의 어려움에 다정하고 지혜로운 도움을 실천하는 능력',
    color: '#F59E0B', // Amber
    icon: '🤝'
  }
};

// 20 Core Likert Questions (100점 만점 환산: 20문항 × 5점 = 100점)
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // ① 감정 알아차리기 ― 자기인식
  {
    id: 'Q1',
    num: 1,
    domain: 'self_awareness',
    domainName: '감정 알아차리기 ― 자기인식',
    statement: '나는 지금 내가 어떤 감정을 느끼고 있는지 알아차릴 수 있다.'
  },
  {
    id: 'Q2',
    num: 2,
    domain: 'self_awareness',
    domainName: '감정 알아차리기 ― 자기인식',
    statement: '나는 기분이 좋지 않을 때 왜 그런 기분이 들었는지 생각해 볼 수 있다.'
  },
  {
    id: 'Q3',
    num: 3,
    domain: 'self_awareness',
    domainName: '감정 알아차리기 ― 자기인식',
    statement: '나는 스트레스를 받을 때 내 몸이나 마음에 나타나는 변화를 알아차릴 수 있다.'
  },
  {
    id: 'Q4',
    num: 4,
    domain: 'self_awareness',
    domainName: '감정 알아차리기 ― 자기인식',
    statement: '나는 여러 감정이 동시에 들 때 각각의 감정을 구분해서 표현할 수 있다.'
  },

  // ② 감정 다루기 ― 자기조절
  {
    id: 'Q5',
    num: 5,
    domain: 'self_regulation',
    domainName: '감정 다루기 ― 자기조절',
    statement: '화나거나 속상한 일이 생겨도 바로 행동하기 전에 잠시 멈출 수 있다.'
  },
  {
    id: 'Q6',
    num: 6,
    domain: 'self_regulation',
    domainName: '감정 다루기 ― 자기조절',
    statement: '기분이 좋지 않을 때 나를 진정시키는 방법을 알고 있다.'
  },
  {
    id: 'Q7',
    num: 7,
    domain: 'self_regulation',
    domainName: '감정 다루기 ― 자기조절',
    statement: '걱정이나 스트레스가 생겼을 때 그것을 줄이기 위해 할 수 있는 행동이 있다.'
  },
  {
    id: 'Q8',
    num: 8,
    domain: 'self_regulation',
    domainName: '감정 다루기 ― 자기조절',
    statement: '힘든 감정이 생기더라도 그 감정에 계속 끌려가기보다 다른 방법을 찾아볼 수 있다.'
  },

  // ③ 나를 돌보기 ― 자기돌봄
  {
    id: 'Q9',
    num: 9,
    domain: 'self_care',
    domainName: '나를 돌보기 ― 자기돌봄',
    statement: '나는 내가 지치거나 힘들 때 휴식이 필요하다는 것을 알아차릴 수 있다.'
  },
  {
    id: 'Q10',
    num: 10,
    domain: 'self_care',
    domainName: '나를 돌보기 ― 자기돌봄',
    statement: '나는 나에게 도움이 되는 휴식이나 회복 방법이 무엇인지 알고 있다.'
  },
  {
    id: 'Q11',
    num: 11,
    domain: 'self_care',
    domainName: '나를 돌보기 ― 자기돌봄',
    statement: '힘든 일이 있을 때 나 자신에게 지나치게 부정적인 말을 하지 않으려고 노력한다.'
  },
  {
    id: 'Q12',
    num: 12,
    domain: 'self_care',
    domainName: '나를 돌보기 ― 자기돌봄',
    statement: '기분이 좋지 않을 때 나를 조금 더 편안하게 해 줄 행동을 선택할 수 있다.'
  },

  // ④ 도움 요청하기 ― 관계·의사소통
  {
    id: 'Q13',
    num: 13,
    domain: 'help_seeking',
    domainName: '도움 요청하기 ― 관계·의사소통',
    statement: '혼자 해결하기 어려운 일이 생기면 다른 사람에게 도움을 요청할 수 있다.'
  },
  {
    id: 'Q14',
    num: 14,
    domain: 'help_seeking',
    domainName: '도움 요청하기 ― 관계·의사소통',
    statement: '힘든 일이 있을 때 믿고 이야기할 수 있는 사람이 한 명 이상 있다.'
  },
  {
    id: 'Q15',
    num: 15,
    domain: 'help_seeking',
    domainName: '도움 요청하기 ― 관계·의사소통',
    statement: '친구가 힘들어 보일 때 어떤 말을 해 주면 좋을지 생각할 수 있다.'
  },
  {
    id: 'Q16',
    num: 16,
    domain: 'help_seeking',
    domainName: '도움 요청하기 ― 관계·의사소통',
    statement: '친구의 고민을 들을 때 바로 판단하거나 해결책을 말하기보다 먼저 이야기를 들어줄 수 있다.'
  },

  // ⑤ 타인을 이해하고 행동하기 ― 공감·사회적 실천
  {
    id: 'Q17',
    num: 17,
    domain: 'empathy_action',
    domainName: '타인을 이해하고 행동하기 ― 공감·사회적 실천',
    statement: '사람마다 같은 상황에서도 서로 다른 감정을 느낄 수 있다는 것을 이해한다.'
  },
  {
    id: 'Q18',
    num: 18,
    domain: 'empathy_action',
    domainName: '타인을 이해하고 행동하기 ― 공감·사회적 실천',
    statement: '친구가 표현한 말이나 행동 뒤에 어떤 감정이 있을지 생각해 볼 수 있다.'
  },
  {
    id: 'Q19',
    num: 19,
    domain: 'empathy_action',
    domainName: '타인을 이해하고 행동하기 ― 공감·사회적 실천',
    statement: '주변 사람이 힘들어 보일 때 내가 할 수 있는 작은 도움을 찾아볼 수 있다.'
  },
  {
    id: 'Q20',
    num: 20,
    domain: 'empathy_action',
    domainName: '타인을 이해하고 행동하기 ― 공감·사회적 실천',
    statement: '나와 친구의 마음을 건강하게 돌보기 위해 내가 할 수 있는 행동을 실천할 수 있다.'
  }
];

// 힐링약국 핵심 성과지표(KPI) 문항 - 나의 마음 처방 자신감
export const KPI_QUESTION = {
  id: 'Q_KPI',
  title: '나의 마음 처방 자신감 (핵심 역량 지표)',
  statement: '나는 마음이 힘들 때 나에게 필요한 ‘마음 처방’을 스스로 찾아볼 수 있다.'
};

// 사전·사후 공통 서술형 질문
export const COMMON_DESCRIPTIVE_QUESTIONS = {
  q21: {
    id: 'q21_feelings',
    num: 21,
    title: '요즘 자주 느끼는 감정이나 마음 상태',
    guide: '요즘 내가 자주 느끼는 감정이나 마음 상태를 1~3개의 말로 적어보세요.',
    placeholder: '예: 피곤함 / 걱정 / 설렘 / 답답함 / 뿌듯함'
  },
  q22: {
    id: 'q22_stressCoping',
    num: 22,
    title: '힘들거나 스트레스를 받을 때 대처 방식',
    guide: '힘들거나 스트레스를 받을 때 나는 보통 어떻게 하나요?',
    placeholder: '솔직하고 자유롭게 적어보세요 (예: 그냥 참는다, 친구에게 털어놓는다, 좋아하는 음악을 듣는다)'
  }
};

// 사후검사 프로그램 효과 분석 문항 (5점 척도, 만족/효과 분석용)
export const PROGRAM_EFFECT_QUESTIONS = [
  {
    id: 'PE1',
    num: 23,
    statement: '힐링약국 활동을 하면서 내 감정을 이전보다 더 잘 알아차리게 되었다.'
  },
  {
    id: 'PE2',
    num: 24,
    statement: '힐링약국 활동을 하면서 마음이 힘들 때 사용할 수 있는 방법을 새롭게 알게 되었다.'
  },
  {
    id: 'PE3',
    num: 25,
    statement: '힐링약국 활동을 하면서 힘든 일을 혼자 해결하지 않고 도움을 요청하는 것도 좋은 방법이라는 것을 알게 되었다.'
  },
  {
    id: 'PE4',
    num: 26,
    statement: '힐링약국 활동을 하면서 친구의 감정과 고민을 이해하려는 마음이 커졌다.'
  },
  {
    id: 'PE5',
    num: 27,
    statement: '힐링약국에서 배운 방법 중 앞으로 실제 생활에서 사용해 보고 싶은 것이 있다.'
  }
];

// 사후 서술형 3문항 (공모전 학생 성장 사례 발굴용)
export const POST_DESCRIPTIVE_GROWTH_QUESTIONS = [
  {
    id: 'q28_mindChanged',
    num: 28,
    title: '내 마음을 대하는 방법의 변화',
    guide: '힐링약국 활동을 하기 전과 비교했을 때 내 마음을 대하는 방법에서 달라진 점이 있다면 무엇인가요?',
    placeholder: '예: 예전에는 속상하면 무작정 참거나 짜증을 냈는데, 이제는 내가 왜 그런지 잠깐 멈추고 5분 산책이나 심호흡을 해요.'
  },
  {
    id: 'q29_favoritePrescription',
    num: 29,
    title: '실제 생활에서 계속 사용하고 싶은 나만의 마음 처방',
    guide: '힐링약국에서 알게 된 방법 중 실제 생활에서 사용해 보고 싶은 ‘마음 처방’ 한 가지를 적어보세요.',
    placeholder: '예: 숙제 미룰 때 딱 5분 타이머 맞추고 시작하기, 자기 전 걱정노트에 3줄 적고 덮기'
  },
  {
    id: 'q30_friendAction',
    num: 30,
    title: '친구가 힘들어할 때 나의 행동 변화',
    guide: '친구가 힘들어할 때 이제 나는 어떻게 행동할 것 같나요?',
    placeholder: '예: 성급하게 충고하기보다 친구의 말을 끝까지 들어주고 "힘들었겠다"라고 따뜻하게 공감해 줄 거예요.'
  }
];
