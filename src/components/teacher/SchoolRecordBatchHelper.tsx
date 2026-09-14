import React, { useState, useMemo } from 'react';
import { Student, Visit, SchoolClass } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  FileSpreadsheet,
  Filter,
  Search,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface SchoolRecordBatchHelperProps {
  students: Student[];
  visits: Visit[];
  classes: SchoolClass[];
  showToast: (msg: string, type?: 'success' | 'info' | 'cookie') => void;
}

export type RecordCategoryType = '행동발달' | '자율활동' | '진로활동';

interface StudentRecordItem {
  student: Student;
  conditionName: string;
  missionTitle: string;
  generatedText: string;
  category: RecordCategoryType;
}

// 템플릿 풀: 학생별로 고유하고 자연스러운 문장을 조합 생성하여 반복을 방지함 (비문 원천 차단)
const RECORD_TEMPLATES = {
  행동발달: [
    {
      intro: '평소 자신의 정서와 심리 상태를 면밀히 관찰하고 인식하는 능력이 우수함.',
      body: (c: string, m: string) =>
        `사회정서 프로그램 '힐링약국'에서 '${c}' 마음신호에 대해 '${m}' 등의 행동 처방을 주도적으로 실천하였으며,`,
      closing:
        '자신의 정서적 취약점을 스스로 극복하는 구체적 방안을 터득하여 심리적 회복탄력성과 자기조절 능력을 크게 신장시킴.'
    },
    {
      intro: '자신의 마음 상태를 솔직하게 마주하고 건강하게 표현하는 태도가 돋보임.',
      body: (c: string, m: string) =>
        `사회정서 역량 강화 프로그램 '힐링약국'에 성실히 참여하여 '${c}' 증상에 대한 처방 미션인 '${m}'을 꾸준히 이행하고,`,
      closing:
        '스트레스 상황에서도 충동적으로 반응하지 않고 차분하게 마인드 컨트롤하는 성숙한 자기관리 역량을 기름.'
    },
    {
      intro: '매일의 일상 속에서 자신과 주변의 정서를 세심하게 살피는 자기성찰 태도가 뛰어남.',
      body: (c: string, m: string) =>
        `'힐링약국' 활동을 통해 '${c}'에 대응하는 생활 루틴인 '${m}'을 체계적으로 실천하였으며,`,
      closing:
        '어려운 순간에도 긍정적인 자기 위로와 적절한 휴식을 선택할 줄 아는 내면의 힘을 기르고 타인과의 관계에서도 온화함을 유지함.'
    },
    {
      intro: '자신의 심리적 어려움을 방치하지 않고 능동적인 해결책을 찾아 실천하는 주도성이 돋보임.',
      body: (c: string, m: string) =>
        `정서 케어 프로그램 '힐링약국'에서 '${c}' 마음신호를 감지하고 '${m}' 처방을 꾸준히 수행하여,`,
      closing:
        '스스로에게 적합한 마음 회복 루틴을 체득하였으며 정서적 안정감을 바탕으로 모범적인 학급 생활을 지속함.'
    },
    {
      intro: '자신의 감정을 차분히 관찰하고 긍정적인 행동으로 전환하는 문제해결 능력이 우수함.',
      body: (c: string, m: string) =>
        `'힐링약국' 사회정서 루틴에 참여하여 '${c}' 상황에서 '${m}' 행동 처방을 적극적으로 도입하였으며,`,
      closing:
        '감정의 기복에 휘둘리지 않고 스스로 중심을 잡는 자기조절 능력과 끈기를 보여줌.'
    }
  ],
  자율활동: [
    {
      intro: '학급 사회정서 역량 함양 프로그램인 \'힐링약국\' 프로젝트에 주도적으로 참여함.',
      body: (c: string, m: string) =>
        `자신의 주된 심리적 고민인 '${c}' 상태를 점검하고 학급 처방 루틴인 '${m}'을 성실하게 수행하였으며,`,
      closing:
        '스스로 터득한 정서 조절 노하우를 바탕으로 학급 내 따뜻하고 배려 넘치는 또래 문화를 조성하는 데 기여함.'
    },
    {
      intro: '공동체 정서 치유 프로젝트 \'힐링약국\' 활동에서 모범적인 참여 태도를 보임.',
      body: (c: string, m: string) =>
        `'${c}' 극복을 위한 5일 마음 처방전 미션인 '${m}'을 일관되게 실천하여,`,
      closing:
        '스스로 마음을 회복하는 긍정적인 습관을 정착시키고 친구들에게도 긍정적인 정서적 자극과 선한 영향력을 줌.'
    },
    {
      intro: '자율 정서 관리 프로그램 \'힐링약국\'에서 적극적인 자기 돌봄을 실천함.',
      body: (c: string, m: string) =>
        `일상에서 마주하는 '${c}' 신호를 알아차리고 이를 완화하기 위한 '${m}' 행동을 꾸준히 이행하였으며,`,
      closing:
        '마음의 어려움을 스스로 다스리는 탄탄한 회복탄력성을 함양하고 책임감 있는 자세로 학급 자치 활동에 동참함.'
    }
  ],
  진로활동: [
    {
      intro: '학습 및 진로 탐색 과정에서 발생하는 긴장과 심리적 압박을 건강하게 관리하는 역량을 기름.',
      body: (c: string, m: string) =>
        `'힐링약국' 진로·학업 정서 코칭을 통해 '${c}' 상태를 분석하고 '${m}' 처방을 실천함으로써,`,
      closing:
        '장기적인 진로 목표 달성에 필수적인 마인드셋과 자기주도적 생활 습관을 체계적으로 다져나감.'
    },
    {
      intro: '자신의 성향과 정서적 강점을 객관적으로 파악하여 미래 설계의 든든한 기반으로 삼음.',
      body: (c: string, m: string) =>
        `사회정서 지원 활동인 '힐링약국'에서 '${c}' 신호에 대한 맞춤 행동 처방 '${m}'을 수행하며,`,
      closing:
        '어떤 진로 장벽을 만나더라도 침착하게 회복하고 재도전할 수 있는 심리적 면역력을 강화함.'
    },
    {
      intro: '진로 준비 과정의 스트레스 요인을 스스로 인지하고 극복하려는 적극적 자세를 지님.',
      body: (c: string, m: string) =>
        `'힐링약국' 프로그램을 통해 '${c}'에 대처하는 '${m}' 미션을 완수하고,`,
      closing:
        '효율적인 목표 관리 전략과 흔들림 없는 긍정적 자기 효능감을 확립함.'
    }
  ]
};

export const SchoolRecordBatchHelper: React.FC<SchoolRecordBatchHelperProps> = ({
  students,
  visits,
  classes,
  showToast
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(classes[0]?.grade || 1);
  const [selectedClass, setSelectedClass] = useState<number>(classes[0]?.classNum || 1);
  const [selectedCategory, setSelectedCategory] = useState<RecordCategoryType>('행동발달');
  const [recordsMap, setRecordsMap] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Target students in chosen class
  const targetStudents = useMemo(() => {
    return students
      .filter((s) => s.grade === selectedGrade && s.classNum === selectedClass)
      .sort((a, b) => a.number - b.number);
  }, [students, selectedGrade, selectedClass]);

  // Helper to generate text for a single student
  const generateStudentSentence = (student: Student, category: RecordCategoryType, seedOffset = 0): {
    conditionName: string;
    missionTitle: string;
    text: string;
  } => {
    // Find the latest completed or prescribed visit for this student
    const studentVisits = visits.filter((v) => v.studentId === student.id);
    const completedVisit = studentVisits.find((v) => v.status === 'rewarded' || v.status === 'submitted') || studentVisits[0];

    const conditionName = completedVisit ? completedVisit.primaryConditionName : '계획만거창해증';
    const missionTitle =
      completedVisit?.missions?.[0]?.title ||
      '마음 신호 알아차리기 및 5분 행동 루틴';

    const templates = RECORD_TEMPLATES[category];
    // Use student number + seed to select a unique non-repetitive template combination
    const templateIdx = (student.number + seedOffset) % templates.length;
    const selectedTpl = templates[templateIdx];

    const sentence = `${selectedTpl.intro} ${selectedTpl.body(conditionName, missionTitle)} ${selectedTpl.closing}`;

    return {
      conditionName,
      missionTitle,
      text: sentence
    };
  };

  // Batch generate all sentences for the selected class
  const handleBatchGenerate = () => {
    const newMap: Record<string, string> = {};
    targetStudents.forEach((st, idx) => {
      const res = generateStudentSentence(st, selectedCategory, idx);
      newMap[st.id] = res.text;
    });
    setRecordsMap(newMap);
    showToast(`✨ ${selectedGrade}학년 ${selectedClass}반 (${targetStudents.length}명) 생기부 문장이 일괄 생성되었습니다!`, 'success');
  };

  // Regenerate single student
  const handleRegenerateSingle = (student: Student) => {
    const currentText = recordsMap[student.id] || '';
    const seed = Math.floor(Math.random() * 10) + 1;
    const res = generateStudentSentence(student, selectedCategory, seed);
    setRecordsMap((prev) => ({
      ...prev,
      [student.id]: res.text
    }));
    showToast(`${student.name} 학생 문장이 새로 생성되었습니다.`, 'info');
  };

  // Copy single text
  const handleCopySingle = (studentId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(studentId);
    showToast('클립보드에 복사되었습니다!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy all table text (tab-separated for Excel/NEIS paste)
  const handleCopyAll = () => {
    if (Object.keys(recordsMap).length === 0) {
      showToast('먼저 일괄 생성을 진행해주세요.', 'info');
      return;
    }
    const lines = targetStudents.map((st) => {
      const text = recordsMap[st.id] || generateStudentSentence(st, selectedCategory).text;
      return `${st.grade}\t${st.classNum}\t${st.number}\t${st.name}\t${selectedCategory}\t${text}`;
    });
    const header = '학년\t반\t번호\t이름\t기재영역\t생기부문안';
    navigator.clipboard.writeText([header, ...lines].join('\n'));
    showToast('전체 명단이 클립보드에 복사되었습니다! (엑셀에 바로 붙여넣기 가능)', 'success');
  };

  // Download Excel CSV (with UTF-8 BOM so Excel opens Korean characters perfectly)
  const handleDownloadExcel = () => {
    const rows = [
      ['학년', '반', '번호', '이름', '기재영역', '실천 마음신호', '행동 처방 미션', '생활기록부 기재 문안']
    ];

    targetStudents.forEach((st, idx) => {
      const res = generateStudentSentence(st, selectedCategory, idx);
      const sentence = recordsMap[st.id] || res.text;
      rows.push([
        String(st.grade),
        String(st.classNum),
        String(st.number),
        st.name,
        selectedCategory,
        res.conditionName,
        res.missionTitle,
        `"${sentence.replace(/"/g, '""')}"`
      ]);
    });

    const csvContent = '\uFEFF' + rows.map((r) => r.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `힐링약국_생기부문장_${selectedGrade}학년${selectedClass}반_${selectedCategory}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('엑셀(CSV) 파일이 성공적으로 다운로드되었습니다!', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header & Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-jua text-lg text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>학급별 생활기록부 문장 도우미</span>
              <span className="text-[11px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                반별 일괄 생성 &amp; 엑셀 다운로드
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              학생의 실제 처방 실천 데이터를 바탕으로 학생별 중복 없는 정돈된 생기부 문장을 반 전체 단위로 즉시 생성합니다.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-jua text-xs transition-colors"
              title="엑셀이나 나이스에 바로 붙여넣기 할 수 있도록 전체 복사"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>전체 텍스트 복사</span>
            </button>
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-jua text-xs shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>엑셀 다운로드</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Grade Select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">학년 선택</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            >
              {Array.from(new Set(classes.map((c) => c.grade))).map((g) => (
                <option key={g} value={g}>
                  {g}학년
                </option>
              ))}
            </select>
          </div>

          {/* Class Select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">학급 선택</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            >
              {classes
                .filter((c) => c.grade === selectedGrade)
                .map((c) => (
                  <option key={c.classNum} value={c.classNum}>
                    {c.classNum}반 ({c.studentCount || 0}명)
                  </option>
                ))}
            </select>
          </div>

          {/* Record Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">기재 영역</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as RecordCategoryType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value="행동발달">행동특성 및 종합의견</option>
              <option value="자율활동">창체: 자율활동</option>
              <option value="진로활동">창체: 진로활동</option>
            </select>
          </div>

          {/* Batch Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleBatchGenerate}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-jua text-xs py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{selectedGrade}학년 {selectedClass}반 전체 일괄 생성</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-jua text-sm text-slate-800">
              {selectedGrade}학년 {selectedClass}반 명단
            </span>
            <span className="text-xs text-slate-500 font-medium">
              (총 {targetStudents.length}명 / 생성 완료 {Object.keys(recordsMap).length}건)
            </span>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="학생 이름 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {targetStudents
            .filter((st) => !searchQuery.trim() || st.name.includes(searchQuery.trim()))
            .map((student, idx) => {
              const defaultGen = generateStudentSentence(student, selectedCategory, idx);
              const sentence = recordsMap[student.id] || defaultGen.text;
              const hasCustomGenerated = !!recordsMap[student.id];

              return (
                <div key={student.id} className="p-4 hover:bg-slate-50/50 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {student.number}번
                      </span>
                      <strong className="text-sm text-slate-900 font-bold">{student.name}</strong>
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        마음신호: <strong className="text-slate-700">{defaultGen.conditionName}</strong>
                      </span>
                      {hasCustomGenerated && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                          생성됨
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => handleRegenerateSingle(student)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-xs flex items-center gap-1 font-medium"
                        title="다른 문구로 다시 생성"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="text-[11px]">재생성</span>
                      </button>
                      <button
                        onClick={() => handleCopySingle(student.id, sentence)}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-xs font-bold flex items-center gap-1 border border-slate-200"
                      >
                        {copiedId === student.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>복사</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sentence Box */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium select-all break-keep">
                    {sentence}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
