import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '../../types';
import { ShieldCheck, Check, FileText, AlertCircle, Sparkles, BookOpen, HeartHandshake } from 'lucide-react';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  student: Student;
  onAgree: (options: { optionalResearchAgreed: boolean }) => void;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  isOpen,
  student,
  onAgree
}) => {
  const [agreeInformed, setAgreeInformed] = useState(false);
  const [agreeCollection, setAgreeCollection] = useState(false);
  const [agreeSensitive, setAgreeSensitive] = useState(false);
  const [agreeResearch, setAgreeResearch] = useState(false);

  if (!isOpen) return null;

  const canProceed = agreeInformed && agreeCollection && agreeSensitive;

  const handleAllAgree = () => {
    const nextState = !canProceed;
    setAgreeInformed(nextState);
    setAgreeCollection(nextState);
    setAgreeSensitive(nextState);
    setAgreeResearch(nextState);
  };

  const handleProceed = () => {
    if (!canProceed) return;
    onAgree({ optionalResearchAgreed: agreeResearch });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-[#FDFCF0] rounded-[32px] sm:rounded-[36px] border-4 border-white shadow-2xl p-5 sm:p-7 max-h-[92vh] flex flex-col text-[#4A4A4A] overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3 pb-3 border-b-2 border-[#5A5A40]/10 shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl border-2 border-white shadow-xs shrink-0">
              📜
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  학습지원 소프트웨어 기준 준수
                </span>
                <span className="text-[10px] text-slate-500 font-mono">버전 2026.10-v1</span>
              </div>
              <h2 className="font-jua text-lg sm:text-xl text-[#5A5A40]">
                개인정보 수집·이용 및 학생 이용 안내서
              </h2>
            </div>
          </div>

          {/* Student Welcome Pill */}
          <div className="mb-2.5 px-3 py-1.5 bg-[#FFFBEB] rounded-2xl border-2 border-white flex items-center justify-between text-xs font-bold text-[#854D0E] shrink-0">
            <span>대상 학생: {student.grade}학년 {student.classNum}반 {student.number}번 {student.name}</span>
            <span className="text-[10.5px] text-amber-700 bg-amber-200/70 px-2 py-0.5 rounded-md">최초 1회 안내</span>
          </div>

          {/* Scrollable Terms Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs text-[#5A5A40]/90 leading-relaxed border border-[#5A5A40]/10 rounded-2xl p-3.5 bg-white/75">
            <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-950 space-y-1">
              <p className="font-bold flex items-center gap-1 text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>개인정보 최소수집 및 보호 원칙</span>
              </p>
              <p className="text-[11px] text-blue-800 leading-normal">
                「힐링약국」은 학교 현장의 사회정서교육을 지원하며, 교육활동에 꼭 필요한 정보(학년·반·번호·이름, 활동 기록)만을 안전하게 처리합니다.
                전화번호나 이메일, 외부 병원 진료기록은 일체 수집하지 않습니다.
              </p>
            </div>

            {/* Guardian Consent Separation Notice */}
            <div className="p-2.5 bg-amber-50/90 rounded-xl border border-amber-200 text-amber-950 space-y-1">
              <p className="font-bold flex items-center gap-1 text-xs text-amber-900">
                <HeartHandshake className="w-4 h-4 text-amber-700 shrink-0" />
                <span>법정대리인(보호자) 동의 절차 분리 안내</span>
              </p>
              <p className="text-[11px] text-amber-900 leading-normal">
                만 14세 미만 학생의 법정대리인(보호자) 동의는 학생 클릭으로 대리 완료되지 않으며,
                <strong>학교에서 발송하는 가정통신문(서면 회신) 또는 학교 e-알리미</strong>를 통해 담당 선생님이 별도로 공식 접수·확인하여 등록합니다.
              </p>
            </div>

            {/* Table of Collection Details */}
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>1. 수집·이용 항목 및 목적</span>
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-1.5 px-2">항목</th>
                      <th className="py-1.5 px-2">목적</th>
                      <th className="py-1.5 px-2">보유기간</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr>
                      <td className="py-1.5 px-2 font-semibold text-slate-900">
                        학년, 반, 번호, 성명, 활동기록, SEL 검사결과
                      </td>
                      <td className="py-1.5 px-2 text-slate-700">
                        맞춤 처방전 발급, 5일 실천 미션 기록, 사회정서 성장 지원
                      </td>
                      <td className="py-1.5 px-2 font-bold text-teal-700 whitespace-nowrap">
                        1년 (학년도 종료 시 파기)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rights & Alternative Activity */}
            <div className="space-y-1 text-[11px] text-slate-600">
              <h4 className="font-bold text-slate-800 text-xs">
                2. 학생의 권리 및 대체 활동 안내
              </h4>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                <li>학생은 언제든지 마이페이지에서 본인의 모든 기록을 확인하고 <strong>직접 영구 삭제(동의 철회)</strong>할 수 있습니다.</li>
                <li>본 서비스 이용을 원하지 않는 학생은 <strong>오프라인 인쇄용 워크북</strong>을 통해 동일한 교육 활동에 참여할 수 있습니다.</li>
              </ul>
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="mt-2.5 pt-2 border-t-2 border-[#5A5A40]/10 space-y-1.5 shrink-0">
            <button
              type="button"
              onClick={handleAllAgree}
              className="w-full flex items-center justify-between p-2 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors text-left"
            >
              <span className="font-jua text-xs text-amber-950">필수 및 선택 약관 전체 동의하기</span>
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${canProceed && agreeResearch ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300 bg-white'}`}>
                {canProceed && agreeResearch && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>

            <label className="flex items-center justify-between px-1 py-0.5 cursor-pointer text-xs select-none">
              <span className="text-slate-700 text-[11.5px]">
                <span className="text-rose-600 font-bold">[필수]</span> 학생 이용 안내 및 교육 목적(메타포)을 숙지하였습니다.
              </span>
              <input
                type="checkbox"
                checked={agreeInformed}
                onChange={(e) => setAgreeInformed(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between px-1 py-0.5 cursor-pointer text-xs select-none">
              <span className="text-slate-700 text-[11.5px]">
                <span className="text-rose-600 font-bold">[필수]</span> 기본 개인정보(학년, 반, 번호, 이름) 수집·이용에 동의합니다.
              </span>
              <input
                type="checkbox"
                checked={agreeCollection}
                onChange={(e) => setAgreeCollection(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between px-1 py-0.5 cursor-pointer text-xs select-none">
              <span className="text-slate-700 text-[11.5px]">
                <span className="text-rose-600 font-bold">[필수]</span> 가상 마음신호 및 정서 실천 기록(민감성 교육정보) 처리에 동의합니다.
              </span>
              <input
                type="checkbox"
                checked={agreeSensitive}
                onChange={(e) => setAgreeSensitive(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between px-1 py-0.5 cursor-pointer text-xs select-none">
              <span className="text-slate-600 text-[11px]">
                <span className="text-indigo-600 font-bold">[선택]</span> 교육 효과성 분석 및 수업 연구를 위한 익명 통계 활용에 동의합니다.
              </span>
              <input
                type="checkbox"
                checked={agreeResearch}
                onChange={(e) => setAgreeResearch(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
            </label>
          </div>

          {/* Action Button */}
          <div className="mt-3 shrink-0">
            <button
              onClick={handleProceed}
              disabled={!canProceed}
              className="w-full py-3 bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 disabled:from-slate-300 disabled:to-slate-400 text-white font-jua text-base rounded-2xl shadow-lg border-2 border-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              <span>확인하고 힐링약국 시작하기</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
