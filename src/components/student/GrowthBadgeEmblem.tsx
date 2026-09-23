import React from 'react';
import { Lock, Sparkles } from 'lucide-react';

interface GrowthBadgeEmblemProps {
  icon: string;
  badgeGraphic?: string;
  colorTheme?: string;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GrowthBadgeEmblem: React.FC<GrowthBadgeEmblemProps> = ({
  icon,
  badgeGraphic = 'default',
  colorTheme = 'amber',
  unlocked,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-20 h-20 text-3xl',
    lg: 'w-28 h-28 text-5xl'
  };

  const ringSize = {
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-4'
  };

  // Color theme palettes for glowing medallions
  const themeGradients: Record<string, { bg: string; border: string; glow: string; ribbon: string }> = {
    emerald: {
      bg: 'from-emerald-400 via-teal-500 to-green-600',
      border: 'border-emerald-200',
      glow: 'shadow-emerald-500/30',
      ribbon: 'bg-emerald-600'
    },
    sky: {
      bg: 'from-sky-400 via-blue-500 to-indigo-600',
      border: 'border-sky-200',
      glow: 'shadow-sky-500/30',
      ribbon: 'bg-sky-600'
    },
    indigo: {
      bg: 'from-indigo-400 via-violet-500 to-purple-600',
      border: 'border-indigo-200',
      glow: 'shadow-indigo-500/30',
      ribbon: 'bg-indigo-600'
    },
    teal: {
      bg: 'from-teal-400 via-emerald-500 to-cyan-600',
      border: 'border-teal-200',
      glow: 'shadow-teal-500/30',
      ribbon: 'bg-teal-600'
    },
    lime: {
      bg: 'from-lime-400 via-green-500 to-emerald-600',
      border: 'border-lime-200',
      glow: 'shadow-lime-500/30',
      ribbon: 'bg-lime-600'
    },
    amber: {
      bg: 'from-amber-400 via-orange-500 to-yellow-600',
      border: 'border-amber-200',
      glow: 'shadow-amber-500/30',
      ribbon: 'bg-amber-600'
    },
    rose: {
      bg: 'from-rose-400 via-pink-500 to-red-600',
      border: 'border-rose-200',
      glow: 'shadow-rose-500/30',
      ribbon: 'bg-rose-600'
    },
    purple: {
      bg: 'from-purple-400 via-fuchsia-500 to-indigo-600',
      border: 'border-purple-200',
      glow: 'shadow-purple-500/30',
      ribbon: 'bg-purple-600'
    },
    violet: {
      bg: 'from-violet-400 via-purple-500 to-fuchsia-600',
      border: 'border-violet-200',
      glow: 'shadow-violet-500/30',
      ribbon: 'bg-violet-600'
    },
    fuchsia: {
      bg: 'from-fuchsia-400 via-pink-500 to-rose-600',
      border: 'border-fuchsia-200',
      glow: 'shadow-fuchsia-500/30',
      ribbon: 'bg-fuchsia-600'
    }
  };

  const theme = themeGradients[colorTheme] || themeGradients.amber;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}
      title={unlocked ? '달성 완료 배지' : '도전 중 (잠김)'}
    >
      {/* LOCKED STATE (흐린 그림 + 자물쇠) */}
      {!unlocked ? (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Dimmed grayscale circle */}
          <div
            className={`w-full h-full rounded-full bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center filter grayscale opacity-40 brightness-95 shadow-2xs`}
          >
            <span className="filter grayscale blur-[0.2px] select-none">{icon}</span>
          </div>

          {/* Locked Badge Overlay */}
          <div className="absolute -bottom-1 -right-1 bg-slate-700/85 text-white p-1 rounded-full shadow-md border border-white">
            <Lock className="w-3 h-3 text-slate-200" />
          </div>
        </div>
      ) : (
        /* UNLOCKED STATE (선명한 그림 + 영롱한 메달리온 + 반짝임) */
        <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-300">
          {/* Radiant Halo */}
          <div
            className={`absolute -inset-1 rounded-full bg-gradient-to-tr ${theme.bg} opacity-35 blur-xs`}
          />

          {/* Medallion Base */}
          <div
            className={`relative w-full h-full rounded-full bg-gradient-to-br ${theme.bg} p-1 ${ringSize[size]} ${theme.border} shadow-lg ${theme.glow} flex items-center justify-center`}
          >
            {/* Inner glossy disc */}
            <div className="w-full h-full rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-inner relative overflow-hidden">
              {/* Highlight gloss */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />

              {/* Centered crisp icon */}
              <span className="relative z-10 transform scale-110 drop-shadow-xs select-none">
                {icon}
              </span>
            </div>
          </div>

          {/* Sparkle Star Badge */}
          <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow-md border border-white animate-pulse">
            <Sparkles className="w-3 h-3 text-amber-950" />
          </div>
        </div>
      )}
    </div>
  );
};
