import React, { useState, useMemo } from 'react';
import { Student, SchoolClass, CookieLog } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Cookie,
  Award,
  Sparkles,
  Plus,
  Minus,
  Search,
  Download,
  History,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  X,
  FileSpreadsheet,
  TrendingUp,
  Gift,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CookieManagementTabProps {
  students: Student[];
  classes: SchoolClass[];
  selectedGrade: number | 'all';
  selectedClass: number | 'all';
  onStudentsUpdated: () => void;
  showToast?: (message: string, type?: 'success' | 'cookie' | 'info') => void;
  playChimeSound?: () => void;
}

const PRESET_REASONS = [
  '처방 미션 5일 실천 완주 및 워크북 확인',
  '보건실 처방약(간식) 수령 칭찬',
  '사회정서 평가 성실 참여',
  '친구를 배려하고 따뜻한 위로 건네기',
  '수업 집중 및 학급 생활 모범',
  '감정 달력 꾸준한 기록 칭찬'
];

export const CookieManagementTab: React.FC<CookieManagementTabProps> = ({
  students,
  classes,
  selectedGrade: initialGrade,
  selectedClass: initialClass,
  onStudentsUpdated,
  showToast,
  playChimeSound
}) => {
  // Filters & Controls
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>(initialGrade || 'all');
  const [classFilter, setClassFilter] = useState<number | 'all'>(initialClass || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'balance_desc' | 'balance_asc' | 'student_asc' | 'name_asc'>('balance_desc');
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'history'>('students');

  // Modal States
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [isQuickGiftOpen, setIsQuickGiftOpen] = useState<boolean>(false);
  const [quickGiftTarget, setQuickGiftTarget] = useState<Student | null>(null);
  const [giftAmount, setGiftAmount] = useState<number>(1);
  const [giftReason, setGiftReason] = useState<string>(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');

  // Batch Gift Modal
  const [isBatchGiftOpen, setIsBatchGiftOpen] = useState<boolean>(false);
  const [batchSelectedIds, setBatchSelectedIds] = useState<string[]>([]);
  const [batchAmount, setBatchAmount] = useState<number>(1);
  const [batchReason, setBatchReason] = useState<string>(PRESET_REASONS[0]);
  const [batchCustomReason, setBatchCustomReason] = useState<string>('');

  // Logs state
  const [cookieLogs, setCookieLogs] = useState<CookieLog[]>(() => StorageService.getCookieLogs());

  // Reload logs
  const reloadData = () => {
    setCookieLogs(StorageService.getCookieLogs());
    onStudentsUpdated();
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students
      .filter((st) => {
        const matchGrade = gradeFilter === 'all' || st.grade === gradeFilter;
        const matchClass = classFilter === 'all' || st.classNum === classFilter;
        const query = searchQuery.trim().toLowerCase();
        const matchQuery =
          !query ||
          st.name.toLowerCase().includes(query) ||
          `${st.grade}-${st.classNum}-${st.number}`.includes(query) ||
          st.id.toLowerCase().includes(query);
        return matchGrade && matchClass && matchQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'balance_desc') return (b.cookieBalance || 0) - (a.cookieBalance || 0);
        if (sortBy === 'balance_asc') return (a.cookieBalance || 0) - (b.cookieBalance || 0);
        if (sortBy === 'student_asc') {
          if (a.grade !== b.grade) return a.grade - b.grade;
          if (a.classNum !== b.classNum) return a.classNum - b.classNum;
          return a.number - b.number;
        }
        return a.name.localeCompare(b.name, 'ko');
      });
  }, [students, gradeFilter, classFilter, searchQuery, sortBy]);

  // Overall statistics
  const summaryStats = useMemo(() => {
    const totalCirculating = students.reduce((acc, s) => acc + (s.cookieBalance || 0), 0);
    const totalRewarded = cookieLogs
      .filter((l) => l.amount > 0)
      .reduce((acc, l) => acc + l.amount, 0);
    const totalSpent = cookieLogs
      .filter((l) => l.amount < 0)
      .reduce((acc, l) => acc + Math.abs(l.amount), 0);
    
    // Top earner
    const sorted = [...students].sort((a, b) => (b.cookieBalance || 0) - (a.cookieBalance || 0));
    const topStudent = sorted[0];

    return {
      totalCirculating,
      totalRewarded,
      totalSpent,
      totalLogsCount: cookieLogs.length,
      topStudent
    };
  }, [students, cookieLogs]);

  // Map of student stats (total earned & logs count)
  const studentStatsMap = useMemo(() => {
    const map = new Map<
      string,
      { earned: number; spent: number; lastLog?: CookieLog; logsCount: number }
    >();

    cookieLogs.forEach((log) => {
      const current = map.get(log.studentId) || { earned: 0, spent: 0, logsCount: 0 };
      if (log.amount > 0) current.earned += log.amount;
      else current.spent += Math.abs(log.amount);
      current.logsCount += 1;
      if (!current.lastLog) current.lastLog = log; // Since logs are sorted newest first
      map.set(log.studentId, current);
    });

    return map;
  }, [cookieLogs]);

  // Handle individual quick gift
  const handleExecuteGift = () => {
    if (!quickGiftTarget) return;
    const finalReason = customReason.trim() || giftReason;
    if (!finalReason) {
      alert('지급/차감 사유를 입력하거나 선택해주세요.');
      return;
    }

    const updated = StorageService.addCookieLog(quickGiftTarget.id, giftAmount, finalReason);
    if (updated) {
      if (playChimeSound) playChimeSound();
      if (showToast) {
        showToast(
          `🍪 [${quickGiftTarget.name}] 학생에게 칭찬쿠키 ${giftAmount > 0 ? `+${giftAmount}` : giftAmount}개가 지급되었습니다.`,
          'cookie'
        );
      }
      reloadData();
      setIsQuickGiftOpen(false);
      setQuickGiftTarget(null);
      setCustomReason('');
    }
  };

  // Handle batch gift
  const handleExecuteBatchGift = () => {
    if (batchSelectedIds.length === 0) {
      alert('쿠키를 지급할 학생을 최소 1명 이상 선택해주세요.');
      return;
    }
    const finalReason = batchCustomReason.trim() || batchReason;
    if (!finalReason) {
      alert('지급 사유를 입력하거나 선택해주세요.');
      return;
    }

    const { updatedCount } = StorageService.batchAddCookieLogs(
      batchSelectedIds,
      batchAmount,
      finalReason
    );

    if (updatedCount > 0) {
      if (playChimeSound) playChimeSound();
      if (showToast) {
        showToast(
          `🎉 선택한 ${updatedCount}명의 학생에게 칭찬쿠키 +${batchAmount}개가 일괄 지급되었습니다!`,
          'cookie'
        );
      }
      reloadData();
      setIsBatchGiftOpen(false);
      setBatchSelectedIds([]);
      setBatchCustomReason('');
    }
  };

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    try {
      const header = '학번,학년,반,번호,이름,현재_보유쿠키,누적_획득쿠키,누적_사용쿠키,최근_활동일시,최근_지급사유\n';
      const rows = students.map((st) => {
        const stats = studentStatsMap.get(st.id);
        const lastDate = stats?.lastLog ? stats.lastLog.createdAt.slice(0, 10) : '-';
        const lastReason = stats?.lastLog ? `"${stats.lastLog.reason.replace(/"/g, '""')}"` : '-';
        return `${st.id},${st.grade},${st.classNum},${st.number},${st.name},${st.cookieBalance || 0},${stats?.earned || 0},${stats?.spent || 0},${lastDate},${lastReason}`;
      });

      const csvContent = '\uFEFF' + header + rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `학생_칭찬쿠키_보유현황_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('CSV Export Error:', e);
      alert('CSV 파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  // Toggle batch select all
  const handleToggleSelectAll = () => {
    if (batchSelectedIds.length === filteredStudents.length) {
      setBatchSelectedIds([]);
    } else {
      setBatchSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shadow-2xs">
              🍪
            </div>
            <div>
              <h2 className="font-jua text-xl text-slate-800 flex items-center gap-2">
                <span>학생 칭찬쿠키 현황 & 개별 관리</span>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  실시간 연동
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                개별 학생별 칭찬쿠키 잔액과 지급·차감 사유 내역을 상세하게 확인하고 칭찬 쿠키를 수여합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setBatchSelectedIds(filteredStudents.map((s) => s.id));
              setIsBatchGiftOpen(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-jua text-xs rounded-xl shadow-xs hover:from-amber-600 hover:to-yellow-600 transition-all flex items-center gap-1.5"
          >
            <Gift className="w-4 h-4" />
            <span>학급 일괄 쿠키 지급</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white border border-slate-300 text-slate-700 font-jua text-xs rounded-xl hover:bg-slate-50 shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>현황 CSV 다운로드</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">현재 총 순환 쿠키</span>
            <span className="text-lg">🍪</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-jua text-2xl text-amber-950">{summaryStats.totalCirculating}</span>
            <span className="text-xs text-amber-800 font-medium">개</span>
          </div>
          <p className="text-[11px] text-amber-700/80 mt-1">전교 학생 보유 합계</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">누적 지급 칭찬쿠키</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-jua text-2xl text-emerald-950">+{summaryStats.totalRewarded}</span>
            <span className="text-xs text-emerald-800 font-medium">개</span>
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-1">실천 보너스 & 칭찬 총합</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 border border-purple-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800">누적 쿠키 사용(가챠)</span>
            <span className="text-lg">🔮</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-jua text-2xl text-purple-950">-{summaryStats.totalSpent}</span>
            <span className="text-xs text-purple-800 font-medium">개</span>
          </div>
          <p className="text-[11px] text-purple-700/80 mt-1">고민가챠 스티커 등 소모</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 border border-indigo-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800">최다 쿠키 보유 학생</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            {summaryStats.topStudent ? (
              <div className="flex items-baseline gap-1.5">
                <span className="font-jua text-lg text-indigo-950 truncate">
                  {summaryStats.topStudent.name}
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded-full">
                  {summaryStats.topStudent.cookieBalance}🍪
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-jua">-</span>
            )}
          </div>
          <p className="text-[11px] text-indigo-700/80 mt-1">
            {summaryStats.topStudent
              ? `${summaryStats.topStudent.grade}학년 ${summaryStats.topStudent.classNum}반 ${summaryStats.topStudent.number}번`
              : '학생 등록 필요'}
          </p>
        </div>
      </div>

      {/* Sub-tabs & Filter Controls */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
        {/* Sub-tab navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex bg-slate-200/80 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveSubTab('students')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-jua transition-all flex items-center gap-1.5 ${
                activeSubTab === 'students'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>개별 학생별 현황 ({filteredStudents.length}명)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-jua transition-all flex items-center gap-1.5 ${
                activeSubTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>전체 쿠키 지급·차감 타임라인 ({cookieLogs.length}건)</span>
            </button>
          </div>

          <span className="text-xs text-slate-500">
            총 <strong className="text-slate-800">{filteredStudents.length}</strong>명의 학생이 표시 중입니다.
          </span>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Grade Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-bold shrink-0">학년:</span>
            <select
              value={gradeFilter}
              onChange={(e) =>
                setGradeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full text-xs font-jua bg-transparent focus:outline-none text-slate-800 cursor-pointer"
            >
              <option value="all">전체 학년</option>
              {Array.from(new Set(classes.map((c) => c.grade)))
                .sort((a: number, b: number) => a - b)
                .map((g) => (
                  <option key={g} value={g}>
                    {g}학년
                  </option>
                ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-bold shrink-0">학급:</span>
            <select
              value={classFilter}
              onChange={(e) =>
                setClassFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full text-xs font-jua bg-transparent focus:outline-none text-slate-800 cursor-pointer"
            >
              <option value="all">전체 학급</option>
              {classes
                .filter((c) => gradeFilter === 'all' || c.grade === gradeFilter)
                .map((c) => (
                  <option key={`${c.grade}-${c.classNum}`} value={c.classNum}>
                    {c.classNum}반
                  </option>
                ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="학생 이름 또는 학번 검색..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-bold shrink-0">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs font-jua bg-transparent focus:outline-none text-slate-800 cursor-pointer"
            >
              <option value="balance_desc">쿠키 많은 순 (내림차순)</option>
              <option value="balance_asc">쿠키 적은 순 (오름차순)</option>
              <option value="student_asc">학번 순 (1학년 1반 1번~)</option>
              <option value="name_asc">이름 가나다순</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: Individual Students Card & Table */}
      {activeSubTab === 'students' && (
        <div className="space-y-3">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <span className="text-3xl block mb-2">🍪</span>
              <h4 className="font-jua text-sm text-slate-600">조건에 맞는 학생이 없습니다.</h4>
              <p className="text-xs text-slate-400 mt-1">학년 또는 검색 조건을 변경해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStudents.map((st) => {
                const stStats = studentStatsMap.get(st.id);
                const lastLog = stStats?.lastLog;

                return (
                  <div
                    key={st.id}
                    className="bg-white border-2 border-slate-100 hover:border-amber-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      {/* Student Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center font-jua text-base shadow-2xs">
                            {st.number}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-jua text-base text-slate-900">{st.name}</h3>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                {st.grade}-{st.classNum}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              학번: {st.id}
                            </span>
                          </div>
                        </div>

                        {/* Cookie Badge */}
                        <div className="flex flex-col items-end">
                          <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-400 text-white rounded-full shadow-2xs flex items-center gap-1.5 font-jua text-sm">
                            <span>🍪</span>
                            <span className="text-base font-extrabold">{st.cookieBalance || 0}</span>
                            <span className="text-[11px] font-medium">개</span>
                          </div>
                        </div>
                      </div>

                      {/* Cumulative stats row */}
                      <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
                        <div>
                          <span className="text-[10.5px] text-slate-400 block font-medium">누적 획득</span>
                          <span className="font-jua text-emerald-600">
                            +{stStats?.earned || 0}개
                          </span>
                        </div>
                        <div>
                          <span className="text-[10.5px] text-slate-400 block font-medium">누적 소모</span>
                          <span className="font-jua text-purple-600">
                            -{stStats?.spent || 0}개
                          </span>
                        </div>
                      </div>

                      {/* Recent Activity Reason */}
                      <div className="mt-2.5 bg-amber-50/40 border border-amber-100/80 rounded-xl p-2.5 text-xs space-y-0.5">
                        <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                          <History className="w-3 h-3 text-amber-600" />
                          <span>최근 지급 사유:</span>
                        </span>
                        {lastLog ? (
                          <div>
                            <p className="text-[11.5px] text-slate-700 font-medium truncate">
                              {lastLog.reason}
                            </p>
                            <span className="text-[9.5px] text-slate-400">
                              {new Date(lastLog.createdAt).toLocaleDateString('ko-KR', {
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">아직 기록된 내역이 없습니다.</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setQuickGiftTarget(st);
                          setGiftAmount(1);
                          setGiftReason(PRESET_REASONS[0]);
                          setCustomReason('');
                          setIsQuickGiftOpen(true);
                        }}
                        className="flex-1 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-jua text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>쿠키 지급/차감</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedStudentForDetail(st)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-jua text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                      >
                        <History className="w-3.5 h-3.5 text-slate-500" />
                        <span>상세 내역</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: Global Timeline Logs */}
      {activeSubTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <h3 className="font-jua text-sm text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span>실시간 칭찬쿠키 변동 타임라인 로그</span>
            </h3>
            <span className="text-xs text-slate-500">최근 발생한 순서대로 정렬됩니다.</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">일시</th>
                  <th className="py-2.5 px-4">학생</th>
                  <th className="py-2.5 px-4">변동 개수</th>
                  <th className="py-2.5 px-4">지급 및 차감 사유</th>
                  <th className="py-2.5 px-4">변동 후 잔액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cookieLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-400">
                      아직 쿠키 변동 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  cookieLogs.map((log) => {
                    const isPositive = log.amount > 0;
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4 font-jua text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{log.studentName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({log.studentId})
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-jua text-xs ${
                              isPositive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 text-purple-600" />
                            )}
                            <span>
                              {isPositive ? `+${log.amount}` : log.amount} 🍪
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          <span className="bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 inline-block">
                            {log.reason}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-jua text-amber-900 whitespace-nowrap">
                          {log.balanceAfter}🍪
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Individual Student Cookie Detail Drawer/Modal */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border-4 border-white overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner">
                  🍪
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-jua text-lg sm:text-xl">
                      {selectedStudentForDetail.name} 학생의 칭찬쿠키 서랍
                    </h3>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      {selectedStudentForDetail.grade}학년 {selectedStudentForDetail.classNum}반{' '}
                      {selectedStudentForDetail.number}번
                    </span>
                  </div>
                  <p className="text-xs text-white/90 mt-0.5">
                    학번: {selectedStudentForDetail.id} · 현재 보유:{' '}
                    <strong className="underline font-bold">
                      {selectedStudentForDetail.cookieBalance || 0}개
                    </strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForDetail(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Quick Cookie Grant Section inside Student Detail */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-jua text-xs text-amber-900 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-600" />
                    <span>선생님 칭찬 쿠키 즉시 수여하기</span>
                  </h4>
                  <span className="text-[11px] text-amber-700">사유 선택 또는 직접 입력</span>
                </div>

                {/* Amount buttons */}
                <div className="flex gap-1.5">
                  {[1, 2, 3, 5, -1, -3].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setGiftAmount(amt)}
                      className={`flex-1 py-1.5 rounded-xl font-jua text-xs border transition-all ${
                        giftAmount === amt
                          ? amt > 0
                            ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                            : 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                          : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {amt > 0 ? `+${amt}` : amt}
                    </button>
                  ))}
                </div>

                {/* Preset Reason Chips */}
                <div className="flex flex-wrap gap-1">
                  {PRESET_REASONS.map((reason, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setGiftReason(reason);
                        setCustomReason('');
                      }}
                      className={`text-[10px] px-2 py-0.8 rounded-lg border transition-all ${
                        giftReason === reason && !customReason
                          ? 'bg-amber-200 text-amber-950 font-bold border-amber-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                {/* Custom reason input & Action button */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="직접 사유 입력 (예: 복도에서 친구를 도와줌)"
                    className="flex-1 text-xs bg-white border border-amber-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedStudentForDetail) return;
                      const finalReason = customReason.trim() || giftReason;
                      const updated = StorageService.addCookieLog(
                        selectedStudentForDetail.id,
                        giftAmount,
                        finalReason
                      );
                      if (updated) {
                        if (playChimeSound) playChimeSound();
                        if (showToast) {
                          showToast(
                            `🍪 ${selectedStudentForDetail.name} 학생에게 칭찬쿠키 ${giftAmount > 0 ? `+${giftAmount}` : giftAmount}개 지급 완료!`,
                            'cookie'
                          );
                        }
                        setSelectedStudentForDetail(updated);
                        reloadData();
                        setCustomReason('');
                      }
                    }}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-jua text-xs rounded-xl shadow-xs transition-colors shrink-0"
                  >
                    지급 적용
                  </button>
                </div>
              </div>

              {/* Student's Cookie Timeline History */}
              <div className="space-y-2">
                <h4 className="font-jua text-xs text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>개별 쿠키 지급 & 사용 전체 내역 (상세 사유)</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    총 {StorageService.getCookieLogsForStudent(selectedStudentForDetail.id).length}건
                  </span>
                </h4>

                {(() => {
                  const studentLogs = StorageService.getCookieLogsForStudent(
                    selectedStudentForDetail.id
                  );
                  if (studentLogs.length === 0) {
                    return (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">
                          아직 기록된 칭찬쿠키 내역이 없습니다.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {studentLogs.map((log) => {
                        const isPositive = log.amount > 0;
                        return (
                          <div
                            key={log.id}
                            className="p-3 bg-slate-50 hover:bg-amber-50/50 rounded-2xl border border-slate-200/80 transition-all flex items-start justify-between gap-3"
                          >
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                  isPositive
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-purple-100 text-purple-700'
                                }`}
                              >
                                {isPositive ? '+' : '-'}
                              </div>
                              <div>
                                <h5 className="font-jua text-xs text-slate-800 leading-snug">
                                  {log.reason}
                                </h5>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {new Date(log.createdAt).toLocaleString('ko-KR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span
                                className={`font-jua text-xs block ${
                                  isPositive ? 'text-emerald-600' : 'text-purple-600'
                                }`}
                              >
                                {isPositive ? `+${log.amount}` : log.amount} 🍪
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                잔여 {log.balanceAfter}개
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentForDetail(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-jua text-xs rounded-xl transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Quick Gift/Deduct Modal for Single Student */}
      {isQuickGiftOpen && quickGiftTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border-4 border-white space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎁</span>
                <div>
                  <h3 className="font-jua text-base text-slate-800">
                    [{quickGiftTarget.name}] 학생 쿠키 지급/차감
                  </h3>
                  <p className="text-xs text-slate-500">
                    {quickGiftTarget.grade}학년 {quickGiftTarget.classNum}반 {quickGiftTarget.number}번
                    (현재 {quickGiftTarget.cookieBalance || 0}🍪 보유)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsQuickGiftOpen(false);
                  setQuickGiftTarget(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Amount selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">지급/차감 수량:</label>
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 2, 3, 5, -1, -3].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setGiftAmount(amt)}
                    className={`py-2 rounded-xl font-jua text-xs border transition-all ${
                      giftAmount === amt
                        ? amt > 0
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-rose-500 text-white border-rose-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    {amt > 0 ? `+${amt}` : amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">추천 지급 사유 선택:</label>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {PRESET_REASONS.map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setGiftReason(reason);
                      setCustomReason('');
                    }}
                    className={`w-full text-left p-2 rounded-xl border text-xs transition-all ${
                      giftReason === reason && !customReason
                        ? 'bg-amber-50 border-amber-400 font-bold text-amber-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">직접 사유 입력:</label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="사유를 직접 입력하려면 여기에 작성하세요"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsQuickGiftOpen(false);
                  setQuickGiftTarget(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-jua text-xs rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleExecuteGift}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-jua text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1"
              >
                <span>확인 및 지급</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Batch Gift Modal for Multiple Students */}
      {isBatchGiftOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border-4 border-white space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="font-jua text-base text-slate-800">학급 학생 일괄 쿠키 지급</h3>
                  <p className="text-xs text-slate-500">
                    선택한 <strong className="text-amber-600">{batchSelectedIds.length}명</strong>의
                    학생에게 동일한 쿠키와 사유를 한 번에 수여합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchGiftOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select/Deselect All bar */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl text-xs">
              <span className="text-slate-600">
                현재 목록 {filteredStudents.length}명 중 {batchSelectedIds.length}명 선택됨
              </span>
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-amber-800 font-jua hover:underline"
              >
                {batchSelectedIds.length === filteredStudents.length ? '전체 해제' : '전체 선택'}
              </button>
            </div>

            {/* Students Chips preview */}
            <div className="max-h-28 overflow-y-auto p-2 bg-slate-50/50 border border-slate-200 rounded-xl flex flex-wrap gap-1">
              {filteredStudents.map((st) => {
                const isSelected = batchSelectedIds.includes(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setBatchSelectedIds(batchSelectedIds.filter((id) => id !== st.id));
                      } else {
                        setBatchSelectedIds([...batchSelectedIds, st.id]);
                      }
                    }}
                    className={`text-[11px] px-2 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>{st.name}</span>
                    <span className="text-[9px] text-slate-400">({st.number}번)</span>
                  </button>
                );
              })}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">일괄 지급 수량:</label>
              <div className="flex gap-2">
                {[1, 2, 3, 5].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBatchAmount(amt)}
                    className={`flex-1 py-2 rounded-xl font-jua text-xs border transition-all ${
                      batchAmount === amt
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    +{amt} 쿠키
                  </button>
                ))}
              </div>
            </div>

            {/* Preset reasons */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">지급 사유:</label>
              <select
                value={batchReason}
                onChange={(e) => {
                  setBatchReason(e.target.value);
                  setBatchCustomReason('');
                }}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                {PRESET_REASONS.map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Reason */}
            <div>
              <input
                type="text"
                value={batchCustomReason}
                onChange={(e) => setBatchCustomReason(e.target.value)}
                placeholder="또는 직접 사유 입력 (예: 학급 전체 마음약국 성실 참여 칭찬)"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBatchGiftOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-jua text-xs rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchGift}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-jua text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>선택 {batchSelectedIds.length}명 일괄 지급</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
