import React, { useState, useMemo } from 'react';
import { Student, Visit, MissionItemCheck } from '../../types';
import { StorageService } from '../../services/storage';
import { HealyCharacter } from '../character/HealyCharacter';
import { DailyMissionRoutineCard } from './DailyMissionRoutineCard';
import {
  ClipboardCheck,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  Heart,
  Lock
} from 'lucide-react';
import { getKoreanFriendlyGreeting, getKoreanFriendlyCall } from '../../utils/koreanName';
import { checkDoneFormEligibility } from '../../utils/doneFormEligibility';

interface StudentHomeProps {
  student: Student;
  onStartDiagnosis: () => void;
  onOpenDoneForm: (visit: Visit) => void;
  onViewWorkbookPrint: (conditionId: string) => void;
  onOpenNewMedicine?: () => void;
  onOpenPostTest?: () => void;
  onOpenFortune?: () => void;
  onOpenMindCard?: () => void;
  onOpenWorryGacha?: () => void;
  onGoToMyPage?: () => void;
  onStudentUpdated?: () => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  student,
  onStartDiagnosis,
  onOpenDoneForm,
  onViewWorkbookPrint,
  onOpenNewMedicine,
  onOpenPostTest,
  onOpenFortune,
  onOpenMindCard,
  onOpenWorryGacha,
  onGoToMyPage,
  onStudentUpdated
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showActiveVisitNotice, setShowActiveVisitNotice] = useState(false);
  const [doneFormNotice, setDoneFormNotice] = useState<{
    show: boolean;
    type: 'days_not_met' | 'day_5_mission_not_done' | 'no_active_visit';
    daysSince?: number;
    remainingDays?: number;
  } | null>(null);

  const activeVisit = useMemo(
    () => StorageService.getActiveVisitForStudent(student.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [student.id, refreshKey]
  );

  const doneFormEligibility = useMemo(
    () => checkDoneFormEligibility(activeVisit),
    [activeVisit]
  );

  const settings = useMemo(() => StorageService.getSettings(), [refreshKey]);
  const isPostTestPending = settings.postTestActive && !student.postTest?.completed;

  const friendlyGreeting = getKoreanFriendlyGreeting(student.name);
  const friendlyCall = getKoreanFriendlyCall(student.name);

  const handleRecordDailyCheckIn = (
    dayNumber: number,
    missionId: string,
    missionTitle: string,
    note?: string,
    mood?: 'great' | 'good' | 'neutral' | 'tired' | 'stressed',
    items?: MissionItemCheck[]
  ) => {
    if (!activeVisit) return;
    const result = StorageService.recordDailyMissionCheckIn(
      activeVisit.visitId,
      dayNumber,
      missionId,
      missionTitle,
      note,
      mood,
      items
    );

    if (result) {
      if (result.allThreeCompleted) {
        alert(`🎉 대단해요! 오늘 3개의 마음 처방 미션을 모두 완벽하게 실천했어요!\n완벽 실천 보너스 포함 칭찬쿠키 +${result.bonusCookies}개를 획득했어요! 🍪✨`);
      } else if (result.bonusCookies > 0) {
        alert(`🎉 축하합니다! ${dayNumber}일차 달성 보너스로 칭찬쿠키 +${result.bonusCookies}개를 추가로 획득했어요! 🍪`);
      }
    }

    setRefreshKey((k) => k + 1);
    if (onStudentUpdated) onStudentUpdated();
  };

  // Prevent starting diagnosis if active visit is already ongoing
  const handleStartDiagnosisClick = () => {
    if (activeVisit) {
      setShowActiveVisitNotice(true);
    } else {
      onStartDiagnosis();
    }
  };

  // Handle clicking "처방 다했어요"
  const handleDoneFormClick = () => {
    if (!activeVisit) {
      setDoneFormNotice({ show: true, type: 'no_active_visit' });
      return;
    }

    if (!doneFormEligibility.canOpen) {
      if (doneFormEligibility.reason === 'before_day_5') {
        setDoneFormNotice({
          show: true,
          type: 'days_not_met',
          daysSince: doneFormEligibility.daysSince,
          remainingDays: doneFormEligibility.remainingDays
        });
      } else if (doneFormEligibility.reason === 'day_5_mission_not_done') {
        setDoneFormNotice({
          show: true,
          type: 'day_5_mission_not_done',
          daysSince: doneFormEligibility.daysSince,
          remainingDays: 0
        });
      }
      return;
    }

    onOpenDoneForm(activeVisit);
  };

  return (
    <div className="space-y-4">
      {/* Teacher Post-Test Active Callout Banner */}
      {isPostTestPending && (
        <div className="bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 rounded-[28px] p-4 text-white shadow-xl border-4 border-white flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shrink-0">
              📝
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold bg-white text-rose-600 px-2 py-0.5 rounded-full">
                  선생님 알림
                </span>
                <span className="text-xs font-bold text-white/90">보너스 +3쿠키</span>
              </div>
              <h4 className="font-jua text-base sm:text-lg leading-tight mt-0.5">
                사회정서 사후 검사가 시작되었어요!
              </h4>
              <p className="text-xs text-white/90">
                그동안 나의 마음이 얼마나 단단해졌는지 스스로 체크해봐요.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenPostTest}
            className="w-full sm:w-auto px-5 py-2.5 bg-white text-rose-600 font-jua text-sm rounded-xl shadow-md hover:bg-rose-50 transition-all shrink-0 flex items-center justify-center gap-1.5"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>사후 검사 시작하기</span>
          </button>
        </div>
      )}

      {/* Central Healy Mascot Stage */}
      <div className="relative">
        {/* Soft blur glow */}
        <div className="absolute -top-6 -left-6 w-48 h-48 bg-[#D1FAE5] rounded-full filter blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#FFEDD5] rounded-full filter blur-3xl opacity-40 pointer-events-none" />

        {/* Character Stage Card with Korean friendly greeting */}
        <div className="relative z-10 w-full bg-[#FFFBEB] border-4 border-white rounded-[40px] shadow-xl p-5 flex flex-col items-center justify-center text-center">
          <HealyCharacter
            emotion={activeVisit ? 'cheering' : 'welcome'}
            size="md"
            dialogue={
              activeVisit
                ? `안녕 ${friendlyCall}! 지금 [${activeVisit.primaryConditionName}] 마음신호 처방을 실천 중이구나!`
                : `${friendlyGreeting}<br>오늘 네 마음에 켜진 마음신호는 어떤 상태인지 같이 살펴볼까?`
            }
            subDialogue={
              activeVisit
                ? '매일 미션을 실천하고 스탬프를 모아봐! 5일 실천 후 최종 제출할 수 있어 ✨'
                : '마음신호와 맞춤 행동 처방전이 준비되어 있어 💊'
            }
          />

          {/* Quick status pill inside character stage */}
          <div className="mt-3 flex items-center gap-2 bg-white/70 px-4 py-1.5 rounded-full border border-white text-xs font-bold text-[#5A5A40]">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <span>오늘도 스스로 마음을 돌보는 멋진 하루</span>
          </div>
        </div>
      </div>

      {/* Active Prescription Status & 5-Day Daily Routine Tracker */}
      {activeVisit && (
        <DailyMissionRoutineCard
          visit={activeVisit}
          student={student}
          onRecordDailyCheckIn={handleRecordDailyCheckIn}
          onOpenDoneForm={onOpenDoneForm}
          onViewWorkbookPrint={onViewWorkbookPrint}
        />
      )}

      {/* 4 Main Action Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Card 1: 오늘 마음 진료 */}
        <button
          onClick={handleStartDiagnosisClick}
          className="group bg-white/80 hover:bg-[#FDF4FF] border-4 border-white rounded-[32px] p-4 flex flex-col items-center gap-2.5 shadow-lg transform transition-transform hover:scale-102 active:scale-98 text-center"
        >
          <div className="w-14 h-14 bg-[#F5D0FE] rounded-2xl flex items-center justify-center text-3xl shadow-inner">
            🩺
          </div>
          <div>
            <p className="text-base font-black text-[#86198F] font-jua">오늘 마음 진료</p>
            <p className="text-[11px] text-[#86198F]/60 mt-0.5 font-medium">마음신호와 처방 받기</p>
          </div>
        </button>

        {/* Card 2: 처방 다했어요 */}
        <button
          onClick={handleDoneFormClick}
          className="relative group bg-white/80 hover:bg-[#F0FDFA] border-4 border-white rounded-[32px] p-4 flex flex-col items-center gap-2.5 shadow-lg transform transition-transform hover:scale-102 active:scale-98 text-center"
        >
          {activeVisit && !doneFormEligibility.canOpen && (
            <div className="absolute top-2.5 right-2.5">
              {doneFormEligibility.reason === 'before_day_5' ? (
                <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                  🔒 D-{doneFormEligibility.remainingDays}
                </span>
              ) : (
                <span className="text-[9.5px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                  ⚠️ 5일차 미션 필요
                </span>
              )}
            </div>
          )}
          {activeVisit && doneFormEligibility.canOpen && (
            <div className="absolute top-2.5 right-2.5">
              <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                ✨ 작성 가능
              </span>
            </div>
          )}
          <div className="w-14 h-14 bg-[#99F6E4] rounded-2xl flex items-center justify-center text-3xl shadow-inner">
            ✅
          </div>
          <div>
            <p className="text-base font-black text-[#0D9488] font-jua">처방 다했어요</p>
            <p className="text-[11px] text-[#0D9488]/60 mt-0.5 font-medium">실천 성찰 최종 제출</p>
          </div>
        </button>

        {/* Card 3: 나의 마음기록 */}
        <button
          onClick={() => {
            if (onGoToMyPage) onGoToMyPage();
          }}
          className="group bg-white/80 hover:bg-[#FEFCE8] border-4 border-white rounded-[32px] p-4 flex flex-col items-center gap-2.5 shadow-lg transform transition-transform hover:scale-102 active:scale-98 text-center"
        >
          <div className="w-14 h-14 bg-[#FEF08A] rounded-2xl flex items-center justify-center text-3xl shadow-inner">
            📒
          </div>
          <div>
            <p className="text-base font-black text-[#854D0E] font-jua">나의 마음기록</p>
            <p className="text-[11px] text-[#854D0E]/60 mt-0.5 font-medium">지금까지 처방 서랍</p>
          </div>
        </button>

        {/* Card 4: 신약개발소 */}
        <button
          onClick={onOpenNewMedicine}
          className="group bg-white/80 hover:bg-[#FAF5FF] border-4 border-white rounded-[32px] p-4 flex flex-col items-center gap-2.5 shadow-lg transform transition-transform hover:scale-102 active:scale-98 text-center"
        >
          <div className="w-14 h-14 bg-[#E9D5FF] rounded-2xl flex items-center justify-center text-3xl shadow-inner">
            🔬
          </div>
          <div>
            <p className="text-base font-black text-[#7E22CE] font-jua">신약개발소</p>
            <p className="text-[11px] text-[#7E22CE]/70 mt-0.5 font-medium">새 마음신호 제안 (+5🍪)</p>
          </div>
        </button>
      </div>

      {/* Additional 2 Fun Social-Emotional Activities */}
      <div className="pt-2">
        <h4 className="font-jua text-sm text-[#5A5A40] mb-2.5 px-1 flex items-center gap-1.5">
          <span>✨ 힐링약국 따뜻한 즐길 거리</span>
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* Item 1: 마음카드 (타로 뽑기) */}
          <button
            onClick={() => {
              if (onOpenMindCard) onOpenMindCard();
              else if (onOpenFortune) onOpenFortune();
            }}
            className="p-3.5 bg-white/85 hover:bg-[#FAF5FF] border-3 border-white rounded-[28px] text-center shadow-md transition-all hover:scale-102 active:scale-95 flex flex-col items-center gap-1.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-amber-100 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
              🃏
            </div>
            <div>
              <span className="font-jua text-sm text-[#6D28D9] block">마음카드</span>
              <span className="text-[10px] text-[#5A5A40]/70 font-medium">하루 1회 힐링 타로 ✨</span>
            </div>
          </button>

          {/* Item 2: 고민 가챠 */}
          <button
            onClick={onOpenWorryGacha}
            className="p-3.5 bg-white/85 hover:bg-[#FFFBEB] border-3 border-white rounded-[28px] text-center shadow-md transition-all hover:scale-102 active:scale-95 flex flex-col items-center gap-1.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 via-pink-100 to-amber-100 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
              🔮
            </div>
            <div>
              <span className="font-jua text-sm text-[#7C3AED] block">고민 가챠</span>
              <span className="text-[10px] text-[#5A5A40]/70 font-medium">하루 1회 지혜 힌트 💡</span>
            </div>
          </button>
        </div>
      </div>

      {/* Educational Notice Banner */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-center gap-2 text-[#5A5A40]/60 text-[11px] font-bold bg-white/50 px-4 py-2 rounded-full border border-white text-center shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#D1FAE5]" />
          <span>힐링약국의 처방은 일상 속 마음 알아차림을 돕는 교육용 마음신호입니다</span>
        </div>
      </div>

      {/* Modal: Active Prescription Already Ongoing Notice */}
      {showActiveVisitNotice && activeVisit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border-4 border-amber-200 text-center space-y-3.5 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
              🌱
            </div>
            <div>
              <h3 className="font-jua text-lg text-slate-800">
                현재 실천 중인 처방이 있어요!
              </h3>
              <div className="my-2 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-bold">
                [{activeVisit.primaryConditionId}] {activeVisit.primaryConditionName}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                마음 돌봄은 5일간 꾸준히 행동을 실천할 때 효과가 나타나요.<br />
                진행 중인 처방 루틴을 모두 마치고 최종 제출한 후 새로운 마음진료를 받을 수 있어요!
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowActiveVisitNotice(false)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-jua text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>현재 처방 루틴 실천하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowActiveVisitNotice(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-jua text-xs rounded-xl transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: DoneForm Requirements Notice */}
      {doneFormNotice?.show && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border-4 border-teal-200 text-center space-y-3.5 animate-in fade-in zoom-in-95">
            {doneFormNotice.type === 'days_not_met' && (
              <>
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
                  🔒
                </div>
                <div>
                  <h3 className="font-jua text-lg text-slate-800">
                    '처방 다했어요'는 5일차에만 열립니다!
                  </h3>
                  <div className="my-2 p-2 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold">
                    현재 실천 {doneFormNotice.daysSince}일차 (D-{doneFormNotice.remainingDays ?? Math.max(1, 5 - (doneFormNotice.daysSince || 1))})
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed text-left bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    • 마음 처방 루틴은 5일 동안 매일 실천하는 습관입니다.<br />
                    • <strong>5일차 이전에는 열리지 않으며</strong>, 5일차에 도달하여 5일차 미션을 1개 이상 실천해야 열립니다.<br />
                    • 5일차 미션까지 실천하고 소감을 제출하면 보건실(위클래스)에서 <strong>달콤한 실물 마음 약(간식/비타민)</strong>을 받아갈 수 있어요 💊✨
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setDoneFormNotice(null)}
                    className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-jua text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>오늘 처방 미션 실천하러 가기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {activeVisit && (
                    <button
                      type="button"
                      onClick={() => {
                        StorageService.setVisitSimulatedDays(activeVisit.visitId, 5);
                        setRefreshKey((k) => k + 1);
                        setDoneFormNotice(null);
                      }}
                      className="w-full py-1.5 text-[10.5px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                      title="체험 및 평가를 위해 5일차로 이동합니다 (5일차 미션 1개 이상 실천 필수)"
                    >
                      ⚡ (체험·심사용) 5일차로 이동하기
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDoneFormNotice(null)}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-jua text-xs rounded-xl transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </>
            )}

            {doneFormNotice.type === 'day_5_mission_not_done' && (
              <>
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-2xl shadow-inner">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-jua text-lg text-slate-800">
                    5일차 미션을 먼저 1개 이상 실천해야 해요!
                  </h3>
                  <div className="my-2 p-2 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-bold">
                    현재 5일차 미션 완료: 0개
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed text-left bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    • 5일차가 되었지만 <strong>5일차 미션을 아직 하나도 실천하지 않았어요.</strong><br />
                    • '처방 다했어요'는 5일차 미션을 <strong>최소 1개 이상 실천하고 체크</strong>해야 열립니다.<br />
                    • 홈 화면의 [5일차] 탭에서 오늘 실천한 처방을 체크하고 [실천 체크 저장하기]를 눌러주세요!
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setDoneFormNotice(null)}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-jua text-xs rounded-xl shadow-xs transition-colors"
                  >
                    👉 지금 5일차 미션 실천하고 체크하기
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoneFormNotice(null)}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-jua text-xs rounded-xl transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </>
            )}

            {doneFormNotice.type === 'no_active_visit' && (
              <>
                <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
                  🩺
                </div>
                <div>
                  <h3 className="font-jua text-lg text-slate-800">
                    진행 중인 처방전이 없어요
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    '오늘 마음 진료'를 먼저 받고 맞춤 처방전을 받은 뒤, 5일간 미션을 실천해 보세요!
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDoneFormNotice(null);
                      onStartDiagnosis();
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-jua text-xs rounded-xl shadow-xs transition-colors"
                  >
                    🩺 마음 진료 시작하기
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoneFormNotice(null)}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-jua text-xs rounded-xl transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
