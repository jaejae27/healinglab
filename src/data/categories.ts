import { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'self',
    code: 'S',
    name: '나 자신',
    subName: '자기이해 & 자존감',
    icon: '🪞',
    color: '#F472B6',
    bgLight: '#FDF2F8',
    borderColor: '#FBCFE8',
    desc: '남들과의 비교, 자신감 부족, 내 마음에 대한 솔직한 탐색'
  },
  {
    id: 'friends',
    code: 'R',
    name: '친구·관계',
    subName: '또래 관계 & 소통',
    icon: '💌',
    color: '#FB7185',
    bgLight: '#FFF1F2',
    borderColor: '#FECDD3',
    desc: '친구 사이의 서운함, 눈치, 말하기 어려움, 대화의 거리'
  },
  {
    id: 'study',
    code: 'A',
    name: '공부·할 일',
    subName: '학습 & 실행력',
    icon: '📚',
    color: '#38BDF8',
    bgLight: '#F0F9FF',
    borderColor: '#BAE6FD',
    desc: '미루는 습관, 시작의 어려움, 시험 부담감, 집중의 흩어짐'
  },
  {
    id: 'worries',
    code: 'W',
    name: '걱정·생각',
    subName: '불안 & 생각 과다',
    icon: '🤯',
    color: '#A78BFA',
    bgLight: '#F5F3FF',
    borderColor: '#DDD6FE',
    desc: '꼬리를 무는 생각, 아직 안 일어난 일에 대한 염려, 선택 망설임'
  },
  {
    id: 'emotions',
    code: 'E',
    name: '감정 다루기',
    subName: '분노 & 롤러코스터',
    icon: '🌋',
    color: '#FB923C',
    bgLight: '#FFF7ED',
    borderColor: '#FFEDD5',
    desc: '갑작스러운 짜증, 서운함 폭발, 표정 관리, 감정의 굴곡'
  },
  {
    id: 'vitality',
    code: 'L',
    name: '피로·생활',
    subName: '에너지 & 수면·스마트폰',
    icon: '🪫',
    color: '#34D399',
    bgLight: '#ECFDF5',
    borderColor: '#A7F3D0',
    desc: '방전된 체력, 폰에서 손 못 떼기, 밤늦게 안 자기, 무기력'
  },
  {
    id: 'future',
    code: 'G',
    name: '실패·도전·미래',
    subName: '회복탄력성 & 진로',
    icon: '🌱',
    color: '#4ADE80',
    bgLight: '#F0FDF4',
    borderColor: '#BBF7D0',
    desc: '실패 후의 두려움, 포기하고 싶은 마음, 꿈과 진로에 대한 막막함'
  },
  {
    id: 'school',
    code: 'D',
    name: '학교생활·일상',
    subName: '교실 적응 & 일상',
    icon: '🏫',
    color: '#FBBF24',
    bgLight: '#FFFBEB',
    borderColor: '#FDE68A',
    desc: '발표 부담, 모둠활동 눈치, 질문하기 어려움, 등교 스트레스'
  }
];
