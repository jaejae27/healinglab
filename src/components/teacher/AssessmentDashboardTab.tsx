import React, { useState, useMemo } from 'react';
import { Student } from '../../types';
import { StorageService } from '../../services/storage';
import { ASSESSMENT_DOMAINS } from '../../data/assessmentQuestions';
import * as XLSX from 'xlsx';
import {
  BarChart3,
  BellRing,
  Download,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Users
} from 'lucide-react';

interface AssessmentDashboardTabProps {
  students: Student[];
  selectedGrade: number;
  selectedClass: number;
  onStudentsUpdated: () => void;
}

export const AssessmentDashboardTab: React.FC<AssessmentDashboardTabProps> = ({
  students,
  selectedGrade,
  selectedClass,
  onStudentsUpdated
}) => {
  const [filterClassOnly, setFilterClassOnly] = useState(true);

  const settings = StorageService.getSettings();
  const isPostTestActive = !!settings.postTestActive;

  // Filter students based on class toggle
  const targetStudents = useMemo(() => {
    if (filterClassOnly) {
      return students.filter((s) => s.grade === selectedGrade && s.classNum === selectedClass);
    }
    return students;
  }, [students, selectedGrade, selectedClass, filterClassOnly]);

  // Participation counts
  const totalCount = targetStudents.length;
  const preDoneCount = targetStudents.filter((s) => s.preTest?.completed).length;
  const postDoneCount = targetStudents.filter((s) => s.postTest?.completed).length;
  const bothDoneStudents = targetStudents.filter((s) => s.preTest?.completed && s.postTest?.completed);

  // Overall score stats
  const stats = useMemo(() => {
    let preTotal = 0;
    let postTotal = 0;
    let preCount = 0;
    let postCount = 0;

    targetStudents.forEach((s) => {
      if (s.preTest?.completed) {
        preTotal += s.preTest.averageScore;
        preCount += 1;
      }
      if (s.postTest?.completed) {
        postTotal += s.postTest.averageScore;
        postCount += 1;
      }
    });

    const preAvg = preCount > 0 ? Number((preTotal / preCount).toFixed(2)) : 0;
    const postAvg = postCount > 0 ? Number((postTotal / postCount).toFixed(2)) : 0;
    const diff = Number((postAvg - preAvg).toFixed(2));

    // Domain averages
    const domainKeys = Object.keys(ASSESSMENT_DOMAINS) as Array<keyof typeof ASSESSMENT_DOMAINS>;
    const domainStats = domainKeys.map((key) => {
      const info = ASSESSMENT_DOMAINS[key];
      let dPreSum = 0;
      let dPreC = 0;
      let dPostSum = 0;
      let dPostC = 0;

      targetStudents.forEach((s) => {
        if (s.preTest?.domainScores?.[key]) {
          dPreSum += s.preTest.domainScores[key];
          dPreC += 1;
        }
        if (s.postTest?.domainScores?.[key]) {
          dPostSum += s.postTest.domainScores[key];
          dPostC += 1;
        }
      });

      const dPreAvg = dPreC > 0 ? Number((dPreSum / dPreC).toFixed(2)) : 0;
      const dPostAvg = dPostC > 0 ? Number((dPostSum / dPostC).toFixed(2)) : 0;
      const dDelta = Number((dPostAvg - dPreAvg).toFixed(2));

      return {
        key,
        name: info.name,
        icon: info.icon,
        color: info.color,
        pre: dPreAvg,
        post: dPostAvg,
        delta: dDelta
      };
    });

    return { preAvg, postAvg, diff, domainStats };
  }, [targetStudents]);

  // Toggle Post Test Status
  const handleTogglePostTest = () => {
    const nextState = !isPostTestActive;
    StorageService.setPostTestActive(nextState);
    onStudentsUpdated();
    alert(
      nextState
        ? '📢 사후 검사가 활성화되었습니다! 학생들이 로그인하거나 홈 화면에 접속하면 사후검사 배너와 알림이 표시됩니다.'
        : '사후 검사가 마감되었습니다.'
    );
  };

  // Export to Excel
  const handleExportExcel = () => {
    const rows = [
      [
        '학년',
        '반',
        '번호',
        '이름',
        '개인정보동의',
        '사전검사완료',
        '사전평균점수(5점만점)',
        '사후검사완료',
        '사후평균점수(5점만점)',
        '성장점수(Δ)',
        '자기인식(사전)',
        '자기인식(사후)',
        '자기관리(사전)',
        '자기관리(사후)',
        '사회적인식(사전)',
        '사회적인식(사후)',
        '대인관계(사전)',
        '대인관계(사후)',
        '의사결정(사전)',
        '의사결정(사후)'
      ]
    ];

    targetStudents.forEach((s) => {
      rows.push([
        s.grade,
        s.classNum,
        s.number,
        s.name,
        s.privacyConsent?.agreed ? '동의' : '미동의',
        s.preTest?.completed ? '완료' : '미완료',
        s.preTest?.averageScore ?? '',
        s.postTest?.completed ? '완료' : '미완료',
        s.postTest?.averageScore ?? '',
        s.preTest?.completed && s.postTest?.completed
          ? Number((s.postTest.averageScore - s.preTest.averageScore).toFixed(2))
          : '',
        s.preTest?.domainScores?.self_awareness ?? '',
        s.postTest?.domainScores?.self_awareness ?? '',
        s.preTest?.domainScores?.self_management ?? '',
        s.postTest?.domainScores?.self_management ?? '',
        s.preTest?.domainScores?.social_awareness ?? '',
        s.postTest?.domainScores?.social_awareness ?? '',
        s.preTest?.domainScores?.relationship_skills ?? '',
        s.postTest?.domainScores?.relationship_skills ?? '',
        s.preTest?.domainScores?.responsible_decision ?? '',
        s.postTest?.domainScores?.responsible_decision ?? ''
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, '사회정서_사전사후평가');
    const filename = `힐링약국_사회정서_사전사후평가통계_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Post-Test Dispatch Control */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="font-jua text-base text-slate-900">
              사회정서역량(SEL) 사전·사후 검사 및 효과성 통계
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            힐링약국 마음신호 및 행동처방 활동이 학생들의 자기조절과 회복탄력성에 미친 긍정적 변화를 자체 분석합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Post-test activation toggle */}
          <button
            type="button"
            onClick={handleTogglePostTest}
            className={`px-4 py-2.5 rounded-xl text-xs font-jua flex items-center gap-2 transition-all shadow-xs ${
              isPostTestActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>
              {isPostTestActive ? '📢 사후 검사 마감하기' : '🚀 학생 사후 검사 일괄 실시'}
            </span>
          </button>

          {/* Export to Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>통계 엑셀 다운로드</span>
          </button>
        </div>
      </div>

      {/* Scope Filter Pill */}
      <div className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700">통계 대상 범위:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              checked={filterClassOnly}
              onChange={() => setFilterClassOnly(true)}
              className="text-indigo-600 focus:ring-indigo-400"
            />
            <span className="font-medium">
              현재 학급 ({selectedGrade}학년 {selectedClass}반 - {totalCount}명)
            </span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              checked={!filterClassOnly}
              onChange={() => setFilterClassOnly(false)}
              className="text-indigo-600 focus:ring-indigo-400"
            />
            <span className="font-medium">전체 등록 학생 ({students.length}명)</span>
          </label>
        </div>

        {isPostTestActive ? (
          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            ● 현재 학생 화면에 사후검사 진행 중
          </span>
        ) : (
          <span className="text-[11px] font-medium text-slate-400">
            ○ 사후검사 대기 상태
          </span>
        )}
      </div>

      {/* 3 Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Pre-Test Participation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>사전 검사 완료율</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-jua text-2xl text-slate-900">
              {totalCount > 0 ? Math.round((preDoneCount / totalCount) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-400">
              ({preDoneCount} / {totalCount}명)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            첫 로그인 시 5대 영역 기본 역량 측정
          </p>
        </div>

        {/* Post-Test Participation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>사후 검사 완료율</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-jua text-2xl text-slate-900">
              {totalCount > 0 ? Math.round((postDoneCount / totalCount) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-400">
              ({postDoneCount} / {totalCount}명)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            처방 실천 후 긍정 성장도 확인
          </p>
        </div>

        {/* Score Growth Delta */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-indigo-800 font-bold mb-1">
            <span>사회정서역량 평균 성장폭</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-jua text-2xl text-indigo-900">
              {stats.diff >= 0 ? `+${stats.diff}` : stats.diff}점
            </span>
            <span className="text-xs font-bold text-indigo-600">
              ({stats.preAvg}점 ➔ {stats.postAvg}점)
            </span>
          </div>
          <p className="text-[11px] text-indigo-700 mt-1">
            5점 척도 기준 전후 평가 성장 결과
          </p>
        </div>
      </div>

      {/* 5 SEL Domains Growth Comparison Bars */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-jua text-sm text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>사회정서 5대 역량별 전후 변화 비교 (5점 척도)</span>
          </h3>
          <span className="text-xs text-slate-400">
            사전 (연한색) vs 사후 (진한색)
          </span>
        </div>

        <div className="space-y-3.5">
          {stats.domainStats.map((dom) => {
            const prePercent = Math.min(100, (dom.pre / 5) * 100);
            const postPercent = Math.min(100, (dom.post / 5) * 100);

            return (
              <div key={dom.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span>{dom.icon}</span>
                    <span>{dom.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-mono">사전: {dom.pre}점</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-indigo-900 font-bold font-mono">사후: {dom.post}점</span>
                    {dom.delta !== 0 && (
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${
                          dom.delta > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {dom.delta > 0 ? `+${dom.delta}` : dom.delta}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Visual Track */}
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex gap-1 relative">
                  {/* Pre Bar */}
                  <div
                    className="h-full rounded-full opacity-40 transition-all duration-500"
                    style={{
                      width: `${prePercent}%`,
                      backgroundColor: dom.color
                    }}
                  />
                  {/* Post Bar overlay representation */}
                  <div
                    className="h-full rounded-full absolute top-0 left-0 transition-all duration-500"
                    style={{
                      width: `${postPercent}%`,
                      backgroundColor: dom.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Student Evaluation & Guidance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-jua text-sm text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>학생별 사전·사후 검사 결과 및 교육적 지도 소견</span>
          </h3>
          <span className="text-xs text-slate-500">
            총 {targetStudents.length}명
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">학급</th>
                <th className="py-2.5 px-3">번호</th>
                <th className="py-2.5 px-3">이름</th>
                <th className="py-2.5 px-3">사전 점수</th>
                <th className="py-2.5 px-3">사후 점수</th>
                <th className="py-2.5 px-3">변화폭(Δ)</th>
                <th className="py-2.5 px-3">맞춤 지도 권고사항</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {targetStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    등록된 학생이 없습니다.
                  </td>
                </tr>
              ) : (
                targetStudents.map((s) => {
                  const pre = s.preTest?.averageScore;
                  const post = s.postTest?.averageScore;
                  const delta =
                    pre !== undefined && post !== undefined
                      ? Number((post - pre).toFixed(2))
                      : null;

                  // Pedagogical guidance suggestion
                  let guidanceTag = '관찰 진행 중';
                  let guidanceColor = 'bg-slate-100 text-slate-600';

                  if (delta !== null) {
                    if (delta >= 1.0) {
                      guidanceTag = '🌟 행동처방 실천으로 역량 대폭 신장 (모범)';
                      guidanceColor = 'bg-emerald-100 text-emerald-800';
                    } else if (delta > 0) {
                      guidanceTag = '📈 자기조절 및 정서인식 호전';
                      guidanceColor = 'bg-teal-100 text-teal-800';
                    } else if (delta === 0) {
                      guidanceTag = '⚖️ 정서 상태 안정 유지';
                      guidanceColor = 'bg-blue-100 text-blue-800';
                    } else {
                      guidanceTag = '🌱 지속적 관심 및 일상 대화 지도 권장';
                      guidanceColor = 'bg-rose-100 text-rose-800';
                    }
                  } else if (pre !== undefined && post === undefined) {
                    guidanceTag = '⏳ 사후검사 응시 독려 요망';
                    guidanceColor = 'bg-amber-100 text-amber-800';
                  }

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-slate-500">
                        {s.grade}학년 {s.classNum}반
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-700">{s.number}번</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                      <td className="py-2.5 px-3 font-mono">
                        {pre !== undefined ? `${pre}점` : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                        {post !== undefined ? `${post}점` : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        {delta !== null ? (
                          <span
                            className={
                              delta > 0
                                ? 'text-emerald-600'
                                : delta < 0
                                ? 'text-rose-600'
                                : 'text-slate-500'
                            }
                          >
                            {delta > 0 ? `+${delta}` : delta}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${guidanceColor}`}
                        >
                          {guidanceTag}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
