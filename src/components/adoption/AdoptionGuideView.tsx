import React, { useState, useEffect } from 'react';
import { HealyCharacter } from '../character/HealyCharacter';
import { DownloadPackageService } from '../../services/downloadPackageService';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  BookOpen,
  HelpCircle,
  FolderDown,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  Check,
  School,
  Heart,
  Gift,
  FileSpreadsheet,
  FileCode,
  FileText
} from 'lucide-react';

interface AdoptionGuideViewProps {
  onBack: () => void;
}

const STORAGE_KEY_PROGRESS = 'healing_pharmacy_adoption_progress';

export const AdoptionGuideView: React.FC<AdoptionGuideViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'downloads' | 'school_cases' | 'faq'>('steps');
  const [expandedSteps, setExpandedSteps] = useState<{ [key: number]: boolean }>({ 1: true });
  const [completedSteps, setCompletedSteps] = useState<{ [key: number]: boolean }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(completedSteps));
    } catch {
      // ignore
    }
  }, [completedSteps]);

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  };

  const toggleComplete = (stepNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedSteps((prev) => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 10) * 100);

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#333333] flex flex-col font-sans">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-100/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-jua transition-colors border border-amber-200/80 cursor-pointer"
              title="로그인 화면으로 돌아가기"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">힐링약국 처음 화면으로</span>
              <span className="sm:hidden">돌아가기</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💊</span>
                <h1 className="font-jua text-base sm:text-lg text-amber-950 tracking-tight">
                  우리 학교 힐링약국 만들기
                </h1>
                <span className="hidden md:inline text-[11px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-200">
                  선생님 독립 도입 가이드
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                백운호수중학교 사회정서교육(SEL) 실천 웹앱 독립 설치 매뉴얼
              </p>
            </div>
          </div>

          {/* Quick Progress indicator */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">설치 진행률</span>
              <span className="text-xs font-jua text-indigo-700 font-bold">
                {completedCount} / 10 단계 ({progressPercent}%)
              </span>
            </div>
            <div className="w-16 sm:w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Intro Hero Card */}
        <section className="bg-gradient-to-br from-amber-50/90 via-rose-50/40 to-pink-50/60 rounded-3xl border-2 border-amber-100/90 p-5 sm:p-7 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-6 relative z-10">
            <div className="shrink-0 flex flex-col items-center">
              <HealyCharacter
                emotion="proud"
                size="md"
                dialogue="선생님, 환영해요!<br>우리 학교 아이들만을 위한<br>따뜻한 힐링약국을 열어보세요."
                subDialogue="코딩 경험이 없어도 1단계부터 따라 하시면 완성돼요 ✨"
              />
            </div>

            <div className="space-y-3.5 text-left flex-1">
              <div className="inline-flex items-center gap-1.5 bg-amber-100/90 text-amber-900 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-300/60">
                <School className="w-3.5 h-3.5 text-amber-700" />
                <span>백운호수중학교 운영 검증 모델</span>
              </div>

              <h2 className="font-jua text-xl sm:text-2xl text-slate-900 leading-snug">
                “힐링약국은 백운호수중학교에서 활용한 사회정서교육 실천 웹앱입니다.”
              </h2>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed break-keep">
                학생이 자신의 마음신호를 알아차리고 작은 행동을 꾸준히 실천하도록 돕습니다.  
                다른 학교에서도 학교 상황에 맞게 <strong>백운호수중학교의 운영 데이터와 연결되지 않는 100% 독립된 사본</strong>을 만들어 무료로 운영할 수 있도록 설치 과정 전체를 친절하게 안내합니다.
              </p>

              {/* Student Cycle Visual */}
              <div className="bg-white/90 rounded-2xl p-3 sm:p-4 border border-amber-200/60 shadow-xs">
                <span className="text-[11px] font-bold text-amber-900 block mb-2">
                  🔄 학생들의 일주일 힐링약국 이용 흐름:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-jua">
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
                    <span className="block text-sm mb-0.5">🔍</span>
                    <span>1. 마음신호 탐색</span>
                    <span className="block text-[10px] text-amber-700 font-sans mt-0.5 font-normal">8개 영역 자가체크</span>
                  </div>
                  <div className="p-2 bg-rose-50 rounded-xl border border-rose-200 text-rose-950">
                    <span className="block text-sm mb-0.5">💊</span>
                    <span>2. 행동 처방 선택</span>
                    <span className="block text-[10px] text-rose-700 font-sans mt-0.5 font-normal">나만의 실천 3가지</span>
                  </div>
                  <div className="p-2 bg-teal-50 rounded-xl border border-teal-950 text-teal-950">
                    <span className="block text-sm mb-0.5">📅</span>
                    <span>3. 5일 실천·기록</span>
                    <span className="block text-[10px] text-teal-700 font-sans mt-0.5 font-normal">일상 속 습관 형성</span>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-950">
                    <span className="block text-sm mb-0.5">🌱</span>
                    <span>4. 성찰과 성장</span>
                    <span className="block text-[10px] text-indigo-700 font-sans mt-0.5 font-normal">마음 일기와 뱃지</span>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-xl border border-purple-200 text-purple-950 col-span-2 sm:col-span-1">
                    <span className="block text-sm mb-0.5">🎁</span>
                    <span>5. 칭찬쿠키 & 가챠</span>
                    <span className="block text-[10px] text-purple-700 font-sans mt-0.5 font-normal">캡슐 뽑기와 보상</span>
                  </div>
                </div>
              </div>

              {/* Physical pop-up notice */}
              <div className="flex items-start gap-2 bg-white/70 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>💡 학교별 선택 운영 예시:</strong> 웹앱뿐만 아니라 <strong>실물 약봉투, 입학 웰컴키트, 교실/Wee클래스 팝업 약국 부스</strong> 등은 학교별 교육과정과 계절에 맞추어 자유롭게 선택하여 병행 운영할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('steps')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-jua transition-all cursor-pointer ${
              activeTab === 'steps'
                ? 'bg-amber-400 text-amber-950 shadow-md font-bold'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>10단계 단계별 설치 안내</span>
            <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {completedCount}/10
            </span>
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-jua transition-all cursor-pointer ${
              activeTab === 'downloads'
                ? 'bg-amber-400 text-amber-950 shadow-md font-bold'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <FolderDown className="w-4 h-4" />
            <span>설치 자료 다운로드 센터</span>
            <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              8종 전량 제공
            </span>
          </button>

          <button
            onClick={() => setActiveTab('school_cases')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-jua transition-all cursor-pointer ${
              activeTab === 'school_cases'
                ? 'bg-amber-400 text-amber-950 shadow-md font-bold'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>백운호수중 운영 노하우 & 실물 키트</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-jua transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-amber-400 text-amber-950 shadow-md font-bold'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>자주 묻는 질문 (FAQ)</span>
          </button>
        </div>

        {/* TAB 1: 10 STEPS GUIDE */}
        {activeTab === 'steps' && (
          <section className="space-y-4">
            <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/70 flex items-center justify-between text-xs text-amber-950">
              <span className="font-bold flex items-center gap-1.5">
                <span>📍</span>
                <span>초보 선생님도 클릭만으로 따라 하실 수 있도록 권장 표준 경로(GitHub + Vercel + Firebase)로 작성되었습니다.</span>
              </span>
              <button
                onClick={() => {
                  const allOpen = Object.keys(expandedSteps).length === 10;
                  const next: { [key: number]: boolean } = {};
                  for (let i = 1; i <= 10; i++) next[i] = !allOpen;
                  setExpandedSteps(next);
                }}
                className="text-[11px] text-amber-800 underline font-bold hover:text-amber-950 cursor-pointer"
              >
                {Object.keys(expandedSteps).length === 10 ? '모두 접기' : '모두 펼치기'}
              </button>
            </div>

            {/* Step 1 */}
            <StepCard
              step={1}
              title="준비물과 필요한 계정 확인 (모두 0원/무료)"
              isExpanded={!!expandedSteps[1]}
              isCompleted={!!completedSteps[1]}
              onToggle={() => toggleStep(1)}
              onToggleComplete={(e) => toggleComplete(1, e)}
            >
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <p className="leading-relaxed">
                  <strong>왜 필요한가요?</strong> 웹사이트를 호스팅(인터넷에 띄우기)하고, 학생들의 활동 기록을 안전하게 저장할 클라우드 데이터베이스를 모두 <strong>무료</strong>로 마련하기 위함입니다. 신용카드 등록이 전혀 필요하지 않습니다.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block flex items-center gap-1">
                      <span>1️⃣</span> Google 계정
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Firebase 데이터베이스 생성용. 학교 구글 계정 또는 개인 구글 계정 모두 사용 가능합니다.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block flex items-center gap-1">
                      <span>2️⃣</span> GitHub 계정
                    </span>
                    <p className="text-[11px] text-slate-500">
                      소스코드를 내 계정으로 사본(Fork)하여 보관하고 Vercel에 자동 배포하는 데 사용합니다.
                    </p>
                    <a
                      href="https://github.com/signup"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 font-bold hover:underline"
                    >
                      <span>GitHub 무료 가입</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block flex items-center gap-1">
                      <span>3️⃣</span> Vercel 계정
                    </span>
                    <p className="text-[11px] text-slate-500">
                      웹사이트를 무료로 24시간 호스팅해 주는 서비스입니다. GitHub 계정으로 1초 만에 연동 가입됩니다.
                    </p>
                    <a
                      href="https://vercel.com/signup"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 font-bold hover:underline"
                    >
                      <span>Vercel 가입하기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>확인:</strong> Google 계정과 GitHub 계정이 준비되었다면 1단계 완료!</span>
                </div>
              </div>
            </StepCard>

            {/* Step 2 */}
            <StepCard
              step={2}
              title="설치용 파일 다운로드 및 프로젝트 사본 만들기"
              isExpanded={!!expandedSteps[2]}
              isCompleted={!!completedSteps[2]}
              onToggle={() => toggleStep(2)}
              onToggleComplete={(e) => toggleComplete(2, e)}
            >
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <p className="leading-relaxed">
                  <strong>왜 필요한가요?</strong> 백운호수중학교 원본 저장소와 연결을 분리하고, 선생님 학교만의 독립된 코드 저장소를 만들기 위함입니다.
                </p>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 block">따라 하기:</span>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 leading-relaxed">
                    <li>공유받은 힐링약국 GitHub 저장소 페이지로 이동합니다.</li>
                    <li>화면 우측 상단의 <strong>[Fork]</strong> 버튼을 누릅니다.</li>
                    <li>저장소 이름(Repository name)에 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">my-school-mind-pharmacy</code>와 같이 우리 학교 이름을 입력하고 <strong>[Create fork]</strong>를 클릭합니다.</li>
                  </ol>
                </div>
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                  💡 <strong>코드 다운로드만 원하시나요?</strong> 상단 <strong>[설치 자료 다운로드 센터]</strong> 탭에서 스타터팩 및 설정 예시 파일을 바로 다운로드하실 수 있습니다.
                </div>
              </div>
            </StepCard>

            {/* Step 3 */}
            <StepCard
              step={3}
              title="우리 학교 전용 무료 데이터베이스(Firebase) 만들기"
              isExpanded={!!expandedSteps[3]}
              isCompleted={!!completedSteps[3]}
              onToggle={() => toggleStep(3)}
              onToggleComplete={(e) => toggleComplete(3, e)}
            >
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <p className="leading-relaxed">
                  <strong>왜 필요한가요?</strong> 다른 학교와 학생 명단이나 처방전이 섞이지 않도록, <strong>우리 학교만의 완전 독립된 데이터베이스</strong>를 구축하는 핵심 단계입니다.
                </p>

                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">어디로 가나요?</span>
                    <a
                      href="https://console.firebase.google.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:underline"
                    >
                      <span>Firebase Console 바로가기</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
                    <li>Firebase Console에서 <strong>[프로젝트 추가]</strong>를 누르고 프로젝트 이름(예: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">baegun-mind-pharmacy</code>)을 입력합니다. (Google 애널리틱스는 미사용 체크 후 계속)</li>
                    <li>프로젝트 생성 후 좌측 메뉴에서 <strong>[빌드] ➔ [Firestore Database]</strong>를 누르고 <strong>[데이터베이스 만들기]</strong>를 클릭합니다.</li>
                    <li>위치(Region)는 <strong>\`asia-northeast3 (서울)\`</strong>을 선택합니다. (국내 학교 접속 속도가 가장 빠릅니다)</li>
                    <li>보안 규칙 시작 모드는 <strong>[테스트 모드에서 시작]</strong>을 선택하고 완료합니다.</li>
                    <li>상단 <strong>[규칙]</strong> 탭으로 이동하여 기존 내용을 모두 지우고, 아래의 안전 보안 규칙을 붙여넣은 뒤 <strong>[게시]</strong>를 누릅니다:</li>
                  </ol>

                  <div className="relative">
                    <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-36">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                    </pre>
                    <button
                      onClick={() => handleCopy(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`, 'rules')}
                      className="absolute right-2 top-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-jua flex items-center gap-1"
                    >
                      {copiedSnippet === 'rules' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSnippet === 'rules' ? '복사됨' : '규칙 복사'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1.5 text-xs text-indigo-950">
                  <span className="font-bold block">🔑 웹 앱 키값 복사하기 (중요):</span>
                  <p>
                    Firebase 좌측 상단 톱니바퀴 <strong>[프로젝트 설정] ➔ [일반]</strong> ➔ 하단 <strong>[내 앱]에서 웹 아이콘 (&lt;/&gt;)</strong> 클릭 ➔ 앱 닉네임 입력 후 등록 ➔ 화면에 나오는 <code className="bg-indigo-100 font-bold px-1 rounded">firebaseConfig</code>의 6개 키값을 복사해 메모장에 적어두세요!
                  </p>
                </div>
              </div>
            </StepCard>

            {/* Step 4 */}
            <StepCard
              step={4}
              title="프로젝트와 데이터베이스 연결하기 (Vercel 환경변수)"
              isExpanded={!!expandedSteps[4]}
              isCompleted={!!completedSteps[4]}
              onToggle={() => toggleStep(4)}
              onToggleComplete={(e) => toggleComplete(4, e)}
            >
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <p className="leading-relaxed">
                  <strong>왜 필요한가요?</strong> 코드가 3단계에서 만든 우리 학교 전용 데이터베이스를 찾아갈 수 있도록 연결 주소(환경변수)를 입력하는 단계입니다.
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">어디로 가나요?</span>
                    <a
                      href="https://vercel.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:underline"
                    >
                      <span>Vercel Dashboard 바로가기</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
                    <li>Vercel 로그인 후 <strong>[Add New...] ➔ [Project]</strong>를 누르고, 2단계에서 Fork한 저장소 옆의 <strong>[Import]</strong>를 클릭합니다.</li>
                    <li>화면 중앙의 <strong>[Environment Variables (환경변수)]</strong>를 펼칩니다.</li>
                    <li>3단계에서 복사한 키값을 아래 6개 항목 이름으로 각각 입력하고 <strong>[Add]</strong>를 누릅니다:</li>
                  </ol>

                  <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px]">
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span className="text-indigo-700 font-bold">VITE_FIREBASE_API_KEY</span>
                      <span className="text-slate-400">Firebase apiKey</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span className="text-indigo-700 font-bold">VITE_FIREBASE_AUTH_DOMAIN</span>
                      <span className="text-slate-400">Firebase authDomain</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span className="text-indigo-700 font-bold">VITE_FIREBASE_PROJECT_ID</span>
                      <span className="text-slate-400">Firebase projectId</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span className="text-indigo-700 font-bold">VITE_FIREBASE_STORAGE_BUCKET</span>
                      <span className="text-slate-400">Firebase storageBucket</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span className="text-indigo-700 font-bold">VITE_FIREBASE_MESSAGING_SENDER_ID</span>
                      <span className="text-slate-400">Firebase messagingSenderId</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-indigo-700 font-bold">VITE_FIREBASE_APP_ID</span>
                      <span className="text-slate-400">Firebase appId</span>
                    </div>
                  </div>

                  <p className="pt-1">
                    4. 환경변수를 다 넣은 후 맨 아래 파란색 <strong>[Deploy]</strong> 버튼을 누르면 1분 뒤 배포가 완료됩니다!
                  </p>
                </div>
              </div>
            </StepCard>

            {/* Step 5 */}
            <StepCard
              step={5}
              title="학교명·학년·반·운영 설정 변경하기"
              isExpanded={!!expandedSteps[5]}
              isCompleted={!!completedSteps[5]}
              onToggle={() => toggleStep(5)}
              onToggleComplete={(e) => toggleComplete(5, e)}
            >
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <p className="leading-relaxed">
                  <strong>왜 필요한가요?</strong> 배포된 웹사이트에서 백운호수중학교 기본 설정을 지우고 우리 학교의 학급 수(예: 1~3학년 각 6개 반)와 운영 기간을 맞추기 위함입니다.
                </p>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                    <li>배포된 내 웹사이트에 접속하여 우측 상단 <strong>[선생님 관리자 모드]</strong> 버튼을 누릅니다.</li>
                    <li>기본 비밀번호 <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-indigo-700">1234</code>를 입력하고 들어갑니다.</li>
                    <li><strong>[환경설정]</strong> 탭을 클릭하여:
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-slate-600">
                        <li><strong>운영 시작일 / 종료일</strong>: 우리 학교 프로젝트 기간(예: 4주)으로 변경</li>
                        <li><strong>가챠 쿠키 가격</strong>: 1회당 소모할 칭찬쿠키 개수(기본 3개)</li>
                        <li><strong>동일 마음신호 재방문 쿨다운</strong>: 일주일(7일) 권장</li>
                      </ul>
                    </li>
                    <li><strong>[학생 관리]</strong> 탭에서 우리 학교에 맞는 학년/반을 확인합니다.</li>
                  </ol>
                </div>
              </div>
            </StepCard>

            {/* Step 6 */}
            <StepCard
              step={6}
              title="교사 관리자 비밀번호 변경 및 학생 로그인 PIN 규칙 확인"
              isExpanded={!!expandedSteps[6]}
              isCompleted={!!completedSteps[6]}
              onToggle={() => toggleStep(6)}
              onToggleComplete={(e) => toggleComplete(6, e)}
            >
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 text-xs flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">보안 필수 조치:</span>
                    <p className="mt-0.5">
                      초기 관리자 비밀번호 <code className="bg-rose-200 px-1 rounded font-mono font-bold">1234</code>는 다른 사람에게도 알려져 있으므로, <strong>설치 즉시 대시보드 우측 상단 [비밀번호 변경] 버튼</strong>을 눌러 4자리 이상의 선생님만의 비밀번호로 변경하세요.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-slate-900 block">학생 로그인 PIN 규칙:</span>
                  <p className="text-slate-600 leading-relaxed">
                    • 엑셀로 명단을 등록하면 학생들의 초기 비밀번호는 모두 <code className="bg-slate-200 px-1 rounded font-bold">0000</code>으로 자동 세팅됩니다.<br />
                    • 학생이 로그인 후 마이페이지에서 자기만의 4자리 비밀번호로 바꿀 수 있습니다.<br />
                    • 학생이 비밀번호를 잊어버린 경우, 교사 대시보드 [학생 관리] 탭에서 해당 학생의 [0000으로 초기화] 버튼을 눌러주시면 즉시 해결됩니다.
                  </p>
                </div>
              </div>
            </StepCard>

            {/* Step 7 */}
            <StepCard
              step={7}
              title="가상 테스트 학생으로 전체 흐름 직접 확인하기 (5분 소요)"
              isExpanded={!!expandedSteps[7]}
              isCompleted={!!completedSteps[7]}
              onToggle={() => toggleStep(7)}
              onToggleComplete={(e) => toggleComplete(7, e)}
            >
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <p className="leading-relaxed">
                  학생들에게 공개하기 전, 선생님께서 직접 학생 모드로 들어가 1회 체험해 보시면 오류 없이 안심하고 오픈할 수 있습니다.
                </p>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block">테스트 점검 리스트:</span>
                  <p>1. [학생 화면으로 돌아가기] 클릭 ➔ 1학년 1반 1번 (김민준) 선택 ➔ PIN <code className="font-mono bg-slate-200 px-1 rounded">0000</code> 입력하고 로그인</p>
                  <p>2. [마음신호 찾기] 질문 체크 ➔ 추천된 마음 처방전 선택</p>
                  <p>3. 3가지 맞춤 행동 처방 중 마음에 드는 것 선택 ➔ 처방전 발급 확인</p>
                  <p>4. [5일 실천 미션] 1일차 체크해보기 ➔ 쿠키 적립 확인</p>
                  <p>5. [가챠(뽑기)] 탭에서 캡슐을 뽑아 스티커북에 보관되는지 확인</p>
                </div>
              </div>
            </StepCard>

            {/* Step 8 */}
            <StepCard
              step={8}
              title="우리 학교 전용 주소로 배포 및 접속용 QR코드 만들기"
              isExpanded={!!expandedSteps[8]}
              isCompleted={!!completedSteps[8]}
              onToggle={() => toggleStep(8)}
              onToggleComplete={(e) => toggleComplete(8, e)}
            >
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <p className="leading-relaxed">
                  Vercel에서 배포된 고유 주소(예: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-indigo-700">https://우리학교-mind.vercel.app</code>)를 학생들이 스마트폰이나 교실 태블릿으로 쉽게 들어올 수 있도록 안내물을 제작합니다.
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <span className="font-bold text-slate-900 block">QR코드 제작 팁:</span>
                  <p className="text-slate-600">
                    네이버 QR코드(<a href="https://qr.naver.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">qr.naver.com</a>) 또는 Canva에서 무료로 QR코드를 생성하여 교실 안내 포스터나 알림장에 넣으시면 학생들이 카메라로 스캔하여 바로 접속합니다.
                  </p>
                </div>
              </div>
            </StepCard>

            {/* Step 9 */}
            <StepCard
              step={9}
              title="학생 명단 엑셀 등록 및 학생 접속 안내문 배부"
              isExpanded={!!expandedSteps[9]}
              isCompleted={!!completedSteps[9]}
              onToggle={() => toggleStep(9)}
              onToggleComplete={(e) => toggleComplete(9, e)}
            >
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <p className="leading-relaxed">
                  <strong>왜 필요한가요?</strong> 전교생을 일일이 수동 등록할 필요 없이, 나이스(NEIS) 출석부의 [번호]와 [이름]을 복사해 엑셀로 한 번에 등록하기 위함입니다.
                </p>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-900 block">10초 엑셀 등록 방법:</span>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700">
                    <li>하단 다운로드 센터에서 <strong>[학생 명단 등록 엑셀 양식]</strong>을 다운로드합니다.</li>
                    <li>[번호]와 [이름] 열에 학생 정보를 넣고 저장합니다.</li>
                    <li>교사 대시보드 ➔ <strong>[학생 관리]</strong> ➔ 등록할 학년/반 선택 ➔ <strong>[엑셀로 명단 일괄 등록]</strong>을 누르고 파일을 선택하면 끝!</li>
                  </ol>
                </div>
                <button
                  onClick={() => DownloadPackageService.downloadStudentRosterTemplate()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-jua flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>학생 명단 등록 엑셀 양식 다운로드 (.xlsx)</span>
                </button>
              </div>
            </StepCard>

            {/* Step 10 */}
            <StepCard
              step={10}
              title="운영 중 정기 백업 및 학기 종료 후 기록 정리하기"
              isExpanded={!!expandedSteps[10]}
              isCompleted={!!completedSteps[10]}
              onToggle={() => toggleStep(10)}
              onToggleComplete={(e) => toggleComplete(10, e)}
            >
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <p className="leading-relaxed">
                  <strong>백업 관리:</strong> 교사 대시보드 ➔ <strong>[데이터 관리]</strong> 탭에서 언제든 <strong>[전체 데이터 백업 파일 다운로드(JSON)]</strong>를 누르면 전체 처방 기록과 쿠키 장부가 파일 하나로 저장됩니다. 주 1회 정기 백업을 권장합니다.
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
                  <span className="font-bold block">새 학년도 준비 (초기화):</span>
                  <p className="leading-relaxed">
                    다음 학년도가 시작될 때는 교사 대시보드 ➔ <strong>[환경설정] ➔ [데이터 초기화]</strong>에서 <strong>[전체 초기화 (명단까지 삭제)]</strong>를 누르시면 모든 학생 데이터가 삭제되고 깨끗한 새 학기 상태로 리셋됩니다. (초기화 직전 시스템이 긴급 자동 복원 스냅샷을 만들어두므로 실수로 누르셔도 복원 가능합니다)
                  </p>
                </div>
              </div>
            </StepCard>
          </section>
        )}

        {/* TAB 2: DOWNLOAD CENTER */}
        {activeTab === 'downloads' && (
          <section className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-jua text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <FolderDown className="w-5 h-5 text-indigo-600" />
                <span>설치 및 운영 필수 자료 다운로드 센터</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                다른 학교에서 독립적으로 설치하고 운영하는 데 필요한 <strong>8가지 실제 파일</strong>을 준비했습니다. 클릭하시면 브라우저에서 즉시 파일이 다운로드됩니다. (백운호수중학교의 실제 학생 개인정보는 0%이며 순수 서식과 템플릿만 제공됩니다)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Item 1 */}
              <DownloadCard
                icon={<FileSpreadsheet className="w-5 h-5 text-emerald-600" />}
                title="1. 학생 명단 등록 엑셀 양식"
                filename="힐링약국_학생명단_등록양식_샘플.xlsx"
                badge="필수 서식"
                stage="9단계에서 사용"
                desc="번호, 이름 열과 작성 가이드가 포함된 SheetJS 정규 엑셀 서식 파일"
                onDownload={() => DownloadPackageService.downloadStudentRosterTemplate()}
              />

              {/* Item 2 */}
              <DownloadCard
                icon={<FileText className="w-5 h-5 text-indigo-600" />}
                title="2. 초보자용 10단계 상세 설치 설명서"
                filename="힐링약국_독립설치_상세매뉴얼_10단계.md"
                badge="필독 가이드"
                stage="전체 단계용"
                desc="계정 준비부터 Vercel 배포, 환경변수 등록, 운영 백업까지 상세 매뉴얼"
                onDownload={() => DownloadPackageService.downloadInstallationManual()}
              />

              {/* Item 3 */}
              <DownloadCard
                icon={<FileCode className="w-5 h-5 text-amber-600" />}
                title="3. 환경변수 설정 예시 파일"
                filename="환경변수_설정예시_env.example.txt"
                badge="배포 설정"
                stage="4단계에서 사용"
                desc="Vercel 배포 시 복사해 넣을 Firebase 6개 키값 이름 및 설정 템플릿"
                onDownload={() => DownloadPackageService.downloadEnvExample()}
              />

              {/* Item 4 */}
              <DownloadCard
                icon={<ShieldCheck className="w-5 h-5 text-rose-600" />}
                title="4. Firebase Firestore 보안 규칙 파일"
                filename="힐링약국_파이어베이스_보안규칙_firestore.rules.txt"
                badge="보안 설정"
                stage="3단계에서 사용"
                desc="우리 학교 데이터베이스 컬렉션을 보호하는 Firestore Security Rules"
                onDownload={() => DownloadPackageService.downloadFirestoreRules()}
              />

              {/* Item 5 */}
              <DownloadCard
                icon={<Layers className="w-5 h-5 text-teal-600" />}
                title="5. 데이터베이스 구조 및 설계서"
                filename="힐링약국_데이터베이스_설계서_blueprint.json"
                badge="기술 명세서"
                stage="3단계 참조"
                desc="students, visits, cookie_logs 등 컬렉션별 필드 타입 및 스키마 JSON"
                onDownload={() => DownloadPackageService.downloadFirebaseBlueprint()}
              />

              {/* Item 6 */}
              <DownloadCard
                icon={<CheckCircle2 className="w-5 h-5 text-purple-600" />}
                title="6. 운영 시작 전 교사 점검 체크리스트"
                filename="힐링약국_운영전_점검체크리스트_20항목.md"
                badge="인쇄용 점검표"
                stage="오픈 전 필수"
                desc="오픈 데이 전 계정, 권한, 보상 준비, 백업 등 20개 자가진단 항목"
                onDownload={() => DownloadPackageService.downloadPreLaunchChecklist()}
              />

              {/* Item 7 */}
              <DownloadCard
                icon={<Heart className="w-5 h-5 text-pink-600" />}
                title="7. 학생·학부모 가정통신문 및 안내문 예시"
                filename="힐링약국_학생_학부모_가정통신문_예시.md"
                badge="가정통신문"
                stage="8~9단계용"
                desc="마음약방 취지, 비의료 안내, 접속 방법, 개인정보 보호 수칙 안내 예시문"
                onDownload={() => DownloadPackageService.downloadStudentFamilyNotice()}
              />

              {/* Item 8 */}
              <DownloadCard
                icon={<Sparkles className="w-5 h-5 text-amber-500" />}
                title="8. 초기 138개 가상 마음신호 스타터 팩"
                filename="힐링약국_초기데이터_스타터팩_138개마음신호.json"
                badge="초기 콘텐츠"
                stage="DB 초기화용"
                desc="학습·관계·감정 8개 영역 138개 가상 마음신호와 추천 처방전 풀 JSON"
                onDownload={() => DownloadPackageService.downloadStarterDataPack()}
              />

              {/* Item 9 */}
              <DownloadCard
                icon={<FileSpreadsheet className="w-5 h-5 text-emerald-500" />}
                title="9. 구글 스프레드시트 단독 배포용 Apps Script 번들"
                filename="힐링약국_구글스프레드시트_단독배포용_AppsScript_번들.txt"
                badge="GAS 대안형"
                stage="구글 시트 배포시"
                desc="Vercel/Firebase 없이 구글 드라이브 시트 하나로 100% 무료 배포하는 전체 소스"
                onDownload={() => DownloadPackageService.downloadGoogleAppsScriptBundle()}
              />
            </div>
          </section>
        )}

        {/* TAB 3: SCHOOL CASES & TIPS */}
        {activeTab === 'school_cases' && (
          <section className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-jua text-lg text-slate-900 flex items-center gap-2">
                <School className="w-5 h-5 text-amber-600" />
                <span>백운호수중학교 힐링약국 운영 노하우 & 실물 활동 연계</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                    <span>💌</span>
                    <span>실물 약봉투 & 맞춤 처방전 인쇄</span>
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    웹앱에서 발급받은 처방전을 교사용 대시보드의 <strong>[인쇄]</strong> 기능을 통해 인쇄하여 <strong>실제 약봉투(종이 봉투)</strong>에 담아 전달해 주면 학생들의 몰입도와 성취감이 배가됩니다. 안에 비타민 사탕을 함께 넣어주기도 합니다.
                  </p>
                </div>

                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-rose-950 text-sm flex items-center gap-1.5">
                    <span>🎁</span>
                    <span>칭찬쿠키와 가챠(캡슐 뽑기) 연계</span>
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    학생이 5일간 행동 처방을 성실히 실천하면 웹앱에서 칭찬쿠키를 모아 캡슐을 뽑습니다. 교실이나 Wee클래스에 <strong>실물 캡슐 뽑기 기계</strong>를 비치하고, 웹앱 쿠키 차감 후 실물 캡슐을 돌려보게 하면 전교생의 참여율이 폭발적으로 높아집니다.
                  </p>
                </div>

                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-teal-950 text-sm flex items-center gap-1.5">
                    <span>🌱</span>
                    <span>Wee클래스 및 상담교사 협력 모델</span>
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    ‘힐링약국’은 일상적인 작은 마음신호를 가볍고 즐겁게 다루므로, 평소 상담실 문턱을 높게 느끼던 학생들도 자연스럽게 Wee클래스에 들르는 따뜻한 통로가 되어줍니다.
                  </p>
                </div>

                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                    <span>📊</span>
                    <span>사회정서학습(SEL) 사전·사후 진단평가</span>
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    프로젝트 시작 전과 종료 시점에 20문항의 표준 SEL 설문(자기인식, 대인관계, 감정조절 등)을 실시하여 학급별, 전교생 단위로 사회정서 성장을 통계 차트로 시각화할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: FAQ */}
        {activeTab === 'faq' && (
          <section className="space-y-3">
            <FaqItem
              question="정말로 운영 비용이 0원인가요? 추가 요금이 나오지 않나요?"
              answer="네, 100% 무료입니다. Google Firebase Firestore의 무료 요금제(Spark 플랜)는 하루 50,000회 읽기/20,000회 쓰기를 무료로 제공합니다. 전교생 1,000명 규모의 중·고등학교가 매일 접속해도 무료 제공량의 10% 미만을 사용하므로 비용이 발생하지 않습니다."
            />
            <FaqItem
              question="학생 개인정보보호법에 저촉되지 않나요?"
              answer="철저하게 학생 프라이버시를 보호하도록 설계되었습니다. 주민등록번호, 연락처 등 민감 정보는 일체 수집하지 않으며 오직 '학년, 반, 번호, 이름'과 4자리 비밀번호만으로 운영됩니다. 또한 로그인 화면에서 전체 명단을 노출하지 않고 학생이 직접 번호를 입력하는 방식을 채택하고 있습니다."
            />
            <FaqItem
              question="초등학교나 고등학교에서도 사용할 수 있나요?"
              answer="네, 가능합니다! 교사 대시보드의 [환경설정] 및 [학생 관리]에서 학년 구성을 자유롭게 변경할 수 있습니다. 초등학교의 경우 담임교사 중심의 학급 단위 프로젝트로, 고등학교의 경우 시험 스트레스 및 진로 고민 중심 마음신호로 특화하여 운영할 수 있습니다."
            />
            <FaqItem
              question="Vercel이나 Firebase를 다루기 어려우면 다른 방법은 없나요?"
              answer="준비되어 있습니다! 상단 [설치 자료 다운로드 센터]의 [9번 구글 스프레드시트 단독 배포 번들]을 사용하시면, 학교 구글 드라이브 스프레드시트의 Apps Script 편집기에 코드만 복사해 붙여넣으면 3분 만에 무료 웹앱이 완성됩니다. 구글 계정 하나로 모두 해결됩니다."
            />
            <FaqItem
              question="학생이 비밀번호를 잊어버리면 어떻게 하나요?"
              answer="교사 관리자 모드의 [학생 관리] 탭에서 해당 학생의 [0000으로 초기화] 버튼을 한 번 클릭해 주시면 즉시 0000으로 리셋됩니다. 학생은 0000으로 다시 로그인한 뒤 마이페이지에서 새 비밀번호를 설정할 수 있습니다."
            />
          </section>
        )}

        {/* Bottom Back Button Banner */}
        <div className="pt-6 border-t border-slate-200 text-center space-y-2">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 hover:from-amber-500 hover:to-pink-600 text-white font-jua text-sm sm:text-base rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            ← 힐링약국 처음 화면(로그인)으로 돌아가기
          </button>
          <p className="text-[11px] text-slate-400">
            백운호수중학교 사회정서교육 프로젝트 '힐링약국' · 누구나 자유롭게 학교에서 활용하실 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
};

// Reusable Step Card Component
interface StepCardProps {
  step: number;
  title: string;
  isExpanded: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  onToggleComplete: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  title,
  isExpanded,
  isCompleted,
  onToggle,
  onToggleComplete,
  children
}) => {
  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden ${
        isCompleted
          ? 'bg-white border-emerald-300/80 shadow-xs'
          : 'bg-white border-slate-200 shadow-xs hover:border-amber-300'
      }`}
    >
      <div
        onClick={onToggle}
        className="p-4 sm:p-4.5 flex items-center justify-between gap-3 cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleComplete}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'border-2 border-slate-300 text-transparent hover:border-emerald-500'
            }`}
            title={isCompleted ? '완료 취소' : '이 단계 완료 체크'}
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                STEP {step}
              </span>
              {isCompleted && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  완료됨
                </span>
              )}
            </div>
            <h3
              className={`font-jua text-sm sm:text-base mt-0.5 ${
                isCompleted ? 'text-emerald-950' : 'text-slate-900'
              }`}
            >
              {title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs hidden sm:inline text-slate-400">
            {isExpanded ? '접기' : '자세히 보기'}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white animate-fade-in">
          {children}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onToggleComplete}
              className={`text-xs font-jua px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isCompleted ? '완료 취소하기' : '이 단계 완료했어요!'}</span>
            </button>
            <span className="text-[11px] text-slate-400">
              * 진행 상태는 브라우저에 안전하게 저장됩니다.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Download Card
interface DownloadCardProps {
  icon: React.ReactNode;
  title: string;
  filename: string;
  badge: string;
  stage: string;
  desc: string;
  onDownload: () => void;
}

const DownloadCard: React.FC<DownloadCardProps> = ({
  icon,
  title,
  filename,
  badge,
  stage,
  desc,
  onDownload
}) => {
  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all space-y-3">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.5 rounded">
                {badge}
              </span>
              <h4 className="font-jua text-sm text-slate-900 mt-0.5">{title}</h4>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium shrink-0">{stage}</span>
        </div>

        <p className="text-xs text-slate-600 mt-2 leading-relaxed">{desc}</p>
        <code className="block mt-1.5 text-[10.5px] font-mono text-slate-400 truncate">
          📄 {filename}
        </code>
      </div>

      <button
        onClick={onDownload}
        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-jua flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>실제 파일 다운로드</span>
      </button>
    </div>
  );
};

// Reusable FAQ Item
interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 text-left font-jua text-sm text-slate-900 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-amber-600 font-bold text-base">Q.</span>
          <span>{question}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 bg-slate-50/50 leading-relaxed animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  );
};
