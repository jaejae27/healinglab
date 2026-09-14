# 💊 힐링약국 (Healing Pharmacy) - Google Apps Script 배포 가이드

본 프로젝트는 **Google 스프레드시트(22개 시트 데이터베이스)**와 **Google Apps Script(Web App)**를 기반으로 동작하는 중학생 사회정서교육 웹 애플리케이션입니다.

---

## 🚀 3분 완성! Google Apps Script 배포 방법

### 1단계: Google 스프레드시트 생성
1. [Google Drive](https://drive.google.com)에서 **새 Google 스프레드시트**를 만듭니다.
2. 스프레드시트 제목을 `[힐링약국] 사회정서 실천 데이터베이스`로 지정합니다.

### 2단계: Apps Script 편집기 열기
1. 스프레드시트 상단 메뉴에서 **확장 프로그램** > **Apps Script**를 클릭합니다.
2. 프로젝트 제목을 `힐링약국 웹앱`으로 변경합니다.

### 3단계: 파일 복사 및 붙여넣기
1. **`Code.gs`** 파일:
   - 기본으로 생성된 `Code.gs` 내용을 지우고, 이 폴더의 `Code.gs` 내용을 전체 복사하여 붙여넣습니다.
2. **`Index.html`** 파일:
   - 왼쪽의 파일 목록 옆 `+` (파일 추가) 버튼을 누르고 **HTML**을 선택합니다.
   - 파일 이름을 `Index`로 지정합니다 (`.html`은 자동 입력됨).
   - 이 폴더의 `Index.html` 내용을 전체 복사하여 붙여넣습니다.
3. **`appsscript.json`** 설정 (선택):
   - 좌측 톱니바퀴(프로젝트 설정) > `편집기에 "appsscript.json" 매니페스트 파일 표시` 체크
   - `appsscript.json`에 `timeZone: "Asia/Seoul"`, `access: "ANYONE"` 설정을 확인합니다.
4. 상단의 **디스크 아이콘(저장)**을 클릭합니다.

### 4단계: 초기 데이터베이스 구축 (1회 실행)
1. 상단 함수 선택 드롭다운에서 `setupHealingPharmacy`를 선택하고 **[실행]**을 누릅니다.
2. 최초 실행 시 **권한 승인** 팝업이 뜹니다:
   - [권한 검토] 클릭 -> 구글 계정 선택 -> [고급] 클릭 -> [힐링약국 웹앱(으)로 이동(안전하지 않음)] 클릭 -> [허용] 클릭
3. 실행 완료 후 스프레드시트를 확인하면 **22개의 시트(SETTINGS, STUDENTS, CONDITIONS 등)**가 완벽하게 생성되고 스타일이 자동 적용됩니다!
4. 상단 함수 선택 드롭다운에서 `seedMasterData`를 선택하고 **[실행]**을 누르면 108개의 가상증상 및 미션, 포춘쿠키, 고민가챠 마스터데이터가 주입됩니다.
5. (또는 스프레드시트 새로고침 후 나타나는 상단 커스텀 메뉴 `💊 힐링약국`에서 클릭 한 번으로 실행할 수 있습니다.)

### 5단계: 웹앱으로 배포하기
1. 우측 상단의 **[배포]** > **[새 배포]**를 클릭합니다.
2. 유형 선택 톱니바퀴 > **[웹 앱]**을 선택합니다.
3. 설정 입력:
   - **설명**: `힐링약국 v1.0`
   - **다음 사용자로 실행**: `나(내 계정)`
   - **액세스 권한이 있는 사용자**: `모든 사용자(Anyone)` (학생들이 별도 로그인 없이 접속하기 위해 필수)
4. **[배포]** 버튼을 클릭합니다.
5. 발급된 **웹 앱 URL** (`https://script.google.com/macros/s/.../exec`)을 복사하여 학생들에게 QR코드나 링크로 배포하세요!

---

## 🗂️ 22개 시트 구조 요약

| 구분 | 시트명 | 설명 |
|------|--------|------|
| **설정/운영** | `SETTINGS`, `CLASSES`, `STUDENTS` | 운영 일자, 학급 목록, 학생 명렬표 및 칭찬쿠키 잔액 |
| **마스터데이터** | `CATEGORIES`, `CONDITIONS`, `CHECK_ITEMS`, `CONDITION_MATCH`, `MISSIONS`, `FORTUNES`, `WORRY_GACHA` | 8개 영역, 108개 가상증상, 체크리스트, 미션 6종, 포춘, 고민가챠 |
| **활동 기록** | `VISITS`, `VISIT_CONDITIONS`, `VISIT_MISSIONS`, `MISSION_RESULTS` | 마음 진료 기록, 증상 매칭, 3대 미션 실천 및 별점 평가/소감 |
| **보상/피드백** | `REWARDS`, `COOKIE_LOG`, `GACHA_LOG`, `FORTUNE_LOG`, `WORRY_CHALLENGES` | 처방약 수령, 칭찬쿠키 지급/차감 내역, 가챠 당첨 보관함 |
| **확장/연계** | `NEW_CONDITION_REQUESTS`, `REPORT_LOG`, `STUDENT_RECORD_SENTENCES` | 학생 신약 제안, 리포트 발행, 생활기록부 AI 추천 문장 |

---

## 💡 기술 스택 & 특징
- **Server**: Google Apps Script V8 (LockService 기반 동시성 제어, doGet/doPost REST API 및 HtmlService 호스팅)
- **Database**: Google Spreadsheet (22 Relational Normalized Sheets)
- **Frontend**: Single-File Mobile-First Web Application (Tailwind CSS, Google Fonts, Lucide Icons, Healy Character SVG Animation)
- **Dual Support**: GAS Web App 환경에서 구글 시트와 실시간 연동되며, 오프라인 및 로컬 브라우저 환경에서도 자동 Mock 모드로 원활하게 동작합니다.
