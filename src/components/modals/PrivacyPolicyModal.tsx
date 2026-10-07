import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X, FileText, CheckCircle2, Lock, Users, AlertTriangle, HelpCircle } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
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
          aria-labelledby="privacy-policy-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 pb-3.5 border-b-2 border-[#5A5A40]/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-100 flex items-center justify-center text-xl border-2 border-white shadow-xs text-teal-800 shrink-0">
                <ShieldCheck className="w-6 h-6 text-teal-700" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    학습지원 소프트웨어 기준 준수
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">버전 2026.10-v1</span>
                </div>
                <h2 id="privacy-policy-title" className="font-jua text-lg sm:text-xl text-[#5A5A40]">
                  힐링약국 개인정보처리방침
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

          {/* Scrollable Document Content */}
          <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-4 text-xs leading-relaxed text-[#4A4A4A] border border-[#5A5A40]/10 rounded-2xl p-4 bg-white/80">
            {/* Overview Banner */}
            <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200 text-teal-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-xs text-teal-900">
                <FileText className="w-4 h-4 text-teal-700" />
                <span>기본 방침 및 개인정보 최소수집 선언</span>
              </p>
              <p className="text-[11px] text-teal-800 leading-normal">
                「힐링약국」(이하 '웹앱')은 중학교 정규 교육과정 및 교과·창의적 체험활동 연계 사회정서학습(SEL)을 지원하는 교육용 웹소프트웨어입니다.
                본 웹앱은 학생의 학습과 자기성찰에 꼭 필요한 <strong>최소한의 정보만을 처리</strong>하며, 영리 목적의 수집·제3자 판매를 절대 하지 않습니다.
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                <span>개인정보의 처리 목적</span>
              </h3>
              <p className="text-slate-700 pl-6">
                웹앱은 다음 목적을 위해서만 개인정보를 처리합니다. 처리 목적이 변경될 경우 사전에 동의를 구합니다.
              </p>
              <ul className="list-disc list-inside text-slate-600 pl-8 space-y-0.5 text-[11.5px]">
                <li><strong>학생 식별 및 학습 이력 관리:</strong> 학년·반·번호·이름·PIN을 통한 본인 인증 및 활동 기록 유지</li>
                <li><strong>맞춤형 마음신호 처방 및 행동 실천:</strong> 가상 증상 선택, 5일 실천 미션 기록, 감정 달력 기록</li>
                <li><strong>사회정서역량(SEL) 효과성 분석:</strong> 사전·사후 검사 응답 분석을 통한 교육적 성장 확인 및 교사 지도 지원</li>
                <li><strong>성취 격려 및 칭찬쿠키 관리:</strong> 미션 완수 보상 쿠키, 성장 배지 12종 발급 및 통계 산출</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                <span>처리하는 개인정보의 항목</span>
              </h3>
              <div className="pl-6 space-y-2">
                <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2">구분</th>
                        <th className="p-2">처리 항목</th>
                        <th className="p-2">저장 위치</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      <tr>
                        <td className="p-2 font-bold text-slate-900">학생 기본정보</td>
                        <td className="p-2">학년, 반, 번호, 성명, 4자리 PIN</td>
                        <td className="p-2 text-slate-600">브라우저 로컬 저장소 및 학교 전용 클라우드 DB</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-slate-900">활동 실천기록</td>
                        <td className="p-2">마음신호 선택, 처방전, 5일 미션 일지, 감정 일기, 칭찬쿠키, 성장 배지</td>
                        <td className="p-2 text-slate-600">브라우저 로컬 저장소 및 학교 전용 클라우드 DB</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-slate-900">사전·사후 검사</td>
                        <td className="p-2">사회정서역량 20문항 응답 및 주관식 소감</td>
                        <td className="p-2 text-slate-600">브라우저 로컬 저장소 및 학교 전용 클라우드 DB</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  🚫 <strong>불수집 정보:</strong> 주민등록번호, 학생 및 학부모 전화번호, 이메일 주소, 실제 의료기관 진료기록, 금융정보는 일체 수집하거나 저장하지 않습니다.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                <span>보유 및 이용 기간과 파기 절차</span>
              </h3>
              <ul className="list-disc list-inside text-slate-600 pl-6 space-y-1 text-[11.5px]">
                <li><strong>보유 기간:</strong> 수집일로부터 <strong>1년</strong> (해당 학년도 종료 시점인 익년도 2월 말일까지 보유 후 파기 원칙)</li>
                <li><strong>파기 절차:</strong> 학년도 종료 시 담당 교사의 관리자 대시보드 기능을 통해 일괄 파기하거나, 학생 본인 또는 보호자의 요청 시 즉시 복구 불가능하게 영구 삭제(Purge)합니다.</li>
                <li><strong>파기 방법:</strong> 전자적 파일은 DB 및 로컬 저장소에서 복원 불가능한 기술적 방법으로 완전 파기하며, 삭제된 학생 ID는 영구 표식(Tombstone)으로 관리되어 백업 복원 시에도 되살아나지 않습니다.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0">4</span>
                <span>만 14세 미만 아동 보호 및 법정대리인 동의</span>
              </h3>
              <div className="pl-6 space-y-1.5 text-[11.5px] text-slate-600">
                <p>
                  본 웹앱은 만 14세 미만 중학생이 주로 이용하는 교육용 소프트웨어로서, <strong>학생 본인의 학습 안내 확인</strong>과 <strong>법정대리인(보호자) 동의</strong>를 엄격히 분리하여 관리합니다.
                </p>
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-950 text-[11px] space-y-1">
                  <p className="font-bold">⚠️ 법정대리인 동의 절차 안내</p>
                  <p>
                    학생이 웹 화면에서 체크박스를 클릭하는 것만으로 보호자 동의가 완료되지 않습니다.
                    학교에서 발송하는 <strong>가정통신문(종이 회신서) 또는 학교 전자 알리미</strong>를 통해 접수된 동의 내역을 담당 교사가 확인하고, 확인 일시·방법·문서번호를 시스템에 기록하여 관리합니다.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0">5</span>
                <span>정보주체 및 법정대리인의 권리와 행사 방법</span>
              </h3>
              <ul className="list-disc list-inside text-slate-600 pl-6 space-y-1 text-[11.5px]">
                <li>학생 및 법정대리인은 언제든지 자신의 개인정보에 대해 <strong>열람, 정정, 삭제, 처리정지, 동의 철회</strong>를 요구할 수 있습니다.</li>
                <li><strong>학생 본인 직접 행사:</strong> 로그인 후 '마이페이지 &gt; 내 정보 및 권리 관리'에서 본인의 모든 활동 기록을 직접 확인하고 즉시 영구 삭제할 수 있습니다.</li>
                <li><strong>보호자 행사:</strong> 학교의 담당 교사 또는 개인정보 담당자에게 서면 또는 유선으로 연락하여 신속하게 처리받으실 수 있습니다.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0">6</span>
                <span>위탁 처리 및 인프라 운영 (국외 이전 등)</span>
              </h3>
              <div className="pl-6 space-y-1 text-[11.5px] text-slate-600">
                <p>웹앱은 원활한 서비스 제공을 위해 아래와 같은 글로벌 보안 인증 인프라를 활용합니다:</p>
                <ul className="list-disc list-inside pl-2 space-y-0.5 text-[11px]">
                  <li><strong>데이터베이스 저장 위탁:</strong> Google Cloud Platform (Google Firebase Firestore) - 암호화된 클라우드 데이터베이스 저장</li>
                  <li><strong>웹 호스팅 위탁:</strong> Vercel Inc. - 웹 애플리케이션 프론트엔드 배포 및 서빙</li>
                  <li><strong>외부 웹 폰트:</strong> Google Fonts (화면 표시용)</li>
                  <li><strong>AI API 전송 여부:</strong> 본 웹앱은 외부 생성형 AI(Gemini, ChatGPT 등)로 학생 데이터를 전송하거나 학습에 일체 사용하지 않으며, 모든 중복률 분석은 사용자 브라우저 내에서 자체 알고리즘으로 처리됩니다.</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0">7</span>
                <span>개인정보의 안전성 확보 조치</span>
              </h3>
              <ul className="list-disc list-inside text-slate-600 pl-6 space-y-0.5 text-[11px]">
                <li><strong>로그인 화면 학생 명단 비노출:</strong> 사전 로그인 화면에서 전체 학생 명단이 노출되지 않도록 학년·반·번호·이름·PIN 입력 검증 체계를 운영합니다.</li>
                <li><strong>관리자 비밀번호 암호화:</strong> 관리자 비밀번호를 브라우저에 평문으로 보관하지 않고, 솔트(Salt)가 적용된 SHA-256 일방향 해시로 암호화 검증하며, 연속 실패 시 락아웃(Lockout)을 적용합니다.</li>
                <li><strong>권한 분리:</strong> 학생 클라이언트는 본인 계정의 활동 데이터에만 접근할 수 있도록 설계되어 있습니다.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0">8</span>
                <span>문의처 및 개인정보 보호 책임자</span>
              </h3>
              <div className="pl-6 text-[11.5px] text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p>• <strong>개발 및 교육 기획:</strong> 허재이 (경기도 도덕교사, 인스타그램 @jae2_ethics)</p>
                <p>• <strong>학교별 개인정보 보호 책임자:</strong> 본 웹앱을 도입·운영하는 각 중학교의 학교장 및 개인정보보호책임관</p>
                <p>• <strong>문의 및 고충 처리:</strong> 학교 담당 교사실 또는 개발자 인스타그램 DM</p>
              </div>
            </section>
          </div>

          {/* Footer Close Button */}
          <div className="pt-2 shrink-0 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-teal-500 hover:from-amber-500 hover:to-teal-600 text-white font-jua text-sm rounded-xl shadow-md border border-white transition-all active:scale-95"
            >
              확인 및 닫기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
