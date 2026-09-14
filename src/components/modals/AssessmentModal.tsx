import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, AssessmentResult } from '../../types';
import { ASSESSMENT_QUESTIONS, ASSESSMENT_DOMAINS } from '../../data/assessmentQuestions';
import { HealyCharacter } from '../character/HealyCharacter';
import { Sparkles, CheckCircle2, Award } from 'lucide-react';

interface AssessmentModalProps {
  isOpen: boolean;
  type: 'pre' | 'post';
  student: Student;
  onSubmit: (result: AssessmentResult) => void;
  onClose?: () => void;
}

const LIKERT_OPTIONS = [
  { value: 1, label: '전혀 아니다', emoji: '🌱' },
  { value: 2, label: '별로 아니다', emoji: '🌿' },
  { value: 3, label: '보통이다', emoji: '🌼' },
  { value: 4, label: '그런 편이다', emoji: '🌸' },
  { value: 5, label: '매우 그렇다', emoji: '🌻' }
];

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  type,
  student,
  onSubmit
}) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const isPre = type === 'pre';
  const allAnswered = ASSESSMENT_QUESTIONS.every((q) => answers[q.id] !== undefined);

  const handleSelect = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) {
      alert('모든 문항에 답변해주세요!');
      return;
    }

    const questionCount = ASSESSMENT_QUESTIONS.length;
    let totalScore = 0;
    const domainTotals: Record<string, { sum: number; count: number }> = {};

    ASSESSMENT_QUESTIONS.forEach((q) => {
      const val = answers[q.id] || 3;
      totalScore += val;
      if (!domainTotals[q.domain]) {
        domainTotals[q.domain] = { sum: 0, count: 0 };
      }
      domainTotals[q.domain].sum += val;
      domainTotals[q.domain].count += 1;
    });

    const averageScore = Number((totalScore / questionCount).toFixed(2));
    const domainScores: Record<string, number> = {};
    for (const [dom, data] of Object.entries(domainTotals)) {
      domainScores[dom] = Number((data.sum / data.count).toFixed(2));
    }

    const result: AssessmentResult = {
      completed: true,
      completedAt: new Date().toISOString(),
      answers,
      totalScore,
      averageScore,
      domainScores
    };

    onSubmit(result);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-xl bg-[#FDFCF0] rounded-[40px] border-4 border-white shadow-2xl p-6 md:p-8 max-h-[92vh] flex flex-col text-[#4A4A4A]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#5A5A40]/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF08A] flex items-center justify-center text-2xl border-2 border-white shadow-xs">
                {isPre ? '🧭' : '🌟'}
              </div>
              <div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {isPre ? '힐링약국 첫 시작 사전진단' : '활동 마무리 사후진단'}
                </span>
                <h2 className="font-jua text-lg md:text-xl text-[#5A5A40]">
                  {isPre ? '나의 사회정서 마음체크 (사전 검사)' : '나의 사회정서 마음성장 (사후 검사)'}
                </h2>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#5A5A40]/10 text-xs font-bold text-[#854D0E]">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>참여 보너스 +{isPre ? '2' : '3'}쿠키</span>
            </div>
          </div>

          {/* Healy Guidance Notice */}
          <div className="my-3 p-3.5 bg-[#FFFBEB] rounded-2xl border-2 border-white flex items-center gap-3.5 shrink-0">
            <div className="w-12 h-12 shrink-0">
              <HealyCharacter size="sm" showDialogue={false} emotion="care" />
            </div>
            <p className="text-xs text-[#5A5A40]/90 leading-relaxed font-medium">
              {isPre
                ? '안녕! 힐링약국을 시작하기 전, 요즘 네 평소 마음과 행동 습관을 솔직하게 체크해줘. 정답은 없어!'
                : '축하해! 그동안 힐링약국에서 마음신호를 알아차리고 행동 처방을 실천하며 어떤 변화가 생겼는지 체크해봐요.'}
            </p>
          </div>

          {/* Scrollable Questions List */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4 my-2">
            {ASSESSMENT_QUESTIONS.map((q, qIndex) => {
              const domainInfo = ASSESSMENT_DOMAINS[q.domain];
              const selectedVal = answers[q.id];

              return (
                <div
                  key={q.id}
                  className="bg-white/85 rounded-3xl p-4 border-2 border-white shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-jua text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                      <span>{domainInfo?.icon}</span>
                      <span>{domainInfo?.name}</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {qIndex + 1} / {ASSESSMENT_QUESTIONS.length}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-[#4A4A4A] leading-snug">
                    {q.statement}
                  </p>

                  {/* 5-Point Likert Options */}
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {LIKERT_OPTIONS.map((opt) => {
                      const isChecked = selectedVal === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelect(q.id, opt.value)}
                          className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all text-center ${
                            isChecked
                              ? 'bg-amber-100 border-amber-400 shadow-xs scale-102 font-bold text-amber-950'
                              : 'bg-[#FDFCF0] border-white hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <span className="text-lg mb-0.5">{opt.emoji}</span>
                          <span className="text-[10px] leading-tight break-keep">{opt.label}</span>
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5">{opt.value}점</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Submit Button */}
            <div className="pt-2 sticky bottom-0 bg-[#FDFCF0] pb-1">
              <button
                type="submit"
                disabled={!allAnswered}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 disabled:from-slate-300 disabled:to-slate-400 text-white font-jua text-base rounded-2xl shadow-lg border-2 border-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {allAnswered
                    ? `${isPre ? '사전' : '사후'} 검사 제출하고 쿠키 받기 (+${isPre ? '2' : '3'}쿠키)`
                    : `모든 문항에 체크해주세요 (${Object.keys(answers).length}/${ASSESSMENT_QUESTIONS.length})`}
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
