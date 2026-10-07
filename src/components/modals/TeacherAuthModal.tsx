import React, { useState, useEffect, useRef } from 'react';
import { CryptoAuthService } from '../../utils/cryptoAuth';
import { ShieldCheck, Lock, Eye, EyeOff, X, KeyRound, AlertTriangle } from 'lucide-react';

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
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMsg(null);
      setShowPassword(false);
      const lockout = CryptoAuthService.checkLockout();
      if (lockout.locked) {
        setLockoutSeconds(lockout.remainingSeconds);
        setErrorMsg(`연속 실패로 인해 ${lockout.remainingSeconds}초 동안 로그인이 일시 차단됩니다.`);
      } else {
        setLockoutSeconds(0);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMsg(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const entered = password.trim();
    if (!entered) {
      setErrorMsg('비밀번호를 입력해주세요.');
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    const result = await CryptoAuthService.verifyPassword(entered);
    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      if (result.locked) {
        setLockoutSeconds(result.remainingSeconds || 30);
      }
      setErrorMsg(result.error || '비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
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
        aria-labelledby="teacher-modal-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/80 border border-indigo-400/40 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 id="teacher-modal-title" className="font-jua text-base tracking-wide flex items-center gap-1.5">
                <span>선생님 관리자 로그인</span>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded">
                  SECURE
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">Salted SHA-256 암호화 보호</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 leading-relaxed break-keep">
              <p className="font-bold">선생님 전용 관리 공간입니다.</p>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                학생들의 전체 기록 및 개인정보를 다루므로 관리자만 접근할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 ml-1">
              관리자 비밀번호
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg && lockoutSeconds <= 0) setErrorMsg(null);
                }}
                disabled={isSubmitting || lockoutSeconds > 0}
                placeholder="비밀번호 입력 (초기: 1234)"
                autoComplete="current-password"
                className={`w-full pl-10 pr-11 py-2.5 bg-slate-50 border-2 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition-colors ${
                  errorMsg ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg && (
              <p className="text-[11px] font-bold text-rose-600 ml-1 flex items-start gap-1 leading-snug">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </p>
            )}

            {lockoutSeconds > 0 && (
              <p className="text-[11px] font-bold text-amber-600 ml-1">
                ⏳ 잠금 해제까지: {lockoutSeconds}초
              </p>
            )}

            <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-[10.5px] text-slate-500 space-y-0.5">
              <p className="font-bold text-slate-700">💡 운영자 주의사항:</p>
              <p>• 초기 비밀번호는 <code className="bg-slate-200 px-1 rounded font-bold text-slate-800">1234</code>입니다.</p>
              <p>• 배포 즉시 대시보드 환경설정에서 안전한 고유 비밀번호로 변경하세요.</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password.trim() || lockoutSeconds > 0}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-700 to-slate-900 hover:from-indigo-800 hover:to-slate-950 text-white font-jua text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              인증하고 들어가기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
