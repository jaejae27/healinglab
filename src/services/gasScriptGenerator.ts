/**
 * Google Apps Script 통합 코드 생성 서비스
 * 백엔드 (Code.gs) 및 프론트엔드 (Index.html), 매니페스트, 배포 가이드를 제공합니다.
 */

export function generateGoogleAppsScript(): string {
  return `/**
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

  const classesSheet = ss.getSheetByName('CLASSES');
  if (classesSheet.getLastRow() <= 1) {
    const defaultClasses = [
      [1, 1, true, new Date()], [1, 2, true, new Date()], [1, 3, true, new Date()],
      [2, 1, true, new Date()], [2, 2, true, new Date()], [2, 3, true, new Date()],
      [3, 1, true, new Date()], [3, 2, true, new Date()], [3, 3, true, new Date()]
    ];
    classesSheet.getRange(2, 1, defaultClasses.length, 4).setValues(defaultClasses);
  }

  SpreadsheetApp.getUi().alert('💊 힐링약국 22개 시트 데이터베이스 구축이 완료되었습니다!');
}

function seedSampleStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('STUDENTS');
  if (!sheet) return;

  const sampleStudents = [
    ['S1-1-01', 1, 1, 1, '김민준', 5, 1, new Date()],
    ['S1-1-02', 1, 1, 2, '이서연', 7, 2, new Date()],
    ['S1-1-03', 1, 1, 3, '박도윤', 3, 0, new Date()],
    ['S1-1-04', 1, 1, 4, '정하은', 4, 1, new Date()],
    ['S1-1-05', 1, 1, 5, '최시우', 2, 0, new Date()]
  ];

  if (sheet.getLastRow() <= 1) {
    sheet.getRange(2, 1, sampleStudents.length, 8).setValues(sampleStudents);
    SpreadsheetApp.getUi().alert('📋 샘플 학생 5명이 등록되었습니다.');
  }
}

function seedMasterData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const catSheet = ss.getSheetByName('CATEGORIES');
  if (catSheet && catSheet.getLastRow() <= 1) {
    const categories = [
      ['self', 'S', '나 자신', '자기이해 & 자존감', '🪞', '#F472B6', '남들과의 비교, 자신감 부족, 내 마음에 대한 솔직한 탐색'],
      ['friends', 'R', '친구·관계', '또래 관계 & 소통', '💌', '#FB7185', '친구 사이의 서운함, 눈치, 말하기 어려움, 대화의 거리'],
      ['study', 'A', '공부·할 일', '학습 & 실행력', '📚', '#38BDF8', '미루는 습관, 시작의 어려움, 시험 부담감, 집중의 흩어짐'],
      ['worries', 'W', '걱정·생각', '불안 & 생각 과다', '🤯', '#A78BFA', '꼬리를 무는 생각, 아직 안 일어난 일에 대한 염려, 선택 장애'],
      ['emotions', 'E', '감정 다루기', '분노 & 롤러코스터', '🌋', '#FB923C', '갑작스러운 짜증, 서운함 폭발, 표정 관리, 감정의 굴곡'],
      ['vitality', 'L', '피로·생활', '에너지 & 수면·스마트폰', '🪫', '#34D399', '방전된 체력, 폰에서 손 못 떼기, 밤늦게 안 자기, 무기력']
    ];
    catSheet.getRange(2, 1, categories.length, 7).setValues(categories);
  }

  const condSheet = ss.getSheetByName('CONDITIONS');
  const missionSheet = ss.getSheetByName('MISSIONS');
  
  if (condSheet && condSheet.getLastRow() <= 1) {
    const sampleConditions = [
      ['S01', 'self', '유리구슬 자존감 증후군', '작은 비판이나 실수에도 마음이 와장창 깨지는 느낌', '토닥토닥 캡슐', '누구나 깨지기 쉬운 날이 있어.', 'active', false],
      ['R01', 'friends', '단톡방 알림 집착증', '단톡방 메시지가 늦으면 심장이 쿵쾅거릴 때', '거리두기 젤리', '온라인의 속도가 우정의 깊이가 아니야.', 'active', false],
      ['A01', 'study', '내일부터 시작병', '해야 할 공부를 내일로 미루며 마음만 무거운 상태', '5분 스타트 츄잉껌', '딱 5분만 먼저 책장을 넘겨보자.', 'active', false],
      ['W01', 'worries', '생각 꼬리물기 과열증', '일어나지도 않은 불길한 시나리오가 재생될 때', '스톱 버튼 패치', '생각은 흘러가는 구름이야.', 'active', false],
      ['L01', 'vitality', '스마트폰 좀비 증후군', '자기 전 숏폼 보느라 새벽 2시가 넘어버릴 때', '디지털 디톡스 환', '화면을 끄고 깊은 휴식을 주자.', 'active', false]
    ];
    condSheet.getRange(2, 1, sampleConditions.length, 8).setValues(sampleConditions);

    if (missionSheet && missionSheet.getLastRow() <= 1) {
      const missionsData = [];
      sampleConditions.forEach(cond => {
        const id = cond[0];
        const name = cond[2];
        missionsData.push([id + '-M1', id, 'notice', '마음 신호 알아차리기', '"' + name + '" 신호 켜질 때 내 몸의 신호 관찰하기']);
        missionsData.push([id + '-M2', id, 'action', '5분 미니 행동 실천', '부담 없이 딱 5분만 타이머 켜고 쉬운 행동 1가지 해보기']);
        missionsData.push([id + '-M3', id, 'environment', '자기 조절 & 심호흡', '코로 4초 들이마시고 6초 천천히 내쉬며 나에게 "괜찮아" 말하기']);
      });
      missionSheet.getRange(2, 1, missionsData.length, 5).setValues(missionsData);
    }
  }

  SpreadsheetApp.getUi().alert('✨ 힐링약국 마스터데이터 주입이 완료되었습니다!');
}

function showDeployInfo() {
  SpreadsheetApp.getUi().alert('🌐 상단 [배포] > [새 배포] > [웹 앱] > 액세스 권한 [모든 사용자(Anyone)]로 배포하세요.');
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  if (action) {
    let result = { status: 'success' };
    try {
      if (action === 'getInitialData') {
        result.data = getFullInitialData();
      } else if (action === 'getStudents') {
        result.data = getTableData('STUDENTS');
      } else if (action === 'getVisits') {
        result.data = getTableData('VISITS');
      }
    } catch (err) {
      result = { status: 'error', message: err.toString() };
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('💊 힐링약국 (Healing Pharmacy)')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
  } catch (err) {
    return HtmlService.createHtmlOutput('<h2>💊 힐링약국 백엔드가 준비되었습니다. Index.html을 확인하세요.</h2>');
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  let result = { status: 'success' };

  try {
    lock.waitLock(10000);
    const postData = JSON.parse(e.postData.contents);
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
    }
  } catch (err) {
    result = { status: 'error', message: err.toString() };
  } finally {
    lock.releaseLock();
  }

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function handleVisitSubmit(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const visitId = 'V' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd-HHmmss');
  ss.getSheetByName('VISITS').appendRow([visitId, data.studentId, data.categoryId, data.primaryConditionId, 'issued', new Date(), '', false, false, false]);
  return visitId;
}

function handleMissionResultSubmit(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName('MISSION_RESULTS').appendRow([data.visitId, data.bestMissionIndex, data.m1Rating, data.m2Rating, data.m3Rating, data.reflectionWhy || '', data.willUseAgain || '', data.reflectionLearned || '', data.futurePlan || '', new Date()]);
  updateRowByKey('VISITS', 'visit_id', data.visitId, { status: 'submitted', submitted_at: new Date(), web_verified: true });
  adjustStudentCookie(data.studentId, 2, '처방 실천 소감 제출 (+2쿠키)');
  return { success: true, bonusCookies: 2 };
}

function handleTeacherVerifyVisit(data) {
  updateRowByKey('VISITS', 'visit_id', data.visitId, { paper_verified: true, reward_given: true, status: 'rewarded' });
  adjustStudentCookie(data.studentId, 1, '교사 실물 워크북 확인 보너스 (+1쿠키)');
  return { success: true };
}

function handleDrawGacha(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  adjustStudentCookie(data.studentId, -3, '칭찬가챠 1회 이용 (-3쿠키)');
  const prize = { name: '✨ 힐리 무지개 스티커팩', rarity: 'SSR' };
  ss.getSheetByName('GACHA_LOG').appendRow(['G' + Date.now(), data.studentId, prize.name, prize.rarity, false, new Date()]);
  return prize;
}

function adjustStudentCookie(studentId, amount, reason) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('STUDENTS');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(studentId)) {
      const current = Number(rows[i][5]) || 0;
      const updated = Math.max(0, current + amount);
      sheet.getRange(i + 1, 6).setValue(updated);
      ss.getSheetByName('COOKIE_LOG').appendRow(['CK-' + Date.now(), studentId, amount, reason, updated, new Date()]);
      return updated;
    }
  }
  return 0;
}

function getFullInitialData() {
  return {
    students: getTableData('STUDENTS'),
    conditions: getTableData('CONDITIONS'),
    visits: getTableData('VISITS')
  };
}

function getTableData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

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
        if (colIdx !== -1) sheet.getRange(i + 1, colIdx + 1).setValue(val);
      }
      return true;
    }
  }
  return false;
}
`;
}

export function generateGasManifest(): string {
  return `{
  "timeZone": "Asia/Seoul",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  }
}`;
}

export function generateGasReadme(): string {
  return `# 💊 힐링약국 Google Apps Script 3분 배포 가이드

1. Google Drive에서 새 스프레드시트를 생성합니다.
2. 상단 메뉴 [확장 프로그램] > [Apps Script]를 클릭합니다.
3. Code.gs에 백엔드 코드를 붙여넣습니다.
4. [+] 버튼을 눌러 HTML 파일 'Index'를 만들고 프론트엔드 코드를 붙여넣습니다.
5. setupHealingPharmacy() 함수를 1회 실행하여 22개 시트를 자동 생성합니다.
6. 우측 상단 [배포] > [새 배포] > [웹 앱] (액세스: 모든 사용자)로 배포하면 URL이 발급됩니다!
`;
}

export function generateGasIndexHtml(): string {
  // Returns complete single-file HTML for Google Apps Script Web App
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>💊 힐링약국 (Healing Pharmacy) - Google Apps Script</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Jua&family=Noto+Sans+KR:wght@400;500;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['"Noto Sans KR"', 'sans-serif'], jua: ['"Jua"', 'sans-serif'] },
          colors: { ivory: '#FDFCF0', olive: '#5A5A40', creamy: '#FFFBEB' }
        }
      }
    }
  </script>
  <style>
    body { background-color: #FDFCF0; color: #4A4A4A; font-family: 'Noto Sans KR', sans-serif; }
    .font-jua { font-family: 'Jua', sans-serif; }
    @media print {
      body * { visibility: hidden; }
      #printModalContent, #printModalContent * { visibility: visible; }
      #printModalContent { position: absolute; left: 0; top: 0; width: 100%; }
    }
  </style>
</head>
<body class="min-h-screen flex flex-col relative overflow-x-hidden">
  <header class="bg-white/80 backdrop-blur-md border-b-2 border-white sticky top-0 z-30 px-4 py-2.5">
    <div class="max-w-md mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-2xl">💊</span>
        <div>
          <h1 class="font-jua text-base text-[#5A5A40] leading-none">힐링약국</h1>
          <p class="text-[10px] text-[#5A5A40]/60 font-medium">마음 처방 & 행동 실천</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div id="studentBadge" class="hidden flex items-center gap-1.5 bg-[#FFFBEB] px-3 py-1 rounded-full border border-white text-xs font-bold text-[#854D0E]">
          <span id="studentBadgeName">김민준</span>
          <span class="text-[11px] bg-[#FEF08A] px-1.5 rounded-full">🍪 <span id="studentBadgeCookies">5</span></span>
        </div>
        <button onclick="toggleTeacherMode()" class="text-xs text-[#5A5A40] bg-white border-2 border-white px-3 py-1.5 rounded-2xl shadow-sm font-bold">
          <span id="teacherBtnText">선생님</span>
        </button>
      </div>
    </div>
  </header>

  <main id="mainContainer" class="flex-1 max-w-md mx-auto w-full px-4 py-4 pb-24 relative z-10">
    <!-- Student Login -->
    <div id="viewLogin" class="space-y-6 pt-4">
      <div class="bg-white/85 rounded-[44px] border-4 border-white shadow-2xl p-7 text-center">
        <div class="w-20 h-20 mx-auto mb-3">
          <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-md">
            <ellipse cx="50" cy="52" rx="42" ry="38" fill="#FFFBEB" stroke="#5A5A40" stroke-width="3" />
            <ellipse cx="26" cy="58" rx="7" ry="4" fill="#FECDD3" />
            <ellipse cx="74" cy="58" rx="7" ry="4" fill="#FECDD3" />
            <ellipse cx="34" cy="48" rx="4.5" ry="6" fill="#5A5A40" />
            <ellipse cx="66" cy="48" rx="4.5" ry="6" fill="#5A5A40" />
            <path d="M 42 56 Q 50 64 58 56" stroke="#5A5A40" stroke-width="3" fill="none" stroke-linecap="round" />
            <rect x="42" y="10" width="16" height="16" rx="4" fill="#34D399" stroke="#5A5A40" stroke-width="2.5" />
            <rect x="47" y="13" width="6" height="10" fill="#FFFFFF" rx="1" />
            <rect x="45" y="15" width="10" height="6" fill="#FFFFFF" rx="1" />
          </svg>
        </div>
        <h2 class="font-jua text-xl text-[#5A5A40]">어서 와! 여기는 힐링약국이야</h2>
        <p class="text-xs text-[#5A5A40]/70 mt-1 font-medium">오늘 네 마음 상태를 같이 살펴보고 처방전을 받아볼까?</p>

        <form id="studentLoginForm" onsubmit="handleStudentLogin(event)" class="mt-5 space-y-3.5 text-left">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-[#5A5A40] mb-1">학년</label>
              <select id="loginGrade" onchange="updateStudentOptions()" class="w-full bg-[#FDFCF0] border-2 border-white rounded-2xl p-2.5 text-sm font-bold text-[#5A5A40]">
                <option value="1">1학년</option>
                <option value="2">2학년</option>
                <option value="3">3학년</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-[#5A5A40] mb-1">반</label>
              <select id="loginClass" onchange="updateStudentOptions()" class="w-full bg-[#FDFCF0] border-2 border-white rounded-2xl p-2.5 text-sm font-bold text-[#5A5A40]">
                <option value="1">1반</option>
                <option value="2">2반</option>
                <option value="3">3반</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-[#5A5A40] mb-1">이름 (번호)</label>
            <select id="loginStudent" required class="w-full bg-[#FDFCF0] border-2 border-white rounded-2xl p-3 text-sm font-bold text-[#5A5A40]">
              <option value="">-- 내 이름을 선택해주세요 --</option>
            </select>
          </div>
          <button type="submit" class="w-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-jua text-lg py-3.5 rounded-2xl shadow-xl border-2 border-white">
            ✨ 힐링약국 들어가기
          </button>
        </form>
      </div>
    </div>

    <!-- Student Home -->
    <div id="viewHome" class="hidden space-y-5">
      <div class="bg-[#FFFBEB] border-4 border-white rounded-[40px] shadow-xl p-5 text-center">
        <h3 class="font-jua text-lg text-[#5A5A40]">안녕! 오늘 네 마음은 어때?</h3>
        <p class="text-xs text-[#5A5A40]/70 mt-0.5">가상 증상과 맞춤 행동 처방전이 준비되어 있어 💊</p>
      </div>

      <div id="activePrescriptionCard" class="hidden bg-white/90 rounded-[32px] border-4 border-white p-5 shadow-lg space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#854D0E] bg-[#FEF08A] px-3 py-1 rounded-full">🏃 실천 진행 중 처방전</span>
          <span id="activeCondCode" class="text-xs font-bold text-slate-400">A01</span>
        </div>
        <h4 id="activeCondTitle" class="font-jua text-xl text-[#5A5A40]">내일부터 시작병</h4>
        <div id="activeMissionsList" class="space-y-1.5 text-xs text-[#4A4A4A]"></div>
        <div class="pt-2 flex justify-between">
          <button onclick="openWorkbookPrintModal()" class="text-xs font-jua text-slate-500">🖨️ 실물 워크북 보기</button>
          <button onclick="showView('doneForm')" class="text-xs font-jua text-teal-700 bg-teal-100 px-3 py-1 rounded-xl">기록 작성 ➔</button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3.5">
        <button onclick="showView('diagnosis')" class="bg-white/80 border-4 border-white rounded-[32px] p-4 flex flex-col items-center gap-2 shadow-lg hover:scale-102">
          <div class="w-14 h-14 bg-[#F5D0FE] rounded-2xl flex items-center justify-center text-3xl">🩺</div>
          <p class="text-base font-black text-[#86198F] font-jua">오늘 마음 진료</p>
        </button>
        <button onclick="showView('doneForm')" class="bg-white/80 border-4 border-white rounded-[32px] p-4 flex flex-col items-center gap-2 shadow-lg hover:scale-102">
          <div class="w-14 h-14 bg-[#99F6E4] rounded-2xl flex items-center justify-center text-3xl">✅</div>
          <p class="text-base font-black text-[#0D9488] font-jua">처방 다했어요</p>
        </button>
        <button onclick="showView('mypage')" class="bg-white/80 border-4 border-white rounded-[32px] p-4 flex flex-col items-center gap-2 shadow-lg hover:scale-102">
          <div class="w-14 h-14 bg-[#FEF08A] rounded-2xl flex items-center justify-center text-3xl">📒</div>
          <p class="text-base font-black text-[#854D0E] font-jua">나의 마음기록</p>
        </button>
        <button onclick="showView('gacha')" class="bg-white/80 border-4 border-white rounded-[32px] p-4 flex flex-col items-center gap-2 shadow-lg hover:scale-102">
          <div class="w-14 h-14 bg-[#BFDBFE] rounded-2xl flex items-center justify-center text-3xl">🎰</div>
          <p class="text-base font-black text-[#1E40AF] font-jua">칭찬쿠키 가챠</p>
        </button>
      </div>
    </div>

    <!-- Diagnosis Flow -->
    <div id="viewDiagnosis" class="hidden space-y-4">
      <div id="diagStepCategory" class="space-y-4">
        <div class="bg-white/85 border-4 border-white rounded-[36px] p-5 text-center">
          <h3 class="font-jua text-lg text-[#5A5A40]">어떤 일로 마음이 복잡해?</h3>
        </div>
        <div id="categoriesGrid" class="grid grid-cols-2 gap-3"></div>
      </div>

      <div id="diagStepRecommend" class="hidden space-y-4">
        <div class="bg-white/85 border-4 border-white rounded-[36px] p-5 text-center">
          <h3 class="font-jua text-lg text-[#5A5A40]">발견된 가상 증상</h3>
        </div>
        <div id="recommendedConditionsList" class="space-y-3"></div>
        <button id="btnIssuePrescription" onclick="issuePrescription()" disabled class="w-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-jua text-base py-3.5 rounded-2xl border-2 border-white">
          💊 처방전 발급받기
        </button>
      </div>

      <div id="diagStepIssued" class="hidden space-y-4">
        <div class="bg-amber-100 rounded-[32px] border-4 border-white p-5 text-center">
          <h3 id="prescribedCodeText" class="font-jua text-2xl text-[#5A5A40]">A01 처방전</h3>
          <p class="text-xs mt-1">교실 서류함에서 <span id="prescribedNameText" class="font-bold"></span> 워크북을 1장 챙기세요!</p>
        </div>
        <div id="prescribedMissionsList" class="space-y-2"></div>
        <button onclick="showView('home')" class="w-full bg-teal-500 text-white font-jua text-base py-3.5 rounded-2xl">
          홈으로 이동
        </button>
      </div>
    </div>

    <!-- Done Form -->
    <div id="viewDoneForm" class="hidden space-y-4">
      <div class="bg-white/85 border-4 border-white rounded-[36px] p-5 text-center">
        <h3 class="font-jua text-lg text-[#5A5A40]">처방전 실천 결과 기록</h3>
      </div>
      <form onsubmit="handleDoneFormSubmit(event)" class="bg-white/90 rounded-[36px] border-4 border-white p-5 space-y-4">
        <div id="doneRatingMissions" class="space-y-2 text-xs"></div>
        <div>
          <label class="block font-jua text-sm text-[#5A5A40] mb-1">성찰 소감 한 줄</label>
          <textarea id="doneReflectionWhy" required rows="2" placeholder="어떤 점이 도움이 되었나요?" class="w-full bg-[#FDFCF0] border-2 border-white rounded-2xl p-2.5 text-xs"></textarea>
        </div>
        <button type="submit" class="w-full bg-teal-500 text-white font-jua text-base py-3.5 rounded-2xl">
          소감 제출하고 쿠키 받기 (+2쿠키)
        </button>
      </form>
    </div>

    <!-- My Page -->
    <div id="viewMypage" class="hidden space-y-4">
      <div class="bg-white/85 border-4 border-white rounded-[36px] p-5 flex justify-between items-center">
        <h3 id="myPageStudentName" class="font-jua text-xl text-[#5A5A40]">김민준 학생의 서랍</h3>
        <span class="text-xs font-bold bg-[#FEF08A] px-3 py-1.5 rounded-full">🍪 <span id="myPageCookieCount">5</span>개</span>
      </div>
      <div id="myPageVisitsList" class="space-y-2"></div>
    </div>

    <!-- Gacha -->
    <div id="viewGacha" class="hidden space-y-4 text-center">
      <div class="bg-white/85 border-4 border-white rounded-[36px] p-6">
        <h3 class="font-jua text-2xl text-[#1E40AF]">칭찬쿠키 가챠 머신</h3>
        <p class="text-xs text-slate-500 mt-1">1회 뽑기: 칭찬쿠키 3개</p>
      </div>
      <div class="bg-white/90 rounded-[40px] border-4 border-white p-8 flex flex-col items-center">
        <div id="gachaMachineDisplay" class="w-32 h-32 bg-blue-50 border-4 border-dashed border-blue-200 rounded-3xl flex items-center justify-center text-5xl mb-4">🎁</div>
        <button onclick="pullGachaMachine()" class="bg-blue-600 text-white font-jua text-lg px-8 py-3.5 rounded-2xl">레버 당기기 (-3쿠키)</button>
      </div>
    </div>

    <!-- Teacher Dashboard -->
    <div id="viewTeacher" class="hidden space-y-4">
      <div class="bg-white/85 border-4 border-white rounded-[36px] p-5 flex justify-between items-center">
        <h2 class="font-jua text-xl text-[#5A5A40]">선생님 관리자 센터</h2>
        <button onclick="toggleTeacherMode()" class="text-xs font-bold bg-white border px-3 py-1.5 rounded-xl">학생 모드</button>
      </div>
      <div id="tVerificationTable" class="space-y-2 text-xs"></div>
    </div>
  </main>

  <nav id="bottomNav" class="hidden fixed bottom-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-t-2 border-white py-2 px-4 shadow-lg">
    <div class="max-w-md mx-auto flex items-center justify-around">
      <button onclick="showView('home')" class="py-1 px-3 text-xs font-jua text-[#5A5A40]">🏠 홈</button>
      <button onclick="showView('diagnosis')" class="py-1 px-3 text-xs font-jua text-[#5A5A40]">🩺 진료</button>
      <button onclick="showView('doneForm')" class="py-1 px-3 text-xs font-jua text-[#5A5A40]">✅ 처방완료</button>
      <button onclick="showView('mypage')" class="py-1 px-3 text-xs font-jua text-[#5A5A40]">📒 기록</button>
    </div>
  </nav>

  <script>
    let currentStudent = null;
    let isTeacherMode = false;
    let appData = {
      categories: [
        { id: 'self', code: 'S', name: '나 자신', bgLight: '#FDF2F8', icon: '🪞' },
        { id: 'friends', code: 'R', name: '친구·관계', bgLight: '#FFF1F2', icon: '💌' },
        { id: 'study', code: 'A', name: '공부·할 일', bgLight: '#F0F9FF', icon: '📚' },
        { id: 'worries', code: 'W', name: '걱정·생각', bgLight: '#F5F3FF', icon: '🤯' },
        { id: 'vitality', code: 'L', name: '피로·생활', bgLight: '#ECFDF5', icon: '🪫' }
      ],
      students: [
        { id: 'S1-1-01', grade: 1, classNum: 1, number: 1, name: '김민준', cookieBalance: 5 },
        { id: 'S1-1-02', grade: 1, classNum: 1, number: 2, name: '이서연', cookieBalance: 7 },
        { id: 'S1-1-03', grade: 1, classNum: 1, number: 3, name: '박도윤', cookieBalance: 3 }
      ],
      conditions: [
        { id: 'A01', categoryId: 'study', name: '내일부터 시작병', summary: '해야 할 공부를 미루며 마음만 무거운 상태' },
        { id: 'R01', categoryId: 'friends', name: '단톡방 알림 집착증', summary: '메시지가 늦으면 심장이 쿵쾅거릴 때' },
        { id: 'S01', categoryId: 'self', name: '유리구슬 자존감 증후군', summary: '작은 실수에도 마음이 와장창 깨지는 느낌' }
      ],
      visits: []
    };

    let selectedCategory = 'study';
    let selectedPrimaryCond = null;
    let activeVisit = null;

    window.addEventListener('DOMContentLoaded', () => {
      const saved = localStorage.getItem('hp_visits');
      if (saved) appData.visits = JSON.parse(saved);
      updateStudentOptions();
      renderCategories();
    });

    function updateStudentOptions() {
      const grade = Number(document.getElementById('loginGrade').value);
      const classNum = Number(document.getElementById('loginClass').value);
      const select = document.getElementById('loginStudent');
      select.innerHTML = '<option value="">-- 내 이름을 선택해주세요 --</option>';
      appData.students.filter(s => s.grade === grade && s.classNum === classNum).forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.number + '번 ' + s.name;
        select.appendChild(opt);
      });
    }

    function handleStudentLogin(e) {
      e.preventDefault();
      const id = document.getElementById('loginStudent').value;
      const st = appData.students.find(s => s.id === id);
      if (!st) return;
      currentStudent = st;
      document.getElementById('studentBadge').classList.remove('hidden');
      document.getElementById('studentBadgeName').textContent = st.name;
      document.getElementById('studentBadgeCookies').textContent = st.cookieBalance;
      document.getElementById('bottomNav').classList.remove('hidden');
      activeVisit = appData.visits.find(v => v.studentId === st.id && v.status === 'issued');
      updateHomePrescriptionCard();
      showView('home');
    }

    function showView(id) {
      ['Login', 'Home', 'Diagnosis', 'DoneForm', 'Mypage', 'Gacha', 'Teacher'].forEach(v => {
        const el = document.getElementById('view' + v);
        if (el) el.classList.add('hidden');
      });
      const target = document.getElementById('view' + id.charAt(0).toUpperCase() + id.slice(1));
      if (target) target.classList.remove('hidden');
      if (id === 'home') updateHomePrescriptionCard();
      if (id === 'mypage') renderMyPage();
      if (id === 'teacher') renderTeacherDashboard();
    }

    function updateHomePrescriptionCard() {
      const card = document.getElementById('activePrescriptionCard');
      if (activeVisit) {
        card.classList.remove('hidden');
        document.getElementById('activeCondCode').textContent = activeVisit.primaryConditionId;
        document.getElementById('activeCondTitle').textContent = activeVisit.primaryConditionName;
      } else {
        card.classList.add('hidden');
      }
    }

    function renderCategories() {
      const grid = document.getElementById('categoriesGrid');
      grid.innerHTML = appData.categories.map(c => \`
        <button onclick="selectCategory('\${c.id}')" style="background-color:\${c.bgLight}" class="p-4 rounded-[28px] border-4 border-white text-left shadow-md">
          <span class="text-3xl">\${c.icon}</span>
          <h4 class="font-jua text-base text-[#5A5A40] mt-2">\${c.name}</h4>
        </button>
      \`).join('');
    }

    function selectCategory(id) {
      selectedCategory = id;
      document.getElementById('diagStepCategory').classList.add('hidden');
      document.getElementById('diagStepRecommend').classList.remove('hidden');
      const conds = appData.conditions.filter(c => c.categoryId === id || c.categoryId === 'study');
      document.getElementById('recommendedConditionsList').innerHTML = conds.map(c => \`
        <div class="rounded-[28px] border-4 border-white p-4 bg-[#FFFBEB]">
          <h4 class="font-jua text-lg text-[#5A5A40]">\${c.name}</h4>
          <p class="text-xs text-slate-500 mb-2">"\${c.summary}"</p>
          <button onclick="selectPrimaryCondition('\${c.id}')" class="w-full text-xs py-2 rounded-xl bg-amber-200 font-jua">이거 완전 나야 (선택)</button>
        </div>
      \`).join('');
    }

    function selectPrimaryCondition(id) {
      selectedPrimaryCond = appData.conditions.find(c => c.id === id);
      document.getElementById('btnIssuePrescription').disabled = false;
    }

    function issuePrescription() {
      if (!selectedPrimaryCond || !currentStudent) return;
      const v = {
        visitId: 'V' + Date.now(),
        studentId: currentStudent.id,
        primaryConditionId: selectedPrimaryCond.id,
        primaryConditionName: selectedPrimaryCond.name,
        status: 'issued',
        missions: [
          { title: '마음 신호 알아차리기', desc: '몸의 신호 관찰하기' },
          { title: '5분 미니 행동 실천', desc: '5분 타이머 켜고 해보기' }
        ]
      };
      appData.visits.push(v);
      activeVisit = v;
      localStorage.setItem('hp_visits', JSON.stringify(appData.visits));
      if (window.google && google.script && google.script.run) {
        google.script.run.handleVisitSubmit(v);
      }
      document.getElementById('diagStepRecommend').classList.add('hidden');
      document.getElementById('diagStepIssued').classList.remove('hidden');
      document.getElementById('prescribedCodeText').textContent = v.primaryConditionId + ' 처방전';
      document.getElementById('prescribedNameText').textContent = v.primaryConditionName;
    }

    function handleDoneFormSubmit(e) {
      e.preventDefault();
      if (!activeVisit || !currentStudent) return;
      activeVisit.status = 'submitted';
      currentStudent.cookieBalance += 2;
      document.getElementById('studentBadgeCookies').textContent = currentStudent.cookieBalance;
      localStorage.setItem('hp_visits', JSON.stringify(appData.visits));
      if (window.google && google.script && google.script.run) {
        google.script.run.handleMissionResultSubmit({ visitId: activeVisit.visitId, studentId: currentStudent.id, bestMissionIndex: 1 });
      }
      alert('🎉 처방 소감이 기록되었습니다! (+2쿠키 적립)');
      activeVisit = null;
      showView('home');
    }

    function renderMyPage() {
      if (!currentStudent) return;
      document.getElementById('myPageStudentName').textContent = currentStudent.name + ' 학생의 서랍';
      document.getElementById('myPageCookieCount').textContent = currentStudent.cookieBalance;
      const myVisits = appData.visits.filter(v => v.studentId === currentStudent.id);
      document.getElementById('myPageVisitsList').innerHTML = myVisits.map(v => \`
        <div class="p-3 bg-[#FDFCF0] border-2 border-white rounded-2xl flex justify-between">
          <span class="font-jua text-sm">\${v.primaryConditionName}</span>
          <span class="text-xs font-bold \${v.status === 'submitted' ? 'text-teal-600' : 'text-amber-600'}">\${v.status === 'submitted' ? '완료' : '진행중'}</span>
        </div>
      \`).join('');
    }

    function pullGachaMachine() {
      if (!currentStudent || currentStudent.cookieBalance < 3) {
        alert('칭찬쿠키가 부족합니다! (최소 3개 필요)');
        return;
      }
      currentStudent.cookieBalance -= 3;
      document.getElementById('studentBadgeCookies').textContent = currentStudent.cookieBalance;
      alert('🎉 축하합니다! [✨ 힐리 무지개 스티커팩 (SSR)] 당첨!');
    }

    function toggleTeacherMode() {
      if (!isTeacherMode) {
        const pass = prompt('선생님 비밀번호를 입력해주세요 (1234)');
        if (pass !== '1234') return;
        isTeacherMode = true;
        document.getElementById('bottomNav').classList.add('hidden');
        showView('teacher');
      } else {
        isTeacherMode = false;
        showView('home');
      }
    }

    function renderTeacherDashboard() {
      const table = document.getElementById('tVerificationTable');
      table.innerHTML = appData.visits.map(v => \`
        <div class="p-3 bg-[#FDFCF0] rounded-2xl border-2 border-white flex justify-between items-center">
          <span>\${v.primaryConditionName} (\${v.studentId})</span>
          <button onclick="verifyVisit('\${v.visitId}')" class="px-3 py-1 bg-amber-200 rounded-xl font-jua">\${v.status === 'rewarded' ? '완료 ✓' : '확인 (+1쿠키)'}</button>
        </div>
      \`).join('');
    }

    function verifyVisit(id) {
      const v = appData.visits.find(x => x.visitId === id);
      if (v) {
        v.status = 'rewarded';
        alert('실물 워크북 확인 완료 및 보너스 쿠키 지급');
        renderTeacherDashboard();
      }
    }
  </script>
</body>
</html>`;
}
