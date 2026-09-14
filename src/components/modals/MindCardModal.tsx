import React, { useState, useEffect } from 'react';
import { FORTUNES } from '../../data/fortunes';
import { Fortune, Student } from '../../types';
import { StorageService } from '../../services/storage';
import { Sparkles, Star, Check, X, Shuffle, ArrowRight, RotateCcw, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface MindCardModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onCardSaved?: () => void;
}

export const MindCardModal: React.FC<MindCardModalProps> = ({
  student,
  isOpen,
  onClose,
  onCardSaved
}) => {
  // 3 selectable cards in the spread
  const [deck, setDeck] = useState<Fortune[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [alreadyDrawnToday, setAlreadyDrawnToday] = useState(false);

  // Initialize or check if already drawn today
  useEffect(() => {
    if (!isOpen) return;

    const todayRecord = StorageService.getTodayMindCard(student.id);
    if (todayRecord) {
      setDeck([todayRecord.fortune]);
      setSelectedIndex(0);
      setIsFlipped(true);
      setAlreadyDrawnToday(true);
      setIsShuffling(false);
      setIsSaved(false);
    } else {
      setAlreadyDrawnToday(false);
      setIsShuffling(true);
      setSelectedIndex(null);
      setIsFlipped(false);
      setIsSaved(false);

      const timer = setTimeout(() => {
        const shuffled = [...FORTUNES].sort(() => 0.5 - Math.random());
        setDeck(shuffled.slice(0, 3));
        setIsShuffling(false);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [isOpen, student.id]);

  if (!isOpen) return null;

  const selectedCard = selectedIndex !== null ? deck[selectedIndex] : null;

  const handleSelectCard = (index: number) => {
    if (selectedIndex !== null || isShuffling || alreadyDrawnToday) return;
    setSelectedIndex(index);

    const chosen = deck[index];
    if (chosen) {
      StorageService.saveTodayMindCard(student.id, chosen);
    }

    setTimeout(() => {
      setIsFlipped(true);
      setAlreadyDrawnToday(true);
    }, 350);
  };

  const handleSaveToMyPage = () => {
    if (!selectedCard) return;
    StorageService.saveFortune(
      student.id,
      selectedCard.id,
      selectedCard.number,
      selectedCard.message,
      {
        title: selectedCard.title,
        romanNumeral: selectedCard.romanNumeral,
        archetype: selectedCard.archetype,
        icon: selectedCard.icon,
        subText: selectedCard.subText,
        tags: selectedCard.tags,
        gradient: selectedCard.gradient
      }
    );
    setIsSaved(true);
    if (onCardSaved) onCardSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1E1B4B] via-[#0F172A] to-[#090D16] border-2 border-indigo-400/40 rounded-[36px] p-5 md:p-6 text-white shadow-2xl overflow-hidden my-auto">
        {/* Subtle celestial background glows */}
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-400/30 text-amber-300 text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>오늘의 힐링 마음카드 타로</span>
          </div>

          {alreadyDrawnToday && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold block w-max mx-auto mb-1">
              <Clock className="w-3 h-3" />
              <span>오늘 이미 뽑았어요! (하루 1회)</span>
            </div>
          )}

          <h3 className="font-jua text-2xl text-white tracking-wide">
            {selectedCard && isFlipped ? '오늘 당신을 위한 운명의 마음카드' : '마음의 카드를 한 장 선택하세요'}
          </h3>
          <p className="text-xs text-indigo-200/80 mt-0.5">
            {selectedCard && isFlipped
              ? '오늘 내 마음에 꼭 필요한 온기와 지혜의 메시지입니다'
              : '마음을 편안히 가다듬고 가장 눈길이 가는 카드를 터치하세요'}
          </p>
        </div>

        {/* STAGE: Card Spread & Drawing Area */}
        <div className="relative min-h-[340px] flex items-center justify-center my-3 py-2">
          {/* SPREAD VIEW (When no card is flipped yet) */}
          {!isFlipped && (
            <div className="w-full flex items-center justify-center gap-2.5 sm:gap-3 px-2">
              {deck.map((card, idx) => {
                const isThisSelected = selectedIndex === idx;
                const isOtherSelected = selectedIndex !== null && !isThisSelected;
                const rotateAngle = idx === 0 ? -6 : idx === 2 ? 6 : 0;
                const offsetY = idx === 1 ? -6 : 0;

                return (
                  <motion.div
                    key={card.id + idx}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{
                      opacity: isOtherSelected ? 0.2 : 1,
                      y: isThisSelected ? -16 : offsetY,
                      scale: isThisSelected ? 1.08 : 1,
                      rotate: isThisSelected ? 0 : rotateAngle
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    whileHover={
                      selectedIndex === null && !isShuffling
                        ? { y: -12, scale: 1.05, transition: { duration: 0.2 } }
                        : {}
                    }
                    onClick={() => handleSelectCard(idx)}
                    className="relative cursor-pointer select-none group perspective-1000"
                  >
                    {/* Tarot Card Backside */}
                    <div className="w-24 sm:w-28 h-40 sm:h-44 rounded-2xl p-1 bg-gradient-to-br from-amber-400 via-indigo-600 to-purple-800 shadow-xl border border-amber-300/40 flex flex-col items-center justify-between overflow-hidden">
                      <div className="w-full h-full rounded-xl border border-amber-300/30 bg-[#0B0F19] p-2 flex flex-col items-center justify-between relative">
                        <div className="text-[10px] text-amber-300/70 font-mono">✧ ✧ ✧</div>
                        <div className="w-10 h-10 rounded-full border border-amber-400/50 bg-indigo-950/60 flex items-center justify-center text-xl shadow-inner group-hover:rotate-45 transition-transform duration-500">
                          🔮
                        </div>
                        <div className="text-[9px] text-amber-300/80 font-jua tracking-wider">
                          HEALING
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* FLIPPED REVEALED VIEW (3D Flip Animation) */}
          {selectedCard && isFlipped && (
            <motion.div
              initial={{ rotateY: 90, scale: 0.8, opacity: 0 }}
              animate={{ rotateY: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="w-full max-w-[290px] mx-auto select-none"
            >
              {/* Grand Tarot Card Frame */}
              <div
                className={`rounded-3xl p-1 shadow-2xl bg-gradient-to-br ${
                  selectedCard.gradient || 'from-amber-400 via-rose-500 to-indigo-600'
                } border border-amber-200/50 relative overflow-hidden`}
              >
                <div className="rounded-[22px] bg-white/95 backdrop-blur-md p-4 text-center text-slate-800 shadow-inner flex flex-col items-center space-y-2">
                  <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-100 pb-1">
                    <span>{selectedCard.romanNumeral || 'VII'}</span>
                    <span className="font-bold text-amber-600">{selectedCard.archetype || '마음'}</span>
                    <span>No. {selectedCard.number}</span>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-100 to-rose-100 flex items-center justify-center text-3xl shadow-inner border border-amber-200/60 my-1">
                    {selectedCard.icon || '🌟'}
                  </div>

                  <h4 className="font-jua text-xl text-slate-900 leading-tight">
                    {selectedCard.title || '온기의 등불'}
                  </h4>

                  <div className="flex flex-wrap items-center justify-center gap-1 my-1">
                    {selectedCard.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <p className="font-jua text-sm sm:text-base text-slate-800 leading-relaxed break-keep">
                    "{selectedCard.message}"
                  </p>
                  {selectedCard.subText && (
                    <p className="text-xs text-amber-900 font-medium mt-2 pt-2 border-t border-amber-200/80 flex items-center justify-center gap-1">
                      <span>🌱</span>
                      <span>{selectedCard.subText}</span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3 space-y-2 relative z-10">
          {!isFlipped ? (
            <button
              onClick={() => {
                const shuffled = [...FORTUNES].sort(() => 0.5 - Math.random());
                setDeck(shuffled.slice(0, 3));
              }}
              disabled={isShuffling}
              className="w-full py-3 bg-white/10 hover:bg-white/15 active:scale-98 border border-white/20 rounded-2xl font-jua text-sm text-indigo-200 flex items-center justify-center gap-2 transition-all"
            >
              <Shuffle className={`w-4 h-4 text-amber-300 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{isShuffling ? '카드 섞는 중...' : '카드 다시 섞기'}</span>
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleSaveToMyPage}
                disabled={isSaved}
                className={`w-full py-3.5 rounded-2xl font-jua text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isSaved
                    ? 'bg-emerald-500/90 text-white border border-emerald-400 cursor-default'
                    : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 shadow-amber-500/30 active:scale-98'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>내 마음서랍에 소장 완료!</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 text-amber-950 fill-amber-950" />
                    <span>이 카드 내 마음서랍에 소장하기</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <p className="text-[11px] text-indigo-200/70 mb-2">
                  오늘의 마음카드는 하루 1회 완료되었습니다. 내일 또 만나요! ✨
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/15 rounded-xl font-jua text-xs text-slate-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
