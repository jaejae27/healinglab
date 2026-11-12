import React, { useState, useEffect, useRef } from 'react';
import { CryptoAuthService } from '../../utils/cryptoAuth';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  X,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'login' | 'change'>('login');

  // Login form state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const loginInputRef = useRef<HTMLInputElement>(null);

  // Change password form state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const changeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMsg(null);
      setSuccessBanner(null);
      setShowPassword(false);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setChangeError(null);
      setActiveTab('login');

      const lockout = CryptoAuthService.checkLockout();
      if (lockout.locked) {
        setLockoutSeconds(lockout.remainingSeconds);
        setErrorMsg(`연속 실패로 인해 ${lockout.remainingSeconds}초 동안 로그인이 일시 차단됩니다.`);
      } else {
        setLockoutSeconds(0);
        setTimeout(() => {
          loginInputRef.current?.focus();
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

  // Handle focus when switching tabs
  useEffect(() => {
    if (activeTab === 'login') {
      setTimeout(() => loginInputRef.current?.focus(), 80);
    } else {
      setTimeout(() => changeInputRef.current?.focus(), 80);
    }
  }, [activeTab]);

  if (!isOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const entered = password.trim();
    if (!entered) {
      setErrorMsg('비밀번호를 입력해주세요.');
      loginInputRef.current?.focus();
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
      loginInputRef.current?.focus();
      loginInputRef.current?.select();
    }
  };

  // Handle Change Password Submit
  const handleChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);

    const cur = currentPw.trim();
    const nxt = newPw.trim();
    const conf = confirmPw.trim();

    if (!cur) {
      setChangeError('현재 비밀번호를 입력해주세요. (초기값: 1234)');
      changeInputRef.current?.focus();
      return;
    }

    if (nxt.length < 4) {
      setChangeError('새 비밀번호는 최소 4자리 이상이어야 합니다.');
      return;
    }

    if (nxt !== conf) {
      setChangeError('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsChanging(true);
    const result = await CryptoAuthService.changePassword(cur, nxt);
    setIsChanging(false);

    if (result.success) {
      // Switch back to login with success banner and prefilled password
      setPassword(nxt);
      setSuccessBanner('🎉 비밀번호가 안전하게 변경되었습니다! 바로 로그인하세요.');
      setActiveTab('login');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } else {
      setChangeError(result.message || '비밀번호 변경에 실패했습니다.');
    }
  };

  // Quick reset to 1234
  const handleResetToDefault = async () => {
    await CryptoAuthService.resetToDefault();
    setPassword('1234');
    setCurrentPw('1234');
    setLockoutSeconds(0);
    setErrorMsg(null);
    setChangeError(null);
    setSuccessBanner('🔑 관리자 비밀번호가 초기값(1234)으로 재설정되었습니다.');
    loginInputRef.current?.focus();
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
                <span>선생님 관리자 모드</span>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded">
                  SECURE
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">Salted SHA-256 암호화 보안 시스템</p>
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1.5 text-xs font-jua">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setChangeError(null);
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-indigo-900 shadow-xs font-bold border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
            <span>관리자 로그인</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('change');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'change'
                ? 'bg-white text-indigo-900 shadow-xs font-bold border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>비밀번호 변경</span>
          </button>
        </div>

        {/* Success Banner if any */}
        {successBanner && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Tab 1: LOGIN */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
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
              <div className="flex items-center justify-between ml-1">
                <label className="block text-xs font-bold text-slate-700">
                  관리자 비밀번호
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('change')}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                >
                  비밀번호 변경하기 &rarr;
                </button>
              </div>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  ref={loginInputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg && lockoutSeconds <= 0) setErrorMsg(null);
                    if (successBanner) setSuccessBanner(null);
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
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </p>
              )}

              {lockoutSeconds > 0 && (
                <p className="text-[11px] font-bold text-amber-600 ml-1">
                  ⏳ 잠금 해제까지: {lockoutSeconds}초
                </p>
              )}

              {/* Quick Info & Reset Bar */}
              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10.5px] text-slate-500 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-700">
                    💡 초기 비밀번호: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-indigo-700">1234</code>
                  </p>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="flex items-center gap-1 text-[10.5px] text-indigo-600 hover:text-indigo-800 underline font-bold cursor-pointer"
                    title="관리자 비밀번호를 1234로 초기화"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>1234로 초기화</span>
                  </button>
                </div>
                <p>• 원하시는 비밀번호로 언제든 상단 [비밀번호 변경] 탭에서 수정하실 수 있습니다.</p>
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
                {isSubmitting ? '인증 확인 중...' : '인증하고 들어가기'}
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: CHANGE PASSWORD */
          <form onSubmit={handleChangeSubmit} className="p-6 space-y-3.5">
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2 text-xs text-amber-950 leading-relaxed">
              <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">선생님 관리자 비밀번호 변경</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  현재 비밀번호를 확인한 후 새로운 4자리 이상 비밀번호로 설정합니다.
                </p>
              </div>
            </div>

            {changeError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-center gap-2 text-xs font-bold text-rose-700 animate-fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{changeError}</span>
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-xs font-bold text-slate-700">
                  현재 비밀번호
                </label>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                >
                  기억 안 날 땐 1234로 리셋
                </button>
              </div>
              <div className="relative">
                <input
                  ref={changeInputRef}
                  type={showCurrentPw ? 'text' : 'password'}
                  required
                  value={currentPw}
                  onChange={(e) => {
                    setCurrentPw(e.target.value);
                    if (changeError) setChangeError(null);
                  }}
                  placeholder="현재 비밀번호 (기본: 1234)"
                  className="w-full pl-3.5 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  tabIndex={-1}
                >
                  {showCurrentPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 ml-1">
                새 비밀번호 (4자리 이상)
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  required
                  value={newPw}
                  onChange={(e) => {
                    setNewPw(e.target.value);
                    if (changeError) setChangeError(null);
                  }}
                  placeholder="새로 설정할 비밀번호 입력"
                  className="w-full pl-3.5 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  tabIndex={-1}
                >
                  {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 ml-1">
                새 비밀번호 확인
              </label>
              <input
                type={showNewPw ? 'text' : 'password'}
                required
                value={confirmPw}
                onChange={(e) => {
                  setConfirmPw(e.target.value);
                  if (changeError) setChangeError(null);
                }}
                placeholder="새 비밀번호 다시 입력"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setChangeError(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                취소 (로그인으로)
              </button>
              <button
                type="submit"
                disabled={isChanging || !currentPw || !newPw || !confirmPw}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 text-white font-jua text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isChanging ? '변경 중...' : '새 비밀번호로 변경하기'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
