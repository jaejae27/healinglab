import React from 'react';
import { Student } from '../../types';
import { LogOut, ShieldCheck, Ticket } from 'lucide-react';

interface StudentHeaderProps {
  student: Student;
  onLogout: () => void;
  onSwitchToTeacher: () => void;
  onOpenNewMedicine?: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  student,
  onLogout,
  onSwitchToTeacher,
  onOpenNewMedicine
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/40 backdrop-blur-md border-b-2 border-white/60 px-4 py-2.5 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Student Badge & App Icon */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#FFEDD5] rounded-full flex items-center justify-center text-lg sm:text-xl border-2 border-white shadow-sm shrink-0">
            💊
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
              <span className="font-jua text-[#5A5A40] text-sm md:text-base whitespace-nowrap">{student.name}</span>
              <span className="text-[11px] text-[#5A5A40]/70 bg-white/80 px-2 py-0.5 rounded-xl font-bold border border-white shadow-2xs whitespace-nowrap">
                {student.grade}-{student.classNum} ({student.number}번)
              </span>
            </div>
          </div>
        </div>

        {/* Currency & Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Praise Cookie balance */}
          <button
            onClick={onOpenNewMedicine}
            className="flex items-center gap-1 bg-white/80 hover:bg-white px-2.5 sm:px-3 py-1.5 rounded-2xl border-2 border-white shadow-sm text-xs font-bold text-[#D97706] transition-transform active:scale-95 whitespace-nowrap"
            title="신약개발소 제안 시 +5🍪 지급"
          >
            <span>🍪</span>
            <span>{student.cookieBalance}</span>
          </button>

          {/* Switch Student / Logout button */}
          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white border-2 border-white flex items-center justify-center text-[#5A5A40]/70 hover:text-[#5A5A40] shadow-sm transition-colors shrink-0"
            title="다른 학생으로 로그인 / 로그아웃"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>

          {/* Teacher dashboard link */}
          <button
            onClick={onSwitchToTeacher}
            className="w-8 h-8 rounded-xl bg-[#EDE9FE] hover:bg-purple-100 border-2 border-white flex items-center justify-center text-purple-700 shadow-sm transition-colors shrink-0"
            title="선생님 모드"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
