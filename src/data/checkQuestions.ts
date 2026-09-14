import { CheckItem } from '../types';

export const CHECK_ITEMS: CheckItem[] = [
  // 1. 나 자신 (self)
  {
    checkId: 'Q-S1',
    categoryId: 'self',
    statement: '친구들과 나를 비교하면서 내 모습이 초라하게 느껴진다.',
    matches: [
      { conditionId: 'S-02', weight: 3 },
      { conditionId: 'S-01', weight: 3 },
      { conditionId: 'S-07', weight: 2 }
    ]
  },
  {
    checkId: 'Q-S2',
    categoryId: 'self',
    statement: '조금이라도 실수하면 모든 게 엉망이 된 것 같아 자책한다.',
    matches: [
      { conditionId: 'S-03', weight: 3 },
      { conditionId: 'S-10', weight: 3 },
      { conditionId: 'S-12', weight: 2 }
    ]
  },
  {
    checkId: 'Q-S3',
    categoryId: 'self',
    statement: '누가 나를 칭찬해주어도 진심이 아닐 거라고 생각하게 된다.',
    matches: [
      { conditionId: 'S-06', weight: 3 },
      { conditionId: 'S-04', weight: 2 },
      { conditionId: 'S-09', weight: 2 }
    ]
  },
  {
    checkId: 'Q-S4',
    categoryId: 'self',
    statement: '내가 무엇을 좋아하고 잘하는지 마음의 소리가 잘 안 들린다.',
    matches: [
      { conditionId: 'S-11', weight: 3 },
      { conditionId: 'S-04', weight: 3 },
      { conditionId: 'S-15', weight: 2 }
    ]
  },
  {
    checkId: 'Q-S5',
    categoryId: 'self',
    statement: '남들의 시선이나 평가에 내 생각과 행동이 크게 흔들린다.',
    matches: [
      { conditionId: 'S-05', weight: 3 },
      { conditionId: 'S-14', weight: 3 },
      { conditionId: 'S-08', weight: 2 }
    ]
  },

  // 2. 친구·관계 (friends)
  {
    checkId: 'Q-R1',
    categoryId: 'friends',
    statement: '친구의 표정이나 사소한 말투 하나가 계속 마음에 걸리고 신경 쓰인다.',
    matches: [
      { conditionId: 'R-03', weight: 3 },
      { conditionId: 'R-09', weight: 2 },
      { conditionId: 'R-02', weight: 2 }
    ]
  },
  {
    checkId: 'Q-R2',
    categoryId: 'friends',
    statement: '친구들 무리에서 나만 겉돌거나 소외되는 것 같은 기분이 든다.',
    matches: [
      { conditionId: 'R-13', weight: 3 },
      { conditionId: 'R-14', weight: 3 },
      { conditionId: 'R-08', weight: 2 }
    ]
  },
  {
    checkId: 'Q-R3',
    categoryId: 'friends',
    statement: '친구에게 서운하거나 거절하고 싶은 말이 있어도 꾹 참게 된다.',
    matches: [
      { conditionId: 'R-10', weight: 3 },
      { conditionId: 'R-07', weight: 3 },
      { conditionId: 'R-15', weight: 1 }
    ]
  },
  {
    checkId: 'Q-R4',
    categoryId: 'friends',
    statement: '메시지를 보내고 답장이 늦으면 내가 실수했나 자꾸 확인한다.',
    matches: [
      { conditionId: 'R-06', weight: 3 },
      { conditionId: 'R-09', weight: 2 },
      { conditionId: 'R-12', weight: 2 }
    ]
  },
  {
    checkId: 'Q-R5',
    categoryId: 'friends',
    statement: '친구들과 어울리는 게 피곤해서 아무도 나를 안 찾았으면 좋겠다.',
    matches: [
      { conditionId: 'R-01', weight: 3 },
      { conditionId: 'R-11', weight: 2 },
      { conditionId: 'R-08', weight: 2 }
    ]
  },

  // 3. 공부·해야 할 일 (study)
  {
    checkId: 'Q-A1',
    categoryId: 'study',
    statement: '해야 하는 건 머리로 아는데 첫 행동을 시작하는 게 너무 힘들다.',
    matches: [
      { conditionId: 'A-05', weight: 3 },
      { conditionId: 'A-07', weight: 3 },
      { conditionId: 'A-01', weight: 2 }
    ]
  },
  {
    checkId: 'Q-A2',
    categoryId: 'study',
    statement: '계획표는 완벽하게 세워놓지만 정작 실천은 자꾸 내일로 미룬다.',
    matches: [
      { conditionId: 'A-06', weight: 3 },
      { conditionId: 'A-08', weight: 3 },
      { conditionId: 'A-12', weight: 2 }
    ]
  },
  {
    checkId: 'Q-A3',
    categoryId: 'study',
    statement: '마감 직전이 되어 발등에 불이 떨어져야만 겨우 초능력으로 해치운다.',
    matches: [
      { conditionId: 'A-09', weight: 3 },
      { conditionId: 'A-01', weight: 2 },
      { conditionId: 'A-13', weight: 2 }
    ]
  },
  {
    checkId: 'Q-A4',
    categoryId: 'study',
    statement: '공부하려고 책을 펴면 딴생각이 나거나 폰을 보느라 1시간이 훌쩍 간다.',
    matches: [
      { conditionId: 'A-10', weight: 3 },
      { conditionId: 'A-11', weight: 3 },
      { conditionId: 'A-03', weight: 2 }
    ]
  },
  {
    checkId: 'Q-A5',
    categoryId: 'study',
    statement: '할 일이 너무 많아서 어디서부터 손대야 할지 멍하고 지쳐버린다.',
    matches: [
      { conditionId: 'A-02', weight: 3 },
      { conditionId: 'A-13', weight: 3 },
      { conditionId: 'A-14', weight: 2 }
    ]
  },

  // 4. 걱정·생각 (worries)
  {
    checkId: 'Q-W1',
    categoryId: 'worries',
    statement: '머릿속에 생각이 꼬리를 물고 이어져서 뇌가 쉴 틈이 없다.',
    matches: [
      { conditionId: 'W-01', weight: 3 },
      { conditionId: 'W-06', weight: 3 },
      { conditionId: 'W-14', weight: 2 }
    ]
  },
  {
    checkId: 'Q-W2',
    categoryId: 'worries',
    statement: '아직 일어나지도 않은 최악의 상황이나 실수를 미리 상상하고 불안해한다.',
    matches: [
      { conditionId: 'W-02', weight: 3 },
      { conditionId: 'W-03', weight: 3 },
      { conditionId: 'W-08', weight: 2 }
    ]
  },
  {
    checkId: 'Q-W3',
    categoryId: 'worries',
    statement: '낮에 했던 사소한 말실수나 행동이 밤에 떠올라 이불을 차며 후회한다.',
    matches: [
      { conditionId: 'W-07', weight: 3 },
      { conditionId: 'W-10', weight: 3 },
      { conditionId: 'W-05', weight: 2 }
    ]
  },
  {
    checkId: 'Q-W4',
    categoryId: 'worries',
    statement: '선택지가 있을 때 후회할까 봐 결정을 내리지 못하고 계속 망설인다.',
    matches: [
      { conditionId: 'W-04', weight: 3 },
      { conditionId: 'W-11', weight: 2 },
      { conditionId: 'W-12', weight: 3 }
    ]
  },
  {
    checkId: 'Q-W5',
    categoryId: 'worries',
    statement: '다른 사람에게 직접 물어보지 않고 혼자 부정적인 결론을 내려버린다.',
    matches: [
      { conditionId: 'W-09', weight: 3 },
      { conditionId: 'W-13', weight: 2 },
      { conditionId: 'W-05', weight: 2 }
    ]
  },

  // 5. 감정 (emotions)
  {
    checkId: 'Q-E1',
    categoryId: 'emotions',
    statement: '별것도 아닌 일에 순간적으로 욱하고 짜증이 솟구친다.',
    matches: [
      { conditionId: 'E-01', weight: 3 },
      { conditionId: 'E-02', weight: 3 },
      { conditionId: 'E-06', weight: 2 }
    ]
  },
  {
    checkId: 'Q-E2',
    categoryId: 'emotions',
    statement: '기분이 좋았다가 갑자기 곤두박질치는 등 감정의 굴곡이 심하다.',
    matches: [
      { conditionId: 'E-03', weight: 3 },
      { conditionId: 'E-12', weight: 3 },
      { conditionId: 'E-11', weight: 2 }
    ]
  },
  {
    checkId: 'Q-E3',
    categoryId: 'emotions',
    statement: '속상하고 화가 나도 겉으로는 "나 괜찮아" 하고 억지로 숨긴다.',
    matches: [
      { conditionId: 'E-10', weight: 3 },
      { conditionId: 'E-13', weight: 3 },
      { conditionId: 'E-07', weight: 2 }
    ]
  },
  {
    checkId: 'Q-E4',
    categoryId: 'emotions',
    statement: '화가 나면 입을 꾹 닫고 말을 안 하거나 반대로 날카로운 말이 튀어나온다.',
    matches: [
      { conditionId: 'E-08', weight: 3 },
      { conditionId: 'E-09', weight: 3 },
      { conditionId: 'E-01', weight: 2 }
    ]
  },
  {
    checkId: 'Q-E5',
    categoryId: 'emotions',
    statement: '지금 내 기분이 어떤 상태인지 스스로도 이름을 붙이기 어렵다.',
    matches: [
      { conditionId: 'E-05', weight: 3 },
      { conditionId: 'E-14', weight: 3 },
      { conditionId: 'E-04', weight: 2 }
    ]
  },

  // 6. 피로·생활 (vitality)
  {
    checkId: 'Q-L1',
    categoryId: 'vitality',
    statement: '에너지 배터리가 0%인 것처럼 몸과 마음에 힘이 하나도 없다.',
    matches: [
      { conditionId: 'L-01', weight: 3 },
      { conditionId: 'L-02', weight: 3 },
      { conditionId: 'L-06', weight: 2 }
    ]
  },
  {
    checkId: 'Q-L2',
    categoryId: 'vitality',
    statement: '스마트폰을 손에서 떼지 못하고 의미 없이 계속 스크롤을 내린다.',
    matches: [
      { conditionId: 'L-03', weight: 3 },
      { conditionId: 'L-08', weight: 3 },
      { conditionId: 'L-07', weight: 2 }
    ]
  },
  {
    checkId: 'Q-L3',
    categoryId: 'vitality',
    statement: '내일 피곤할 걸 알면서도 밤에 자는 게 아까워서 늦게까지 버틴다.',
    matches: [
      { conditionId: 'L-04', weight: 3 },
      { conditionId: 'L-14', weight: 3 },
      { conditionId: 'L-13', weight: 2 }
    ]
  },
  {
    checkId: 'Q-L4',
    categoryId: 'vitality',
    statement: '침대나 바닥에 누워만 있고 싶고 일어나서 움직이기가 버겁다.',
    matches: [
      { conditionId: 'L-07', weight: 3 },
      { conditionId: 'L-05', weight: 3 },
      { conditionId: 'L-12', weight: 2 }
    ]
  },
  {
    checkId: 'Q-L5',
    categoryId: 'vitality',
    statement: '잠을 아무리 자거나 쉬어도 쉰 것 같지 않고 피로가 누적되어 있다.',
    matches: [
      { conditionId: 'L-10', weight: 3 },
      { conditionId: 'L-11', weight: 3 },
      { conditionId: 'L-09', weight: 2 }
    ]
  },

  // 7. 실패·도전·미래 (future)
  {
    checkId: 'Q-G1',
    categoryId: 'future',
    statement: '한 번 실수하거나 실패했던 경험 때문에 다시 도전하기가 무섭다.',
    matches: [
      { conditionId: 'G-02', weight: 3 },
      { conditionId: 'G-03', weight: 3 },
      { conditionId: 'G-10', weight: 2 }
    ]
  },
  {
    checkId: 'Q-G2',
    categoryId: 'future',
    statement: '남들보다 잘할 자신이 없으면 아예 시작하기 전부터 포기하고 싶다.',
    matches: [
      { conditionId: 'G-06', weight: 3 },
      { conditionId: 'G-07', weight: 3 },
      { conditionId: 'G-04', weight: 2 }
    ]
  },
  {
    checkId: 'Q-G3',
    categoryId: 'future',
    statement: '내 꿈이나 미래의 진로를 생각하면 안갯속처럼 막막하고 불안하다.',
    matches: [
      { conditionId: 'G-05', weight: 3 },
      { conditionId: 'G-09', weight: 3 },
      { conditionId: 'G-12', weight: 2 }
    ]
  },
  {
    checkId: 'Q-G4',
    categoryId: 'future',
    statement: '다른 친구들은 목표가 뚜렷해 보이는데 나만 아무 계획 없는 것 같다.',
    matches: [
      { conditionId: 'G-15', weight: 3 },
      { conditionId: 'G-14', weight: 2 },
      { conditionId: 'G-13', weight: 2 }
    ]
  },
  {
    checkId: 'Q-G5',
    categoryId: 'future',
    statement: '과정의 배움보다 시험 점수나 합격 같은 결과만 자꾸 신경 쓰인다.',
    matches: [
      { conditionId: 'G-08', weight: 3 },
      { conditionId: 'G-01', weight: 2 },
      { conditionId: 'G-11', weight: 2 }
    ]
  },

  // 8. 학교생활·일상 (school)
  {
    checkId: 'Q-D1',
    categoryId: 'school',
    statement: '아침에 눈떠서 학교에 가야 한다는 생각만 하면 한숨부터 나온다.',
    matches: [
      { conditionId: 'D-01', weight: 3 },
      { conditionId: 'D-02', weight: 3 },
      { conditionId: 'D-10', weight: 2 }
    ]
  },
  {
    checkId: 'Q-D2',
    categoryId: 'school',
    statement: '수업 시간에 발표하거나 내 차례가 다가오면 심장이 터질 듯 떨린다.',
    matches: [
      { conditionId: 'D-04', weight: 3 },
      { conditionId: 'D-07', weight: 3 },
      { conditionId: 'D-05', weight: 2 }
    ]
  },
  {
    checkId: 'Q-D3',
    categoryId: 'school',
    statement: '모르는 내용이나 고민이 있어도 선생님께 질문하기가 망설여진다.',
    matches: [
      { conditionId: 'D-06', weight: 3 },
      { conditionId: 'D-11', weight: 3 },
      { conditionId: 'D-05', weight: 1 }
    ]
  },
  {
    checkId: 'Q-D4',
    categoryId: 'school',
    statement: '교실에서 친구들과 어울리기 어렵거나 종일 눈치를 보느라 지친다.',
    matches: [
      { conditionId: 'D-09', weight: 3 },
      { conditionId: 'D-12', weight: 3 },
      { conditionId: 'D-08', weight: 2 }
    ]
  }
];
