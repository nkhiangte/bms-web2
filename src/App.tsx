
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import { User, Student, Staff, TcRecord, ServiceCertificateRecord, FeeStructure, AdmissionSettings, NotificationType, Grade, GradeDefinition, SubjectAssignment, FeePayments, Exam, Syllabus, Homework, Notice, CalendarEvent, DailyStudentAttendance, StudentAttendanceRecord, StaffAttendanceRecord, InventoryItem, HostelResident, HostelStaff, HostelInventoryItem, StockLog, HostelDisciplineEntry, ChoreRoster, ConductEntry, ExamRoutine, DailyRoutine, NewsItem, OnlineAdmission, FeeHead } from './types';
import { DEFAULT_ADMISSION_SETTINGS, DEFAULT_FEE_STRUCTURE, GRADE_DEFINITIONS, FEE_SET_GRADES } from './constants';
import { db, auth, firebase } from './firebaseConfig';

// Page Imports
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ParentSignUpPage from './pages/ParentSignUpPage';
import ParentRegistrationPage from './pages/ParentRegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import StudentListPage from './pages/StudentListPage';
import StudentDetailPage from './pages/StudentDetailPage';
import ClassListPage from './pages/ClassListPage';
import ClassStudentsPage from './pages/ClassStudentsPage';
import StaffAttendancePage from './pages/StaffAttendancePage';
import StaffAttendanceLogPage from './pages/StaffAttendanceLogPage';
import ManageStaffPage from './pages/ManageStaffPage';
import StaffDetailPage from './pages/StaffDetailPage';
import StaffDocumentsPage from './pages/StaffDocumentsPage';
import GenerateServiceCertificatePage from './pages/GenerateServiceCertificatePage';
import PrintServiceCertificatePage from './pages/PrintServiceCertificatePage';
import FeesPage from './pages/public/FeesPage';
import PortalFeesPage from './pages/FeeManagementPage';
import AdmissionPaymentPage from './pages/public/AdmissionPaymentPage';
import TransferManagementPage from './pages/TransferManagementPage';
import GenerateTcPage from './pages/GenerateTcPage';
import TcRecordsPage from './pages/TcRecordsPage';
import PrintTcPage from './pages/PrintTcPage';
import InventoryPage from './pages/InventoryPage';
import HostelDashboardPage from './pages/HostelDashboardPage';
import HostelStudentListPage from './pages/HostelStudentListPage';
import HostelRoomListPage from './pages/HostelRoomListPage';
import HostelChoreRosterPage from './pages/HostelChoreRosterPage';
import HostelFeePage from './pages/HostelFeePage';
import HostelAttendancePage from './pages/HostelAttendancePage';
import HostelMessPage from './pages/HostelMessPage';
import HostelStaffPage from './pages/HostelStaffPage';
import HostelInventoryPage from './pages/HostelInventoryPage';
import HostelDisciplinePage from './pages/HostelDisciplinePage';
import HostelHealthPage from './pages/HostelHealthPage';
import HostelCommunicationPage from './pages/HostelCommunicationPage';
import HostelSettingsPage from './pages/HostelSettingsPage';
import CalendarPage from './pages/CalendarPage';
import CommunicationPage from './pages/CommunicationPage';
import ManageNoticesPage from './pages/ManageNoticesPage';
import NewsPage from './pages/public/NewsPage';
import ManageNewsPage from './pages/ManageNewsPage';
import UserProfilePage from './pages/UserProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import { UserManagementPage } from './pages/UserManagementPage';
import AdminPage from './pages/AdminPage';
import PromotionPage from './pages/PromotionPage';
import { ManageSubjectsPage } from './pages/ManageSubjectsPage';
import SitemapEditorPage from './pages/SitemapEditorPage';
import PublicHomePage from './pages/public/PublicHomePage';
import AboutPage from './pages/public/AboutPage';
import HistoryPage from './pages/public/HistoryPage';
import FacultyPage from './pages/public/FacultyPage';
import RulesPage from './pages/public/RulesPage';
import AdmissionsPage from './pages/public/AdmissionsPage';
import OnlineAdmissionPage from './pages/public/OnlineAdmissionPage';
import AdmissionStatusPage from './pages/public/AdmissionStatusPage';
import SuppliesPage from './pages/public/SuppliesPage';
import StudentLifePage from './pages/public/StudentLifePage';
import NccPage from './pages/public/NccPage';
import ArtsCulturePage from './pages/public/ArtsCulturePage';
import EcoClubPage from './pages/public/EcoClubPage';
import ScienceClubPage from './pages/public/ScienceClubPage';
import SlsmeePage from './pages/public/SlsmeePage';
import InspireAwardPage from './pages/public/InspireAwardPage';
import NcscPage from './pages/public/NcscPage';
import ScienceTourPage from './pages/public/ScienceTourPage';
import IncentiveAwardsPage from './pages/public/IncentiveAwardsPage';
import MathematicsCompetitionPage from './pages/public/MathematicsCompetitionPage';
import QuizPage from './pages/public/QuizPage';
import AchievementsPage from './pages/public/AchievementsPage';
import AcademicAchievementsPage from './pages/public/AcademicAchievementsPage';
import DistinctionHoldersPage from './pages/public/DistinctionHoldersPage';
import SportsPage from './pages/public/SportsPage';
import FacilitiesPage from './pages/public/FacilitiesPage';
import InfrastructurePage from './pages/public/InfrastructurePage';
import GalleryPage from './pages/public/GalleryPage';
import ContactPage from './pages/public/ContactPage';
import SitemapPage from './pages/public/SitemapPage';
import SitemapXmlPage from './pages/public/SitemapXmlPage';
import AcademicPerformancePage from './pages/AcademicPerformancePage';
import ReportSearchPage from './pages/ReportSearchPage';
import ClassMarkStatementPage from './pages/ClassMarkStatementPage';
import BulkProgressReportPage from './pages/BulkProgressReportPage';
import ProgressReportPage from './pages/ProgressReportPage';
import RoutinePage from './pages/public/RoutinePage';
import ExamSelectionPage from './pages/ExamSelectionPage';
import ExamClassSelectionPage from './pages/ExamClassSelectionPage';
import AdmissionSettingsPage from './pages/AdmissionSettingsPage';
import ParentDashboardPage from './pages/ParentDashboardPage';
import HomeworkScannerPage from './pages/HomeworkScannerPage';
import ActivityLogPage from './pages/ActivityLogPage';
import InsightsPage from './pages/InsightsPage';
import SchoolSettingsPage from './pages/SchoolSettingsPage';
import ManageHomeworkPage from './pages/ManageHomeworkPage';
import ManageSyllabusPage from './pages/ManageSyllabusPage';
import ParentsManagementPage from './pages/ParentsManagementPage';
import PublicStaffDetailPage from './pages/public/PublicStaffDetailPage';
import StudentAttendancePage from './pages/StudentAttendancePage';
import StudentAttendanceLogPage from './pages/StudentAttendanceLogPage';
import SyllabusPage from './pages/public/SyllabusPage';
import OnlineAdmissionsListPage from './pages/OnlineAdmissionsListPage';
import HostelPage from './pages/public/HostelPage';
import AcademicsPage from './pages/public/AcademicsPage';
import CurriculumPage from './pages/public/CurriculumPage';

import NotificationContainer from './components/NotificationContainer';
import OfflineIndicator from './components/OfflineIndicator';
import { SpinnerIcon } from './components/Icons';

const { Routes, Route, Navigate, useLocation, useNavigate } = ReactRouterDOM as any;

const App: React.FC = () => {
  // --- State Declarations ---
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [onlineAdmissions, setOnlineAdmissions] = useState<OnlineAdmission[]>([]);
  
  // Configuration
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [feeStructure, setFeeStructure] = useState<FeeStructure>(DEFAULT_FEE_STRUCTURE);
  const [admissionSettings, setAdmissionSettings] = useState<AdmissionSettings>(DEFAULT_ADMISSION_SETTINGS);
  const [schoolConfig, setSchoolConfig] = useState({ paymentQRCodeUrl: '', upiId: '' });
  const [gradeDefinitions, setGradeDefinitions] = useState<Record<Grade, GradeDefinition>>(GRADE_DEFINITIONS);
  
  // Data Records
  const [tcRecords, setTcRecords] = useState<TcRecord[]>([]);
  const [serviceCerts, setServiceCerts] = useState<ServiceCertificateRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [syllabus, setSyllabus] = useState<Syllabus[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [examRoutines, setExamRoutines] = useState<ExamRoutine[]>([]);
  const [classRoutines, setClassRoutines] = useState<Record<string, DailyRoutine>>({});
  
  // Hostel Data
  const [hostelResidents, setHostelResidents] = useState<HostelResident[]>([]);
  const [hostelStaff, setHostelStaff] = useState<HostelStaff[]>([]);
  const [hostelInventory, setHostelInventory] = useState<HostelInventoryItem[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [disciplineLog, setDisciplineLog] = useState<HostelDisciplineEntry[]>([]);
  const [choreRoster, setChoreRoster] = useState<ChoreRoster>({} as ChoreRoster);
  
  // Other Logs
  const [conductLog, setConductLog] = useState<ConductEntry[]>([]);
  const [attendance, setAttendance] = useState<DailyStudentAttendance>({} as DailyStudentAttendance);
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceRecord>({});

  const [notifications, setNotifications] = useState<{ id: string; message: string; type: NotificationType; title?: string; }[]>([]);

  // Derived state for current user
  const assignedGrade: Grade | null = useMemo(() => {
    if (!user) return null;
    const staffMember = staff.find(s => s.emailAddress === user.email);
    if (!staffMember) return null;
    const entry = Object.entries(gradeDefinitions).find(([, def]: [string, GradeDefinition]) => def.classTeacherId === staffMember.id);
    return entry ? (entry[0] as Grade) : null;
  }, [user, staff, gradeDefinitions]);

  const assignedSubjects: SubjectAssignment[] = useMemo(() => {
    if (!user) return [];
    const staffMember = staff.find(s => s.emailAddress === user.email);
    return staffMember?.assignedSubjects || [];
  }, [user, staff]);

  const pendingAdmissionsCount = onlineAdmissions.filter(a => a.status === 'pending').length;
  const pendingParentCount = users.filter(u => u.role === 'pending_parent').length;
  const pendingStaffCount = users.filter(u => u.role === 'pending').length;

  const addNotification = (message: string, type: NotificationType, title?: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type, title }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- Auth Handlers ---
  const handleLogin = async (email?: string, password?: string) => {
    if (!email || !password) return { success: false, message: "Credentials missing" };
    try {
        await auth.signInWithEmailAndPassword(email, password);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
  };
  
  const handleGoogleSignIn = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
  };

  // --- Data Update Handlers ---
  const handleUpdateFeePayments = async (studentId: string, payments: FeePayments) => {
      await db.collection('students').doc(studentId).update({ feePayments: payments });
  };
  
  const handleUpdateBulkFeePayments = async (updates: Array<{ studentId: string; payments: FeePayments }>) => {
      const batch = db.batch();
      updates.forEach(({ studentId, payments }) => {
          const ref = db.collection('students').doc(studentId);
          batch.update(ref, { feePayments: payments });
      });
      await batch.commit();
  };
  
  const onUpdateFeeStructure = async (newStructure: FeeStructure) => {
      try {
          const sanitized = JSON.parse(JSON.stringify(newStructure));
          await db.collection('config').doc('feeStructure').set(sanitized);
          return true;
      } catch (error) {
          console.error("Firestore update failed for feeStructure:", error);
          throw error;
      }
  };

  const handleUpdateAcademic = async (studentId: string, performance: Exam[]) => {
      await db.collection('students').doc(studentId).update({ academicPerformance: performance });
  };
  
  const handleUpdateGradeDefinition = async (grade: Grade, newDefinition: GradeDefinition) => {
      const newDefs = { ...gradeDefinitions, [grade]: newDefinition };
      await db.collection('config').doc('gradeDefinitions').set(newDefs);
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
            try {
                const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
                if (userDoc.exists) {
                    setUser({ uid: firebaseUser.uid, ...userDoc.data() } as User);
                } else {
                    const newUser: User = { uid: firebaseUser.uid, email: firebaseUser.email || '', displayName: firebaseUser.displayName || 'User', role: 'user' };
                    setUser(newUser);
                }
            } catch (error) {
                console.error("Error fetching user session:", error);
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Public Data & Real-time Config Listeners
  useEffect(() => {
    const unsubNews = db.collection('news').onSnapshot(s => setNews(s.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem))));
    const unsubExamRoutines = db.collection('examRoutines').onSnapshot(s => setExamRoutines(s.docs.map(d => ({ id: d.id, ...d.data() } as ExamRoutine))));
    const unsubClassRoutines = db.collection('classRoutines').onSnapshot(s => {
         const routines: Record<string, DailyRoutine> = {};
         s.docs.forEach(doc => routines[doc.id] = doc.data().routine as DailyRoutine);
         setClassRoutines(routines);
    });

    // Real-time School Settings
    const unsubSchoolSettings = db.collection('config').doc('schoolSettings').onSnapshot(doc => {
        if (doc.exists) setSchoolConfig(doc.data() as any);
    });

    // Real-time Fee Structure
    const unsubFeeStructure = db.collection('config').doc('feeStructure').onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data() || {};
            const migrateSet = (oldSet: any): { heads: FeeHead[] } => {
                let heads: FeeHead[] = [];
                if (oldSet && Array.isArray(oldSet.heads)) {
                    heads = oldSet.heads;
                } else {
                    // Old format migration
                    if (oldSet?.tuitionFee) heads.push({ id: 'tui', name: 'Tuition Fee (Monthly)', amount: Number(oldSet.tuitionFee), type: 'monthly' });
                    if (oldSet?.examFee) heads.push({ id: 'exam', name: 'Exam Fee (Per Term)', amount: Number(oldSet.examFee), type: 'term' });
                }
                
                // Actively filter out Admission Fee as requested across the board
                return { heads: heads.filter(h => h.id !== 'adm' && h.name !== 'Admission Fee') };
            };
            const updated = {
                set1: migrateSet(data.set1),
                set2: migrateSet(data.set2),
                set3: migrateSet(data.set3),
                gradeMap: data.gradeMap || FEE_SET_GRADES
            };
            setFeeStructure(updated as FeeStructure);
        }
    });

    // Real-time Admission Settings
    const unsubAdmSettings = db.collection('config').doc('admissionSettings').onSnapshot(doc => {
        if (doc.exists) setAdmissionSettings({ ...DEFAULT_ADMISSION_SETTINGS, ...doc.data() } as AdmissionSettings);
    });

    // Real-time Grade Definitions
    const unsubGradeDefs = db.collection('config').doc('gradeDefinitions').onSnapshot(doc => {
        if (doc.exists) setGradeDefinitions(doc.data() as any);
    });

    return () => {
        unsubNews();
        unsubExamRoutines();
        unsubClassRoutines();
        unsubSchoolSettings();
        unsubFeeStructure();
        unsubAdmSettings();
        unsubGradeDefs();
    };
  }, []);

  // Fetch Protected Data
  useEffect(() => {
    if (user) {
        db.collection('students').onSnapshot(s => setStudents(s.docs.map(d => ({ id: d.id, ...d.data() } as Student))));
        db.collection('staff').onSnapshot(s => setStaff(s.docs.map(d => ({ id: d.id, ...d.data() } as Staff))));
        db.collection('calendarEvents').onSnapshot(s => setCalendarEvents(s.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEvent))));
        db.collection('notices').onSnapshot(s => setNotices(s.docs.map(d => ({ id: d.id, ...d.data() } as Notice))));
        db.collection('homework').onSnapshot(s => setHomework(s.docs.map(d => ({ id: d.id, ...d.data() } as Homework))));
        db.collection('syllabus').onSnapshot(s => setSyllabus(s.docs.map(d => ({ id: d.id, ...d.data() } as Syllabus))));
        db.collection('conductLog').onSnapshot(s => setConductLog(s.docs.map(d => ({ id: d.id, ...d.data() } as ConductEntry))));
        
        if (['admin', 'warden', 'user'].includes(user.role)) {
            db.collection('online_admissions').onSnapshot(s => setOnlineAdmissions(s.docs.map(d => ({ id: d.id, ...d.data() } as OnlineAdmission))));
            db.collection('users').onSnapshot(s => setUsers(s.docs.map(d => ({ uid: d.id, ...d.data() } as User))));
            db.collection('inventory').onSnapshot(s => setInventory(s.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem))));
            db.collection('tcRecords').onSnapshot(s => setTcRecords(s.docs.map(d => ({ id: d.id, ...d.data() } as TcRecord))));
            db.collection('serviceCertificates').onSnapshot(s => setServiceCerts(s.docs.map(d => ({ id: d.id, ...d.data() } as ServiceCertificateRecord))));
        }

        if (['admin', 'warden'].includes(user.role)) {
            db.collection('hostelResidents').onSnapshot(s => setHostelResidents(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelResident))));
            db.collection('hostelStaff').onSnapshot(s => setHostelStaff(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelStaff))));
            db.collection('hostelInventory').onSnapshot(s => setHostelInventory(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelInventoryItem))));
            db.collection('stockLogs').onSnapshot(s => setStockLogs(s.docs.map(d => ({ id: d.id, ...d.data() } as StockLog))));
            db.collection('hostelDisciplineLog').onSnapshot(s => setDisciplineLog(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelDisciplineEntry))));
            db.collection('choreRoster').doc('current').onSnapshot(d => d.exists && setChoreRoster(d.data() as ChoreRoster));
        }
    }
  }, [user]);

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://bmscpi.netlify.app/</loc></url></urlset>`;

  return (
    <>
      <OfflineIndicator />
      <NotificationContainer notifications={notifications} onDismiss={removeNotification} />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout user={user} />}>
          <Route index element={<PublicHomePage news={news} user={user} />} />
          <Route path="about" element={<AboutPage user={user} />} />
          <Route path="history" element={<HistoryPage user={user} />} />
          <Route path="faculty" element={<FacultyPage staff={staff} gradeDefinitions={gradeDefinitions} user={user} />} />
          <Route path="staff/:staffId" element={<PublicStaffDetailPage staff={staff} gradeDefinitions={gradeDefinitions} />} />
          <Route path="rules" element={<RulesPage user={user} />} />
          <Route path="admissions" element={<AdmissionsPage user={user} />} />
          <Route path="admissions/online" element={<OnlineAdmissionPage user={user} onOnlineAdmissionSubmit={async (data) => (await db.collection('online_admissions').add(data)).id} />} />
          <Route path="admissions/status" element={<AdmissionStatusPage user={user} />} />
          <Route path="admissions/payment/:admissionId" element={<AdmissionPaymentPage user={user} onUpdateAdmissionPayment={async (id, u) => { await db.collection('online_admissions').doc(id).update(u); return true; }} addNotification={addNotification} schoolConfig={schoolConfig} admissionConfig={admissionSettings} />} />
          <Route path="fees" element={<FeesPage user={user} feeStructure={feeStructure} students={students} academicYear={academicYear} onUpdateFeePayments={handleUpdateFeePayments} addNotification={addNotification} />} />
          <Route path="supplies" element={<SuppliesPage user={user} />} />
          <Route path="student-life" element={<StudentLifePage user={user} />} />
          <Route path="ncc" element={<NccPage user={user} />} />
          <Route path="arts-culture" element={<ArtsCulturePage user={user} />} />
          <Route path="eco-club" element={<EcoClubPage user={user} />} />
          <Route path="academics" element={<AcademicsPage user={user} />} />
          <Route path="academics/curriculum" element={<CurriculumPage gradeDefinitions={gradeDefinitions} />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="achievements/academic" element={<AcademicAchievementsPage />} />
          <Route path="achievements/academic/distinction-holders/:year" element={<DistinctionHoldersPage />} />
          <Route path="achievements/sports" element={<SportsPage />} />
          <Route path="achievements/science" element={<ScienceClubPage />} />
          <Route path="achievements/science/slsmee" element={<SlsmeePage />} />
          <Route path="achievements/science/inspire-award" element={<InspireAwardPage />} />
          <Route path="achievements/science/ncsc" element={<NcscPage />} />
          <Route path="achievements/science/science-tour" element={<ScienceTourPage />} />
          <Route path="achievements/science/incentive-awards" element={<IncentiveAwardsPage />} />
          <Route path="achievements/science/mathematics-competition" element={<MathematicsCompetitionPage />} />
          <Route path="achievements/quiz" element={<QuizPage />} />
          <Route path="facilities" element={<FacilitiesPage user={user} />} />
          <Route path="infrastructure" element={<InfrastructurePage user={user} />} />
          <Route path="hostel" element={<HostelPage user={user} />} /> 
          <Route path="gallery" element={<GalleryPage user={user} />} />
          <Route path="contact" element={<ContactPage user={user} />} />
          <Route path="routine" element={<RoutinePage examSchedules={examRoutines} classSchedules={classRoutines} user={user} />} />
          <Route path="news" element={<NewsPage news={news} user={user} />} />
          <Route path="sitemap" element={<SitemapPage />} />
        </Route>

        <Route path="/sitemap.xml" element={<SitemapXmlPage sitemapContent={sitemapContent} />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin} onGoogleSignIn={handleGoogleSignIn} error="" notification="" />} />
        <Route path="/signup" element={<SignUpPage onSignUp={async (n, e, p) => { try { const c = await auth.createUserWithEmailAndPassword(e, p); if(c.user) { await c.user.updateProfile({ displayName: n }); await db.collection('users').doc(c.user.uid).set({ displayName: n, email: e, role: 'pending' }); return { success: true, message: "Awaiting approval." }; } return { success: false }; } catch(err: any) { return { success: false, message: err.message }; }}} />} />
        <Route path="/parent-registration" element={<ParentRegistrationPage />} />
        <Route path="/parent-signup" element={<ParentSignUpPage onSignUp={async () => ({ success: true })} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage onForgotPassword={async (e) => { try { await auth.sendPasswordResetEmail(e); return { success: true }; } catch(err: any) { return { success: false, message: err.message }; }}} />} />
        <Route path="/reset-password" element={<ResetPasswordPage onResetPassword={async () => ({ success: true })} />} />

        {/* Protected Portal Routes */}
        <Route path="/portal" element={
            authLoading 
            ? <div className="min-h-screen flex items-center justify-center bg-slate-50"><SpinnerIcon className="w-10 h-10 text-sky-600 animate-spin"/></div>
            : (user ? <DashboardLayout user={user} onLogout={handleLogout} students={students} staff={staff} tcRecords={tcRecords} serviceCerts={serviceCerts} academicYear={academicYear} /> : <Navigate to="/login" replace />)
        }>
           <Route path="dashboard" element={<DashboardPage user={user!} studentCount={students.length} academicYear={academicYear} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} calendarEvents={calendarEvents} pendingAdmissionsCount={pendingAdmissionsCount} pendingParentCount={pendingParentCount} pendingStaffCount={pendingStaffCount} onUpdateAcademicYear={async () => {}} />} />
           <Route path="parent-dashboard" element={<ParentDashboardPage user={user!} allStudents={students} onLinkChild={async (c) => { await db.collection('users').doc(user!.uid).update({ claimedStudents: firebase.firestore.FieldValue.arrayUnion(c) }); }} currentAttendance={null} news={news} staff={staff} gradeDefinitions={gradeDefinitions} homework={homework} syllabus={syllabus} onSendMessage={async (m) => { await db.collection('parentMessages').add(m); return true; }} fetchStudentAttendanceForMonth={async () => ({})} feeStructure={feeStructure} />} />
           <Route path="admin" element={<AdminPage pendingAdmissionsCount={pendingAdmissionsCount} pendingParentCount={pendingParentCount} pendingStaffCount={pendingStaffCount} />} />
           <Route path="profile" element={<UserProfilePage currentUser={user!} onUpdateProfile={async (u) => { await db.collection('users').doc(user!.uid).update(u); return { success: true }; }} />} />
           <Route path="change-password" element={<ChangePasswordPage onChangePassword={async (c, n) => { try { const cr = firebase.auth.EmailAuthProvider.credential(user!.email, c); await auth.currentUser?.reauthenticateWithCredential(cr); await auth.currentUser?.updatePassword(n); return { success: true }; } catch(err: any) { return { success: false, message: err.message }; }}} />} />
           <Route path="students" element={<StudentListPage students={students} onAdd={() => {}} onEdit={() => {}} academicYear={academicYear} user={user!} assignedGrade={assignedGrade} />} />
           <Route path="student/:studentId" element={<StudentDetailPage students={students} onEdit={() => {}} academicYear={academicYear} user={user!} assignedGrade={assignedGrade} feeStructure={feeStructure} conductLog={conductLog} hostelDisciplineLog={disciplineLog} onAddConductEntry={async (e) => { await db.collection('conductLog').add(e); return true; }} onDeleteConductEntry={async (id) => { await db.collection('conductLog').doc(id).delete(); }} />} />
           <Route path="student/:studentId/academics" element={<AcademicPerformancePage students={students} onUpdateAcademic={handleUpdateAcademic} gradeDefinitions={gradeDefinitions} academicYear={academicYear} user={user!} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} />} />
           <Route path="student/:studentId/attendance-log" element={<StudentAttendanceLogPage students={students} fetchStudentAttendanceForMonth={async () => ({})} user={user!} calendarEvents={calendarEvents} />} />
           <Route path="classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={() => {}} user={user!} />} />
           <Route path="classes/:grade" element={<ClassStudentsPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateClassTeacher={(g, tid) => handleUpdateGradeDefinition(g, { ...gradeDefinitions[g], classTeacherId: tid })} academicYear={academicYear} onOpenImportModal={() => {}} onDelete={async (s) => { await db.collection('students').doc(s.id).update({ status: 'Deleted' }); }} user={user!} assignedGrade={assignedGrade} onAddStudentToClass={() => {}} onUpdateBulkFeePayments={handleUpdateBulkFeePayments} feeStructure={feeStructure} />} />
           <Route path="classes/:grade/attendance" element={<StudentAttendancePage students={students} allAttendance={null} onUpdateAttendance={async (g, d, r) => { await db.collection('studentAttendance').doc(d).set({ [g]: r }, { merge: true }); }} user={user!} fetchStudentAttendanceForMonth={async () => ({})} fetchStudentAttendanceForRange={async () => ({})} academicYear={academicYear} assignedGrade={assignedGrade} calendarEvents={calendarEvents} />} />
           <Route path="staff" element={<ManageStaffPage staff={staff} gradeDefinitions={gradeDefinitions} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} user={user!} />} />
           <Route path="staff/attendance" element={<StaffAttendancePage user={user!} staff={staff} attendance={null} onMarkAttendance={() => {}} fetchStaffAttendanceForMonth={async () => ({})} fetchStaffAttendanceForRange={async () => ({})} academicYear={academicYear} calendarEvents={calendarEvents} />} />
           <Route path="staff/attendance-logs" element={<StaffAttendanceLogPage staff={staff} students={students} gradeDefinitions={gradeDefinitions} fetchStaffAttendanceForMonth={async () => ({})} fetchStaffAttendanceForRange={async () => ({})} academicYear={academicYear} user={user!} calendarEvents={calendarEvents} />} />
           <Route path="staff/:staffId" element={<StaffDetailPage staff={staff} onEdit={() => {}} gradeDefinitions={gradeDefinitions} />} />
           <Route path="staff/certificates" element={<StaffDocumentsPage serviceCertificateRecords={serviceCerts} user={user!} />} />
           <Route path="staff/certificates/generate" element={<GenerateServiceCertificatePage staff={staff} onSave={async (r) => { await db.collection('serviceCertificates').add(r); }} user={user!} />} />
           <Route path="staff/certificates/print/:certId" element={<PrintServiceCertificatePage serviceCertificateRecords={serviceCerts} />} />
           <Route path="fees" element={<PortalFeesPage students={students} academicYear={academicYear} onUpdateFeePayments={handleUpdateFeePayments} user={user!} feeStructure={feeStructure} onUpdateFeeStructure={onUpdateFeeStructure} addNotification={addNotification} />} />
           <Route path="transfers" element={<TransferManagementPage />} />
           <Route path="transfers/generate" element={<GenerateTcPage students={students} tcRecords={tcRecords} academicYear={academicYear} onGenerateTc={async (tc) => { await db.collection('tcRecords').add(tc); return true; }} isSaving={false} />} />
           <Route path="transfers/generate/:studentId" element={<GenerateTcPage students={students} tcRecords={tcRecords} academicYear={academicYear} onGenerateTc={async (tc) => { await db.collection('tcRecords').add(tc); return true; }} isSaving={false} />} />
           <Route path="transfers/records" element={<TcRecordsPage tcRecords={tcRecords} />} />
           <Route path="transfers/print/:tcId" element={<PrintTcPage tcRecords={tcRecords} />} />
           <Route path="inventory" element={<InventoryPage inventory={inventory} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} user={user!} />} />
           <Route path="hostel-dashboard" element={<HostelDashboardPage disciplineLog={disciplineLog} />} />
           <Route path="hostel/students" element={<HostelStudentListPage residents={hostelResidents} students={students} onAdd={() => {}} onAddById={async () => ({ success: true })} onEdit={() => {}} onDelete={() => {}} user={user!} academicYear={academicYear} />} />
           <Route path="hostel/rooms" element={<HostelRoomListPage residents={hostelResidents} students={students} />} />
           <Route path="hostel/chores" element={<HostelChoreRosterPage user={user!} students={students} residents={hostelResidents} choreRoster={choreRoster} onUpdateChoreRoster={async (r) => { await db.collection('choreRoster').doc('current').set(r); }} academicYear={academicYear} />} />
           <Route path="hostel/fees" element={<HostelFeePage />} />
           <Route path="hostel/attendance" element={<HostelAttendancePage />} />
           <Route path="hostel/mess" element={<HostelMessPage />} />
           <Route path="hostel/staff" element={<HostelStaffPage staff={hostelStaff} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} user={user!} />} />
           <Route path="hostel/inventory" element={<HostelInventoryPage inventory={hostelInventory} stockLogs={stockLogs} onUpdateStock={() => {}} user={user!} />} />
           <Route path="hostel/discipline" element={<HostelDisciplinePage user={user!} students={students} residents={hostelResidents} disciplineLog={disciplineLog} onSave={async (e) => { await db.collection('hostelDisciplineLog').add(e); }} onDelete={() => {}} academicYear={academicYear} />} />
           <Route path="hostel/health" element={<HostelHealthPage />} />
           <Route path="hostel/communication" element={<HostelCommunicationPage />} />
           <Route path="hostel/settings" element={<HostelSettingsPage />} />
           <Route path="calendar" element={<CalendarPage events={calendarEvents} user={user!} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} notificationDaysBefore={-1} onUpdatePrefs={() => {}} />} />
           <Route path="communication" element={<CommunicationPage students={students} user={user!} />} />
           <Route path="manage-notices" element={<ManageNoticesPage user={user!} allNotices={notices} onSave={async (n) => { await db.collection('notices').add(n); }} onDelete={async (id) => { await db.collection('notices').doc(id).delete(); }} />} />
           <Route path="news-management" element={<ManageNewsPage news={news} user={user!} onSave={async (i, id) => { if (id) { await db.collection('news').doc(id).update(i); } else { await db.collection('news').add(i); } }} onDelete={async (id) => { await db.collection('news').doc(id).delete(); }} />} />
           <Route path="users" element={<UserManagementPage allUsers={users} currentUser={user!} onUpdateUserRole={(uid, role) => db.collection('users').doc(uid).update({ role })} onDeleteUser={(uid) => db.collection('users').doc(uid).delete()} />} />
           <Route path="parents" element={<ParentsManagementPage allUsers={users} students={students} academicYear={academicYear} currentUser={user!} onDeleteUser={(uid) => db.collection('users').doc(uid).delete()} onUpdateUser={async (uid, d) => { await db.collection('users').doc(uid).update(d); }} />} />
           <Route path="promotion" element={<PromotionPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear} onPromoteStudents={async () => {}} user={user!} />} />
           <Route path="subjects" element={<ManageSubjectsPage gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} user={user!} onResetAllMarks={async () => {}} />} />
           <Route path="sitemap-editor" element={<SitemapEditorPage initialContent={sitemapContent} onSave={async () => {}} />} />
           <Route path="reports/academics" element={<ReportSearchPage students={students} academicYear={academicYear} />} />
           <Route path="reports/class/:grade/:examId" element={<ClassMarkStatementPage students={students} academicYear={academicYear} user={user!} gradeDefinitions={gradeDefinitions} onUpdateAcademic={handleUpdateAcademic} onUpdateGradeDefinition={handleUpdateGradeDefinition} />} />
           <Route path="reports/bulk-print/:grade/:examId" element={<BulkProgressReportPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} academicYear={academicYear} />} />
           <Route path="progress-report/:studentId/:examId" element={<ProgressReportPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} academicYear={academicYear} />} />
           <Route path="routine" element={<RoutinePage examSchedules={examRoutines} classSchedules={classRoutines} user={user!} onSaveExamRoutine={async (r, id) => { if (id) { await db.collection('examRoutines').doc(id).update(r); } else { await db.collection('examRoutines').add(r); } return true; }} onDeleteExamRoutine={async (r) => { await db.collection('examRoutines').doc(r.id).delete(); }} onUpdateClassRoutine={async (day, routine) => { await db.collection('classRoutines').doc(day).set({ routine }); }} />} />
           <Route path="exams" element={<ExamSelectionPage />} />
           <Route path="exams/:examId" element={<ExamClassSelectionPage gradeDefinitions={gradeDefinitions} staff={staff} user={user!} />} />
           <Route path="admission-settings" element={<AdmissionSettingsPage admissionConfig={admissionSettings} onUpdateConfig={async (c) => { await db.collection('config').doc('admissionSettings').set(c); return true; }} />} />
           <Route path="admissions" element={<OnlineAdmissionsListPage admissions={onlineAdmissions} onUpdateStatus={async (id, s) => { await db.collection('online_admissions').doc(id).update({ status: s }); }} onDelete={async (id) => { await db.collection('online_admissions').doc(id).delete(); }} />} />
           <Route path="homework-scanner" element={<HomeworkScannerPage />} />
           <Route path="activity-log" element={<ActivityLogPage students={students} user={user!} gradeDefinitions={gradeDefinitions} academicYear={academicYear} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onBulkUpdateActivityLogs={async () => {}} />} />
           <Route path="manage-homework" element={<ManageHomeworkPage user={user!} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onSave={async (hw) => { await db.collection('homework').add(hw); }} onDelete={async (id) => { await db.collection('homework').doc(id).delete(); }} allHomework={homework} />} />
           <Route path="manage-syllabus" element={<ManageSyllabusPage user={user!} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onSave={async (syl, id) => { await db.collection('syllabus').doc(id).set(syl); }} allSyllabus={syllabus} gradeDefinitions={gradeDefinitions} />} />
           <Route path="syllabus/:grade" element={<SyllabusPage syllabus={syllabus} gradeDefinitions={gradeDefinitions} />} />
           <Route path="insights" element={<InsightsPage students={students} gradeDefinitions={gradeDefinitions} conductLog={conductLog} user={user!} />} />
           <Route path="settings" element={<SchoolSettingsPage config={schoolConfig} onUpdate={async (c) => { await db.collection('config').doc('schoolSettings').set(c, { merge: true }); setSchoolConfig(prev => ({ ...prev, ...c })); return true; }} />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;--- START OF FILE src/components/Sidebar.tsx ---

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User } from '../types';
// FIX: Added 'AcademicCapIcon' and 'CalendarDaysIcon' to the import list to resolve a 'Cannot find name' error.
import { HomeIcon, UsersIcon, BookOpenIcon, BriefcaseIcon, CurrencyDollarIcon, DocumentReportIcon, ArchiveBoxIcon, BuildingOfficeIcon, UserGroupIcon, CalendarDaysIcon, MegaphoneIcon, XIcon, ClipboardDocumentListIcon, CogIcon, SparklesIcon, AcademicCapIcon, TransferIcon, UserIcon } from './Icons';

const { NavLink, Link } = ReactRouterDOM as any;

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    user: User;
}

const portalNavLinks = [
    { name: 'Portal Home', path: '/portal/dashboard', parentPath: '/portal/parent-dashboard', icon: <HomeIcon className="w-5 h-5" />, roles: ['admin', 'user', 'parent', 'pending', 'warden', 'pending_parent'] },
    { name: 'Admin Panel', path: '/portal/admin', icon: <CogIcon className="w-5 h-5" />, roles: ['admin'] },
    { name: 'My Profile', path: '/portal/profile', icon: <UserIcon className="w-5 h-5" />, roles: ['admin', 'user', 'parent', 'warden'] },
    { name: 'Students', path: '/portal/students', icon: <UsersIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Classes', path: '/portal/classes', icon: <BookOpenIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Academics & Reports', path: '/portal/reports/academics', icon: <AcademicCapIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'AI Insights', path: '/portal/insights', icon: <SparklesIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Homework Scanner', path: '/portal/homework-scanner', icon: <SparklesIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Activity Log', path: '/portal/activity-log', icon: <ClipboardDocumentListIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Manage Homework', path: '/portal/manage-homework', icon: <BookOpenIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Manage Syllabus', path: '/portal/manage-syllabus', icon: <BookOpenIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Class Routine', path: '/portal/routine', icon: <BookOpenIcon className="w-5 h-5" />, roles: ['admin', 'user', 'parent', 'pending', 'warden'] },
    { name: 'Attendance Log', path: '/portal/student/:studentId/attendance-log', icon: <CalendarDaysIcon className="w-5 h-5"/>, roles: ['parent'] },
    { name: 'Staff', path: '/portal/staff', icon: <BriefcaseIcon className="w-5 h-5" />, roles: ['user'] },
    { name: 'Teacher Attendance', path: '/portal/staff/attendance-logs', icon: <CalendarDaysIcon className="w-5 h-5"/>, roles: ['admin', 'user'] },
    { name: 'Fees', path: '/portal/fees', icon: <CurrencyDollarIcon className="w-5 h-5" />, roles: ['admin', 'user', 'parent'] },
    { name: 'Transfers', path: '/portal/transfers', icon: <TransferIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Inventory', path: '/portal/inventory', icon: <ArchiveBoxIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Hostel', path: '/portal/hostel-dashboard', icon: <BuildingOfficeIcon className="w-5 h-5" />, roles: ['admin', 'user', 'warden'] },
    { name: 'Chore Roster', path: '/portal/hostel/chores', icon: <ClipboardDocumentListIcon className="w-5 h-5" />, roles: ['admin', 'warden'] },
    { name: 'Communication', path: '/portal/communication', icon: <MegaphoneIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Manage Notice Board', path: '/portal/manage-notices', icon: <MegaphoneIcon className="w-5 h-5" />, roles: ['admin', 'user'] },
    { name: 'Calendar', path: '/portal/calendar', icon: <CalendarDaysIcon className="w-5 h-5" />, roles: ['admin', 'user', 'parent'] },
];

const publicNavLinks = [
    { name: 'Website Home', path: '/' },
    { name: 'Latest News & Announcements', path: '/news' },
    { name: 'About Us', path: '/about' },
    { name: 'Academics', path: '/academics' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Fees', path: '/fees' },
    { name: 'Student Life', path: '/student-life' },
    { name: 'Facilities', path: '/facilities' },
    { name: 'Faculty', path: '/faculty' },
    { name: 'Supplies', path: '/supplies' },
    { name: 'Contact Us', path: '/contact' },
];

const NavItem: React.FC<{ to: string, children: React.ReactNode, end?: boolean }> = ({ to, children, end = false }) => {
    const activeClass = "bg-sky-100 text-sky-700";
    const inactiveClass = "text-slate-600 hover:bg-slate-200 hover:text-slate-900";
    return (
        <NavLink to={to} end={end} className={({ isActive }: any) => `${isActive ? activeClass : inactiveClass} group flex items-center px-3 py-2 text-sm font-semibold rounded-md`}>
            {children}
        </NavLink>
    );
};

const SidebarContent: React.FC<{user: User, onLinkClick?: () => void}> = ({ user, onLinkClick }) => (
    <div className="flex flex-col flex-grow bg-slate-50 border-r border-slate-200 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
             <img src="https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png" alt="Bethel Mission School Logo" className="h-10" />
              <span className="ml-3 text-lg font-bold text-slate-800">BMS Portal</span>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1" aria-label="Sidebar">
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Portal Menu</h3>
                {portalNavLinks
                    .filter(link => link.roles.includes(user.role))
                    .map(item => {
                        let path = item.path;

                        // Handle parent-specific paths
                        if (user.role === 'parent') {
                            if ((item as any).parentPath) {
                                path = (item as any).parentPath;
                            } else if (item.name === 'Attendance Log') {
                                // Only show this link if the parent has exactly ONE child.
                                if (user.studentIds && user.studentIds.length === 1) {
                                    path = `/portal/student/${user.studentIds[0]}/attendance-log`;
                                } else {
                                    // If 0 or >1 children, don't render this sidebar item.
                                    // They can access logs from the parent dashboard.
                                    return null;
                                }
                            }
                        } 
                        // Handle warden-specific path
                        else if (user.role === 'warden' && item.name === 'Portal Home') {
                            path = '/portal/hostel-dashboard';
                        }
                        
                        return (
                            <div key={item.name} onClick={onLinkClick}>
                                <NavItem to={path} end={path.endsWith('dashboard') || item.path.includes(':studentId/attendance-log') || item.path.endsWith('/profile') || path.endsWith('/admin')}>
                                    {item.icon}
                                    <span className="ml-3">{item.name}</span>
                                </NavItem>
                            </div>
                        );
                    })}
            </nav>
            <nav className="mt-6 flex-1 px-2 space-y-1">
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Website Content (Edit)</h3>
                {publicNavLinks.map(item => (
                    <Link key={item.name} to={item.path} onClick={onLinkClick} className="text-slate-600 hover:bg-slate-200 hover:text-slate-900 group flex items-center px-3 py-2 text-sm font-semibold rounded-md">
                        <span className="truncate">{item.name}</span>
                    </Link>
                ))}
            </nav>
        </div>
    </div>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, user }) => {
    return (
        <>
            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0 print-hidden">
                <div className="flex flex-col w-64">
                    <SidebarContent user={user} />
                </div>
            </div>

            {/* Mobile sidebar */}
            <div className={`fixed inset-0 flex z-40 lg:hidden print-hidden transition-opacity ease-linear duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} role="dialog" aria-modal="true">
                {/* Overlay */}
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setIsOpen(false)}></div>
                
                <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-slate-50 transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button type="button" className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setIsOpen(false)}>
                            <span className="sr-only">Close sidebar</span>
                            <XIcon className="h-6 w-6 text-white" />
                        </button>
                    </div>
                    <SidebarContent user={user} onLinkClick={() => setIsOpen(false)}/>
                </div>
                <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
            </div>
        </>
    );
};

export default Sidebar;--- START OF FILE src/layouts/DashboardLayout.tsx ---

import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, Student, Staff, TcRecord, ServiceCertificateRecord } from '../types';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';

const { Outlet, useLocation } = ReactRouterDOM as any;

interface DashboardLayoutProps {
    user: User;
    onLogout: () => void;
    students: Student[];
    staff: Staff[];
    tcRecords: TcRecord[];
    serviceCerts: ServiceCertificateRecord[];
    academicYear: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, students, staff, tcRecords, serviceCerts, academicYear }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const isParentDashboard = location.pathname === '/portal/parent-dashboard';

    return (
        <div className="relative flex h-screen print:h-auto print:block">
            {isParentDashboard && (
                <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-sky-100 via-rose-50 to-amber-100"></div>
            )}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} />
            <div className={`flex-1 flex flex-col overflow-hidden print:overflow-visible print:h-auto print:block ${isParentDashboard ? '' : 'bg-slate-100'}`}>
                <Header 
                    user={user} 
                    onLogout={onLogout} 
                    onToggleSidebar={() => setIsSidebarOpen(v => !v)} 
                    className={`print-hidden ${isParentDashboard ? 'bg-white/80 backdrop-blur-sm' : 'bg-white'}`}
                />
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 print:overflow-visible print:h-auto print:p-0">
                    {!isParentDashboard && <Breadcrumbs 
                        students={students}
                        staff={staff}
                        tcRecords={tcRecords}
                        serviceCerts={serviceCerts}
                        academicYear={academicYear}
                    />}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;--- START OF FILE src/components/Breadcrumbs.tsx ---


import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Staff, TcRecord, ServiceCertificateRecord, Grade } from '../types';
import { HomeIcon, ChevronRightIcon } from './Icons';

const { Link, useLocation } = ReactRouterDOM as any;

interface BreadcrumbsProps {
  students: Student[];
  staff: Staff[];
  tcRecords: TcRecord[];
  serviceCerts: ServiceCertificateRecord[];
  academicYear: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ students, staff, tcRecords, serviceCerts, academicYear }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x && x !== 'portal');

  const nameMapping: Record<string, string> = {
    'students': 'Students',
    'classes': 'Classes',
    'staff': 'Staff',
    'fees': 'Fee Management',
    'inventory': 'Inventory',
    'transfers': 'Transfer Management',
    'hostel-dashboard': 'Hostel Dashboard',
    'hostel': 'Hostel',
    'calendar': 'Calendar',
    'communication': 'Communication',
    'change-password': 'Change Password',
    'routine': 'Routine',
    'reports': 'Reports',
    'academics': 'Academics',
    'insights': 'AI Insights',
    'homework-scanner': 'Homework Scanner',
    'activity-log': 'Activity Log',
    'news-management': 'News Management',
    'users': 'User Management',
    'promotion': 'Promotion',
    'subjects': 'Manage Subjects',
    'sitemap-editor': 'Sitemap Editor',
    'attendance-logs': 'Attendance Logs',
    'certificates': 'Certificates',
    'generate': 'Generate',
    'print': 'Print',
    'records': 'Records',
    'bulk-print': 'Bulk Print'
  };

  const breadcrumbs = pathnames.map((value, index) => {
    const to = `/portal/${pathnames.slice(0, index + 1).join('/')}`;
    const isLast = index === pathnames.length - 1;

    let name = nameMapping[value] || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
    let isLink = !isLast;

    const prevSegment = index > 0 ? pathnames[index - 1] : null;
    try {
        if (prevSegment === 'student') {
            const student = students.find(s => s.id === value);
            name = student ? student.name : 'Student Detail';
        } else if (prevSegment === 'classes' || prevSegment === 'bulk-print') {
            name = decodeURIComponent(value);
        } else if (prevSegment === 'staff' && staff.some(s => s.id === value)) {
            const staffMember = staff.find(s => s.id === value);
            name = staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'Staff Detail';
        } else if (prevSegment === 'print' && pathnames.includes('transfers')) {
            const record = tcRecords.find(r => r.id === value);
            name = record ? `TC: ${record.nameOfStudent}` : 'Print TC';
        } else if (prevSegment === 'print' && pathnames.includes('certificates')) {
            const record = serviceCerts.find(r => r.id === value);
            name = record ? `Cert: ${record.staffDetails.name}` : 'Print Certificate';
        }
    } catch(e) {
        console.error("Error resolving breadcrumb name:", e);
    }
    
    // The "Student" part of a URL like /student/:id should not be a link
    if (value.toLowerCase() === 'student' && pathnames[index + 1]) {
        isLink = false;
    }

    return isLink ? (
      <Link key={to} to={to} className="text-sky-600 hover:underline">{name}</Link>
    ) : (
      <span key={to} className="font-semibold text-slate-800" aria-current="page">{name}</span>
    );
  });

  if (pathnames.length === 0 || pathnames[0] === 'dashboard' || pathnames[0] === 'parent-dashboard') {
    return null; // Don't show on the main dashboard pages
  }

  return (
    <nav className="mb-6 flex items-center gap-2 text-sm print-hidden" aria-label="Breadcrumb">
      <Link to="/portal/dashboard" className="text-slate-500 hover:text-sky-600" title="Go to Dashboard">
        <HomeIcon className="w-5 h-5" />
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          <ChevronRightIcon className="w-4 h-4 text-slate-400" />
          {crumb}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;--- START OF FILE src/components/Header.tsx ---


import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User } from '../types';
import { ChevronDownIcon, LogoutIcon, KeyIcon, SyncIcon, UserIcon } from './Icons';
import PhotoWithFallback from './PhotoWithFallback';

const { Link } = ReactRouterDOM as any;

interface HeaderProps {
    user: User;
    onLogout: () => void;
    onToggleSidebar: () => void;
    className?: string;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onToggleSidebar, className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClearCache = () => {
    setIsMenuOpen(false);
    if (!window.confirm("This will clear all application caches and force a reload. This can help fix display issues. Are you sure you want to proceed?")) {
        return;
    }

    let unregistering: Promise<any> = Promise.resolve();
    if ('serviceWorker' in navigator) {
        unregistering = navigator.serviceWorker.getRegistrations().then(function(registrations) {
            return Promise.all(registrations.map(r => r.unregister()));
        });
    }

    unregistering.then(() => {
        return caches.keys();
    }).then(function(cacheNames) {
        return Promise.all(
            cacheNames.map(function(cacheName) {
                return caches.delete(cacheName);
            })
        );
    }).then(() => {
        alert("Cache and service workers cleared. The application will now perform a hard reload.");
        window.location.reload();
    }).catch(error => {
        console.error("Cache clearing failed:", error);
        alert("Could not clear cache. Please try clearing your browser's data manually.");
    });
  };

  return (
    <header className={`bg-white sticky top-0 z-20 shadow-sm border-b border-slate-200 ${className || ''}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center">
            {/* Mobile sidebar toggle */}
            <button
                type="button"
                className="mr-4 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 lg:hidden"
                onClick={onToggleSidebar}
            >
                <span className="sr-only">Open sidebar</span>
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <Link to="/portal/dashboard" title="Go to Dashboard" className="flex items-center gap-3">
                <img src="https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png" alt="Bethel Mission School Logo" className="h-10 sm:h-12" />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-800 hidden md:block uppercase">
                    Bethel Mission School
                  </h1>
                  <p className="text-xs text-slate-500 hidden md:block">Student Management Portal</p>
                </div>
            </Link>
        </div>

        <div className="relative">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
            >
                <div className="w-8 h-8">
                    <PhotoWithFallback src={user.photoURL || undefined} alt="User avatar" />
                </div>
                <span className="font-semibold text-slate-700 hidden sm:inline">Welcome, {user.displayName || user.email}</span>
                <ChevronDownIcon className={`w-5 h-5 text-slate-600 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMenuOpen && (
                <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 animate-fade-in"
                    onMouseLeave={() => setIsMenuOpen(false)}
                >
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <Link
                            to="/portal/profile"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                            role="menuitem"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <UserIcon className="w-5 h-5"/>
                            My Profile
                        </Link>
                        <Link
                            to="/portal/change-password"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                            role="menuitem"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <KeyIcon className="w-5 h-5"/>
                            Change Password
                        </Link>
                        <button
                            onClick={() => { onLogout(); setIsMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                            role="menuitem"
                        >
                            <LogoutIcon className="w-5 h-5"/>
                            Logout
                        </button>
                         {user.role === 'admin' && (
                            <>
                                <div className="my-1 border-t border-slate-200"></div>
                                <button
                                    onClick={handleClearCache}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                                    role="menuitem"
                                >
                                    <SyncIcon className="w-5 h-5"/>
                                    Clear Cache & Reload
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;--- START OF FILE src/index.tsx ---

import React from 'react';
import { createRoot } from 'react-dom/client';
import * as ReactRouterDOM from 'react-router-dom';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Service worker registration has been removed.
// The sw.js file was not being served correctly (404 error), causing critical
// caching issues for users with an old, "stuck" service worker.
// A robust unregister script in index.html now automatically clears these
// old service workers from users' browsers on page load.

const { BrowserRouter } = ReactRouterDOM as any;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);--- START OF FILE src/index.css ---

@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}
:root {
  --primary: #0ea5e9; /* sky-500 */
  --primary-dark: #0284c7; /* sky-600 */
  --primary-light: #f0f9ff; /* sky-50 */
  --secondary: #f59e0b; /* amber-500 */
  --success: #10b981; /* emerald-500 */
  --danger: #ef4444; /* red-500 */
  --warning: #f97316; /* orange-500 */
  --info: #6366f1; /* indigo-500 */
  --light: #f8fafc; /* slate-50 */
  --dark: #1e293b; /* slate-800 */
  --body-bg: #bae6fd; /* deeper light blue */
  --body-bg-light: #e0f2fe; /* light blue for scrollbar track */
  --card-bg: #ffffff;
  --text-main: #0f172a; /* slate-900 */
  --text-muted: #64748b; /* slate-500 */
  --border-color: #e2e8f0; /* slate-200 */
}

/* Brighter Scrollbar */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: var(--body-bg-light);
}
::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 5px;
  border: 2px solid var(--body-bg-light);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

/* Base button style */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
.btn-primary {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}
.btn-primary:hover {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
}
.btn-secondary {
  background-color: var(--card-bg);
  color: var(--text-main);
  border-color: var(--border-color);
}
.btn-secondary:hover {
  background-color: var(--light);
  border-color: #cbd5e1;
}

/* General component styles */
.card {
  background-color: var(--card-bg);
  border-radius: 0.75rem; /* 12px */
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  transition: all 0.3s ease;
}
.card:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

input[type=text], input[type=email], input[type=password], input[type=tel], input[type=number], input[type=date], select, textarea {
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  transition: border-color 0.2s, box-shadow 0.2s;
}
input:focus, select:focus, textarea:focus {
  --tw-ring-color: var(--primary);
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 2px var(--primary-light) !important;
}

/* Hide number input spinners */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield; /* Firefox */
}

/* --- News Ticker --- */
.news-ticker-container {
  overflow: hidden;
  display: flex;
}
.news-ticker-content {
  display: flex;
  white-space: nowrap;
  animation: scroll-news 40s linear infinite;
}
@keyframes scroll-news {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.news-ticker-container:hover .news-ticker-content {
  animation-play-state: paused;
}

/* --- Dropdown styles --- */
.dropdown .dropdown-content {
  display: none;
  position: absolute;
  background-color: #ffffff;
  min-width: 220px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.1);
  z-index: 1;
  border-radius: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  animation: fadeIn 0.2s ease-out;
  border: 1px solid var(--border-color);
}
.dropdown:hover .dropdown-content {
  display: block;
}
.dropdown-content a {
  color: var(--text-main);
  padding: 0.6rem 1.25rem;
  text-decoration: none;
  display: block;
  text-align: left;
  font-weight: 500;
}
.dropdown-content a:hover {
  background-color: var(--primary-light);
  color: var(--primary-dark);
}

/* --- Print Styles --- */
@media print {
  .print-hidden {
      display: none !important;
  }
  .print-visible {
      display: block !important;
  }
  /* Reset container heights/overflows to allow printing all pages */
  html, body, #root {
    height: auto !important;
    overflow: visible !important;
    min-height: auto !important;
  }
  
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    background-color: white !important;
  }
  #mark-statement-container {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
  }
  #mark-statement-table {
    font-size: 8pt;
    border-collapse: collapse;
    width: 100%;
  }
  #mark-statement-table th, #mark-statement-table td {
    padding: 2px 4px;
    border: 1px solid #999;
    white-space: nowrap;
  }
  #mark-statement-table .sticky {
    position: static !important;
    background-color: white !important;
  }
  #mark-statement-table input, #mark-statement-table select {
    display: none;
  }
  #mark-statement-table .print-value {
    display: inline !important;
  }

  @page {
    size: A4 landscape;
    margin: 1cm;
  }
}

.print-value {
    display: none;
}
.A4-size {
    width: 21cm;
    height: 29.7cm;
    margin-left: auto;
    margin-right: auto;
}

@media print {
    .A4-size {
        width: 100%;
        height: auto;
        margin: 0;
        padding: 1cm;
    }
}

.page-break {
  page-break-after: always;
}

.page-break-inside-avoid {
    page-break-inside: avoid;
}

.printable-area {
  display: none;
}

@media print {
  .printable-area {
    display: block;
  }
  
  /* Additional print styles for specific pages if needed */
  .print-hidden {
    display: none !important;
  }
  
}--- START OF FILE src/layouts/PublicLayout.tsx ---


import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import { User } from '../types';

const { Outlet } = ReactRouterDOM as any;

interface PublicLayoutProps {
    user: User | null;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ user }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <PublicHeader user={user} />
            <main className="flex-grow">
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
};
export default PublicLayout;```