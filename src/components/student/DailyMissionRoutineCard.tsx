import React, { useState, useEffect } from 'react';
import { Visit, Student, DailyMissionCheckIn, MissionItemCheck } from '../../types';
import {
  Printer,
  ChevronRight,
  CheckCircle,
  Calendar,
  Sparkles,
  Clock,
  Star,
  Flame,
  Edit3,
  X,
  Gift,
  Award,
  AlertCircle,
  Check,
  Lock
} from 'lucide-react';
import { validateMeaningfulText } from '../../utils/koreanName';
import { checkDoneFormEligibility } from '../../utils/doneFormEligibility';
import { StorageService } from '../../services/storage';
import { getActionSuggestionChips, parseMissionExamples } from '../../utils/missionSuggestions';

interface DailyMissionRoutineCardProps {
  visit: Visit;
  student: Student;
  onRecordDailyCheckIn: (
    dayNumber: number,
    missionId: string,
    missionTitle: string,
    note?: string,
    mood?: 'great' | 'good' | 'neutral' | 'tired' | 'stressed',
    items?: MissionItemCheck[]
  ) => void;
  onOpenDoneForm: (visit: Visit) => void;
  onViewWorkbookPrint: (conditionId: string) => void;
}

const MOODS: { key: 'great' | 'good' | 'neutral' | 'tired' | 'stressed'; label: string; emoji: string }[] = [
  { key: 'great', label: '아주좋음', emoji: '🥰' },
  { key: 'good', label: '좋음', emoji: '😊' },
  { key: 'neutral', label: '보통', emoji: '😐' },
  { key: 'tired', label: '지침', emoji: '🥱' },
  { key: 'stressed', label: '복잡함', emoji: '🤯' }
];

const WEEKDAY_NAMES = ['월요일 (1일차)', '화요일 (2일차)', '수요일 (3일차)', '목요일 (4일차)', '금요일 (5일차)'];

interface MissionItemState {
  completed: boolean;
  actionNote: string;
}

export const DailyMissionRoutineCard: React.FC<DailyMissionRoutineCardProps> = ({
  visit,
  student,
  onRecordDailyCheckIn,
  onOpenDoneForm,
  onViewWorkbookPrint
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [dailyNote, setDailyNote] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<'great' | 'good' | 'neutral' | 'tired' | 'stressed'>('good');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [simulatedDays, setSimulatedDays] = useState<number | null>(() =>
    StorageService.getVisitSimulatedDays(visit.visitId)
  );

  // 3-Mission individual states
  const [missionItemsState, setMissionItemsState] = useState<Record<string, MissionItemState>>({});

  const checkIns: DailyMissionCheckIn[] = Array.isArray(visit.dailyCheckIns) ? visit.dailyCheckIns : [];
  const completedDaysCount = checkIns.filter((c) => c.completed).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyCheckedInToday = checkIns.some((c) => c.date === todayStr);

  // Check DoneForm eligibility strictly based on user rules:
  // 1. Must be Day 5 or later
  // 2. Day 5 must have at least 1 completed mission
  const eligibility = checkDoneFormEligibility(visit, simulatedDays);

  const currentDayCheckIn = checkIns.find((c) => c.day === selectedDay);

  // Sync state when day changes or checkIns change
  useEffect(() => {
    const current = checkIns.find((c) => c.day === selectedDay);
    const map: Record<string, MissionItemState> = {};
    visit.missions.forEach((m) => {
      if (current?.items && current.items.length > 0) {
        const found = current.items.find((it) => it.missionId === m.missionId);
        map[m.missionId] = {
          completed: !!found?.completed,
          actionNote: found?.actionNote || ''
        };
      } else if (current) {
        const isMatch = m.missionId === current.missionId;
        map[m.missionId] = {
          completed: isMatch,
          actionNote: isMatch ? current.note || '' : ''
        };
      } else {
        map[m.missionId] = { completed: false, actionNote: '' };
      }
    });
    setMissionItemsState(map);
    setSelectedMood(current?.mood || 'good');
    setDailyNote(current?.note || '');
    setIsEditing(false);
    setValidationError(null);
  }, [selectedDay, visit.visitId, visit.dailyCheckIns]);

  // Toggle single mission check
  const toggleMissionCheck = (missionId: string) => {
    setMissionItemsState((prev) => {
      const current = prev[missionId] || { completed: false, actionNote: '' };
      return {
        ...prev,
        [missionId]: {
          ...current,
          completed: !current.completed
        }
      };
    });
    if (validationError) setValidationError(null);
  };

  // Update single mission action note
  const updateMissionNote = (missionId: string, text: string) => {
    setMissionItemsState((prev) => {
      const current = prev[missionId] || { completed: true, actionNote: '' };
      return {
        ...prev,
        [missionId]: {
          ...current,
          actionNote: text
        }
      };
    });
    if (validationError) setValidationError(null);
  };

  // Start edit mode with existing data
  const handleStartEdit = () => {
    setIsEditing(true);
    setValidationError(null);
  };

  // Count checked missions
  const checkedMissions = visit.missions.filter(
    (m) => missionItemsState[m.missionId]?.completed
  );
  const checkedCount = checkedMissions.length;
  const isAllThreeChecked = checkedCount === 3;

  // Submit check-in or edit
  const handleSaveCheckIn = () => {
    setValidationError(null);

    // Ensure at least 1 mission is checked
    if (checkedCount === 0) {
      setValidationError('오늘 실천한 미션을 최소 1개 이상 체크해주세요!');
      return;
    }

    // For every checked mission, ensure a meaningful action note is written
    for (const m of checkedMissions) {
      const noteText = (missionItemsState[m.missionId]?.actionNote || '').trim();
      if (!noteText) {
        setValidationError(`[${m.title}] 미션을 체크하셨어요! 무엇을 실천했는지 구체적으로 적어주세요.`);
        return;
      }
      const check = validateMeaningfulText(noteText, 3);
      if (!check.valid) {
        setValidationError(
          `[${m.title}] 실천 내용: ${check.reason || '솔직하고 구체적인 내용을 적어주세요 (아무말 입력 방지).'}`
        );
        return;
      }
    }

    // If student wrote a general note, ensure it has meaningful content
    if (dailyNote.trim()) {
      const check = validateMeaningfulText(dailyNote, 3);
      if (!check.valid) {
        setValidationError(check.reason || '솔직한 생각과 소감을 조금 더 적어주세요.');
        return;
      }
    }

    // Check if trying to do a NEW check-in when already checked in today
    if (!currentDayCheckIn && alreadyCheckedInToday) {
      setValidationError('오늘의 마음실천 기록은 이미 완료했어요! 내일 이어서 다음 일차를 기록해주세요.');
      return;
    }

    const items: MissionItemCheck[] = visit.missions.map((m) => ({
      missionId: m.missionId,
      missionTitle: m.title,
      completed: !!missionItemsState[m.missionId]?.completed,
      actionNote: missionItemsState[m.missionId]?.actionNote?.trim() || ''
    }));

    const primaryMission = checkedMissions[0] || visit.missions[0];
    const combinedSummaryNote =
      dailyNote.trim() ||
      checkedMissions
        .map((m) => `[${m.title}] ${missionItemsState[m.missionId]?.actionNote?.trim()}`)
        .join(' / ');

    onRecordDailyCheckIn(
      selectedDay,
      primaryMission.missionId,
      primaryMission.title,
      combinedSummaryNote,
      selectedMood,
      items
    );

    setIsEditing(false);
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-[36px] border-4 border-white p-5 shadow-lg relative overflow-hidden space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#854D0E] bg-[#FEF08A]/90 px-3 py-1 rounded-full border border-white flex items-center gap-1.5 shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>5일 마음신호 실천 루틴 (주말 제외)</span>
          </span>
          <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            {completedDaysCount}/5일 완료
          </span>
        </div>

        {/* Visual Weekly Calendar Button */}
        <button
          type="button"
          onClick={() => setShowCalendarModal(true)}
          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full text-xs font-jua flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
          <span>📅 주간 5일 실천 캘린더</span>
        </button>
      </div>

      {/* Prescription Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">현재 실천 중인 마음신호:</span>
          <span className="text-[11px] font-mono font-bold text-[#5A5A40]/60">
            {visit.primaryConditionId}
          </span>
        </div>
        <h3 className="font-jua text-xl text-[#5A5A40] mt-0.5">
          {visit.primaryConditionName}
        </h3>
      </div>

      {/* 5-Day Progress Circles */}
      <div className="p-3.5 bg-[#FDFCF0] rounded-2xl border-2 border-white space-y-2.5">
        <div className="flex items-center justify-between text-xs font-jua text-[#5A5A40]">
          <span>🌿 주간 5일 실천 트래커</span>
          <span className="text-[11px] font-normal text-slate-500">
            보상: 1회(+1🍪), 3회(+1🍪), 5회(+2🍪)
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5].map((day) => {
            const check = checkIns.find((c) => c.day === day);
            const isDone = !!check?.completed;
            const isSelected = selectedDay === day;
            const weekday = ['월', '화', '수', '목', '금'][day - 1];

            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setSelectedDay(day);
                  setIsEditing(false);
                  setValidationError(null);
                }}
                className={`py-2 px-1 rounded-2xl border-2 flex flex-col items-center justify-center transition-all relative ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50 shadow-sm scale-102 font-bold'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
                    : 'border-slate-100 bg-white text-slate-400'
                }`}
              >
                {/* Milestone gift tags */}
                {day === 1 && (
                  <span className="absolute -top-1.5 -right-1 text-[8.5px] sm:text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded-full border border-amber-300 whitespace-nowrap">
                    +1🍪
                  </span>
                )}
                {day === 3 && (
                  <span className="absolute -top-1.5 -right-1 text-[8.5px] sm:text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded-full border border-amber-300 whitespace-nowrap">
                    +1🍪
                  </span>
                )}
                {day === 5 && (
                  <span className="absolute -top-1.5 -right-1 text-[8.5px] sm:text-[9px] bg-rose-100 text-rose-800 font-bold px-1 rounded-full border border-rose-300 whitespace-nowrap">
                    +2🍪
                  </span>
                )}

                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{weekday}</span>
                <span className="text-xs font-jua mt-0.5 whitespace-nowrap">
                  {isDone ? '✅' : `${day}일`}
                </span>
                {check?.mood && (
                  <span className="text-xs mt-0.5 whitespace-nowrap">
                    {MOODS.find((m) => m.key === check.mood)?.emoji || '😊'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Check-in / Edit Box */}
      <div className="p-4 bg-[#FFFBEB] rounded-2xl border-2 border-white space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-jua text-sm text-[#5A5A40] flex items-center gap-1.5">
            <span>📅 {WEEKDAY_NAMES[selectedDay - 1]} 실천 체크</span>
          </h4>

          {currentDayCheckIn?.completed ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>실천 완료</span>
              </span>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="px-2.5 py-0.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-full text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3 h-3 text-amber-600" />
                  <span>수정하기</span>
                </button>
              )}
            </div>
          ) : (
            <span className="text-[11px] font-bold text-amber-800 bg-amber-200/70 px-2.5 py-0.5 rounded-md">
              실천 후 기록하고 칭찬쿠키 받기
            </span>
          )}
        </div>

        {validationError && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Display completed state when NOT editing */}
        {currentDayCheckIn?.completed && !isEditing ? (
          <div className="bg-white/95 p-4 rounded-2xl border-2 border-emerald-200 text-xs text-slate-700 space-y-3 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {currentDayCheckIn.allCompleted ||
                (currentDayCheckIn.items &&
                  currentDayCheckIn.items.length >= 3 &&
                  currentDayCheckIn.items.every((it) => it.completed)) ? (
                  <span className="text-xs font-jua text-amber-900 bg-gradient-to-r from-amber-100 to-yellow-200 px-3 py-1 rounded-full border border-amber-300 shadow-2xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>👑 3개 맞춤 미션 올클리어! (+완벽 실천 보너스 획득)</span>
                  </span>
                ) : (
                  <span className="text-xs font-jua text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>실천 완료</span>
                  </span>
                )}
              </div>

              <span className="flex items-center gap-1 text-slate-700 font-medium" title={currentDayCheckIn.mood}>
                <span className="text-base">
                  {MOODS.find((m) => m.key === currentDayCheckIn.mood)?.emoji || '😊'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {MOODS.find((m) => m.key === currentDayCheckIn.mood)?.label}
                </span>
              </span>
            </div>

            {/* List of 3 missions and what the student accomplished */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-bold text-slate-500">
                실천한 처방 미션 목록:
              </div>
              {visit.missions.map((m, idx) => {
                const itemCheck = currentDayCheckIn.items?.find(
                  (it) => it.missionId === m.missionId
                );
                const isItemDone =
                  itemCheck !== undefined
                    ? itemCheck.completed
                    : currentDayCheckIn.missionId === m.missionId;
                const actionText = itemCheck?.actionNote || (isItemDone ? currentDayCheckIn.note : '');

                return (
                  <div
                    key={m.missionId}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isItemDone
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-slate-50/70 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                            isItemDone
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isItemDone ? '✓' : idx + 1}
                        </span>
                        <span className={isItemDone ? 'text-slate-800' : 'text-slate-500'}>
                          {m.title}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isItemDone
                            ? 'bg-emerald-200 text-emerald-800'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isItemDone ? '실천완료' : '미실천'}
                      </span>
                    </div>

                    {isItemDone && actionText && (
                      <div className="mt-1.5 pt-1.5 border-t border-emerald-200/60 text-[11px] text-emerald-900 bg-white/70 p-2 rounded-lg">
                        <span className="font-bold text-emerald-800">✍️ 실천 내용: </span>
                        <span>{actionText}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {currentDayCheckIn.note && (
              <div className="text-[11px] text-slate-600 bg-[#FDFCF0] p-2.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700">💭 전체 실천 소감: </span>
                <span>"{currentDayCheckIn.note}"</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
              <span>기록일자: {currentDayCheckIn.date || '오늘'}</span>
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-full transition-colors flex items-center gap-1 text-[11px]"
              >
                <Edit3 className="w-3 h-3 text-amber-700" />
                <span>✏️ 실천 내용 및 미션 수정하기</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form for Recording or Editing */
          <div className="space-y-3.5 text-xs">
            {isEditing && (
              <div className="flex items-center justify-between bg-amber-100/80 px-3 py-1.5 rounded-xl text-amber-900 text-xs font-bold border border-amber-300">
                <span>✏️ {selectedDay}일차 실천 기록을 수정 중입니다</span>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-slate-600 hover:text-slate-900 underline text-[11px]"
                >
                  수정 취소
                </button>
              </div>
            )}

            {/* 3 Missions Checkboxes with Action Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#5A5A40]">
                  오늘 실천한 맞춤 처방 미션을 각각 체크해주세요:
                </label>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                  {checkedCount}/3개 체크됨
                </span>
              </div>

              <div className="space-y-2.5">
                {visit.missions.map((m, idx) => {
                  const isChecked = !!missionItemsState[m.missionId]?.completed;
                  const actionNote = missionItemsState[m.missionId]?.actionNote || '';

                  return (
                    <div
                      key={m.missionId}
                      className={`p-3 rounded-2xl border-2 transition-all ${
                        isChecked
                          ? 'bg-amber-50/90 border-amber-400 shadow-2xs'
                          : 'bg-white/80 border-slate-200 hover:border-amber-200'
                      }`}
                    >
                      {/* Checkbox row */}
                      <button
                        type="button"
                        onClick={() => toggleMissionCheck(m.missionId)}
                        className="w-full flex items-start gap-2.5 text-left group"
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all shrink-0 mt-0.5 ${
                            isChecked
                              ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                              : 'border-slate-300 bg-white group-hover:border-amber-400'
                          }`}
                        >
                          {isChecked ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold">{idx + 1}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded">
                              미션 {idx + 1}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">
                              {m.title}
                            </span>
                          </div>
                          {(() => {
                            const parsed = parseMissionExamples(m.description, m.title);
                            return (
                              <div className="space-y-1">
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                  {parsed.mainText}
                                </p>
                                {parsed.examples.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1">
                                    <span className="text-[9.5px] font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.2 rounded border border-amber-200 shrink-0">
                                      예시:
                                    </span>
                                    {parsed.examples.map((ex, i) => (
                                      <span
                                        key={i}
                                        className="text-[9.5px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200"
                                      >
                                        {ex}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </button>

                      {/* Action Note field if checked */}
                      {isChecked && (
                        <div className="mt-2.5 pt-2.5 border-t border-amber-200/80 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          <label className="block text-[11px] font-bold text-amber-950 flex items-center justify-between">
                            <span>✍️ 무엇을 실천했나요? (내가 한 행동 쓰기)</span>
                            <span className="text-[10px] text-amber-700 font-normal">
                              필수 입력 (3글자 이상)
                            </span>
                          </label>
                          <input
                            type="text"
                            value={actionNote}
                            onChange={(e) => updateMissionNote(m.missionId, e.target.value)}
                            placeholder={`예: ${m.title}을/를 직접 실천했어요`}
                            className="w-full text-xs p-2 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400 text-slate-800"
                          />

                          {/* Quick Action Suggestion Chips */}
                          {(() => {
                            const suggestions = getActionSuggestionChips(m.title, m.description);
                            if (suggestions.length === 0) return null;
                            return (
                              <div className="pt-0.5 space-y-1">
                                <div className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                                  <span>💡 추천 예시 행동 (클릭 시 자동 입력):</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {suggestions.map((chip, chipIdx) => {
                                    const isSelected = actionNote === chip;
                                    return (
                                      <button
                                        key={chipIdx}
                                        type="button"
                                        onClick={() => updateMissionNote(m.missionId, chip)}
                                        className={`text-[10.5px] px-2 py-0.5 rounded-lg border transition-all text-left ${
                                          isSelected
                                            ? 'bg-amber-400 border-amber-500 text-amber-950 font-bold shadow-2xs scale-101'
                                            : 'bg-white hover:bg-amber-100/70 border-amber-200 text-slate-700 hover:text-amber-950'
                                        }`}
                                      >
                                        {chip}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Praise & Bonus alert if all 3 missions are checked */}
            {isAllThreeChecked && (
              <div className="p-3 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl border-2 border-amber-300 flex items-center gap-2.5 shadow-xs animate-in zoom-in-95">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-white flex items-center justify-center shrink-0 shadow-xs text-xl">
                  🎉
                </div>
                <div className="space-y-0.5">
                  <h5 className="font-jua text-xs text-amber-950 flex items-center gap-1">
                    <span>최고예요! 3가지 맞춤 미션을 모두 선택했어요!</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  </h5>
                  <p className="text-[11px] text-amber-800 leading-tight">
                    세 가지 미션을 모두 완벽하게 실천하면 <strong className="underline">완벽 실천 보너스 쿠키(+1🍪)</strong>가 추가로 지급돼요!
                  </p>
                </div>
              </div>
            )}

            {/* Mood selector */}
            <div className="pt-1">
              <label className="block text-[11px] font-bold text-[#5A5A40] mb-1">
                실천 후 내 기분은 어떤가요?
              </label>
              <div className="flex gap-1 sm:gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setSelectedMood(m.key)}
                    className={`flex-1 py-1.5 px-0.5 sm:px-1 rounded-xl border flex flex-col items-center gap-0.5 text-[10px] transition-all min-w-0 ${
                      selectedMood === m.key
                        ? 'bg-white border-amber-400 font-bold text-amber-900 shadow-2xs scale-102'
                        : 'bg-white/60 border-white text-slate-500 hover:bg-white'
                    }`}
                  >
                    <span className="text-base">{m.emoji}</span>
                    <span className="whitespace-nowrap tracking-tight">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional general note */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-[#5A5A40]">
                  오늘의 전체 한 줄 소감 (선택 사항)
                </label>
                {(() => {
                  const todayWorry = StorageService.getTodayWorryChallenge(student.id);
                  if (!todayWorry?.hint) return null;
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        const quote = `[🔮가챠 힌트: "${todayWorry.hint}"]`;
                        if (!dailyNote.includes(todayWorry.hint)) {
                          setDailyNote((prev) => (prev.trim() ? `${quote} ${prev}` : `${quote} `));
                        }
                      }}
                      className="text-[10px] text-purple-700 font-bold bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap"
                    >
                      <span>🔮 오늘 가챠 힌트 인용</span>
                    </button>
                  );
                })()}
              </div>
              <input
                type="text"
                value={dailyNote}
                onChange={(e) => {
                  setDailyNote(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="예: 3가지 행동을 모두 해보니 마음이 훨씬 편안해졌어요!"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300 break-keep"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-jua text-xs rounded-xl transition-colors whitespace-nowrap"
                >
                  수정 취소
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveCheckIn}
                className={`flex-2 py-2.5 sm:py-3 px-2 text-white font-jua text-xs rounded-xl shadow-xs border border-white flex items-center justify-center gap-1.5 transition-all text-center break-keep leading-tight ${
                  isAllThreeChecked
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 ring-2 ring-amber-300'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600'
                }`}
              >
                {isAllThreeChecked ? (
                  <>
                    <Sparkles className="w-4 h-4 fill-white shrink-0" />
                    <span>
                      {isEditing
                        ? `✨ 3개 미션 완벽 실천 내용으로 수정 저장`
                        : `✨ 3개 미션 완벽 실천 완료 (+보너스 1쿠키 받기)`}
                    </span>
                  </>
                ) : (
                  <>
                    <Star className="w-3.5 h-3.5 fill-white shrink-0" />
                    <span>
                      {isEditing
                        ? `${selectedDay}일차 실천 내용 수정 저장`
                        : `${selectedDay}일차 미션 ${checkedCount}개 완료 체크 (+1쿠키)`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Final 5-day Submission Section */}
      <div className="pt-2 border-t-2 border-[#5A5A40]/10 space-y-2">
        {eligibility.canOpen ? (
          <div className="p-3.5 bg-gradient-to-r from-teal-50 via-emerald-50 to-amber-50 rounded-2xl border-2 border-teal-300 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-teal-950 font-jua text-sm">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>🎉 5일차 미션 완료! '처방 다했어요'를 제출할 수 있어요!</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-mono">
                {completedDaysCount}/5일 실천 ({Math.round((completedDaysCount / 5) * 100)}%)
              </span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200 text-xs space-y-1">
              <p className="text-slate-700 font-medium leading-relaxed">
                {completedDaysCount === 5 ? (
                  <span>👑 <strong>5일 올출석 완벽 실천!</strong> 대단한 집중력과 성실함이에요.</span>
                ) : (
                  <span>🌱 5일차 미션을 실천했어요! <strong>{completedDaysCount}일 동안 실천한 소중한 경험</strong>을 바탕으로 최종 소감을 작성할 수 있습니다.</span>
                )}
              </p>
              <p className="text-[11.5px] text-amber-900 font-bold flex items-center gap-1 pt-0.5">
                <span>💊 작성 완료 후 보건실(위클래스)에서 달콤한 '실물 마음 약(간식/비타민)'을 받을 수 있어요!</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenDoneForm(visit)}
              className="w-full py-3 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-800 text-white font-jua text-sm rounded-xl shadow-md border-2 border-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] animate-bounce"
            >
              <span>🎁 처방 다했어요 작성하고 실물 약 받으러 가기</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : eligibility.reason === 'day_5_mission_not_done' ? (
          <div className="p-3.5 bg-amber-50 rounded-2xl border-2 border-amber-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-jua text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>5일차가 되었지만 5일차 미션 실천 기록이 없어요!</span>
            </div>
            <p className="text-amber-800 leading-relaxed font-medium">
              '처방 다했어요'는 <strong>5일차 미션을 최소 1개 이상 실천하고 체크</strong>해야 열립니다. (5일차 미션이 0개이면 열리지 않아요!)
            </p>
            <p className="text-slate-600 text-[11px]">
              오늘 5일차 탭에서 행동 처방을 1개라도 실천하고 아래 [실천 체크 저장하기]를 눌러주세요.
            </p>
            <button
              type="button"
              onClick={() => setSelectedDay(5)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-jua rounded-xl text-xs flex items-center justify-center gap-1 transition-colors shadow-2xs"
            >
              <span>👉 5일차 미션 탭으로 이동하여 실천 체크하기</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-800 font-medium">
              <span className="flex items-center gap-1.5 font-bold font-jua">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>'처방 다했어요'는 5일차에만 열립니다</span>
              </span>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full font-mono">
                현재 {eligibility.daysSince}일차 (D-{eligibility.remainingDays})
              </span>
            </div>

            <p className="text-[11.5px] text-slate-600 leading-snug">
              마음 처방 루틴은 5일 동안 매일 실천하는 습관입니다. <strong>5일차 이전에는 열리지 않으며</strong>, 5일차에 도달하여 5일차 미션을 1개 이상 실천해야 열립니다.
            </p>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (eligibility.daysSince / 5) * 100)}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  StorageService.setVisitSimulatedDays(visit.visitId, 5);
                  setSimulatedDays(5);
                  setSelectedDay(5);
                }}
                className="text-[10.5px] text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 font-bold shrink-0 transition-colors"
                title="체험 및 평가를 위해 5일차로 이동합니다 (5일차 미션 체크는 필수)"
              >
                ⚡ [체험용] 5일차로 이동
              </button>
            </div>
          </div>
        )}

        {/* Workbook print link */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => onViewWorkbookPrint(visit.primaryConditionId)}
            className="text-xs font-jua text-[#5A5A40]/70 hover:text-[#5A5A40] flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#5A5A40]/50" />
            <span>실물 워크북 양식 보기</span>
          </button>
          <span className="text-[10px] text-slate-400">
            매일 작은 실천이 마음의 힘을 키워요 🌱
          </span>
        </div>
      </div>

      {/* Visual Weekly Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 border-2 border-indigo-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <div>
                  <h3 className="font-jua text-base text-slate-900">
                    주간 5일 마음실천 캘린더
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    월요일부터 금요일까지 5일간의 처방 실천 현황을 한눈에 확인해요
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCalendarModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Weekly Milestone Info */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                <span className="block text-[10px] text-amber-700 font-bold">1회차 실천</span>
                <span className="font-jua text-amber-900">+1 칭찬쿠키 🍪</span>
              </div>
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                <span className="block text-[10px] text-amber-700 font-bold">3회차 꾸준</span>
                <span className="font-jua text-amber-900">+1 칭찬쿠키 🍪</span>
              </div>
              <div className="p-2 bg-rose-50 rounded-xl border border-rose-200">
                <span className="block text-[10px] text-rose-700 font-bold">5회 완주</span>
                <span className="font-jua text-rose-900">+2 쿠키 & 제출 👑</span>
              </div>
            </div>

            {/* Calendar Days */}
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5].map((day) => {
                const check = checkIns.find((c) => c.day === day);
                const isDone = !!check?.completed;
                const weekday = ['월요일', '화요일', '수요일', '목요일', '금요일'][day - 1];

                return (
                  <div
                    key={day}
                    onClick={() => {
                      setSelectedDay(day);
                      setShowCalendarModal(false);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-jua text-sm ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDone ? '✓' : `${day}`}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-jua text-xs text-slate-800">
                            {weekday} ({day}일차)
                          </span>
                          {isDone && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-1 ${
                              check.allCompleted
                                ? 'text-amber-800 bg-amber-200'
                                : 'text-emerald-700 bg-emerald-100'
                            }`}>
                              {check.allCompleted ? '👑 3개 올클리어' : `${check.items?.filter(it => it.completed).length || 1}/3개 실천`}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 truncate max-w-[220px]">
                          {isDone
                            ? (check.items && check.items.length > 0
                                ? check.items.filter(it => it.completed).map(it => it.missionTitle).join(', ')
                                : check.missionTitle)
                            : `${visit.missions[0]?.title || '처방 행동 실천'}`}
                        </p>
                        {check?.note && (
                          <p className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-[220px]">
                            💭 "{check.note}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isDone ? (
                        <div className="flex items-center gap-1 text-slate-600">
                          <span className="text-sm">
                            {MOODS.find((m) => m.key === check.mood)?.emoji || '😊'}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700">
                            수정가능
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200/80 px-2 py-1 rounded-md">
                          미실천
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowCalendarModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-jua text-xs rounded-xl transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
