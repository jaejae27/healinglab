import React, { useMemo } from 'react';
import { StorageService } from '../../services/storage';
import { VirtualCondition } from '../../types';
import { Printer, ArrowLeft } from 'lucide-react';

interface WorkbookPrintViewProps {
  conditionId?: string;
  conditionIds?: string[];
  onBack: () => void;
}

export const WorkbookPrintView: React.FC<WorkbookPrintViewProps> = ({
  conditionId,
  conditionIds,
  onBack
}) => {
  const conditions: VirtualCondition[] = useMemo(() => {
    if (conditionIds && conditionIds.length > 0) {
      return conditionIds
        .map((id) => StorageService.getConditionById(id))
        .filter((c): c is VirtualCondition => !!c);
    }
    if (conditionId) {
      const c = StorageService.getConditionById(conditionId);
      return c ? [c] : [];
    }
    // Fallback: all conditions
    return StorageService.getConditions();
  }, [conditionId, conditionIds]);

  if (conditions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center justify-center text-center">
        <p className="text-sm text-slate-600 font-bold mb-3">인쇄할 증상 워크북을 찾을 수 없습니다.</p>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-white border border-slate-300 px-4 py-2 rounded-xl text-xs font-jua text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>돌아가기</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 print:p-0 print:bg-white flex flex-col items-center">
      {/* Non-print toolbar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 print:hidden sticky top-3 z-30 bg-white/95 backdrop-blur-xs p-3 rounded-2xl border border-slate-200 shadow-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>인쇄실로 돌아가기</span>
        </button>

        <div className="text-center">
          <span className="text-xs font-jua text-slate-800 block">
            {conditions.length === 1
              ? `[${conditions[0].conditionId}] ${conditions[0].name}`
              : `선택된 워크북 총 ${conditions.length}종`}
          </span>
          <span className="text-[10px] text-slate-400">
            A4 1장에 1종씩 자동 분할 인쇄됩니다
          </span>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-jua shadow-md shadow-rose-200 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{conditions.length === 1 ? '인쇄하기' : `전체 인쇄 (${conditions.length}장)`}</span>
        </button>
      </div>

      {/* Printable Sheet Container(s) */}
      <div className="w-full flex flex-col items-center space-y-8 print:space-y-0">
        {conditions.map((condition) => (
          <div
            key={condition.conditionId}
            style={{ breakAfter: 'page', pageBreakAfter: 'always' }}
            className="w-full max-w-2xl bg-white border-2 border-slate-300 print:border-none p-8 rounded-2xl print:p-4 text-slate-900 shadow-lg print:shadow-none print:w-full print:m-0"
          >
            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-3 mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-white font-mono font-bold text-xs px-2 py-0.5 rounded">
                    HEALING PHARMACY WORKBOOK
                  </span>
                  <span className="font-bold text-xs text-slate-600">사회정서 마음 처방전</span>
                </div>
                <h1 className="font-jua text-2xl mt-1 tracking-tight">
                  [{condition.conditionId}] {condition.name}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5 italic">"{condition.summary}"</p>
              </div>

              {/* Student Info Stamp Box */}
              <div className="border border-slate-400 text-xs rounded divide-y divide-slate-300 text-center w-48 shrink-0">
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
                    <span className="w-4 h-4 border border-slate-400 rounded inline-block shrink-0" />
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
                  <div className="h-9 border-b border-dashed border-slate-300 mt-1" />
                </div>
                <div>
                  <span className="font-bold">새롭게 알게 된 내 마음이나 느낀 점:</span>
                  <div className="h-9 border-b border-dashed border-slate-300 mt-1" />
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
              <div className="w-20 h-16 border-2 border-slate-400 rounded flex flex-col items-center justify-center text-[11px] font-bold text-slate-500 bg-white shrink-0">
                <span>선생님</span>
                <span>확인 도장</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
