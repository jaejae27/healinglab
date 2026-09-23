import React, { useState } from 'react';
import { EvaluatedGrowthBadge } from '../../utils/growthBadges';
import { GrowthBadgeEmblem } from './GrowthBadgeEmblem';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Lock,
  Heart,
  HelpCircle,
  X,
  Award,
  Filter
} from 'lucide-react';

interface GrowthBadgesTabProps {
  badges: EvaluatedGrowthBadge[];
  studentName: string;
}

export const GrowthBadgesTab: React.FC<GrowthBadgesTabProps> = ({
  badges,
  studentName
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<EvaluatedGrowthBadge | null>(null);

  const unlockedBadges = badges.filter((b) => b.unlocked);
  const lockedBadges = badges.filter((b) => !b.unlocked);

  const filteredBadges = badges.filter((b) => {
    if (filter === 'unlocked') return b.unlocked;
    if (filter === 'locked') return !b.unlocked;
    return true;
  });

  const totalCount = badges.length;
  const unlockedCount = unlockedBadges.length;
  const progressPercent = Math.round((unlockedCount / (totalCount || 1)) * 100);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Warm Mind-Care Philosophy & Progress Summary Banner */}
      <div className="bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 rounded-[28px] border-2 border-amber-200/80 p-4 sm:p-5 shadow-xs relative overflow-hidden">
        {/* Floating Sparkle Accents */}
        <div className="absolute top-2 right-3 text-2xl opacity-30 select-none pointer-events-none">
          ✨
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold shadow-xs">
              🏅
            </div>
            <div>
              <h3 className="font-jua text-base text-slate-800 flex items-center gap-1.5">
                <span>{studentName}의 마음 성장 배지</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                나만의 따뜻한 마음 돌봄 여정 발자국
              </p>
            </div>
          </div>

          <span className="text-xs font-jua text-amber-900 bg-white/90 px-3 py-1 rounded-full border border-amber-300 shadow-2xs">
            {unlockedCount} / {totalCount}개 획득
          </span>
        </div>

        {/* Gentle Notice (No competition / grades) */}
        <div className="bg-white/85 backdrop-blur-xs rounded-2xl p-3 border border-amber-200/70 space-y-2 mt-3">
          <div className="flex items-start gap-2">
            <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed break-keep">
              마음 성장 배지는 <strong>성적이나 다른 친구와의 경쟁이 아니에요.</strong> 내가 내 마음을 얼마나 소중히 돌보았는지 보여주는 나만의 소중한 기록입니다.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
              <span className="text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>마음 돌봄 성장률</span>
              </span>
              <span className="font-mono text-amber-700">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${Math.max(progressPercent, 4)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center justify-between gap-1.5 px-1">
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-jua transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-slate-800 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            전체 ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-jua transition-all flex items-center gap-1 cursor-pointer ${
              filter === 'unlocked'
                ? 'bg-amber-500 text-white shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>획득 완료</span>
            <span className="font-mono text-[10px] bg-white/25 px-1.5 py-0.2 rounded-full">
              {unlockedCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('locked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-jua transition-all flex items-center gap-1 cursor-pointer ${
              filter === 'locked'
                ? 'bg-slate-700 text-white shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>도전 중</span>
            <span className="font-mono text-[10px] bg-white/25 px-1.5 py-0.2 rounded-full">
              {lockedBadges.length}
            </span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
          배지를 터치하면 상세 내용을 확인해요
        </span>
      </div>

      {/* 3. Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredBadges.map((badge) => {
          const isUnlocked = badge.unlocked;

          return (
            <div
              key={badge.definition.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-3.5 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-3.5 relative overflow-hidden group ${
                isUnlocked
                  ? 'bg-white border-amber-200/90 hover:border-amber-300 hover:shadow-md shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Badge Visual Emblem */}
              <div className="shrink-0">
                <GrowthBadgeEmblem
                  icon={badge.definition.icon}
                  badgeGraphic={badge.definition.badgeGraphic}
                  colorTheme={badge.definition.colorTheme}
                  unlocked={isUnlocked}
                  size="md"
                />
              </div>

              {/* Badge Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {badge.definition.categoryLabel}
                  </span>
                  {isUnlocked ? (
                    <span className="text-[10px] font-jua text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>달성 완료</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-jua text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>도전 중</span>
                    </span>
                  )}
                </div>

                <h4
                  className={`font-jua text-sm truncate ${
                    isUnlocked ? 'text-slate-900 group-hover:text-amber-700' : 'text-slate-600'
                  }`}
                >
                  {badge.definition.title}
                </h4>

                {/* Unlocked State: 선명한 획득 날짜 및 축하 설명 */}
                {isUnlocked ? (
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-600 line-clamp-1 leading-snug break-keep">
                      {badge.definition.achievedDescription}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-700 bg-amber-50/90 px-2 py-0.5 rounded-lg border border-amber-200/60 w-fit">
                      <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>획득일: {badge.unlockedAt || '달성 완료'}</span>
                    </div>
                  </div>
                ) : (
                  /* Locked State: 흐린 그림과 함께 명확한 달성 조건 & 현재 진행도 표시 */
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug break-keep">
                      <strong className="text-slate-700">조건:</strong> {badge.definition.conditionDescription}
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>현재 진행도</span>
                        <span className="font-mono font-bold text-slate-700">
                          {badge.currentProgress} / {badge.targetProgress}
                          {badge.progressUnit} ({badge.progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-400 rounded-full transition-all duration-300"
                          style={{ width: `${badge.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-slate-200 text-slate-400 space-y-2">
          <div className="text-3xl">🌱</div>
          <p className="font-jua text-base text-slate-700">해당하는 배지가 아직 없어요.</p>
          <p className="text-xs text-slate-500">
            필터를 변경하거나 매일 조금씩 마음 돌봄 활동을 이어가 보세요!
          </p>
        </div>
      )}

      {/* 4. DETAIL MODAL (배지 터치 시 상세 카드) */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl border-4 border-slate-100 space-y-4 relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Emblem Spotlight */}
            <div className="flex flex-col items-center justify-center pt-2 text-center space-y-2">
              <GrowthBadgeEmblem
                icon={selectedBadge.definition.icon}
                badgeGraphic={selectedBadge.definition.badgeGraphic}
                colorTheme={selectedBadge.definition.colorTheme}
                unlocked={selectedBadge.unlocked}
                size="lg"
              />

              <div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  {selectedBadge.definition.categoryLabel}
                </span>
                <h3 className="font-jua text-xl text-slate-900">
                  {selectedBadge.definition.title}
                </h3>
              </div>
            </div>

            {/* Status & Date Tag */}
            <div className="text-center">
              {selectedBadge.unlocked ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-mono font-bold text-amber-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>획득일: {selectedBadge.unlockedAt || '달성 완료'}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-bold text-slate-600">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    도전 중 ({selectedBadge.currentProgress} / {selectedBadge.targetProgress}
                    {selectedBadge.progressUnit})
                  </span>
                </div>
              )}
            </div>

            {/* Condition Box */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    selectedBadge.unlocked ? 'text-emerald-500' : 'text-slate-400'
                  }`}
                />
                <span>달성 조건</span>
              </div>
              <p className="text-slate-600 pl-5 leading-relaxed">
                {selectedBadge.definition.conditionDescription}
              </p>
            </div>

            {/* Meaning & Story */}
            <div
              className={`p-3.5 rounded-2xl border space-y-1.5 text-xs ${
                selectedBadge.unlocked
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-indigo-50/60 border-indigo-200 text-indigo-900'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>마음 돌봄 비타민 한마디</span>
              </div>
              <p className="text-[11px] leading-relaxed break-keep">
                {selectedBadge.unlocked
                  ? selectedBadge.definition.achievedDescription
                  : '작은 발걸음이라도 꾸준히 나를 살피다 보면 어느새 멋진 배지가 내 마음 서랍에 도착할 거예요!'}
              </p>
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-jua shadow-xs transition-colors cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
