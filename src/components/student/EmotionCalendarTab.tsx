import React, { useState, useMemo } from 'react';
import { Student, EmotionLog } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Calendar as CalendarIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Smile,
  Heart,
  Flame,
  CheckCircle2,
  Edit3,
  Cookie
} from 'lucide-react';

interface EmotionCalendarTabProps {
  student: Student;
  onRefreshStudent?: () => void;
}

export const MOOD_OPTIONS: {
  key: EmotionLog['mood'];
  label: string;
  emoji: string;
  bg: string;
  border: string;
  text: string;
}[] = [
  { key: 'great', label: '행복·뿌듯', emoji: '🥰', bg: 'bg-rose-50 hover:bg-rose-100', border: 'border-rose-200', text: 'text-rose-700' },
  { key: 'good', label: '편안·안정', emoji: '😊', bg: 'bg-amber-50 hover:bg-amber-100', border: 'border-amber-200', text: 'text-amber-800' },
  { key: 'excited', label: '신남·설렘', emoji: '⚡', bg: 'bg-yellow-50 hover:bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-800' },
  { key: 'neutral', label: '그저그럼', emoji: '😐', bg: 'bg-emerald-50 hover:bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-800' },
  { key: 'tired', label: '피곤·지침', emoji: '🥱', bg: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-200', text: 'text-blue-800' },
  { key: 'stressed', label: '복잡·불안', emoji: '🤯', bg: 'bg-purple-50 hover:bg-purple-100', border: 'border-purple-200', text: 'text-purple-800' },
  { key: 'sad', label: '서운·외로움', emoji: '🥺', bg: 'bg-indigo-50 hover:bg-indigo-100', border: 'border-indigo-200', text: 'text-indigo-800' },
  { key: 'angry', label: '속상·화남', emoji: '😡', bg: 'bg-red-50 hover:bg-red-100', border: 'border-red-200', text: 'text-red-800' }
];

export const EmotionCalendarTab: React.FC<EmotionCalendarTabProps> = ({ student, onRefreshStudent }) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1); // 1~12

  // Refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);

  // Load all emotion logs for this student
  const emotionLogs = useMemo(() => {
    return StorageService.getEmotionLogs(student.id);
  }, [student.id, refreshKey]);

  // Today's existing log if any
  const todayLog = useMemo(() => {
    return emotionLogs.find((l) => l.date === todayStr);
  }, [emotionLogs, todayStr]);

  // Selected date for modal/editing (default to today)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedMood, setSelectedMood] = useState<EmotionLog['mood']>(todayLog?.mood || 'good');
  const [noteText, setNoteText] = useState<string>(todayLog?.note || '');
  const [rewardNotice, setRewardNotice] = useState<string | null>(null);

  // When changing selected date, sync form inputs
  const handleSelectDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    const log = emotionLogs.find((l) => l.date === dateStr);
    if (log) {
      setSelectedMood(log.mood);
      setNoteText(log.note || '');
    } else {
      setSelectedMood('good');
      setNoteText('');
    }
    setRewardNotice(null);
  };

  // Submit emotion log
  const handleSaveEmotion = () => {
    const meta = MOOD_OPTIONS.find((m) => m.key === selectedMood) || MOOD_OPTIONS[1];
    const logToSave: EmotionLog = {
      id: `EL-${student.id}-${selectedDate}`,
      studentId: student.id,
      studentName: student.name,
      date: selectedDate,
      mood: selectedMood,
      moodLabel: meta.label,
      emoji: meta.emoji,
      note: noteText.trim(),
      createdAt: new Date().toISOString()
    };

    const res = StorageService.saveEmotionLog(logToSave);
    setRefreshKey((prev) => prev + 1);
    if (onRefreshStudent) onRefreshStudent();

    if (res.isFirstToday) {
      setRewardNotice('🎉 오늘의 감정 기록 완료! 칭찬쿠키 1개를 선물로 받았어요! 🍪');
    } else {
      setRewardNotice('✨ 감정 기록이 성공적으로 저장되었습니다!');
    }

    setTimeout(() => {
      setRewardNotice(null);
    }, 4000);
  };

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0(일)~6(토)
    const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Empty lead-in days
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, dateStr: '', isCurrentMonth: false });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const mm = String(currentMonth).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      days.push({
        day: d,
        dateStr: `${currentYear}-${mm}-${dd}`,
        isCurrentMonth: true
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Navigate month
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Monthly stats
  const monthlyLogs = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    return emotionLogs.filter((l) => l.date.startsWith(prefix));
  }, [emotionLogs, currentYear, currentMonth]);

  // Streak calculation
  const streak = useMemo(() => {
    const dates = new Set(emotionLogs.map((l) => l.date));
    let count = 0;
    let checkDate = new Date();
    // Check if recorded today or yesterday to continue streak
    const checkStr = checkDate.toISOString().split('T')[0];
    if (!dates.has(checkStr)) {
      // Check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];
      if (!dates.has(yesterdayStr)) {
        return 0;
      }
    }

    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (dates.has(dStr)) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [emotionLogs]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Today's Quick Log */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 rounded-[32px] p-5 md:p-6 border-2 border-amber-200/60 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <h2 className="font-jua text-xl text-slate-800">오늘의 감정 달력</h2>
              <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-0.5 rounded-full border border-amber-300">
                매일 기록 시 🍪 +1 쿠키
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              오늘 내 마음에 떠오른 감정을 솔직하게 선택하고 한마디 메모를 남겨보세요.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xs px-4 py-2 rounded-2xl border border-slate-200 self-start md:self-auto">
            <div className="flex items-center gap-1 text-rose-600 font-jua">
              <Flame className="w-5 h-5 fill-rose-500 text-rose-500" />
              <span className="text-base">{streak}일 연속</span>
            </div>
            <div className="w-px h-4 bg-slate-300" />
            <div className="text-xs text-slate-600 font-medium">
              이번 달 <strong className="text-slate-800 font-bold">{monthlyLogs.length}일</strong> 기록
            </div>
          </div>
        </div>

        {/* Reward Notification Banner */}
        {rewardNotice && (
          <div className="p-3 mb-4 rounded-2xl bg-amber-400 text-amber-950 font-bold text-xs flex items-center gap-2 shadow-md animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>{rewardNotice}</span>
          </div>
        )}

        {/* Emotion Selector Box */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <span>{selectedDate === todayStr ? '오늘' : selectedDate}의 마음 상태 선택</span>
            </span>
            {selectedDate !== todayStr && (
              <button
                onClick={() => handleSelectDay(todayStr)}
                className="text-xs text-amber-700 hover:text-amber-900 font-bold underline"
              >
                오늘 날짜로 돌아가기
              </button>
            )}
          </div>

          {/* Emotion 8 Buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {MOOD_OPTIONS.map((m) => {
              const isSelected = selectedMood === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSelectedMood(m.key)}
                  className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-amber-100 border-amber-400 scale-105 shadow-md ring-2 ring-amber-300'
                      : `${m.bg} ${m.border} opacity-80 hover:opacity-100`
                  }`}
                >
                  <span className="text-2xl drop-shadow-xs">{m.emoji}</span>
                  <span className={`text-[11px] font-bold ${isSelected ? 'text-amber-950' : m.text}`}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Short Note Text Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>한마디 마음 메모</span>
              <span className="text-[11px] font-normal text-slate-400">{noteText.length}/80자</span>
            </label>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value.slice(0, 80))}
              placeholder="예: 5분 산책하고 나니 머리가 맑아졌다 / 친구랑 작은 오해를 풀어서 다행이야"
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end">
            <button
              onClick={handleSaveEmotion}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-jua text-xs rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{selectedDate === todayStr ? '오늘의 감정 기록하기' : `${selectedDate} 기록 저장`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Monthly Calendar Section */}
      <div className="bg-white rounded-[32px] p-5 md:p-6 border-2 border-slate-200 shadow-sm space-y-4">
        {/* Calendar Header with navigation */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-amber-600" />
            <h3 className="font-jua text-lg text-slate-800">
              {currentYear}년 {currentMonth}월
            </h3>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-600"
              title="이전 달"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCurrentYear(new Date().getFullYear());
                setCurrentMonth(new Date().getMonth() + 1);
              }}
              className="text-xs font-bold px-2 py-1 hover:bg-white rounded-lg transition-colors text-slate-700"
            >
              오늘 달
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-600"
              title="다음 달"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-500 py-1">
          <span className="text-rose-500">일</span>
          <span>월</span>
          <span>화</span>
          <span>수</span>
          <span>목</span>
          <span>금</span>
          <span className="text-blue-500">토</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          {calendarDays.map((item, idx) => {
            if (!item.isCurrentMonth) {
              return <div key={`empty-${idx}`} className="h-16 md:h-20 bg-slate-50/40 rounded-xl" />;
            }

            const log = emotionLogs.find((l) => l.date === item.dateStr);
            const isToday = item.dateStr === todayStr;
            const isSelected = item.dateStr === selectedDate;

            return (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => handleSelectDay(item.dateStr)}
                className={`h-16 md:h-20 rounded-2xl p-1.5 flex flex-col justify-between items-start transition-all relative text-left border ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-300'
                    : isToday
                    ? 'border-rose-300 bg-rose-50/30'
                    : log
                    ? 'border-slate-200 bg-white hover:bg-slate-50'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center'
                        : 'text-slate-600 ml-1'
                    }`}
                  >
                    {item.day}
                  </span>
                  {log && (
                    <span className="text-base md:text-xl drop-shadow-xs">{log.emoji}</span>
                  )}
                </div>

                {log ? (
                  <div className="w-full">
                    <span className="text-[10px] font-bold text-slate-700 line-clamp-1 block">
                      {log.moodLabel}
                    </span>
                    {log.note && (
                      <span className="text-[9px] text-slate-500 line-clamp-1 hidden md:block">
                        {log.note}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-300 font-medium">+ 기록</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Monthly Diary Logs List */}
      <div className="bg-white rounded-[32px] p-5 md:p-6 border-2 border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-jua text-base text-slate-800 flex items-center gap-2">
            <span>📖 이번 달 마음 기록 모음</span>
            <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
              총 {monthlyLogs.length}건
            </span>
          </h3>
        </div>

        {monthlyLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Smile className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>아직 이번 달 기록된 감정이 없어요.</p>
            <p className="mt-1">위의 버튼을 눌러 첫 번째 감정을 남겨보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
            {monthlyLogs
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((log) => (
                <div
                  key={log.id}
                  onClick={() => handleSelectDay(log.date)}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-amber-50/50 hover:border-amber-200 transition-all cursor-pointer flex items-start gap-3"
                >
                  <div className="text-3xl p-1 bg-white rounded-xl shadow-2xs shrink-0">
                    {log.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs text-slate-800">{log.moodLabel}</span>
                      <span className="text-[11px] text-slate-400">{log.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed break-keep">
                      {log.note || <span className="text-slate-400 italic">(남긴 메모 없음)</span>}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
