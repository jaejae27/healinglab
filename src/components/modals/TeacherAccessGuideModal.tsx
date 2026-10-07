import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, X, Eye, ShieldCheck, UserCheck, AlertCircle, FileCheck2 } from 'lucide-react';

interface TeacherAccessGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherAccessGuideModal: React.FC<TeacherAccessGuideModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-[#FDFCF0] rounded-[32px] sm:rounded-[36px] border-4 border-white shadow-2xl p-5 sm:p-7 max-h-[90vh] flex flex-col text-[#4A4A4A] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="teacher-access-guide-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 pb-3.5 border-b-2 border-[#5A5A40]/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl border-2 border-white shadow-xs text-indigo-800 shrink-0">
                <BookOpen className="w-6 h-6 text-indigo-700" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                    학생·학부모 투명성 안내
                  </span>
                </div>
                <h2 id="teacher-access-guide-title" className="font-jua text-lg sm:text-xl text-[#5A5A40]">
                  교사 열람 범위 및 기록 관리 안내서
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors shrink-0"
              title="닫기 (Esc)"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-4 text-xs leading-relaxed text-[#4A4A4A] border border-[#5A5A40]/10 rounded-2xl p-4 bg-white/80">
            {/* Guide Introduction */}
            <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 text-indigo-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-xs text-indigo-900">
                <Eye className="w-4 h-4 text-indigo-700 shrink-0" />
                <span>선생님이 내 기록을 어떻게 확인하고 관리하나요?</span>
              </p>
              <p className="text-[11.5px] text-indigo-800 leading-normal">
                학생 여러분이 안심하고 스스로 마음을 돌볼 수 있도록, 선생님이 확인할 수 있는 정보의 범위와 목적, 그리고 기록 관리 방식을 투명하게 안내합니다.
              </p>
            </div>

            {/* Item 1: Scope */}
            <section className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                <span>선생님이 열람할 수 있는 기록의 범위</span>
              </h3>
              <ul className="list-disc list-inside text-slate-600 pl-6 space-y-1 text-[11.5px]">
                <li><strong>처방전 및 행동 미션 실천 소감:</strong> 학생이 발급받은 마음신호 종류와 5일 동안 적은 간단한 실천 메모</li>
                <li><strong>사회정서역량(SEL) 검사 결과:</strong> 5개 역량 영역(자기인식, 자기조절, 자기돌봄, 도움요청, 공감실천) 사전·사후 점수</li>
                <li><strong>신약 제안 및 칭찬쿠키:</strong> 학생들이 신약개발소에 제안한 새로운 마음신호 아이디어 심사 및 칭찬쿠키 지급 이력</li>
              </ul>
            </section>

            {/* Item 2: Purpose */}
            <section className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                <span>교사 열람의 교육적 목적과 제한</span>
              </h3>
              <div className="pl-6 space-y-1.5 text-[11.5px] text-slate-700">
                <p>
                  • <strong>격려와 성장 지원:</strong> 성실하게 자기 마음을 돌본 학생에게 칭찬쿠키를 지급하고 따뜻한 격려를 전하기 위함입니다.<br />
                  • <strong>상담 및 연계 필요성 파악:</strong> 특정 마음신호가 지속되거나 마음의 어려움이 감지될 경우 전문상담교사나 위(Wee) 센터 상담으로 따뜻하게 돕기 위함입니다.<br />
                  • 🚫 <strong>절대 금지 사항:</strong> 본 기록은 성적 산출, 학생 평가, 등수 매기기, 벌점 부과 목적으로 절대 사용되지 않습니다.
                </p>
              </div>
            </section>

            {/* Item 3: Storage & Deletion */}
            <section className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                <span>기록의 보관과 파기</span>
              </h3>
              <ul className="list-disc list-inside text-slate-600 pl-6 space-y-1 text-[11.5px]">
                <li><strong>보유 기간:</strong> 학년도 종료 시점(매년 2월 말일) 또는 1년 이내 전량 파기됩니다.</li>
                <li><strong>학생의 직접 삭제 권리:</strong> 학생 본인은 마이페이지에서 언제든지 본인의 모든 활동 기록을 직접 영구 삭제할 수 있습니다.</li>
              </ul>
            </section>

            {/* Item 4: Tips for Students */}
            <section className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold flex items-center justify-center shrink-0">4</span>
                <span>학생을 위한 개인정보 보호 실천 팁</span>
              </h3>
              <div className="pl-6 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
                <p>1. <strong>개인정보 최소 입력:</strong> 감정 일기나 실천 소감에 친구의 이름, 연락처, 비밀 사생활은 적지 마세요.</p>
                <p>2. <strong>비밀번호(PIN) 관리:</strong> 초기 비밀번호(0000)를 마이페이지에서 나만 아는 번호로 변경하세요.</p>
                <p>3. <strong>공용 기기 사용 후 로그아웃:</strong> 컴퓨터실이나 교실 태블릿 이용 후에는 화면 상단의 <strong>[로그아웃]</strong> 버튼을 꼭 누르세요.</p>
                <p>4. <strong>동의 거부 시 대체 활동:</strong> 디지털 웹앱 이용을 원하지 않는 학생은 오프라인 인쇄용 워크북 및 지필 활동지로 동일한 교육활동에 참여할 수 있습니다.</p>
              </div>
            </section>
          </div>

          {/* Footer Close Button */}
          <div className="pt-2 shrink-0 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-jua text-sm rounded-xl shadow-md border border-white transition-all active:scale-95"
            >
              안내 확인 및 닫기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
