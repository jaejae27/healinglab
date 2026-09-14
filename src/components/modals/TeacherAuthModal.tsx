import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../../services/storage';
import { ShieldCheck, Lock, Eye, EyeOff, X, ArrowRight, KeyRound } from 'lucide-react';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMsg(null);
      setShowPassword(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const entered = password.trim();
    if (!entered) {
      setErrorMsg('비밀번호를 입력해주세요.');
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    const correctPassword = StorageService.getTeacherPassword();

    if (entered === correctPassword) {
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } else {
      setIsSubmitting(false);
      setErrorMsg('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/80 border border-indigo-400/40 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="font-jua text-base tracking-wide flex items-center gap-1.5">
                <span>선생님 관리자 로그인</span>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded">
                  AUTH
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">교사 전용 대시보드 접근 인증</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-indigo-50/70 border border-indigo-150 rounded-2xl p-3.5 flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 leading-relaxed break-keep">
              <p className="font-bold">선생님 전용 관리 공간입니다.</p>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                초기 기본 비밀번호는 <strong className="font-mono bg-indigo-100 px-1 py-0.5 rounded text-indigo-900 font-bold">1234</strong> 입니다. (로그인 후 상단에서 언제든 변경 가능합니다)
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 ml-1">
              관리자 비밀번호 입력
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="비밀번호 입력 (기본: 1234)"
                autoComplete="current-password"
                className={`w-full pl-10 pr-11 py-3 bg-slate-50 border-2 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white transition-all ${
                  errorMsg
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 bg-rose-50/30'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-600 ml-1 flex items-center gap-1 animate-fade-in">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-jua text-xs rounded-2xl transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="flex-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-jua text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
            >
              <span>관리자 확인 및 접속</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
