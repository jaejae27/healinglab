import React, { useState, useRef, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { KeyRound, Lock, Eye, EyeOff, X, Check, ShieldAlert } from 'lucide-react';

interface TeacherPasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TeacherPasswordChangeModal: React.FC<TeacherPasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const currentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setTimeout(() => {
        currentInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const actualCurrent = StorageService.getTeacherPassword();
    if (currentPassword.trim() !== actualCurrent) {
      setErrorMsg('현재 비밀번호가 일치하지 않습니다.');
      currentInputRef.current?.focus();
      return;
    }

    const trimmedNew = newPassword.trim();
    if (trimmedNew.length < 4) {
      setErrorMsg('새 비밀번호는 최소 4자리 이상이어야 합니다.');
      return;
    }

    if (trimmedNew !== confirmPassword.trim()) {
      setErrorMsg('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    const ok = StorageService.setTeacherPassword(trimmedNew);
    if (ok) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden animate-scale-up text-left"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xs">
              <KeyRound className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <h3 className="font-jua text-base tracking-wide flex items-center gap-1.5">
                <span>교사 비밀번호 변경</span>
              </h3>
              <p className="text-[11px] text-slate-400">선생님 관리자 모드 접속 보안 설정</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center gap-2 text-xs font-bold text-rose-700 animate-fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 ml-1">
              현재 비밀번호
            </label>
            <div className="relative">
              <input
                ref={currentInputRef}
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="현재 사용 중인 비밀번호"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="새로운 비밀번호 입력"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 ml-1">
              새 비밀번호 확인
            </label>
            <input
              type={showNew ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="새로운 비밀번호 다시 입력"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white"
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed ml-1">
            * 변경된 비밀번호는 교사 로그인 시 즉시 적용됩니다.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-jua text-xs rounded-xl transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-jua text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>비밀번호 변경 완료</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
