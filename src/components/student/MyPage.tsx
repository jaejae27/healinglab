import React, { useState, useMemo } from 'react';
import { Student, DailyMissionCheckIn } from '../../types';
import { StorageService } from '../../services/storage';
import { EmotionCalendarTab } from './EmotionCalendarTab';
import {
  Award,
  Calendar,
  Sparkles,
  Printer,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle,
  Clock,
  Gift,
  Flame,
  Heart,
  Smile,
  Check,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

interface MyPageProps {
  student: Student;
  onPrintPortfolio: () => void;
  onGoToHome?: () => void;
  onOpenWorryGacha?: () => void;
  onRefreshStudent?: () => void;
}

const MOOD_META: Record<string, { label: string; emoji: string; bg: string; text: string }> = {
  great: { label: '아주좋음', emoji: '🥰', bg: 'bg-rose-100', text: 'text-rose-700' },
  good: { label: '좋음', emoji: '😊', bg: 'bg-amber-100', text: 'text-amber-800' },
  neutral: { label: '보통', emoji: '😐', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  tired: { label: '지침', emoji: '🥱', bg: 'bg-blue-100', text: 'text-blue-800' },
  stressed: { label: '복잡함', emoji: '🤯', bg: 'bg-purple-100', text: 'text-purple-800' }
};

export const MyPage: React.FC<MyPageProps> = ({
  student,
  onPrintPortfolio,
  onGoToHome,
  onOpenWorryGacha,
  onRefreshStudent
}) => {
  const [tab, setTab] = useState<'calendar' | 'daily' | 'history' | 'cards' | 'rewards'>('calendar');
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);

  const visits = useMemo(() => StorageService.getVisitsForStudent(student.id), [student.id]);
  const cookieLogs = useMemo(
    () => StorageService.getCookieLogs().filter((l) => l.studentId === student.id),
    [student.id]
  );
  const gachaLogs = useMemo(
    () => StorageService.getGachaLogs().filter((l) => l.studentId === student.id),
    [student.id]
  );
  const myProposals = useMemo(
    () => StorageService.getNewConditionRequests().filter((r) => r.studentId === student.id),
    [student.id]
  );
  const savedFortunes = useMemo(
    () => StorageService.getSavedFortunes(student.id),
    [student.id]
  );
  const worryHistory = useMemo(
    () => StorageService.getAllWorryChallengesHistory(student.id),
    [student.id]
  );

  // Aggregate all completed daily check-ins across all visits
  const allDailyCheckIns = useMemo(() => {
    const list: {
      checkIn: DailyMissionCheckIn;
      visitId: string;
      conditionName: string;
      conditionId: string;
    }[] = [];

    visits.forEach((v) => {
      if (v.dailyCheckIns && v.dailyCheckIns.length > 0) {
        v.dailyCheckIns.forEach((ci) => {
          if (ci.completed) {
            list.push({
              checkIn: ci,
              visitId: v.visitId,
              conditionName: v.primaryConditionName,
              conditionId: v.primaryConditionId
            });
          }
        });
      }
    });

    // Sort descending by date
    return list.sort((a, b) => {
      const dateA = a.checkIn.completedAt || a.checkIn.date;
      const dateB = b.checkIn.completedAt || b.checkIn.date;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [visits]);

  // Mood statistics
  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {
      great: 0,
      good: 0,
      neutral: 0,
      tired: 0,
      stressed: 0
    };
    allDailyCheckIns.forEach((item) => {
      const m = item.checkIn.mood || 'good';
      if (counts[m] !== undefined) counts[m]++;
      else counts.good++;
    });
    return counts;
  }, [allDailyCheckIns]);

  const completedVisits = visits.filter((v) => v.status === 'rewarded' || v.status === 'submitted');
  const totalDaysLogged = allDailyCheckIns.length;
  const thoughtsLoggedCount = allDailyCheckIns.filter((i) => i.checkIn.note && i.checkIn.note.trim().length > 0).length;

  // Badges calculations
  const badges = [
    {
      id: 'b1',
      title: '첫 실천의 싹',
      desc: '1일차 실천 기록',
      emoji: '🌱',
      unlocked: totalDaysLogged >= 1
    },
    {
      id: 'b2',
      title: '3일 연속 돌봄',
      desc: '3일 이상 꾸준히 실천',
      emoji: '🔥',
      unlocked: totalDaysLogged >= 3
    },
    {
      id: 'b3',
      title: '7일 루틴 완주',
      desc: '7일 실천 완주 달성',
      emoji: '👑',
      unlocked: totalDaysLogged >= 7
    },
    {
      id: 'b4',
      title: '다정한 생각 작가',
      desc: '한 줄 소감 3개 이상 작성',
      emoji: '✍️',
      unlocked: thoughtsLoggedCount >= 3
    }
  ];

  const handleToggleStarFortune = (fortuneId: string) => {
    StorageService.toggleBestFortune(fortuneId);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24 space-y-4">
      {/* Student Profile Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 text-white rounded-[32px] p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-jua text-2xl text-white">{student.name}의 마음 서랍</h2>
              <span className="text-xs bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-medium border border-white/20">
                {student.grade}학년 {student.classNum}반
              </span>
            </div>
            <p className="text-xs text-purple-100 mt-1 flex items-center gap-1.5">
              <span>🌱 지금까지 총 <strong className="text-amber-200 font-bold underline">{totalDaysLogged}일간</strong> 스스로 마음을 돌보았어요!</span>
            </p>
          </div>
          <div className="text-3xl">🗂️</div>
        </div>

        {/* Currency summary */}
        <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-2 gap-2 text-center">
          <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-2.5 border border-white/10">
            <span className="text-[11px] text-purple-100 block font-medium">보유 칭찬쿠키</span>
            <span className="font-jua text-xl text-amber-300 flex items-center justify-center gap-1 mt-0.5">
              <span>🍪</span> {student.cookieBalance}개
            </span>
          </div>
          <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-2.5 border border-white/10">
            <span className="text-[11px] text-purple-100 block font-medium">신약 연구 제안</span>
            <span className="font-jua text-xl text-purple-200 flex items-center justify-center gap-1 mt-0.5">
              <span>🔬</span> {myProposals.length}건
            </span>
          </div>
        </div>

        {/* Print Portfolio Button */}
        <button
          onClick={onPrintPortfolio}
          className="w-full mt-3 bg-white/20 hover:bg-white/30 active:scale-98 text-white text-xs font-jua py-2.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all border border-white/30"
        >
          <Printer className="w-3.5 h-3.5 text-amber-200" />
          <span>나의 힐링 포트폴리오 인쇄/PDF 저장</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-5 bg-slate-100/90 p-1.5 rounded-2xl gap-1">
        <button
          onClick={() => setTab('calendar')}
          className={`py-2 px-2.5 text-[11px] sm:text-xs font-jua rounded-xl transition-all flex flex-col items-center justify-center shrink-0 min-w-[74px] sm:min-w-0 flex-1 ${
            tab === 'calendar'
              ? 'bg-white text-amber-900 shadow-xs border border-amber-200/50 font-bold scale-102 sm:scale-100'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="whitespace-nowrap">📅 감정 달력</span>
          <span className="text-[9px] font-mono text-amber-700 font-bold whitespace-nowrap">오늘 기록</span>
        </button>
        <button
          onClick={() => setTab('daily')}
          className={`py-2 px-2.5 text-[11px] sm:text-xs font-jua rounded-xl transition-all flex flex-col items-center justify-center shrink-0 min-w-[74px] sm:min-w-0 flex-1 ${
            tab === 'daily'
              ? 'bg-white text-purple-900 shadow-xs border border-purple-200/50 font-bold scale-102 sm:scale-100'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="whitespace-nowrap">🌱 5일 루틴</span>
          <span className="text-[9px] font-mono text-purple-600 font-bold whitespace-nowrap">({totalDaysLogged}일)</span>
        </button>
        <button
          onClick={() => setTab('history')}
          className={`py-2 px-2.5 text-[11px] sm:text-xs font-jua rounded-xl transition-all flex flex-col items-center justify-center shrink-0 min-w-[74px] sm:min-w-0 flex-1 ${
            tab === 'history'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200 font-bold scale-102 sm:scale-100'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="whitespace-nowrap">💊 처방 기록</span>
          <span className="text-[9px] font-mono font-bold whitespace-nowrap">({visits.length}건)</span>
        </button>
        <button
          onClick={() => setTab('cards')}
          className={`py-2 px-2.5 text-[11px] sm:text-xs font-jua rounded-xl transition-all flex flex-col items-center justify-center shrink-0 min-w-[74px] sm:min-w-0 flex-1 ${
            tab === 'cards'
              ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200/50 font-bold scale-102 sm:scale-100'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="whitespace-nowrap">🃏 카드·가챠</span>
          <span className="text-[9px] font-mono text-indigo-600 font-bold whitespace-nowrap">({savedFortunes.length + worryHistory.length}건)</span>
        </button>
        <button
          onClick={() => setTab('rewards')}
          className={`py-2 px-2.5 text-[11px] sm:text-xs font-jua rounded-xl transition-all flex flex-col items-center justify-center shrink-0 min-w-[74px] sm:min-w-0 flex-1 ${
            tab === 'rewards'
              ? 'bg-white text-purple-900 shadow-xs border border-purple-200/50 font-bold scale-102 sm:scale-100'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="whitespace-nowrap">🔬 신약·쿠키</span>
          <span className="text-[9px] font-mono font-bold text-purple-600 whitespace-nowrap">({myProposals.length}건)</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 0: TODAY'S EMOTION CALENDAR (오늘의 감정 달력) */}
      {/* ========================================================= */}
      {tab === 'calendar' && (
        <div className="animate-fade-in">
          <EmotionCalendarTab
            student={student}
            onRefreshStudent={onRefreshStudent}
            onOpenWorryGacha={onOpenWorryGacha}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: DAILY ROUTINE PROGRESS (일일 기록 현황 - 뿌듯함 가득) */}
      {/* ========================================================= */}
      {tab === 'daily' && (
        <div className="space-y-4 animate-fade-in">
          {/* Pride Summary Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-purple-50 rounded-[28px] border-2 border-amber-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-jua text-sm text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>스스로 쌓아올린 마음 돌봄의 기적</span>
              </span>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                총 {totalDaysLogged}일 실천 완료
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              작은 발걸음이라도 매일 내 마음에 귀 기울인 시간은 결코 사라지지 않아요. 내가 적은 한 줄 소감들이 나의 단단한 마음 뿌리가 됩니다.
            </p>

            {/* Badges Collection */}
            <div className="mt-3.5 pt-3 border-t border-amber-200/60">
              <span className="text-[11px] font-jua text-[#854D0E] block mb-2">
                🏆 마음 돌봄 성취 배지
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-2 rounded-2xl border transition-all ${
                      b.unlocked
                        ? 'bg-white border-amber-300 shadow-xs text-slate-800'
                        : 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-60'
                    }`}
                  >
                    <span className="text-2xl block mb-0.5">{b.emoji}</span>
                    <span className="font-jua text-[10px] block leading-tight truncate">
                      {b.title}
                    </span>
                    <span className="text-[8px] text-slate-500 block mt-0.5">
                      {b.unlocked ? '달성 완료 ✨' : '도전 중'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood Panorama */}
            {totalDaysLogged > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-200/60">
                <span className="text-[11px] font-jua text-slate-700 block mb-1.5">
                  🌈 내가 마주한 감정의 날씨들
                </span>
                <div className="flex items-center justify-between gap-1 bg-white/80 p-2 rounded-xl border border-amber-200/50">
                  {Object.entries(MOOD_META).map(([key, meta]) => {
                    const count = moodCounts[key] || 0;
                    return (
                      <div key={key} className="flex-1 text-center">
                        <span className="text-base block">{meta.emoji}</span>
                        <span className="text-[9px] font-medium text-slate-500 block mt-0.5">
                          {meta.label}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 font-mono block">
                          {count}일
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Daily Logs Timeline */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h4 className="font-jua text-sm text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>일일 실천 타임라인 ({allDailyCheckIns.length}개)</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">최신순 정렬</span>
            </div>

            {allDailyCheckIns.length === 0 ? (
              <div className="bg-white rounded-[28px] p-8 text-center border-2 border-dashed border-slate-200 text-slate-400 space-y-2">
                <div className="text-4xl">🌱</div>
                <p className="font-jua text-base text-slate-700">아직 기록된 매일 실천이 없어요.</p>
                <p className="text-xs text-slate-500 break-keep">
                  홈 화면의 [7일 마음신호 실천 루틴]에서 오늘 1일차 스탬프를 찍고 소감을 남겨보세요!
                </p>
                {onGoToHome && (
                  <button
                    onClick={onGoToHome}
                    className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-jua text-xs rounded-xl shadow-xs"
                  >
                    오늘 스탬프 찍으러 가기
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {allDailyCheckIns.map((item, idx) => {
                  const mood = item.checkIn.mood ? MOOD_META[item.checkIn.mood] : MOOD_META.good;
                  const dateStr = new Date(item.checkIn.completedAt || item.checkIn.date).toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                  });

                  return (
                    <div
                      key={`${item.visitId}-${item.checkIn.day}-${idx}`}
                      className="bg-white rounded-2xl border-2 border-slate-200/80 p-4 shadow-xs space-y-2.5 hover:border-purple-200 transition-colors"
                    >
                      {/* Top status bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {dateStr}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            Day {item.checkIn.day}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            {item.conditionId}
                          </span>
                        </div>

                        {/* Mood Pill */}
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            mood ? `${mood.bg} ${mood.text}` : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span>{mood?.emoji}</span>
                          <span>{mood?.label}</span>
                        </span>
                      </div>

                      {/* Mission Title */}
                      <div className="text-left">
                        <span className="text-[11px] text-slate-500 font-medium">실천한 행동:</span>
                        <p className="font-jua text-sm text-slate-800">
                          {item.checkIn.missionTitle || '오늘의 마음 처방 실천'}
                        </p>
                      </div>

                      {/* Student's Reflection / Thought bubble */}
                      {item.checkIn.note ? (
                        <div className="bg-[#FAF5FF] border border-purple-100 rounded-xl p-3 text-left">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-purple-700 mb-0.5">
                            <MessageSquare className="w-3 h-3" />
                            <span>그날 내가 남긴 솔직한 생각:</span>
                          </div>
                          <p className="text-xs font-medium text-slate-800 leading-relaxed break-keep">
                            "{item.checkIn.note}"
                          </p>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">
                          스탬프를 꾹 눌러 실천을 완료했어요!
                        </div>
                      )}

                      {/* Bottom confirmation */}
                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-100">
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>스탬프 실천 완료</span>
                        </span>
                        <span className="font-bold text-amber-600 flex items-center gap-0.5">
                          <span>🍪</span> +1 칭찬쿠키 획득
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PRESCRIPTION HISTORY (처방전 기록) */}
      {/* ========================================================= */}
      {tab === 'history' && (
        <div className="space-y-3 animate-fade-in">
          {visits.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
              <p className="font-jua text-sm">아직 작성된 처방전이 없어요.</p>
              <p className="text-xs mt-1">홈에서 오늘의 마음 상태를 알아차려보세요!</p>
            </div>
          ) : (
            visits.map((v) => {
              const isExpanded = expandedVisitId === v.visitId;
              const dateStr = new Date(v.createdAt).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={v.visitId}
                  className="bg-white rounded-2xl border-2 border-slate-200/80 p-4 shadow-xs transition-all"
                >
                  <div
                    onClick={() => setExpandedVisitId(isExpanded ? null : v.visitId)}
                    className="flex items-start justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {dateStr}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            v.status === 'rewarded'
                              ? 'bg-emerald-100 text-emerald-800'
                              : v.status === 'submitted'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {v.status === 'rewarded'
                            ? '✅ 처방약 지급완료'
                            : v.status === 'submitted'
                            ? '⏳ 확인 대기 중'
                            : '🏃 처방 실천 중'}
                        </span>
                      </div>
                      <h4 className="font-jua text-base text-slate-800">
                        {v.primaryConditionId} {v.primaryConditionName}
                      </h4>
                    </div>

                    <button className="text-slate-400 hover:text-slate-600 p-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-700 text-left">
                      <div>
                        <span className="font-bold text-rose-500">실천한 행동 처방:</span>
                        <div className="mt-1 space-y-1">
                          {v.missions.map((m, idx) => (
                            <div key={m.missionId} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                              <span>
                                {idx + 1}. {m.title}
                              </span>
                              {m.rating && (
                                <span className="font-bold text-amber-600">★ {m.rating}점</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {v.reflectionWhy && (
                        <div className="bg-rose-50/60 p-2.5 rounded-xl">
                          <span className="font-bold text-rose-700 block mb-0.5">
                            💡 내가 느낀 효과 (왜 도움이 되었나):
                          </span>
                          <p className="text-slate-700 leading-relaxed font-medium">"{v.reflectionWhy}"</p>
                        </div>
                      )}

                      {v.reflectionLearned && (
                        <div className="bg-amber-50/60 p-2.5 rounded-xl">
                          <span className="font-bold text-amber-800 block mb-0.5">
                            🌱 새롭게 알게 된 내 마음:
                          </span>
                          <p className="text-slate-700 leading-relaxed font-medium">"{v.reflectionLearned}"</p>
                        </div>
                      )}

                      {v.rewardSnackNote && (
                        <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>선생님 처방약: {v.rewardSnackNote}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SAVED MIND CARDS (소장한 마음카드 타로 갤러리) */}
      {/* ========================================================= */}
      {tab === 'cards' && (
        <div className="space-y-3 animate-fade-in">
          {savedFortunes.length === 0 ? (
            <div className="bg-white rounded-[28px] p-8 text-center text-slate-400 border border-slate-200 space-y-2">
              <div className="text-4xl">🃏</div>
              <p className="font-jua text-base text-slate-700">아직 소장한 마음카드가 없어요.</p>
              <p className="text-xs text-slate-500 break-keep">
                홈 화면의 [마음카드]에서 오늘의 힐링 타로를 뽑아보고 마음에 와닿는 카드를 서랍에 저장해보세요!
              </p>
            </div>
          ) : (
            savedFortunes.map((f) => (
              <div
                key={f.id}
                className={`p-4 rounded-3xl border-2 transition-all text-left relative overflow-hidden ${
                  f.isBest
                    ? 'bg-gradient-to-br from-amber-50/90 via-white to-amber-100/50 border-amber-300 shadow-md ring-2 ring-amber-300/40'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{f.icon || '🃏'}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                          {f.romanNumeral || '✦'} · {f.fortuneId}
                        </span>
                        {f.isBest && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 flex items-center gap-0.5">
                            ⭐ 인생 카드
                          </span>
                        )}
                      </div>
                      <h4 className="font-jua text-base text-slate-900 mt-0.5">
                        {f.title || `마음카드 #${f.number}`}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStarFortune(f.id)}
                    className="text-slate-300 hover:text-amber-500 p-1.5 transition-colors"
                    title={f.isBest ? '인생 카드 해제' : '인생 카드로 지정하기'}
                  >
                    <Star className={`w-5 h-5 ${f.isBest ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                {/* Quote */}
                <div className="bg-slate-50/80 rounded-2xl p-3 my-2.5 border border-slate-100">
                  <p className="font-jua text-sm text-slate-800 leading-relaxed break-keep">
                    "{f.message}"
                  </p>
                  {f.subText && (
                    <p className="text-[11px] text-amber-800 font-medium mt-1.5 flex items-center gap-1">
                      <span>🌱</span>
                      <span>{f.subText}</span>
                    </p>
                  )}
                </div>

                {/* Tags */}
                {f.tags && f.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {f.tags.map((t) => (
                      <span key={t} className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          {/* 🔮 고민가챠 지혜 보관함 */}
          <div className="pt-4 border-t-2 border-purple-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-jua text-base text-purple-900 flex items-center gap-1.5">
                <span>🔮 뽑았던 고민가챠 지혜 서랍</span>
                <span className="text-[11px] bg-purple-100 text-purple-800 font-mono font-bold px-2 py-0.5 rounded-full">
                  {worryHistory.length}건
                </span>
              </h4>
              {onOpenWorryGacha && (
                <button
                  onClick={onOpenWorryGacha}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  <span>오늘 가챠 뽑기</span>
                  <span>↗</span>
                </button>
              )}
            </div>

            {worryHistory.length === 0 ? (
              <div className="bg-purple-50/50 rounded-2xl p-6 text-center text-slate-400 border border-purple-150 space-y-2">
                <div className="text-3xl">🔮</div>
                <p className="font-jua text-sm text-purple-800">아직 뽑은 고민가챠가 없어요.</p>
                <p className="text-xs text-slate-500 break-keep">
                  홈 화면의 [고민가챠]를 돌려 나만을 위한 지혜 힌트를 얻고, 나의 마음기록 작성할 때 적용해보세요!
                </p>
                {onOpenWorryGacha && (
                  <button
                    onClick={onOpenWorryGacha}
                    className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-jua text-xs rounded-xl shadow-xs"
                  >
                    지금 고민가챠 뽑으러 가기
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {worryHistory.map((item, idx) => (
                  <div
                    key={`${item.date}-${idx}`}
                    className="bg-white rounded-2xl p-3.5 border-2 border-purple-200/80 shadow-xs hover:border-purple-300 transition-all text-left"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                        📅 {item.date}의 힌트
                      </span>
                      <span className="text-[10px] text-purple-600 font-medium">
                        마음기록 연동됨
                      </span>
                    </div>
                    <p className="font-jua text-sm text-purple-950 leading-relaxed break-keep">
                      "{item.hint}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: REWARDS & COOKIES (신약개발소 & 칭찬쿠키 내역) */}
      {/* ========================================================= */}
      {tab === 'rewards' && (
        <div className="space-y-4 animate-fade-in text-left">
          {/* New Medicine Proposals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-jua text-sm text-slate-800 flex items-center gap-1.5">
                <span>🔬 신약개발소 제안 내역</span>
                <span className="text-[11px] text-purple-600 font-bold">({myProposals.length}건)</span>
              </h4>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                채택 시 +5🍪
              </span>
            </div>

            {myProposals.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-slate-400 border border-slate-200 text-xs space-y-1">
                <p>아직 제안한 신약 마음신호가 없어요.</p>
                <p className="text-[11px] text-slate-400">
                  홈 화면의 [신약개발소]에서 나만의 새로운 마음신호를 제안해보세요!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {myProposals.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-jua text-sm text-slate-800 truncate">{p.suggestedName}</h5>
                        {p.rewardCookies && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                            +{p.rewardCookies}🍪
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {p.missionIdeas && p.missionIdeas.length > 0
                          ? `처방 ${p.missionIdeas.length}개: ${p.missionIdeas.join(' / ')}`
                          : p.missionIdea || p.whenAppears}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 font-mono ${
                        p.status === 'approved' || p.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'rejected'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.status === 'approved' || p.status === 'accepted'
                        ? '✅ 채택 (+5🍪)'
                        : p.status === 'rejected'
                        ? '반려'
                        : '⏳ 심사 중'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* If there are previously won gifts from before, display them gracefully without machine prompt */}
          {gachaLogs.length > 0 && (
            <div>
              <h4 className="font-jua text-sm text-slate-800 mb-2">🎁 보관된 선물함</h4>
              <div className="space-y-2">
                {gachaLogs.map((g) => (
                  <div
                    key={g.id}
                    className="bg-white rounded-2xl border border-slate-200 p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{g.prize.emoji}</span>
                      <div>
                        <h5 className="font-jua text-xs text-slate-800">{g.prize.name}</h5>
                        <p className="text-[10px] text-slate-500">{g.prize.description}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        g.claimed
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {g.claimed ? '수령 완료' : '미수령'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-jua text-sm text-slate-800 mb-2">🍪 칭찬쿠키 내역</h4>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs">
              {cookieLogs.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">기록이 없습니다.</div>
              ) : (
                cookieLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{log.reason}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`font-bold ${
                        log.amount > 0 ? 'text-emerald-600' : 'text-slate-500'
                      }`}
                    >
                      {log.amount > 0 ? `+${log.amount}` : log.amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
