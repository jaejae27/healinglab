import React, { useMemo } from 'react';
import { Student } from '../../types';
import { StorageService } from '../../services/storage';
import { Printer, ArrowLeft, Award, Sparkles, Heart } from 'lucide-react';

interface PortfolioPrintViewProps {
  student: Student;
  onBack: () => void;
}

export const PortfolioPrintView: React.FC<PortfolioPrintViewProps> = ({ student, onBack }) => {
  const visits = useMemo(() => StorageService.getVisitsForStudent(student.id), [student.id]);
  const fortunes = useMemo(() => StorageService.getSavedFortunes(student.id), [student.id]);

  const completedVisits = visits.filter((v) => v.status === 'rewarded' || v.status === 'submitted');

  return (
    <div className="min-h-screen bg-slate-100 p-4 print:p-0 print:bg-white flex flex-col items-center">
      {/* Non-print toolbar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>마이페이지로 돌아가기</span>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-jua shadow-md shadow-rose-200"
        >
          <Printer className="w-4 h-4" />
          <span>포트폴리오 인쇄 / PDF 저장</span>
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="w-full max-w-2xl bg-white border-2 border-slate-300 print:border-none p-8 rounded-2xl print:p-4 text-slate-900 shadow-lg print:shadow-none">
        {/* Header */}
        <div className="border-b-2 border-rose-400 pb-4 mb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-500 text-white font-jua text-xs px-2 py-0.5 rounded">
                힐링약국 사회정서 포트폴리오
              </span>
              <span className="text-xs text-slate-500">나만의 마음 처방 성장 기록</span>
            </div>
            <h1 className="font-jua text-2xl text-slate-900 mt-1">
              {student.name}의 마음 돌봄 성장 일지
            </h1>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-bold text-slate-800">
              {student.grade}학년 {student.classNum}반 {student.number}번
            </p>
            <p className="text-[11px] text-slate-400">발급일: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5 text-center text-xs">
          <div className="border border-slate-200 bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-500 block">총 처방 완료 횟수</span>
            <span className="font-jua text-lg text-rose-600">{completedVisits.length}회</span>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-500 block">적립 칭찬쿠키</span>
            <span className="font-jua text-lg text-amber-600">{student.cookieBalance}개</span>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-500 block">수집한 인생 문장</span>
            <span className="font-jua text-lg text-purple-600">{fortunes.length}개</span>
          </div>
        </div>

        {/* Section 1: Effective Prescriptions */}
        <div className="mb-5">
          <h2 className="font-jua text-sm text-slate-800 border-l-4 border-rose-500 pl-2 mb-2.5">
            🌱 내가 직접 검증한 나만의 효과적인 행동 처방들
          </h2>
          <div className="space-y-2.5 text-xs">
            {completedVisits.length === 0 ? (
              <p className="text-slate-400 italic p-3 border border-dashed rounded text-center">
                아직 완료된 처방 기록이 없습니다.
              </p>
            ) : (
              completedVisits.map((v) => (
                <div key={v.visitId} className="border border-slate-200 p-3 rounded-xl bg-rose-50/20">
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="text-rose-800">
                      [{v.primaryConditionId}] {v.primaryConditionName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {v.reflectionWhy && (
                    <p className="text-slate-700 leading-relaxed font-medium">
                      <strong className="text-slate-900">도움된 이유:</strong> "{v.reflectionWhy}"
                    </p>
                  )}
                  {v.reflectionLearned && (
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      <strong className="text-slate-900">알게 된 점:</strong> "{v.reflectionLearned}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 2: Saved Fortunes */}
        {fortunes.length > 0 && (
          <div className="mb-5">
            <h2 className="font-jua text-sm text-slate-800 border-l-4 border-amber-500 pl-2 mb-2.5">
              ⭐ 나를 단단하게 지켜준 따뜻한 문장들
            </h2>
            <div className="space-y-1.5 text-xs">
              {fortunes.map((f) => (
                <div key={f.id} className="border border-amber-200 bg-amber-50/40 p-2.5 rounded-lg">
                  <span className="font-bold text-amber-800 mr-2">[{f.fortuneId}]</span>
                  <span className="text-slate-800">"{f.message}"</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teacher Encouragement Stamp Area */}
        <div className="mt-8 pt-4 border-t-2 border-slate-300 flex items-center justify-between text-xs">
          <div className="text-slate-600">
            <p className="font-jua text-sm text-slate-800">선생님 응원 한마디</p>
            <p className="text-[11px] mt-0.5">
              자신의 감정을 알아차리고 스스로 돌보는 능력이 훌륭하게 자라나고 있습니다.
            </p>
          </div>
          <div className="w-24 h-14 border border-slate-400 rounded flex flex-col items-center justify-center text-[10px] text-slate-400">
            담임교사 서명
          </div>
        </div>
      </div>
    </div>
  );
};
