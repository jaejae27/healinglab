import React from 'react';
import { Home, Sparkles, CheckCircle, FolderHeart } from 'lucide-react';

export type StudentTab = 'home' | 'diagnosis' | 'done' | 'mypage';

interface BottomNavProps {
  currentTab: StudentTab;
  onChangeTab: (tab: StudentTab) => void;
  hasActiveVisit: boolean;
  isDoneEligible?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  hasActiveVisit,
  isDoneEligible
}) => {
  const tabs = [
    { id: 'home' as StudentTab, label: '홈', icon: Home },
    { id: 'diagnosis' as StudentTab, label: '마음진단', icon: Sparkles },
    {
      id: 'done' as StudentTab,
      label: '처방다했어요',
      icon: CheckCircle,
      hasDot: isDoneEligible ?? false
    },
    { id: 'mypage' as StudentTab, label: '마음서랍', icon: FolderHeart }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-t-2 border-white/80 py-2 px-3 sm:px-4 shadow-lg pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 px-2.5 sm:px-3 rounded-2xl transition-all touch-manipulation active:scale-95 ${
                isActive
                  ? 'text-[#5A5A40] font-bold bg-white/90 border-2 border-white shadow-sm scale-105'
                  : 'text-[#5A5A40]/55 hover:text-[#5A5A40] hover:bg-white/40'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-[#5A5A40]' : 'stroke-[1.8]'}`} />
                {tab.hasDot && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#D97706] rounded-full animate-ping" />
                )}
                {tab.hasDot && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#D97706] rounded-full" />
                )}
              </div>
              <span className="text-[10.5px] font-jua mt-0.5 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
