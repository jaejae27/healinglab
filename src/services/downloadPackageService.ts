import * as XLSX from 'xlsx';
import { VIRTUAL_CONDITIONS } from '../data/conditions';
import { CATEGORIES } from '../data/categories';
import { DEFAULT_SETTINGS, INITIAL_CLASSES } from '../data/initialData';
import { generateGoogleAppsScript, generateGasIndexHtml } from './gasScriptGenerator';

/**
 * Service to generate real, downloadable file assets for other schools
 * wishing to independently install and operate Healing Pharmacy.
 *
 * All generated files contain ZERO private data from the original school (Baegun Lake Middle School).
 */

function downloadBlob(content: BlobPart, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export class DownloadPackageService {
  /**
   * 1. 학생 명단 등록 엑셀 양식 (.xlsx)
   * SheetJS를 사용하여 서식, 헤더, 예시 데이터가 포함된 실제 엑셀 파일 생성
   */
  static downloadStudentRosterTemplate() {
    const wb = XLSX.utils.book_new();

    // Sheet 1: 실제 업로드용 학생 명단
    const rosterData = [
      ['번호', '이름', '비고 (선택)'],
      [1, '김민준', '예시 학생 1 (실제 학생으로 수정하세요)'],
      [2, '이서연', '예시 학생 2'],
      [3, '박도윤', ''],
      [4, '정예은', ''],
      [5, '최하은', '']
    ];
    const wsRoster = XLSX.utils.aoa_to_sheet(rosterData);
    wsRoster['!cols'] = [{ wch: 10 }, { wch: 18 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsRoster, '학생명단');

    // Sheet 2: 교사용 등록 가이드
    const guideData = [
      ['[힐링약국 학생 명단 작성 안내]'],
      [''],
      ['1. 1행의 헤더(번호, 이름, 비고)는 그대로 유지해 주세요.'],
      ['2. 학생의 학년과 반은 힐링약국 교사 대시보드에서 선택 후 업로드되므로, 시트에는 [번호]와 [이름]만 입력하시면 됩니다.'],
      ['3. 초기 비밀번호(PIN)는 업로드 시 자동으로 [0000]으로 생성되며, 학생이 첫 로그인 후 마이페이지에서 직접 변경할 수 있습니다.'],
      ['4. 지원 형식: .xlsx, .xls, .csv'],
      ['5. 업로드 위치: 교사 대시보드 > [학생 관리] 탭 > 학년/반 선택 > [엑셀로 명단 일괄 등록] 버튼 클릭']
    ];
    const wsGuide = XLSX.utils.aoa_to_sheet(guideData);
    wsGuide['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsGuide, '작성방법_안내');

    XLSX.writeFile(wb, '힐링약국_학생명단_등록양식_샘플.xlsx');
  }

  /**
   * 2. 초보자용 10단계 독립 설치 설명서 (.md)
   */
  static downloadInstallationManual() {
    const manualContent = `# 힐링약국(School Mind Pharmacy) 학교별 독립 설치 및 운영 설명서

본 문서는 백운호수중학교에서 실천한 전교생 대상 사회정서교육(SEL) 실천 웹앱 **'힐링약국'**을 다른 학교에서 독립적으로 설치하여 무료로 운영할 수 있도록 돕는 실전 매뉴얼입니다.

---

## 📌 1. 전체 설치 개요 및 권장 구성
- **프론트엔드/호스팅:** GitHub 저장소 Fork + Vercel 무료 호스팅 (또는 GitHub Pages)
- **데이터베이스:** Google Firebase Firestore (무료 Spark 플랜, 신용카드 등록 불필요)
- **운영 비용:** 0원 (초·중·고 전교생 규모에서도 무료 제공량 내에서 충분히 운영 가능)
- **데이터 독립성:** 우리 학교만의 독립된 Firebase DB를 사용하므로 타 학교 데이터와 100% 분리

---

## 🚀 2. 단계별 설치 순서 (10단계 요약)

### [1단계] 준비물 및 계정 확인
- **Google 계정:** Firebase 프로젝트 생성용
- **GitHub 계정 (선택 권장):** 소스코드 관리 및 Vercel 원클릭 배포용

### [2단계] 프로젝트 사본 만들기
1. GitHub 저장소 주소에 접속하여 우측 상단의 **[Fork]** 버튼을 누릅니다.
2. 내 GitHub 계정에 사본 저장소(Repository)가 생성됩니다.

### [3단계] 우리 학교 전용 Firebase 데이터베이스 생성
1. [Firebase Console](https://console.firebase.google.com/)에 접속합니다.
2. **[프로젝트 추가]**를 클릭하고 프로젝트 이름(예: \`my-school-mind-pharmacy\`)을 입력합니다. (Google 애널리틱스는 선택 사항)
3. 좌측 메뉴 **[빌드] > [Firestore Database]** 클릭 > **[데이터베이스 만들기]**를 클릭합니다.
4. 위치(Region)는 **\`asia-northeast3 (서울)\`**을 권장합니다.
5. 보안 규칙 시작 모드는 **[테스트 모드에서 시작]**을 선택합니다.
6. [규칙] 탭에서 함께 제공되는 \`firestore.rules\` 파일의 내용을 붙여넣고 **[게시]**를 누릅니다.
7. 프로젝트 설정(톱니바퀴 아이콘) > [일반] > 하단 **[내 앱] > 웹(</>)** 아이콘을 클릭하여 웹 앱을 등록합니다.
8. 화면에 나오는 \`firebaseConfig\` (apiKey, projectId, appId 등) 값을 복사해 둡니다.

### [4단계] Vercel 원클릭 무료 배포 및 환경변수 연결
1. [Vercel](https://vercel.com/)에 접속하여 GitHub 계정으로 로그인합니다.
2. **[Add New...] > [Project]**를 누르고 2단계에서 Fork한 저장소를 선택(Import)합니다.
3. **Environment Variables (환경변수)** 섹션에 아래 6개 값을 추가합니다:
   - \`VITE_FIREBASE_API_KEY\`: (복사한 apiKey)
   - \`VITE_FIREBASE_AUTH_DOMAIN\`: (복사한 authDomain)
   - \`VITE_FIREBASE_PROJECT_ID\`: (복사한 projectId)
   - \`VITE_FIREBASE_STORAGE_BUCKET\`: (복사한 storageBucket)
   - \`VITE_FIREBASE_MESSAGING_SENDER_ID\`: (복사한 messagingSenderId)
   - \`VITE_FIREBASE_APP_ID\`: (복사한 appId)
4. **[Deploy]** 버튼을 클릭하면 약 1~2분 뒤 우리 학교만의 고유 인터넷 주소(예: \`https://우리학교-mind.vercel.app\`)가 완성됩니다!

### [5단계] 학교명 및 운영 설정 변경
1. 생성된 웹사이트에 접속하여 우측 상단 **[선생님 관리자 모드]**를 클릭합니다.
2. 기본 관리자 비밀번호인 **\`1234\`**를 입력하고 로그인합니다.
3. 대시보드 우측 상단 **[비밀번호 변경]** 버튼을 눌러 본인만의 안전한 비밀번호로 즉시 변경합니다.
4. **[환경설정]** 탭에서 운영 기간(시작일/종료일), 칭찬쿠키 뽑기 가격, 재방문 쿨다운 등을 우리 학교 상황에 맞게 조정합니다.

### [6단계] 학생 명단 등록
1. 교사 대시보드 **[학생 관리]** 탭으로 이동합니다.
2. 다운로드받은 \`힐링약국_학생명단_등록양식_샘플.xlsx\`에 각 반 학생의 번호와 이름을 입력합니다.
3. 학년/반을 선택하고 **[엑셀로 명단 일괄 등록]**을 누르면 10초 만에 해당 반 전원 등록 완료!
   (초기 비밀번호는 0000으로 생성됩니다)

### [7단계] 시험 운영 (테스트 학생 접속)
1. 학생 로그인 화면으로 이동하여 등록한 1번 학생 이름과 번호, 비밀번호 0000을 입력합니다.
2. 마음신호 체크리스트 작성 -> 처방전 받기 -> 5일 실천 미션 확인 -> 칭찬쿠키 획득 -> 가챠 뽑기까지 전체 흐름이 정상 작동하는지 확인합니다.

### [8단계] 전교생 안내 및 QR코드 배부
1. 배포된 웹사이트 주소를 네이버/구글 QR코드 생성기를 통해 QR 이미지로 만듭니다.
2. 인쇄용 학생 이용 안내문 및 포스터를 각 교실 및 복도에 부착합니다.

### [9단계] 운영 중 백업 관리
- 매주 금요일 교사 대시보드 **[데이터 관리]** 탭에서 **[전체 데이터 백업 파일 다운로드(JSON)]**를 눌러 안전하게 PC에 백업합니다.

### [10단계] 학기 종료 및 새 학년도 초기화
- 1학기(또는 1년) 프로젝트가 끝나면, 교사 대시보드 **[환경설정] > [데이터 초기화]**에서:
  - **Option A (활동 내용만 초기화):** 학생 명단은 유지하고 쿠키/방문 기록만 0으로 리셋
  - **Option B (전체 초기화):** 졸업/진급을 위해 학생 명단까지 깨끗하게 삭제
  (초기화 직전 시스템이 긴급 자동 복원 스냅샷을 생성하므로 안심하고 진행하실 수 있습니다)

---
제작: 백운호수중학교 사회정서교육 프로젝트팀
`;

    downloadBlob(manualContent, '힐링약국_독립설치_상세매뉴얼_10단계.md', 'text/markdown;charset=utf-8');
  }

  /**
   * 3. 환경변수 설정 예시 파일 (.env.example)
   */
  static downloadEnvExample() {
    const envContent = `# =================================================================
# 힐링약국(School Mind Pharmacy) 환경변수 설정 예시 파일 (.env)
# =================================================================
# 이 파일은 Vercel 환경변수 등록 또는 로컬 개발 시 참고용 설정 파일입니다.
# 실제 비밀키를 깃허브 공개 저장소에 직접 커밋하지 마시고,
# Vercel 프로젝트 대시보드의 [Settings] > [Environment Variables]에 입력하세요.

# 1. Google Firebase Console에서 발급받은 웹 앱 설정값
# (Firebase 프로젝트 설정 > 일반 > 내 앱 > 웹앱 SDK 설정 참조)
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIRESTORE_DATABASE_ID=(default)

# 2. AI 추천 및 텍스트 보조 기능용 Gemini API 키 (선택 사항)
# Google AI Studio(https://aistudio.google.com/)에서 무료 발급 가능
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# 3. 배포 웹사이트 도메인 (선택 사항)
APP_URL=https://your-school-pharmacy.vercel.app
`;
    downloadBlob(envContent, '환경변수_설정예시_env.example.txt', 'text/plain;charset=utf-8');
  }

  /**
   * 4. Firebase Firestore 보안 규칙 파일 (firestore.rules)
   */
  static downloadFirestoreRules() {
    const rulesContent = `// =================================================================
// 힐링약국(School Mind Pharmacy) Firestore 보안 규칙 (firestore.rules)
// Firebase Console > Firestore Database > [규칙] 탭에 붙여넣고 [게시]하세요.
// =================================================================

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 학생 명부 컬렉션
    match /students/{studentId} {
      allow read, write: if true;
    }
    
    // 학급 목록 컬렉션
    match /classes/{classId} {
      allow read, write: if true;
    }
    
    // 진료 및 처방전 기록
    match /visits/{visitId} {
      allow read, write: if true;
    }
    
    // 칭찬쿠키 지급 및 사용 내역 장부
    match /cookie_logs/{logId} {
      allow read, write: if true;
    }
    
    // 가챠 뽑기 이력
    match /gacha_logs/{logId} {
      allow read, write: if true;
    }
    
    // 힐링약국 전체 운영 설정
    match /app_settings/{settingId} {
      allow read, write: if true;
    }
    
    // 학생 제안 새로운 마음신호 연구소
    match /new_conditions/{requestId} {
      allow read, write: if true;
    }
    
    // 오늘의 감정 일기 달력
    match /emotion_logs/{logId} {
      allow read, write: if true;
    }
    
    // 시스템 메타 및 버전 관리
    match /system/{docId} {
      allow read, write: if true;
    }
  }
}
`;
    downloadBlob(rulesContent, '힐링약국_파이어베이스_보안규칙_firestore.rules.txt', 'text/plain;charset=utf-8');
  }

  /**
   * 5. 데이터베이스 구조 및 컬렉션 스키마 (firebase-blueprint.json)
   */
  static downloadFirebaseBlueprint() {
    const blueprint = {
      $schema: 'https://firebase.google.com/docs/firestore',
      projectName: 'healing-pharmacy-template',
      version: '2.5.0',
      description: '힐링약국 표준 데이터베이스 스키마 및 컬렉션 구조 정의서 (타 학교 독립 배포용)',
      collections: {
        students: {
          description: '학생 명부 및 쿠키 잔액, 로그인 PIN, SEL 사전/사후평가 결과',
          fields: {
            id: 'string (UUID 또는 고유키)',
            grade: 'number (1~3)',
            classNum: 'number (1~15)',
            number: 'number (1~40)',
            name: 'string (학생 이름)',
            pin: 'string (로그인 4자리 비밀번호, 기본 0000)',
            cookieBalance: 'number (칭찬쿠키 보유 잔액)',
            gachaTickets: 'number (뽑기 티켓 잔액)',
            createdAt: 'ISO8601 string'
          }
        },
        classes: {
          description: '운영 대상 학급 목록',
          fields: {
            id: 'string',
            grade: 'number',
            classNum: 'number',
            teacherName: 'string (담임선생님 성함)',
            active: 'boolean'
          }
        },
        visits: {
          description: '마음신호 진료 처방전 및 5일 실천 미션 기록',
          fields: {
            id: 'string',
            studentId: 'string',
            conditionId: 'string (예: A-06)',
            conditionName: 'string',
            medicineName: 'string',
            prescriptions: 'array of objects (선택한 3가지 실천 행동)',
            missionChecks: 'array of booleans (5일간의 실천 체크)',
            status: 'string (active | completed | rewarded)',
            visitDate: 'YYYY-MM-DD'
          }
        },
        cookie_logs: {
          description: '칭찬쿠키 지급 및 사용 장부 (위변조 방지 기록)',
          fields: {
            id: 'string',
            studentId: 'string',
            amount: 'number (+1, -3 등)',
            balanceAfter: 'number',
            reason: 'string',
            createdAt: 'ISO8601 string'
          }
        },
        app_settings: {
          description: '학교별 맞춤 운영 정책 및 옵션',
          fields: {
            startDate: 'YYYY-MM-DD',
            endDate: 'YYYY-MM-DD',
            allowRepeat: 'boolean',
            repeatCooldownDays: 'number (기본 7일)',
            gachaCookiePrice: 'number (기본 3개)',
            postTestActive: 'boolean'
          }
        }
      }
    };
    downloadBlob(JSON.stringify(blueprint, null, 2), '힐링약국_데이터베이스_설계서_blueprint.json', 'application/json;charset=utf-8');
  }

  /**
   * 6. 운영 시작 전 사전 점검 체크리스트 (.md)
   */
  static downloadPreLaunchChecklist() {
    const checklist = `# 힐링약국 운영 시작 전 교사 점검 체크리스트 (20문항)

학교 현장에서 첫 오픈(오픈 데이) 전에 아래 20개 항목을 점검하시면 100% 원활하고 안전한 운영이 가능합니다.

---

### [Part 1] 시스템 및 계정 점검
- [ ] 1. 웹사이트 배포 주소가 정상적으로 열리는가? (모바일 및 학교 PC 테스트)
- [ ] 2. 교사 관리자 기본 비밀번호(\`1234\`)를 우리 학교 고유 비밀번호로 변경하였는가?
- [ ] 3. 교사 대시보드 로그인 후 테스트 학생(1명)으로 등록이 정상 작동하는가?
- [ ] 4. 테스트 학생으로 로그인하여 마음신호 선택 -> 처방전 발급 -> 미션 완료 흐름을 직접 체험해 보았는가?
- [ ] 5. 파이어베이스 클라우드 동기화 상태가 [초록색 불]로 정상 표시되는가?

### [Part 2] 학생 명단 및 학급 세팅
- [ ] 6. 운영 대상 학년/학급이 교사 대시보드에 모두 등록되어 있는가? (1~3학년 각 반)
- [ ] 7. 각 반 학생 명단이 엑셀로 정확하게 업로드되었는가? (동명이인 번호 확인)
- [ ] 8. 학생 기본 로그인 PIN이 4자리(0000)로 안내 가능한 상태인가?
- [ ] 9. 학생이 비밀번호 분실 시 교사 대시보드에서 1초 만에 초기화하는 방법을 숙지하였는가?

### [Part 3] 교육적 운영 정책 및 보상 준비
- [ ] 10. 힐링약국 운영 기간(시작일 ~ 종료일)이 대시보드 환경설정에 올바르게 설정되었는가?
- [ ] 11. 칭찬쿠키 지급 기준(미션 5일 완료 시 지급량, 일기 작성 보너스 등)을 교원 간 공유하였는가?
- [ ] 12. 가챠(뽑기) 1회당 소모 쿠키(기본 3개)와 실제 실물 보상(간식, 문구, 비타민 등)이 준비되었는가?
- [ ] 13. 실물 약봉투 또는 마음 처방전 종이 인쇄물을 교실/보건실/Wee클래스에 비치할 것인가 결정하였는가?
- [ ] 14. 사전 사회정서 진단평가(SEL 20문항) 설문을 학생 첫 접속 시 필수로 진행할 것인지 결정하였는가?

### [Part 4] 학생 및 학부모 홍보 안내
- [ ] 15. 학생용 접속 QR코드가 포함된 포스터 또는 안내문을 교실 게시판에 부착하였는가?
- [ ] 16. "힐링약국은 실제 질병 진단이 아니라 일상적 마음 습관을 성찰하는 교육 프로젝트"라는 취지를 학생들에게 명확히 안내하였는가?
- [ ] 17. 학생들에게 친구의 번호로 대리 로그인하지 않도록 비밀번호 보안 수칙을 안내하였는가?
- [ ] 18. 담임선생님들께 학급 조회 시간 5분 설명 가이드를 메신저로 전달하였는가?

### [Part 5] 데이터 안전 및 백업 계획
- [ ] 19. 주 1회 교사 대시보드에서 [JSON 데이터 백업]을 교무수첩/외장하드에 저장할 담당자를 지정하였는가?
- [ ] 20. 위기 학생(심한 우울, 불안 신호 반복 호소) 발견 시 Wee클래스 상담교사와 연계할 내부 절차가 수립되었는가?

---
체크 완료 일자: 202  년    월    일
점검 교사 성명:              (인)
`;
    downloadBlob(checklist, '힐링약국_운영전_점검체크리스트_20항목.md', 'text/markdown;charset=utf-8');
  }

  /**
   * 7. 학생 및 학부모용 안내문 / 가정통신문 예시문 (.md)
   */
  static downloadStudentFamilyNotice() {
    const notice = `# [가정통신문 및 학생 안내문 예시] 우리 학교 마음 처방 프로젝트 '힐링약국' 안내

학부모님 안녕하십니까?  
학생들의 건강한 사회정서적 성장과 자기 성찰 습관 형성을 돕기 위해, 우리 학교에서는 전교생 마음건강 프로젝트 **‘힐링약국’**을 운영합니다.

---

### 💊 1. '힐링약국'이란 무엇인가요?
학생들이 일상에서 겪는 시험 불안, 친구 관계, 무기력, 미루는 습관 등 마음의 신호를 알아차리고, 스스로 실천할 수 있는 작은 맞춤형 행동 처방을 일주일간 실천하며 성장해 나가는 **사회정서학습(SEL) 기반 교육용 웹앱**입니다.

* **교육 목적:** 마음 상태 객관화, 자기조절력 향상, 긍정적 행동 습관 형성
* **유의 사항:** 본 프로그램의 마음신호는 교육적 비유(메타포)이며, **실제 의학적 질병 진단이나 의료 행위가 아닙니다.**

---

### 📱 2. 학생 이용 흐름
1. **마음신호 탐색:** 8가지 영역(학습, 관계, 미래, 감정 등) 질문을 체크하고 나의 마음신호(예: 계획만거창해증)를 찾습니다.
2. **맞춤 행동 처방전 받기:** 나에게 꼭 필요한 3가지 일상 실천 미션이 담긴 처방전을 발급받습니다.
3. **5일간 꾸준히 실천 & 기록:** 매일 학교와 가정에서 미션을 실천하고 웹앱에 체크합니다.
4. **칭찬쿠키와 가챠 보상:** 일주일간 꾸준히 실천하면 '칭찬쿠키'가 지급되며, 캡슐 뽑기(가챠)와 스티커를 모을 수 있습니다!

---

### 🔑 3. 접속 및 로그인 안내
- **접속 주소:** [학교 전용 웹사이트 링크 입력] (스마트폰, 태블릿, PC 모두 접속 가능)
- **로그인 방법:** 학년, 반, 번호 선택 ➔ 이름 입력 ➔ **초기 비밀번호 \`0000\`** 입력
- **개인정보 보호:** 학생 명단은 외부에 노출되지 않으며, 첫 로그인 후 [마이페이지]에서 나만의 4자리 비밀번호로 변경할 수 있습니다.

학생들이 자신의 마음을 따뜻하게 돌보고 건강한 생활 습관을 기를 수 있도록 가정에서도 많은 관심과 격려를 부탁드립니다.

202  년    월    일

**○ ○ 중 학 교 장**
`;
    downloadBlob(notice, '힐링약국_학생_학부모_가정통신문_예시.md', 'text/markdown;charset=utf-8');
  }

  /**
   * 8. 초기 138개 가상 마음신호 및 기본 데이터 스타터 팩 (.json)
   * 원본 학교의 학생 데이터는 전혀 없이, 138개 마음신호와 카테고리만 순수하게 담긴 파일
   */
  static downloadStarterDataPack() {
    const starterPack = {
      meta: {
        title: '힐링약국 스타터 팩',
        version: '2.5.0',
        exportedAt: new Date().toISOString(),
        containsPrivateData: false,
        note: '이 파일은 순수한 138개 가상 마음신호 카테고리 및 기본 설정값만 포함하며 개인정보는 0%입니다.'
      },
      categories: CATEGORIES,
      conditions: VIRTUAL_CONDITIONS,
      defaultClasses: INITIAL_CLASSES,
      defaultSettings: DEFAULT_SETTINGS
    };
    downloadBlob(JSON.stringify(starterPack, null, 2), '힐링약국_초기데이터_스타터팩_138개마음신호.json', 'application/json;charset=utf-8');
  }

  /**
   * 9. 구글 스프레드시트 단독 배포용 스크립트 코드 번들 (.txt)
   */
  static downloadGoogleAppsScriptBundle() {
    const backendCode = generateGoogleAppsScript();
    const frontendCode = generateGasIndexHtml();

    const bundleContent = `/* =================================================================
   [힐링약국] 구글 스프레드시트 단독형 (Google Apps Script) 배포 번들
   이 번들은 Vercel이나 Firebase 없이, 학교 구글 드라이브 스프레드시트 하나만으로
   힐링약국을 100% 무료 단독 운영할 수 있도록 제작된 원클릭 코드입니다.
   ================================================================= */

// ==========================================
// [파일 1 / 2] Code.gs 에 붙여넣을 백엔드 코드
// Apps Script 편집기의 Code.gs 파일 내용을 모두 지우고 아래를 붙여넣으세요.
// 그 후 상단 함수 선택창에서 setupHealingPharmacy()를 선택하고 [실행]을 1회 누르세요.
// ==========================================

${backendCode}


// ==========================================
// [파일 2 / 2] Index.html 에 붙여넣을 프론트엔드 코드
// Apps Script 편집기 좌측 [+] 파일 추가 > [HTML] 선택 > 파일명을 Index 로 입력
// 생성된 Index.html 파일에 아래 전체 내용을 붙여넣으세요.
// 그 후 우측 상단 [배포] > [새 배포] > 유형: 웹 앱 > 액세스: 모든 사용자 선택 후 배포!
// ==========================================

${frontendCode}
`;
    downloadBlob(bundleContent, '힐링약국_구글스프레드시트_단독배포용_AppsScript_번들.txt', 'text/plain;charset=utf-8');
  }
}
