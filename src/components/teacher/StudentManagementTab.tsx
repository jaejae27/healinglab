import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Student } from '../../types';
import { StorageService } from '../../services/storage';
import * as XLSX from 'xlsx';
import {
  Upload,
  ClipboardList,
  Download,
  Trash2,
  Plus,
  Minus,
  Search,
  CheckSquare,
  Square,
  AlertTriangle,
  UserCheck,
  FileSpreadsheet,
  X,
  Sparkles,
  Eye,
  Check,
  Cookie
} from 'lucide-react';

interface StudentManagementTabProps {
  students: Student[];
  selectedGrade: number;
  selectedClass: number;
  onGradeChange: (grade: number) => void;
  onClassChange: (classNum: number) => void;
  onStudentsUpdated: () => void;
  onViewStudentMissions?: (studentId: string) => void;
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  subMessage?: string;
  confirmLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
}

interface CookieModalState {
  isOpen: boolean;
  targets: Student[];
  mode: 'add' | 'subtract';
  amount: number;
  reason: string;
}

export const StudentManagementTab: React.FC<StudentManagementTabProps> = ({
  students,
  selectedGrade,
  selectedClass,
  onGradeChange,
  onClassChange,
  onStudentsUpdated,
  onViewStudentMissions
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [isAddSingleOpen, setIsAddSingleOpen] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newName, setNewName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // In-App Toast State (reliable in iframe)
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    type: 'success' | 'cookie' | 'info' | 'error';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'cookie' | 'info' | 'error' = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast((cur) => (cur?.id === toast.id ? null : cur));
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Play chime for rewards
  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext unavailable
    }
  };

  // Safe In-App Confirmation Modal (bypasses broken window.confirm in iframe)
  const [confirmModal, setConfirmModal] = useState<ConfirmDialogState | null>(null);

  // Cookie Adjustment Modal with mandatory reason
  const [cookieModal, setCookieModal] = useState<CookieModalState | null>(null);

  // Filtered Students for selected grade/class and search query
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchClass = s.grade === selectedGrade && s.classNum === selectedClass;
        const matchSearch =
          !searchQuery.trim() ||
          s.name.includes(searchQuery.trim()) ||
          String(s.number).includes(searchQuery.trim());
        return matchClass && matchSearch;
      })
      .sort((a, b) => a.number - b.number);
  }, [students, selectedGrade, selectedClass, searchQuery]);

  // Selection toggle
  const allFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedStudentIds.includes(s.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filteredStudents.map((s) => s.id));
      setSelectedStudentIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const newIds = new Set([...selectedStudentIds, ...filteredStudents.map((s) => s.id)]);
      setSelectedStudentIds(Array.from(newIds));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Delete Selected (In-App Modal)
  const handleDeleteSelected = () => {
    if (selectedStudentIds.length === 0) return;
    const count = selectedStudentIds.length;
    setConfirmModal({
      isOpen: true,
      title: '선택 학생 일괄 삭제',
      message: `선택한 ${count}명의 학생을 삭제하시겠습니까?`,
      subMessage: '삭제 시 해당 학생의 마음진료 처방전, 검사 및 쿠키 기록이 모두 안전하게 정리됩니다.',
      confirmLabel: `${count}명 일괄 삭제`,
      isDanger: true,
      onConfirm: () => {
        StorageService.deleteStudentsBatch(selectedStudentIds);
        setSelectedStudentIds([]);
        onStudentsUpdated();
        showToast(`선택한 ${count}명의 학생이 성공적으로 삭제되었습니다.`, 'success');
        setConfirmModal(null);
      }
    });
  };

  // Delete Current Class All (In-App Modal)
  const handleDeleteCurrentClass = () => {
    if (filteredStudents.length === 0) return;
    const count = filteredStudents.length;
    setConfirmModal({
      isOpen: true,
      title: '학급 학생 전체 일괄 삭제',
      message: `${selectedGrade}학년 ${selectedClass}반 학생 전체(${count}명)를 삭제하시겠습니까?`,
      subMessage: '이 작업은 취소할 수 없으며 해당 반의 모든 학생 데이터가 삭제됩니다.',
      confirmLabel: '학급 전체 삭제',
      isDanger: true,
      onConfirm: () => {
        StorageService.deleteStudentsByClass(selectedGrade, selectedClass);
        setSelectedStudentIds([]);
        onStudentsUpdated();
        showToast(`${selectedGrade}학년 ${selectedClass}반 학생 전체(${count}명)가 삭제되었습니다.`, 'success');
        setConfirmModal(null);
      }
    });
  };

  // Delete Single Student (In-App Modal)
  const handleDeleteSingle = (student: Student) => {
    setConfirmModal({
      isOpen: true,
      title: '학생 삭제',
      message: `${student.grade}학년 ${student.classNum}반 ${student.number}번 [${student.name}] 학생을 삭제하시겠습니까?`,
      subMessage: '해당 학생의 진료 처방 및 검사 데이터가 함께 정리됩니다.',
      confirmLabel: '학생 삭제',
      isDanger: true,
      onConfirm: () => {
        StorageService.deleteStudentsBatch([student.id]);
        setSelectedStudentIds((prev) => prev.filter((id) => id !== student.id));
        onStudentsUpdated();
        showToast(`[${student.name}] 학생이 명단에서 삭제되었습니다.`, 'success');
        setConfirmModal(null);
      }
    });
  };

  // Open Cookie Modal for Single Student
  const handleOpenCookieModal = (target: Student, defaultMode: 'add' | 'subtract' = 'add') => {
    setCookieModal({
      isOpen: true,
      targets: [target],
      mode: defaultMode,
      amount: 1,
      reason: defaultMode === 'add' ? '마음처방 미션 성실 실천' : '오지급 쿠키 수량 정정'
    });
  };

  // Open Cookie Modal for Selected Students (Batch)
  const handleOpenBatchCookieModal = (defaultMode: 'add' | 'subtract' = 'add') => {
    const targets = students.filter((s) => selectedStudentIds.includes(s.id));
    if (targets.length === 0) return;
    setCookieModal({
      isOpen: true,
      targets,
      mode: defaultMode,
      amount: 1,
      reason: defaultMode === 'add' ? '마음처방 미션 성실 실천' : '오지급 쿠키 수량 정정'
    });
  };

  // Execute Cookie Adjustment with Reason
  const handleExecuteCookieAdjustment = () => {
    if (!cookieModal) return;
    const { targets, mode, amount, reason } = cookieModal;
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      showToast('쿠키 지급/차감 사유를 반드시 입력해주세요.', 'error');
      return;
    }
    if (amount <= 0) {
      showToast('1개 이상의 유효한 쿠키 수량을 입력해주세요.', 'error');
      return;
    }

    const delta = mode === 'add' ? amount : -amount;

    targets.forEach((st) => {
      StorageService.addCookieLog(st.id, delta, trimmedReason);
    });

    if (mode === 'add') {
      playChimeSound();
    }

    onStudentsUpdated();
    setCookieModal(null);

    const namesStr = targets.length === 1 ? `[${targets[0].name}]` : `선택된 ${targets.length}명의`;
    const sign = mode === 'add' ? `+${amount}개 지급` : `-${amount}개 차감`;
    showToast(`🍪 ${namesStr} 학생에게 칭찬쿠키 ${sign}이 완료되었습니다. (사유: ${trimmedReason})`, 'cookie');
  };

  // Handle Single Student Add
  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newNumber, 10);
    const name = newName.trim();
    if (!num || !name) return;

    const newStudent: Student = {
      id: `s_${selectedGrade}_${selectedClass}_${num}`,
      grade: selectedGrade,
      classNum: selectedClass,
      number: num,
      name,
      cookieBalance: 5,
      createdAt: new Date().toISOString()
    };

    StorageService.addStudentsBatch([newStudent]);
    setNewNumber('');
    setNewName('');
    setIsAddSingleOpen(false);
    onStudentsUpdated();
    showToast(`[${name}] 학생이 ${selectedGrade}학년 ${selectedClass}반에 등록되었습니다.`, 'success');
  };

  // Parse Text Paste: [번호 이름]
  const parsedPasteStudents = useMemo(() => {
    if (!pasteText.trim()) return [];
    const lines = pasteText.split('\n');
    const result: { number: number; name: string }[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Matches: "1 김철수" or "1\t김철수" or "1,김철수" or "1. 김철수"
      const match = trimmed.match(/^(\d+)[\s.,\t]+([가-힣a-zA-Z\s]+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        const name = match[2].trim();
        if (num && name) {
          result.push({ number: num, name });
        }
      } else {
        // Fallback: split by space or tab
        const parts = trimmed.split(/[\t, ]+/).filter(Boolean);
        if (parts.length >= 2) {
          const num = parseInt(parts[0], 10);
          const name = parts.slice(1).join(' ');
          if (!isNaN(num) && name) {
            result.push({ number: num, name });
          }
        }
      }
    });

    return result;
  }, [pasteText]);

  const handleApplyPaste = () => {
    if (parsedPasteStudents.length === 0) return;

    const newStudents: Student[] = parsedPasteStudents.map((p) => ({
      id: `s_${selectedGrade}_${selectedClass}_${p.number}`,
      grade: selectedGrade,
      classNum: selectedClass,
      number: p.number,
      name: p.name,
      cookieBalance: 5,
      createdAt: new Date().toISOString()
    }));

    StorageService.addStudentsBatch(newStudents);
    setPasteText('');
    setIsPasteModalOpen(false);
    onStudentsUpdated();
    showToast(`🎉 ${newStudents.length}명의 학생이 ${selectedGrade}학년 ${selectedClass}반에 성공적으로 등록되었습니다!`, 'success');
  };

  // Excel Upload Parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (!rows || rows.length === 0) {
          showToast('엑셀 파일에 데이터가 없습니다.', 'error');
          return;
        }

        const newStudents: Student[] = [];
        // Detect column indices
        let colNumber = -1;
        let colName = -1;
        let colGrade = -1;
        let colClass = -1;

        let startRow = 0;
        const firstRow = rows[0].map((c) => String(c || '').trim());

        firstRow.forEach((val, idx) => {
          if (val.includes('번호') || val === 'no' || val === 'num') colNumber = idx;
          if (val.includes('이름') || val.includes('성명') || val === 'name') colName = idx;
          if (val.includes('학년') || val === 'grade') colGrade = idx;
          if (val.includes('반') || val === 'class') colClass = idx;
        });

        if (colNumber !== -1 && colName !== -1) {
          startRow = 1;
        } else {
          // If no headers, assume col 0 is number, col 1 is name
          colNumber = 0;
          colName = 1;
          startRow = 0;
        }

        for (let i = startRow; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 2) continue;

          const numVal = parseInt(String(row[colNumber] || ''), 10);
          const nameVal = String(row[colName] || '').trim();
          if (isNaN(numVal) || !nameVal) continue;

          const gradeVal = colGrade !== -1 ? parseInt(String(row[colGrade] || ''), 10) || selectedGrade : selectedGrade;
          const classVal = colClass !== -1 ? parseInt(String(row[colClass] || ''), 10) || selectedClass : selectedClass;

          newStudents.push({
            id: `s_${gradeVal}_${classVal}_${numVal}`,
            grade: gradeVal,
            classNum: classVal,
            number: numVal,
            name: nameVal,
            cookieBalance: 5,
            createdAt: new Date().toISOString()
          });
        }

        if (newStudents.length === 0) {
          showToast('엑셀에서 유효한 학생 데이터(번호, 이름)를 찾지 못했습니다.', 'error');
          return;
        }

        StorageService.addStudentsBatch(newStudents);
        onStudentsUpdated();
        setIsUploadModalOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        showToast(`🎉 엑셀에서 ${newStudents.length}명의 학생을 일괄 등록하였습니다!`, 'success');
      } catch (err) {
        console.error('Failed to parse excel:', err);
        showToast('엑셀 파일을 읽는 중 오류가 발생했습니다. 파일 형식을 확인해주세요.', 'error');
      }
    };

    reader.readAsBinaryString(file);
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const data = [
      ['번호', '이름', '비고'],
      [1, '김민준', '힐링약국 예시명단'],
      [2, '이서연', ''],
      [3, '박도윤', ''],
      [4, '정예은', ''],
      [5, '최하은', '']
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, '학생명단');
    XLSX.writeFile(wb, `힐링약국_학생명단_서식_${selectedGrade}학년${selectedClass}반.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Top Class Filter & Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Grade Selector */}
          <select
            value={selectedGrade}
            onChange={(e) => onGradeChange(Number(e.target.value))}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
          >
            {[1, 2, 3].map((g) => (
              <option key={g} value={g}>
                {g}학년
              </option>
            ))}
          </select>

          {/* Class Selector */}
          <select
            value={selectedClass}
            onChange={(e) => onClassChange(Number(e.target.value))}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
          >
            {[1, 2, 3].map((c) => (
              <option key={c} value={c}>
                {c}반
              </option>
            ))}
          </select>

          {/* Student Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름 또는 번호 검색"
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium">
            총 {filteredStudents.length}명 등록됨
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Excel Upload Button */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>엑셀/CSV 업로드</span>
          </button>

          {/* Paste Button */}
          <button
            type="button"
            onClick={() => setIsPasteModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5 text-indigo-600" />
            <span>[번호 이름] 붙여넣기</span>
          </button>

          {/* Add Single */}
          <button
            type="button"
            onClick={() => setIsAddSingleOpen(!isAddSingleOpen)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>직접 추가</span>
          </button>

          {/* Download Template */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
            title="엑셀 양식 다운로드"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>양식 받기</span>
          </button>
        </div>
      </div>

      {/* Direct Single Add Form Row */}
      {isAddSingleOpen && (
        <form
          onSubmit={handleAddSingle}
          className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3 flex items-center gap-2 text-xs"
        >
          <span className="font-bold text-indigo-900">
            {selectedGrade}학년 {selectedClass}반 신규 등록:
          </span>
          <input
            type="number"
            required
            min="1"
            max="100"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            placeholder="번호"
            className="w-16 px-2.5 py-1.5 bg-white border border-indigo-300 rounded-lg"
          />
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="학생 이름"
            className="w-32 px-2.5 py-1.5 bg-white border border-indigo-300 rounded-lg"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
          >
            추가
          </button>
          <button
            type="button"
            onClick={() => setIsAddSingleOpen(false)}
            className="px-2 py-1.5 text-slate-500 hover:text-slate-800"
          >
            취소
          </button>
        </form>
      )}

      {/* Batch Actions Bar (when selected) */}
      {selectedStudentIds.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-indigo-50 to-rose-50 border border-indigo-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <span>선택된 학생: <strong className="text-indigo-600">{selectedStudentIds.length}명</strong></span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenBatchCookieModal('add')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center gap-1 transition-all shadow-xs"
              title="선택한 학생들에게 사유를 입력하여 칭찬쿠키 일괄 지급"
            >
              <Cookie className="w-3.5 h-3.5" />
              <span>쿠키 일괄 지급 (+)</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenBatchCookieModal('subtract')}
              className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1 transition-all shadow-xs"
              title="선택한 학생들의 칭찬쿠키 일괄 차감"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>쿠키 일괄 차감 (-)</span>
            </button>
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1 transition-all shadow-xs"
              title="선택한 학생들을 명단에서 안전하게 일괄 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>선택 학생 일괄 삭제 ({selectedStudentIds.length}명)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedStudentIds([])}
              className="px-2.5 py-1.5 bg-white text-slate-600 hover:bg-slate-50 border border-slate-300 rounded-xl font-medium transition-colors"
            >
              선택 해제
            </button>
          </div>
        </div>
      )}

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-slate-500 hover:text-indigo-600"
                    title={allFilteredSelected ? '전체 해제' : '전체 선택'}
                  >
                    {allFilteredSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3 w-16">번호</th>
                <th className="py-3 px-3">이름</th>
                <th className="py-3 px-3">동의여부</th>
                <th className="py-3 px-3">사전검사</th>
                <th className="py-3 px-3">사후검사</th>
                <th className="py-3 px-3">처방 미션 실천</th>
                <th className="py-3 px-3">보유 칭찬쿠키</th>
                <th className="py-3 px-3 text-right">쿠키 지급·차감 (사유 입력)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <p className="font-jua text-sm text-slate-500 mb-1">
                      {selectedGrade}학년 {selectedClass}반에 등록된 학생이 없습니다.
                    </p>
                    <p className="text-[11px]">
                      상단의 [엑셀/CSV 업로드] 또는 [[번호 이름] 붙여넣기]로 학생 명단을 간편하게 추가해보세요.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isSelected = selectedStudentIds.includes(s.id);
                  const isPreDone = s.preTest?.completed;
                  const isPostDone = s.postTest?.completed;
                  const studentVisits = StorageService.getVisitsForStudent(s.id);
                  const latestVisit = studentVisits[0];
                  const isMissionDone = latestVisit && (latestVisit.status === 'rewarded' || latestVisit.status === 'submitted');
                  const checkInsCount = latestVisit?.dailyCheckIns?.length || 0;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectOne(s.id)}
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-700">{s.number}번</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                      <td className="py-2.5 px-3">
                        {s.privacyConsent?.agreed ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                            동의완료
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            미동의
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {isPreDone ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                            <span>✅ {s.preTest?.averageScore}점</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            대기
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {isPostDone ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1 w-max">
                            <span>🌟 {s.postTest?.averageScore}점</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            미참여
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {latestVisit ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isMissionDone ? (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1"
                                title={`${latestVisit.primaryConditionName} 실천완료 (자동 인정)`}
                              >
                                <span>✅ 5일 실천완료</span>
                              </span>
                            ) : (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1"
                                title={`${latestVisit.primaryConditionName} 실천 중`}
                              >
                                <span>🌱 {checkInsCount}/5일 실천 중</span>
                              </span>
                            )}
                            {onViewStudentMissions && (
                              <button
                                type="button"
                                onClick={() => onViewStudentMissions(s.id)}
                                className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md font-bold text-[10px] flex items-center gap-0.5 transition-colors shadow-2xs"
                                title="학생이 작성한 매일 실천 내용과 소감 상세 확인"
                              >
                                <Eye className="w-3 h-3" />
                                <span>확인</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            미발급
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                          <span>🍪</span>
                          <span>{s.cookieBalance}개</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenCookieModal(s, 'add')}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg font-bold transition-all flex items-center gap-1 shadow-2xs hover:scale-102 cursor-pointer"
                            title="사유를 입력하여 칭찬쿠키 지급"
                          >
                            <Plus className="w-3 h-3 text-amber-700" />
                            <span>지급</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenCookieModal(s, 'subtract')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-bold transition-all flex items-center gap-1 hover:scale-102 cursor-pointer"
                            title="사유를 입력하여 칭찬쿠키 차감"
                          >
                            <Minus className="w-3 h-3 text-slate-600" />
                            <span>차감</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSingle(s)}
                            className="p-1.5 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors ml-1 cursor-pointer"
                            title="학생 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Class Clean Toolbar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            {selectedGrade}학년 {selectedClass}반 총 {filteredStudents.length}명 중 {selectedStudentIds.length}명 선택됨
          </span>
          {filteredStudents.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteCurrentClass}
              className="text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>현재 반 학생 전체 삭제</span>
            </button>
          )}
        </div>
      </div>

      {/* MODAL 1: Excel / CSV Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-jua text-base text-slate-800">
                  학생명단 엑셀/CSV 일괄 업로드
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                선택된 학급:{' '}
                <strong className="text-indigo-600">
                  {selectedGrade}학년 {selectedClass}반
                </strong>
              </p>
              <p className="text-slate-500">
                엑셀 파일의 <strong>[번호, 이름]</strong> 열을 자동으로 감지하여 일괄 등록합니다. 학년과 반 열이 없으면 현재 선택된 {selectedGrade}학년 {selectedClass}반으로 등록됩니다.
              </p>
            </div>

            <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center bg-emerald-50/40 hover:bg-emerald-50 transition-colors cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
                id="excelUploadInput"
              />
              <label
                htmlFor="excelUploadInput"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-emerald-600" />
                <span className="font-jua text-sm text-emerald-900">
                  컴퓨터에서 엑셀 파일 선택하기
                </span>
                <span className="text-[11px] text-slate-400">
                  지원 형식: .xlsx, .xls, .csv
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>엑셀 샘플 서식 내려받기</span>
              </button>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: [번호 이름] Paste Modal */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border-4 border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                <h3 className="font-jua text-base text-slate-800">
                  [번호 이름] 붙여넣기 일괄 추가
                </h3>
              </div>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>
                등록 학급:{' '}
                <strong className="text-indigo-600">
                  {selectedGrade}학년 {selectedClass}반
                </strong>
              </p>
              <p className="text-slate-500">
                엑셀이나 나이스(NEIS), 한글에서 명단을 복사해 아래 상자에 그대로 붙여넣으세요.
              </p>
            </div>

            <textarea
              rows={7}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`예시:
1 김민준
2 이서연
3 박도윤
4 정예은
5 최하은`}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 leading-relaxed"
            />

            {/* Live Parse Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-500 font-bold mb-1">
                <span>자동 인식된 학생 목록:</span>
                <span className="text-indigo-600 font-bold">
                  {parsedPasteStudents.length}명 인식됨
                </span>
              </div>
              {parsedPasteStudents.length === 0 ? (
                <p className="text-slate-400 text-center py-2">
                  위 텍스트 상자에 [번호 이름] 형태로 입력하면 목록이 표시됩니다.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {parsedPasteStudents.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-medium text-slate-700 text-[11px]"
                    >
                      {p.number}번 {p.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleApplyPaste}
                disabled={parsedPasteStudents.length === 0}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-jua shadow-xs flex items-center gap-1.5 transition-colors disabled:cursor-not-allowed cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{parsedPasteStudents.length}명 일괄 등록하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: In-App Confirmation Dialog (Prevents iframe window.confirm blocking) */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-4 border-slate-100 space-y-4">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-2xl ${confirmModal.isDanger ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-jua text-base text-slate-900">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                  {confirmModal.message}
                </p>
                {confirmModal.subMessage && (
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    {confirmModal.subMessage}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-jua shadow-xs transition-all cursor-pointer ${
                  confirmModal.isDanger
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {confirmModal.confirmLabel || '확인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Cookie Adjustment with Mandatory Reason Modal */}
      {cookieModal && cookieModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-slate-100 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-2xl ${cookieModal.mode === 'add' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-700'}`}>
                  <Cookie className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-jua text-base text-slate-900">
                    칭찬쿠키 {cookieModal.mode === 'add' ? '지급 (+)' : '차감 (-)'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {cookieModal.targets.length === 1
                      ? `${cookieModal.targets[0].number}번 ${cookieModal.targets[0].name} (현재 🍪 ${cookieModal.targets[0].cookieBalance}개)`
                      : `선택된 학생 ${cookieModal.targets.length}명 일괄 적용`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCookieModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switch (Add / Subtract) */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() =>
                  setCookieModal({
                    ...cookieModal,
                    mode: 'add',
                    reason: '마음처방 미션 성실 실천'
                  })
                }
                className={`py-2 text-xs font-jua rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  cookieModal.mode === 'add'
                    ? 'bg-amber-500 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>칭찬쿠키 지급 (+)</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setCookieModal({
                    ...cookieModal,
                    mode: 'subtract',
                    reason: '오지급 쿠키 수량 정정'
                  })
                }
                className={`py-2 text-xs font-jua rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  cookieModal.mode === 'subtract'
                    ? 'bg-slate-700 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>쿠키 차감 (-)</span>
              </button>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {cookieModal.mode === 'add' ? '지급할 쿠키 수량' : '차감할 쿠키 수량'}
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCookieModal({ ...cookieModal, amount: num })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      cookieModal.amount === num
                        ? cookieModal.mode === 'add'
                          ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                          : 'bg-slate-800 text-white ring-2 ring-slate-400'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cookieModal.mode === 'add' ? `+${num}개` : `-${num}개`}
                  </button>
                ))}
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-[11px] text-slate-500">직접 입력:</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={cookieModal.amount}
                    onChange={(e) =>
                      setCookieModal({
                        ...cookieModal,
                        amount: Math.max(1, parseInt(e.target.value, 10) || 1)
                      })
                    }
                    className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-center"
                  />
                  <span className="text-xs text-slate-600">개</span>
                </div>
              </div>
            </div>

            {/* Reason Selector (Chips & Mandatory Input) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>사유 작성</span>
                  <span className="text-rose-500 font-bold">*필수</span>
                </label>
                <span className="text-[10px] text-slate-400">자주 쓰는 칭찬 사유를 클릭해보세요</span>
              </div>

              {/* Recommended Reason Chips */}
              <div className="flex flex-wrap gap-1.5">
                {cookieModal.mode === 'add' ? (
                  <>
                    {[
                      '🌟 마음처방 미션 성실 실천',
                      '🤝 친구 배려와 따뜻한 공감',
                      '📖 모범적인 수업 및 경청 태도',
                      '🧹 교실 환경 정리 솔선수범',
                      '💬 고운 말 바른 언어 사용',
                      '🎁 선생님 특별 칭찬 격려 선물'
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setCookieModal({ ...cookieModal, reason: chip })}
                        className={`text-[11px] px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          cookieModal.reason === chip
                            ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      '🔄 오지급 쿠키 수량 정정',
                      '⚠️ 기본 생활규칙 및 약속 미이행',
                      '기타 수동 조정'
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setCookieModal({ ...cookieModal, reason: chip })}
                        className={`text-[11px] px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          cookieModal.reason === chip
                            ? 'bg-slate-200 border-slate-400 text-slate-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Mandatory Reason Input */}
              <input
                type="text"
                required
                value={cookieModal.reason}
                onChange={(e) => setCookieModal({ ...cookieModal, reason: e.target.value })}
                placeholder="지급 또는 차감 사유를 구체적으로 적어주세요 (예: 5일 미션 성실 실천)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCookieModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleExecuteCookieAdjustment}
                disabled={!cookieModal.reason.trim()}
                className={`px-5 py-2 rounded-xl text-xs font-jua shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  cookieModal.mode === 'add'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-800 text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {cookieModal.mode === 'add'
                    ? `${cookieModal.amount}개 지급하기`
                    : `${cookieModal.amount}개 차감하기`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING IN-APP TOAST (Sandboxed iframe safe) */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 text-white rounded-2xl shadow-xl backdrop-blur-xs border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2 text-xs font-medium">
            {toast.type === 'cookie' ? (
              <span className="text-base">🍪</span>
            ) : toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : (
              <span className="text-emerald-400 text-sm">✨</span>
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-0.5 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
