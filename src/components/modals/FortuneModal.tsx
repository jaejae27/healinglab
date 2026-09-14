import React, { useState } from 'react';
import { FORTUNES } from '../../data/fortunes';
import { Fortune, Student } from '../../types';
import { StorageService } from '../../services/storage';
import { Sparkles, Star, Check, X } from 'lucide-react';

interface FortuneModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

export const FortuneModal: React.FC<FortuneModalProps> = ({ student, isOpen, onClose }) => {
  const [isCracked, setIsCracked] = useState(false);
  const [currentFortune, setCurrentFortune] = useState<Fortune | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleCrack = () => {
    const randomIndex = Math.floor(Math.random() * FORTUNES.length);
    const chosen = FORTUNES[randomIndex];
    setCurrentFortune(chosen);
    setIsCracked(true);
  };

  const handleSaveToMyPage = () => {
    if (!currentFortune) return;
    StorageService.saveFortune(
      student.id,
      currentFortune.id,
      currentFortune.number,
      currentFortune.message
    );
    setIsSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 border-2 border-amber-200 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCracked ? (
          <div>
            <div className="text-5xl mb-3 animate-bounce">🥠</div>
            <h3 className="font-jua text-xl text-slate-800">오늘의 힐링 포춘쿠키</h3>
            <p className="text-xs text-slate-500 mt-1 break-keep">
              포춘쿠키를 톡! 쪼개서 오늘 나를 지켜줄 따뜻한 한마디를 발견해보세요.
            </p>

            <button
              onClick={handleCrack}
              className="mt-6 w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-900 font-jua text-base py-3.5 rounded-2xl shadow-md shadow-amber-200 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>포춘쿠키 쪼개기 💥</span>
            </button>
          </div>
        ) : (
          <div>
            <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 mb-2">
              {currentFortune?.id}
            </span>

            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 my-3 text-center">
              <p className="font-jua text-base text-slate-800 leading-relaxed break-keep">
                "{currentFortune?.message}"
              </p>
              {currentFortune?.subText && (
                <p className="text-xs text-amber-700 font-medium mt-2">
                  🌱 {currentFortune.subText}
                </p>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <button
                onClick={handleSaveToMyPage}
                disabled={isSaved}
                className={`w-full py-2.5 rounded-xl font-jua text-xs flex items-center justify-center gap-1.5 transition-colors ${
                  isSaved
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>내 서랍에 저장 완료!</span>
                  </>
                ) : (
                  <>
                    <Star className="w-3.5 h-3.5 text-amber-200" />
                    <span>이 문장 내 서랍에 보관하기</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
