import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, X, AlertTriangle, Heart, Award, ShieldAlert, Sparkles } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
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
          aria-labelledby="terms-service-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 pb-3.5 border-b-2 border-[#5A5A40]/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-xl border-2 border-white shadow-xs text-amber-800 shrink-0">
                <FileText className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    교육용 웹서비스 이용약관
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">버전 2026.10-v1</span>
                </div>
                <h2 id="terms-service-title" className="font-jua text-lg sm:text-xl text-[#5A5A40]">
                  힐링약국 서비스 이용약관
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

          {/* Scrollable Terms Content */}
          <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-4 text-xs leading-relaxed text-[#4A4A4A] border border-[#5A5A40]/10 rounded-2xl p-4 bg-white/80">
            {/* Essential Metaphor Disclaimer Banner */}
            <div className="p-3.5 bg-rose-50/90 rounded-xl border border-rose-200 text-rose-950 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-xs text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>중요 안내: 실제 의료·심리 진단이 아닌 교육용 메타포 공간입니다</span>
              </p>
              <p className="text-[11.5px] text-rose-900 leading-normal">
                본 웹앱의 모든 ‘마음신호’(가상 증상), ‘처방전’, ‘행동처방 약’ 등의 명칭은 <strong>중학생의 일상적 마음과 감정을 친근하게 알아차리기 위한 교육용 은유(Metaphor)</strong>입니다.
                실제 병원이나 의료기관의 질병 진단, 약리학적 처방, 전문 심리 치료 행위가 아니며, 이를 대체할 수 없습니다.
              </p>
            </div>

            {/* Emergency & Monitoring Disclaimer */}
            <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200 text-amber-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                <span>심리적 위기 및 실시간 대응 관련 면책 사항</span>
              </p>
              <p className="text-[11px] text-amber-900 leading-normal">
                담당 교사는 수업 및 교육활동 시간 중에 학생의 기록을 확인하며, <strong>24시간 실시간 모니터링이나 긴급 위기 상황 즉각 대응을 보장하지 않습니다.</strong>
                우울, 불안, 자해 충동, 심리적 위기 상황이 느껴질 경우 즉시 담임교사, 전문상담교사, 위(Wee) 센터, 또는 청소년상담전화(1388), 자살예방상담(109) 등 전문 위기지원기관에 직접 도움을 요청해야 합니다.
              </p>
            </div>

            {/* Article 1 */}
            <section className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">제1조 (목적)</h3>
              <p className="text-slate-700 pl-4 text-[11.5px]">
                본 약관은 중학교 사회정서교육 지원 웹앱 「힐링약국」(이하 '서비스')을 학교 교육활동에서 이용함에 있어, 서비스 제공자와 학생 및 교원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            {/* Article 2 */}
            <section className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">제2조 (서비스의 내용 및 교육적 성격)</h3>
              <ul className="list-disc list-inside text-slate-600 pl-4 space-y-1 text-[11.5px]">
                <li>본 서비스는 130종의 일상 가상 마음신호 탐색, 맞춤형 5일 행동처방 미션 실천, 감정 달력 기록, 사회정서역량(SEL) 사전·사후 검사, 워크북 및 포트폴리오 인쇄 기능을 제공합니다.</li>
                <li>서비스 내의 모든 진단 문항과 마음신호는 학생 스스로 자기 마음을 돌아보고 긍정적인 실천 행동을 이끌어내기 위한 교육 활동의 도구입니다.</li>
              </ul>
            </section>

            {/* Article 3 */}
            <section className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">제3조 (교사의 열람 범위 및 목적)</h3>
              <div className="pl-4 space-y-1 text-[11.5px] text-slate-600">
                <p>학교의 담당 교사는 교사 관리자 모드를 통해 다음 범위의 기록을 열람할 수 있습니다:</p>
                <ul className="list-disc list-inside pl-2 space-y-0.5 text-[11px]">
                  <li>학생의 마음신호 처방 내역 및 5일 행동 미션 실천 소감</li>
                  <li>사회정서역량 사전·사후 검사 응답 및 성장 점수 통계</li>
                  <li>칭찬쿠키 지급 내역, 마음성장 배지 달성 현황, 신약 제안 내용</li>
                </ul>
                <p className="text-slate-700 font-semibold mt-1">
                  * 교사의 열람 목적은 학생의 긍정적 생활지도, 성취 칭찬, 개별 상담 연계에 엄격히 한정되며, 성적 평가나 순위 매기기 목적으로 사용되지 않습니다.
                </p>
              </div>
            </section>

            {/* Article 4 */}
            <section className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">제4조 (교육용 포인트 및 보상 정책)</h3>
              <ul className="list-disc list-inside text-slate-600 pl-4 space-y-1 text-[11.5px]">
                <li>서비스 내에서 지급되는 <strong>‘칭찬쿠키’</strong> 및 <strong>‘마음성장 배지’</strong>는 학생의 성실한 자기돌봄 활동을 격려하기 위한 순수 교육용 게이미피케이션 요소입니다.</li>
                <li>칭찬쿠키는 어떠한 경우에도 실제 화폐 가치로 환전되거나 상업적으로 거래될 수 없으며, 학교 교육활동 종료 시 소멸됩니다.</li>
              </ul>
            </section>

            {/* Article 5 */}
            <section className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">제5조 (학생의 의무 및 올바른 이용)</h3>
              <ul className="list-disc list-inside text-slate-600 pl-4 space-y-1 text-[11.5px]">
                <li>학생은 타인의 학년·반·번호를 무단 도용하거나 다른 학생의 PIN을 입력하여 대리 접속해서는 안 됩니다.</li>
                <li>자유 입력창(미션 실천 소감, 신약 제안 등)에 친구나 타인의 실명, 전화번호, 비방 문구, 사생활 침해 내용, 불필요한 민감 병력을 기재해서는 안 됩니다.</li>
                <li>컴퓨터실이나 공용 태블릿 PC에서 이용한 후에는 반드시 <strong>[로그아웃]</strong> 버튼을 눌러 개인정보를 보호해야 합니다.</li>
              </ul>
            </section>

            {/* Article 6 */}
            <section className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">제6조 (기록의 관리 및 삭제)</h3>
              <p className="text-slate-700 pl-4 text-[11.5px]">
                학생은 언제든지 마이페이지에서 본인의 기록을 확인하고 직접 영구 삭제(동의 철회)할 수 있으며, 이 경우 모든 쿠키 및 배지 기록은 복구 불가능하게 파기됩니다.
              </p>
            </section>

            {/* Article 7 */}
            <section className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">제7조 (저작권 및 교육 콘텐츠 보호)</h3>
              <p className="text-slate-700 pl-4 text-[11.5px]">
                「힐링약국」의 캐릭터(힐리), 130종 가상 마음신호 분류 체계, 맞춤형 처방 미션 문구 및 워크북 디자인의 저작권은 개발자(경기도 도덕교사 허재이)에게 있으며, 학교 현장의 비영리 교육활동 목적으로 자유롭게 활용할 수 있습니다. 단, 무단 상업적 재배포 및 표절은 엄격히 금지됩니다.
              </p>
            </section>

            {/* Article 8 */}
            <section className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">제8조 (서비스의 변경 및 중단)</h3>
              <p className="text-slate-700 pl-4 text-[11.5px]">
                시스템 점검, 클라우드 인프라 개선, 학년도 종료 등으로 서비스 내용이 변경되거나 일시 중단될 수 있으며, 중단 시 학교를 통해 사전 안내합니다.
              </p>
            </section>
          </div>

          {/* Footer Close Button */}
          <div className="pt-2 shrink-0 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-white font-jua text-sm rounded-xl shadow-md border border-white transition-all active:scale-95"
            >
              약관 확인 완료 및 닫기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
