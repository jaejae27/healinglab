import React, { useState } from 'react';
import { Student, CategoryId } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { StorageService } from '../../services/storage';
import {
  FlaskConical,
  X,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Gift,
  HelpCircle,
  Check
} from 'lucide-react';

interface NewMedicineModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onStudentUpdated?: () => void;
}

export const NewMedicineModal: React.FC<NewMedicineModalProps> = ({
  student,
  isOpen,
  onClose,
  onStudentUpdated
}) => {
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [suggestedName, setSuggestedName] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('study');
  const [whenAppears, setWhenAppears] = useState('');
  const [prescriptions, setPrescriptions] = useState<[string, string, string]>(['', '', '']);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastEarnedCookies, setLastEarnedCookies] = useState(0);
  const [lastSubmittedCount, setLastSubmittedCount] = useState(0);
  const [rerenderKey, setRerenderKey] = useState(0);

  if (!isOpen) return null;

  // Check if student has already submitted a proposal today (1 per day limit)
  const hasSubmittedToday = StorageService.hasSubmittedNewConditionToday(student.id);

  // Student's proposals list
  const proposals = StorageService.getNewConditionRequests().filter(
    (r) => r.studentId === student.id
  );

  // Count filled prescriptions
  const validMissions = prescriptions.map((p) => p.trim()).filter((p) => p.length > 0);
  const validCount = validMissions.length;

  // Cookie reward based on number of written prescriptions: 1 per prescription (1->1, 2->2, 3->3)
  const calculateReward = (count: number): number => {
    return Math.max(0, Math.min(3, count));
  };

  const currentExpectedReward = calculateReward(validCount);

  const handlePrescriptionChange = (index: 0 | 1 | 2, value: string) => {
    setPrescriptions((prev) => {
      const next: [string, string, string] = [prev[0], prev[1], prev[2]];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestedName.trim() || !whenAppears.trim()) return;
    if (validCount === 0) {
      alert('행동 처방을 최소 1개 이상 작성해 주세요!');
      return;
    }
    if (hasSubmittedToday) {
      alert('신약개발소는 하루에 1번만 참여할 수 있습니다. 내일 다시 참여해 주세요!');
      return;
    }

    const reward = calculateReward(validCount);

    // Save request
    StorageService.addNewConditionRequest({
      id: `REQ-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      classNum: student.classNum,
      number: student.number,
      suggestedName: suggestedName.trim(),
      categoryId,
      whenAppears: whenAppears.trim(),
      helpNeeded: '',
      missionIdea: validMissions.join(' / '),
      missionIdeas: validMissions,
      rewardCookies: reward,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    // Reward student with cookies immediately based on number of prescriptions written (1 cookie per prescription)
    StorageService.addCookieLog(
      student.id,
      reward,
      `신약개발소 처방 제안 (${validCount}개 작성, 처방당 1쿠키) 연구 장려 쿠키`
    );

    setLastEarnedCookies(reward);
    setLastSubmittedCount(validCount);
    setIsSubmitted(true);

    if (onStudentUpdated) onStudentUpdated();
  };

  const handleResetForm = () => {
    setSuggestedName('');
    setWhenAppears('');
    setPrescriptions(['', '', '']);
    setIsSubmitted(false);
    setMode('list');
  };

  return (
    <div key={rerenderKey} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] max-w-md w-full p-5 sm:p-6 border-2 border-purple-200 shadow-2xl relative text-left max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-3.5 pr-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-purple-200/50">
            🔬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-jua text-xl text-purple-950">신약개발소</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono">
                1일 1회 참여
              </span>
            </div>
            <p className="text-[11px] text-purple-700 font-medium">
              새로운 마음신호 & 행동 처방을 직접 제안하는 연구소
            </p>
          </div>
        </div>

        {/* Mode: Success After Submission */}
        {isSubmitted ? (
          <div className="text-center py-5 space-y-3.5 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-jua text-lg text-slate-900">
                마음신호 연구 제안이 완료되었어요!
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                행동 처방 <strong>{lastSubmittedCount}개</strong>를 성공적으로 연구 제안했습니다.
              </p>
            </div>

            {/* Cookie Reward Celebration Box */}
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 rounded-2xl border-2 border-amber-200 text-left space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-jua text-sm text-amber-950 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-600" />
                  <span>연구 참여 칭찬쿠키 즉시 지급!</span>
                </span>
                <span className="font-jua text-base text-amber-700 bg-white px-2.5 py-0.5 rounded-xl border border-amber-300 shadow-2xs">
                  +{lastEarnedCookies} 🍪
                </span>
              </div>
              <p className="text-[11.5px] text-amber-900/90 leading-relaxed">
                작성한 행동처방 개수({lastSubmittedCount}개)에 맞춰 <strong>칭찬쿠키 {lastEarnedCookies}개</strong>가 내 지갑에 바로 적립되었습니다.
              </p>
              <div className="pt-1 border-t border-amber-200/60 text-[10.5px] text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>선생님이 검토 후 정식 마음신호로 채택 시 추가 명예가 주어집니다!</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 text-center">
              🌙 깊이 있는 성찰을 위해 신약 연구 제안은 <strong>하루 1회만</strong> 가능합니다. 내일 또 새로운 처방을 연구해 보세요!
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetForm}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-jua text-xs rounded-xl transition-colors"
              >
                내 제안 목록 보기
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-jua text-xs rounded-xl shadow-xs transition-colors"
              >
                확인 완료
              </button>
            </div>
          </div>
        ) : mode === 'create' ? (
          /* Mode: Create Form */
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-purple-100 pb-2">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                <span>📝 새 마음신호 제안서 작성</span>
              </span>
              <button
                type="button"
                onClick={() => setMode('list')}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-700 underline"
              >
                목록으로
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  새로운 마음신호 이름 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={suggestedName}
                  onChange={(e) => setSuggestedName(e.target.value)}
                  placeholder="예: 수행평가발등불증, 카톡읽씹불안증, 쉬는시간멍때림증"
                  className="w-full bg-purple-50/40 border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-300 font-medium placeholder:text-slate-400"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">해당 영역</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value as CategoryId)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name} ({cat.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* When Appears */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  이 마음신호는 주로 언제 나타나나요? <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={whenAppears}
                  onChange={(e) => setWhenAppears(e.target.value)}
                  placeholder="예: 시험 일주일 전인데 공부는 손에 안 잡히고 계속 멍때릴 때"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-slate-400 leading-relaxed"
                />
              </div>

              {/* Action Prescriptions Section (1 to 3 items) */}
              <div className="border-t border-purple-100 pt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>행동 처방 작성</span>
                      <span className="text-[10.5px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        1개~3개 자유 작성
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      1개만 써도 제출 가능! 처방을 많이 쓸수록 더 많은 쿠키가 지급돼요.
                    </p>
                  </div>
                </div>

                {/* Real-time Dynamic Cookie Reward Card */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-3 flex items-center justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-amber-950">
                        작성 완료: {validCount} / 3개
                      </span>
                      {validCount >= 1 && (
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                          제출 가능
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-amber-800 mt-0.5">
                      {validCount === 0 && '처방 1개당 쿠키 1개씩! (1개는 1🍪, 2개는 2🍪, 3개는 3🍪)'}
                      {validCount === 1 && '처방 1개 완료! (+1🍪) 처방 2까지 쓰면 2🍪 지급!'}
                      {validCount === 2 && '처방 2개 완료! (+2🍪) 처방 3까지 쓰면 3🍪 올클리어!'}
                      {validCount === 3 && '👑 처방 3개 올클리어 완료! 칭찬쿠키 3개 지급!'}
                    </p>
                  </div>
                  <div className="text-center shrink-0 pl-2">
                    <span className="text-[9.5px] font-bold text-amber-800 block">지급 예정</span>
                    <div className="font-jua text-base text-amber-800 bg-white/90 px-2.5 py-1 rounded-xl border border-amber-300 shadow-2xs flex items-center gap-1">
                      <span>🍪</span>
                      <span>+{currentExpectedReward}개</span>
                    </div>
                  </div>
                </div>

                {/* Prescription Slot 1 (Required) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold flex items-center justify-center">
                        1
                      </span>
                      <span>행동 처방 1</span>
                      <span className="text-rose-500 font-bold">* (최소 1개 필수)</span>
                    </span>
                    <span className="text-[10.5px] font-bold text-amber-700">
                      작성 시 +1 🍪
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={prescriptions[0]}
                    onChange={(e) => handlePrescriptionChange(0, e.target.value)}
                    placeholder="예: 폰을 30분간 가방에 넣고 좋아하는 노래 1곡 듣기"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-slate-400 font-medium"
                  />
                </div>

                {/* Prescription Slot 2 (Optional) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        2
                      </span>
                      <span>행동 처방 2</span>
                      <span className="text-slate-400 font-normal text-[11px]">(선택)</span>
                    </span>
                    <span className="text-[10.5px] font-bold text-indigo-700">
                      작성 시 +1 🍪 (총 2 🍪)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={prescriptions[1]}
                    onChange={(e) => handlePrescriptionChange(1, e.target.value)}
                    placeholder="예: 친구에게 오늘 있었던 고마운 일 한 가지 칭찬하기"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-slate-400 font-medium"
                  />
                </div>

                {/* Prescription Slot 3 (Optional) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        3
                      </span>
                      <span>행동 처방 3</span>
                      <span className="text-slate-400 font-normal text-[11px]">(선택)</span>
                    </span>
                    <span className="text-[10.5px] font-bold text-amber-700">
                      작성 시 +1 🍪 (총 3 🍪 👑)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={prescriptions[2]}
                    onChange={(e) => handlePrescriptionChange(2, e.target.value)}
                    placeholder="예: 잠들기 전 따뜻한 물 한 잔 마시며 3분간 심호흡하기"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-jua text-xs rounded-xl transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={validCount === 0 || !suggestedName.trim() || !whenAppears.trim()}
                  className="w-2/3 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-jua text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-amber-200" />
                  <span>
                    제출하고 🍪 +{currentExpectedReward}개 받기
                  </span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Mode: List View & Guide */
          <div className="space-y-3.5">
            {/* Today Already Submitted Notice or Guide Card */}
            {hasSubmittedToday ? (
              <div className="p-3.5 bg-indigo-50/90 border-2 border-indigo-200 rounded-2xl text-xs text-indigo-900 space-y-1.5 shadow-2xs">
                <div className="font-jua text-indigo-950 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm">
                    <span>🌙 오늘의 신약 연구 제안 완료</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                    오늘 1회 완료 ✅
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  신약개발소는 정성 가득한 고민과 성찰을 위해 <strong>하루에 1번만</strong> 참여할 수 있어요.
                  선생님께서 제안해주신 소중한 아이디어를 심사 중입니다! 내일 새로운 마음신호로 다시 도전해 주세요.
                </p>
                <div className="pt-1 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      StorageService.resetTodayNewConditionSubmission(student.id);
                      setRerenderKey((k) => k + 1);
                    }}
                    className="text-[10px] text-slate-400 hover:text-indigo-600 underline transition-colors"
                    title="체험 및 심사 편의를 위해 오늘 참여 제한을 즉시 초기화합니다"
                  >
                    ⚡ (체험·심사용) 오늘 참여 제한 일시 해제
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-purple-200 text-xs text-purple-900 space-y-1.5 shadow-2xs">
                <div className="font-jua text-purple-950 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm">
                    <span>💡 신약 연구원 혜택</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    처방당 1🍪 (최대 3🍪)
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-600 leading-snug">
                  나와 친구들의 마음에 꼭 필요한 새로운 마음신호와 행동처방을 제안해 보세요!
                </p>
                <div className="bg-white/80 rounded-xl p-2 border border-purple-200/60 text-[11px] text-purple-950 flex items-center justify-around font-medium">
                  <span>처방 1개: <strong>1🍪</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>처방 2개: <strong>2🍪</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>처방 3개: <strong className="text-amber-700">3🍪 (올클리어 👑)</strong></span>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  * 하루 1회 참여 가능 • 선생님 채택 시 학교 정식 마음신호로 등재
                </p>
              </div>
            )}

            {/* My Proposals List */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-jua text-slate-800 flex items-center gap-1">
                  <span>내가 제안한 마음신호</span>
                  <span className="text-purple-600 font-mono">({proposals.length}건)</span>
                </span>
              </div>

              {proposals.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center text-xs text-slate-400 space-y-1">
                  <div className="text-2xl">🌱</div>
                  <p className="font-medium text-slate-600">아직 제안한 마음신호가 없어요.</p>
                  <p className="text-[11px] text-slate-400">
                    첫 번째 신약 연구원이 되어 나만의 마음신호를 등록해 보세요!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {proposals.map((p) => {
                    const isToday = p.createdAt.startsWith(StorageService.getTodayString());
                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-2xl border flex flex-col gap-1.5 text-xs transition-colors ${
                          isToday
                            ? 'bg-purple-50/60 border-purple-200 shadow-2xs'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-slate-800 truncate">
                              {p.suggestedName}
                            </span>
                            {isToday && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-200 text-purple-900 rounded">
                                오늘 제안
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {p.rewardCookies && (
                              <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                +{p.rewardCookies}🍪
                              </span>
                            )}
                            <span
                              className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full font-mono ${
                                p.status === 'approved' || p.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.status === 'rejected'
                                  ? 'bg-slate-200 text-slate-600'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {p.status === 'approved' || p.status === 'accepted'
                                ? '✅ 채택'
                                : p.status === 'rejected'
                                ? '반려'
                                : '⏳ 심사 중'}
                            </span>
                          </div>
                        </div>

                        {/* Prescriptions summary */}
                        <div className="text-[11px] text-slate-500 bg-white/70 p-2 rounded-xl border border-slate-100 space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 block">
                            제안 처방 ({p.missionIdeas ? p.missionIdeas.length : 1}개):
                          </span>
                          {p.missionIdeas && p.missionIdeas.length > 0 ? (
                            p.missionIdeas.map((m, idx) => (
                              <p key={idx} className="line-clamp-1 text-slate-700">
                                • {m}
                              </p>
                            ))
                          ) : (
                            <p className="line-clamp-1 text-slate-700">• {p.missionIdea || p.whenAppears}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action button: Write New Proposal or Disabled if already submitted today */}
            {hasSubmittedToday ? (
              <div className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-400 font-jua text-xs rounded-2xl text-center flex items-center justify-center gap-1.5 cursor-not-allowed">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>오늘 제안 완료 (내일 다시 참여 가능 🌙)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setMode('create')}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-jua text-sm rounded-2xl shadow-md shadow-purple-200 flex items-center justify-center gap-1.5 transition-transform active:scale-98"
              >
                <PlusCircle className="w-4 h-4" />
                <span>새로운 마음신호 제안서 작성하기</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
