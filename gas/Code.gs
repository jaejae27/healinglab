/**
 * =========================================================================
 * 💊 힐링약국 (Healing Pharmacy) - Google Apps Script 통합 백엔드 엔진
 * =========================================================================
 * 
 * 중학생 사회정서교육 웹앱을 위한 Google 스프레드시트 22개 시트 데이터베이스 및 Web App 백엔드입니다.
 * 
 * [주요 기능]
 * 1. 22개 정규화 시트 스키마 자동 구축 (setupHealingPharmacy)
 * 2. 8개 영역 108개 가상증상 및 미션 마스터데이터 주입 (seedMasterData)
 * 3. LockService 기반 동시성 제어 & 중복 제출 방지
 * 4. doGet: HtmlService 웹앱 화면 제공 & JSON REST API
 * 5. doPost: 학생 진료 발급, 처방 다했어요 평가, 칭찬쿠키 가챠, 교사 확인 등 실시간 시트 기록
 */

// =========================================================================
// 1. 스프레드시트 커스텀 메뉴 등록
// =========================================================================
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('💊 힐링약국 관리')
    .addItem('1. 22개 시트 DB 초기 구축 (setupHealingPharmacy)', 'setupHealingPharmacy')
    .addItem('2. 마스터데이터 주입 (카테고리/증상/미션/포춘)', 'seedMasterData')
    .addSeparator()
    .addItem('3. 샘플 학생 명렬표 등록', 'seedSampleStudents')
    .addItem('4. 웹앱 배포 URL 확인 안내', 'showDeployInfo')
    .addToUi();
}

// =========================================================================
// 2. 22개 시트 데이터베이스 자동 구축
// =========================================================================
function setupHealingPharmacy() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const SHEETS_CONFIG = [
    { name: 'SETTINGS', headers: ['key', 'value', 'description'] },
    { name: 'CLASSES', headers: ['grade', 'class_num', 'is_active', 'created_at'] },
    { name: 'STUDENTS', headers: ['student_id', 'grade', 'class_num', 'number', 'name', 'cookie_balance', 'gacha_tickets', 'created_at'] },
    { name: 'CATEGORIES', headers: ['category_id', 'code', 'name', 'sub_name', 'icon', 'color', 'desc'] },
    { name: 'CONDITIONS', headers: ['condition_id', 'category_id', 'name', 'summary', 'medicine_name', 'advice', 'status', 'is_student_proposed'] },
    { name: 'CHECK_ITEMS', headers: ['check_id', 'category_id', 'statement'] },
    { name: 'CONDITION_MATCH', headers: ['check_id', 'condition_id', 'weight'] },
    { name: 'MISSIONS', headers: ['mission_id', 'condition_id', 'type', 'title', 'description'] },
    { name: 'VISITS', headers: ['visit_id', 'student_id', 'category_id', 'primary_condition_id', 'status', 'created_at', 'submitted_at', 'paper_verified', 'web_verified', 'reward_given'] },
    { name: 'VISIT_CONDITIONS', headers: ['visit_id', 'condition_id', 'type'] },
    { name: 'VISIT_MISSIONS', headers: ['visit_id', 'mission_id', 'mission_index', 'type', 'title'] },
    { name: 'MISSION_RESULTS', headers: ['visit_id', 'best_mission_index', 'm1_rating', 'm2_rating', 'm3_rating', 'reflection_why', 'will_use_again', 'reflection_learned', 'future_plan', 'submitted_at'] },
    { name: 'REWARDS', headers: ['reward_id', 'visit_id', 'student_id', 'medicine_name', 'snack_type', 'verified_by_teacher', 'given_at'] },
    { name: 'COOKIE_LOG', headers: ['log_id', 'student_id', 'amount', 'reason', 'balance_after', 'created_at'] },
    { name: 'GACHA_LOG', headers: ['log_id', 'student_id', 'prize_name', 'rarity', 'claimed', 'created_at'] },
    { name: 'FORTUNES', headers: ['fortune_id', 'number', 'message', 'sub_text'] },
    { name: 'FORTUNE_LOG', headers: ['log_id', 'student_id', 'fortune_id', 'is_best', 'saved_at'] },
    { name: 'WORRY_GACHA', headers: ['hint_id', 'hint_text', 'category'] },
    { name: 'WORRY_CHALLENGES', headers: ['challenge_id', 'student_id', 'hint', 'tested', 'rating', 'will_use_again', 'reflection', 'created_at'] },
    { name: 'NEW_CONDITION_REQUESTS', headers: ['request_id', 'student_id', 'suggested_name', 'category_id', 'when_appears', 'help_needed', 'mission_idea', 'status', 'assigned_id', 'created_at'] },
    { name: 'REPORT_LOG', headers: ['report_id', 'type', 'student_id', 'generated_at'] },
    { name: 'STUDENT_RECORD_SENTENCES', headers: ['record_id', 'student_id', 'source_visit_id', 'ai_draft_sentence', 'created_at'] }
  ];

  SHEETS_CONFIG.forEach(item => {
    let sheet = ss.getSheetByName(item.name);
    if (!sheet) {
      sheet = ss.insertSheet(item.name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(item.headers);
      const headerRange = sheet.getRange(1, 1, 1, item.headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#F3F4F6');
      headerRange.setFontColor('#1F2937');
      sheet.setFrozenRows(1);
    }
  });

  // SETTINGS 시트 기본값 주입
  const settingsSheet = ss.getSheetByName('SETTINGS');
  if (settingsSheet.getLastRow() <= 1) {
    const defaultSettings = [
      ['start_date', '2026-09-01', '운영 시작일'],
      ['end_date', '2026-10-31', '운영 종료일'],
      ['allow_repeat', 'true', '반복 참여 허용 여부'],
      ['repeat_cooldown_days', '7', '동일 증상 재진 기본 제한 일수'],
      ['max_concurrent_prescriptions', '1', '동시에 진행 가능한 처방 수'],
      ['recommendation_count', '3', '추천 증상 표시 개수 (3~5)'],
      ['gacha_cookie_price', '3', '칭찬가챠 1회당 칭찬쿠키 비용'],
      ['allow_student_pdf', 'true', '학생 PDF 리포트 열람 허용']
    ];
    settingsSheet.getRange(2, 1, defaultSettings.length, 3).setValues(defaultSettings);
  }

  // CLASSES 시트 기본값 주입 (1~3학년 각 1~3반)
  const classesSheet = ss.getSheetByName('CLASSES');
  if (classesSheet.getLastRow() <= 1) {
    const defaultClasses = [
      [1, 1, true, new Date()], [1, 2, true, new Date()], [1, 3, true, new Date()],
      [2, 1, true, new Date()], [2, 2, true, new Date()], [2, 3, true, new Date()],
      [3, 1, true, new Date()], [3, 2, true, new Date()], [3, 3, true, new Date()]
    ];
    classesSheet.getRange(2, 1, defaultClasses.length, 4).setValues(defaultClasses);
  }

  SpreadsheetApp.getUi().alert('💊 힐링약국 22개 시트 데이터베이스 구축이 완료되었습니다!\n이어서 메뉴의 [2. 마스터데이터 주입]을 실행해주세요.');
}

// =========================================================================
// 3. 샘플 학생 명렬표 주입
// =========================================================================
function seedSampleStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('STUDENTS');
  if (!sheet) return;

  const sampleStudents = [
    ['S1-1-01', 1, 1, 1, '김민준', 5, 1, new Date()],
    ['S1-1-02', 1, 1, 2, '이서연', 7, 2, new Date()],
    ['S1-1-03', 1, 1, 3, '박도윤', 3, 0, new Date()],
    ['S1-1-04', 1, 1, 4, '정하은', 4, 1, new Date()],
    ['S1-1-05', 1, 1, 5, '최시우', 2, 0, new Date()],
    ['S1-1-06', 1, 1, 6, '강지유', 6, 1, new Date()],
    ['S1-1-07', 1, 1, 7, '조예준', 8, 2, new Date()],
    ['S1-1-08', 1, 1, 8, '윤수아', 5, 1, new Date()],
    ['S1-1-09', 1, 1, 9, '장우진', 3, 0, new Date()],
    ['S1-1-10', 1, 1, 10, '임서아', 4, 1, new Date()]
  ];

  if (sheet.getLastRow() <= 1) {
    sheet.getRange(2, 1, sampleStudents.length, 8).setValues(sampleStudents);
    SpreadsheetApp.getUi().alert('📋 1학년 1반 샘플 학생 10명이 등록되었습니다.');
  } else {
    SpreadsheetApp.getUi().alert('이미 학생 데이터가 존재합니다.');
  }
}

// =========================================================================
// 4. 마스터데이터 주입 (카테고리, 증상, 미션, 포춘, 고민가챠)
// =========================================================================
function seedMasterData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1) CATEGORIES
  const catSheet = ss.getSheetByName('CATEGORIES');
  if (catSheet && catSheet.getLastRow() <= 1) {
    const categories = [
      ['self', 'S', '나 자신', '자기이해 & 자존감', '🪞', '#F472B6', '남들과의 비교, 자신감 부족, 내 마음에 대한 솔직한 탐색'],
      ['friends', 'R', '친구·관계', '또래 관계 & 소통', '💌', '#FB7185', '친구 사이의 서운함, 눈치, 말하기 어려움, 대화의 거리'],
      ['study', 'A', '공부·할 일', '학습 & 실행력', '📚', '#38BDF8', '미루는 습관, 시작의 어려움, 시험 부담감, 집중의 흩어짐'],
      ['worries', 'W', '걱정·생각', '불안 & 생각 과다', '🤯', '#A78BFA', '꼬리를 무는 생각, 아직 안 일어난 일에 대한 염려, 선택 장애'],
      ['emotions', 'E', '감정 다루기', '분노 & 롤러코스터', '🌋', '#FB923C', '갑작스러운 짜증, 서운함 폭발, 표정 관리, 감정의 굴곡'],
      ['vitality', 'L', '피로·생활', '에너지 & 수면·스마트폰', '🪫', '#34D399', '방전된 체력, 폰에서 손 못 떼기, 밤늦게 안 자기, 무기력'],
      ['future', 'G', '실패·도전·미래', '회복탄력성 & 진로', '🌱', '#4ADE80', '실패 후의 두려움, 포기하고 싶은 마음, 꿈과 진로에 대한 막막함'],
      ['school', 'D', '학교생활·일상', '교실 적응 & 일상', '🏫', '#FBBF24', '발표 부담, 모둠활동 눈치, 질문하기 어려움, 등교 스트레스']
    ];
    catSheet.getRange(2, 1, categories.length, 7).setValues(categories);
  }

  // 2) CONDITIONS (대표 108개 중 핵심 증상 주입)
  const condSheet = ss.getSheetByName('CONDITIONS');
  const missionSheet = ss.getSheetByName('MISSIONS');
  
  if (condSheet && condSheet.getLastRow() <= 1) {
    const sampleConditions = [
      // 나 자신 (S01 ~ S03)
      ['S01', 'self', '유리구슬 자존감 증후군', '작은 비판이나 실수에도 마음이 와장창 깨지는 느낌', '토닥토닥 캡슐', '누구나 깨지기 쉬운 날이 있어. 오늘은 따뜻한 온기가 필요해.', 'active', false],
      ['S02', 'self', '투명인간 그림자 증후군', '내 존재감이 희미하게 느껴지고 아무도 날 신경 안 쓰는 것 같을 때', '빛나는 존재 환', '너는 있는 그대로 소중한 교실의 유일한 별이야.', 'active', false],
      ['S03', 'self', '거울 속 외계인 증후군', '내 외모나 말투가 어색하고 남들의 시선이 온통 내게 쏠린 것 같을 때', '자신감 비타민', '남들은 생각보다 나를 쳐다보지 않아. 자유롭게 숨쉬자.', 'active', false],
      // 친구 관계 (R01 ~ R03)
      ['R01', 'friends', '단톡방 알림 집착증', '단톡방 메시지가 늦거나 답장이 없으면 심장이 쿵쾅거릴 때', '거리두기 젤리', '온라인의 속도가 우리 우정의 깊이를 결정하지 않아.', 'active', false],
      ['R02', 'friends', '읽씹 안절부절 증후군', '친구가 내 톡을 읽고 답이 없을 때 내가 뭘 잘못했나 끙끙 앓는 상태', '마음 편한 사탕', '친구도 바쁘거나 잠시 혼자만의 시간이 필요할 수 있어.', 'active', false],
      ['R03', 'friends', '눈치 안테나 과열증', '친구들의 표정이나 사소한 말투 하나하나에 과도하게 레이더를 켤 때', '쿨다운 드롭스', '모든 사람의 기분을 네가 책임질 필요는 없단다.', 'active', false],
      // 공부·할 일 (A01 ~ A03)
      ['A01', 'study', '내일부터 시작병', '해야 할 공부나 숙제를 자꾸 내일로 미루며 마음만 무거운 상태', '5분 스타트 츄잉껌', '거창한 시작 대신 딱 5분만 먼저 책장을 넘겨보자.', 'active', false],
      ['A02', 'study', '새벽 벼락치기 과부하증', '시험 전날 밤샘을 반복하며 뇌가 타버릴 것 같은 피로감', '숙면 유도 앰플', '잠을 충분히 자야 뇌의 서랍이 정리될 수 있어.', 'active', false],
      ['A03', 'study', '책상 위 우주정거장 증후군', '공부하려고 앉으면 책상 정리만 1시간째 하고 있는 상태', '집중 포커스 시럽', '완벽한 환경보다 지금 바로 펜을 쥐는 것이 먼저야.', 'active', false],
      // 걱정·생각 (W01 ~ W03)
      ['W01', 'worries', '생각 꼬리물기 과열증', '일어나지도 않은 온갖 불길한 시나리오가 머릿속에서 재생될 때', '스톱 버튼 패치', '생각은 구름처럼 흘러가는 것일 뿐, 현실이 아니야.', 'active', false],
      ['W02', 'worries', '흑백논리 시소 증후군', '100점이 아니면 완전 실패라고 느끼는 완벽주의의 덫', '회색지대 탕약', '세상에는 성공과 실패 사이의 멋진 배움이 아주 많아.', 'active', false],
      // 피로·생활 (L01 ~ L03)
      ['L01', 'vitality', '스마트폰 좀비 증후군', '자기 전 숏폼을 보느라 새벽 2시가 훌쩍 넘어버리는 상태', '디지털 디톡스 환', '화면을 끄는 순간, 네 뇌와 눈이 깊은 휴식을 얻을 거야.', 'active', false],
      ['L02', 'vitality', '월요병 무기력 증후군', '등교 준비만 하려고 하면 몸에 돌덩이를 얹은 듯 무거운 상태', '비타민 충전 포션', '오늘 하루 중 작은 즐거움 1가지를 교실에 심어두자.', 'active', false]
    ];
    condSheet.getRange(2, 1, sampleConditions.length, 8).setValues(sampleConditions);

    // MISSIONS 시트 주입
    if (missionSheet && missionSheet.getLastRow() <= 1) {
      const missionsData = [];
      sampleConditions.forEach(cond => {
        const id = cond[0];
        const name = cond[2];
        missionsData.push([id + '-M1', id, 'notice', '마음 신호 알아차리기', `"${name}" 신호가 켜졌을 때 내 몸(심장, 어깨, 표정)의 변화를 가만히 관찰하기`]);
        missionsData.push([id + '-M2', id, 'action', '5분 미니 행동 실천', '부담 없이 딱 5분만 타이머를 켜고 지금 당장 할 수 있는 가장 쉬운 작은 행동 1가지 해보기']);
        missionsData.push([id + '-M3', id, 'environment', '자기 조절 & 심호흡', '코로 4초 들이마시고 6초 천천히 내쉬며 나에게 "괜찮아, 천천히 가자" 말해주기']);
      });
      missionSheet.getRange(2, 1, missionsData.length, 5).setValues(missionsData);
    }
  }

  // 3) FORTUNES (마음포춘)
  const fortuneSheet = ss.getSheetByName('FORTUNES');
  if (fortuneSheet && fortuneSheet.getLastRow() <= 1) {
    const fortunes = [
      ['F01', 1, '네 속도대로 천천히 걸어가도 충분히 아름다워.', '남들과 비교하지 말고 오늘의 내 한 걸음을 칭찬해줘.'],
      ['F02', 2, '실수는 네가 새로운 도전을 했다는 가장 멋진 증거야.', '실수 속에서 피어난 지혜가 너를 더 단단하게 만들 거야.'],
      ['F03', 3, '오늘 하루도 네 존재 자체만으로 교실을 밝히고 있어.', '스스로를 따뜻하게 안아주는 저녁을 보내봐.'],
      ['F04', 4, '가장 어두운 밤하늘일수록 작은 별이 더 또렷하게 빛나.', '지금 힘든 순간도 곧 지나갈 소중한 배움의 시간이야.'],
      ['F05', 5, '완벽하지 않아도 괜찮아. 오늘의 최선이면 충분해.', '어깨에 힘을 빼고 숨을 깊게 한번 쉬어보자. 후~'],
      ['F06', 6, '너에게는 생각보다 훨씬 더 놀라운 회복탄력성이 숨어있단다.', '넘어져도 다시 툭툭 털고 일어날 힘이 네 안에 있어.']
    ];
    fortuneSheet.getRange(2, 1, fortunes.length, 4).setValues(fortunes);
  }

  // 4) WORRY_GACHA (고민가챠)
  const worrySheet = ss.getSheetByName('WORRY_GACHA');
  if (worrySheet && worrySheet.getLastRow() <= 1) {
    const worryHints = [
      ['W01', '1년 뒤의 내가 오늘의 이 고민을 본다면 뭐라고 웃으며 조언해줄까?', '시야 넓히기'],
      ['W02', '내가 가장 아끼는 친한 친구가 나와 똑같은 고민을 한다면 뭐라고 따뜻하게 위로해줄까?', '자기 자비'],
      ['W03', '지금 일어날 수 있는 최악의 상황이 실제로 일어날 확률은 과연 몇 %나 될까?', '현실 검증'],
      ['W04', '지금 내가 통제할 수 있는 일(내 행동, 태도)과 통제할 수 없는 일(남의 마음, 과거)을 구분해볼까?', '에너지 배분']
    ];
    worrySheet.getRange(2, 1, worryHints.length, 3).setValues(worryHints);
  }

  SpreadsheetApp.getUi().alert('✨ 힐링약국 마스터데이터 주입이 완료되었습니다!\n(카테고리, 증상, 3대 미션, 포춘쿠키, 고민가챠)');
}

// =========================================================================
// 5. 웹앱 배포 안내 팝업
// =========================================================================
function showDeployInfo() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    '🌐 힐링약국 웹앱 배포 방법\n\n' +
    '1. 상단 우측 파란색 [배포] > [새 배포] 클릭\n' +
    '2. 유형: 웹 앱 (Web App)\n' +
    '3. 다음 사용자로 실행: 나 (User deploying)\n' +
    '4. 액세스 권한: 모든 사용자 (Anyone) - 필수!\n' +
    '5. [배포]를 누르고 발급된 웹앱 URL을 학생들에게 안내하세요.'
  );
}

// =========================================================================
// 6. GET 요청 처리 (doGet): 웹앱 HTML 화면 및 JSON API 동시 지원
// =========================================================================
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';

  // 1) API 요청인 경우 JSON 응답 반환
  if (action) {
    let result = { status: 'success' };
    try {
      if (action === 'getInitialData') {
        result.data = getFullInitialData();
      } else if (action === 'getStudents') {
        result.data = getTableData('STUDENTS');
      } else if (action === 'getVisits') {
        result.data = getTableData('VISITS');
      } else if (action === 'getConditions') {
        result.data = getTableData('CONDITIONS');
      } else if (action === 'getSettings') {
        result.data = getTableData('SETTINGS');
      } else {
        result.data = { message: '💊 힐링약국 API가 가동 중입니다.' };
      }
    } catch (err) {
      result = { status: 'error', message: err.toString() };
    }
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 2) 브라우저에서 웹앱 접속한 경우: Index.html 렌더링
  try {
    return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('💊 힐링약국 (Healing Pharmacy)')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
  } catch (err) {
    // Index.html 파일이 아직 없는 경우를 위한 비상 안내 페이지
    return HtmlService.createHtmlOutput(
      '<div style="font-family:sans-serif;padding:30px;text-align:center;">' +
      '<h2>💊 힐링약국 백엔드 엔진이 정상 가동 중입니다!</h2>' +
      '<p>Index.html 파일이 Google Apps Script 프로젝트에 등록되어 있는지 확인해주세요.</p>' +
      '</div>'
    );
  }
}

// =========================================================================
// 7. POST 요청 처리 (doPost): 처방 등록, 미션 소감, 가챠, 교사 검증 등
// =========================================================================
function doPost(e) {
  const lock = LockService.getScriptLock();
  let result = { status: 'success' };

  try {
    // 동시 요청 락 보호 (최대 10초 대기)
    lock.waitLock(10000);

    let postData = {};
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    const action = postData.action;
    const payload = postData.data || postData;

    if (action === 'submitVisit') {
      result.visitId = handleVisitSubmit(payload);
    } else if (action === 'submitMissionResult') {
      result.result = handleMissionResultSubmit(payload);
    } else if (action === 'verifyVisit') {
      result.result = handleTeacherVerifyVisit(payload);
    } else if (action === 'drawGacha') {
      result.prize = handleDrawGacha(payload);
    } else if (action === 'submitWorryChallenge') {
      result.result = handleSubmitWorryChallenge(payload);
    } else if (action === 'submitNewMedicine') {
      result.result = handleSubmitNewMedicine(payload);
    } else if (action === 'getInitialData') {
      result.data = getFullInitialData();
    } else {
      result = { status: 'unknown_action', action: action };
    }
  } catch (err) {
    result = { status: 'error', message: err.toString() };
  } finally {
    lock.releaseLock();
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================
// 8. 비즈니스 로직 핸들러들
// =========================================================================

// [A] 신규 마음 진료 처방전 발급
function handleVisitSubmit(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const visitId = 'V' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random() * 1000);
  
  // 1) VISITS 시트 추가
  const visitsSheet = ss.getSheetByName('VISITS');
  visitsSheet.appendRow([
    visitId,
    data.studentId,
    data.categoryId,
    data.primaryConditionId,
    'issued',
    new Date(),
    '',
    false,
    false,
    false
  ]);

  // 2) VISIT_CONDITIONS 시트 추가
  const condSheet = ss.getSheetByName('VISIT_CONDITIONS');
  condSheet.appendRow([visitId, data.primaryConditionId, 'primary']);
  if (data.secondaryConditionIds && Array.isArray(data.secondaryConditionIds)) {
    data.secondaryConditionIds.forEach(secId => {
      condSheet.appendRow([visitId, secId, 'secondary']);
    });
  }

  // 3) VISIT_MISSIONS 시트 추가
  const missSheet = ss.getSheetByName('VISIT_MISSIONS');
  if (data.missions && Array.isArray(data.missions)) {
    data.missions.forEach((m, idx) => {
      missSheet.appendRow([visitId, m.missionId, idx + 1, m.type, m.title]);
    });
  }

  return visitId;
}

// [B] 처방 다했어요 평가 기록 및 보상/쿠키 지급
function handleMissionResultSubmit(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const visitId = data.visitId;
  const studentId = data.studentId;

  // 1) MISSION_RESULTS 시트 기록
  const resultsSheet = ss.getSheetByName('MISSION_RESULTS');
  resultsSheet.appendRow([
    visitId,
    data.bestMissionIndex,
    data.m1Rating,
    data.m2Rating,
    data.m3Rating,
    data.reflectionWhy || '',
    data.willUseAgain || '',
    data.reflectionLearned || '',
    data.futurePlan || '',
    new Date()
  ]);

  // 2) VISITS 시트 상태 업데이트 ('submitted')
  updateRowByKey('VISITS', 'visit_id', visitId, {
    status: 'submitted',
    submitted_at: new Date(),
    web_verified: true
  });

  // 3) 칭찬쿠키 +2 지급 & COOKIE_LOG 기록
  adjustStudentCookie(studentId, 2, '처방전 미션 실천 완료 (+2쿠키)');

  // 4) REWARDS 발급 기록
  const rewardsSheet = ss.getSheetByName('REWARDS');
  const rewardId = 'RWD-' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd-HHmmss');
  rewardsSheet.appendRow([
    rewardId,
    visitId,
    studentId,
    data.medicineName || '마음 처방약',
    '칭찬 비타민 & 조언 카드',
    false,
    new Date()
  ]);

  return { success: true, rewardId: rewardId, bonusCookies: 2 };
}

// [C] 교사의 실물 워크북 확인 및 최종 간식 지급
function handleTeacherVerifyVisit(data) {
  const visitId = data.visitId;
  const studentId = data.studentId;

  // VISITS 상태 업데이트
  updateRowByKey('VISITS', 'visit_id', visitId, {
    paper_verified: true,
    reward_given: true,
    status: 'rewarded'
  });

  // REWARDS 업데이트
  updateRowByKey('REWARDS', 'visit_id', visitId, {
    verified_by_teacher: true
  });

  // 선생님 확인 보너스 칭찬쿠키 +1 지급
  adjustStudentCookie(studentId, 1, '교사 실물 워크북 확인 완료 보너스 (+1쿠키)');

  return { success: true };
}

// [D] 칭찬쿠키 가챠 뽑기
function handleDrawGacha(data) {
  const studentId = data.studentId;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 학생 잔액 확인
  const studentsSheet = ss.getSheetByName('STUDENTS');
  const rows = studentsSheet.getDataRange().getValues();
  let studentRowIdx = -1;
  let currentBalance = 0;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(studentId)) {
      studentRowIdx = i + 1;
      currentBalance = Number(rows[i][5]) || 0;
      break;
    }
  }

  if (currentBalance < 3) {
    throw new Error('칭찬쿠키가 부족합니다. (최소 3개 필요)');
  }

  // 3쿠키 차감
  adjustStudentCookie(studentId, -3, '칭찬가챠 머신 1회 이용 (-3쿠키)');

  // 가챠 보상 확률 추첨
  const PRIZES = [
    { name: '✨ 힐리 무지개 스티커팩', rarity: 'SSR', weight: 5 },
    { name: '🌟 마음 튼튼 스페셜 배지', rarity: 'SR', weight: 15 },
    { name: '🍪 특별 달콤 간식 교환권', rarity: 'SR', weight: 20 },
    { name: '🎨 힐링약국 캐릭터 포토카드', rarity: 'R', weight: 30 },
    { name: '🍬 힐리의 달콤 응원 캔디', rarity: 'N', weight: 30 }
  ];

  const totalWeight = PRIZES.reduce((acc, p) => acc + p.weight, 0);
  let randomNum = Math.random() * totalWeight;
  let selectedPrize = PRIZES[0];

  for (const p of PRIZES) {
    if (randomNum < p.weight) {
      selectedPrize = p;
      break;
    }
    randomNum -= p.weight;
  }

  // GACHA_LOG 기록
  const gachaSheet = ss.getSheetByName('GACHA_LOG');
  const logId = 'G' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd-HHmmss');
  gachaSheet.appendRow([
    logId,
    studentId,
    selectedPrize.name,
    selectedPrize.rarity,
    false,
    new Date()
  ]);

  return selectedPrize;
}

// [E] 고민가챠 도전 실천 기록
function handleSubmitWorryChallenge(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('WORRY_CHALLENGES');
  const challengeId = 'WC-' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd-HHmmss');

  sheet.appendRow([
    challengeId,
    data.studentId,
    data.hint,
    data.tested,
    data.rating,
    data.willUseAgain,
    data.reflection,
    new Date()
  ]);

  // 성찰 완료 시 칭찬쿠키 +1 지급
  adjustStudentCookie(data.studentId, 1, '고민가챠 시야 넓히기 실천 완료 (+1쿠키)');

  return { success: true, challengeId: challengeId };
}

// [F] 신약개발소 학생 새 증상 제안
function handleSubmitNewMedicine(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('NEW_CONDITION_REQUESTS');
  const reqId = 'REQ-' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd-HHmmss');

  sheet.appendRow([
    reqId,
    data.studentId,
    data.suggestedName,
    data.categoryId,
    data.whenAppears,
    data.helpNeeded,
    data.missionIdea,
    'pending',
    '',
    new Date()
  ]);

  // 제안 보답 칭찬쿠키 +1 지급
  adjustStudentCookie(data.studentId, 1, '신약개발소 새로운 마음 증상 제안 (+1쿠키)');

  return { success: true, reqId: reqId };
}

// =========================================================================
// 9. 학생 칭찬쿠키 잔액 변경 헬퍼
// =========================================================================
function adjustStudentCookie(studentId, amount, reason) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('STUDENTS');
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(studentId)) {
      const current = Number(rows[i][5]) || 0;
      const updated = Math.max(0, current + amount);
      sheet.getRange(i + 1, 6).setValue(updated);

      // COOKIE_LOG 추가
      const logSheet = ss.getSheetByName('COOKIE_LOG');
      const logId = 'CK-' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd-HHmmss');
      logSheet.appendRow([logId, studentId, amount, reason, updated, new Date()]);
      return updated;
    }
  }
  return 0;
}

// =========================================================================
// 10. 초기 데이터 통합 조회 헬퍼
// =========================================================================
function getFullInitialData() {
  return {
    settings: getTableData('SETTINGS'),
    classes: getTableData('CLASSES'),
    students: getTableData('STUDENTS'),
    categories: getTableData('CATEGORIES'),
    conditions: getTableData('CONDITIONS'),
    missions: getTableData('MISSIONS'),
    fortunes: getTableData('FORTUNES'),
    worryHints: getTableData('WORRY_GACHA'),
    visits: getTableData('VISITS'),
    rewards: getTableData('REWARDS')
  };
}

// 시트 데이터를 JSON 객체 배열로 변환
function getTableData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });
}

// 키 컬럼을 기준으로 행을 찾아 업데이트
function updateRowByKey(sheetName, keyColumnName, keyValue, updateObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return false;
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return false;
  const headers = rows[0];
  const keyIdx = headers.indexOf(keyColumnName);
  if (keyIdx === -1) return false;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][keyIdx]) === String(keyValue)) {
      for (const [colName, val] of Object.entries(updateObj)) {
        const colIdx = headers.indexOf(colName);
        if (colIdx !== -1) {
          sheet.getRange(i + 1, colIdx + 1).setValue(val);
        }
      }
      return true;
    }
  }
  return false;
}
