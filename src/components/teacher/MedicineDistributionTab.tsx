import React, { useState, useMemo } from 'react';
import { Visit, Student, SchoolClass } from '../../types';
import { StorageService } from '../../services/storage';
import {
  CheckCircle2,
  Clock,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  Printer,
  Eye,
  AlertCircle,
  Filter,
  Users,
  Award,
  Calendar
} from 'lucide-react';
import { PhysicalMedicineReceiptModal } from '../student/PhysicalMedicineReceiptModal';

interface MedicineDistributionTabProps {
  students: Student[];
  classes: SchoolClass[];
  visits: Visit[];
  selectedGrade: number | 'all';
  selectedClass: number | 'all';
  onGradeChange?: (grade: number | 'all') => void;
  onClassChange?: (classNum: number | 'all') => void;
  onVisitsUpdated: () => void;
  onPrintWorkbook?: (conditionId: string) => void;
  showToast?: (message: string, type?: 'success' | 'cookie' | 'info') => void;
  playChimeSound?: () => void;
}

export const MedicineDistributionTab: React.FC<MedicineDistributionTabProps> = ({
  students,
  classes,
  visits,
  selectedGrade: initialGrade,
  selectedClass: initialClass,
  onGradeChange,
  onClassChange,
  onVisitsUpdated,
  onPrintWorkbook,
  showToast,
  playChimeSound
}) => {
  // Filter state
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>(initialGrade || 'all');
  const [classFilter, setClassFilter] = useState<number | 'all'>(initialClass || 'all');
  const [statusTab, setStatusTab] = useState<'waiting' | 'completed' | 'all'>('waiting');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Multi-select batch checkbox state
  const [selectedVisitIds, setSelectedVisitIds] = useState<string[]>([]);

  // Preview receipt modal
  const [previewVisit, setPreviewVisit] = useState<Visit | null>(null);

  // Eligible visits: Any visit submitted or rewarded (5-day routine completed)
  const eligibleVisits = useMemo(() => {
    return visits.filter(
      (v) => v.submittedAt || v.status === 'submitted' || v.status === 'rewarded'
    );
  }, [visits]);

  // Quick class statistics: count waiting students per class
  const classWaitCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    eligibleVisits.forEach((v) => {
      if (!v.rewardGiven) {
        const key = `${v.grade}-${v.classNum}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [eligibleVisits]);

  // Filtered visits
  const filteredVisits = useMemo(() => {
    return eligibleVisits.filter((v) => {
      // Grade filter
      if (gradeFilter !== 'all' && v.grade !== gradeFilter) return false;
      // Class filter
      if (classFilter !== 'all' && v.classNum !== classFilter) return false;

      // Status tab filter
      if (statusTab === 'waiting' && v.rewardGiven) return false;
      if (statusTab === 'completed' && !v.rewardGiven) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const student = students.find((s) => s.id === v.studentId);
        const cond = StorageService.getConditionById(v.primaryConditionId);
        const medName = v.prescriptionMedicineName || cond?.prescriptionMedicineName || '';

        const matchName = v.studentName.toLowerCase().includes(q);
        const matchCond = v.primaryConditionName.toLowerCase().includes(q);
        const matchMed = medName.toLowerCase().includes(q);
        const matchNumber = `${v.number}번`.includes(q);
        if (!matchName && !matchCond && !matchMed && !matchNumber) return false;
      }

      return true;
    });
  }, [eligibleVisits, gradeFilter, classFilter, statusTab, searchQuery, students]);

  // Waiting counts for badges
  const totalWaitingCount = useMemo(
    () => eligibleVisits.filter((v) => !v.rewardGiven).length,
    [eligibleVisits]
  );
  const totalCompletedCount = useMemo(
    () => eligibleVisits.filter((v) => v.rewardGiven).length,
    [eligibleVisits]
  );

  const currentFilterWaitingCount = useMemo(() => {
    return eligibleVisits.filter((v) => {
      if (gradeFilter !== 'all' && v.grade !== gradeFilter) return false;
      if (classFilter !== 'all' && v.classNum !== classFilter) return false;
      return !v.rewardGiven;
    }).length;
  }, [eligibleVisits, gradeFilter, classFilter]);

  // Single Confirm Handler
  const handleConfirmMedicine = (visitId: string, studentName: string) => {
    const updated = StorageService.confirmPhysicalMedicine(visitId, '선생님');
    if (updated) {
      if (playChimeSound) playChimeSound();
      if (showToast) {
        showToast(
          `🎉 [${studentName}] 학생의 실물 약 수령을 확인했습니다! 학생 화면에 실시간 [수령 완료]로 반영되었습니다.`,
          'cookie'
        );
      }
      onVisitsUpdated();
    }
  };

  // Single Revert Handler
  const handleCancelMedicine = (visitId: string, studentName: string) => {
    const updated = StorageService.cancelPhysicalMedicine(visitId);
    if (updated) {
      if (showToast) {
        showToast(`↩️ [${studentName}] 학생의 수령 상태를 [수령 대기]로 되돌렸습니다.`, 'info');
      }
      onVisitsUpdated();
    }
  };

  // Batch Confirm Handler
  const handleBatchConfirm = (visitIdsToConfirm: string[]) => {
    if (visitIdsToConfirm.length === 0) return;
    StorageService.confirmPhysicalMedicineBatch(visitIdsToConfirm, '선생님');
    setSelectedVisitIds([]);
    if (playChimeSound) playChimeSound();
    if (showToast) {
      showToast(
        `🎉 선택한 ${visitIdsToConfirm.length}명 학생의 실물 약 수령을 일괄 확인 완료했습니다!`,
        'cookie'
      );
    }
    onVisitsUpdated();
  };

  // Confirm all waiting in currently filtered class
  const handleConfirmAllInCurrentClass = () => {
    const waitingIds = filteredVisits.filter((v) => !v.rewardGiven).map((v) => v.visitId);
    if (waitingIds.length === 0) return;
    if (
      !confirm(
        `현재 화면에 표시된 대기 학생 총 ${waitingIds.length}명의 실물 약 수령을 모두 확인 처리하시겠습니까?`
      )
    ) {
      return;
    }
    handleBatchConfirm(waitingIds);
  };

  // Checkbox toggle helpers
  const handleToggleSelectAll = () => {
    const waitingVisitIds = filteredVisits.filter((v) => !v.rewardGiven).map((v) => v.visitId);
    if (selectedVisitIds.length === waitingVisitIds.length && waitingVisitIds.length > 0) {
      setSelectedVisitIds([]);
    } else {
      setSelectedVisitIds(waitingVisitIds);
    }
  };

  const handleToggleSelectOne = (visitId: string) => {
    setSelectedVisitIds((prev) =>
      prev.includes(visitId) ? prev.filter((id) => id !== visitId) : [...prev, visitId]
    );
  };

  const previewStudent = previewVisit
    ? students.find((s) => s.id === previewVisit.studentId) || {
        id: previewVisit.studentId,
        name: previewVisit.studentName,
        grade: previewVisit.grade,
        classNum: previewVisit.classNum,
        number: previewVisit.number,
        cookieBalance: 10,
        createdAt: previewVisit.createdAt
      }
    : null;

  return (
    <div className="space-y-5">
      {/* Top Banner & Title */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-jua text-xl text-slate-800 flex items-center gap-2">
              <span>💊 보건실 실물 마음 약(간식) 수령 관리</span>
            </h2>
            <span className="text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>수령 대기 총 {totalWaitingCount}명</span>
            </span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>수령 완료 {totalCompletedCount}명</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            5일 처방 실천을 완주한 학생들에게 달콤한 실물 마음 약(젤리/비타민/간식)을 지급하고 간편하게
            체크합니다. 여기서 [수령 확인]을 누르면 학생 화면의 수령증에 실시간 직인 도장이 찍힙니다.
          </p>
        </div>

        {/* Real-time Sync Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs text-indigo-900 font-bold shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>학생 화면 실시간 연동 중</span>
        </div>
      </div>

      {/* Class Quick Selection Tabs (반별 확인 버튼 바) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>반별 빠른 필터:</span>
          </div>
          <span className="text-[11px] text-slate-500 font-normal">
            각 학급을 클릭하면 해당 반의 실물약 수령 대기 학생만 즉시 모아봅니다.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* 전체 학급 버튼 */}
          <button
            type="button"
            onClick={() => {
              setGradeFilter('all');
              setClassFilter('all');
              if (onGradeChange) onGradeChange('all');
              if (onClassChange) onClassChange('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-jua transition-all flex items-center gap-1.5 ${
              gradeFilter === 'all' && classFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs scale-102'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <span>전체 학급</span>
            {totalWaitingCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans font-bold ${
                  gradeFilter === 'all' && classFilter === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {totalWaitingCount}
              </span>
            )}
          </button>

          {/* Quick buttons for each Grade-Class */}
          {[1, 2, 3].map((g) => (
            <div key={g} className="flex items-center gap-1 pl-1 border-l border-slate-300">
              {[1, 2, 3, 4, 5].map((c) => {
                const isSelected = gradeFilter === g && classFilter === c;
                const waitCount = classWaitCounts[`${g}-${c}`] || 0;
                return (
                  <button
                    key={`${g}-${c}`}
                    type="button"
                    onClick={() => {
                      setGradeFilter(g);
                      setClassFilter(c);
                      if (onGradeChange) onGradeChange(g);
                      if (onClassChange) onClassChange(c);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-jua transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs scale-102'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>
                      {g}-{c}반
                    </span>
                    {waitCount > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {waitCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Control Bar: Status Tabs, Search, and Batch Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-2xs">
        {/* Status Tabs (대기 vs 완료 vs 전체) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setStatusTab('waiting')}
            className={`px-3 py-1.5 rounded-lg text-xs font-jua transition-all flex items-center gap-1.5 ${
              statusTab === 'waiting'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>수령 대기 (약 수령 전)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans font-bold ${
                statusTab === 'waiting' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {currentFilterWaitingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-jua transition-all flex items-center gap-1.5 ${
              statusTab === 'completed'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>수령 완료 (약 수령 후)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans font-bold ${
                statusTab === 'completed'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {eligibleVisits.filter((v) => {
                if (gradeFilter !== 'all' && v.grade !== gradeFilter) return false;
                if (classFilter !== 'all' && v.classNum !== classFilter) return false;
                return v.rewardGiven;
              }).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-jua transition-all flex items-center gap-1.5 ${
              statusTab === 'all'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>전체 명단</span>
          </button>
        </div>

        {/* Search Input & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="학생 이름, 번호, 처방약 검색..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-48 sm:w-56"
            />
          </div>

          {/* Batch Confirm Selected Button */}
          {selectedVisitIds.length > 0 && (
            <button
              type="button"
              onClick={() => handleBatchConfirm(selectedVisitIds)}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-jua shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>선택 {selectedVisitIds.length}명 일괄 수령 완료</span>
            </button>
          )}

          {/* Confirm All Waiting in Current Class */}
          {currentFilterWaitingCount > 0 && selectedVisitIds.length === 0 && (
            <button
              type="button"
              onClick={handleConfirmAllInCurrentClass}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-jua transition-colors flex items-center gap-1"
              title="현재 필터된 반의 모든 대기 학생을 수령 완료 처리합니다"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {gradeFilter !== 'all' && classFilter !== 'all'
                  ? `${gradeFilter}-${classFilter}반 `
                  : ''}
                대기 {currentFilterWaitingCount}명 전체 수령 확인
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Select All Checkbox bar if there are waiting students */}
      {statusTab !== 'completed' && filteredVisits.filter((v) => !v.rewardGiven).length > 0 && (
        <div className="flex items-center justify-between text-xs px-2 text-slate-600">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={
                selectedVisitIds.length > 0 &&
                selectedVisitIds.length ===
                  filteredVisits.filter((v) => !v.rewardGiven).length
              }
              onChange={handleToggleSelectAll}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-400"
            />
            <span className="font-medium">
              현재 목록 대기 학생 전체 선택 ({selectedVisitIds.length}/
              {filteredVisits.filter((v) => !v.rewardGiven).length}명)
            </span>
          </label>
          <span className="text-[11px] text-slate-400">
            * 체크박스를 누르고 우측 상단 일괄 버튼으로 한 번에 지급할 수 있습니다.
          </span>
        </div>
      )}

      {/* Student List Cards */}
      <div className="space-y-3">
        {filteredVisits.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-slate-400 text-xs space-y-2">
            <div className="text-3xl">💊</div>
            <p className="font-bold text-slate-600 text-sm">
              {statusTab === 'waiting'
                ? '현재 수령 대기 중인 학생이 없습니다.'
                : statusTab === 'completed'
                ? '수령 완료된 내역이 없습니다.'
                : '조건에 해당하는 처방 실천 학생이 없습니다.'}
            </p>
            <p className="text-slate-400">
              {statusTab === 'waiting'
                ? '학생들이 5일 처방을 실천하고 최종 제출하면 이곳에 자동으로 대기 목록이 뜹니다.'
                : '필터 조건을 변경하거나 다른 반을 확인해보세요.'}
            </p>
          </div>
        ) : (
          filteredVisits.map((v) => {
            const isReceived = !!v.rewardGiven;
            const isSelected = selectedVisitIds.includes(v.visitId);
            const conditionMeta = StorageService.getConditionById(v.primaryConditionId);
            const medicineName =
              v.prescriptionMedicineName ||
              conditionMeta?.prescriptionMedicineName ||
              '응원비타민 (달콤한 마음 젤리/캔디)';
            const participation = v.participationRate ?? 100;
            const submittedDateStr = v.submittedAt
              ? new Date(v.submittedAt).toLocaleDateString('ko-KR', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '최근';

            const receivedDateStr = v.rewardGivenAt
              ? new Date(v.rewardGivenAt).toLocaleDateString('ko-KR', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : null;

            return (
              <div
                key={v.visitId}
                className={`border-2 rounded-2xl p-4 transition-all shadow-xs ${
                  isReceived
                    ? 'bg-white border-emerald-200 hover:border-emerald-300'
                    : 'bg-white border-amber-300 hover:border-amber-400 ring-2 ring-amber-100/50'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  {/* Left Column: Student Identity & Medicine Info */}
                  <div className="flex items-start gap-3 flex-1">
                    {/* Multi-select checkbox (only for waiting) */}
                    {!isReceived ? (
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(v.visitId)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-400"
                        />
                      </div>
                    ) : (
                      <div className="pt-1 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Student Name & Number Badge */}
                        <span className="font-jua text-base sm:text-lg text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-xl border border-slate-200">
                          {v.grade}학년 {v.classNum}반 {v.number}번 {v.studentName}
                        </span>

                        {/* Status Badge (수령 전 vs 수령 완료) */}
                        {isReceived ? (
                          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>실물 약 수령 완료</span>
                            {receivedDateStr && (
                              <span className="font-mono text-[10px] text-emerald-700">
                                ({receivedDateStr})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>약 수령 전 (지급 대기)</span>
                          </span>
                        )}

                        {/* Condition Badge */}
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                          [{v.primaryConditionId}] {v.primaryConditionName}
                        </span>

                        {/* 5-day Participation Rate */}
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
                          5일 실천율 {participation}%
                        </span>
                      </div>

                      {/* Prescribed Medicine Highlight Box */}
                      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-amber-900 flex items-center gap-1">
                            <span>🍬</span>
                            <span>지급할 실물 마음 약:</span>
                          </span>
                          <span className="font-jua text-sm text-slate-900">
                            {medicineName}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                          제출일: {submittedDateStr}
                        </span>
                      </div>

                      {/* Student's Reflection preview */}
                      {v.reflectionWhy && (
                        <p className="text-[11.5px] text-slate-600 line-clamp-1 italic">
                          💭 성찰: "{v.reflectionWhy}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Teacher Action Buttons */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {/* View Student Receipt Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewVisit(v)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                      title="학생 화면에서 보여지는 실물 약 수령증을 미리 확인합니다"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>학생 수령증 보기</span>
                    </button>

                    {/* Workbook print link */}
                    {onPrintWorkbook && (
                      <button
                        type="button"
                        onClick={() => onPrintWorkbook(v.primaryConditionId)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        title="해당 마음신호 워크북 인쇄"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    )}

                    {/* Primary Action Button: Confirm vs Cancel */}
                    {!isReceived ? (
                      <button
                        type="button"
                        onClick={() => handleConfirmMedicine(v.visitId, v.studentName)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-jua shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>💊 실물약 지급 완료 (수령 확인)</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>지급 완료됨</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCancelMedicine(v.visitId, v.studentName)}
                          className="px-2 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 rounded-xl text-[11px] font-medium transition-colors"
                          title="실수로 누른 경우 수령 대기로 되돌립니다"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span className="sr-only">수령 취소</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Student Physical Medicine Receipt Modal Preview */}
      {previewVisit && previewStudent && (
        <PhysicalMedicineReceiptModal
          visit={previewVisit}
          student={previewStudent}
          isOpen={!!previewVisit}
          onClose={() => setPreviewVisit(null)}
          onViewWorkbookPrint={onPrintWorkbook}
        />
      )}
    </div>
  );
};
