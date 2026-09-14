import React, { useMemo } from 'react';
import { StorageService } from '../../services/storage';
import { Printer, ArrowLeft } from 'lucide-react';

interface WorkbookPrintViewProps {
  conditionId: string;
  onBack: () => void;
}

export const WorkbookPrintView: React.FC<WorkbookPrintViewProps> = ({ conditionId, onBack }) => {
  const condition = useMemo(() => StorageService.getConditionById(conditionId), [conditionId]);

  if (!condition) {
    return (
      <div className="p-8 text-center">
        <p>해당 증상을 찾을 수 없습니다.</p>
        <button onClick={onBack} className="mt-2 text-rose-500 font-bold underline">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 print:p-0 print:bg-white flex flex-col items-center">
      {/* Non-print toolbar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>앱으로 돌아가기</span>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-jua shadow-md shadow-rose-200"
        >
          <Printer className="w-4 h-4" />
          <span>인쇄하기 (A4 / A5 실물 워크북)</span>
        </button>
      </div>

      {/* A4 Printable Sheet Container */}
      <div className="w-full max-w-2xl bg-white border-2 border-slate-300 print:border-none p-8 rounded-2xl print:p-4 text-slate-900 shadow-lg print:shadow-none print:w-full">
        {/* Header */}
        <div className="border-b-2 border-slate-800 pb-3 mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-slate-900 text-white font-mono font-bold text-xs px-2 py-0.5 rounded">
                HEALING PHARMACY WORKBOOK
              </span>
              <span className="font-bold text-xs text-slate-600">사회정서교육 마음 처방전</span>
            </div>
            <h1 className="font-jua text-2xl mt-1 tracking-tight">
              [{condition.conditionId}] {condition.name}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5 italic">"{condition.summary}"</p>
          </div>

          {/* Student Info Stamp Box */}
          <div className="border border-slate-400 text-xs rounded divide-y divide-slate-300 text-center w-48">
            <div className="bg-slate-50 font-bold py-1">처방 수령자 (학생)</div>
            <div className="grid grid-cols-4 divide-x divide-slate-300 py-1 font-medium">
              <div>___학년</div>
              <div>___반</div>
              <div>___번</div>
              <div>이름:</div>
            </div>
            <div className="py-1 text-[11px] text-slate-500">발급일자: 2026. ___. ___</div>
          </div>
        </div>

        {/* Section 1: Condition Self-Check */}
        <div className="mb-4">
          <h2 className="font-jua text-sm bg-slate-100 px-2 py-1 border-l-4 border-slate-700 mb-2">
            1. 지금 내 마음의 신호 알아차리기 (해당하는 칸에 V 표시)
          </h2>
          <div className="space-y-1.5 text-xs">
            {condition.checkItemsSample.map((item, i) => (
              <div key={i} className="flex items-center gap-2 border border-slate-200 p-2 rounded">
                <span className="w-4 h-4 border border-slate-400 rounded inline-block" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: 3 Prescription Missions */}
        <div className="mb-4">
          <h2 className="font-jua text-sm bg-slate-100 px-2 py-1 border-l-4 border-slate-700 mb-2">
            2. 힐링약국 맞춤 행동 처방전 (실천 후 체크하기)
          </h2>
          <div className="space-y-2 text-xs">
            {condition.prescriptionCandidates.slice(0, 3).map((mission, idx) => (
              <div key={mission.id} className="border border-slate-300 p-2.5 rounded">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>
                    처방 {idx + 1}. {mission.title}
                  </span>
                  <span className="text-[10px] border border-slate-400 px-1 rounded">
                    실천 여부: [ ] 완벽실천 [ ] 조금시도
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{mission.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Reflection & What Worked */}
        <div className="mb-4">
          <h2 className="font-jua text-sm bg-slate-100 px-2 py-1 border-l-4 border-slate-700 mb-2">
            3. 나의 실천 기록 & 성찰 (선생님께 제출하기 전 작성)
          </h2>
          <div className="border border-slate-300 p-3 rounded space-y-2 text-xs">
            <div>
              <span className="font-bold">가장 도움이 되었던 처방:</span> [ 처방 ___ 번 ]
            </div>
            <div>
              <span className="font-bold">왜 그 방법이 도움이 되었나요?</span>
              <div className="h-10 border-b border-dashed border-slate-300 mt-1" />
            </div>
            <div>
              <span className="font-bold">새롭게 알게 된 내 마음이나 느낀 점:</span>
              <div className="h-10 border-b border-dashed border-slate-300 mt-1" />
            </div>
          </div>
        </div>

        {/* Section 4: Teacher Confirmation & Snack Exchange Stamp */}
        <div className="border-2 border-dashed border-slate-400 p-3 rounded-xl flex items-center justify-between text-xs bg-slate-50/50">
          <div>
            <span className="font-jua text-sm text-slate-800">
              🍬 실물 처방약(간식) 교환권
            </span>
            <p className="text-[11px] text-slate-600 mt-0.5">
              처방 미션을 실천하고 본 워크북을 교탁의 선생님께 보여드리면
              <br />
              <strong className="text-rose-700">"{condition.prescriptionMedicineName}"</strong>(간식)과 조언카드를 받을 수 있습니다!
            </p>
          </div>
          <div className="w-20 h-16 border-2 border-slate-400 rounded flex flex-col items-center justify-center text-[11px] font-bold text-slate-500 bg-white">
            <span>선생님</span>
            <span>확인 도장</span>
          </div>
        </div>
      </div>
    </div>
  );
};
