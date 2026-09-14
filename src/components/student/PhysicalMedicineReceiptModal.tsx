import React, { useState, useEffect, useRef } from 'react';
import { Visit, Student } from '../../types';
import { StorageService } from '../../services/storage';
import { HealyCharacter } from '../character/HealyCharacter';
import {
  X,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Heart,
  Printer,
  ChevronRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface PhysicalMedicineReceiptModalProps {
  visit: Visit | null;
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onViewWorkbookPrint?: (conditionId: string) => void;
}

export const PhysicalMedicineReceiptModal: React.FC<PhysicalMedicineReceiptModalProps> = ({
  visit,
  student,
  isOpen,
  onClose,
  onViewWorkbookPrint
}) => {
  const [liveVisit, setLiveVisit] = useState<Visit | null>(visit);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevRewardGiven = useRef<boolean>(!!visit?.rewardGiven);

  // Synchronize live visit when modal opens or updates
  useEffect(() => {
    if (!visit) return;
    const current = StorageService.getVisits().find((v) => v.visitId === visit.visitId) || visit;
    setLiveVisit(current);
    prevRewardGiven.current = !!current.rewardGiven;
  }, [visit, isOpen]);

  // Subscribe to real-time storage/Firestore updates
  useEffect(() => {
    if (!isOpen || !visit) return;

    const checkLiveUpdate = () => {
      const current = StorageService.getVisits().find((v) => v.visitId === visit.visitId);
      if (current) {
        if (!prevRewardGiven.current && current.rewardGiven) {
          // Just confirmed! Trigger celebration
          setShowCelebration(true);
          playCelebrationSound();
        }
        prevRewardGiven.current = !!current.rewardGiven;
        setLiveVisit(current);
      }
    };

    const unsub = StorageService.subscribe(checkLiveUpdate);
    const handleStorageEvent = () => checkLiveUpdate();
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('school_mind_pharmacy_storage_updated', handleStorageEvent);

    return () => {
      unsub();
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('school_mind_pharmacy_storage_updated', handleStorageEvent);
    };
  }, [isOpen, visit]);

  const playCelebrationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Arpeggio chime notes: C5 -> E5 -> G5 -> C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch {
      // AudioContext unavailable
    }
  };

  if (!isOpen || !liveVisit) return null;

  const isRewardGiven = !!liveVisit.rewardGiven;
  const conditionMeta = StorageService.getConditionById(liveVisit.primaryConditionId);
  const medicineName =
    liveVisit.prescriptionMedicineName ||
    conditionMeta?.prescriptionMedicineName ||
    '응원비타민 (달콤한 마음 젤리/캔디)';
  const medicineAdvice =
    liveVisit.prescriptionAdvice ||
    conditionMeta?.prescriptionAdvice ||
    '스스로의 마음을 관찰하고 5일간 꾸준히 실천한 멋진 노력에 큰 박수를 보냅니다.';

  const participationRate = liveVisit.participationRate ?? 100;
  const participatedDays =
    liveVisit.dailyCheckIns?.filter((c) => c.completed).length ?? 5;

  const formattedSubmittedDate = liveVisit.submittedAt
    ? new Date(liveVisit.submittedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleDateString('ko-KR');

  const formattedReceivedDate = liveVisit.rewardGivenAt
    ? new Date(liveVisit.rewardGivenAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-[32px] sm:rounded-[36px] border-4 border-white shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-white border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">🏥</span>
            <span className="font-jua text-sm sm:text-base text-slate-800 break-keep">
              보건실 실물 마음 약 수령증 <span className="text-xs text-amber-700 font-sans font-bold">(선생님 제시용)</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shrink-0"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Status Notification Banner (약 수령 전 vs 후) */}
        <div
          className={`px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between transition-colors gap-2 ${
            isRewardGiven
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white animate-pulse'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl shrink-0">{isRewardGiven ? '🎉' : '⏳'}</span>
            <div className="min-w-0">
              <div className="text-[10.5px] sm:text-[11px] font-medium tracking-wide uppercase opacity-90 whitespace-nowrap">
                실물 마음 약 수령 상태
              </div>
              <div className="font-jua text-sm sm:text-lg flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <span className="whitespace-nowrap">
                  {isRewardGiven ? '실물 약 수령 완료!' : '약 수령 전'}
                </span>
                {isRewardGiven ? (
                  <span className="text-[10px] sm:text-[11px] bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    지급 완료
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] bg-white/25 px-2 py-0.5 rounded-full font-sans whitespace-nowrap shrink-0">
                    선생님 확인 대기 중
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="hidden sm:block text-right text-[11px] opacity-90 whitespace-nowrap shrink-0">
            {isRewardGiven ? '수령 일시 기록됨' : '실시간 대기 중'}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Top Instruction / Status Callout */}
          {!isRewardGiven ? (
            <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-3.5 text-xs text-amber-900 leading-relaxed shadow-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-950 font-jua text-sm">
                <span className="text-base">📢</span>
                <span>선생님께 지금 이 화면을 보여주세요!</span>
              </div>
              <p className="text-[11.5px] text-amber-800">
                보건실(위클래스) 선생님께서 교사 대시보드에서 <strong>[수령 확인]</strong> 버튼을
                누르시면, 이 화면이 실시간으로 <strong>[수령 완료 도장]</strong>으로 자동 변경됩니다.
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 text-xs text-emerald-900 leading-relaxed shadow-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-950 font-jua text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>선생님 확인 및 실물 마음 약 지급이 완료되었습니다!</span>
              </div>
              <p className="text-[11.5px] text-emerald-800">
                달콤한 마음 약(간식)을 맛있게 먹고, 이번 5일간 마음을 돌본 나 자신을 꼭 칭찬해주세요. 🍬✨
                {formattedReceivedDate && (
                  <span className="block mt-1 font-mono text-[11px] text-emerald-700">
                    수령 확인 일시: {formattedReceivedDate}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Healy Character Brief Cheer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs">
            <HealyCharacter
              emotion={isRewardGiven ? 'cheering' : 'happy'}
              size="sm"
              dialogue={
                isRewardGiven
                  ? `대단해 ${student.name}! 마음 약을 받고 오늘도 한 걸음 성장했어!`
                  : `멋지다 ${student.name}! 5일 실천을 끝마치고 마음 약을 받을 차례야!`
              }
              subDialogue={
                isRewardGiven
                  ? '마음 약국은 언제나 너의 든든한 응원군이야 🌸'
                  : '선생님께 이 수령증을 보여드리고 달콤한 약을 받아봐 💊'
              }
            />
          </div>

          {/* The Physical Medicine Certificate Paper */}
          <div
            className={`bg-white rounded-3xl border-3 p-4 sm:p-5 shadow-md relative overflow-hidden space-y-4 transition-all ${
              isRewardGiven ? 'border-emerald-400 bg-emerald-50/10' : 'border-amber-300'
            }`}
          >
            {/* Watermark Stamp when Confirmed */}
            {isRewardGiven && (
              <div className="absolute top-4 right-4 sm:right-6 pointer-events-none transform rotate-[-12deg] z-10 animate-in zoom-in-75 duration-300">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-rose-600/80 bg-rose-50/70 backdrop-blur-2xs flex flex-col items-center justify-center text-rose-600 shadow-lg text-center p-1">
                  <span className="text-[9px] font-bold tracking-widest uppercase">
                    SCHOOL PHARMACY
                  </span>
                  <span className="font-jua text-sm sm:text-base text-rose-700 font-extrabold leading-none my-0.5">
                    수령 완료
                  </span>
                  <span className="text-[8.5px] font-mono text-rose-600">
                    {formattedReceivedDate ? formattedReceivedDate.split(' ')[0] : '확인완료'}
                  </span>
                  <span className="text-[8px] text-rose-500 font-bold mt-0.5">
                    힐링마음약국 직인
                  </span>
                </div>
              </div>
            )}

            {/* Certificate Header */}
            <div className="flex items-start justify-between border-b-2 border-dashed border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                  RX-CERTIFICATE #{liveVisit.visitId.slice(-6)}
                </span>
                <h3 className="font-jua text-lg text-slate-900 mt-1 flex items-center gap-1.5">
                  <span>마음약국 실물 약 수령증</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  5일 처방 실천 및 최종 성찰 완료 인증
                </p>
              </div>

              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border-2 border-white ${
                  isRewardGiven ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                💊
              </div>
            </div>

            {/* Student Identity Information (Big & Clear for Teachers to Read) */}
            <div className="bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium whitespace-nowrap shrink-0">수령 대상 학생</span>
                <span className="font-jua text-xs sm:text-base text-slate-900 bg-white px-2 sm:px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs whitespace-nowrap">
                  {student.grade}학년 {student.classNum}반 {student.number}번 {student.name}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium whitespace-nowrap shrink-0">발급된 마음신호</span>
                <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-right truncate">
                  [{liveVisit.primaryConditionId}] {liveVisit.primaryConditionName}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium whitespace-nowrap shrink-0">5일 실천 참여율</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 whitespace-nowrap text-right">
                  {participationRate}% ({participatedDays}/5일 완료)
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium whitespace-nowrap shrink-0">제출 일시</span>
                <span className="text-slate-600 font-mono text-[10.5px] sm:text-[11px] whitespace-nowrap text-right">
                  {formattedSubmittedDate}
                </span>
              </div>
            </div>

            {/* Prescribed Physical Medicine Card */}
            <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                  <span>🍬</span>
                  <span>지급 대상 실물 마음 약 (간식/비타민)</span>
                </span>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  실물 지급품
                </span>
              </div>

              <div className="font-jua text-base sm:text-lg text-amber-950">
                {medicineName}
              </div>

              <p className="text-[11.5px] text-amber-900/90 leading-snug">
                {medicineAdvice}
              </p>
            </div>

            {/* Best Mission & Reflection Preview */}
            {(liveVisit.reflectionWhy || liveVisit.reflectionLearned) && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <span>💭</span>
                  <span>학생의 5일 실천 성찰 한 줄</span>
                </div>
                {liveVisit.reflectionWhy && (
                  <p className="text-slate-600 text-[11.5px] italic">
                    "{liveVisit.reflectionWhy}"
                  </p>
                )}
                {liveVisit.reflectionLearned && (
                  <p className="text-slate-500 text-[11px]">
                    배운 점: {liveVisit.reflectionLearned}
                  </p>
                )}
              </div>
            )}

            {/* Status Footer Inside Certificate */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>학교 사회정서 힐링약국 인증</span>
              </div>

              <div>
                {isRewardGiven ? (
                  <span className="font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>실물약 지급 완료됨</span>
                  </span>
                ) : (
                  <span className="font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl flex items-center gap-1 animate-pulse">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>선생님 확인 대기 중</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-2">
            {onViewWorkbookPrint && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewWorkbookPrint(liveVisit.primaryConditionId);
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>워크북 인쇄본 보기</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="ml-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-jua text-xs sm:text-sm rounded-xl transition-transform active:scale-95 shadow-md"
            >
              확인 완료 (닫기)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
