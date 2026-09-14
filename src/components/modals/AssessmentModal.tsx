import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, AssessmentResult, DescriptiveAnswers } from '../../types';
import {
  ASSESSMENT_QUESTIONS,
  ASSESSMENT_DOMAINS,
  KPI_QUESTION,
  COMMON_DESCRIPTIVE_QUESTIONS,
  PROGRAM_EFFECT_QUESTIONS,
  POST_DESCRIPTIVE_GROWTH_QUESTIONS
} from '../../data/assessmentQuestions';
import { HealyCharacter } from '../character/HealyCharacter';
import { Sparkles, CheckCircle2, Award, Heart, HelpCircle, PenLine, ChevronRight } from 'lucide-react';

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
  onSubmit,
  onClose
}) => {
  const isPre = type === 'pre';

  // State for core 20 items
  const [answers, setAnswers] = useState<Record<string, number>>({});
  // State for KPI
  const [kpiScore, setKpiScore] = useState<number | undefined>(undefined);
  // State for post-test program effects (PE1~PE5)
  const [effectAnswers, setEffectAnswers] = useState<Record<string, number>>({});
  // State for descriptive responses
  const [descriptive, setDescriptive] = useState<DescriptiveAnswers>({
    q21_feelings: '',
    q22_stressCoping: '',
    q28_mindChanged: '',
    q29_favoritePrescription: '',
    q30_friendAction: ''
  });

  if (!isOpen) return null;

  // Validation
  const coreAllAnswered = ASSESSMENT_QUESTIONS.every((q) => answers[q.id] !== undefined);
  const kpiAnswered = kpiScore !== undefined;
  const effectAllAnswered = isPre || PROGRAM_EFFECT_QUESTIONS.every((q) => effectAnswers[q.id] !== undefined);
  const allAnswered = coreAllAnswered && kpiAnswered && effectAllAnswered;

  const handleSelectCore = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSelectEffect = (questionId: string, value: number) => {
    setEffectAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) {
      alert('모든 객관식 문항(20문항 + 핵심 문항)에 체크해주세요!');
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

    let programEffectAvg: number | undefined = undefined;
    if (!isPre) {
      const effectValues = Object.values(effectAnswers);
      const effectSum = effectValues.reduce<number>((a, b) => a + (Number(b) || 0), 0);
      programEffectAvg = Number((effectSum / Math.max(1, effectValues.length)).toFixed(2));
    }

    const result: AssessmentResult = {
      completed: true,
      completedAt: new Date().toISOString(),
      answers,
      totalScore, // 20~100
      averageScore, // 1~5
      domainScores,
      kpiScore: kpiScore || 3,
      descriptiveAnswers: descriptive,
      programEffectScores: !isPre ? effectAnswers : undefined,
      programEffectAverage: programEffectAvg
    };

    onSubmit(result);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-[#FDFCF0] rounded-[36px] border-4 border-white shadow-2xl p-5 sm:p-7 max-h-[92vh] flex flex-col text-[#4A4A4A]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#5A5A40]/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FEF08A] flex items-center justify-center text-2xl border-2 border-white shadow-xs">
                {isPre ? '🧭' : '🌟'}
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {isPre ? '힐링약국 첫걸음 · 사전 진단' : '힐링약국 마무리 · 사후 성장 진단'}
                </span>
                <h2 className="font-jua text-base sm:text-lg text-[#5A5A40]">
                  {isPre ? '나의 사회정서 마음체크 (사전 검사)' : '나의 사회정서 마음성장 (사후 검사)'}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#5A5A40]/10 text-xs font-bold text-[#854D0E]">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>+{isPre ? '2' : '3'}쿠키 지급</span>
            </div>
          </div>

          {/* Healy Guidance Notice */}
          <div className="my-3 p-3 bg-[#FFFBEB] rounded-2xl border-2 border-white flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 shrink-0">
              <HealyCharacter size="sm" showDialogue={false} emotion="care" />
            </div>
            <p className="text-xs text-[#5A5A40]/90 leading-relaxed font-medium">
              {isPre
                ? '안녕! 힐링약국을 시작하기 전, 요즘 네 평소 마음과 행동 습관을 솔직하게 체크해줘. 정답은 없으니 편안하게 답해줘!'
                : '축하해! 그동안 힐링약국에서 마음신호를 알아차리고 행동 처방을 실천하며 어떤 변화가 생겼는지 솔직하게 체크해봐요.'}
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-4 my-2">
            {/* Section 1: Core 20 Questions */}
            <div className="space-y-3">
              <div className="bg-amber-100/70 px-3.5 py-1.5 rounded-xl border border-amber-200 text-xs font-jua text-amber-900 flex items-center justify-between">
                <span>파트 1. 나의 일상 마음과 행동 습관 (20문항)</span>
                <span className="text-[11px] font-mono">
                  {Object.keys(answers).length}/20 완료
                </span>
              </div>

              {ASSESSMENT_QUESTIONS.map((q, qIndex) => {
                const domainInfo = ASSESSMENT_DOMAINS[q.domain];
                const selectedVal = answers[q.id];

                return (
                  <div
                    key={q.id}
                    className="bg-white/85 rounded-2xl p-3.5 border-2 border-white shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-jua text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                        <span>{domainInfo?.icon}</span>
                        <span>{domainInfo?.name}</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        Q{q.num}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-[#4A4A4A] leading-snug">
                      {q.statement}
                    </p>

                    {/* 5-Point Likert Options */}
                    <div className="grid grid-cols-5 gap-1 pt-1">
                      {LIKERT_OPTIONS.map((opt) => {
                        const isChecked = selectedVal === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectCore(q.id, opt.value)}
                            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border-2 transition-all text-center ${
                              isChecked
                                ? 'bg-amber-100 border-amber-400 shadow-xs font-bold text-amber-950'
                                : 'bg-[#FDFCF0] border-white hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <span className="text-base mb-0.5">{opt.emoji}</span>
                            <span className="text-[9.5px] leading-tight break-keep">{opt.label}</span>
                            <span className="text-[8.5px] text-slate-400 font-mono mt-0.5">{opt.value}점</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Section 2: KPI Question (마음 처방 자신감) */}
            <div className="space-y-2 pt-2">
              <div className="bg-purple-100/70 px-3.5 py-1.5 rounded-xl border border-purple-200 text-xs font-jua text-purple-900 flex items-center justify-between">
                <span>파트 2. 힐링약국 핵심 역량 지표</span>
                <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-bold">
                  자신감 문항
                </span>
              </div>

              <div className="bg-white/90 rounded-2xl p-4 border-2 border-purple-200 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  {KPI_QUESTION.title}
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                  {KPI_QUESTION.statement}
                </p>

                <div className="grid grid-cols-5 gap-1 pt-1">
                  {LIKERT_OPTIONS.map((opt) => {
                    const isChecked = kpiScore === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setKpiScore(opt.value)}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border-2 transition-all text-center ${
                          isChecked
                            ? 'bg-purple-100 border-purple-400 shadow-xs font-bold text-purple-950'
                            : 'bg-[#FDFCF0] border-white hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="text-base mb-0.5">{opt.emoji}</span>
                        <span className="text-[9.5px] leading-tight break-keep">{opt.label}</span>
                        <span className="text-[8.5px] text-slate-400 font-mono mt-0.5">{opt.value}점</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 3: Common Descriptive Questions (21, 22) */}
            <div className="space-y-3 pt-2">
              <div className="bg-rose-100/70 px-3.5 py-1.5 rounded-xl border border-rose-200 text-xs font-jua text-rose-900 flex items-center justify-between">
                <span>파트 3. 나의 마음 들여다보기 (서술형)</span>
                <span className="text-[10px] text-rose-700">솔직하게 적어보아요</span>
              </div>

              {/* Q21 */}
              <div className="bg-white/85 rounded-2xl p-4 border-2 border-white shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-jua text-xs text-slate-700 flex items-center gap-1.5">
                    <PenLine className="w-3.5 h-3.5 text-rose-500" />
                    <span>21. {COMMON_DESCRIPTIVE_QUESTIONS.q21.title}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {COMMON_DESCRIPTIVE_QUESTIONS.q21.guide}
                </p>
                <input
                  type="text"
                  value={descriptive.q21_feelings || ''}
                  onChange={(e) =>
                    setDescriptive((prev) => ({ ...prev, q21_feelings: e.target.value }))
                  }
                  placeholder={COMMON_DESCRIPTIVE_QUESTIONS.q21.placeholder}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                />
              </div>

              {/* Q22 */}
              <div className="bg-white/85 rounded-2xl p-4 border-2 border-white shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-jua text-xs text-slate-700 flex items-center gap-1.5">
                    <PenLine className="w-3.5 h-3.5 text-rose-500" />
                    <span>22. {COMMON_DESCRIPTIVE_QUESTIONS.q22.title}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {COMMON_DESCRIPTIVE_QUESTIONS.q22.guide}
                </p>
                <textarea
                  rows={2}
                  value={descriptive.q22_stressCoping || ''}
                  onChange={(e) =>
                    setDescriptive((prev) => ({ ...prev, q22_stressCoping: e.target.value }))
                  }
                  placeholder={COMMON_DESCRIPTIVE_QUESTIONS.q22.placeholder}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* Section 4: If Post-Test -> Program Effect (23~27) & Growth Descriptive (28~30) */}
            {!isPre && (
              <div className="space-y-3 pt-2">
                <div className="bg-teal-100/70 px-3.5 py-1.5 rounded-xl border border-teal-200 text-xs font-jua text-teal-900 flex items-center justify-between">
                  <span>파트 4. 힐링약국 프로그램 효과 평가 (5문항)</span>
                  <span className="text-[11px] font-mono">
                    {Object.keys(effectAnswers).length}/5 완료
                  </span>
                </div>

                {PROGRAM_EFFECT_QUESTIONS.map((pe) => {
                  const selectedVal = effectAnswers[pe.id];
                  return (
                    <div
                      key={pe.id}
                      className="bg-white/85 rounded-2xl p-3.5 border-2 border-white shadow-xs space-y-2"
                    >
                      <span className="text-[10px] font-mono font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                        Q{pe.num}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                        {pe.statement}
                      </p>

                      <div className="grid grid-cols-5 gap-1 pt-1">
                        {LIKERT_OPTIONS.map((opt) => {
                          const isChecked = selectedVal === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleSelectEffect(pe.id, opt.value)}
                              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border-2 transition-all text-center ${
                                isChecked
                                  ? 'bg-teal-100 border-teal-400 shadow-xs font-bold text-teal-950'
                                  : 'bg-[#FDFCF0] border-white hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              <span className="text-base mb-0.5">{opt.emoji}</span>
                              <span className="text-[9.5px] leading-tight break-keep">{opt.label}</span>
                              <span className="text-[8.5px] text-slate-400 font-mono mt-0.5">{opt.value}점</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Growth Descriptive (28, 29, 30) */}
                <div className="bg-indigo-100/70 px-3.5 py-1.5 rounded-xl border border-indigo-200 text-xs font-jua text-indigo-900 mt-4 flex items-center justify-between">
                  <span>파트 5. 나의 힐링 성장 스토리 (서술형)</span>
                  <span className="text-[10px] text-indigo-700">공모전 &amp; 생기부 우수 사례</span>
                </div>

                {POST_DESCRIPTIVE_GROWTH_QUESTIONS.map((gq) => {
                  const val = (descriptive as any)[gq.id] || '';
                  return (
                    <div
                      key={gq.id}
                      className="bg-white/85 rounded-2xl p-4 border-2 border-white shadow-xs space-y-1.5"
                    >
                      <span className="font-jua text-xs text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{gq.num}. {gq.title}</span>
                      </span>
                      <p className="text-xs text-slate-600 font-medium">
                        {gq.guide}
                      </p>
                      <textarea
                        rows={2}
                        value={val}
                        onChange={(e) =>
                          setDescriptive((prev) => ({ ...prev, [gq.id]: e.target.value }))
                        }
                        placeholder={gq.placeholder}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium leading-relaxed resize-none"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-3 sticky bottom-0 bg-[#FDFCF0] pb-1">
              <button
                type="submit"
                disabled={!allAnswered}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 disabled:from-slate-300 disabled:to-slate-400 text-white font-jua text-sm sm:text-base rounded-2xl shadow-lg border-2 border-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {allAnswered
                    ? `${isPre ? '사전' : '사후'} 검사 제출하고 쿠키 받기 (+${isPre ? '2' : '3'}쿠키)`
                    : `모든 문항에 체크해주세요 (${Object.keys(answers).length}/20 문항)`}
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
