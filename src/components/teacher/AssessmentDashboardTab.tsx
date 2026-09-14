import React, { useState, useMemo } from 'react';
import { Student } from '../../types';
import { StorageService } from '../../services/storage';
import { ASSESSMENT_DOMAINS, KPI_QUESTION } from '../../data/assessmentQuestions';
import * as XLSX from 'xlsx';
import {
  BarChart3,
  BellRing,
  Download,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
  Award,
  Users,
  Eye,
  X,
  HeartHandshake,
  PenLine
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
  const [viewingStudentAnswers, setViewingStudentAnswers] = useState<Student | null>(null);

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

  // Overall score stats
  const stats = useMemo(() => {
    let preTotal = 0;
    let postTotal = 0;
    let preCount = 0;
    let postCount = 0;

    // KPI stats
    let kpiPreTotal = 0;
    let kpiPreCount = 0;
    let kpiPostTotal = 0;
    let kpiPostCount = 0;

    targetStudents.forEach((s) => {
      if (s.preTest?.completed) {
        preTotal += s.preTest.averageScore;
        preCount += 1;
        if (s.preTest.kpiScore) {
          kpiPreTotal += s.preTest.kpiScore;
          kpiPreCount += 1;
        }
      }
      if (s.postTest?.completed) {
        postTotal += s.postTest.averageScore;
        postCount += 1;
        if (s.postTest.kpiScore) {
          kpiPostTotal += s.postTest.kpiScore;
          kpiPostCount += 1;
        }
      }
    });

    const preAvg = preCount > 0 ? Number((preTotal / preCount).toFixed(2)) : 0;
    const postAvg = postCount > 0 ? Number((postTotal / postCount).toFixed(2)) : 0;
    const diff = Number((postAvg - preAvg).toFixed(2));

    const kpiPreAvg = kpiPreCount > 0 ? Number((kpiPreTotal / kpiPreCount).toFixed(2)) : 0;
    const kpiPostAvg = kpiPostCount > 0 ? Number((kpiPostTotal / kpiPostCount).toFixed(2)) : 0;
    const kpiDiff = Number((kpiPostAvg - kpiPreAvg).toFixed(2));

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
        subName: info.subName,
        icon: info.icon,
        color: info.color,
        pre: dPreAvg,
        post: dPostAvg,
        delta: dDelta
      };
    });

    return { preAvg, postAvg, diff, kpiPreAvg, kpiPostAvg, kpiDiff, domainStats };
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

  // Export to Excel with complete 5 domains + KPI + qualitative questions
  const handleExportExcel = () => {
    const rows = [
      [
        '학년',
        '반',
        '번호',
        '이름',
        '개인정보동의',
        '사전검사완료',
        '사전평균(5점만점)',
        '사전총점(100점환산)',
        '사전_마음처방자신감(KPI)',
        '사후검사완료',
        '사후평균(5점만점)',
        '사후총점(100점환산)',
        '사후_마음처방자신감(KPI)',
        '성장점수(Δ)',
        '사후_프로그램효과평균',
        '감정알아차리기(사전)',
        '감정알아차리기(사후)',
        '감정다루기(사전)',
        '감정다루기(사후)',
        '나를돌보기(사전)',
        '나를돌보기(사후)',
        '도움요청하기(사전)',
        '도움요청하기(사후)',
        '타인이해행동(사전)',
        '타인이해행동(사후)',
        'Q21_자주느끼는감정(사전)',
        'Q22_스트레스대처(사전)',
        'Q21_자주느끼는감정(사후)',
        'Q22_스트레스대처(사후)',
        'Q28_마음대하는법변화(성장스토리)',
        'Q29_계속사용할마음처방',
        'Q30_친구위한행동변화'
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
        s.preTest?.totalScore ?? '',
        s.preTest?.kpiScore ?? '',
        s.postTest?.completed ? '완료' : '미완료',
        s.postTest?.averageScore ?? '',
        s.postTest?.totalScore ?? '',
        s.postTest?.kpiScore ?? '',
        s.preTest?.completed && s.postTest?.completed
          ? Number((s.postTest.averageScore - s.preTest.averageScore).toFixed(2))
          : '',
        s.postTest?.programEffectAverage ?? '',
        s.preTest?.domainScores?.self_awareness ?? '',
        s.postTest?.domainScores?.self_awareness ?? '',
        s.preTest?.domainScores?.self_regulation ?? '',
        s.postTest?.domainScores?.self_regulation ?? '',
        s.preTest?.domainScores?.self_care ?? '',
        s.postTest?.domainScores?.self_care ?? '',
        s.preTest?.domainScores?.help_seeking ?? '',
        s.postTest?.domainScores?.help_seeking ?? '',
        s.preTest?.domainScores?.empathy_action ?? '',
        s.postTest?.domainScores?.empathy_action ?? '',
        s.preTest?.descriptiveAnswers?.q21_feelings ?? '',
        s.preTest?.descriptiveAnswers?.q22_stressCoping ?? '',
        s.postTest?.descriptiveAnswers?.q21_feelings ?? '',
        s.postTest?.descriptiveAnswers?.q22_stressCoping ?? '',
        s.postTest?.descriptiveAnswers?.q28_mindChanged ?? '',
        s.postTest?.descriptiveAnswers?.q29_favoritePrescription ?? '',
        s.postTest?.descriptiveAnswers?.q30_friendAction ?? ''
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, '사회정서_사전사후평가통계');
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
            <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
              공모전 보고서용 지표 연동
            </span>
          </div>
          <p className="text-xs text-slate-500">
            힐링약국 마음신호 및 5일 행동처방 루틴이 학생들의 자기조절과 회복탄력성에 미친 긍정적 변화를 정량·서술형으로 분석합니다.
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
            <span>통계 엑셀 다운로드 (서술형 포함)</span>
          </button>
        </div>
      </div>

      {/* Scope Filter Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs gap-2">
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

      {/* 4 Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
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

        {/* KPI Score Growth Delta (마음 처방 자신감) */}
        <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl border border-amber-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-900 font-bold mb-1">
            <span>마음처방 자신감(KPI) 성장</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-jua text-2xl text-amber-900">
              {stats.kpiDiff >= 0 ? `+${stats.kpiDiff}` : stats.kpiDiff}점
            </span>
            <span className="text-xs font-bold text-amber-700">
              ({stats.kpiPreAvg}점 ➔ {stats.kpiPostAvg}점)
            </span>
          </div>
          <p className="text-[11px] text-amber-800 mt-1">
            {KPI_QUESTION.statement}
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
            사전 (연한 막대) vs 사후 (진한 막대)
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
                    <span className="text-[10px] text-slate-400 font-normal">({dom.subName})</span>
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
                <th className="py-2.5 px-3">마음처방 자신감</th>
                <th className="py-2.5 px-3">서술형 답변</th>
                <th className="py-2.5 px-3">맞춤 지도 권고사항</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {targetStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400">
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

                  const hasDescriptive =
                    s.preTest?.descriptiveAnswers?.q21_feelings ||
                    s.postTest?.descriptiveAnswers?.q28_mindChanged;

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
                      <td className="py-2.5 px-3 font-mono">
                        {s.postTest?.kpiScore ? (
                          <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                            {s.postTest.kpiScore}점
                          </span>
                        ) : s.preTest?.kpiScore ? (
                          <span className="text-slate-500">{s.preTest.kpiScore}점</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {hasDescriptive ? (
                          <button
                            onClick={() => setViewingStudentAnswers(s)}
                            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md"
                          >
                            <Eye className="w-3 h-3" />
                            <span>답변 확인</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[11px]">미작성</span>
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

      {/* Student Descriptive Answers Modal */}
      {viewingStudentAnswers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-jua text-base text-slate-800">
                  {viewingStudentAnswers.grade}학년 {viewingStudentAnswers.classNum}반 {viewingStudentAnswers.number}번 {viewingStudentAnswers.name} 서술형 성찰 답변
                </h3>
                <span className="text-xs text-slate-400">사전 및 사후 자기성찰 기록</span>
              </div>
              <button
                onClick={() => setViewingStudentAnswers(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Pre Test Answers */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <span className="font-jua text-amber-900 block">🧭 사전 검사 서술 답변</span>
                <div>
                  <strong className="text-slate-700 block">21. 자주 느끼는 감정:</strong>
                  <p className="text-slate-600 mt-0.5 bg-white p-2 rounded-lg border border-amber-100">
                    {viewingStudentAnswers.preTest?.descriptiveAnswers?.q21_feelings || '작성된 내용이 없습니다.'}
                  </p>
                </div>
                <div>
                  <strong className="text-slate-700 block">22. 스트레스 대처법:</strong>
                  <p className="text-slate-600 mt-0.5 bg-white p-2 rounded-lg border border-amber-100">
                    {viewingStudentAnswers.preTest?.descriptiveAnswers?.q22_stressCoping || '작성된 내용이 없습니다.'}
                  </p>
                </div>
              </div>

              {/* Post Test Answers */}
              {viewingStudentAnswers.postTest?.completed && (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
                  <span className="font-jua text-indigo-900 block">🌟 사후 검사 성장 서술 답변</span>
                  <div>
                    <strong className="text-slate-700 block">28. 마음을 대하는 법의 변화:</strong>
                    <p className="text-slate-600 mt-0.5 bg-white p-2 rounded-lg border border-indigo-100">
                      {viewingStudentAnswers.postTest?.descriptiveAnswers?.q28_mindChanged || '작성된 내용이 없습니다.'}
                    </p>
                  </div>
                  <div>
                    <strong className="text-slate-700 block">29. 계속 사용하고 싶은 나만의 마음 처방:</strong>
                    <p className="text-slate-600 mt-0.5 bg-white p-2 rounded-lg border border-indigo-100">
                      {viewingStudentAnswers.postTest?.descriptiveAnswers?.q29_favoritePrescription || '작성된 내용이 없습니다.'}
                    </p>
                  </div>
                  <div>
                    <strong className="text-slate-700 block">30. 친구를 대하는 나의 행동 변화:</strong>
                    <p className="text-slate-600 mt-0.5 bg-white p-2 rounded-lg border border-indigo-100">
                      {viewingStudentAnswers.postTest?.descriptiveAnswers?.q30_friendAction || '작성된 내용이 없습니다.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setViewingStudentAnswers(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 font-jua text-slate-700 rounded-xl"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
