/**
 * Korean Name & Vocative Particle Helper
 * Handles Korean names, extracting given names and selecting appropriate postposition (아 / 야).
 */

export function getKoreanFirstName(fullName: string): string {
  if (!fullName) return '';
  const trimmed = fullName.trim();

  // If typical 3-syllable Korean name (e.g. 김철수 -> 철수, 김민준 -> 민준)
  if (trimmed.length === 3) {
    return trimmed.slice(1);
  }

  // If 2-syllable Korean name (e.g. 김철 -> 철, 이산 -> 산)
  if (trimmed.length === 2) {
    return trimmed.slice(1);
  }

  // If 4-syllable name with two-character compound surname (남궁, 황보, 제갈, 선우, 독고, 사공 등)
  const compoundSurnames = ['남궁', '황보', '제갈', '선우', '독고', '사공'];
  if (trimmed.length === 4 && compoundSurnames.some((s) => trimmed.startsWith(s))) {
    return trimmed.slice(2);
  }

  return trimmed;
}

export function getKoreanVocativeParticle(name: string): '아!' | '야!' {
  if (!name) return '야!';
  const lastChar = name[name.length - 1];
  const charCode = lastChar.charCodeAt(0);

  // Hangul Syllables unicode block: AC00 ~ D7A3
  if (charCode >= 0xac00 && charCode <= 0xd7a3) {
    const hasBatchim = (charCode - 0xac00) % 28 !== 0;
    return hasBatchim ? '아!' : '야!';
  }

  return '야!';
}

export function getKoreanFriendlyGreeting(fullName: string): string {
  const firstName = getKoreanFirstName(fullName);
  const particle = getKoreanVocativeParticle(firstName);
  return `어서와, ${firstName}${particle}`;
}

export function getKoreanFriendlyCall(fullName: string): string {
  const firstName = getKoreanFirstName(fullName);
  const particle = getKoreanVocativeParticle(firstName);
  return `${firstName}${particle}`;
}

/**
 * Validates whether a text input is meaningful reflection text
 * (Prevents single repeated characters, gibberish like 'ㅋㅋㅋ', 'asdf', 'ㅁㄴㅇㄹ', or too short).
 */
export function validateMeaningfulText(text: string, minLength = 3): { valid: boolean; reason?: string } {
  const trimmed = text.trim();
  if (trimmed.length < minLength) {
    return {
      valid: false,
      reason: `최소 ${minLength}자 이상 구체적인 실천 내용이나 생각을 적어주세요.`
    };
  }

  const clean = trimmed.replace(/\s+/g, '');
  const uniqueChars = new Set(clean);

  // Check for excessive repetitive single or duo characters (e.g. ㅋㅋㅋㅋ, ㅎㅎㅎㅎ, ...., aaaaa, 1111)
  if (clean.length >= 4 && uniqueChars.size <= 2) {
    return {
      valid: false,
      reason: '반복적인 문자나 기호 대신 직접 실천한 내용과 생각을 적어주세요.'
    };
  }

  // Keyboard mash and nonsense detection
  const keyboardMashes = [
    'asdf', 'qwer', 'zxcv', 'hjkl', 'jkl;',
    'ㅁㄴㅇㄹ', 'ㅂㅈㄷㄱ', 'ㅋㅌㅊㅍ', 'ㅛㅕㅑㅐ',
    '1234', '0000', '1111', '테스트', 'test', '아무말'
  ];
  const lowerClean = clean.toLowerCase();
  for (const mash of keyboardMashes) {
    if (lowerClean.includes(mash)) {
      return {
        valid: false,
        reason: '키보드를 무작위로 누른 문자열(예: asdf, ㅁㄴㅇㄹ 등)은 제출할 수 없습니다.'
      };
    }
  }

  // Check if text is solely Korean consonants (ㄱ-ㅎ) or vowels (ㅏ-ㅣ) without complete syllables
  const jamoOnlyMatches = clean.match(/[\u3131-\u318E]/g) || [];
  if (jamoOnlyMatches.length / clean.length > 0.5) {
    return {
      valid: false,
      reason: '초성이나 모음(ㅋㅋ, ㅎㅎ 등)만 쓰지 말고 온전한 문장이나 단어로 적어주세요.'
    };
  }

  // Must have at least one complete Hangul syllable (가-힣) or valid English word
  const hasCompleteHangulOrWord = /[\uAC00-\uD7A3a-zA-Z]/.test(clean);
  if (!hasCompleteHangulOrWord) {
    return {
      valid: false,
      reason: '자음이나 특수기호 대신 온전한 한글 단어 또는 문장으로 적어주세요.'
    };
  }

  return { valid: true };
}
