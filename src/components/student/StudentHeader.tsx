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
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Student Badge & App Icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-[#FFEDD5] rounded-full flex items-center justify-center text-xl border-2 border-white shadow-sm">
            💊
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-jua text-[#5A5A40] text-sm md:text-base">{student.name}</span>
              <span className="text-[11px] text-[#5A5A40]/70 bg-white/80 px-2 py-0.5 rounded-xl font-bold border border-white shadow-2xs">
                {student.grade}-{student.classNum} ({student.number}번)
              </span>
            </div>
          </div>
        </div>

        {/* Currency & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Praise Cookie balance */}
          <button
            onClick={onOpenNewMedicine}
            className="flex items-center gap-1.5 bg-white/80 hover:bg-white px-3 py-1.5 rounded-2xl border-2 border-white shadow-sm text-xs font-bold text-[#D97706] transition-transform active:scale-95"
            title="신약개발소 제안 시 +5🍪 지급"
          >
            <span>🍪</span>
            <span>{student.cookieBalance}</span>
          </button>

          {/* Switch Student / Logout button */}
          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white border-2 border-white flex items-center justify-center text-[#5A5A40]/70 hover:text-[#5A5A40] shadow-sm transition-colors"
            title="다른 학생으로 로그인 / 로그아웃"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>

          {/* Teacher dashboard link */}
          <button
            onClick={onSwitchToTeacher}
            className="w-8 h-8 rounded-xl bg-[#EDE9FE] hover:bg-purple-100 border-2 border-white flex items-center justify-center text-purple-700 shadow-sm transition-colors"
            title="선생님 모드"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
