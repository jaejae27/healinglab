import React from 'react';
import { Student } from '../../types';
import { LogOut } from 'lucide-react';

interface StudentHeaderProps {
  student: Student;
  onLogout: () => void;
  onOpenNewMedicine?: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  student,
  onLogout,
  onOpenNewMedicine
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/75 backdrop-blur-md border-b-2 border-white/60 px-3 sm:px-4 py-2 sm:py-2.5 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Student Badge & App Icon */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FFEDD5] rounded-full flex items-center justify-center text-base sm:text-xl border-2 border-white shadow-sm shrink-0">
            💊
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-jua text-[#5A5A40] text-sm sm:text-base whitespace-nowrap truncate max-w-[120px] sm:max-w-none">
                {student.name}
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#5A5A40]/80 bg-white/90 px-1.5 sm:px-2 py-0.5 rounded-xl font-bold border border-white shadow-2xs whitespace-nowrap">
                {student.grade}-{student.classNum} ({student.number}번)
              </span>
            </div>
          </div>
        </div>

        {/* Currency & Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Praise Cookie balance */}
          <button
            type="button"
            onClick={onOpenNewMedicine}
            className="flex items-center gap-1 bg-white/90 hover:bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl border-2 border-white shadow-sm text-xs font-bold text-[#D97706] transition-transform active:scale-95 whitespace-nowrap touch-manipulation"
            title="칭찬쿠키 잔액 (신약개발소 제안 시 +5🍪 지급)"
          >
            <span>🍪</span>
            <span>{student.cookieBalance}</span>
          </button>

          {/* Switch Student / Logout button */}
          <button
            type="button"
            onClick={onLogout}
            className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-white/90 hover:bg-white border-2 border-white flex items-center justify-center text-[#5A5A40]/70 hover:text-[#5A5A40] shadow-sm transition-colors shrink-0 touch-manipulation active:scale-95"
            title="다른 학생으로 로그인 / 로그아웃"
            aria-label="로그아웃"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
