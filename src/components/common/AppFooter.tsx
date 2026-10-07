import React from 'react';
import { Heart, Instagram, ShieldCheck, FileText, BookOpen } from 'lucide-react';

interface AppFooterProps {
  className?: string;
  onOpenPrivacyPolicy?: () => void;
  onOpenTerms?: () => void;
  onOpenTeacherGuide?: () => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({
  className = '',
  onOpenPrivacyPolicy,
  onOpenTerms,
  onOpenTeacherGuide
}) => {
  return (
    <footer
      id="app-footer"
      className={`w-full py-4 px-3 text-center border-t border-amber-900/10 bg-white/70 backdrop-blur-xs text-xs text-slate-600 font-sans transition-colors ${className}`}
    >
      <div className="max-w-md mx-auto flex flex-col items-center justify-center gap-2">
        {/* Policy Links Row */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-[11px] text-slate-500 font-medium flex-wrap">
          {onOpenPrivacyPolicy && (
            <button
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="hover:text-teal-700 underline underline-offset-2 transition-colors cursor-pointer"
            >
              개인정보처리방침
            </button>
          )}
          {onOpenTerms && (
            <>
              <span>•</span>
              <button
                type="button"
                onClick={onOpenTerms}
                className="hover:text-amber-700 underline underline-offset-2 transition-colors cursor-pointer"
              >
                서비스 이용약관
              </button>
            </>
          )}
          {onOpenTeacherGuide && (
            <>
              <span>•</span>
              <button
                type="button"
                onClick={onOpenTeacherGuide}
                className="hover:text-indigo-700 underline underline-offset-2 transition-colors cursor-pointer"
              >
                교사열람안내
              </button>
            </>
          )}
        </div>

        {/* Line 1: Developer Info */}
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap text-[12px] sm:text-[13px] font-medium text-slate-700">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
          <span>개발자 : <strong className="font-bold text-slate-800">허재이</strong>(경기도 도덕교사)</span>
        </div>

        {/* Line 2: Instagram Info & Contact */}
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap text-[12px] sm:text-[13px]">
          <Instagram className="w-3.5 h-3.5 text-pink-600 shrink-0" />
          <span className="text-slate-500 font-medium">문의·인스타그램</span>
          <a
            href="https://www.instagram.com/jae2_ethics/"
            target="_blank"
            rel="noopener noreferrer"
            id="footer-instagram-link"
            className="font-bold text-pink-600 hover:text-pink-700 underline decoration-pink-300 underline-offset-2 hover:decoration-pink-500 transition-colors inline-flex items-center gap-0.5 cursor-pointer"
            title="허재이 선생님 인스타그램 @jae2_ethics 새 창으로 열기"
          >
            @jae2_ethics
          </a>
        </div>
      </div>
    </footer>
  );
};
