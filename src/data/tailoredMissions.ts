import { PrescriptionCandidate } from '../types';
import { RawConditionItem } from './conditionsRaw';

// Condition-specific custom mission mappings for popular/notable conditions
const CUSTOM_CONDITION_MISSIONS: Record<string, PrescriptionCandidate[]> = {
  // A-01: 시험 D-1 타조증후군
  'A-01': [
    {
      id: 'A-01-TM1',
      type: 'action',
      title: '타조 고개 들기 (목차 스캔)',
      description: '시험 범위의 큰 제목과 목차만 형광펜으로 1분간 눈으로 쓱 훑어보기'
    },
    {
      id: 'A-01-TM2',
      type: 'action',
      title: '가장 만만한 3문제 풀기',
      description: '어려운 킬러 문항 대신 교과서 기본 예제 3개만 가볍게 풀어 성공 경험 만들기'
    },
    {
      id: 'A-01-TM3',
      type: 'notice',
      title: '시험 불안 종이에 털어내기',
      description: '머릿속을 어지럽히는 시험 걱정을 이면지에 끄적이고 반으로 접어 필통에 넣기'
    },
    {
      id: 'A-01-TM4',
      type: 'environment',
      title: '스탠드 조명 집중 구역 만들기',
      description: '책상 위 잡동사니를 치우고 스탠드 불빛 아래 교재 1권만 올려놓기'
    },
    {
      id: 'A-01-TM5',
      type: 'action',
      title: '5분 뽀모도로 스타트',
      description: '부담 없이 딱 5분만 타이머 맞추고 공부 시작하기 (5분 지나면 쉬어도 OK)'
    },
    {
      id: 'A-01-TM6',
      type: 'environment',
      title: '도파민 폰 격리',
      description: '공부하는 동안 스마트폰을 가방이나 다른 방 서랍 속에 쏙 넣어두기'
    },
    {
      id: 'A-01-TM7',
      type: 'notice',
      title: '시작이 반 셀프 토닥임',
      description: '책을 펼친 순간 "피하지 않고 시작한 나 자신 멋지다" 한마디 건네기'
    }
  ],

  // L-01: 스마트폰 숏폼 표류증
  'L-01': [
    {
      id: 'L-01-TM1',
      type: 'environment',
      title: '폰 서랍 감금 30분',
      description: '화면에서 눈을 떼고 스마트폰을 서랍이나 가방 속에 30분간 보이지 않게 넣기'
    },
    {
      id: 'L-01-TM2',
      type: 'action',
      title: '숏폼 타이머 15분 제한',
      description: '영상 보기 전 타이머 15분을 맞추고 알람이 울리면 미련 없이 앱 닫기'
    },
    {
      id: 'L-01-TM3',
      type: 'notice',
      title: '넘기기 전 귓불 5초 마사지',
      description: '손가락으로 다음 영상을 넘기려 할 때 멈추고 귓불을 5초간 지그시 마사지하기'
    },
    {
      id: 'L-01-TM4',
      type: 'action',
      title: '현실 감각: 시원한 물 한 컵',
      description: '화면을 끄고 시원한 물 한 모금 마시며 창밖 먼 풍경 30초 바라보기'
    },
    {
      id: 'L-01-TM5',
      type: 'environment',
      title: '침대와 폰 1미터 거리두기',
      description: '잠들기 전 스마트폰 충전기를 침대에서 손이 안 닿는 책상 위에 꽂아두기'
    },
    {
      id: 'L-01-TM6',
      type: 'notice',
      title: '진짜 하고 싶던 일 떠올리기',
      description: '멍하니 영상을 보다 "지금 내가 진짜 하고 싶었던 일은 뭐였지?" 자문해보기'
    },
    {
      id: 'L-01-TM7',
      type: 'action',
      title: '좋아하는 음악 1곡 온전히 듣기',
      description: '빠른 쇼츠 영상 대신 차분한 음악 한 곡을 눈 감고 끝까지 감상하기'
    }
  ],

  // S-01: 투명인간 소외증
  'S-01': [
    {
      id: 'S-01-TM1',
      type: 'notice',
      title: '나만의 온기 찾기',
      description: '양손을 포개어 가슴에 얹고 내 심장박동과 체온을 10초간 가만히 느껴보기'
    },
    {
      id: 'S-01-TM2',
      type: 'action',
      title: '다정한 눈인사 1번',
      description: '교실에서 마주치는 친구나 선생님께 살며시 눈웃음이나 가벼운 목례 건네기'
    },
    {
      id: 'S-01-TM3',
      type: 'environment',
      title: '나만의 아늑한 힐링 스팟',
      description: '도서관, 벤치, 창가 등 내가 가장 편안하게 쉴 수 있는 학교 공간 찾아보기'
    },
    {
      id: 'S-01-TM4',
      type: 'notice',
      title: '자체 발광 칭찬 1가지',
      description: '남들의 시선과 상관없이 오늘 내가 잘한 소소한 행동 1가지 메모장에 적기'
    },
    {
      id: 'S-01-TM5',
      type: 'action',
      title: '편안한 친구에게 안부 톡',
      description: '나를 편하게 해주는 친구에게 귀여운 이모티콘과 함께 짧은 안부 보내기'
    },
    {
      id: 'S-01-TM6',
      type: 'environment',
      title: '내 자리에 작은 행복 소품 두기',
      description: '필통이나 책상 위에 내가 좋아하는 스티커나 키링을 두고 볼 때마다 미소 짓기'
    }
  ],

  // R-01: 단톡방 1 사라짐 집착증
  'R-01': [
    {
      id: 'R-01-TM1',
      type: 'environment',
      title: '단톡방 알림 1시간 음소거',
      description: '카톡 알림을 무음으로 끄고 폰을 엎어둔 채 온전히 내 할 일에 몰입하기'
    },
    {
      id: 'R-01-TM2',
      type: 'notice',
      title: '상대방의 시간 존중 선언',
      description: '"친구도 밥 먹거나 쉬는 중일 거야"라고 속으로 소리 내어 말해보기'
    },
    {
      id: 'R-01-TM3',
      type: 'action',
      title: '스마트폰 내려놓고 기지개 켜기',
      description: '답장 기다리며 긴장된 몸을 자리에서 일어나 활짝 기지개 켜며 리셋하기'
    },
    {
      id: 'R-01-TM4',
      type: 'notice',
      title: '불안 메모 구겨 던지기',
      description: '"혹시 내가 실수했나?"라는 불안한 생각을 메모지에 적고 쓰레기통에 슛하기'
    },
    {
      id: 'R-01-TM5',
      type: 'action',
      title: '다른 탭 전환: 책 또는 그림',
      description: '채팅방을 계속 들락거리는 대신 좋아하는 만화책 1화 읽거나 낙서하기'
    }
  ]
};

// Generic generator that produces condition-specific, empathetic middle school missions
export function generateTailoredMissionsForCondition(item: RawConditionItem): PrescriptionCandidate[] {
  // If specific hand-crafted missions exist, return them
  if (CUSTOM_CONDITION_MISSIONS[item.id]) {
    return CUSTOM_CONDITION_MISSIONS[item.id];
  }

  const name = item.name;
  const condId = item.id;
  const medicine = item.medicine || '힐링처방';
  const categoryId = item.categoryId;

  // Category specific mission banks tailored with condition details
  switch (categoryId) {
    case 'study':
      return [
        {
          id: `${condId}-TM1`,
          type: 'action',
          title: `만만한 3분 스타트 (${medicine})`,
          description: `"${name}"이 올라올 때, 딱 3분만 타이머 켜고 교재나 문제집 1페이지만 펼쳐보기`
        },
        {
          id: `${condId}-TM2`,
          type: 'environment',
          title: '책상 위 시야 정돈 & 폰 격리',
          description: '시선을 분산시키는 스마트폰과 잡동사니를 서랍이나 가방 속에 쏙 넣어두기'
        },
        {
          id: `${condId}-TM3`,
          type: 'action',
          title: '핵심 개념 1개 소리 내어 읽기',
          description: '외우려고 애쓰지 말고, 만만한 교과서 문장 1개를 라디오 DJ처럼 낭독해보기'
        },
        {
          id: `${condId}-TM4`,
          type: 'notice',
          title: `부담감 털어내기 한 줄 메모`,
          description: `지금 공부하기 싫거나 막막한 솔직한 마음을 포스트잇에 적고 꾹 접어두기`
        },
        {
          id: `${condId}-TM5`,
          type: 'action',
          title: '찬물 한 컵 & 목 스트레칭',
          description: '공부 시작 전 시원한 물 한 모금 마시고, 고개를 좌우로 천천히 3회 돌려주기'
        },
        {
          id: `${condId}-TM6`,
          type: 'notice',
          title: '오늘의 작은 완수 칭찬',
          description: '완벽하지 않아도 오늘 목표의 10%라도 해낸 나에게 "시작해낸 게 어디야!" 격려하기'
        },
        {
          id: `${condId}-TM7`,
          type: 'environment',
          title: '공부 후 보상 간식 예약',
          description: '할 일을 20분 마친 뒤 먹을 좋아하는 간식이나 음료수를 미리 책상 옆에 준비해두기'
        }
      ];

    case 'friends':
      return [
        {
          id: `${condId}-TM1`,
          type: 'notice',
          title: `내 감정 안테나 확인 (${name})`,
          description: `친구 관계에서 서운하거나 긴장될 때, 내 표정과 어깨에 힘이 들어갔는지 알아차리기`
        },
        {
          id: `${condId}-TM2`,
          type: 'action',
          title: '따뜻한 눈인사 또는 가벼운 톡',
          description: '친구에게 부담 없는 귀여운 짤이나 "오늘 학교 끝나고 뭐해?" 가볍게 먼저 건네기'
        },
        {
          id: `${condId}-TM3`,
          type: 'environment',
          title: '관계 눈치 오프: 30분 나만의 쉼',
          description: '단톡방 알림을 무음으로 해두고 30분 동안 내가 좋아하는 취미나 음악에 집중하기'
        },
        {
          id: `${condId}-TM4`,
          type: 'action',
          title: '속상한 말 대신 심호흡 3회',
          description: '친구 말에 상처받았을 때 욱하거나 참지 말고, 숨을 깊게 3번 들이쉬고 내쉬기'
        },
        {
          id: `${condId}-TM5`,
          type: 'notice',
          title: '친구 장점 1가지 마음속 발견',
          description: '서운했던 친구의 긍정적인 면이나 고마웠던 순간 1가지를 떠올려보기'
        },
        {
          id: `${condId}-TM6`,
          type: 'action',
          title: '부드러운 거절 연습',
          description: '무리한 요구에 "지금은 조금 어렵고 다음에 같이 하자"라고 다정하게 말해보기'
        },
        {
          id: `${condId}-TM7`,
          type: 'environment',
          title: '진짜 편안한 아지트 찾기',
          description: '친구들 눈치 보지 않고 편안하게 숨 쉴 수 있는 교실 구석이나 벤치에서 쉬기'
        }
      ];

    case 'self':
      return [
        {
          id: `${condId}-TM1`,
          type: 'notice',
          title: `거울 보고 미소 짓기 (${medicine})`,
          description: `거울 속 나를 보며 "오늘 하루도 애쓰고 있어, 넌 충분히 괜찮아" 속삭여주기`
        },
        {
          id: `${condId}-TM2`,
          type: 'action',
          title: '비교 스위치 끄기 선언',
          description: '남들과 비교하는 생각이 들 때 손바닥을 털며 "나는 나만의 멋이 있어" 외치기'
        },
        {
          id: `${condId}-TM3`,
          type: 'environment',
          title: '나만의 자랑거리 3가지 적기',
          description: '작은 손재주, 다정한 성격, 웃음소리 등 사소하지만 소중한 내 장점 3개 적기'
        },
        {
          id: `${condId}-TM4`,
          type: 'action',
          title: '칭찬 감사히 받기',
          description: '누군가 칭찬해주면 "아니에요" 대신 "고마워! 그렇게 봐줘서 기뻐" 방긋 웃기'
        },
        {
          id: `${condId}-TM5`,
          type: 'notice',
          title: '몸 감각 토닥이기',
          description: '양팔을 교차해 내 어깨를 감싸안는 나비 포옹을 하며 10초간 토닥토닥 위로하기'
        },
        {
          id: `${condId}-TM6`,
          type: 'environment',
          title: '좋아하는 향기나 소품 챙기기',
          description: '기분 좋아지는 핸드크림을 바르거나 좋아하는 볼펜으로 필기하며 힐링하기'
        },
        {
          id: `${condId}-TM7`,
          type: 'action',
          title: '오늘의 작은 성공 축하',
          description: '아침에 일어난 것, 숙제를 제출한 것 등 사소한 성공 1가지를 스스로 칭찬하기'
        }
      ];

    case 'worries':
      return [
        {
          id: `${condId}-TM1`,
          type: 'notice',
          title: '걱정 분리수거 메모',
          description: '머릿속을 맴도는 막연한 불안을 종이에 다 쏟아내어 적은 뒤 구겨서 버리기'
        },
        {
          id: `${condId}-TM2`,
          type: 'action',
          title: '4-7-8 안정 심호흡',
          description: '4초간 코로 숨을 들이마시고, 7초간 멈춘 뒤, 8초간 입으로 천천히 내쉬기 3회'
        },
        {
          id: `${condId}-TM3`,
          type: 'action',
          title: '현실 발바닥 그라운딩',
          description: '의자에 앉아 양 발바닥을 바닥에 꼭 붙이고 단단한 대지의 지지를 느껴보기'
        },
        {
          id: `${condId}-TM4`,
          type: 'environment',
          title: '걱정 타임 10분만 허락하기',
          description: '하루 중 딱 10분만 걱정하기로 약속하고, 그 시간이 지나면 좋아하는 활동으로 전환하기'
        },
        {
          id: `${condId}-TM5`,
          type: 'notice',
          title: '"상상일 뿐 사실이 아니야" 끊기',
          description: '최악의 시나리오가 떠오를 때 손가락을 튕기며 "이건 내 뇌의 상상이야" 알아차리기'
        },
        {
          id: `${condId}-TM6`,
          type: 'action',
          title: '믿을 수 있는 사람에게 털어놓기',
          description: '혼자 끙끙 앓지 않고 가족, 친구, 선생님께 "나 요즘 이런 생각이 들어" 말하기'
        },
        {
          id: `${condId}-TM7`,
          type: 'environment',
          title: '따뜻한 차 한 잔 음미',
          description: '따뜻한 보리차나 핫초코를 손으로 감싸 쥐고 온기를 느끼며 천천히 마시기'
        }
      ];

    case 'emotions':
      return [
        {
          id: `${condId}-TM1`,
          type: 'notice',
          title: `감정 파도 관찰하기 (${medicine})`,
          description: `화나 짜증이 솟구칠 때, 가슴이 두근거리는 파도를 10초간 판단 없이 지켜보기`
        },
        {
          id: `${condId}-TM2`,
          type: 'action',
          title: '차가운 물 세수 & 손 씻기',
          description: '화장실에 가서 시원한 물로 손을 씻거나 손목 안쪽에 찬물을 대어 열기 식히기'
        },
        {
          id: `${condId}-TM3`,
          type: 'action',
          title: '숫자 1부터 10까지 거꾸로 세기',
          description: '말을 뱉기 전 마음속으로 10, 9, 8... 천천히 세며 감정의 뇌를 진정시키기'
        },
        {
          id: `${condId}-TM4`,
          type: 'environment',
          title: '안전한 감정 배출 (이면지 낙서)',
          description: '답답한 마음을 빈 종이에 연필로 마구 휘갈겨 낙서하며 응어리 풀어내기'
        },
        {
          id: `${condId}-TM5`,
          type: 'notice',
          title: '내 감정에 이름표 붙여주기',
          description: '"지금 내 마음에 서운이가 찾아왔구나", "억울이가 말을 거네" 다정하게 인정하기'
        },
        {
          id: `${condId}-TM6`,
          type: 'action',
          title: '폭신한 베개 꼭 끌어안기',
          description: '포근한 인형이나 베개를 품에 꼭 안고 울컥하는 마음을 차분히 달래기'
        },
        {
          id: `${condId}-TM7`,
          type: 'environment',
          title: '소음 차단 & 멍때리기',
          description: '이어폰으로 잔잔한 빗소리를 듣거나 창밖을 보며 5분간 아무 생각 없이 멍때리기'
        }
      ];

    case 'vitality':
      return [
        {
          id: `${condId}-TM1`,
          type: 'environment',
          title: '취침 전 폰 1미터 격리',
          description: '잠들기 15분 전 폰 충전기를 침대에서 멀리 떨어진 책상에 꽂아두기'
        },
        {
          id: `${condId}-TM2`,
          type: 'action',
          title: '기상 후 기지개 & 물 한 잔',
          description: '눈 뜨자마자 온몸을 쭉 펴는 기지개를 켜고 미지근한 물 한 컵으로 장 깨우기'
        },
        {
          id: `${condId}-TM3`,
          type: 'action',
          title: '햇살 3분 쬐며 바깥 공기 마시기',
          description: '창문을 활짝 열고 눈부신 햇살을 받으며 폐 속 깊이 신선한 공기 들이마시기'
        },
        {
          id: `${condId}-TM4`,
          type: 'notice',
          title: '도파민 절제: 숏폼 대신 음악',
          description: '멍하니 화면을 넘기려 할 때 멈추고, 좋아하는 힐링 음악 1곡만 집중해서 듣기'
        },
        {
          id: `${condId}-TM5`,
          type: 'action',
          title: '5분 가벼운 동네 산책',
          description: '방 안에만 누워있지 않고 아파트 복도나 집 앞 골목을 5분만 천천히 걷기'
        },
        {
          id: `${condId}-TM6`,
          type: 'environment',
          title: '따뜻한 샤워로 몸 녹이기',
          description: '지친 하루 끝에 따뜻한 물로 샤워하며 어깨와 뭉친 목 근육 풀어주기'
        },
        {
          id: `${condId}-TM7`,
          type: 'notice',
          title: '배터리 게이지 확인하기',
          description: '지금 내 몸의 에너지가 몇 %인지 체크하고 무리한 약속 대신 충분한 휴식 택하기'
        }
      ];

    case 'future':
      return [
        {
          id: `${condId}-TM1`,
          type: 'notice',
          title: '좋아하는 것 3가지 보물찾기',
          description: '직업이 아니어도 괜찮아요. 음식, 게임, 동물, 만들기 등 내가 좋아하는 것 적기'
        },
        {
          id: `${condId}-TM2`,
          type: 'action',
          title: '실패에 "오히려 좋아" 붙이기',
          description: '실수했을 때 "이번 기회에 배운 게 있네! 다음엔 이렇게 해봐야지" 말해보기'
        },
        {
          id: `${condId}-TM3`,
          type: 'action',
          title: '롤모델의 명언 1줄 찾아보기',
          description: '내가 멋지다고 생각하는 인물이 남긴 용기를 주는 명언 1개를 메모해두기'
        },
        {
          id: `${condId}-TM4`,
          type: 'environment',
          title: '1년 뒤 나에게 응원 편지',
          description: '미래의 나에게 "지금 고민 많겠지만 넌 잘 해낼 거야" 짧은 쪽지 적어두기'
        },
        {
          id: `${condId}-TM5`,
          type: 'notice',
          title: '남의 속도와 비교 멈추기',
          description: '"꽃마다 피어나는 계절이 다르다"는 문장을 되새기며 내 페이스 유지하기'
        },
        {
          id: `${condId}-TM6`,
          type: 'action',
          title: '새로운 경험 1가지 작게 시도',
          description: '평소 안 듣던 음악 장르 듣기, 새로운 길로 하교하기 등 작은 호기심 실천하기'
        },
        {
          id: `${condId}-TM7`,
          type: 'environment',
          title: '꿈의 보물상자 만들기',
          description: '멋진 풍경이나 배우고 싶은 것의 사진을 폰 배경화면이나 책상 앞에 붙여두기'
        }
      ];

    case 'school':
      return [
        {
          id: `${condId}-TM1`,
          type: 'notice',
          title: '수업 시간 끄덕임 3번',
          description: '발표하지 않아도 괜찮아요. 선생님 말씀에 고개를 가볍게 3번 끄덕여보기'
        },
        {
          id: `${condId}-TM2`,
          type: 'action',
          title: '급식 천천히 꼭꼭 씹어먹기',
          description: '친구들 눈치 보지 않고 오늘 나온 반찬의 맛을 하나씩 음미하며 꼭꼭 씹기'
        },
        {
          id: `${condId}-TM3`,
          type: 'environment',
          title: '책상 위 3초 정리',
          description: '수업 끝나고 지우개 가루를 털고 다음 교시 책을 가지런히 놓아두기'
        },
        {
          id: `${condId}-TM4`,
          type: 'action',
          title: '선생님이나 친구에게 "감사합니다"',
          description: '유인물을 받거나 문을 잡아줄 때 밝은 목소리로 감사 인사 건네기'
        },
        {
          id: `${condId}-TM5`,
          type: 'notice',
          title: '복도 걸을 때 어깨 펴기',
          description: '움츠러든 고개를 들고 당당하게 복도를 걸으며 교실 창밖 풍경 바라보기'
        },
        {
          id: `${condId}-TM6`,
          type: 'action',
          title: '쉬는 시간 도서관 나들이',
          description: '시끄러운 교실을 벗어나 조용하고 아늑한 학교 도서관에서 책 구경하기'
        },
        {
          id: `${condId}-TM7`,
          type: 'environment',
          title: '모둠 활동 내 분량 깔끔 완수',
          description: '전체를 다 하려 애쓰지 말고, 내가 맡은 작은 소주제 하나만 정성껏 완성하기'
        }
      ];

    default:
      return [
        {
          id: `${condId}-TM1`,
          type: 'notice',
          title: `마음 신호 알아차림 (${name})`,
          description: `"${name}"이 느껴질 때 심장박동과 호흡의 변화를 10초간 가만히 느껴보기`
        },
        {
          id: `${condId}-TM2`,
          type: 'action',
          title: '5분 미니 힐링 행동',
          description: `지금 당장 할 수 있는 가장 쉬운 행동 1가지를 부담 없이 해보기`
        },
        {
          id: `${condId}-TM3`,
          type: 'environment',
          title: `나만의 안심 공간 (${medicine})`,
          description: `방해 요소를 치우고 조용히 쉴 수 있는 안전한 환경 만들기`
        },
        {
          id: `${condId}-TM4`,
          type: 'action',
          title: '깊은 호흡 3번과 어깨 풀기',
          description: '어깨를 가볍게 돌리고 길게 숨을 내쉬며 뭉친 긴장 털어내기'
        },
        {
          id: `${condId}-TM5`,
          type: 'notice',
          title: '솔직한 생각 한 줄 적기',
          description: '누구에게도 보여주지 않는 나만의 메모장에 지금 떠오른 감정 솔직히 쓰기'
        },
        {
          id: `${condId}-TM6`,
          type: 'environment',
          title: '다정한 자기 격려 한마디',
          description: '"오늘 하루도 애썼어, 넌 충분히 가치 있는 사람이야" 스스로를 안아주기'
        }
      ];
  }
}
