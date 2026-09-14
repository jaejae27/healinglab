import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '../../types';
import { ShieldCheck, Check, FileText, AlertCircle, Sparkles } from 'lucide-react';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  student: Student;
  onAgree: () => void;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  isOpen,
  student,
  onAgree
}) => {
  const [agreeCollection, setAgreeCollection] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);

  if (!isOpen) return null;

  const canProceed = agreeCollection && agreeAge;

  const handleAllAgree = () => {
    const nextState = !canProceed;
    setAgreeCollection(nextState);
    setAgreeAge(nextState);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-[#FDFCF0] rounded-[36px] border-4 border-white shadow-2xl p-6 md:p-7 max-h-[90vh] flex flex-col text-[#4A4A4A]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-[#5A5A40]/10 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl border-2 border-white shadow-xs">
              📜
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  교육부 학습지원 필수기준 준수
                </span>
              </div>
              <h2 className="font-jua text-lg md:text-xl text-[#5A5A40]">
                개인정보 수집·이용 및 아동보호 동의서
              </h2>
            </div>
          </div>

          {/* Student Welcome Pill */}
          <div className="mb-3 px-3.5 py-2 bg-[#FFFBEB] rounded-2xl border-2 border-white flex items-center justify-between text-xs font-bold text-[#854D0E] shrink-0">
            <span>대상 학생: {student.grade}학년 {student.classNum}반 {student.number}번 {student.name}</span>
            <span className="text-[11px] text-amber-700 bg-amber-200/70 px-2 py-0.5 rounded-md">1회 최초 동의</span>
          </div>

          {/* Scrollable Terms Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 text-xs text-[#5A5A40]/90 leading-relaxed border border-[#5A5A40]/10 rounded-2xl p-4 bg-white/70">
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-950 space-y-1">
              <p className="font-bold flex items-center gap-1 text-[13px]">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>학생 개인정보 최소수집 및 보호 원칙 안내</span>
              </p>
              <p className="text-[11px] text-blue-800">
                「힐링약국」은 학교 현장의 사회정서교육 지원을 목적으로 하며, 교육활동에 꼭 필요한 최소한의 정보만을 안전하게 처리합니다.
              </p>
            </div>

            {/* Table of Collection Details */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800 text-[13px] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>1. 개인정보 수집·이용 내역</span>
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2.5">수집 항목</th>
                      <th className="py-2 px-2.5">수집 및 이용 목적</th>
                      <th className="py-2 px-2.5">보유·이용 기간</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr>
                      <td className="py-2 px-2.5 font-semibold text-slate-900">
                        학년, 반, 번호, 성명, 사회정서 사전·사후 검사 결과, 마음신호 및 행동처방 실천 기록
                      </td>
                      <td className="py-2 px-2.5 text-slate-700">
                        • 맞춤형 마음신호 처방전 발급 및 행동 실천 기록<br />
                        • 사회정서역량(SEL) 전후 성장 효과성 분석 및 학생 지도
                      </td>
                      <td className="py-2 px-2.5 font-bold text-teal-700 whitespace-nowrap">
                        1년<br />
                        <span className="text-[10px] text-slate-400 font-normal">(학년도 종료 시 파기)</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Principles & Rights */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800 text-[13px]">
                2. 정보주체의 권리 및 동의 거부 안내
              </h4>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 pl-1">
                <li>
                  학생 및 법정대리인은 언제든지 본인의 개인정보에 대한 <strong>열람, 정정, 삭제, 처리정지</strong>를 요구할 수 있습니다.
                </li>
                <li>
                  개인정보 수집·이용에 동의를 거부할 권리가 있으며, 동의를 거부할 경우 힐링약국 맞춤 처방전 발급 및 기록 서비스 이용이 제한될 수 있습니다.
                </li>
                <li>
                  본 웹앱은 개인정보를 외부 상업적 제3자에게 절대 판매하거나 제공하지 않습니다.
                </li>
              </ul>
            </div>

            {/* Age < 14 */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800 text-[13px]">
                3. 만 14세 미만 아동의 개인정보 보호
              </h4>
              <p className="text-[11px] text-slate-600">
                본 서비스는 중학교 정규 교육과정 및 교과·창의적 체험활동의 일환으로 학교운영위원회의 심의 또는 학교장 승인 하에 운영되며, 학교의 가정통신문 및 동의 절차를 준수합니다.
              </p>
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="mt-4 pt-3 border-t-2 border-[#5A5A40]/10 space-y-2 shrink-0">
            <button
              type="button"
              onClick={handleAllAgree}
              className="w-full flex items-center justify-between p-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors text-left"
            >
              <span className="font-jua text-xs text-amber-950">전체 약관에 모두 동의합니다</span>
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${canProceed ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300 bg-white'}`}>
                {canProceed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>

            <label className="flex items-center justify-between px-1 py-1 cursor-pointer text-xs select-none">
              <span className="text-slate-700">
                <span className="text-rose-600 font-bold">[필수]</span> 개인정보 수집 및 이용 내역을 확인하였으며 동의합니다.
              </span>
              <input
                type="checkbox"
                checked={agreeCollection}
                onChange={(e) => setAgreeCollection(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between px-1 py-1 cursor-pointer text-xs select-none">
              <span className="text-slate-700">
                <span className="text-rose-600 font-bold">[필수]</span> 만 14세 미만 아동 보호 및 학교 교육활동 목적 이용에 동의합니다.
              </span>
              <input
                type="checkbox"
                checked={agreeAge}
                onChange={(e) => setAgreeAge(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
            </label>
          </div>

          {/* Action Button */}
          <div className="mt-4 shrink-0">
            <button
              onClick={onAgree}
              disabled={!canProceed}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-pink-500 disabled:from-slate-300 disabled:to-slate-400 text-white font-jua text-base rounded-2xl shadow-lg border-2 border-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl"
            >
              <Sparkles className="w-4 h-4" />
              <span>동의하고 힐링약국 시작하기</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
