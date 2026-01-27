
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import { User, Student, Staff, TcRecord, ServiceCertificateRecord, FeeStructure, AdmissionSettings, NotificationType, Grade, GradeDefinition, SubjectAssignment, FeePayments, Exam, Syllabus, Homework, Notice, CalendarEvent, DailyStudentAttendance, StudentAttendanceRecord, StaffAttendanceRecord, InventoryItem, HostelResident, HostelStaff, HostelInventoryItem, StockLog, HostelDisciplineEntry, ChoreRoster, ConductEntry, ExamRoutine, DailyRoutine, NewsItem } from './types';
import { DEFAULT_ADMISSION_SETTINGS, DEFAULT_FEE_STRUCTURE, GRADE_DEFINITIONS } from './constants';

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
import FeesPage from './pages/public/FeesPage'; // Public fees page
import PortalFeesPage from './pages/FeeManagementPage'; // Portal fees page
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
import QuizPage from './pages/public/QuizPage'; // Club details
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

import NotificationContainer from './components/NotificationContainer';
import OfflineIndicator from './components/OfflineIndicator';

const { Routes, Route, Navigate, useLocation } = ReactRouterDOM as any;

const App: React.FC = () => {
  // --- State Declarations with Dummy Data/Defaults ---
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
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

  // Notifications
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: NotificationType; title?: string; }[]>([]);

  // Derived state for current user
  const assignedGrade: Grade | null = null; // Mock
  const assignedSubjects: SubjectAssignment[] = []; // Mock
  const pendingAdmissionsCount = 0; // Mock
  const pendingParentCount = 0; // Mock
  const pendingStaffCount = 0; // Mock

  const addNotification = (message: string, type: NotificationType, title?: string) => {
      const id = Date.now().toString();
      setNotifications(prev => [...prev, { id, message, type, title }]);
  };

  const removeNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogin = async (email?: string, password?: string) => {
    // In a real application, you would validate credentials here.
    // For this prototype/demo, we allow login and assign a role based on email.
    
    let role: User['role'] = 'admin'; // Default role
    if (email?.includes('parent')) role = 'parent';
    else if (email?.includes('user')) role = 'user';
    else if (email?.includes('warden')) role = 'warden';

    const mockUser: User = {
        uid: 'mock-user-123',
        email: email || 'admin@bms.edu',
        displayName: email ? email.split('@')[0] : 'Admin User',
        role: role,
        photoURL: '',
        studentIds: [], // Populate with dummy IDs if role is parent for demo
    };

    setUser(mockUser);
    return { success: true };
  };

  const handleLogout = () => setUser(null);
  const handleUpdateFeePayments = async () => {};
  const handleUpdateAcademic = async () => {};
  const handlePromoteStudents = async () => {};
  // ... other handlers would be defined here

  // Sitemap content (simplified)
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://bmscpi.netlify.app/</loc></url>
</urlset>`;

  return (
    <>
      <OfflineIndicator />
      <NotificationContainer notifications={notifications} onDismiss={removeNotification} />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<PublicHomePage news={news} />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="faculty" element={<FacultyPage staff={staff} gradeDefinitions={gradeDefinitions} />} />
          <Route path="staff/:staffId" element={<PublicStaffDetailPage staff={staff} gradeDefinitions={gradeDefinitions} />} />
          <Route path="rules" element={<RulesPage />} />
          <Route path="admissions" element={<AdmissionsPage />} />
          <Route path="admissions/online" element={<OnlineAdmissionPage onOnlineAdmissionSubmit={async () => "MOCK-ID"} />} />
          <Route path="admissions/status" element={<AdmissionStatusPage />} />
          <Route path="admissions/payment/:admissionId" element={<AdmissionPaymentPage onUpdateAdmissionPayment={async () => true} addNotification={addNotification} schoolConfig={schoolConfig} admissionConfig={admissionSettings} />} />
          <Route path="fees" element={<FeesPage user={user} feeStructure={feeStructure} students={students} academicYear={academicYear} onUpdateFeePayments={() => {}} addNotification={addNotification} />} />
          <Route path="supplies" element={<SuppliesPage />} />
          <Route path="student-life" element={<StudentLifePage />} />
          <Route path="ncc" element={<NccPage />} />
          <Route path="arts-culture" element={<ArtsCulturePage />} />
          <Route path="eco-club" element={<EcoClubPage />} />
          <Route path="achievements/science" element={<ScienceClubPage />} />
          <Route path="achievements/science/slsmee" element={<SlsmeePage />} />
          <Route path="achievements/science/inspire-award" element={<InspireAwardPage />} />
          <Route path="achievements/science/ncsc" element={<NcscPage />} />
          <Route path="achievements/science/science-tour" element={<ScienceTourPage />} />
          <Route path="achievements/science/incentive-awards" element={<IncentiveAwardsPage />} />
          <Route path="achievements/science/mathematics-competition" element={<MathematicsCompetitionPage />} />
          <Route path="achievements/quiz" element={<QuizPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="achievements/academic" element={<AcademicAchievementsPage />} />
          <Route path="achievements/academic/distinction-holders/:year" element={<DistinctionHoldersPage />} />
          <Route path="achievements/sports" element={<SportsPage />} />
          <Route path="facilities" element={<FacilitiesPage />} />
          <Route path="infrastructure" element={<InfrastructurePage />} />
          <Route path="hostel" element={<HostelDashboardPage disciplineLog={disciplineLog} />} /> {/* Public view of hostel info? Actually HostelPage for public */}
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="routine" element={<RoutinePage examSchedules={examRoutines} classSchedules={classRoutines} />} />
          <Route path="news" element={<NewsPage news={news} />} />
          <Route path="sitemap" element={<SitemapPage />} />
        </Route>

        <Route path="/sitemap.xml" element={<SitemapXmlPage sitemapContent={sitemapContent} />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin as any} onGoogleSignIn={handleLogin as any} error="" notification="" />} />
        <Route path="/signup" element={<SignUpPage onSignUp={async () => ({ success: true })} />} />
        <Route path="/parent-registration" element={<ParentRegistrationPage />} />
        <Route path="/parent-signup" element={<ParentSignUpPage onSignUp={async () => ({ success: true })} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage onForgotPassword={async () => ({ success: true })} />} />
        <Route path="/reset-password" element={<ResetPasswordPage onResetPassword={async () => ({ success: true })} />} />

        {/* Protected Portal Routes */}
        <Route path="/portal" element={user ? <DashboardLayout user={user} onLogout={handleLogout} students={students} staff={staff} tcRecords={tcRecords} serviceCerts={serviceCerts} academicYear={academicYear} /> : <Navigate to="/login" />}>
           <Route path="dashboard" element={<DashboardPage user={user!} studentCount={students.length} academicYear={academicYear} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} calendarEvents={calendarEvents} pendingAdmissionsCount={pendingAdmissionsCount} pendingParentCount={pendingParentCount} pendingStaffCount={pendingStaffCount} onUpdateAcademicYear={async () => {}} />} />
           
           <Route path="parent-dashboard" element={<ParentDashboardPage user={user!} allStudents={students} onLinkChild={async () => {}} currentAttendance={null} news={news} staff={staff} gradeDefinitions={gradeDefinitions} homework={homework} syllabus={syllabus} onSendMessage={async () => true} fetchStudentAttendanceForMonth={async () => ({})} feeStructure={feeStructure} />} />

           <Route path="admin" element={<AdminPage pendingAdmissionsCount={pendingAdmissionsCount} pendingParentCount={pendingParentCount} pendingStaffCount={pendingStaffCount} />} />
           <Route path="profile" element={<UserProfilePage currentUser={user!} onUpdateProfile={async () => ({ success: true })} />} />
           <Route path="change-password" element={<ChangePasswordPage onChangePassword={async () => ({ success: true })} />} />
           
           <Route path="students" element={<StudentListPage students={students} onAdd={() => {}} onEdit={() => {}} academicYear={academicYear} user={user!} assignedGrade={assignedGrade} />} />
           <Route path="student/:studentId" element={<StudentDetailPage students={students} onEdit={() => {}} academicYear={academicYear} user={user!} assignedGrade={assignedGrade} feeStructure={feeStructure} conductLog={conductLog} hostelDisciplineLog={disciplineLog} onAddConductEntry={async () => true} onDeleteConductEntry={async () => {}} />} />
           <Route path="student/:studentId/academics" element={<AcademicPerformancePage students={students} onUpdateAcademic={() => {}} gradeDefinitions={gradeDefinitions} academicYear={academicYear} user={user!} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} />} />
           <Route path="student/:studentId/attendance-log" element={<StudentAttendanceLogPage students={students} fetchStudentAttendanceForMonth={async () => ({})} user={user!} calendarEvents={calendarEvents} />} />

           <Route path="classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={() => {}} user={user!} />} />
           <Route path="classes/:grade" element={<ClassStudentsPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateClassTeacher={() => {}} academicYear={academicYear} onOpenImportModal={() => {}} onDelete={() => {}} user={user!} assignedGrade={assignedGrade} onAddStudentToClass={() => {}} onUpdateBulkFeePayments={async () => {}} feeStructure={feeStructure} />} />
           <Route path="classes/:grade/attendance" element={<StudentAttendancePage students={students} allAttendance={null} onUpdateAttendance={async () => {}} user={user!} fetchStudentAttendanceForMonth={async () => ({})} fetchStudentAttendanceForRange={async () => ({})} academicYear={academicYear} assignedGrade={assignedGrade} calendarEvents={calendarEvents} />} />

           <Route path="staff" element={<ManageStaffPage staff={staff} gradeDefinitions={gradeDefinitions} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} user={user!} />} />
           <Route path="staff/attendance" element={<StaffAttendancePage user={user!} staff={staff} attendance={null} onMarkAttendance={() => {}} fetchStaffAttendanceForMonth={async () => ({})} fetchStaffAttendanceForRange={async () => ({})} academicYear={academicYear} calendarEvents={calendarEvents} />} />
           <Route path="staff/attendance-logs" element={<StaffAttendanceLogPage staff={staff} students={students} gradeDefinitions={gradeDefinitions} fetchStaffAttendanceForMonth={async () => ({})} fetchStaffAttendanceForRange={async () => ({})} academicYear={academicYear} user={user!} calendarEvents={calendarEvents} />} />
           <Route path="staff/:staffId" element={<StaffDetailPage staff={staff} onEdit={() => {}} gradeDefinitions={gradeDefinitions} />} />
           <Route path="staff/certificates" element={<StaffDocumentsPage serviceCertificateRecords={serviceCerts} user={user!} />} />
           <Route path="staff/certificates/generate" element={<GenerateServiceCertificatePage staff={staff} onSave={() => {}} user={user!} />} />
           <Route path="staff/certificates/print/:certId" element={<PrintServiceCertificatePage serviceCertificateRecords={serviceCerts} />} />

           <Route path="fees" element={<PortalFeesPage students={students} academicYear={academicYear} onUpdateFeePayments={() => {}} user={user!} feeStructure={feeStructure} onUpdateFeeStructure={() => {}} addNotification={addNotification} />} />
           
           <Route path="transfers" element={<TransferManagementPage />} />
           <Route path="transfers/generate" element={<GenerateTcPage students={students} tcRecords={tcRecords} academicYear={academicYear} onGenerateTc={async () => true} isSaving={false} />} />
           <Route path="transfers/generate/:studentId" element={<GenerateTcPage students={students} tcRecords={tcRecords} academicYear={academicYear} onGenerateTc={async () => true} isSaving={false} />} />
           <Route path="transfers/records" element={<TcRecordsPage tcRecords={tcRecords} />} />
           <Route path="transfers/print/:tcId" element={<PrintTcPage tcRecords={tcRecords} />} />

           <Route path="inventory" element={<InventoryPage inventory={inventory} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} user={user!} />} />
           
           <Route path="hostel-dashboard" element={<HostelDashboardPage disciplineLog={disciplineLog} />} />
           <Route path="hostel/students" element={<HostelStudentListPage residents={hostelResidents} students={students} onAdd={() => {}} onAddById={async () => ({ success: true })} onEdit={() => {}} onDelete={() => {}} user={user!} academicYear={academicYear} />} />
           <Route path="hostel/rooms" element={<HostelRoomListPage residents={hostelResidents} students={students} />} />
           <Route path="hostel/chores" element={<HostelChoreRosterPage user={user!} students={students} residents={hostelResidents} choreRoster={choreRoster} onUpdateChoreRoster={async () => {}} academicYear={academicYear} />} />
           <Route path="hostel/fees" element={<HostelFeePage />} />
           <Route path="hostel/attendance" element={<HostelAttendancePage />} />
           <Route path="hostel/mess" element={<HostelMessPage />} />
           <Route path="hostel/staff" element={<HostelStaffPage staff={hostelStaff} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} user={user!} />} />
           <Route path="hostel/inventory" element={<HostelInventoryPage inventory={hostelInventory} stockLogs={stockLogs} onUpdateStock={() => {}} user={user!} />} />
           <Route path="hostel/discipline" element={<HostelDisciplinePage user={user!} students={students} residents={hostelResidents} disciplineLog={disciplineLog} onSave={async () => {}} onDelete={() => {}} academicYear={academicYear} />} />
           <Route path="hostel/health" element={<HostelHealthPage />} />
           <Route path="hostel/communication" element={<HostelCommunicationPage />} />
           <Route path="hostel/settings" element={<HostelSettingsPage />} />

           <Route path="calendar" element={<CalendarPage events={calendarEvents} user={user!} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} notificationDaysBefore={-1} onUpdatePrefs={() => {}} />} />
           <Route path="communication" element={<CommunicationPage students={students} user={user!} />} />
           <Route path="manage-notices" element={<ManageNoticesPage user={user!} allNotices={notices} onSave={async () => {}} onDelete={async () => {}} />} />
           <Route path="news-management" element={<ManageNewsPage news={news} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} user={user!} />} />
           <Route path="users" element={<UserManagementPage allUsers={users} currentUser={user!} onUpdateUserRole={() => {}} onDeleteUser={() => {}} />} />
           <Route path="parents" element={<ParentsManagementPage allUsers={users} students={students} academicYear={academicYear} currentUser={user!} onDeleteUser={() => {}} onUpdateUser={async () => {}} />} />
           <Route path="promotion" element={<PromotionPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear} onPromoteStudents={async () => {}} user={user!} />} />
           <Route path="subjects" element={<ManageSubjectsPage gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={() => {}} user={user!} onResetAllMarks={async () => {}} />} />
           <Route path="sitemap-editor" element={<SitemapEditorPage initialContent={sitemapContent} onSave={async () => {}} />} />
           
           <Route path="reports/academics" element={<ReportSearchPage students={students} academicYear={academicYear} />} />
           <Route path="reports/class/:grade/:examId" element={<ClassMarkStatementPage students={students} academicYear={academicYear} user={user!} gradeDefinitions={gradeDefinitions} onUpdateAcademic={async () => {}} onUpdateGradeDefinition={async () => {}} />} />
           <Route path="reports/bulk-print/:grade/:examId" element={<BulkProgressReportPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} academicYear={academicYear} />} />
           <Route path="progress-report/:studentId/:examId" element={<ProgressReportPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} academicYear={academicYear} />} />
           
           <Route path="routine" element={<RoutinePage examSchedules={examRoutines} classSchedules={classRoutines} user={user!} onSaveExamRoutine={async () => true} onDeleteExamRoutine={() => {}} onUpdateClassRoutine={() => {}} />} />
           <Route path="exams" element={<ExamSelectionPage />} />
           <Route path="exams/:examId" element={<ExamClassSelectionPage gradeDefinitions={gradeDefinitions} staff={staff} user={user!} />} />
           
           <Route path="admission-settings" element={<AdmissionSettingsPage admissionConfig={admissionSettings} onUpdateConfig={async () => true} />} />
           <Route path="admissions" element={<OnlineAdmissionsListPage admissions={[]} onUpdateStatus={async () => {}} />} />
           
           <Route path="homework-scanner" element={<HomeworkScannerPage />} />
           <Route path="activity-log" element={<ActivityLogPage students={students} user={user!} gradeDefinitions={gradeDefinitions} academicYear={academicYear} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onBulkUpdateActivityLogs={async () => {}} />} />
           <Route path="manage-homework" element={<ManageHomeworkPage user={user!} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onSave={async () => {}} onDelete={async () => {}} allHomework={homework} />} />
           <Route path="manage-syllabus" element={<ManageSyllabusPage user={user!} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onSave={async () => {}} allSyllabus={syllabus} gradeDefinitions={gradeDefinitions} />} />
           <Route path="syllabus/:grade" element={<SyllabusPage syllabus={syllabus} gradeDefinitions={gradeDefinitions} />} />
           <Route path="insights" element={<InsightsPage students={students} gradeDefinitions={gradeDefinitions} conductLog={conductLog} user={user!} />} />
           <Route path="settings" element={<SchoolSettingsPage config={schoolConfig} onUpdate={async () => true} />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
