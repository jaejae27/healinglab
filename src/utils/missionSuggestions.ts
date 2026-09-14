/**
 * Helper utility to provide concrete, empathetic action examples for students
 * particularly when practicing "5-minute timer & small action" and other tailored missions.
 */

export interface MissionParsedContent {
  mainText: string;
  examples: string[];
}

export function parseMissionExamples(description: string, title?: string): MissionParsedContent {
  const match = description.match(/\(예:\s*([^)]+)\)/);
  if (match && match[1]) {
    const mainText = description.replace(/\s*\(예:\s*[^)]+\)/, '').trim();
    const examples = match[1]
      .split(/,\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    return { mainText, examples };
  }

  // Fallback check for timer / small action missions
  const isTimerOrSmallAction =
    (title && (title.includes('5분') || title.includes('타이머') || title.includes('작은 행동') || title.includes('미니 행동') || title.includes('뽀모도로') || title.includes('스타트'))) ||
    description.includes('5분') ||
    description.includes('타이머') ||
    description.includes('가장 쉬운') ||
    description.includes('작은 행동');

  if (isTimerOrSmallAction) {
    return {
      mainText: description,
      examples: [
        '교재 첫 페이지만 펼치기',
        '책상 위 빈 컵·쓰레기 1개 치우기',
        '시원한 물 한 잔 마시며 기지개 켜기',
        '가장 만만한 문제 1개만 풀기',
        '오늘 할 일 딱 1개 메모지에 쓰기'
      ]
    };
  }

  return { mainText: description, examples: [] };
}

/**
 * Returns a list of quick-action suggestion chips for student check-in note
 */
export function getActionSuggestionChips(title: string, description: string): string[] {
  const parsed = parseMissionExamples(description, title);
  if (parsed.examples.length > 0) {
    return parsed.examples.map((ex) => {
      if (ex.includes('교재') || ex.includes('책') || ex.includes('문제')) return `📖 ${ex}`;
      if (ex.includes('책상') || ex.includes('치우') || ex.includes('정리')) return `🧹 ${ex}`;
      if (ex.includes('물') || ex.includes('기지개') || ex.includes('스트레칭')) return `🥤 ${ex}`;
      if (ex.includes('메모') || ex.includes('적기') || ex.includes('쓰기')) return `📝 ${ex}`;
      if (ex.includes('호흡') || ex.includes('숨') || ex.includes('창문')) return `🧘 ${ex}`;
      return `✨ ${ex}`;
    });
  }

  const text = `${title} ${description}`;
  if (text.includes('폰') || text.includes('스마트폰') || text.includes('숏폼')) {
    return [
      '📴 스마트폰 서랍 속에 30분 넣어두기',
      '🔇 단톡방 알림 1시간 무음 설정하기',
      '🎧 좋아하는 음악 1곡 끝까지 감상하기',
      '창밖 먼 풍경 1분간 바라보기'
    ];
  }

  if (text.includes('호흡') || text.includes('화') || text.includes('짜증') || text.includes('긴장')) {
    return [
      '🌬️ 코로 4초 들이쉬고 6초 천천히 내쉬기',
      '💧 화장실에서 시원한 물로 손 씻기',
      '🔟 마음속으로 10부터 1까지 거꾸로 세기',
      '🧸 포근한 베개 안고 1분간 쉬기'
    ];
  }

  if (text.includes('친구') || text.includes('대화') || text.includes('눈인사')) {
    return [
      '😊 친구에게 눈웃음과 가벼운 목례 건네기',
      '💬 귀여운 짤이나 따뜻한 안부 톡 보내기',
      '👂 친구 이야기 중간에 끊지 않고 들어주기',
      '🙏 "고마워" 한마디 직접 말하기'
    ];
  }

  return [];
}
