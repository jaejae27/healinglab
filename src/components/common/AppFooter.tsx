import React from 'react';
import { Heart, Instagram } from 'lucide-react';

interface AppFooterProps {
  className?: string;
}

export const AppFooter: React.FC<AppFooterProps> = ({ className = '' }) => {
  return (
    <footer
      id="app-footer"
      className={`w-full py-4 px-3 text-center border-t border-amber-900/10 bg-white/70 backdrop-blur-xs text-xs text-slate-600 font-sans transition-colors ${className}`}
    >
      <div className="max-w-md mx-auto flex flex-col items-center justify-center gap-1.5 sm:gap-2">
        {/* Line 1: Developer Info - guaranteed no wrap */}
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap text-[12px] sm:text-[13px] font-medium text-slate-700">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
          <span>개발자 : <strong className="font-bold text-slate-800">허재이</strong>(경기도 도덕교사)</span>
        </div>

        {/* Line 2: Instagram Info - guaranteed no wrap with clear touch target */}
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap text-[12px] sm:text-[13px]">
          <Instagram className="w-3.5 h-3.5 text-pink-600 shrink-0" />
          <span className="text-slate-500 font-medium">인스타그램</span>
          <a
            href="https://www.instagram.com/jae2_ethics/"
            target="_blank"
            rel="noopener noreferrer"
            id="footer-instagram-link"
            className="font-bold text-pink-600 hover:text-pink-700 underline decoration-pink-300 underline-offset-2 hover:decoration-pink-500 transition-colors inline-flex items-center gap-0.5"
            title="허재이 선생님 인스타그램 @jae2_ethics 새 창으로 열기"
          >
            @jae2_ethics
          </a>
        </div>
      </div>
    </footer>
  );
};
