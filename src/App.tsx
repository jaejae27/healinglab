import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from './services/storage';
import { Student, Visit, AssessmentResult } from './types';
import { StudentLogin } from './components/student/StudentLogin';
import { StudentHeader } from './components/student/StudentHeader';
import { StudentHome } from './components/student/StudentHome';
import { DiagnosisFlow } from './components/student/DiagnosisFlow';
import { DoneForm } from './components/student/DoneForm';
import { MyPage } from './components/student/MyPage';
import { BottomNav, StudentTab } from './components/student/BottomNav';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { MindCardModal } from './components/modals/MindCardModal';
import { WorryGachaModal } from './components/modals/WorryGachaModal';
import { NewMedicineModal } from './components/modals/NewMedicineModal';
import { PrivacyConsentModal } from './components/modals/PrivacyConsentModal';
import { AssessmentModal } from './components/modals/AssessmentModal';
import { WorkbookPrintView } from './components/print/WorkbookPrintView';
import { PortfolioPrintView } from './components/print/PortfolioPrintView';
import { HealyCharacter } from './components/character/HealyCharacter';
import { Sparkles } from 'lucide-react';
import { checkDoneFormEligibility } from './utils/doneFormEligibility';
import { TeacherAuthModal } from './components/modals/TeacherAuthModal';
import { AppFooter } from './components/common/AppFooter';

export default function App() {
  const [, setSyncTick] = useState(0);

  // Initialize database and subscribe to cloud updates
  useEffect(() => {
    StorageService.init();
    const unsub = StorageService.subscribe(() => {
      setCurrentStudent((prev) => {
        if (!prev) return null;
        return StorageService.getStudentById(prev.id) || prev;
      });
      setSyncTick((t) => t + 1);
    });
    return () => unsub();
  }, []);

  // Mode: 'student' | 'teacher' | 'print_workbook' | 'print_portfolio'
  const [appMode, setAppMode] = useState<
    'student' | 'teacher' | 'print_workbook' | 'print_portfolio'
  >('student');

  // Teacher Authentication state (mandatory password gate)
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(false);
  const [isTeacherAuthModalOpen, setIsTeacherAuthModalOpen] = useState<boolean>(false);

  // Currently logged-in student
  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    const id = StorageService.getCurrentStudentId();
    if (!id) return null;
    return StorageService.getStudentById(id) || null;
  });

  // Current student tab
  const [studentTab, setStudentTab] = useState<StudentTab>('home');

  // Modals state
  const [isFortuneOpen, setIsFortuneOpen] = useState(false);
  const [isWorryGachaOpen, setIsWorryGachaOpen] = useState(false);
  const [isNewMedicineOpen, setIsNewMedicineOpen] = useState(false);
  const [isPostTestOpen, setIsPostTestOpen] = useState(false);

  // Derived onboarding modal states
  const isPrivacyConsentOpen = !!currentStudent && !currentStudent.privacyConsent?.agreed;
  const isPreTestOpen =
    !!currentStudent &&
    !!currentStudent.privacyConsent?.agreed &&
    !currentStudent.preTest?.completed;

  // Print state
  const [printConditionIds, setPrintConditionIds] = useState<string[]>(['A-06']);

  // Selected visit for DoneForm
  const [selectedDoneVisit, setSelectedDoneVisit] = useState<Visit | null>(null);

  // Active visit
  const activeVisit = useMemo(() => {
    if (!currentStudent) return null;
    return StorageService.getActiveVisitForStudent(currentStudent.id) || null;
  }, [currentStudent, studentTab]);

  const isDoneEligible = useMemo(() => {
    if (!activeVisit) return false;
    return checkDoneFormEligibility(activeVisit).canOpen;
  }, [activeVisit]);

  // Visit for DoneForm (preserves visit even after status becomes rewarded)
  const visitForDone = useMemo(() => {
    if (selectedDoneVisit) return selectedDoneVisit;
    if (activeVisit) return activeVisit;
    if (!currentStudent) return null;
    const visits = StorageService.getVisitsForStudent(currentStudent.id);
    return visits.find((v) => v.status === 'rewarded' && v.submittedAt) || visits[0] || null;
  }, [selectedDoneVisit, activeVisit, currentStudent, studentTab]);

  // Login handler
  const handleLogin = (student: Student) => {
    setCurrentStudent(student);
    setStudentTab('home');
  };

  // Privacy agreement handler
  const handlePrivacyAgreed = () => {
    if (!currentStudent) return;
    StorageService.savePrivacyConsent(currentStudent.id);
    const updated = StorageService.getStudentById(currentStudent.id);
    if (updated) setCurrentStudent(updated);
  };

  // Pre-test completion handler
  const handlePreTestComplete = (result: AssessmentResult) => {
    if (!currentStudent) return;
    StorageService.savePreTest(currentStudent.id, result);
    const updated = StorageService.getStudentById(currentStudent.id);
    if (updated) setCurrentStudent(updated);
  };

  // Post-test completion handler
  const handlePostTestComplete = (result: AssessmentResult) => {
    if (!currentStudent) return;
    StorageService.savePostTest(currentStudent.id, result);
    const updated = StorageService.getStudentById(currentStudent.id);
    if (updated) setCurrentStudent(updated);
    setIsPostTestOpen(false);
  };

  // Logout / Switch student
  const handleLogout = () => {
    StorageService.setCurrentStudentId(null);
    setCurrentStudent(null);
    setStudentTab('home');
  };

  // Print Workbook
  const handleViewWorkbookPrint = (conditionIds: string | string[]) => {
    if (Array.isArray(conditionIds)) {
      setPrintConditionIds(conditionIds);
    } else {
      setPrintConditionIds([conditionIds]);
    }
    setAppMode('print_workbook');
  };

  // Print Portfolio
  const handleViewPortfolioPrint = () => {
    setAppMode('print_portfolio');
  };

  // Refresh student profile after cookie spend/earn
  const handleStudentUpdated = (updated: Student) => {
    setCurrentStudent(updated);
  };

  // 1. TEACHER MODE (Mandatory Password Authenticated)
  if (appMode === 'teacher') {
    if (!isTeacherAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <TeacherAuthModal
            isOpen={true}
            onClose={() => setAppMode('student')}
            onSuccess={() => setIsTeacherAuthenticated(true)}
          />
        </div>
      );
    }

    return (
      <TeacherDashboard
        onSwitchToStudent={() => {
          setIsTeacherAuthenticated(false);
          setAppMode('student');
        }}
        onPrintWorkbook={handleViewWorkbookPrint}
      />
    );
  }

  // 2. WORKBOOK PRINT VIEW
  if (appMode === 'print_workbook') {
    return (
      <WorkbookPrintView
        conditionIds={printConditionIds}
        onBack={() => setAppMode(isTeacherAuthenticated ? 'teacher' : 'student')}
      />
    );
  }

  // 3. PORTFOLIO PRINT VIEW
  if (appMode === 'print_portfolio' && currentStudent) {
    return (
      <PortfolioPrintView
        student={currentStudent}
        onBack={() => setAppMode('student')}
      />
    );
  }

  // 4. STUDENT NOT LOGGED IN -> Login screen
  if (!currentStudent) {
    return (
      <>
        <StudentLogin
          onLogin={handleLogin}
          onSwitchToTeacher={() => setIsTeacherAuthModalOpen(true)}
        />
        <TeacherAuthModal
          isOpen={isTeacherAuthModalOpen}
          onClose={() => setIsTeacherAuthModalOpen(false)}
          onSuccess={() => {
            setIsTeacherAuthenticated(true);
            setAppMode('teacher');
          }}
        />
      </>
    );
  }

  // 5. STUDENT APPLICATION
  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#4A4A4A] flex flex-col font-sans antialiased selection:bg-[#FED7AA] relative overflow-x-hidden">
      {/* Subtle Artistic Blur Accents */}
      <div className="fixed top-12 left-10 w-80 h-80 bg-[#D1FAE5] rounded-full filter blur-3xl opacity-20 pointer-events-none" />
      <div className="fixed bottom-12 right-10 w-96 h-96 bg-[#FFEDD5] rounded-full filter blur-3xl opacity-25 pointer-events-none" />
      <div className="fixed top-1/3 right-1/4 w-72 h-72 bg-[#EDE9FE] rounded-full filter blur-3xl opacity-20 pointer-events-none" />

      {/* Student Top Header */}
      <StudentHeader
        student={currentStudent}
        onLogout={handleLogout}
        onOpenNewMedicine={() => setIsNewMedicineOpen(true)}
      />

      {/* Dynamic Screen Content */}
      <main className="flex-1 relative z-10">
        {studentTab === 'home' && (
          <StudentHome
            student={currentStudent}
            onStartDiagnosis={() => setStudentTab('diagnosis')}
            onOpenDoneForm={(v?: Visit) => {
              if (v) setSelectedDoneVisit(v);
              else if (activeVisit) setSelectedDoneVisit(activeVisit);
              setStudentTab('done');
            }}
            onOpenFortune={() => setIsFortuneOpen(true)}
            onOpenMindCard={() => setIsFortuneOpen(true)}
            onOpenWorryGacha={() => setIsWorryGachaOpen(true)}
            onOpenNewMedicine={() => setIsNewMedicineOpen(true)}
            onViewWorkbookPrint={handleViewWorkbookPrint}
            onGoToMyPage={() => setStudentTab('mypage')}
            onOpenPostTest={() => setIsPostTestOpen(true)}
            onStudentUpdated={() => {
              const u = StorageService.getStudentById(currentStudent.id);
              if (u) setCurrentStudent(u);
            }}
          />
        )}

        {studentTab === 'diagnosis' && (
          <DiagnosisFlow
            student={currentStudent}
            onFinish={() => setStudentTab('home')}
            onCancel={() => setStudentTab('home')}
            onOpenNewMedicine={() => setIsNewMedicineOpen(true)}
            onViewWorkbookPrint={handleViewWorkbookPrint}
          />
        )}

        {studentTab === 'done' && (
          <div>
            {visitForDone ? (
              <DoneForm
                student={currentStudent}
                visit={visitForDone}
                onSuccess={() => {
                  setSelectedDoneVisit(null);
                  setStudentTab('mypage');
                }}
                onBack={() => {
                  setSelectedDoneVisit(null);
                  setStudentTab('home');
                }}
                onStudentUpdated={() => {
                  const u = StorageService.getStudentById(currentStudent.id);
                  if (u) setCurrentStudent(u);
                }}
              />
            ) : (
              <div className="max-w-md mx-auto px-4 py-12 text-center">
                <div className="bg-white/80 border-4 border-white rounded-[40px] p-6 shadow-xl">
                  <HealyCharacter
                    emotion="thinking"
                    size="sm"
                    dialogue="지금 진행 중인 처방전이 없어!"
                    subDialogue="먼저 오늘의 마음 상태를 알아차려볼까?"
                  />
                  <button
                    onClick={() => setStudentTab('diagnosis')}
                    className="mt-5 bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 hover:from-amber-500 hover:to-pink-600 text-white font-jua text-sm px-6 py-3 rounded-2xl shadow-lg border-2 border-white flex items-center gap-2 mx-auto transition-transform active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-100" />
                    <span>새로운 마음 처방전 발급받기</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {studentTab === 'mypage' && (
          <MyPage
            student={currentStudent}
            onPrintPortfolio={handleViewPortfolioPrint}
            onGoToHome={() => setStudentTab('home')}
            onOpenWorryGacha={() => setIsWorryGachaOpen(true)}
            onRefreshStudent={() => {
              if (currentStudent) {
                const u = StorageService.getStudentById(currentStudent.id);
                if (u) setCurrentStudent(u);
              }
            }}
          />
        )}

        {/* Developer & Instagram Credit Footer */}
        <div className="pb-16">
          <AppFooter className="bg-transparent border-t border-amber-900/10" />
        </div>
      </main>

      {/* Interactive Modals */}
      <MindCardModal
        student={currentStudent}
        isOpen={isFortuneOpen}
        onClose={() => setIsFortuneOpen(false)}
      />

      <WorryGachaModal
        student={currentStudent}
        isOpen={isWorryGachaOpen}
        onClose={() => setIsWorryGachaOpen(false)}
        onGoToMindRecord={() => {
          setIsWorryGachaOpen(false);
          setStudentTab('mypage');
        }}
      />

      <NewMedicineModal
        student={currentStudent}
        isOpen={isNewMedicineOpen}
        onClose={() => setIsNewMedicineOpen(false)}
        onStudentUpdated={() => {
          if (currentStudent) {
            const u = StorageService.getStudentById(currentStudent.id);
            if (u) setCurrentStudent(u);
          }
        }}
      />

      {/* Mandatory Privacy & Data Collection Consent on First Login */}
      <PrivacyConsentModal
        isOpen={isPrivacyConsentOpen}
        student={currentStudent}
        onAgree={handlePrivacyAgreed}
      />

      {/* Pre-Evaluation Modal (Automatic on first login after privacy consent) */}
      <AssessmentModal
        isOpen={isPreTestOpen}
        type="pre"
        student={currentStudent}
        onSubmit={handlePreTestComplete}
        onClose={() => {}}
      />

      {/* Post-Evaluation Modal (Triggered when teacher activates post-test) */}
      <AssessmentModal
        isOpen={isPostTestOpen}
        type="post"
        student={currentStudent}
        onSubmit={handlePostTestComplete}
        onClose={() => setIsPostTestOpen(false)}
      />

      {/* Teacher Authentication Modal when clicked from student mode */}
      <TeacherAuthModal
        isOpen={isTeacherAuthModalOpen}
        onClose={() => setIsTeacherAuthModalOpen(false)}
        onSuccess={() => {
          setIsTeacherAuthenticated(true);
          setAppMode('teacher');
        }}
      />

      {/* Persistent Student Bottom Navigation */}
      <BottomNav
        currentTab={studentTab}
        onChangeTab={(tab) => setStudentTab(tab)}
        hasActiveVisit={!!activeVisit}
        isDoneEligible={isDoneEligible}
      />
    </div>
  );
}
