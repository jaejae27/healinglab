import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GuardianVerificationMethod, Student } from '../../types';
import { StorageService } from '../../services/storage';
import { Users, X, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';

interface GuardianConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudents: Student[];
  onComplete: () => void;
}

export const GuardianConsentModal: React.FC<GuardianConsentModalProps> = ({
  isOpen,
  onClose,
  selectedStudents,
  onComplete
}) => {
  const [method, setMethod] = useState<GuardianVerificationMethod>('paper_notice');
  const [verifierName, setVerifierName] = useState<string>('허재이');
  const [documentRef, setDocumentRef] = useState<string>('2026-가정통신-14호');
  const [consentVersion, setConsentVersion] = useState<string>('2026.10-v1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || selectedStudents.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifierName.trim() || !documentRef.trim()) {
      alert('담당 교사 성명과 문서 관리번호를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    const studentIds = selectedStudents.map((s) => s.id);
    StorageService.verifyGuardianConsentBatch(studentIds, {
      method,
      verifierName: verifierName.trim(),
      documentRef: documentRef.trim(),
      consentVersion: consentVersion.trim()
    });

    setIsSubmitting(false);
    onComplete();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden flex flex-col text-slate-800"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-800 to-indigo-900 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-600/80 border border-teal-400/40 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5 text-teal-200" />
              </div>
              <div>
                <h3 className="font-jua text-base tracking-wide flex items-center gap-1.5">
                  <span>법정대리인(보호자) 동의 확인 등록</span>
                </h3>
                <p className="text-[11px] text-teal-200">
                  대상 학생: <strong>{selectedStudents.length}명</strong>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3 text-xs text-teal-950 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <span>📋</span>
                <span>공식 확인 근거 등록 원칙</span>
              </p>
              <p className="text-[11px] text-teal-900">
                개인정보보호법에 따라 만 14세 미만 학생의 법정대리인 동의는 학생 클릭으로 처리할 수 없으며,
                학교의 <strong>가정통신문(서면 회신서) 또는 학교 전자 알리미</strong> 공식 회신 근거를 담당 교사가 확인한 후 등록합니다.
              </p>
            </div>

            {/* Selected Student Pill List */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                동의 확인 대상 학생 ({selectedStudents.length}명)
              </label>
              <div className="max-h-24 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-1 text-[11px]">
                {selectedStudents.map((s) => (
                  <span
                    key={s.id}
                    className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-700"
                  >
                    {s.grade}-{s.classNum} ({s.number}번) {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Verification Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                확인 방법 (근거 종류)
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as GuardianVerificationMethod)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="paper_notice">가정통신문 (종이 서면 회신서 확인)</option>
                <option value="school_e_notice">학교 e-알리미 (전자 설문/회신 확인)</option>
                <option value="written_form">별도 학교 개인정보 서면 동의서</option>
                <option value="other">기타 학교 공문서 근거</option>
              </select>
            </div>

            {/* Verifier Name & Document Ref */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  확인 담당 교사
                </label>
                <input
                  type="text"
                  required
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  placeholder="예: 허재이"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  통신문/문서 관리번호
                </label>
                <input
                  type="text"
                  required
                  value={documentRef}
                  onChange={(e) => setDocumentRef(e.target.value)}
                  placeholder="예: 2026-가정통신-14호"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>

            {/* Version */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                동의서 버전
              </label>
              <input
                type="text"
                value={consentVersion}
                onChange={(e) => setConsentVersion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white text-xs font-jua flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>보호자 동의 완료 등록하기</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
