import React, { useState, useMemo } from 'react';
import { Student } from '../../types';
import { StorageService } from '../../services/storage';
import { HealyCharacter } from '../character/HealyCharacter';
import { AppFooter } from '../common/AppFooter';
import { Sparkles, ShieldCheck, Lock, Eye, EyeOff, User, FileText, BookOpen, School } from 'lucide-react';

interface StudentLoginProps {
  onLogin: (student: Student) => void;
  onSwitchToTeacher: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenTerms?: () => void;
  onOpenTeacherGuide?: () => void;
  onOpenAdoptionGuide?: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  onLogin,
  onSwitchToTeacher,
  onOpenPrivacyPolicy,
  onOpenTerms,
  onOpenTeacherGuide,
  onOpenAdoptionGuide
}) => {
  const [classes, setClasses] = useState(() => StorageService.getClasses().filter((c) => c.active));

  React.useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setClasses(StorageService.getClasses().filter((c) => c.active));
    });
    return () => unsub();
  }, []);

  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedClass, setSelectedClass] = useState<number>(1);
  const [selectedNumber, setSelectedNumber] = useState<number>(1);
  const [studentName, setStudentName] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Available class numbers for selected grade
  const availableClasses = useMemo(() => {
    return classes.filter((c) => c.grade === selectedGrade);
  }, [classes, selectedGrade]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const result = StorageService.authenticateStudent(
      selectedGrade,
      selectedClass,
      selectedNumber,
      studentName,
      pin
    );

    if (!result.success || !result.student) {
      setAuthError(result.error || '학생 정보를 확인하지 못했습니다. 번호, 이름, 비밀번호를 다시 확인해주세요.');
      return;
    }

    StorageService.setCurrentStudentId(result.student.id);
    onLogin(result.student);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#4A4A4A] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Decorative Floating Ambient Accents */}
      <div className="absolute top-10 left-10 text-5xl opacity-20 pointer-events-none select-none">✨</div>
      <div className="absolute top-20 right-12 text-4xl opacity-15 pointer-events-none select-none">💖</div>
      <div className="absolute bottom-10 right-10 text-5xl opacity-20 rotate-12 pointer-events-none select-none">🧪</div>

      {/* Ambient Blur Glows */}
      <div className="absolute top-1/4 -left-12 w-64 h-64 bg-[#D1FAE5] rounded-full filter blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-12 w-72 h-72 bg-[#FFEDD5] rounded-full filter blur-3xl opacity-35 pointer-events-none" />

      {/* Top Action Switchers */}
      <div className="w-full max-w-sm flex items-center justify-between mb-3.5 relative z-10 gap-2">
        <button
          type="button"
          onClick={onOpenAdoptionGuide}
          className="text-xs text-amber-900 bg-amber-100/90 hover:bg-amber-200/90 border-2 border-white px-3.5 py-2 rounded-2xl shadow-sm flex items-center gap-1.5 transition-all font-jua cursor-pointer hover:shadow-md"
          title="다른 학교 도입 안내"
        >
          <School className="w-4 h-4 text-amber-800 shrink-0" />
          <span>우리 학교 힐링약국 만들기</span>
        </button>

        <button
          type="button"
          onClick={onSwitchToTeacher}
          className="text-xs text-[#5A5A40] bg-white/80 hover:bg-white border-2 border-white px-3.5 py-2 rounded-2xl shadow-sm flex items-center gap-1.5 transition-all font-bold whitespace-nowrap cursor-pointer hover:shadow-md"
        >
          <ShieldCheck className="w-4 h-4 text-[#7C3AED] shrink-0" />
          <span className="whitespace-nowrap">선생님 관리자 모드</span>
        </button>
      </div>

      <div className="w-full max-w-sm bg-white/85 backdrop-blur-md rounded-[44px] border-4 border-white shadow-2xl p-6 sm:p-7 relative overflow-hidden z-10">
        {/* Mascot Greeting */}
        <div className="flex flex-col items-center mb-5">
          <HealyCharacter
            emotion="welcome"
            size="md"
            dialogue="어서 와! 여기는 힐링약국이야.<br>오늘 네 마음 상태를 같이 살펴볼까?"
            subDialogue="나에게 맞는 마음 처방전을 찾아봐요 💊"
          />
        </div>

        {/* Privacy Roster Protection Notice */}
        <div className="mb-4 p-2.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 leading-tight flex items-start gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>개인정보 보호를 위해 학생 전체 명단을 화면에 노출하지 않습니다. 내 번호와 이름, 비밀번호를 직접 입력해주세요.</span>
        </div>

        {/* Login Selection Form */}
        <form onSubmit={handleStart} className="space-y-3.5">
          {/* Grade, Class & Number selectors */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-[#5A5A40] mb-1 ml-1">
                학년
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => {
                  const g = Number(e.target.value);
                  setSelectedGrade(g);
                  setSelectedClass(1);
                  setAuthError(null);
                }}
                className="w-full bg-[#FDFCF0] border-2 border-white rounded-2xl px-2.5 py-2.5 text-xs font-bold text-[#5A5A40] focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm"
              >
                {[1, 2, 3].map((g) => (
                  <option key={g} value={g}>
                    {g}학년
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5A5A40] mb-1 ml-1">
                반
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(Number(e.target.value));
                  setAuthError(null);
                }}
                className="w-full bg-[#FDFCF0] border-2 border-white rounded-2xl px-2.5 py-2.5 text-xs font-bold text-[#5A5A40] focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm"
              >
                {availableClasses.map((c) => (
                  <option key={c.classNum} value={c.classNum}>
                    {c.classNum}반
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5A5A40] mb-1 ml-1">
                번호
              </label>
              <select
                value={selectedNumber}
                onChange={(e) => {
                  setSelectedNumber(Number(e.target.value));
                  setAuthError(null);
                }}
                className="w-full bg-[#FDFCF0] border-2 border-white rounded-2xl px-2.5 py-2.5 text-xs font-bold text-[#5A5A40] focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm"
              >
                {Array.from({ length: 35 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}번
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Name Input (Direct input to prevent roster leakage) */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] mb-1 ml-1">
              내 이름 (성명)
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  if (authError) setAuthError(null);
                }}
                placeholder="이름 입력 (예: 강다온)"
                autoComplete="name"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FDFCF0] border-2 border-white rounded-2xl text-xs sm:text-sm font-bold text-[#5A5A40] focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm"
              />
            </div>
          </div>

          {/* Student PIN Input */}
          <div className="space-y-1 text-left">
            <div className="flex items-center justify-between ml-1">
              <label className="block text-xs font-bold text-[#5A5A40]">
                비밀번호 (PIN)
              </label>
              <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                초기: 0000
              </span>
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                required
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (authError) setAuthError(null);
                }}
                placeholder="비밀번호 4자리 (초기: 0000)"
                autoComplete="current-password"
                className={`w-full pl-10 pr-10 py-2.5 bg-[#FDFCF0] border-2 rounded-2xl text-xs sm:text-sm font-bold text-[#5A5A40] focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm transition-colors ${
                  authError ? 'border-rose-400 bg-rose-50/40' : 'border-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                tabIndex={-1}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {authError ? (
              <p className="text-[11px] font-bold text-rose-600 ml-1 mt-1 leading-snug">
                ⚠️ {authError}
              </p>
            ) : (
              <p className="text-[10px] text-[#5A5A40]/70 ml-1">
                * 분실 시 선생님께 비밀번호 초기화를 부탁하세요.
              </p>
            )}
          </div>

          {/* Start Button */}
          <button
            type="submit"
            disabled={!studentName.trim() || !pin.trim()}
            className="w-full mt-2 bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 hover:from-amber-500 hover:to-pink-600 text-white font-jua text-base sm:text-lg py-3 rounded-2xl shadow-xl border-2 border-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-100" />
            <span>힐링약국 들어가기</span>
          </button>
        </form>

        {/* Policy Quick Links */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-center gap-3 text-[11px] text-[#5A5A40]/80">
          <button
            type="button"
            onClick={onOpenPrivacyPolicy}
            className="hover:text-teal-700 underline underline-offset-2 font-bold cursor-pointer"
          >
            개인정보처리방침
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={onOpenTerms}
            className="hover:text-amber-700 underline underline-offset-2 font-bold cursor-pointer"
          >
            이용약관
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={onOpenTeacherGuide}
            className="hover:text-indigo-700 underline underline-offset-2 font-bold cursor-pointer"
          >
            교사열람안내
          </button>
        </div>

        {/* Safe middle school statement */}
        <div className="mt-3 text-center">
          <p className="text-[10.5px] text-[#5A5A40]/70 leading-relaxed font-medium">
            🌱 힐링약국의 모든 마음신호는 일상적 마음을 성찰하는 교육용 메타포이며 실제 의료 질병 진단이 아닙니다.
          </p>
        </div>
      </div>

      {/* Dedicated Adoption Guide Card for Other Schools */}
      <div className="w-full max-w-sm mt-3.5 z-10">
        <div className="bg-gradient-to-br from-amber-50/95 via-orange-50/90 to-rose-50/95 border-2 border-amber-200/90 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <School className="w-3 h-3 text-amber-800" />
              <span>다른 학교 선생님을 위한 안내</span>
            </span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md border border-rose-200/60">
              0원 무료 설치
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAdoptionGuide}
            className="w-full text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="font-jua text-base text-slate-900 group-hover:text-amber-900 transition-colors flex items-center gap-1.5">
                  <span>우리 학교 힐링약국 만들기</span>
                  <span className="text-sm text-amber-600 group-hover:translate-x-1 transition-transform">→</span>
                </h4>
                <p className="text-[11.5px] text-slate-600 mt-0.5 leading-snug">
                  처음이어도 괜찮아요. 준비부터 설치·운영까지 차근차근 안내해드려요.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Developer and Instagram Credit Footer */}
      <div className="w-full max-w-md mt-4 z-10 px-2">
        <AppFooter
          className="bg-transparent border-t-0 py-2 text-slate-500"
          onOpenPrivacyPolicy={onOpenPrivacyPolicy}
          onOpenTerms={onOpenTerms}
          onOpenTeacherGuide={onOpenTeacherGuide}
          onOpenAdoptionGuide={onOpenAdoptionGuide}
        />
      </div>
    </div>
  );
};
