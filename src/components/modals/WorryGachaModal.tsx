import React, { useState, useEffect } from 'react';
import { Student, WorryHint } from '../../types';
import { WORRY_HINTS } from '../../data/worryGacha';
import { StorageService } from '../../services/storage';
import { Sparkles, X, Heart, CheckCircle, Clock } from 'lucide-react';

interface WorryGachaModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

export const WorryGachaModal: React.FC<WorryGachaModalProps> = ({ student, isOpen, onClose }) => {
  const [hintText, setHintText] = useState<string | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [hasCommitted, setHasCommitted] = useState(false);
  const [alreadyDrawnToday, setAlreadyDrawnToday] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const todayRecord = StorageService.getTodayWorryChallenge(student.id);
      if (todayRecord) {
        setHintText(todayRecord.hint);
        setAlreadyDrawnToday(true);
      } else {
        setHintText(null);
        setAlreadyDrawnToday(false);
      }
      setHasCommitted(false);
      setIsPulling(false);
    }
  }, [isOpen, student.id]);

  if (!isOpen) return null;

  const handlePull = () => {
    if (alreadyDrawnToday || isPulling) return;
    setIsPulling(true);
    setHintText(null);
    setHasCommitted(false);

    setTimeout(() => {
      const random = WORRY_HINTS[Math.floor(Math.random() * WORRY_HINTS.length)];
      setHintText(random.hint);
      setIsPulling(false);
      setAlreadyDrawnToday(true);
      StorageService.saveTodayWorryChallenge(student.id, random.hint);
    }, 1200);
  };

  const handleCommitChallenge = () => {
    if (!hintText) return;
    StorageService.addWorryChallenge({
      id: `WC-${Date.now()}`,
      studentId: student.id,
      hint: hintText,
      tested: false,
      createdAt: new Date().toISOString()
    });
    setHasCommitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 border-2 border-purple-200 shadow-2xl relative text-center animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-3xl">🔮</span>
          <h3 className="font-jua text-xl text-slate-800">고민가챠 머신</h3>
        </div>

        {alreadyDrawnToday ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold mb-2">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>오늘 이미 뽑았어요! (하루 1회)</span>
          </div>
        ) : (
          <p className="text-xs text-purple-700 font-medium break-keep mb-3">
            "마음속으로 고민 하나를 떠올려봐. 말하지 않아도 괜찮아!"
          </p>
        )}

        {!hintText ? (
          <div className="py-6">
            <div className="w-32 h-32 mx-auto bg-purple-50 rounded-full border-4 border-purple-200 flex items-center justify-center text-5xl mb-4">
              {isPulling ? <span className="animate-spin">🌀</span> : '💭'}
            </div>

            <button
              onClick={handlePull}
              disabled={isPulling}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-jua text-base py-3.5 rounded-2xl shadow-md shadow-purple-200 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>레버를 돌려 오늘 생각 힌트 뽑기</span>
            </button>
          </div>
        ) : (
          <div className="my-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              💡 오늘 나에게 온 지혜의 글귀
            </span>

            <div className="bg-purple-50/70 border-2 border-purple-200 rounded-2xl p-4 my-3 text-center">
              <p className="font-jua text-base text-slate-800 leading-relaxed break-keep">
                "{hintText}"
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-3 text-left">
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed break-keep">
                📌 <strong className="text-slate-800">안내:</strong> 고민가챠는 절대적인 정답이 아닙니다. 내 생각의 시야를 넓혀주는 따뜻한 힌트이며, 최종 선택과 결정은 언제나 내가 합니다.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCommitChallenge}
                disabled={hasCommitted}
                className={`w-full py-2.5 rounded-xl font-jua text-xs flex items-center justify-center gap-1.5 transition-colors ${
                  hasCommitted
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-purple-500 hover:bg-purple-600 text-white shadow-xs'
                }`}
              >
                {hasCommitted ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>내 서랍에 도전 과제로 등록 완료!</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5 text-pink-200" />
                    <span>이 힌트를 직접 시험해볼래</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400 pt-1 font-medium">
                오늘의 고민 가챠는 하루 1회 완료되었습니다. 내일 또 만나요! ✨
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
