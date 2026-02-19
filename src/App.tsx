
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
import { ManageStaffPage } from './pages/ManageStaffPage';
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
    }<ctrl63>