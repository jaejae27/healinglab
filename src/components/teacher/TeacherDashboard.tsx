import React, { useState, useMemo, useEffect } from 'react';
import { Student, Visit, NewConditionRequest, AppSettings, SchoolClass, CategoryId } from '../../types';
import { StorageService } from '../../services/storage';
import { CATEGORIES } from '../../data/categories';
import { StudentManagementTab } from './StudentManagementTab';
import { AssessmentDashboardTab } from './AssessmentDashboardTab';
import { SchoolRecordBatchHelper } from './SchoolRecordBatchHelper';
import {
  generateGoogleAppsScript,
  generateGasIndexHtml,
  generateGasManifest,
  generateGasReadme
} from '../../services/gasScriptGenerator';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  CheckSquare,
  FileText,
  FlaskConical,
  Printer,
  Settings,
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Download,
  Upload,
  Copy,
  Check,
  Award,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Code2,
  Globe,
  HelpCircle,
  Link,
  FileCode,
  Calendar,
  Smile,
  BookOpen,
  Eye,
  X,
  CheckCircle
} from 'lucide-react';

interface TeacherDashboardProps {
  onSwitchToStudent: () => void;
  onPrintWorkbook: (conditionId: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onSwitchToStudent,
  onPrintWorkbook
}) => {
  const [activeTab, setActiveTab] = useState<
    'stats' | 'assessment' | 'students' | 'verify' | 'records' | 'new_med' | 'print' | 'settings'
  >('stats');

  // State
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());
  const [classes, setClasses] = useState<SchoolClass[]>(StorageService.getClasses());
  const [visits, setVisits] = useState<Visit[]>(StorageService.getVisits());
  const [requests, setRequests] = useState<NewConditionRequest[]>(
    StorageService.getNewConditionRequests()
  );
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());

  // Class Filter
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedClass, setSelectedClass] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Copy Gas Code state
  const [copiedGas, setCopiedGas] = useState<boolean>(false);
  const [gasSubTab, setGasSubTab] = useState<'backend' | 'frontend' | 'manifest' | 'guide' | 'connect'>('backend');
  const [copiedGasFile, setCopiedGasFile] = useState<string | null>(null);
  const [gasApiUrl, setGasApiUrl] = useState<string>(() => localStorage.getItem('hp_gas_url') || '');
  const [gasPingStatus, setGasPingStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // In-App Toast & Audio Feedback System (safe inside iframe)
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    type?: 'success' | 'cookie' | 'info';
  } | null>(null);

  const [recentlyGiftedStudentIds, setRecentlyGiftedStudentIds] = useState<Record<string, number>>({});

  const showToast = (message: string, type: 'success' | 'cookie' | 'info' = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast((cur) => (cur?.id === toast.id ? null : cur));
    }, 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  // Subscribe to real-time Firestore database updates
  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setStudents(StorageService.getStudents());
      setClasses(StorageService.getClasses());
      setVisits(StorageService.getVisits());
      setRequests(StorageService.getNewConditionRequests());
      setSettings(StorageService.getSettings());
    });
    return () => unsub();
  }, []);

  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext unavailable or restricted
    }
  };

  const handleGiftEncouragementCookie = (
    studentId: string,
    studentName: string,
    conditionName?: string
  ) => {
    const updatedStudent = StorageService.addCookieLog(
      studentId,
      1,
      `선생님 특별 칭찬 선물 (${conditionName || '실천 격려'})`
    );
    setStudents(StorageService.getStudents());

    setRecentlyGiftedStudentIds((prev) => ({
      ...prev,
      [studentId]: Date.now()
    }));

    playChimeSound();

    const newBalance = updatedStudent?.cookieBalance ?? 0;
    showToast(
      `🎉 [${studentName}] 학생에게 격려 칭찬쿠키 +1개가 성공적으로 전달되었습니다! (현재 🍪 ${newBalance}개)`,
      'cookie'
    );
  };

  const handleDownloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyGasFile = (fileKey: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedGasFile(fileKey);
    setTimeout(() => setCopiedGasFile(null), 2000);
  };

  const handleTestGasConnection = async () => {
    if (!gasApiUrl.trim()) return;
    setGasPingStatus('testing');
    try {
      const res = await fetch(`${gasApiUrl.trim()}?action=getInitialData`);
      const data = await res.json();
      if (data && data.status === 'success') {
        setGasPingStatus('success');
        localStorage.setItem('hp_gas_url', gasApiUrl.trim());
      } else {
        setGasPingStatus('error');
      }
    } catch {
      setGasPingStatus('error');
    }
  };

  // Record Helper state
  const [selectedStudentRecordId, setSelectedStudentRecordId] = useState<string>(
    students[0]?.id || ''
  );
  const [recordCategory, setRecordCategory] = useState<'행동발달' | '자율활동' | '진로활동'>('행동발달');
  const [generatedSentence, setGeneratedSentence] = useState<string>('');

  // Verify & Daily Mission Inspection filters
  const [verifyGradeFilter, setVerifyGradeFilter] = useState<number | 'all'>('all');
  const [verifyClassFilter, setVerifyClassFilter] = useState<number | 'all'>('all');
  const [verifyStatusFilter, setVerifyStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [verifySearchQuery, setVerifySearchQuery] = useState<string>('');
  const [selectedVisitForModal, setSelectedVisitForModal] = useState<Visit | null>(null);

  const handleViewStudentMissions = (studentId: string) => {
    const studentVisits = StorageService.getVisitsForStudent(studentId);
    if (studentVisits.length > 0) {
      setSelectedVisitForModal(studentVisits[0]);
    } else {
      const student = students.find((s) => s.id === studentId);
      showToast(`${student ? student.name : '해당'} 학생은 아직 마음진료 처방을 발급받지 않았습니다.`, 'info');
    }
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = s.grade === selectedGrade && s.classNum === selectedClass;
      const matchQuery = !searchQuery || s.name.includes(searchQuery) || String(s.number).includes(searchQuery);
      return matchClass && matchQuery;
    });
  }, [students, selectedGrade, selectedClass, searchQuery]);

  // Filtered Visits for Verify & Daily Mission Tab
  const filteredVerifyVisits = useMemo(() => {
    return visits.filter((v) => {
      const matchGrade = verifyGradeFilter === 'all' || v.grade === verifyGradeFilter;
      const matchClass = verifyClassFilter === 'all' || v.classNum === verifyClassFilter;
      const isCompleted = v.status === 'rewarded' || v.status === 'submitted';
      const matchStatus =
        verifyStatusFilter === 'all'
          ? true
          : verifyStatusFilter === 'completed'
          ? isCompleted
          : !isCompleted;
      const matchQuery =
        !verifySearchQuery.trim() ||
        v.studentName.includes(verifySearchQuery.trim()) ||
        v.primaryConditionName.includes(verifySearchQuery.trim());
      return matchGrade && matchClass && matchStatus && matchQuery;
    });
  }, [visits, verifyGradeFilter, verifyClassFilter, verifyStatusFilter, verifySearchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const totalVisits = visits.length;
    const completedVisits = visits.filter((v) => v.status === 'rewarded' || v.status === 'submitted');
    const waitingVerification = visits.filter((v) => v.status === 'submitted' && !v.rewardGiven);

    // Symptom frequency
    const freq: Record<string, { name: string; count: number }> = {};
    visits.forEach((v) => {
      if (!freq[v.primaryConditionId]) {
        freq[v.primaryConditionId] = { name: v.primaryConditionName, count: 0 };
      }
      freq[v.primaryConditionId].count += 1;
    });
    const topConditions = Object.entries(freq)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    // Category distribution
    const catDist: Record<string, number> = {};
    visits.forEach((v) => {
      catDist[v.categoryId] = (catDist[v.categoryId] || 0) + 1;
    });

    return {
      totalStudents,
      totalVisits,
      completedVisitsCount: completedVisits.length,
      waitingVerificationCount: waitingVerification.length,
      topConditions,
      catDist
    };
  }, [students, visits]);

  // Handle Verify Visit & Reward
  const handleRewardVisit = (visitId: string) => {
    const visit = visits.find((v) => v.visitId === visitId);
    if (!visit) return;

    // 1. Give student 3 praise cookies
    StorageService.addCookieLog(
      visit.studentId,
      3,
      `처방 미션 실천 및 워크북 확인 완료 (${visit.primaryConditionName})`
    );

    // 2. Update visit status to rewarded
    const updated = StorageService.updateVisit(visitId, {
      status: 'rewarded',
      paperVerified: true,
      webVerified: true,
      rewardGiven: true,
      rewardGivenAt: new Date().toISOString(),
      rewardSnackNote: '처방약(간식) 및 칭찬쿠키 +3개 지급 완료'
    });

    if (updated) {
      setVisits(StorageService.getVisits());
      setStudents(StorageService.getStudents());
      playChimeSound();
      showToast(`🎉 [${visit.studentName}] 학생의 처방약 확인이 완료되었으며 칭찬쿠키 3개가 지급되었습니다!`, 'cookie');
    }
  };

  // Generate School Record Sentence
  const handleGenerateRecord = () => {
    const student = students.find((s) => s.id === selectedStudentRecordId);
    if (!student) return;

    const studentVisits = visits.filter((v) => v.studentId === student.id && v.submittedAt);
    if (studentVisits.length === 0) {
      setGeneratedSentence(
        `${student.name} 학생은 힐링약국 사회정서 활동에 참여하며 자신의 일상과 정서 상태를 점검하고 긍정적인 생활 습관을 형성하고자 노력함.`
      );
      return;
    }

    const firstVisit = studentVisits[0];
    const why = firstVisit.reflectionWhy || '작은 행동부터 차근차근 시작하는 방법';
    const learned = firstVisit.reflectionLearned || '스스로 감정을 조절하고 긍정적으로 대처하는 태도';

    if (recordCategory === '행동발달') {
      setGeneratedSentence(
        `평소 자신의 정서와 심리 상태를 면밀히 관찰하고 인식하는 능력이 우수함. 사회정서 프로그램 '힐링약국'에서 '${firstVisit.primaryConditionName}' 증상에 대해 '${firstVisit.missions[0]?.title}' 등의 행동 처방을 주도적으로 실천하였으며, "${why}"을 스스로 터득하여 심리적 회복탄력성과 자기조절 능력을 신장시킴.`
      );
    } else if (recordCategory === '자율활동') {
      setGeneratedSentence(
        `학급 사회정서 역량 강화 활동인 '힐링약국'에 성실히 참여하여 자신의 스트레스 요인을 파악하고 문제 해결을 위한 구체적인 실천 방안을 모색함. 워크북 작성을 통해 "${learned}"를 깨닫고 이를 실제 학급 생활에 적용하여 긍정적인 또래 관계 형성에 기여함.`
      );
    } else {
      setGeneratedSentence(
        `진로 탐색 및 학업 과정에서 발생하는 고민과 긴장을 스스로 알아차리고 극복하기 위해 노력함. '${firstVisit.primaryConditionName}' 가상 처방전을 실천하며 "${why}"을 경험하고, 주도적인 목표 관리와 긍정적 자기성찰 습관을 체계적으로 다져나감.`
      );
    }
  };

  // Approve New Medicine Request
  const handleApproveRequest = (req: NewConditionRequest) => {
    const assignedId = `${req.categoryId[0].toUpperCase()}-99`;
    StorageService.updateNewConditionRequest(req.id, {
      status: 'approved',
      assignedId
    });

    // Add to active conditions
    const allConds = StorageService.getConditions();
    allConds.push({
      conditionId: assignedId,
      categoryId: req.categoryId,
      name: req.suggestedName,
      summary: req.whenAppears || '학생들이 함께 만든 가상 증상',
      checkItemsSample: [req.whenAppears || '이 상태가 자주 발생한다.'],
      prescriptionCandidates: req.missionIdeas && req.missionIdeas.length > 0
        ? req.missionIdeas.map((idea, idx) => ({
            id: `${assignedId}-M${idx + 1}`,
            type: 'action' as const,
            title: `학생 제안 실천 행동 ${idx + 1}`,
            description: idea
          }))
        : [
            {
              id: `${assignedId}-M1`,
              type: 'action' as const,
              title: '학생 제안 실천 행동',
              description: req.missionIdea || '마음을 환기하고 다정한 말 건네기'
            }
          ],
      prescriptionMedicineName: '응원비타민',
      prescriptionAdvice: '스스로의 마음을 관찰하고 제안해준 멋진 학생의 아이디어입니다.',
      status: 'active',
      isStudentProposed: true
    });
    StorageService.saveConditions(allConds);

    // Reward proposing student with 5 cookies
    StorageService.addCookieLog(
      req.studentId,
      5,
      `신약개발소 가상 증상 채택 보너스 (${req.suggestedName})`
    );

    setRequests(StorageService.getNewConditionRequests());
    setStudents(StorageService.getStudents());
    playChimeSound();
    showToast(`🎉 [${req.suggestedName}] 신약이 정식 등록되었습니다! 학생에게 칭찬쿠키 5개가 보너스로 지급되었습니다.`, 'cookie');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative">
      {/* IN-APP FLOATING TOAST NOTIFICATION (Bypasses iframe alert blockage) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] sm:w-auto px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border animate-in fade-in slide-in-from-top-4 duration-200"
          style={{
            backgroundColor: toast.type === 'cookie' ? '#FEF3C7' : toast.type === 'info' ? '#EFF6FF' : '#F0FDF4',
            borderColor: toast.type === 'cookie' ? '#F59E0B' : toast.type === 'info' ? '#60A5FA' : '#4ADE80',
            color: toast.type === 'cookie' ? '#78350F' : toast.type === 'info' ? '#1E3A8A' : '#14532D'
          }}
        >
          <span className="text-2xl shrink-0">
            {toast.type === 'cookie' ? '🍪' : toast.type === 'info' ? 'ℹ️' : '✅'}
          </span>
          <div className="flex-1 text-xs sm:text-sm font-bold leading-snug">
            {toast.message}
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-black/10 text-current transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Top Header */}
      <header className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-jua text-sm text-white">
            💊
          </div>
          <div>
            <h1 className="font-jua text-base flex items-center gap-2">
              <span>힐링약국 교사 통합 관리자 대시보드</span>
              <span className="text-[10px] font-mono bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30">
                TEACHER MODE
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              중학교 사회정서교육 운영 · 처방약 지급 · 생기부 연계 지원 시스템
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>파이어베이스 클라우드 동기화 완료</span>
          </div>

          <button
            onClick={onSwitchToStudent}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-jua transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>학생 화면으로 돌아가기</span>
          </button>
        </div>
      </header>

      {/* Main Layout with Navigation Tabs */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-56 shrink-0 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1">
          {[
            { id: 'stats', label: '통계 & 대시보드', icon: LayoutDashboard },
            { id: 'assessment', label: '사전·사후 평가 분석', icon: BarChart3 },
            { id: 'students', label: '학생 명단 관리', icon: Users },
            {
              id: 'verify',
              label: '학생 미션 실천 확인',
              icon: CheckSquare,
              badge: visits.filter((v) => v.status === 'rewarded' || v.status === 'submitted').length
            },
            { id: 'records', label: '생기부 문장 도우미', icon: FileText },
            { id: 'new_med', label: '신약개발소 심사', icon: FlaskConical },
            { id: 'print', label: '워크북 인쇄실', icon: Printer },
            { id: 'settings', label: '설정 & GAS 배포', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-jua transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
          {/* TAB 1: Statistics & Overview */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-jua text-lg text-slate-800">학급 및 전교 사회정서 참여 현황</h2>
                  <p className="text-xs text-slate-500">학생들의 마음신호 분포와 처방 실천율을 실시간으로 확인합니다.</p>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                  <span className="text-xs text-slate-500 block">등록 학생수</span>
                  <span className="font-jua text-2xl text-slate-900">{stats.totalStudents}명</span>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl">
                  <span className="text-xs text-indigo-700 block">총 처방전 발급</span>
                  <span className="font-jua text-2xl text-indigo-900">{stats.totalVisits}건</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                  <span className="text-xs text-emerald-700 block">실천 완료 (처방약 수령)</span>
                  <span className="font-jua text-2xl text-emerald-900">{stats.completedVisitsCount}건</span>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl">
                  <span className="text-xs text-rose-700 block">처방약 확인 대기</span>
                  <span className="font-jua text-2xl text-rose-900">{stats.waitingVerificationCount}건</span>
                </div>
              </div>

              {/* Top 5 Symptoms & Category Dist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4">
                  <h3 className="font-jua text-sm text-slate-800 mb-3 flex items-center gap-1.5">
                    <span>🔥 가장 많이 나타난 마음신호 TOP 5</span>
                  </h3>
                  <div className="space-y-2">
                    {stats.topConditions.length === 0 ? (
                      <p className="text-xs text-slate-400">데이터가 아직 없습니다.</p>
                    ) : (
                      stats.topConditions.map(([id, data], idx) => (
                        <div
                          key={id}
                          className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg"
                        >
                          <span className="font-medium text-slate-800">
                            {idx + 1}. [{id}] {data.name}
                          </span>
                          <span className="font-bold text-indigo-600">{data.count}회</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4">
                  <h3 className="font-jua text-sm text-slate-800 mb-3 flex items-center gap-1.5">
                    <span>📊 영역별 분포</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between text-xs p-2 rounded-lg border border-slate-100"
                        style={{ backgroundColor: cat.bgLight }}
                      >
                        <span className="font-medium text-slate-800">
                          {cat.icon} {cat.name}
                        </span>
                        <span className="font-bold text-slate-700">
                          {stats.catDist[cat.id] || 0}건
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Safe Guidance */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                💡 <strong>운영 주의사항:</strong> 힐링약국의 모든 마음신호는 중학생의 일상적 상태를 알아차리는 교육용 메타포입니다. 특정 마음신호 발급이 지속되거나 심리적 위기 징후(우울, 자해 등)가 감지될 경우 전문 상담교사 및 Weee 센터 연계를 적극 진행해주세요.
              </div>
            </div>
          )}

          {/* TAB: Assessment & SEL Evaluation */}
          {activeTab === 'assessment' && (
            <AssessmentDashboardTab
              students={students}
              selectedGrade={selectedGrade}
              selectedClass={selectedClass}
              onStudentsUpdated={() => {
                setStudents(StorageService.getStudents());
              }}
            />
          )}

          {/* TAB 2: Students Management */}
          {activeTab === 'students' && (
            <StudentManagementTab
              students={students}
              selectedGrade={selectedGrade}
              selectedClass={selectedClass}
              onGradeChange={setSelectedGrade}
              onClassChange={setSelectedClass}
              onViewStudentMissions={handleViewStudentMissions}
              onStudentsUpdated={() => {
                setStudents(StorageService.getStudents());
              }}
            />
          )}

          {/* TAB 3: Student Mission & Prescription Inspection */}
          {activeTab === 'verify' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="font-jua text-lg text-slate-800 flex items-center gap-2">
                    <span>학생 미션 실천 및 처방 확인</span>
                    <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                      총 {filteredVerifyVisits.length}건
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    학생들이 5일간 매일 실천한 미션 스탬프, 기분, 한 줄 기록과 최종 성찰 제출 내역을 상세히 확인합니다.
                  </p>
                </div>

                {/* Auto recognition notice badge */}
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>학생 제출 시 교사 별도 승인 없이 자동 인정 완료</span>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Grade filter */}
                  <select
                    value={verifyGradeFilter}
                    onChange={(e) =>
                      setVerifyGradeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                    }
                    className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-700"
                  >
                    <option value="all">전체 학년</option>
                    <option value={1}>1학년</option>
                    <option value={2}>2학년</option>
                    <option value={3}>3학년</option>
                  </select>

                  {/* Class filter */}
                  <select
                    value={verifyClassFilter}
                    onChange={(e) =>
                      setVerifyClassFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                    }
                    className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-700"
                  >
                    <option value="all">전체 반</option>
                    {[1, 2, 3, 4, 5].map((c) => (
                      <option key={c} value={c}>
                        {c}반
                      </option>
                    ))}
                  </select>

                  {/* Status filter */}
                  <select
                    value={verifyStatusFilter}
                    onChange={(e) => setVerifyStatusFilter(e.target.value as any)}
                    className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-700"
                  >
                    <option value="all">전체 상태</option>
                    <option value="in_progress">5일 실천 진행 중</option>
                    <option value="completed">최종 실천 완료 (자동 인정)</option>
                  </select>

                  {/* Search query */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={verifySearchQuery}
                      onChange={(e) => setVerifySearchQuery(e.target.value)}
                      placeholder="학생 이름 또는 처방명 검색"
                      className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                </div>

                {/* Counter Pill */}
                <div className="text-slate-500 font-medium">
                  조회 결과: <strong className="text-slate-900">{filteredVerifyVisits.length}</strong>건
                </div>
              </div>

              {/* Visits List */}
              <div className="space-y-4">
                {filteredVerifyVisits.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 border border-dashed rounded-2xl text-xs bg-slate-50/50">
                    조건에 해당하는 처방 및 미션 실천 기록이 없습니다.
                  </div>
                ) : (
                  filteredVerifyVisits.map((v) => {
                    const isCompleted = v.status === 'rewarded' || v.status === 'submitted';
                    const checkInsCount = v.dailyCheckIns?.length || 0;
                    const cardStudent = students.find((s) => s.id === v.studentId);
                    const isJustGifted = (Date.now() - (recentlyGiftedStudentIds[v.studentId] || 0)) < 3000;

                    return (
                      <div
                        key={v.visitId}
                        className={`border-2 rounded-2xl p-4 transition-all shadow-xs ${
                          isCompleted
                            ? 'bg-white border-emerald-200 hover:border-emerald-300'
                            : 'bg-white border-amber-200 hover:border-amber-300'
                        }`}
                      >
                        {/* Top Header Row */}
                        <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-jua text-base text-slate-900">
                                {v.grade}학년 {v.classNum}반 {v.studentName}
                              </span>
                              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                                [{v.primaryConditionId}] {v.primaryConditionName}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {new Date(v.createdAt).toLocaleDateString('ko-KR')} 발급
                              </span>

                              {/* Student Live Praise Cookie Balance Badge */}
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 border transition-all ${
                                isJustGifted
                                  ? 'bg-amber-200 text-amber-950 border-amber-400 scale-105 shadow-sm'
                                  : 'bg-amber-50 text-amber-900 border-amber-200'
                              }`}>
                                <span>🍪</span>
                                <span>칭찬쿠키 {cardStudent?.cookieBalance ?? 0}개</span>
                                {isJustGifted && (
                                  <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-200/80 px-1 rounded animate-pulse">
                                    +1 방금 전달!
                                  </span>
                                )}
                              </span>
                            </div>

                            {/* Assigned 3 candidate missions */}
                            <div className="text-[11px] text-slate-500 flex flex-wrap gap-1.5 mt-1">
                              <span className="font-medium text-slate-700">처방 미션:</span>
                              {v.missions.map((m, mIdx) => (
                                <span
                                  key={m.missionId}
                                  className="bg-slate-100 px-2 py-0.5 rounded text-slate-600"
                                >
                                  {mIdx + 1}. {m.title}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {isCompleted ? (
                              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>5일 실천 완료 (자동 인정됨)</span>
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>5일 루틴 실천 중 ({checkInsCount}/5일)</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 5-Day Daily Mission Check-in Progress & Notes Grid */}
                        <div className="py-3">
                          <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                            <span>5일 미션 일일 체크인 현황 및 학생 기록</span>
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map((day) => {
                              const checkIn = v.dailyCheckIns?.find(
                                (c) => c.day === day || (c as any).dayNumber === day
                              );
                              const moodEmojiMap: Record<string, string> = {
                                great: '😊 맑음',
                                good: '🙂 평온',
                                neutral: '😐 보통',
                                tired: '🥱 피곤',
                                stressed: '😣 답답'
                              };

                              if (checkIn && checkIn.completed) {
                                const completedItems = checkIn.items?.filter((it) => it.completed) || [];
                                const isAllDone = checkIn.allCompleted || completedItems.length >= 3;

                                return (
                                  <div
                                    key={day}
                                    className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 flex flex-col justify-between"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 border-b border-amber-200/60 pb-1 mb-1.5">
                                        <span>{day}일차 완료 ✅</span>
                                        <span className="text-[10px] text-amber-700">
                                          {moodEmojiMap[checkIn.mood || 'good']}
                                        </span>
                                      </div>

                                      {/* All 3 clear badge */}
                                      <div className="mb-1.5">
                                        {isAllDone ? (
                                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded-full">
                                            👑 3개 올클리어
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full">
                                            🎯 {completedItems.length > 0 ? completedItems.length : 1}/3개 실천
                                          </span>
                                        )}
                                      </div>

                                      {/* Check-in items or summary note */}
                                      {checkIn.items && checkIn.items.length > 0 ? (
                                        <div className="space-y-1">
                                          {checkIn.items.map((it, idx) => (
                                            <div
                                              key={idx}
                                              className="bg-white/80 p-1 rounded border border-amber-100 text-[10px]"
                                            >
                                              <div className="flex items-center gap-1 font-bold text-slate-700 truncate">
                                                <span>{it.completed ? '✅' : '⚪'}</span>
                                                <span className="truncate">{it.missionTitle}</span>
                                              </div>
                                              {it.actionNote && (
                                                <p className="text-[9.5px] text-indigo-700 font-medium pl-3 truncate mt-0.5" title={it.actionNote}>
                                                  "{it.actionNote}"
                                                </p>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="bg-white/70 p-1.5 rounded-lg border border-amber-100 text-[10px]">
                                          <p className="font-bold text-slate-700 truncate" title={checkIn.missionTitle}>
                                            {checkIn.missionTitle}
                                          </p>
                                          {checkIn.note && (
                                            <p className="text-slate-600 mt-0.5 font-medium line-clamp-2" title={checkIn.note}>
                                              "{checkIn.note}"
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-[9px] text-slate-400 mt-1.5 block text-right font-mono">
                                      {checkIn.completedAt
                                        ? new Date(checkIn.completedAt).toLocaleDateString('ko-KR')
                                        : checkIn.date}
                                    </span>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={day}
                                  className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center text-center text-slate-400 min-h-[90px]"
                                >
                                  <span className="text-xs font-bold font-mono">{day}일차</span>
                                  <span className="text-[10px] mt-1">미실천 (대기)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Final Reflection Section (if submitted) */}
                        {isCompleted && (
                          <div className="mt-2 pt-2.5 border-t border-slate-100 bg-slate-50/70 p-3 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                                <span>📝 최종 제출 성찰 기록</span>
                                {v.bestMissionIndices && v.bestMissionIndices.length > 0 ? (
                                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                                    🏆 BEST: 처방 {v.bestMissionIndices.map(i => i + 1).join(', ')}번
                                  </span>
                                ) : v.bestMissionIndex !== undefined ? (
                                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                                    🏆 BEST: 처방 {v.bestMissionIndex + 1}번
                                  </span>
                                ) : null}
                              </h5>
                              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span>💊 실물 약 지급 대상</span>
                              </span>
                            </div>

                            {v.participationRate !== undefined && (
                              <div className="text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                                <strong>📊 5일 실천 참여율:</strong> {v.participationRate}% ({v.dailyCheckIns?.filter(c => c.completed).length || 0}/5일 실천)
                                {v.reflectionParticipation && (
                                  <p className="mt-1 text-indigo-900">
                                    <strong>💭 참여도 성찰:</strong> "{v.reflectionParticipation}"
                                  </p>
                                )}
                              </div>
                            )}

                            {v.reflectionWhy && (
                              <p className="text-slate-700">
                                <strong>💡 도움이 된 이유:</strong> "{v.reflectionWhy}"
                              </p>
                            )}
                            {v.reflectionLearned && (
                              <p className="text-slate-600">
                                <strong>🌱 새롭게 알게 된 점:</strong> "{v.reflectionLearned}"
                              </p>
                            )}
                            {v.futurePlan && (
                              <p className="text-slate-600">
                                <strong>🔮 다음 다짐:</strong> "{v.futurePlan}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Action Buttons Row */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[11px] text-slate-400 font-mono">
                            처방 ID: {v.visitId}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Mission Details Inspection Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedVisitForModal(v)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>매일 미션 상세 확인</span>
                            </button>

                            {/* Workbook Print view */}
                            <button
                              type="button"
                              onClick={() => onPrintWorkbook(v.primaryConditionId)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-500" />
                              <span>워크북 인쇄 보기</span>
                            </button>

                            {/* Extra Praise Cookie gift */}
                            {(() => {
                              const isCardGifted = (Date.now() - (recentlyGiftedStudentIds[v.studentId] || 0)) < 3000;
                              return (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleGiftEncouragementCookie(
                                      v.studentId,
                                      v.studentName,
                                      v.primaryConditionName
                                    );
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs ${
                                    isCardGifted
                                      ? 'bg-emerald-500 text-white shadow-md scale-105'
                                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80'
                                  }`}
                                  title="선생님 특별 격려 칭찬쿠키 +1개 선물하기"
                                >
                                  <span>{isCardGifted ? '✨' : '🍪'}</span>
                                  <span>{isCardGifted ? '쿠키 +1개 전달완료!' : '격려 쿠키 +1개 선물'}</span>
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: School Record Helper (생기부 문장 도우미) */}
          {activeTab === 'records' && (
            <SchoolRecordBatchHelper
              students={students}
              visits={visits}
              classes={classes}
              showToast={showToast}
            />
          )}

          {/* TAB 5: New Medicine Lab Review */}
          {activeTab === 'new_med' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-jua text-lg text-slate-800">신약개발소 제안 심사</h2>
                <p className="text-xs text-slate-500">학생들이 제안한 새로운 마음신호와 처방 아이디어를 검토하고 승인합니다.</p>
              </div>

              <div className="space-y-3">
                {requests.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">아직 제안된 신약이 없습니다.</p>
                ) : (
                  requests.map((req) => (
                    <div key={req.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-jua text-sm text-slate-900">{req.suggestedName}</h4>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                              제안자: {req.studentName}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            <strong>발생 상황:</strong> {req.whenAppears}
                          </p>
                          <div className="text-xs text-slate-600 mt-1">
                            <strong>제안한 행동 처방 ({req.missionIdeas ? req.missionIdeas.length : 1}개):</strong>
                            {req.missionIdeas && req.missionIdeas.length > 0 ? (
                              <ul className="list-disc list-inside mt-0.5 space-y-0.5 pl-1 text-[11.5px] text-slate-700">
                                {req.missionIdeas.map((idea, i) => (
                                  <li key={i}>{idea}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="ml-1">{req.missionIdea}</span>
                            )}
                          </div>
                          {req.rewardCookies && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                              🍪 제안 보상: {req.rewardCookies}개 지급됨
                            </span>
                          )}
                        </div>

                        <div>
                          {req.status === 'approved' ? (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                              승인됨 ({req.assignedId})
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveRequest(req)}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-jua text-xs px-3 py-1.5 rounded-xl shadow-xs"
                            >
                              정식 마음신호로 승인 (+5쿠키)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Print Station */}
          {activeTab === 'print' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-jua text-lg text-slate-800">교실 힐링약국 인쇄실</h2>
                <p className="text-xs text-slate-500">교실 서류함용 실물 워크북(A4/A5) 양식을 바로 인쇄할 수 있습니다.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {StorageService.getConditions().slice(0, 15).map((cond) => (
                  <div
                    key={cond.conditionId}
                    className="border border-slate-200 rounded-xl p-3 flex items-center justify-between bg-slate-50 hover:bg-white transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">
                        {cond.conditionId}
                      </span>
                      <h4 className="font-jua text-xs text-slate-800">{cond.name}</h4>
                    </div>
                    <button
                      onClick={() => onPrintWorkbook(cond.conditionId)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="워크북 인쇄"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Settings & Google Apps Script Setup */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-jua text-lg text-slate-800">Google Apps Script (GAS) 통합 배포 센터</h2>
                  <p className="text-xs text-slate-500">
                    Google 스프레드시트 22개 시트 백엔드와 단일 파일 프론트엔드 웹앱 코드를 관리합니다.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>GAS V8 호환</span>
                </span>
              </div>

              {/* Sub-tab Switcher */}
              <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-jua">
                <button
                  onClick={() => setGasSubTab('backend')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    gasSubTab === 'backend'
                      ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Code.gs (백엔드)</span>
                </button>
                <button
                  onClick={() => setGasSubTab('frontend')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    gasSubTab === 'frontend'
                      ? 'bg-white text-teal-600 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Index.html (프론트엔드)</span>
                </button>
                <button
                  onClick={() => setGasSubTab('manifest')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    gasSubTab === 'manifest'
                      ? 'bg-white text-amber-600 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>appsscript.json (설정)</span>
                </button>
                <button
                  onClick={() => setGasSubTab('guide')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    gasSubTab === 'guide'
                      ? 'bg-white text-rose-600 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>3분 배포 가이드</span>
                </button>
                <button
                  onClick={() => setGasSubTab('connect')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    gasSubTab === 'connect'
                      ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>실시간 Web App 연동</span>
                </button>
              </div>

              {/* Sub-tab 1: Code.gs (Backend) */}
              {gasSubTab === 'backend' && (
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-900 text-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-jua text-sm text-amber-400 flex items-center gap-2">
                        <span>📄 Code.gs (Google Apps Script 백엔드 엔진)</span>
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/30">
                          22개 시트 스키마 + REST API + LockService
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Apps Script의 <code>Code.gs</code> 파일에 전체 붙여넣고 <code>setupHealingPharmacy()</code>를 1회 실행하세요.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyGasFile('backend', generateGoogleAppsScript())}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-jua transition-colors"
                      >
                        {copiedGasFile === 'backend' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedGasFile === 'backend' ? '복사 완료!' : '코드 복사'}</span>
                      </button>
                      <button
                        onClick={() => handleDownloadFile('Code.gs', generateGoogleAppsScript(), 'text/javascript')}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-jua border border-slate-700 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Code.gs 다운로드</span>
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto font-mono text-[11px] bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 select-all leading-relaxed">
                    {generateGoogleAppsScript()}
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Index.html (Frontend) */}
              {gasSubTab === 'frontend' && (
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-900 text-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-jua text-sm text-teal-400 flex items-center gap-2">
                        <span>🌐 Index.html (Google Apps Script 단일 파일 웹앱 프론트엔드)</span>
                        <span className="text-[10px] bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-md border border-teal-400/30">
                          Tailwind + 학생 진료 + 워크북 인쇄 + 가챠
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Apps Script에서 <code>[+] 파일 추가 &gt; HTML</code>을 누르고 파일명을 <code>Index</code>로 지정한 뒤 붙여넣으세요.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyGasFile('frontend', generateGasIndexHtml())}
                        className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-xl text-xs font-jua transition-colors"
                      >
                        {copiedGasFile === 'frontend' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedGasFile === 'frontend' ? '복사 완료!' : 'HTML 복사'}</span>
                      </button>
                      <button
                        onClick={() => handleDownloadFile('Index.html', generateGasIndexHtml(), 'text/html')}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-jua border border-slate-700 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Index.html 다운로드</span>
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto font-mono text-[11px] bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 select-all leading-relaxed">
                    {generateGasIndexHtml()}
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Manifest (appsscript.json) */}
              {gasSubTab === 'manifest' && (
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-900 text-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-jua text-sm text-amber-400">
                        📄 appsscript.json (배포 매니페스트 설정)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        시간대(Asia/Seoul) 및 웹앱 실행 권한(USER_DEPLOYING / ANYONE) 설정 파일입니다.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyGasFile('manifest', generateGasManifest())}
                        className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl text-xs font-jua transition-colors"
                      >
                        {copiedGasFile === 'manifest' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedGasFile === 'manifest' ? '복사 완료!' : '설정 복사'}</span>
                      </button>
                      <button
                        onClick={() => handleDownloadFile('appsscript.json', generateGasManifest(), 'application/json')}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-jua border border-slate-700 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>다운로드</span>
                      </button>
                    </div>
                  </div>

                  <pre className="font-mono text-[11px] bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 select-all leading-relaxed">
                    {generateGasManifest()}
                  </pre>
                </div>
              )}

              {/* Sub-tab 4: Guide */}
              {gasSubTab === 'guide' && (
                <div className="border border-slate-200 rounded-2xl p-6 bg-white space-y-4">
                  <h3 className="font-jua text-base text-slate-800 flex items-center gap-2">
                    <span>🚀 3분 완성! Google Apps Script Web App 배포 가이드</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-slate-600">
                    <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs">1</span>
                        <span>Google 스프레드시트 생성</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Google Drive에서 새 스프레드시트를 만들고 상단 메뉴 <strong>확장 프로그램 &gt; Apps Script</strong>를 엽니다.
                      </p>
                    </div>

                    <div className="p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-2xl space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-indigo-900">
                        <span className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-xs">2</span>
                        <span>Code.gs & Index.html 붙여넣기</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        <code>Code.gs</code>에 백엔드 코드를 붙여넣고, 좌측 <code>+</code> 버튼으로 HTML 파일 <code>Index</code>를 만들어 프론트엔드 코드를 붙여넣습니다.
                      </p>
                    </div>

                    <div className="p-4 bg-teal-50/60 border border-teal-200/80 rounded-2xl space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-teal-900">
                        <span className="w-5 h-5 rounded-full bg-teal-200 flex items-center justify-center text-xs">3</span>
                        <span>22개 시트 DB 초기 구축</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        상단 함수 선택창에서 <code>setupHealingPharmacy</code>를 선택하고 <strong>[실행]</strong>을 누르면 22개 시트와 스키마가 자동 생성됩니다.
                      </p>
                    </div>

                    <div className="p-4 bg-rose-50/60 border border-rose-200/80 rounded-2xl space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-rose-900">
                        <span className="w-5 h-5 rounded-full bg-rose-200 flex items-center justify-center text-xs">4</span>
                        <span>웹 앱으로 배포하기</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        우측 상단 <strong>[배포] &gt; [새 배포] &gt; [웹 앱]</strong>을 선택하고 액세스 권한을 <strong>[모든 사용자(Anyone)]</strong>로 설정하여 배포합니다.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      배포된 웹 앱 URL 하나만으로 학생들은 모바일/태블릿/PC 어디서나 별도 로그인 없이 실시간 구글 시트와 연동되는 힐링약국을 이용할 수 있습니다!
                    </span>
                  </div>
                </div>
              )}

              {/* Sub-tab 5: Connect Remote URL */}
              {gasSubTab === 'connect' && (
                <div className="border border-slate-200 rounded-2xl p-6 bg-white space-y-4">
                  <div>
                    <h3 className="font-jua text-base text-slate-800 flex items-center gap-2">
                      <span>🔗 배포된 Google Apps Script Web App URL 연동</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      배포 완료된 Web App 실행 URL(<code>https://script.google.com/macros/s/.../exec</code>)을 등록하면 본 웹 애플리케이션과 Google 시트 간 양방향 데이터 동기화가 활성화됩니다.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={gasApiUrl}
                      onChange={(e) => setGasApiUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <button
                      onClick={handleTestGasConnection}
                      disabled={gasPingStatus === 'testing' || !gasApiUrl.trim()}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-jua flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {gasPingStatus === 'testing' ? '연결 확인 중...' : '연결 테스트 & 저장'}
                    </button>
                  </div>

                  {gasPingStatus === 'success' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Google Apps Script 웹앱과 성공적으로 연결되었습니다! 실시간 시트 동기화가 활성화되었습니다.</span>
                    </div>
                  )}

                  {gasPingStatus === 'error' && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>웹앱 응답을 받지 못했습니다. 배포 시 액세스 권한이 '모든 사용자(Anyone)'로 되어 있는지 확인해주세요.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Reset Demo Data */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-jua text-xs text-rose-700">체험 데이터 초기화</h4>
                  <p className="text-[11px] text-slate-500">모든 처방 및 학생 데이터를 초기 샘플 상태로 되돌립니다.</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('정말로 모든 데이터를 초기 상태로 리셋하시겠습니까?')) {
                      StorageService.resetAllData();
                      window.location.reload();
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-jua"
                >
                  초기화 실행
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* DETAILED STUDENT DAILY MISSION INSPECTION MODAL */}
      {selectedVisitForModal && (
        <div
          id="teacher-mission-inspection-modal"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedVisitForModal(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold bg-indigo-500/50 text-indigo-100 px-2 py-0.5 rounded-full border border-indigo-400/30">
                    {selectedVisitForModal.grade}학년 {selectedVisitForModal.classNum}반 {selectedVisitForModal.number}번
                  </span>
                  <span className="text-xs text-indigo-200">
                    처방일: {new Date(selectedVisitForModal.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <h3 className="font-jua text-lg sm:text-xl flex items-center gap-2 text-white">
                  <span>{selectedVisitForModal.studentName} 학생의 처방 미션 실천 일지</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisitForModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
              {/* Prescription Condition Box */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold mb-0.5">
                    <span>💊 발급된 마음신호 처방전</span>
                    <span className="text-[10px] bg-rose-200/60 text-rose-800 px-1.5 py-0.2 rounded font-mono">
                      {selectedVisitForModal.primaryConditionId}
                    </span>
                  </div>
                  <h4 className="font-jua text-base sm:text-lg text-slate-800">
                    {selectedVisitForModal.primaryConditionName}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {selectedVisitForModal.status === 'rewarded' || selectedVisitForModal.status === 'submitted' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>5일 실천 완료 (자동 인정됨)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        5일 루틴 실천 중 ({selectedVisitForModal.dailyCheckIns?.filter(c => c.completed).length || 0}/5일)
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* 3 Selected Customized Missions */}
              <div>
                <h4 className="font-jua text-sm text-slate-800 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>학생이 선택한 맞춤형 3대 실천 미션</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {selectedVisitForModal.missions.map((m, idx) => {
                    const typeBadgeMap = {
                      notice: { label: '신호 알아차리기', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
                      action: { label: '미니 행동 실천', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
                      environment: { label: '안전 환경 만들기', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
                    };
                    const typeBadge = typeBadgeMap[m.type] || { label: '맞춤 미션', bg: 'bg-slate-100 text-slate-800 border-slate-200' };

                    return (
                      <div
                        key={m.missionId || idx}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-slate-500 font-mono">
                              미션 {idx + 1}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${typeBadge.bg}`}>
                              {typeBadge.label}
                            </span>
                          </div>
                          <h5 className="font-bold text-xs text-slate-800 mb-1">
                            {m.title}
                          </h5>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {m.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5-Day Daily Mission Routine Details */}
              <div>
                <h4 className="font-jua text-sm text-slate-800 mb-2.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>5일간 매일 미션 실천 및 학생 작성 기록</span>
                </h4>

                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((day) => {
                    const checkIn = selectedVisitForModal.dailyCheckIns?.find(
                      (c) => c.day === day || (c as any).dayNumber === day
                    );
                    const moodEmojiMap: Record<string, string> = {
                      great: '😊 맑음 (아주 좋았어요)',
                      good: '🙂 평온 (괜찮았어요)',
                      neutral: '😐 보통 (그럭저럭)',
                      tired: '🥱 피곤 (지쳤어요)',
                      stressed: '😣 답답 (힘들었어요)'
                    };

                    if (checkIn && checkIn.completed) {
                      const completedItems = checkIn.items?.filter((it) => it.completed) || [];
                      const isAllDone = checkIn.allCompleted || completedItems.length >= 3;

                      return (
                        <div
                          key={day}
                          className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-3.5 transition-all shadow-2xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2 mb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-jua text-sm text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-lg">
                                {day}일차 실천완료 ✅
                              </span>
                              {isAllDone ? (
                                <span className="text-xs font-bold bg-amber-300 text-amber-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                  👑 3개 완벽 실천 올클리어 (+보너스)
                                </span>
                              ) : (
                                <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                                  🎯 {completedItems.length > 0 ? completedItems.length : 1}/3개 실천
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="font-medium text-amber-800 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                                기분: {moodEmojiMap[checkIn.mood || 'good']}
                              </span>
                              <span className="font-mono text-[11px]">
                                {checkIn.completedAt
                                  ? new Date(checkIn.completedAt).toLocaleString('ko-KR')
                                  : checkIn.date}
                              </span>
                            </div>
                          </div>

                          {/* Individual 3 Missions Breakdown & Student Action Notes */}
                          {checkIn.items && checkIn.items.length > 0 ? (
                            <div className="space-y-2 mt-2">
                              <span className="text-[11px] font-bold text-slate-700 block">
                                📋 개별 실천 체크 및 학생 작성 행동:
                              </span>
                              <div className="grid grid-cols-1 gap-1.5">
                                {checkIn.items.map((item, i) => (
                                  <div
                                    key={i}
                                    className={`p-2 rounded-xl text-xs border ${
                                      item.completed
                                        ? 'bg-white border-emerald-200'
                                        : 'bg-slate-50/70 border-slate-200 text-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                        <span>{item.completed ? '✅' : '⚪'}</span>
                                        <span>{item.missionTitle}</span>
                                      </span>
                                      <span
                                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                          item.completed
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-slate-200 text-slate-500'
                                        }`}
                                      >
                                        {item.completed ? '실천완료' : '미실천'}
                                      </span>
                                    </div>
                                    {item.actionNote ? (
                                      <div className="mt-1 pl-5 text-indigo-700 bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100">
                                        <strong className="text-[10px] text-indigo-900 block">
                                          ✍️ 학생이 적은 실천 행동:
                                        </strong>
                                        <p className="font-medium mt-0.5 text-[11.5px]">
                                          "{item.actionNote}"
                                        </p>
                                      </div>
                                    ) : (
                                      item.completed && (
                                        <p className="mt-0.5 pl-5 text-slate-400 text-[10px]">
                                          (기본 체크 완료)
                                        </p>
                                      )
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                              <p className="font-bold text-xs text-slate-700">
                                🎯 실천한 미션: {checkIn.missionTitle}
                              </p>
                              {checkIn.note && (
                                <p className="text-xs text-slate-600 mt-1 font-medium bg-amber-50/50 p-2 rounded-lg">
                                  💭 "{checkIn.note}"
                                </p>
                              )}
                            </div>
                          )}

                          {/* Overall daily note */}
                          {checkIn.note && checkIn.items && checkIn.items.length > 0 && (
                            <div className="mt-2 pt-1.5 border-t border-amber-100 text-xs text-slate-600 flex items-start gap-1">
                              <span className="font-bold text-amber-800 shrink-0">💭 하루 총평:</span>
                              <span className="font-medium">"{checkIn.note}"</span>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={day}
                        className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-3 flex items-center justify-between text-slate-400 text-xs"
                      >
                        <span className="font-bold font-mono">{day}일차 루틴</span>
                        <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                          ⏳ 아직 실천 기록이 없습니다 (대기 중)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5-Day Final Submission Reflection (if submitted/rewarded) */}
              {(selectedVisitForModal.status === 'rewarded' || selectedVisitForModal.status === 'submitted') && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between border-b border-indigo-200/80 pb-2 gap-2">
                    <h5 className="font-jua text-sm text-indigo-950 flex items-center gap-1.5">
                      <span>📝 5일 처방 실천 최종 성찰 및 평가</span>
                    </h5>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span>💊 보건실 실물 마음 약 지급 대상</span>
                      </span>
                      {selectedVisitForModal.bestMissionIndices && selectedVisitForModal.bestMissionIndices.length > 0 ? (
                        <span className="text-xs font-bold bg-indigo-200 text-indigo-900 px-2.5 py-0.5 rounded-full">
                          🏆 BEST: 처방 {selectedVisitForModal.bestMissionIndices.map(i => i + 1).join(', ')}번
                        </span>
                      ) : selectedVisitForModal.bestMissionIndex !== undefined ? (
                        <span className="text-xs font-bold bg-indigo-200 text-indigo-900 px-2.5 py-0.5 rounded-full">
                          🏆 BEST: 처방 {selectedVisitForModal.bestMissionIndex + 1}번
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Participation Rate & Reflection */}
                  {selectedVisitForModal.participationRate !== undefined && (
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-200 space-y-1">
                      <div className="flex items-center justify-between font-bold text-indigo-950">
                        <span>📊 5일 실천 참여율: {selectedVisitForModal.participationRate}%</span>
                        <span className="text-[11px] text-indigo-700">
                          {selectedVisitForModal.dailyCheckIns?.filter(c => c.completed).length || 0}/5일 실천
                        </span>
                      </div>
                      {selectedVisitForModal.reflectionParticipation && (
                        <p className="text-slate-700 font-medium pt-1 border-t border-slate-100">
                          <strong>🌱 참여도에 대한 학생의 자기 성찰:</strong> "{selectedVisitForModal.reflectionParticipation}"
                        </p>
                      )}
                    </div>
                  )}

                  {selectedVisitForModal.reflectionWhy && (
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                      <span className="font-bold text-indigo-900 block mb-0.5">
                        💡 이 처방이 가장 도움이 되었던 이유:
                      </span>
                      <p className="text-slate-700 font-medium">
                        "{selectedVisitForModal.reflectionWhy}"
                      </p>
                    </div>
                  )}

                  {selectedVisitForModal.reflectionLearned && (
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                      <span className="font-bold text-indigo-900 block mb-0.5">
                        🌱 활동을 하며 새롭게 알게 된 내 마음 (느낀 점):
                      </span>
                      <p className="text-slate-700 font-medium">
                        "{selectedVisitForModal.reflectionLearned}"
                      </p>
                    </div>
                  )}

                  {selectedVisitForModal.futurePlan && (
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                      <span className="font-bold text-indigo-900 block mb-0.5">
                        🔮 다음에 비슷한 마음 신호가 켜졌을 때 나의 다짐:
                      </span>
                      <p className="text-slate-700 font-medium">
                        "{selectedVisitForModal.futurePlan}"
                      </p>
                    </div>
                  )}

                  {selectedVisitForModal.willUseAgain && (
                    <div className="text-[11px] text-indigo-800">
                      <strong>재사용 의향:</strong> {selectedVisitForModal.willUseAgain}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                학생이 제출한 기록은 자동으로 실천 인정되며 칭찬쿠키가 지급되었습니다.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPrintWorkbook(selectedVisitForModal.primaryConditionId)}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>실물 워크북 인쇄</span>
                </button>

                {(() => {
                  const isModalGifted = (Date.now() - (recentlyGiftedStudentIds[selectedVisitForModal.studentId] || 0)) < 3000;
                  const modalStudent = students.find((s) => s.id === selectedVisitForModal.studentId);
                  return (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1">
                        <span>🍪</span>
                        <span>잔여 {modalStudent?.cookieBalance ?? 0}개</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleGiftEncouragementCookie(
                            selectedVisitForModal.studentId,
                            selectedVisitForModal.studentName,
                            selectedVisitForModal.primaryConditionName
                          );
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                          isModalGifted
                            ? 'bg-emerald-500 text-white shadow-md scale-105'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                        }`}
                        title="선생님 특별 격려 칭찬쿠키 +1개 선물하기"
                      >
                        <span>{isModalGifted ? '✨' : '🍪'}</span>
                        <span>{isModalGifted ? '쿠키 +1개 선물완료!' : '격려 쿠키 +1개 선물'}</span>
                      </button>
                    </div>
                  );
                })()}

                <button
                  type="button"
                  onClick={() => setSelectedVisitForModal(null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
