import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { FirestoreSync } from '../../services/firestoreSync';
import { SnapshotRecord } from '../../services/dataSafety';
import {
  ShieldCheck,
  Download,
  Upload,
  RotateCcw,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  History,
  HardDrive,
  RefreshCw,
  Sparkles,
  Server,
  Activity,
  GitBranch,
  Trash2,
  Check,
  X
} from 'lucide-react';

interface DataSafetyTabProps {
  onDataReset?: () => void;
}

export const DataSafetyTab: React.FC<DataSafetyTabProps> = ({ onDataReset }) => {
  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
  const [safetyStatus, setSafetyStatus] = useState(StorageService.getSafetyStatus());
  const [syncStatus, setSyncStatus] = useState(FirestoreSync.getStatus());
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [healthResult, setHealthResult] = useState<{
    healthy: boolean;
    studentCount: number;
    hasSettings: boolean;
    hasSystemMeta: boolean;
    schemaVersion: number;
    error?: string;
  } | null>(null);

  // Granular Reset States
  const [resetModalMode, setResetModalMode] = useState<'content_only' | 'full_reset' | null>(null);
  const [isResetExecuting, setIsResetExecuting] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');

  const handleExecuteReset = async () => {
    if (!resetModalMode) return;
    setIsResetExecuting(true);
    try {
      if (resetModalMode === 'content_only') {
        const res = await StorageService.resetContentOnly();
        refreshStatus();
        if (onDataReset) onDataReset();
        setStatusMessage({
          type: 'success',
          text: `✨ 학생 명단(${res.affectedStudentsCount}명)은 안전하게 유지되고, 쿠키 잔액 및 모든 활동 기록이 깨끗하게 초기화되었습니다!`
        });
      } else {
        const res = await StorageService.resetAllWithRoster();
        refreshStatus();
        if (onDataReset) onDataReset();
        setStatusMessage({
          type: 'success',
          text: `🗑️ 학생 명단(${res.deletedStudentsCount}명)을 포함한 모든 데이터가 완전히 삭제되어 초기 상태(0명)로 리셋되었습니다.`
        });
      }
      setResetModalMode(null);
      setResetConfirmInput('');
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `초기화 실행 중 오류가 발생했습니다: ${err.message || err}`
      });
    } finally {
      setIsResetExecuting(false);
    }
  };

  // Load snapshots & status
  const refreshStatus = () => {
    setSnapshots(StorageService.getSnapshots());
    setSafetyStatus(StorageService.getSafetyStatus());
    setSyncStatus(FirestoreSync.getStatus());
  };

  useEffect(() => {
    refreshStatus();
    const unsub = FirestoreSync.subscribe(() => {
      setSyncStatus(FirestoreSync.getStatus());
    });
    return unsub;
  }, []);

  const handleExportBackup = () => {
    StorageService.exportDataBackup();
    setStatusMessage({
      type: 'success',
      text: '전체 데이터 백업 파일(.json)이 다운로드되었습니다. 컴퓨터나 드라이브에 안전하게 보관하세요!'
    });
    refreshStatus();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('백업 파일을 적용하여 현재 데이터를 복원하시겠습니까? 현재 상태는 복원 전 자동 스냅샷으로 안전하게 저장됩니다.')) {
      e.target.value = '';
      return;
    }

    try {
      const res = await StorageService.importDataBackup(file);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        refreshStatus();
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `복원 실패: ${err.message || err}` });
    }
    e.target.value = '';
  };

  const handleRestoreSnapshot = (snapshot: SnapshotRecord) => {
    const timeStr = new Date(snapshot.createdAt).toLocaleTimeString();
    if (
      !confirm(
        `[${timeStr} - ${snapshot.reason}] 시점으로 복원하시겠습니까?\n(학생: ${snapshot.counts.students}명, 처방전: ${snapshot.counts.visits}건)`
      )
    ) {
      return;
    }

    const res = StorageService.restoreSnapshot(snapshot.id);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      refreshStatus();
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleCreateManualSnapshot = () => {
    StorageService.createManualSnapshot('교사 수동 스냅샷 생성');
    setStatusMessage({ type: 'success', text: '새로운 복원 지점(스냅샷)이 성공적으로 생성되었습니다.' });
    refreshStatus();
  };

  const handleForceSyncToCloud = async () => {
    setIsSyncing(true);
    try {
      const students = StorageService.getStudents();
      const visits = StorageService.getVisits();
      await FirestoreSync.saveStudentsBatch(students);
      await FirestoreSync.saveVisitsBatch(visits);
      setStatusMessage({
        type: 'success',
        text: `로컬 데이터(학생 ${students.length}명, 처방전 ${visits.length}건)를 Firestore 클라우드에 성공적으로 동기화했습니다.`
      });
      refreshStatus();
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: `클라우드 동기화 중 오류: ${e.message || e}` });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRunHealthCheck = async () => {
    setIsHealthChecking(true);
    try {
      const res = await FirestoreSync.verifyDatabaseHealth();
      setHealthResult(res);
      refreshStatus();
      if (res.healthy) {
        setStatusMessage({
          type: 'success',
          text: `클라우드 데이터베이스 검증 완료: 정상 연결 (클라우드 보관 학생: ${res.studentCount}명, 스키마: v${res.schemaVersion})`
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: `데이터베이스 진단 실패: ${res.error || '알 수 없는 오류'}`
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `진단 실행 오류: ${err.message || err}` });
    } finally {
      setIsHealthChecking(false);
    }
  };

  const handleManualSeedIfEmpty = async () => {
    if (!confirm('Firestore가 비어있을 때만 기본 예시 데이터를 안전하게 등록합니다. 이미 학생 데이터가 존재하면 실행되지 않습니다. 계속하시겠습니까?')) {
      return;
    }
    const res = await FirestoreSync.manualSeedInitialDataOnlyIfEmpty();
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      refreshStatus();
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const students = StorageService.getStudents();
  const visits = StorageService.getVisits();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 font-bold text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>데이터 유실 방지 안전센터</span>
            </span>
            <span className="text-xs text-emerald-200">GitHub · Vercel · Firebase 재배포 안전 보호</span>
          </div>
          <h2 className="font-jua text-xl mt-1.5 tracking-tight">
            학생 활동 데이터 무결성 및 자동 백업 복구
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            GitHub 푸시나 Vercel 재배포, 브라우저 캐시 삭제 시에도 데이터가 보호되도록
            <strong> 자동 초기화 방지</strong>, <strong>프로젝트 불일치 차단</strong>,
            <strong> 롤링 스냅샷</strong>, <strong>스키마 버전 관리(v{syncStatus.schemaVersion})</strong>가 가동 중입니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCreateManualSnapshot}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-jua transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>현재 상태 스냅샷 저장</span>
          </button>
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-jua shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>전체 데이터 백업 다운로드</span>
          </button>
        </div>
      </div>

      {/* Alert / Notification Feedback */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold px-2 py-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cloud & Deployment Diagnostics Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-jua text-sm text-slate-800">
                Firebase & Vercel 재배포 환경 안전 진단
              </h3>
              <p className="text-[11px] text-slate-500">
                코드 변경 또는 배포 시 기존 Firestore 데이터의 보존 여부를 실시간으로 모니터링합니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunHealthCheck}
              disabled={isHealthChecking}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-jua transition-colors cursor-pointer"
            >
              <Activity className={`w-3.5 h-3.5 text-teal-600 ${isHealthChecking ? 'animate-pulse' : ''}`} />
              <span>{isHealthChecking ? '진단 중...' : '클라우드 무결성 진단'}</span>
            </button>
            <button
              onClick={handleManualSeedIfEmpty}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-jua transition-colors cursor-pointer"
              title="DB가 0건일 때만 작동하며, 이미 데이터가 있으면 안전하게 차단됩니다."
            >
              <span>초기 데이터 안전 등록 (DB 비었을 때만)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-400 block mb-1">배포 환경 (Env)</span>
            <div className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="font-bold text-slate-700 truncate">{syncStatus.environment}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-400 block mb-1">프로젝트 ID 검증</span>
            <div className="flex items-center gap-1.5">
              {syncStatus.isProjectMismatch ? (
                <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" /> 불일치 (쓰기 차단)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 프로젝트 일치 확인
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block truncate mt-0.5">{syncStatus.currentProjectId}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-400 block mb-1">스키마 버전</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800">Schema v{syncStatus.schemaVersion}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold">
                최신
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">App v{syncStatus.appVersion}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-400 block mb-1">실시간 동기화 상태</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${syncStatus.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-bold text-slate-800">
                {syncStatus.isConnected ? '클라우드 연결됨' : '연결 대기 중'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {syncStatus.lastSyncTime ? `마지막 수신: ${syncStatus.lastSyncTime}` : '수신 대기'}
            </span>
          </div>
        </div>

        {healthResult && (
          <div className={`p-3 rounded-xl text-xs border ${healthResult.healthy ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
            <div className="flex items-center justify-between font-bold mb-1">
              <span>진단 결과 요약: {healthResult.healthy ? '정상 무결성 유지' : '오류 감지'}</span>
              <span className="text-[11px]">스키마 버전: v{healthResult.schemaVersion}</span>
            </div>
            <div className="text-[11px] text-slate-600 flex flex-wrap gap-4 mt-1">
              <span>클라우드 학생 레코드: <strong>{healthResult.studentCount}명</strong></span>
              <span>앱 설정 문서: <strong>{healthResult.hasSettings ? '존재함' : '없음'}</strong></span>
              <span>시스템 메타데이터(system/meta): <strong>{healthResult.hasSystemMeta ? '보유' : '자동 생성됨'}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* 3 Protection Pillars Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Safe Vault */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              정상 보호 중
            </span>
          </div>
          <h3 className="font-jua text-sm text-slate-800">로컬 안전 금고 (Safe Vault)</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            데이터가 0건인 비정상 상태나 브라우저 캐시 손상이 감지되면 즉시 이전의 온전한 데이터를 자동 복원합니다.
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
            <span>금고 미러링 상태:</span>
            <span className="font-bold text-emerald-600">
              {safetyStatus.hasSafeVault ? '활성화됨 (Active)' : '준비 중'}
            </span>
          </div>
        </div>

        {/* Card 2: Time-Machine Rolling Snapshots */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <History className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              스냅샷 {safetyStatus.snapshotCount}개 보관
            </span>
          </div>
          <h3 className="font-jua text-sm text-slate-800">타임머신 롤링 스냅샷</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            처방전 발급, 칭찬쿠키 변동 등 중요한 활동이 일어날 때마다 자동으로 이전 복구 지점을 보관합니다.
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
            <span>최근 백업 시각:</span>
            <span className="font-bold text-slate-700">
              {safetyStatus.lastBackupTime
                ? new Date(safetyStatus.lastBackupTime).toLocaleTimeString()
                : '방금 전'}
            </span>
          </div>
        </div>

        {/* Card 3: Cloud Overwrite Shield */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Cloud className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
              클라우드 덮어쓰기 방지
            </span>
          </div>
          <h3 className="font-jua text-sm text-slate-800">클라우드 동기화 보호막</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            재배포나 부팅 시 기본 데이터 자동 덮어쓰기를 원천 차단하고, 읽기 오류 시에도 로컬 데이터를 삭제하지 않습니다.
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
            <span>현재 보관 데이터:</span>
            <span className="font-bold text-slate-800">
              학생 {students.length}명 / 처방 {visits.length}건
            </span>
          </div>
        </div>
      </div>

      {/* Manual Backup & Restore Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-jua text-base text-slate-900 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-emerald-600" />
              <span>백업 파일 내보내기 & 가져오기 (영구 보관)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              학기말, 기기 교체, 교실 이동 시 전체 데이터를 단일 JSON 파일로 컴퓨터에 영구 저장하세요.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Download Box */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-1">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>1. 컴퓨터로 전체 백업 다운로드</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                현재 등록된 학생 명부, 처방전 기록, 칭찬쿠키 내역, 맞춤 설정 등 모든 데이터가 포함된 백업 파일을 생성합니다.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="mt-4 w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-jua shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>힐링약국 전체 데이터 백업 다운로드 (.json)</span>
            </button>
          </div>

          {/* Upload Box */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-1">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>2. 백업 파일에서 데이터 복원하기</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                다운로드해 둔 힐링약국 백업 JSON 파일을 선택하면 현재 앱과 클라우드에 즉시 복원됩니다.
              </p>
            </div>
            <label className="mt-4 w-full flex items-center justify-center gap-1.5 bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-300 text-indigo-700 py-2.5 rounded-xl text-xs font-jua shadow-xs transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>백업 JSON 파일 선택하여 복원</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Force Sync Option */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-600">
            <RefreshCw className={`w-4 h-4 text-sky-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              새 기기이거나 데이터 불일치가 의심될 때 클라우드로 직접 강제 동기화할 수 있습니다.
            </span>
          </div>
          <button
            onClick={handleForceSyncToCloud}
            disabled={isSyncing}
            className="shrink-0 flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white px-3.5 py-1.5 rounded-xl text-xs font-jua shadow-2xs transition-colors cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{isSyncing ? '동기화 중...' : '클라우드에 강제 동기화'}</span>
          </button>
        </div>
      </div>

      {/* Granular Reset Center Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-jua text-base text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>데이터 초기화 센터 (내용 초기화 vs 전체 초기화)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              원하는 범위에 맞춰 데이터를 안전하게 초기화할 수 있습니다. 학생 명단을 유지할지, 명단까지 완전히 비울지 선택하세요.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Content Only */}
          <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-jua text-sm">
                <span className="p-1.5 bg-amber-100 rounded-xl text-amber-700">
                  <RotateCcw className="w-4 h-4" />
                </span>
                <span>1. 활동 내용만 초기화 (학생 명단 유지)</span>
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                학생 명부(이름, 번호, 로그인 PIN)는 <strong>그대로 안전하게 보존</strong>하고, 칭찬쿠키 잔액(0개 리셋), 쿠키 로그, 처방전, 5일 실천 미션, 진단평가 기록만 깨끗하게 초기화합니다.
              </p>
              <div className="text-[11px] text-amber-700 space-y-1 pt-1 border-t border-amber-200/60">
                <p>✅ <strong>보존</strong>: 학생 명단 {safetyStatus.studentCount}명, 로그인 PIN, 가상질환 백과, 학급 기본 설정</p>
                <p>🔄 <strong>초기화</strong>: 쿠키 잔액 0개, 쿠키 지급 내역, 마음약국 진료 기록, 감정 일기</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setResetModalMode('content_only');
                setResetConfirmInput('');
              }}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-jua shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>활동 내용만 초기화 실행 (명단 유지)</span>
            </button>
          </div>

          {/* Card 2: Full Reset */}
          <div className="border border-rose-200 bg-rose-50/40 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-jua text-sm">
                <span className="p-1.5 bg-rose-100 rounded-xl text-rose-700">
                  <Trash2 className="w-4 h-4" />
                </span>
                <span>2. 전체 초기화 (학생 명단까지 삭제)</span>
              </div>
              <p className="text-xs text-rose-800/90 leading-relaxed">
                등록된 학생 명단을 포함하여 모든 데이터와 활동 기록을 완전히 영구 삭제합니다. 학생 수가 0명으로 초기화되어 새 학년도 시작 상태가 됩니다.
              </p>
              <div className="text-[11px] text-rose-700 space-y-1 pt-1 border-t border-rose-200/60">
                <p>🗑️ <strong>영구 삭제</strong>: 전교생 학생 명단 {safetyStatus.studentCount}명 전체, 학생 로그인 정보</p>
                <p>🗑️ <strong>영구 삭제</strong>: 모든 쿠키 잔액/로그, 모든 처방전, 미션, 진단평가 기록</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setResetModalMode('full_reset');
                setResetConfirmInput('');
              }}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-jua shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>전체 초기화 실행 (명단까지 삭제)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Time Machine Snapshots List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-jua text-base text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span>타임머신 자동 스냅샷 목록 (최근 {snapshots.length}개 보관)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              원하는 시점을 선택하여 1클릭으로 해당 시점의 데이터로 되돌릴 수 있습니다.
            </p>
          </div>
          <button
            onClick={handleCreateManualSnapshot}
            className="flex items-center gap-1 text-xs font-jua text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <span>+ 지금 시점 스냅샷 추가</span>
          </button>
        </div>

        {snapshots.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            보관된 스냅샷이 없습니다. 활동이 시작되면 자동으로 생성됩니다.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {snapshots.map((snap, idx) => {
              const date = new Date(snap.createdAt);
              const isLatest = idx === 0;

              return (
                <div
                  key={snap.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        isLatest
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-jua text-xs text-slate-800">{snap.reason}</span>
                        {isLatest && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                            최신 지점
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span>{date.toLocaleDateString()} {date.toLocaleTimeString()}</span>
                        <span>•</span>
                        <span>학생: {snap.counts.students}명</span>
                        <span>•</span>
                        <span>처방전: {snap.counts.visits}건</span>
                        <span>•</span>
                        <span>쿠키로그: {snap.counts.cookieLogs}건</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestoreSnapshot(snap)}
                    className="self-end sm:self-center flex items-center gap-1 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-700 px-3 py-1.5 rounded-xl text-xs font-jua transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>이 시점으로 복원</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Granular Data Reset Modal (Content Only vs. Full Reset with Roster) */}
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
                    <span>학생 명단 {safetyStatus.studentCount}명은 100% 안전하게 유지됩니다!</span>
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
                    <span>주의: 학생 명단 {safetyStatus.studentCount}명까지 모두 완전히 삭제됩니다!</span>
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
                    <li>등록된 전교생 학생 명단 {safetyStatus.studentCount}명 전체 (학생 수 0명으로 리셋)</li>
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
                <strong>안심 스냅샷 자동 생성</strong>: 초기화 실행 직전 현재 데이터가 [타임머신 자동 스냅샷]에 저장되므로, 필요 시 언제든 되돌릴 수 있습니다.
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
    </div>
  );
};
