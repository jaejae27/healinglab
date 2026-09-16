import React, { useState, useMemo } from 'react';
import { Student } from '../../types';
import { StorageService } from '../../services/storage';
import { HealyCharacter } from '../character/HealyCharacter';
import { AppFooter } from '../common/AppFooter';
import { Heart, Sparkles, UserCheck, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';

interface StudentLoginProps {
  onLogin: (student: Student) => void;
  onSwitchToTeacher: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({ onLogin, onSwitchToTeacher }) => {
  const [students, setStudents] = useState(() => StorageService.getStudents());
  const [classes, setClasses] = useState(() => StorageService.getClasses().filter((c) => c.active));

  React.useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setStudents(StorageService.getStudents());
      setClasses(StorageService.getClasses().filter((c) => c.active));
    });
    return () => unsub();
  }, []);

  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedClass, setSelectedClass] = useState<number>(1);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Available class numbers for selected grade
  const availableClasses = useMemo(() => {
    return classes.filter((c) => c.grade === selectedGrade);
  }, [classes, selectedGrade]);

  // Students in selected grade and class
  const classStudents = useMemo(() => {
    return students
      .filter((s) => s.grade === selectedGrade && s.classNum === selectedClass)
      .sort((a, b) => a.number - b.number);
  }, [students, selectedGrade, selectedClass]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    const student = StorageService.getStudentById(selectedStudentId);
    if (!student) return;

    const expectedPin = (student.pin || '0000').trim();
    const enteredPin = pin.trim();

    if (enteredPin !== expectedPin) {
      setPinError('비밀번호가 일치하지 않습니다. (초기 비밀번호: 0000 / 분실 시 선생님께 초기화를 요청해주세요)');
      return;
    }

    StorageService.setCurrentStudentId(student.id);
    onLogin(student);
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

      {/* Top Teacher Switcher */}
      <div className="w-full max-w-sm flex justify-end mb-4 relative z-10">
        <button
          onClick={onSwitchToTeacher}
          className="text-xs text-[#5A5A40] bg-white/80 hover:bg-white border-2 border-white px-4 py-2 rounded-2xl shadow-sm flex items-center gap-1.5 transition-all font-bold whitespace-nowrap"
        >
          <ShieldCheck className="w-4 h-4 text-[#7C3AED] shrink-0" />
          <span className="whitespace-nowrap">선생님 관리자 모드</span>
        </button>
      </div>

      <div className="w-full max-w-sm bg-white/85 backdrop-blur-md rounded-[44px] border-4 border-white shadow-2xl p-7 relative overflow-hidden z-10">
        {/* Mascot Greeting */}
        <div className="flex flex-col items-center mb-5">
          <HealyCharacter
            emotion="welcome"
            size="md"
            dialogue="어서 와! 여기는 힐링약국이야.<br>오늘 네 마음 상태를 같이 살펴볼까?"
            subDialogue="나에게 맞는 마음 처방전을 찾아봐요 💊"
          />
        </div>

        {/* Login Selection Form */}
        <form onSubmit={handleStart} className="space-y-4">
          {/* Grade & Class selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] mb-1.5 ml-1">
                학년 선택
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => {
                  const g = Number(e.target.value);
                  setSelectedGrade(g);
                  setSelectedClass(1);
                  setSelectedStudentId('');
                }}
                className="w-full bg-[#FDFCF0] border-2 border-white rounded-2xl px-3.5 py-2.5 text-sm font-bold text-[#5A5A40] focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm"
              >
                {[1, 2, 3].map((g) => (
                  <option key={g} value={g}>
                    {g}학년
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A5A40] mb-1.5 ml-1">
                반 선택
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(Number(e.target.value));
                  setSelectedStudentId('');
                }}
                className="w-full bg-[#FDFCF0] border-2 border-white rounded-2xl px-3.5 py-2.5 text-sm font-bold text-[#5A5A40] focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm"
              >
                {availableClasses.map((c) => (
                  <option key={c.classNum} value={c.classNum}>
                    {c.classNum}반
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student selection */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] mb-1.5 ml-1">
              내 이름 (번호)
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setPin('');
                setPinError(null);
              }}
              required
              className="w-full bg-[#FDFCF0] border-2 border-white rounded-2xl px-4 py-3 text-sm font-bold text-[#5A5A40] focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm"
            >
              <option value="">-- 내 이름을 선택해주세요 --</option>
              {classStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.number}번 {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Student Password Input */}
          {selectedStudentId && (
            <div className="space-y-1.5 animate-fade-in text-left">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-xs font-bold text-[#5A5A40]">
                  비밀번호 입력
                </label>
                <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  초기 비번: 0000
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
                    if (pinError) setPinError(null);
                  }}
                  placeholder="비밀번호 입력 (초기: 0000)"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-11 py-3 bg-[#FDFCF0] border-2 rounded-2xl text-sm font-bold text-[#5A5A40] focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm transition-colors ${
                    pinError ? 'border-rose-400 bg-rose-50/40' : 'border-white'
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

              {pinError ? (
                <p className="text-[11px] font-bold text-rose-600 ml-1 flex items-center gap-1 animate-fade-in">
                  <span>⚠️</span>
                  <span>{pinError}</span>
                </p>
              ) : (
                <p className="text-[10.5px] text-[#5A5A40]/70 ml-1">
                  * 잊어버렸을 땐 선생님께 비밀번호 초기화를 부탁하세요.
                </p>
              )}
            </div>
          )}

          {/* Start Button */}
          <button
            type="submit"
            disabled={!selectedStudentId || !pin.trim()}
            className="w-full mt-2 bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 hover:from-amber-500 hover:to-pink-600 text-white font-jua text-lg py-3.5 rounded-2xl shadow-xl border-2 border-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5 text-amber-100" />
            <span>힐링약국 들어가기</span>
          </button>
        </form>

        {/* Safe middle school statement */}
        <div className="mt-5 pt-4 border-t-2 border-white/60 text-center">
          <p className="text-[11px] text-[#5A5A40]/70 leading-relaxed font-medium">
            🌱 힐링약국의 마음신호는 실제 질병을 진단하는 것이 아닙니다. 내 마음 상태를 재미있는 이름으로 알아차려보는 사회정서 실천 공간입니다.
          </p>
        </div>
      </div>

      {/* Developer and Instagram Credit Footer */}
      <div className="w-full max-w-md mt-4 z-10 px-2">
        <AppFooter className="bg-transparent border-t-0 py-2 text-slate-500" />
      </div>
    </div>
  );
};
