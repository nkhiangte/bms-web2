import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import { User, Student, Staff, TcRecord, ServiceCertificateRecord, FeeStructure, AdmissionSettings, NotificationType, Grade, GradeDefinition, SubjectAssignment, FeePayments, Exam, Syllabus, Homework, Notice, CalendarEvent, DailyStudentAttendance, StudentAttendanceRecord, StaffAttendanceRecord, InventoryItem, HostelResident, HostelStaff, HostelInventoryItem, StockLog, HostelDisciplineEntry, ChoreRoster, ConductEntry, ExamRoutine, DailyRoutine, NewsItem, OnlineAdmission, FeeHead, FeeSet, BloodGroup } from './types';
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
import AdmissionPaymentPage from './pages/public/AdmissionPaymentPage';
import TransferManagementPage from './pages/TransferManagementPage';
import { GenerateTcPage } from './pages/GenerateTcPage';
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
import SchoolSettingsPage from './pages/SchoolSettingsPage';
import ManageHomeworkPage from './pages/ManageHomeworkPage';
import ManageSyllabusPage from './pages/ManageSyllabusPage';
import { ParentsManagementPage } from './pages/ParentsManagementPage';
import PublicStaffDetailPage from './pages/public/PublicStaffDetailPage';
import StudentAttendancePage from './pages/StudentAttendancePage';
import StudentAttendanceLogPage from './pages/StudentAttendanceLogPage';
import SyllabusPage from './pages/public/SyllabusPage';
import OnlineAdmissionsListPage from './pages/OnlineAdmissionsListPage';
import HostelPage from './pages/public/HostelPage';
import AcademicsPage from './pages/public/AcademicsPage';
import CurriculumPage from './pages/public/CurriculumPage';
import FeeManagementPage from './pages/FeeManagementPage';
import FeesPage from './pages/public/FeesPage';
// Fix: Use PascalCase import and suppression for potential redundant file casing conflict error
// @ts-ignore
import InsightsPage from './pages/InsightsPage';

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
  const [choreRoster, setChoreRoster] = useState({} as ChoreRoster);
  
  // Other Logs
  const [conductLog, setConductLog] = useState<ConductEntry[]>([]);
  const [attendance, setAttendance] = useState({} as DailyStudentAttendance);
  const [staffAttendance, setStaffAttendance] = useState({} as StaffAttendanceRecord);

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

  const handleUpdateAcademic = async (studentId: string, performance: Exam[]) => {
      await db.collection('students').doc(studentId).update({ academicPerformance: performance });
  };
  
  const handleUpdateGradeDefinition = async (grade: Grade, newDefinition: GradeDefinition) => {
      const newDefs = { ...gradeDefinitions, [grade]: newDefinition };
      await db.collection('config').doc('gradeDefinitions').set(newDefs);
  };

  const handleUpdateFeeStructure = async (newStructure: FeeStructure) => {
      try {
          await db.collection('config').doc('feeStructure').set(newStructure);
          return true;
      } catch (error) {
          console.error("Error updating fee structure:", error);
          return false;
      }
  };

  const handleEnrollStudent = async (admissionId: string, studentData: Omit<Student, 'id'>) => {
      try {
          const batch = db.batch();
          
          // 1. Create the student document
          const studentRef = db.collection('students').doc();
          batch.set(studentRef, { 
              ...studentData, 
              status: 'Active'
          });

          // 2. Update the admission record
          const admissionRef = db.collection('online_admissions').doc(admissionId);
          batch.update(admissionRef, {
              status: 'approved',
              isEnrolled: true,
              temporaryStudentId: studentData.studentId // Store the permanent ID
          });

          await batch.commit();
          addNotification(`Student ${studentData.name} enrolled successfully with ID ${studentData.studentId}!`, 'success', 'Enrollment Complete');
      } catch (error) {
          console.error("Enrollment failed:", error);
          addNotification("Failed to enroll student. Please check database permissions.", 'error', 'Enrollment Failed');
          throw error;
      }
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

    // Real-time Fee Structure with Safety Migration
    const unsubFeeStructure = db.collection('config').doc('feeStructure').onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data() || {};
            const migrateSet = (oldSet: any): FeeSet => {
                if (oldSet && Array.isArray(oldSet.heads)) return oldSet;
                // Basic migration for legacy flat data if any
                const heads: FeeHead[] = [];
                if (oldSet?.tuitionFee) heads.push({ id: 'tui', name: 'Tuition Fee (Monthly)', amount: Number(oldSet.tuitionFee), type: 'monthly' });
                if (oldSet?.examFee) heads.push({ id: 'exam', name: 'Exam Fee (Per Term)', amount: Number(oldSet.examFee), type: 'term' });
                return { heads };
            };
            const updated: FeeStructure = {
                set1: migrateSet(data.set1),
                set2: migrateSet(data.set2),
                set3: migrateSet(data.set3),
                gradeMap: data.gradeMap || FEE_SET_GRADES
            };
            setFeeStructure(updated);
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
          <Route path="admissions/online" element={<OnlineAdmissionPage user={user} onOnlineAdmissionSubmit={async (data, id) => {
              // Sanitize data for Firestore: convert undefined to null
              const sanitizedData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [key, value === undefined ? null : value])
              );

              if (id) {
                  // Saving an existing draft or submitting a completed draft
                  await db.collection('online_admissions').doc(id).set(sanitizedData, { merge: true });
                  return id;
              } else {
                  // Creating a new application
                  const docRef = db.collection('online_admissions').doc();
                  const customId = `BMSAPP${docRef.id}`; // Using a distinct prefix for applications
                  const admissionData = { ...sanitizedData, id: customId, temporaryStudentId: customId, submissionDate: new Date().toISOString() };
                  await db.collection('online_admissions').doc(customId).set(admissionData);
                  return customId;
              }
          }} />} />
          <Route path="admissions/status" element={<AdmissionStatusPage user={user} />} />
          <Route path="admissions/payment/:admissionId" element={<AdmissionPaymentPage user={user} addNotification={addNotification} admissionConfig={admissionSettings} schoolConfig={schoolConfig} />} />
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
          <Route path="fees" element={<FeesPage students={students} feeStructure={feeStructure} admissionSettings={admissionSettings} onUpdateFeePayments={handleUpdateFeePayments} academicYear={academicYear} addNotification={addNotification} user={user} />} />
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
           <Route path="admissions" element={<OnlineAdmissionsListPage admissions={onlineAdmissions} onUpdateStatus={async (id, s) => { await db.collection('online_admissions').doc(id).update({ status: s }); }} onDelete={async (id) => { await db.collection('online_admissions').doc(id).delete(); }} onEnrollStudent={handleEnrollStudent} academicYear={academicYear} />} />
           <Route path="homework-scanner" element={<HomeworkScannerPage />} />
           <Route path="activity-log" element={<ActivityLogPage students={students} user={user!} gradeDefinitions={gradeDefinitions} academicYear={academicYear} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onBulkUpdateActivityLogs={async () => {}} />} />
           <Route path="manage-homework" element={<ManageHomeworkPage user={user!} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onSave={async (hw) => { await db.collection('homework').add(hw); }} onDelete={async (id) => { await db.collection('homework').doc(id).delete(); }} allHomework={homework} />} />
           <Route path="manage-syllabus" element={<ManageSyllabusPage user={user!} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onSave={async (syl, id) => { await db.collection('syllabus').doc(id).set(syl); }} allSyllabus={syllabus} gradeDefinitions={gradeDefinitions} />} />
           <Route path="syllabus/:grade" element={<SyllabusPage syllabus={syllabus} gradeDefinitions={gradeDefinitions} />} />
           <Route path="insights" element={<InsightsPage students={students} gradeDefinitions={gradeDefinitions} conductLog={conductLog} user={user!} />} />
           <Route path="settings" element={<SchoolSettingsPage config={schoolConfig} onUpdate={async (c) => { await db.collection('config').doc('schoolSettings').set(c, { merge: true }); setSchoolConfig(prev => ({ ...prev, ...c })); return true; }} />} />
           <Route path="fees" element={<FeeManagementPage students={students} academicYear={academicYear} onUpdateFeePayments={handleUpdateFeePayments} user={user!} feeStructure={feeStructure} onUpdateFeeStructure={handleUpdateFeeStructure} addNotification={addNotification} schoolConfig={schoolConfig} />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;