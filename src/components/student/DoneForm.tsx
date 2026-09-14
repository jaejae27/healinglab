import React, { useState, useRef } from 'react';
import { Student, Visit } from '../../types';
import { StorageService } from '../../services/storage';
import { HealyCharacter } from '../character/HealyCharacter';
import {
  Star,
  AlertCircle,
  ArrowLeft,
  Gift,
  Calendar,
  Heart,
  CheckCircle2,
  Share2,
  FolderHeart,
  Home,
  Award
} from 'lucide-react';
import { validateMeaningfulText } from '../../utils/koreanName';
import { checkDoneFormEligibility } from '../../utils/doneFormEligibility';

interface DoneFormProps {
  student: Student;
  visit: Visit;
  onSuccess: () => void;
  onBack: () => void;
  onStudentUpdated?: () => void;
}

const PARTICIPATION_CHIPS = [
  '매일 하진 못했지만 실천한 날은 마음이 편안해졌어요 🌱',
  '작은 행동부터 시도해보니 생각보다 어렵지 않았어요 ✨',
  '스스로 내 마음을 돌보는 좋은 습관이 생긴 것 같아요 🌟',
  '앞으로도 비슷한 마음신호가 오면 또 해볼 생각이에요 💪'
];

const WHY_CHIPS = [
  '생각을 멈추고 바로 작은 행동을 하니 걱정이 줄었어요 🌿',
  '3초 심호흡을 하니 긴장되고 답답했던 마음이 풀렸어요 🫧',
  '쉬운 미션부터 해보니 스스로 해낼 수 있다는 자신감이 생겼어요 🎯',
  '친구에게 다정한 말을 건네니 서로 기분이 좋아졌어요 💬'
];

const FUTURE_CHIPS = [
  '비슷한 마음신호가 켜지면 일단 멈추고 3초 심호흡하기',
  '혼자 끙끙 앓지 않고 친구나 선생님께 솔직하게 털어놓기',
  '내가 좋아하는 음악을 듣거나 가벼운 산책으로 마음 환기하기'
];

export const DoneForm: React.FC<DoneFormProps> = ({
  student,
  visit,
  onSuccess,
  onBack,
  onStudentUpdated
}) => {
  const checkIns = visit.dailyCheckIns || [];
  const participatedDays = checkIns.filter((c) => c.completed).length;
  const participationRate = Math.round((participatedDays / 5) * 100);

  // Determine initial view: if already rewarded/submitted, show receipt
  const isAlreadySubmitted = visit.status === 'rewarded' && !!visit.submittedAt;
  const [view, setView] = useState<'form' | 'receipt'>(isAlreadySubmitted ? 'receipt' : 'form');

  const [ratings, setRatings] = useState<number[]>([
    visit.missions[0]?.rating || 5,
    visit.missions[1]?.rating || 5,
    visit.missions[2]?.rating || 5
  ]);

  // Multiple selection for best missions
  const initialBest =
    visit.bestMissionIndices && visit.bestMissionIndices.length > 0
      ? visit.bestMissionIndices
      : visit.bestMissionIndex !== undefined
      ? [visit.bestMissionIndex]
      : [0];
  const [bestIndices, setBestIndices] = useState<number[]>(initialBest);

  // Qualitative reflections
  const [reflectionParticipation, setReflectionParticipation] = useState<string>(
    visit.reflectionParticipation || ''
  );
  const [reflectionWhy, setReflectionWhy] = useState<string>(visit.reflectionWhy || '');
  const [willUseAgain, setWillUseAgain] = useState<string>(
    visit.willUseAgain || '네, 꼭 다시 사용할래요'
  );
  const [reflectionLearned, setReflectionLearned] = useState<string>(
    visit.reflectionLearned || ''
  );
  const [futurePlan, setFuturePlan] = useState<string>(visit.futurePlan || '');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedErrorField, setFocusedErrorField] = useState<string | null>(null);

  // Form field refs for auto-scrolling
  const participationRef = useRef<HTMLTextAreaElement>(null);
  const whyRef = useRef<HTMLTextAreaElement>(null);
  const bestSectionRef = useRef<HTMLDivElement>(null);

  const toggleBestIndex = (idx: number) => {
    setErrorMessage(null);
    setFocusedErrorField(null);
    if (bestIndices.includes(idx)) {
      if (bestIndices.length === 1) {
        setErrorMessage('가장 도움이 되었던 처방을 최소 1개 이상 선택해주세요.');
        return;
      }
      setBestIndices(bestIndices.filter((i) => i !== idx));
    } else {
      setBestIndices([...bestIndices, idx].sort());
    }
  };

  const handleChipSelect = (type: 'participation' | 'why' | 'future', text: string) => {
    setErrorMessage(null);
    setFocusedErrorField(null);
    if (type === 'participation') {
      setReflectionParticipation((prev) => (prev ? `${prev} ${text}` : text));
    } else if (type === 'why') {
      setReflectionWhy((prev) => (prev ? `${prev} ${text}` : text));
    } else if (type === 'future') {
      setFuturePlan((prev) => (prev ? `${prev} ${text}` : text));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // 1. BEST prescription selection check
    if (bestIndices.length === 0) {
      setErrorMessage('가장 도움이 되었던 처방을 최소 1개 이상 선택해주세요.');
      setFocusedErrorField('best');
      bestSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // 2. Validate reflectionParticipation (flexible & friendly)
    const trimmedPart = reflectionParticipation.trim();
    if (!trimmedPart) {
      setErrorMessage('[참여도 성찰] 5일 실천 참여도에 대한 생각을 적어주세요. 아래 추천 문구를 눌러도 돼요!');
      setFocusedErrorField('participation');
      participationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      participationRef.current?.focus();
      return;
    }
    const partCheck = validateMeaningfulText(trimmedPart, 2);
    if (!partCheck.valid) {
      setErrorMessage(`[참여도 성찰]: ${partCheck.reason}`);
      setFocusedErrorField('participation');
      participationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      participationRef.current?.focus();
      return;
    }

    // 3. Validate reflectionWhy
    const trimmedWhy = reflectionWhy.trim();
    if (!trimmedWhy) {
      setErrorMessage('[도움이 된 이유] 선택한 처방이 나에게 왜 도움이 되었는지 적어주세요. 아래 추천 문구를 눌러도 돼요!');
      setFocusedErrorField('why');
      whyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      whyRef.current?.focus();
      return;
    }
    const whyCheck = validateMeaningfulText(trimmedWhy, 2);
    if (!whyCheck.valid) {
      setErrorMessage(`[도움이 된 이유]: ${whyCheck.reason}`);
      setFocusedErrorField('why');
      whyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      whyRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setFocusedErrorField(null);

    try {
      const updatedMissions = visit.missions.map((m, idx) => ({
        ...m,
        completed: true,
        rating: ratings[idx] || 5
      }));

      // Automatically approve and reward upon submission!
      const updated = StorageService.updateVisit(visit.visitId, {
        status: 'rewarded',
        missions: updatedMissions,
        submittedAt: new Date().toISOString(),
        bestMissionIndex: bestIndices[0],
        bestMissionIndices: bestIndices,
        participationRate: participationRate,
        reflectionParticipation: trimmedPart,
        reflectionWhy: trimmedWhy,
        willUseAgain: willUseAgain.trim(),
        reflectionLearned: reflectionLearned.trim(),
        futurePlan: futurePlan.trim(),
        webVerified: true,
        paperVerified: true,
        rewardGiven: true,
        rewardGivenAt: new Date().toISOString(),
        rewardSnackNote: '5일 처방 실천 최종 완료 (보건실 실물 마음 약 수령 대상)'
      });

      if (!updated) {
        throw new Error('처방 정보를 업데이트하지 못했습니다.');
      }

      // Automatically award 3 cookies upon submission
      StorageService.addCookieLog(
        student.id,
        3,
        `5일 처방 실천 완료 보너스 쿠키 (${visit.primaryConditionName})`
      );

      // Trigger student balance refresh in parent
      onStudentUpdated?.();

      // Seamlessly navigate to the NEXT PAGE (Receipt View)
      setIsSubmitting(false);
      setView('receipt');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMessage(
        '저장하는 데 시간이 조금 걸리고 있어요. 작성한 내용은 안전하게 유지되고 있으니 다시 눌러주세요.'
      );
    }
  };

  // ==========================================
  // VIEW 2: NEXT PAGE - 실물 약 수령증 화면
  // ==========================================
  if (view === 'receipt') {
    return (
      <div className="max-w-md mx-auto px-4 py-4 pb-24 animate-in fade-in slide-in-from-bottom-3 duration-300">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>홈으로</span>
          </button>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            🎉 실천 완료 & 수령증 발급
          </span>
        </div>

        {/* Character Celebration Dialogue */}
        <HealyCharacter
          emotion="happy"
          size="sm"
          dialogue="축하해! 5일 동안 마음을 돌본 소중한 여정을 멋지게 완주했어!"
          subDialogue="보건실(위클래스) 선생님께 이 화면을 보여드리고 달콤한 실물 마음 약을 받아가렴!"
        />

        {/* Cookie Reward Card */}
        <div className="mt-3 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between border-2 border-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-inner">
              🍪
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-100 uppercase tracking-wider">
                완주 축하 보너스 지급 완료!
              </div>
              <div className="font-jua text-lg text-white">칭찬쿠키 +3개 즉시 적립</div>
            </div>
          </div>
          <span className="text-xs bg-white text-amber-800 px-2.5 py-1 rounded-xl font-jua shadow-2xs">
            지급 완료 ✨
          </span>
        </div>

        {/* Official Physical Medicine Certificate (보건실 제출용 수령증) */}
        <div className="mt-4 bg-white rounded-3xl border-2 border-amber-300 p-5 shadow-lg relative overflow-hidden space-y-4">
          {/* Top Stamp / Header */}
          <div className="flex items-start justify-between border-b-2 border-dashed border-amber-200 pb-3">
            <div>
              <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                PRESCRIPTION RECEIPT
              </span>
              <h3 className="font-jua text-lg text-slate-800 mt-1 flex items-center gap-1.5">
                <span>🏥 보건실 실물 마음 약 수령증</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                선생님 확인용 교환증 (발급일: {new Date().toLocaleDateString('ko-KR')})
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center text-2xl shadow-md border-2 border-white">
              💊
            </div>
          </div>

          {/* Student Info Box */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500">수령 학생</span>
              <strong className="font-bold text-slate-900">
                {student.grade}학년 {student.classNum}반 {student.number}번 {student.name}
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500">처방전 이름</span>
              <strong className="font-bold text-indigo-700">{visit.primaryConditionName}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500">5일 실천 참여율</span>
              <strong className="font-bold text-emerald-700">{participationRate}% (5일 중 {participatedDays}일 실천)</strong>
            </div>
          </div>

          {/* Actual Medicine to receive */}
          <div className="p-3.5 bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl border-2 border-rose-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-600">지급 대상 실물 마음 약</span>
              <span className="text-[10px] font-bold bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full">
                실물 간식·비타민
              </span>
            </div>
            <div className="font-jua text-base text-slate-800">
              🍬 {visit.prescriptionMedicineName || '응원비타민 (달콤한 마음 젤리/캔디)'}
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {visit.prescriptionAdvice || '스스로의 마음을 관찰하고 성실히 실천한 멋진 노력에 큰 박수를 보냅니다.'}
            </p>
          </div>

          {/* Instructions for Nurse's Office Visit */}
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 space-y-1">
            <div className="font-bold flex items-center gap-1 text-teal-950 font-jua">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>보건실(위클래스) 방문 가이드</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-teal-800">
              쉬는 시간이나 점심시간에 보건실 또는 위클래스(마음약국 선생님)로 찾아가 <strong>지금 이 화면을 보여드리면</strong>, 선생님께서 확인 도장과 함께 달콤한 실물 마음 약을 전해주십니다!
            </p>
          </div>

          {/* Verification Badge */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <Award className="w-4 h-4 text-amber-500" />
              마음약국 5일 처방 완료 공인
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ✅ 실물 약 수령 승인됨
            </span>
          </div>
        </div>

        {/* Selected BEST Missions and Reflection Summary Card */}
        <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2 text-xs">
          <h4 className="font-jua text-sm text-slate-800 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>내가 남긴 5일 성찰 & 다짐</span>
          </h4>

          <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
            <div className="text-[11px] font-bold text-slate-600">🏆 가장 도움이 되었던 처방:</div>
            <div className="text-slate-800 font-medium">
              {bestIndices.map((i) => visit.missions[i]?.title).filter(Boolean).join(', ')}
            </div>
          </div>

          {reflectionWhy && (
            <div className="p-2.5 bg-slate-50 rounded-xl space-y-0.5">
              <div className="text-[11px] font-bold text-slate-600">💡 도움이 된 이유:</div>
              <div className="text-slate-700">{reflectionWhy}</div>
            </div>
          )}

          {futurePlan && (
            <div className="p-2.5 bg-indigo-50/60 rounded-xl space-y-0.5 border border-indigo-100">
              <div className="text-[11px] font-bold text-indigo-800">🌟 나만의 앞으로의 다짐:</div>
              <div className="text-indigo-900 font-medium">{futurePlan}</div>
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={onSuccess}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-jua text-sm rounded-2xl shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            <FolderHeart className="w-4 h-4 text-amber-200" />
            <span>내 처방전 보관함(마음서랍)으로 가기</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 font-jua text-sm rounded-2xl border-2 border-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>마음약국 홈으로 돌아가기</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 0: 5일차 미만 또는 5일차 미션 미실천 시 접근 차단 화면
  // ==========================================
  const eligibility = checkDoneFormEligibility(visit);
  if (!isAlreadySubmitted && !eligibility.canOpen) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 pb-28 text-center animate-in fade-in duration-200">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-medium mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>홈으로 돌아가기</span>
        </button>

        <div className="bg-white/90 border-4 border-white rounded-[36px] p-6 shadow-xl space-y-4">
          <HealyCharacter
            emotion="thinking"
            size="sm"
            dialogue={
              eligibility.reason === 'before_day_5'
                ? "'처방 다했어요'는 5일차에만 열려요!"
                : "5일차 미션을 먼저 1개 이상 실천해줘!"
            }
            subDialogue={
              eligibility.reason === 'before_day_5'
                ? `현재 ${eligibility.daysSince}일차 (D-${eligibility.remainingDays}) 진행 중이에요.`
                : '5일차에 도달했지만 오늘 미션을 아직 체크하지 않았어요.'
            }
          />

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 text-left space-y-2">
            {eligibility.reason === 'before_day_5' ? (
              <>
                <p className="font-bold text-slate-800">
                  ⏳ 5일간 매일 실천하는 마음 처방 프로그램입니다.
                </p>
                <p>
                  5일차 이전에는 '처방 다했어요'가 열리지 않으며, 5일차에 도달한 뒤 5일차 미션을 1개 이상 실천해야 소감을 작성할 수 있습니다.
                </p>
              </>
            ) : (
              <>
                <p className="font-bold text-amber-800">
                  ⚠️ 5일차 미션 실천 기록이 필요합니다.
                </p>
                <p>
                  '처방 다했어요'는 5일차 미션을 최소 1개 이상 실천하고 체크해야 열립니다. 홈 화면으로 돌아가 5일차 미션을 실천해 주세요!
                </p>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-jua text-sm rounded-2xl shadow-md transition-all"
          >
            홈으로 돌아가 미션 실천하기
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: 처방 다했어요 성찰 작성 폼
  // ==========================================
  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 animate-in fade-in duration-200">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-medium mb-3 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>홈으로 돌아가기</span>
      </button>

      {/* Healy Banner */}
      <HealyCharacter
        emotion="cheering"
        size="sm"
        dialogue="5일간의 처방 실천 기간이 지났어! 정말 고생 많았어."
        subDialogue="매일 하지 못했어도 괜찮아. 내 참여도를 돌아보고 솔직한 마음을 들려줘!"
      />

      {/* Prescription Summary */}
      <div className="mt-3 bg-rose-50/80 border border-rose-200 rounded-2xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">
            완료 처방전
          </span>
          <h3 className="font-jua text-base text-slate-800">
            {visit.primaryConditionId} {visit.primaryConditionName}
          </h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-xl shadow-2xs">
          💊
        </div>
      </div>

      {/* Physical Medicine Notice Banner */}
      <div className="mt-3 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 shadow-2xs">
        <div className="w-9 h-9 rounded-xl bg-amber-400 text-white flex items-center justify-center shrink-0 text-lg shadow-xs">
          🎁
        </div>
        <div className="space-y-0.5">
          <h4 className="font-jua text-xs sm:text-sm text-amber-950 flex items-center gap-1">
            <span>제출 후 보건실에서 '실물 마음 약'을 받아가세요!</span>
          </h4>
          <p className="text-[11.5px] text-amber-900 leading-snug">
            이 성찰 일지를 제출하면 다음 페이지에 <strong>실물 약 수령증</strong>이 즉시 발급됩니다. <strong>보건실(위클래스)</strong>에 찾아가 처방전에 적힌 <strong>달콤한 실물 마음 약(젤리·비타민 등)</strong>을 직접 받아가세요!
          </p>
        </div>
      </div>

      {/* Top Error Alert */}
      {errorMessage && (
        <div className="mt-3 p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 shadow-sm animate-shake">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="font-bold block text-red-800">작성 확인이 필요해요!</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Form (noValidate to avoid browser silent interception) */}
      <form noValidate onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* SECTION 1: Self-Reflection on Participation Rate */}
        <div
          className={`bg-white rounded-2xl border-2 transition-all p-4 shadow-xs space-y-3 ${
            focusedErrorField === 'participation'
              ? 'border-rose-400 ring-2 ring-rose-200'
              : 'border-indigo-100'
          }`}
        >
          <div className="flex items-center justify-between border-b border-indigo-50 pb-2">
            <h4 className="font-jua text-sm text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>📊 나의 5일 실천 참여도 성찰</span>
            </h4>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              참여율 {participationRate}%
            </span>
          </div>

          {/* Participation Progress & Badge */}
          <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                5일 중 실천한 날: <strong className="text-indigo-700">{participatedDays}일</strong>
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {participatedDays >= 5
                  ? '👑 5일 완벽 실천'
                  : participatedDays >= 3
                  ? '👏 성실 실천'
                  : '🌱 시작이 반! 소중한 실천'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-indigo-200/50 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  participationRate >= 80
                    ? 'bg-gradient-to-r from-amber-400 to-emerald-500'
                    : participationRate >= 40
                    ? 'bg-indigo-500'
                    : 'bg-indigo-400'
                }`}
                style={{ width: `${Math.max(10, participationRate)}%` }}
              />
            </div>

            <p className="text-[11px] text-indigo-900 leading-snug font-medium pt-0.5">
              {participationRate >= 80
                ? '🌟 5일 동안 정말 꾸준하게 참여했어요! 대단한 마음 성장 습관이에요.'
                : participationRate >= 40
                ? '✨ 바쁜 일상 속에서도 3일 이상 마음을 돌보았어요. 꾸준함이 돋보여요!'
                : '🌱 매일 하지 못했더라도, 하루라도 내 마음을 위해 멈춰서 노력한 것 자체가 멋진 첫걸음이에요.'}
            </p>
          </div>

          {/* Reflection on Participation Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              나의 실천 참여율({participationRate}%)을 돌아보며 드는 생각은?{' '}
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              ref={participationRef}
              rows={2}
              value={reflectionParticipation}
              onChange={(e) => {
                setReflectionParticipation(e.target.value);
                if (errorMessage && focusedErrorField === 'participation') {
                  setErrorMessage(null);
                  setFocusedErrorField(null);
                }
              }}
              placeholder="예: 매일 하려고 했는데 깜빡한 날도 있었어요. 그래도 심호흡 미션을 해보니 마음이 훨씬 편안해졌어요."
              className={`w-full bg-indigo-50/20 border rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                focusedErrorField === 'participation'
                  ? 'border-rose-400 ring-2 ring-rose-200'
                  : 'border-indigo-200 focus:ring-indigo-300'
              }`}
            />

            {/* Quick Inspiration Chips */}
            <div className="mt-1.5 space-y-1">
              <span className="text-[10px] font-bold text-indigo-600 block">
                💡 클릭하면 바로 입력돼요:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PARTICIPATION_CHIPS.map((chip, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => handleChipSelect('participation', chip)}
                    className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-lg text-left transition-all active:scale-95 leading-tight"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Missions Evaluation & Multiple BEST Selection */}
        <div
          ref={bestSectionRef}
          className={`bg-white rounded-2xl border-2 transition-all p-4 shadow-xs space-y-3.5 ${
            focusedErrorField === 'best'
              ? 'border-rose-400 ring-2 ring-rose-200'
              : 'border-rose-100'
          }`}
        >
          <div className="flex items-center justify-between border-b border-rose-50 pb-2">
            <h4 className="font-jua text-sm text-slate-800 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>⭐ 처방별 실천 평가 및 BEST 처방 선택</span>
            </h4>
          </div>

          {/* 3 Missions Rating */}
          <div className="space-y-2.5">
            {visit.missions.map((m, idx) => (
              <div
                key={m.missionId}
                className="p-3 bg-slate-50/80 rounded-xl border border-slate-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">
                    처방 {idx + 1}. {m.title}
                  </span>
                  <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-100">
                    {m.type === 'notice' ? '알아차리기' : m.type === 'action' ? '행동' : '환경조절'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mb-2 break-keep">
                  {m.description}
                </p>

                {/* Star Rating 1~5 */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] text-slate-500 font-medium">도움된 정도:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => {
                          const newRatings = [...ratings];
                          newRatings[idx] = star;
                          setRatings(newRatings);
                        }}
                        className="p-1 focus:outline-none transition-transform active:scale-125"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= ratings[idx]
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-700 ml-1 font-mono">
                      {ratings[idx]}점
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Choose Multiple BEST Missions */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                🏆 가장 도움이 되었던 BEST 처방을 골라주세요 <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold border border-indigo-200">
                중복 선택 가능 ({bestIndices.length}개 선택됨)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              여러 처방이 모두 좋았다면 2개 이상 함께 누를 수 있어요!
            </p>

            <div className="grid grid-cols-3 gap-2">
              {visit.missions.map((m, idx) => {
                const isSelected = bestIndices.includes(idx);
                return (
                  <button
                    type="button"
                    key={m.missionId}
                    onClick={() => toggleBestIndex(idx)}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 relative ${
                      isSelected
                        ? 'bg-gradient-to-b from-rose-500 to-rose-600 text-white border-rose-600 font-bold shadow-xs scale-[1.02]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white text-rose-600 flex items-center justify-center text-[10px] shadow-2xs font-bold">
                        ✓
                      </span>
                    )}
                    <span className="text-xs font-jua">처방 {idx + 1}번</span>
                    <span className="text-[10px] leading-tight line-clamp-1 opacity-90">
                      {m.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 3: Qualitative Reflection */}
        <div
          className={`bg-white rounded-2xl border-2 transition-all p-4 shadow-xs space-y-3.5 ${
            focusedErrorField === 'why'
              ? 'border-rose-400 ring-2 ring-rose-200'
              : 'border-rose-100'
          }`}
        >
          <h4 className="font-jua text-sm text-slate-800 border-b border-rose-50 pb-2 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>📝 깊이 있는 마음 기록 & 다짐</span>
          </h4>

          {/* Reflection Why */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              선택한 처방이 나에게 왜 도움이 되었나요? <span className="text-rose-500">*</span>
            </label>
            <textarea
              ref={whyRef}
              rows={2}
              value={reflectionWhy}
              onChange={(e) => {
                setReflectionWhy(e.target.value);
                if (errorMessage && focusedErrorField === 'why') {
                  setErrorMessage(null);
                  setFocusedErrorField(null);
                }
              }}
              placeholder="예: 생각을 멈추고 작은 행동을 먼저 해보니까 미루던 마음이 사라지고 편안해졌어요."
              className={`w-full bg-rose-50/30 border rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                focusedErrorField === 'why'
                  ? 'border-rose-400 ring-2 ring-rose-200'
                  : 'border-rose-200 focus:ring-rose-300'
              }`}
            />

            {/* Quick Inspiration Chips */}
            <div className="mt-1.5 space-y-1">
              <span className="text-[10px] font-bold text-rose-600 block">
                💡 클릭하면 바로 입력돼요:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {WHY_CHIPS.map((chip, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => handleChipSelect('why', chip)}
                    className="text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded-lg text-left transition-all active:scale-95 leading-tight"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Will use again */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              다음에도 이 마음 처방 행동들을 다시 사용할 의향이 있나요?
            </label>
            <div className="flex gap-2">
              {['네, 꼭 다시 사용할래요', '상황에 따라 써볼게요', '다른 방법을 찾아볼래요'].map(
                (opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setWillUseAgain(opt)}
                    className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-medium border transition-colors ${
                      willUseAgain === opt
                        ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {opt}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Reflection Learned (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              이번 활동을 하며 새롭게 알게 된 내 마음 (느낀 점)
            </label>
            <textarea
              rows={2}
              value={reflectionLearned}
              onChange={(e) => setReflectionLearned(e.target.value)}
              placeholder="예: 걱정했던 것보다 실제로 시작해보면 별거 아니라는 것을 배웠어요."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          {/* Future Plan / Pledge */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              앞으로 비슷한 마음 신호가 켜졌을 때 나만의 다짐
            </label>
            <input
              type="text"
              value={futurePlan}
              onChange={(e) => setFuturePlan(e.target.value)}
              placeholder="예: 마음이 답답해지면 일단 3초 숨을 들이마시고 안전 환경을 만들 거예요."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />

            {/* Future Plan Chips */}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {FUTURE_CHIPS.map((chip, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleChipSelect('future', chip)}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-lg text-left transition-all active:scale-95 leading-tight"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM ERROR ALERT DIRECTLY ABOVE SUBMIT BUTTON */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 shadow-md animate-bounce">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-bold block text-red-800">제출 전 필수 항목을 확인해주세요:</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Submit Button with Physical Medicine Guide */}
        <div className="space-y-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-jua text-base py-4 rounded-2xl shadow-lg shadow-emerald-200/50 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>소중한 기록 저장 및 수령증 발급 중...</span>
              </div>
            ) : (
              <>
                <Gift className="w-5 h-5 text-amber-200 animate-pulse" />
                <span>처방 다했어요 제출하고 실물 약 받으러 가기</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-center text-slate-500">
            제출 즉시 <strong>칭찬쿠키 +3개</strong>가 적립되며, 다음 페이지에 <strong>보건실 실물 약 수령증</strong>이 발급됩니다.
          </p>
        </div>
      </form>
    </div>
  );
};
