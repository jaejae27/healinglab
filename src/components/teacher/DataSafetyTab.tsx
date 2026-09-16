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
  Sparkles
} from 'lucide-react';

export const DataSafetyTab: React.FC = () => {
  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
  const [safetyStatus, setSafetyStatus] = useState(StorageService.getSafetyStatus());
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load snapshots & status
  const refreshStatus = () => {
    setSnapshots(StorageService.getSnapshots());
    setSafetyStatus(StorageService.getSafetyStatus());
  };

  useEffect(() => {
    refreshStatus();
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

  const students = StorageService.getStudents();
  const visits = StorageService.getVisits();
  const cookieLogs = StorageService.getCookieLogs();

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
            <span className="text-xs text-emerald-200">2중 안전 금고(Safe Vault) 가동 중</span>
          </div>
          <h2 className="font-jua text-xl mt-1.5 tracking-tight">
            학생 활동 데이터 무결성 및 자동 백업 복구
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            아이들이 기기를 변경하거나 브라우저 캐시가 비워져도 데이터가 유실되지 않도록
            <strong> 로컬 안전 금고(Safe Vault)</strong>, <strong>타임머신 자동 스냅샷</strong>,
            <strong> 클라우드 동기화 보호막</strong>이 3단계로 작동하고 있습니다.
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
            className="text-slate-400 hover:text-slate-600 font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

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
            Firestore 연결이 불안정하거나 빈 스냅샷이 수신되더라도 기존 학생·처방 데이터를 절대 지우지 않습니다.
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
    </div>
  );
};
