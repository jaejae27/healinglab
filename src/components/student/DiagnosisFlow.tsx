import React, { useState, useMemo, useEffect } from 'react';
import { Student, CategoryId, VirtualCondition, Visit, ActiveMission } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { CHECK_ITEMS } from '../../data/checkQuestions';
import { StorageService } from '../../services/storage';
import { HealyCharacter } from '../character/HealyCharacter';
import { parseMissionExamples } from '../../utils/missionSuggestions';
import {
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Printer,
  RefreshCw,
  Check
} from 'lucide-react';

interface DiagnosisFlowProps {
  student: Student;
  onFinish: (visit: Visit) => void;
  onCancel: () => void;
  onOpenNewMedicine: () => void;
  onViewWorkbookPrint: (conditionId: string) => void;
}

export const DiagnosisFlow: React.FC<DiagnosisFlowProps> = ({
  student,
  onFinish,
  onCancel,
  onOpenNewMedicine,
  onViewWorkbookPrint
}) => {
  const [step, setStep] = useState<'category' | 'checklist' | 'recommendation' | 'prescribed'>('category');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('study');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // Selection
  const [primaryConditionId, setPrimaryConditionId] = useState<string>('');
  const [secondaryConditionIds, setSecondaryConditionIds] = useState<string[]>([]);
  const [selectedMissionIds, setSelectedMissionIds] = useState<string[]>([]);
  const [shuffleOffset, setShuffleOffset] = useState<number>(0);
  const [issuedVisit, setIssuedVisit] = useState<Visit | null>(null);

  const conditions = useMemo(() => StorageService.getConditions(), []);
  const allVisits = useMemo(() => StorageService.getVisitsForStudent(student.id), [student.id]);
  const activeVisit = useMemo(() => StorageService.getActiveVisitForStudent(student.id), [student.id]);

  // Questions for chosen category
  const categoryQuestions = useMemo(() => {
    return CHECK_ITEMS.filter((item) => item.categoryId === selectedCategory);
  }, [selectedCategory]);

  // Calculate recommendation ranking based on weights
  const recommendedConditions = useMemo(() => {
    const scores: Record<string, number> = {};

    // Initialize all conditions in category with base score
    conditions
      .filter((c) => c.categoryId === selectedCategory && c.status === 'active')
      .forEach((c) => {
        scores[c.conditionId] = 0;
      });

    // Add weights from checked items
    categoryQuestions.forEach((q) => {
      if (checkedItems[q.checkId]) {
        q.matches.forEach((m) => {
          scores[m.conditionId] = (scores[m.conditionId] || 0) + m.weight;
        });
      }
    });

    // Sort descending by score
    const sorted = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => conditions.find((c) => c.conditionId === id))
      .filter(Boolean) as VirtualCondition[];

    // Return top 3~4
    return sorted.slice(0, 4);
  }, [selectedCategory, checkedItems, conditions, categoryQuestions]);

  // Selected primary condition object
  const selectedPrimaryCond = useMemo(() => {
    return conditions.find((c) => c.conditionId === primaryConditionId);
  }, [conditions, primaryConditionId]);

  // Candidate missions pool for selected primary condition (with shuffle support)
  const candidateMissions = useMemo(() => {
    if (!selectedPrimaryCond || !selectedPrimaryCond.prescriptionCandidates) return [];
    const pool = selectedPrimaryCond.prescriptionCandidates;
    if (pool.length <= 3) return pool;
    const offset = shuffleOffset % pool.length;
    return [...pool.slice(offset), ...pool.slice(0, offset)];
  }, [selectedPrimaryCond, shuffleOffset]);

  // When primary condition changes, pre-select the first 3 candidate missions
  useEffect(() => {
    if (selectedPrimaryCond && selectedPrimaryCond.prescriptionCandidates?.length > 0) {
      setSelectedMissionIds(selectedPrimaryCond.prescriptionCandidates.slice(0, 3).map((c) => c.id));
      setShuffleOffset(0);
    }
  }, [primaryConditionId]);

  // Prior visit info for the primary condition
  const previousVisitWithCondition = useMemo(() => {
    if (!primaryConditionId) return null;
    return allVisits.find((v) => v.primaryConditionId === primaryConditionId && v.submittedAt);
  }, [primaryConditionId, allVisits]);

  // Handle Step 2 Checklist Next
  const handleChecklistNext = () => {
    if (recommendedConditions.length > 0) {
      const firstCond = recommendedConditions[0];
      setPrimaryConditionId(firstCond.conditionId);
      if (firstCond.prescriptionCandidates?.length > 0) {
        setSelectedMissionIds(firstCond.prescriptionCandidates.slice(0, 3).map((c) => c.id));
      }
    }
    setStep('recommendation');
  };

  // Toggle secondary empathy condition (up to 2)
  const toggleSecondary = (condId: string) => {
    if (condId === primaryConditionId) return;
    if (secondaryConditionIds.includes(condId)) {
      setSecondaryConditionIds(secondaryConditionIds.filter((id) => id !== condId));
    } else {
      if (secondaryConditionIds.length >= 2) {
        alert('보조 공감 마음신호는 최대 2개까지 선택할 수 있어요!');
        return;
      }
      setSecondaryConditionIds([...secondaryConditionIds, condId]);
    }
  };

  // Toggle mission selection
  const toggleMissionSelection = (missionId: string) => {
    if (selectedMissionIds.includes(missionId)) {
      setSelectedMissionIds(selectedMissionIds.filter((id) => id !== missionId));
    } else {
      if (selectedMissionIds.length >= 3) {
        // Replace the 3rd one if already 3 selected
        setSelectedMissionIds([selectedMissionIds[0], selectedMissionIds[1], missionId]);
      } else {
        setSelectedMissionIds([...selectedMissionIds, missionId]);
      }
    }
  };

  // Shuffle candidate missions
  const handleShuffleMissions = () => {
    setShuffleOffset((prev) => prev + 2);
  };

  // Issue prescription
  const handleIssuePrescription = () => {
    if (!selectedPrimaryCond) return;

    const candidates = selectedPrimaryCond.prescriptionCandidates || [];
    let chosen = candidates.filter((c) => selectedMissionIds.includes(c.id));
    if (chosen.length < 3) {
      const rest = candidates.filter((c) => !selectedMissionIds.includes(c.id));
      chosen = [...chosen, ...rest].slice(0, 3);
    }

    const selectedMissions: ActiveMission[] = chosen.map((c) => ({
      missionId: c.id,
      type: c.type,
      title: c.title,
      description: c.description,
      completed: false
    }));

    const newVisit: Visit = {
      visitId: `V-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      classNum: student.classNum,
      number: student.number,
      createdAt: new Date().toISOString(),
      status: 'prescribed',
      categoryId: selectedCategory,
      primaryConditionId: selectedPrimaryCond.conditionId,
      primaryConditionName: selectedPrimaryCond.name,
      secondaryConditionIds: secondaryConditionIds,
      missions: selectedMissions,
      isRepeat: !!previousVisitWithCondition,
      previousEffectiveMission: previousVisitWithCondition?.reflectionWhy
    };

    StorageService.createVisit(newVisit);
    setIssuedVisit(newVisit);
    setStep('prescribed');
  };

  // Diagnosis Flow Guard: if an active visit already exists, block new diagnosis
  if (activeVisit && step !== 'prescribed') {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center space-y-4">
        <div className="bg-white/90 rounded-[36px] border-4 border-white p-6 shadow-xl space-y-4">
          <HealyCharacter
            emotion="thinking"
            size="sm"
            dialogue="현재 실천 중인 처방전이 있어요!"
            subDialogue={`[${activeVisit.primaryConditionId}] ${activeVisit.primaryConditionName} 5일 루틴을 먼저 완료해보자.`}
          />
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed text-left space-y-1">
            <p className="font-bold flex items-center gap-1">
              <span>📌 안내:</span>
              <span>한 번에 하나의 마음신호에 집중해요</span>
            </p>
            <p className="text-slate-600">
              마음 건강을 위해 5일 동안 매일 3가지 미션을 꾸준히 실천하고 최종 성찰을 완료한 뒤 새로운 진료를 받을 수 있어요.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-jua text-sm py-3 rounded-2xl shadow-md transition-transform active:scale-95"
          >
            홈으로 돌아가서 미션 실천하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24">
      {/* Top back button */}
      {step !== 'prescribed' && (
        <button
          onClick={() => {
            if (step === 'recommendation') setStep('checklist');
            else if (step === 'checklist') setStep('category');
            else onCancel();
          }}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-medium mb-3 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{step === 'category' ? '홈으로 돌아가기' : '이전 단계'}</span>
        </button>
      )}

      {/* STEP 1: Choose Category */}
      {step === 'category' && (
        <div className="space-y-4">
          <div className="bg-white/85 border-4 border-white rounded-[36px] p-5 shadow-lg text-center">
            <HealyCharacter
              emotion="welcome"
              size="sm"
              dialogue="오늘은 어떤 일 때문에 마음이 조금 복잡해?"
              subDialogue="가장 가까운 영역 1가지를 골라봐!"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCheckedItems({});
                  setStep('checklist');
                }}
                style={{ borderColor: '#FFFFFF', backgroundColor: cat.bgLight }}
                className="p-4 rounded-[28px] border-4 text-left hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl drop-shadow-xs">{cat.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-[#5A5A40] border border-white">
                    {cat.code} 영역
                  </span>
                </div>
                <div>
                  <h3 className="font-jua text-base text-[#5A5A40]">{cat.name}</h3>
                  <p className="text-[11px] text-[#5A5A40]/70 font-medium line-clamp-1">{cat.subName}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3.5 bg-white/70 border-2 border-white rounded-2xl text-center shadow-2xs">
            <p className="text-xs text-[#5A5A40]/80 font-medium">
              💡 힐링약국의 마음신호는 실제 질병 진단이 아닙니다. 지금 내 마음을 편안하게 알아차려보는 활동입니다.
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: State Checklist */}
      {step === 'checklist' && (
        <div className="space-y-4">
          <div className="bg-white/85 border-4 border-white rounded-[36px] p-5 shadow-lg text-center">
            <HealyCharacter
              emotion="thinking"
              size="sm"
              dialogue="지금 내 마음에 해당하는 신호들을 가볍게 체크해줘!"
              subDialogue="솔직하게 느낀 대로 체크하면 돼."
            />
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-[36px] border-4 border-white p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b-2 border-[#5A5A40]/10">
              <span className="text-xl">
                {CATEGORIES.find((c) => c.id === selectedCategory)?.icon}
              </span>
              <span className="font-jua text-base text-[#5A5A40]">
                {CATEGORIES.find((c) => c.id === selectedCategory)?.name} 체크리스트
              </span>
            </div>

            <div className="space-y-2">
              {categoryQuestions.map((q) => {
                const isChecked = !!checkedItems[q.checkId];
                return (
                  <label
                    key={q.checkId}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-[#FFFBEB] border-amber-300 text-[#854D0E] font-bold shadow-xs'
                        : 'bg-[#FDFCF0] border-white text-[#4A4A4A] hover:bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        setCheckedItems({
                          ...checkedItems,
                          [q.checkId]: e.target.checked
                        });
                      }}
                      className="mt-0.5 rounded text-[#D97706] focus:ring-amber-400 w-4 h-4 accent-[#D97706]"
                    />
                    <span className="text-xs leading-relaxed break-keep font-medium">{q.statement}</span>
                  </label>
                );
              })}
            </div>

            <button
              onClick={handleChecklistNext}
              className="w-full mt-5 bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 hover:from-amber-500 hover:to-pink-600 text-white font-jua text-base py-3.5 rounded-2xl shadow-lg border-2 border-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <span>가까운 마음신호 찾아보기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Recommended Symptoms */}
      {step === 'recommendation' && (
        <div className="space-y-4">
          <div className="bg-white/85 border-4 border-white rounded-[36px] p-5 shadow-lg text-center">
            <HealyCharacter
              emotion="cheering"
              size="sm"
              dialogue="지금 네 마음에서 발견된 신호들이야!"
              subDialogue="정답은 없어. 지금 나와 가장 비슷한 것을 골라봐."
            />
          </div>

          <div className="text-center">
            <span className="inline-block bg-[#FEF08A] text-[#854D0E] text-xs font-bold px-4 py-1.5 rounded-full border border-white shadow-2xs font-jua">
              🔍 지금 내 마음과 가까운 마음신호
            </span>
          </div>

          <div className="space-y-3">
            {recommendedConditions.map((cond, index) => {
              const isPrimary = primaryConditionId === cond.conditionId;
              const isSecondary = secondaryConditionIds.includes(cond.conditionId);
              const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '✨';

              return (
                <div
                  key={cond.conditionId}
                  className={`rounded-[28px] border-4 p-4 transition-all shadow-lg ${
                    isPrimary
                      ? 'bg-[#FFFBEB] border-white ring-4 ring-amber-300/70'
                      : isSecondary
                      ? 'bg-[#F0FDFA] border-white ring-2 ring-teal-200'
                      : 'bg-white/85 border-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{rankEmoji}</span>
                      <span className="text-xs font-mono font-bold text-[#5A5A40]/70 bg-white/80 px-2.5 py-0.5 rounded-full border border-white">
                        {cond.conditionId}
                      </span>
                      {cond.isStudentProposed && (
                        <span className="text-[10px] font-bold text-[#7C3AED] bg-[#FAF5FF] px-2 py-0.5 rounded-full border border-purple-200">
                          🆕 학생 제안
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-jua text-lg text-[#5A5A40] mt-1.5">{cond.name}</h4>
                  <p className="text-xs text-[#5A5A40]/80 mt-0.5 break-keep font-medium">
                    "{cond.summary}"
                  </p>

                  {/* Buttons */}
                  <div className="mt-3 pt-2.5 border-t-2 border-[#5A5A40]/10 flex items-center gap-2">
                    <button
                      onClick={() => setPrimaryConditionId(cond.conditionId)}
                      className={`flex-1 text-xs py-2.5 rounded-2xl font-jua transition-all flex items-center justify-center gap-1 border border-white ${
                        isPrimary
                          ? 'bg-[#D97706] text-white shadow-sm'
                          : 'bg-[#FEF08A]/70 hover:bg-[#FEF08A] text-[#854D0E]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isPrimary ? '대표 마음신호 선택됨' : '이거 완전 나야 (대표)'}</span>
                    </button>

                    {!isPrimary && (
                      <button
                        onClick={() => toggleSecondary(cond.conditionId)}
                        className={`text-xs px-3 py-2.5 rounded-2xl font-bold transition-all border border-white ${
                          isSecondary
                            ? 'bg-[#99F6E4] text-[#0D9488]'
                            : 'bg-white/70 hover:bg-white text-[#5A5A40]/70'
                        }`}
                        title="보조 공감 마음신호 추가 (최대 2개)"
                      >
                        ⭐ {isSecondary ? '공감 중' : '나도 그래'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tailored Missions Selection & Refresh */}
          {selectedPrimaryCond && (
            <div className="bg-white/95 rounded-[32px] border-4 border-white p-4 shadow-xl space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-jua text-sm text-slate-800 flex items-center gap-1.5">
                    <span>🎯 맞춤형 미니 실천 미션 3가지 선택</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    마음신호에 딱 맞는 실천 미션 3개를 골라보세요.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleShuffleMissions}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 flex items-center gap-1 transition-all active:scale-95 shrink-0"
                  title="다른 맞춤 미션 추천 보기"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                  <span>새로고침</span>
                </button>
              </div>

              {/* Status counter pill */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <span className="text-slate-600 font-medium">선택된 미션 수</span>
                <span className={`font-jua px-2 py-0.5 rounded-full text-xs ${
                  selectedMissionIds.length === 3
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedMissionIds.length} / 3개 {selectedMissionIds.length === 3 ? '✓ 완료' : '(3개 필요)'}
                </span>
              </div>

              {/* Candidate Cards */}
              <div className="space-y-2">
                {candidateMissions.slice(0, 5).map((m) => {
                  const isSelected = selectedMissionIds.includes(m.id);
                  const typeLabel =
                    m.type === 'notice'
                      ? '👀 알아차리기'
                      : m.type === 'action'
                      ? '⚡ 행동 실천'
                      : '🌿 환경 & 조절';
                  const typeBadgeClass =
                    m.type === 'notice'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : m.type === 'action'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200';

                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleMissionSelection(m.id)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50/90 border-amber-400 shadow-xs ring-2 ring-amber-300/40'
                          : 'bg-white border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMissionSelection(m.id);
                          }}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-amber-500 border-amber-600 text-white shadow-2xs'
                              : 'bg-white border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${typeBadgeClass}`}>
                              {typeLabel}
                            </span>
                            <h5 className="font-jua text-xs text-slate-800 truncate">
                              {m.title}
                            </h5>
                          </div>
                          {(() => {
                            const parsed = parseMissionExamples(m.description, m.title);
                            return (
                              <div className="space-y-1.5">
                                <p className="text-[11px] text-slate-600 leading-relaxed break-keep">
                                  {parsed.mainText}
                                </p>
                                {parsed.examples.length > 0 && (
                                  <div className="pt-1 border-t border-slate-100 flex flex-wrap items-center gap-1">
                                    <span className="text-[9.5px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                                      💡 추천 예시:
                                    </span>
                                    {parsed.examples.map((ex, i) => (
                                      <span
                                        key={i}
                                        className="text-[9.5px] text-slate-700 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200"
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
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedMissionIds.length < 3 && (
                <p className="text-center text-[11px] text-rose-500 font-bold animate-pulse">
                  ⚠️ 실천할 미션을 {3 - selectedMissionIds.length}개 더 선택해주세요!
                </p>
              )}
            </div>
          )}

          {/* Repeat visit helpful hint */}
          {previousVisitWithCondition && (
            <div className="p-3.5 bg-[#EFF6FF] border-2 border-white rounded-2xl text-xs text-[#1E40AF] shadow-2xs">
              <span className="font-bold">💡 이전 진료 팁: </span>
              지난번 이 마음신호에서 가장 도움이 되었던 처방은{' '}
              <span className="font-bold underline">
                {previousVisitWithCondition.reflectionWhy || '5분 미니 행동 실천'}
              </span>
              이었어요!
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleIssuePrescription}
              disabled={!primaryConditionId || selectedMissionIds.length !== 3}
              className="w-full bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 hover:from-amber-500 hover:to-pink-600 text-white font-jua text-base py-3.5 rounded-2xl shadow-xl border-2 border-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5 text-amber-100" />
              <span>
                {selectedMissionIds.length === 3
                  ? '선택한 3가지 맞춤 미션으로 처방전 발급받기'
                  : `미션 3가지를 선택해주세요 (${selectedMissionIds.length}/3)`}
              </span>
            </button>

            {/* New Medicine Lab Trigger */}
            <button
              onClick={onOpenNewMedicine}
              className="w-full text-xs text-[#5A5A40]/80 hover:text-[#5A5A40] bg-white/70 hover:bg-white border-2 border-dashed border-[#5A5A40]/20 py-3 rounded-2xl font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>🔬 내 마음신호는 여기에 없어요 (신약개발소 제안)</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Prescription Issued & Physical Workbook Guidance */}
      {step === 'prescribed' && issuedVisit && (
        <div className="space-y-4">
          <div className="bg-white/85 border-4 border-white rounded-[36px] p-5 shadow-lg text-center">
            <HealyCharacter
              emotion="celebrate"
              size="sm"
              dialogue="💊 처방전이 발급되었어! 정말 잘했어."
              subDialogue="교실 힐링약국 서류함에서 워크북을 가져가봐!"
            />
          </div>

          {/* Physical Workbook Banner */}
          <div className="bg-gradient-to-r from-[#FEF08A] to-[#FDE047] text-[#5A5A40] rounded-[32px] border-4 border-white p-5 shadow-xl text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-[#854D0E]">
              교실 실물 워크북 연결 번호
            </p>
            <h3 className="font-jua text-2xl mt-0.5 tracking-wide text-[#5A5A40]">
              {issuedVisit.primaryConditionId} 처방전
            </h3>
            <p className="text-xs font-medium mt-1 text-[#5A5A40]/90 break-keep">
              교실 뒤편 힐링약국 서류함({issuedVisit.primaryConditionId[0]} 영역)에서{' '}
              <span className="font-bold underline">{issuedVisit.primaryConditionName}</span>{' '}
              워크북을 1장 챙겨가세요!
            </p>

            <button
              onClick={() => onViewWorkbookPrint(issuedVisit.primaryConditionId)}
              className="mt-3 inline-flex items-center gap-1.5 bg-white text-[#5A5A40] text-xs font-jua px-4 py-2 rounded-2xl shadow-sm border border-white hover:bg-amber-50"
            >
              <Printer className="w-4 h-4 text-[#D97706]" />
              <span>실물 워크북 양식 미리보기</span>
            </button>
          </div>

          {/* 3 Action Missions */}
          <div className="bg-white/90 backdrop-blur-md rounded-[36px] border-4 border-white p-5 shadow-xl">
            <h4 className="font-jua text-base text-[#5A5A40] mb-3 flex items-center gap-1.5">
              <span>💊 이번에 실천해볼 3가지 행동 처방</span>
            </h4>

            <div className="space-y-2.5">
              {issuedVisit.missions.map((m, idx) => (
                <div
                  key={m.missionId}
                  className="p-3.5 bg-[#FDFCF0] border-2 border-white rounded-2xl shadow-2xs"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-[#FFEDD5] text-[#D97706] font-jua text-xs flex items-center justify-center border border-white">
                      {idx + 1}
                    </span>
                    <span className="font-jua text-sm text-[#5A5A40]">{m.title}</span>
                    <span className="text-[10px] text-[#5A5A40]/70 font-bold bg-white px-2 py-0.5 rounded-full border border-white ml-auto">
                      {m.type === 'notice'
                        ? '① 알아차리기'
                        : m.type === 'action'
                        ? '② 행동해보기'
                        : '③ 환경·자기조절'}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A5A40]/80 font-medium pl-8 break-keep leading-relaxed">
                    {m.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#5A5A40]/10 text-center">
              <p className="text-[11px] text-[#5A5A40]/70 break-keep font-medium">
                실제 학교생활과 일상에서 미션을 해보고 난 뒤, 언제든지 홈의{' '}
                <span className="font-bold text-[#0D9488]">[✅ 처방 다했어요]</span>에서 효과를
                기록하면 처방약(간식+조언카드)을 받을 수 있어요!
              </p>
            </div>

            <button
              onClick={() => onFinish(issuedVisit)}
              className="w-full mt-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-jua text-base py-3.5 rounded-2xl shadow-lg border-2 border-white transition-transform active:scale-95"
            >
              확인했어요! 홈으로 이동
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
