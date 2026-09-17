import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Student } from '../../types';
import { StorageService } from '../../services/storage';
import { checkIsTestStudent } from '../../utils/koreanName';
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
  Cookie,
  KeyRound,
  Lock,
  FlaskConical,
  RotateCcw,
  ShieldCheck,
  Eraser,
  RefreshCw
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
  mode: 'add' | 'subtract' | 'reset';
  amount: number;
  reason: string;
  clearCumulative?: boolean;
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
  const [isTestStudentFlag, setIsTestStudentFlag] = useState(false);

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

  // Dedicated Granular Reset Modal (Content Only vs. Full Reset with Roster)
  const [resetModalMode, setResetModalMode] = useState<'content_only' | 'full_reset' | null>(null);
  const [isResetExecuting, setIsResetExecuting] = useState<boolean>(false);
  const [resetConfirmInput, setResetConfirmInput] = useState<string>('');

  // Cookie Adjustment Modal with mandatory reason
  const [cookieModal, setCookieModal] = useState<CookieModalState | null>(null);

  // Filtered Students for selected grade/class and search query
  const availableGrades = useMemo(() => {
    const gradesSet = new Set<number>([1, 2, 3]);
    students.forEach((s) => gradesSet.add(s.grade));
    return Array.from(gradesSet).sort((a, b) => a - b);
  }, [students]);

  const availableClasses = useMemo(() => {
    const classesSet = new Set<number>([1, 2, 3]);
    students.filter((s) => s.grade === selectedGrade).forEach((s) => classesSet.add(s.classNum));
    return Array.from(classesSet).sort((a, b) => a - b);
  }, [students, selectedGrade]);

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
  const handleOpenCookieModal = (target: Student, defaultMode: 'add' | 'subtract' | 'reset' = 'add') => {
    setCookieModal({
      isOpen: true,
      targets: [target],
      mode: defaultMode,
      amount: defaultMode === 'reset' ? 0 : 1,
      clearCumulative: true,
      reason:
        defaultMode === 'add'
          ? '마음처방 미션 성실 실천'
          : defaultMode === 'subtract'
          ? '가챠 뽑기'
          : '선생님 쿠키 잔액 및 누적 통계 초기화 (0개)'
    });
  };

  // Open Cookie Modal for Selected Students (Batch)
  const handleOpenBatchCookieModal = (defaultMode: 'add' | 'subtract' | 'reset' = 'add') => {
    const targets = students.filter((s) => selectedStudentIds.includes(s.id));
    if (targets.length === 0) return;
    setCookieModal({
      isOpen: true,
      targets,
      mode: defaultMode,
      amount: defaultMode === 'reset' ? 0 : 1,
      clearCumulative: true,
      reason:
        defaultMode === 'add'
          ? '마음처방 미션 성실 실천'
          : defaultMode === 'subtract'
          ? '가챠 뽑기'
          : '선생님 쿠키 잔액 및 누적 통계 일괄 초기화 (0개)'
    });
  };

  // Reset Single Student Cookies (preserves all other data!)
  const handleResetSingleStudentCookies = (student: Student) => {
    setConfirmModal({
      isOpen: true,
      title: '학생 보유 쿠키 및 누적 통계 초기화',
      message: `[${student.name}] 학생의 현재 보유 쿠키(${student.cookieBalance || 0}개) 및 누적 지급/사용 기록을 모두 0개로 초기화하시겠습니까?`,
      subMessage: '🔒 학생 계정, 비밀번호, 사전/사후 진단평가, 처방전, 5일 실천 기록 등 다른 모든 데이터는 100% 안전하게 보존됩니다.',
      confirmLabel: '0개로 초기화 실행',
      isDanger: true,
      onConfirm: () => {
        StorageService.resetStudentCookies(student.id, `[${student.name}] 학생 쿠키 초기화 (0개)`, true, true);
        onStudentsUpdated();
        showToast(`🍪 [${student.name}] 학생의 보유 쿠키 및 누적 기록이 0개로 초기화되었습니다. (다른 데이터 보존)`, 'cookie');
        setConfirmModal(null);
      }
    });
  };

  // Reset Batch Students Cookies (preserves all other data!)
  const handleResetBatchCookies = () => {
    if (selectedStudentIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: '선택 학생 쿠키 및 누적 통계 일괄 초기화',
      message: `선택된 ${selectedStudentIds.length}명 학생의 보유 쿠키와 누적 지급/사용 기록을 모두 0개로 초기화하시겠습니까?`,
      subMessage: '🔒 학생 계정(PIN), 진단검사, 처방전 및 5일 실천 미션 기록 등 다른 모든 정보는 100% 안전하게 보존됩니다.',
      confirmLabel: `선택 ${selectedStudentIds.length}명 쿠키 0개로 초기화`,
      isDanger: true,
      onConfirm: () => {
        const count = StorageService.resetStudentsCookiesBatch(
          selectedStudentIds,
          '선생님에 의한 선택 학생 쿠키 일괄 초기화 (0개)',
          true
        ).updatedCount;
        onStudentsUpdated();
        showToast(`🍪 선택된 ${count}명 학생의 보유 쿠키 및 누적 기록이 0개로 초기화되었습니다. (다른 데이터 보존)`, 'cookie');
        setConfirmModal(null);
      }
    });
  };

  // Reset Single Student Password (PIN)
  const handleResetSingleStudentPin = (student: Student) => {
    setConfirmModal({
      isOpen: true,
      title: '학생 비밀번호 초기화',
      message: `[${student.name}] (${student.grade}학년 ${student.classNum}반 ${student.number}번) 학생의 비밀번호를 기본 비밀번호 '0000'으로 초기화하시겠습니까?`,
      confirmLabel: '0000으로 초기화',
      isDestructive: false,
      onConfirm: () => {
        StorageService.resetStudentPin(student.id, '0000');
        onStudentsUpdated();
        showToast(`🔑 [${student.name}] 학생의 비밀번호가 '0000'으로 초기화되었습니다.`, 'success');
        setConfirmModal(null);
      }
    });
  };

  // Reset Batch Students Password (PIN)
  const handleResetBatchPins = () => {
    if (selectedStudentIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: '선택 학생 비밀번호 일괄 초기화',
      message: `선택된 ${selectedStudentIds.length}명 학생의 비밀번호를 모두 초기 비밀번호 '0000'으로 초기화하시겠습니까?`,
      confirmLabel: '일괄 초기화 실행 (0000)',
      isDestructive: false,
      onConfirm: () => {
        const count = StorageService.resetStudentsPinBatch(selectedStudentIds, '0000');
        onStudentsUpdated();
        showToast(`🔑 선택된 ${count}명 학생의 비밀번호가 '0000'으로 초기화되었습니다.`, 'success');
        setConfirmModal(null);
      }
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
    // Handle reset mode
    if (mode === 'reset') {
      const clearCumulative = cookieModal.clearCumulative ?? true;
      const count = StorageService.resetStudentsCookiesBatch(
        targets.map((s) => s.id),
        trimmedReason || '선생님에 의한 쿠키 잔액 및 누적 통계 초기화 (0개)',
        clearCumulative
      ).updatedCount;
      onStudentsUpdated();
      setCookieModal(null);
      const namesStr = targets.length === 1 ? `[${targets[0].name}]` : `선택된 ${count}명의`;
      const cumMsg = clearCumulative ? ' 및 누적 통계' : '';
      showToast(`🍪 ${namesStr} 학생의 칭찬쿠키${cumMsg}가 0개로 초기화되었습니다. (다른 모든 정보는 안전하게 보존됨)`, 'cookie');
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

    const isTest = isTestStudentFlag || checkIsTestStudent({ name });

    const newStudent: Student = {
      id: `s_${selectedGrade}_${selectedClass}_${num}`,
      grade: selectedGrade,
      classNum: selectedClass,
      number: num,
      name,
      cookieBalance: 0,
      createdAt: new Date().toISOString(),
      isTestStudent: isTest
    };

    StorageService.addStudentsBatch([newStudent]);
    setNewNumber('');
    setNewName('');
    setIsTestStudentFlag(false);
    setIsAddSingleOpen(false);
    onStudentsUpdated();
    showToast(`[${name}] ${isTest ? '(체험/테스트 학생) ' : ''}학생이 ${selectedGrade}학년 ${selectedClass}반에 등록되었습니다.`, 'success');
  };

  // Quick Add Teacher Test Student
  const handleAddQuickTestStudent = () => {
    // Find next available number in current class
    const existingNumbers = new Set(filteredStudents.map((s) => s.number));
    let nextNum = 99;
    if (existingNumbers.has(nextNum)) {
      nextNum = 98;
      while (existingNumbers.has(nextNum) && nextNum > 0) {
        nextNum--;
      }
    }
    if (nextNum <= 0) nextNum = Math.floor(Math.random() * 800) + 100;

    const testStudent: Student = {
      id: `s_${selectedGrade}_${selectedClass}_${nextNum}`,
      grade: selectedGrade,
      classNum: selectedClass,
      number: nextNum,
      name: `테스트학생${nextNum}`,
      cookieBalance: 0,
      createdAt: new Date().toISOString(),
      isTestStudent: true,
      pin: '0000'
    };

    StorageService.addStudentsBatch([testStudent]);
    onStudentsUpdated();
    showToast(`🧪 [${testStudent.name}] (${selectedGrade}학년 ${selectedClass}반 ${nextNum}번) 교사용 테스트 학생이 즉시 생성되었습니다! (5일차 체험 루틴 테스트 가능)`, 'success');
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
      cookieBalance: 0,
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
            cookieBalance: 0,
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

  // Granular Reset Execution Handler (Content Only vs. Full Reset with Roster)
  const handleExecuteReset = async () => {
    if (!resetModalMode) return;
    setIsResetExecuting(true);
    try {
      if (resetModalMode === 'content_only') {
        const res = await StorageService.resetContentOnly();
        setSelectedStudentIds([]);
        onStudentsUpdated();
        showToast(
          `✨ 학생 명단(${res.affectedStudentsCount}명)은 안전하게 유지되고, 쿠키 잔액 및 모든 활동 기록이 깨끗하게 초기화되었습니다.`,
          'success'
        );
      } else {
        const res = await StorageService.resetAllWithRoster();
        setSelectedStudentIds([]);
        onStudentsUpdated();
        showToast(
          `🗑️ 학생 명단(${res.deletedStudentsCount}명)을 포함한 모든 데이터가 완전히 삭제되어 초기 상태(0명)로 리셋되었습니다.`,
          'success'
        );
      }
      setResetModalMode(null);
      setResetConfirmInput('');
    } catch (err: any) {
      showToast(`초기화 실행 중 오류가 발생했습니다: ${err.message || err}`, 'error');
    } finally {
      setIsResetExecuting(false);
    }
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
            {availableGrades.map((g) => (
              <option key={g} value={g}>
                {g}학년
              </option>
            ))}
          </select>

          {/* Class Selector */}
          <select
            value={selectedClass}
            onChange={(e) => onClassChange(Number(e.target.value))}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer"
          >
            {availableClasses.map((c) => {
              const count = students.filter((s) => s.grade === selectedGrade && s.classNum === c).length;
              return (
                <option key={c} value={c}>
                  {c}반 ({count}명)
                </option>
              );
            })}
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

          {/* Quick Create Test Student for Teacher */}
          <button
            type="button"
            onClick={handleAddQuickTestStudent}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="5일차 미션 체험 테스트를 위해 교사 전용 테스트 학생을 즉시 생성합니다"
          >
            <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
            <span>+ 테스트 학생 생성</span>
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

          {/* Divider */}
          <div className="hidden md:block h-5 w-px bg-slate-200 my-auto" />

          {/* Granular Reset Buttons Group */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setResetModalMode('content_only');
                setResetConfirmInput('');
              }}
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="학생 명단은 안전하게 유지하고 쿠키 잔액, 쿠키 지급 기록, 진료 처방전 등 활동 내용만 0으로 초기화합니다"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>내용만 초기화 (명단 유지)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setResetModalMode('full_reset');
                setResetConfirmInput('');
              }}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="등록된 학생 명단을 포함하여 모든 데이터와 기록을 완전 삭제 (0명으로 리셋)"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>전체 초기화 (명단까지 삭제)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Direct Single Add Form Row */}
      {isAddSingleOpen && (
        <form
          onSubmit={handleAddSingle}
          className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3 flex flex-wrap items-center gap-2 text-xs"
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
          <label className="flex items-center gap-1.5 cursor-pointer select-none px-2 py-1 bg-white/80 border border-purple-200 rounded-lg text-purple-800 font-medium">
            <input
              type="checkbox"
              checked={isTestStudentFlag}
              onChange={(e) => setIsTestStudentFlag(e.target.checked)}
              className="w-3.5 h-3.5 text-purple-600 rounded"
            />
            <span>🧪 테스트 학생으로 지정 (5일차 체험 루틴 가능)</span>
          </label>
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
          >
            추가
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddSingleOpen(false);
              setIsTestStudentFlag(false);
            }}
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
              onClick={handleResetBatchCookies}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              title="선택한 학생들의 보유 쿠키 잔액을 0개로 일괄 초기화 (다른 데이터는 안전하게 보존)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              <span>쿠키 일괄 초기화 (0개)</span>
            </button>
            <button
              type="button"
              onClick={handleResetBatchPins}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              title="선택한 학생들의 비밀번호를 모두 기본값 0000으로 일괄 초기화"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>비번 일괄 초기화 (0000)</span>
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
                <th className="py-3 px-3 text-right">관리 (쿠키 / 비번 초기화)</th>
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
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{s.name}</span>
                          {checkIsTestStudent(s) && (
                            <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 border border-purple-200">
                              🧪체험용
                            </span>
                          )}
                        </div>
                      </td>
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
                            onClick={() => handleResetSingleStudentCookies(s)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold transition-all flex items-center gap-1 hover:scale-102 cursor-pointer text-[11px]"
                            title="해당 학생의 보유 쿠키를 0개로 초기화 (다른 정보 보존)"
                          >
                            <RotateCcw className="w-3 h-3 text-rose-500" />
                            <span>쿠키초기화</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResetSingleStudentPin(s)}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold transition-all flex items-center gap-1 hover:scale-102 cursor-pointer text-[11px]"
                            title="학생 비밀번호를 기본값(0000)으로 초기화"
                          >
                            <KeyRound className="w-3 h-3 text-indigo-600" />
                            <span>비번초기화</span>
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

            {/* Mode Switch (Add / Subtract / Reset) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
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
                <span>지급 (+)</span>
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
                <span>차감 (-)</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setCookieModal({
                    ...cookieModal,
                    mode: 'reset',
                    amount: 0,
                    reason: '선생님에 의한 쿠키 잔액 초기화 (0개)'
                  })
                }
                className={`py-2 text-xs font-jua rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  cookieModal.mode === 'reset'
                    ? 'bg-rose-600 text-white shadow-xs font-bold'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>0개 초기화</span>
              </button>
            </div>

            {/* Quantity Selector or Reset Notice */}
            {cookieModal.mode === 'reset' ? (
              <div className="space-y-2">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                    <span>보유 쿠키 잔액을 0개로 설정합니다</span>
                  </div>
                  <p className="text-[11px] text-rose-700/90 leading-relaxed">
                    대상 학생의 현재 쿠키 잔액이 즉시 0개로 초기화되며, 학생 계정, 사전/사후 진단평가, 처방전, 5일 실천 미션 기록 등 다른 모든 데이터는 안전하게 보존됩니다.
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cookieModal.clearCumulative ?? true}
                      onChange={(e) =>
                        setCookieModal({
                          ...cookieModal,
                          clearCumulative: e.target.checked
                        })
                      }
                      className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      누적 획득 및 누적 소모 기록도 함께 0개로 리셋
                    </span>
                  </label>
                  <p className="text-[10.5px] text-slate-400 pl-6 mt-0.5">
                    체크 시 상단 누적 통계와 학생 누적 집계가 함께 초기화됩니다.
                  </p>
                </div>
              </div>
            ) : (
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
            )}

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
                      '🎰 가챠 뽑기',
                      '🔄 오지급 쿠키 수량 정정',
                      '⚠️ 기본 생활규칙 및 약속 미이행',
                      '기타 수동 조정'
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setCookieModal({ ...cookieModal, reason: chip.replace(/^[^\s]+\s/, '') })}
                        className={`text-[11px] px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          cookieModal.reason === chip || cookieModal.reason === chip.replace(/^[^\s]+\s/, '')
                            ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
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
                    : cookieModal.mode === 'subtract'
                    ? 'bg-slate-700 hover:bg-slate-800 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {cookieModal.mode === 'reset' ? (
                  <RotateCcw className="w-3.5 h-3.5" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>
                  {cookieModal.mode === 'add'
                    ? `${cookieModal.amount}개 지급하기`
                    : cookieModal.mode === 'subtract'
                    ? `${cookieModal.amount}개 차감하기`
                    : '0개로 초기화 실행'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Granular Data Reset Modal (Content Only vs. Full Reset with Roster) */}
      {resetModalMode !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border-4 border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2.5 rounded-2xl ${
                    resetModalMode === 'content_only'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {resetModalMode === 'content_only' ? (
                    <RotateCcw className="w-5 h-5" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-jua text-base text-slate-900">
                    {resetModalMode === 'content_only'
                      ? '활동 내용만 초기화 (학생 명단 유지)'
                      : '전체 초기화 (학생 명단까지 삭제)'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {resetModalMode === 'content_only'
                      ? '학생 명부(이름, 번호, 비번)는 100% 보존하고 쿠키 및 활동 기록만 0으로 비웁니다'
                      : '등록된 학생 명단을 포함하여 모든 데이터와 기록을 영구 삭제합니다'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isResetExecuting) return;
                  setResetModalMode(null);
                  setResetConfirmInput('');
                }}
                disabled={isResetExecuting}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setResetModalMode('content_only');
                  setResetConfirmInput('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-jua transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  resetModalMode === 'content_only'
                    ? 'bg-amber-500 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>1. 내용만 초기화 (명단 유지)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetModalMode('full_reset');
                  setResetConfirmInput('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-jua transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  resetModalMode === 'full_reset'
                    ? 'bg-rose-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>2. 전체 초기화 (명단 포함)</span>
              </button>
            </div>

            {/* Mode Explanation & Detail Box */}
            {resetModalMode === 'content_only' ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>학생 명단 {students.length}명은 100% 안전하게 유지됩니다!</span>
                  </div>
                  <p className="text-[11px] text-amber-800/90 leading-relaxed">
                    새 학기 또는 새로운 활동 차시를 시작할 때 사용하는 기능입니다. 학생 명단을 다시 등록할 필요 없이, 누적된 활동 기록과 쿠키만 깔끔하게 비웁니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
                    <div className="font-bold text-emerald-800 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>그대로 보존되는 항목:</span>
                    </div>
                    <ul className="text-[11px] text-emerald-700 space-y-1 pl-4 list-disc">
                      <li>학생 명부 (이름, 번호, 학년, 반)</li>
                      <li>학생 로그인 비밀번호 (PIN)</li>
                      <li>가상질환 130종 백과 데이터</li>
                      <li>학급 설정 및 시스템 기본값</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1.5">
                    <div className="font-bold text-rose-800 flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                      <span>0으로 초기화되는 항목:</span>
                    </div>
                    <ul className="text-[11px] text-rose-700 space-y-1 pl-4 list-disc">
                      <li>모든 학생 칭찬쿠키 잔액 (0개)</li>
                      <li>쿠키 지급 및 차감 타임라인 기록</li>
                      <li>마음약국 처방전 & 5일 실천 미션</li>
                      <li>사전/사후 사회정서 진단평가 기록</li>
                      <li>가챠 뽑기·스티커·감정 일기 기록</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>주의: 학생 명단 {students.length}명까지 모두 완전히 삭제됩니다!</span>
                  </div>
                  <p className="text-[11px] text-rose-800/90 leading-relaxed">
                    새 학년도가 되어 전교생 명단을 새 엑셀 파일로 완전히 새로 등록하거나, 모든 테스트 데이터를 깨끗하게 비우고 0명 상태에서 시작할 때 사용합니다.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>영구 삭제되는 대상:</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1 pl-4 list-disc">
                    <li>등록된 전교생 학생 명단 {students.length}명 전체 (학생 수 0명으로 리셋)</li>
                    <li>학생 계정 및 로그인 PIN 비밀번호 정보</li>
                    <li>모든 진료 처방전, 5일 실천 미션, 진단평가 기록</li>
                    <li>모든 칭찬쿠키 잔액 및 지급/사용 로그</li>
                  </ul>
                </div>

                {/* Double Safety Input for Full Reset */}
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5">
                  <label className="text-xs font-bold text-rose-900 block">
                    명단 삭제 안전 확인: 아래에 <span className="underline font-black text-rose-600">전체삭제</span>를 입력해주세요
                  </label>
                  <input
                    type="text"
                    value={resetConfirmInput}
                    onChange={(e) => setResetConfirmInput(e.target.value)}
                    placeholder="전체삭제"
                    className="w-full px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-xs font-bold text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
            )}

            {/* Automatic Snapshot Safeguard Note */}
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>안심 스냅샷 자동 생성</strong>: 초기화 실행 직전 현재 데이터가 [타임머신 자동 스냅샷]에 저장되므로, 필요 시 [데이터 안전] 탭에서 언제든 되돌릴 수 있습니다.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (isResetExecuting) return;
                  setResetModalMode(null);
                  setResetConfirmInput('');
                }}
                disabled={isResetExecuting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleExecuteReset}
                disabled={
                  isResetExecuting ||
                  (resetModalMode === 'full_reset' && resetConfirmInput.trim() !== '전체삭제')
                }
                className={`px-5 py-2 rounded-xl text-xs font-jua shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  resetModalMode === 'content_only'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {isResetExecuting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>초기화 처리 중...</span>
                  </>
                ) : resetModalMode === 'content_only' ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>명단 유지하고 내용만 초기화 실행</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>학생 명단 포함 전체 초기화 실행</span>
                  </>
                )}
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
