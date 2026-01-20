import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebaseConfig';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ParentSignUpPage from './pages/ParentSignUpPage';
import ParentRegistrationPage from './pages/ParentRegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import { User, NotificationType, Student } from './types';
import NotificationContainer from './components/NotificationContainer';
import OfflineIndicator from './components/OfflineIndicator';
import { SpinnerIcon } from './components/Icons';

// Data
import { timetableData } from './timetableData';

// Portal Pages
import DashboardPage from './pages/DashboardPage';
import ParentDashboardPage from './pages/ParentDashboardPage';
import StudentListPage from './pages/StudentListPage';
import StudentDetailPage from './pages/StudentDetailPage';
import ClassListPage from './pages/ClassListPage';
import ClassStudentsPage from './pages/ClassStudentsPage';
import StudentAttendancePage from './pages/StudentAttendancePage';
import StudentAttendanceLogPage from './pages/StudentAttendanceLogPage';
import { ManageStaffPage } from './pages/ManageStaffPage';
import StaffDetailPage from './pages/StaffDetailPage';
import StaffAttendancePage from './pages/StaffAttendancePage';
import StaffAttendanceLogPage from './pages/StaffAttendanceLogPage';
import StaffDocumentsPage from './pages/StaffDocumentsPage';
import GenerateServiceCertificatePage from './pages/GenerateServiceCertificatePage';
import PrintServiceCertificatePage from './pages/PrintServiceCertificatePage';
import FeeManagementPage from './pages/FeeManagementPage';
import InventoryPage from './pages/InventoryPage';
import TransferManagementPage from './pages/TransferManagementPage';
import GenerateTcPage from './pages/GenerateTcPage';
import TcRecordsPage from './pages/TcRecordsPage';
import PrintTcPage from './pages/PrintTcPage';
import HostelDashboardPage from './pages/HostelDashboardPage';
import HostelStudentListPage from './pages/HostelStudentListPage';
import HostelRoomListPage from './pages/HostelRoomListPage';
import HostelFeePage from './pages/HostelFeePage';
import HostelAttendancePage from './pages/HostelAttendancePage';
import HostelMessPage from './pages/HostelMessPage';
import HostelStaffPage from './pages/HostelStaffPage';
import HostelInventoryPage from './pages/HostelInventoryPage';
import HostelDisciplinePage from './pages/HostelDisciplinePage';
import HostelHealthPage from './pages/HostelHealthPage';
import HostelCommunicationPage from './pages/HostelCommunicationPage';
import HostelSettingsPage from './pages/HostelSettingsPage';
import HostelChoreRosterPage from './pages/HostelChoreRosterPage';
import CommunicationPage from './pages/CommunicationPage';
import CalendarPage from './pages/CalendarPage';
import ManageNewsPage from './pages/ManageNewsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import PromotionPage from './pages/PromotionPage';
import { ManageSubjectsPage } from './pages/ManageSubjectsPage';
import ReportSearchPage from './pages/ReportSearchPage';
import AcademicPerformancePage from './pages/AcademicPerformancePage';
import ClassMarkStatementPage from './pages/ClassMarkStatementPage';
import ProgressReportPage from './pages/ProgressReportPage';
import BulkProgressReportPage from './pages/BulkProgressReportPage';
import InsightsPage from './pages/InsightsPage';
import HomeworkScannerPage from './pages/HomeworkScannerPage';
import ActivityLogPage from './pages/ActivityLogPage';
import RoutinePage from './pages/public/RoutinePage';
import ExamSelectionPage from './pages/ExamSelectionPage';
import ExamClassSelectionPage from './pages/ExamClassSelectionPage';
import SitemapEditorPage from './pages/SitemapEditorPage';

// Public Pages
import PublicHomePage from './pages/public/PublicHomePage';
import NewsPage from './pages/public/NewsPage';
import AboutPage from './pages/public/AboutPage';
import HistoryPage from './pages/public/HistoryPage';
import FacultyPage from './pages/public/FacultyPage';
import RulesPage from './pages/public/RulesPage';
import AdmissionsPage from './pages/public/AdmissionsPage';
import OnlineAdmissionPage from './pages/public/OnlineAdmissionPage';
import OnlineAdmissionsListPage from './pages/OnlineAdmissionsListPage';
import FeesPage from './pages/public/FeesPage';
import SuppliesPage from './pages/public/SuppliesPage';
import StudentLifePage from './pages/public/StudentLifePage';
import NccPage from './pages/public/NccPage';
import ArtsCulturePage from './pages/public/ArtsCulturePage';
import EcoClubPage from './pages/public/EcoClubPage';
import FacilitiesPage from './pages/public/FacilitiesPage';
import InfrastructurePage from './pages/public/InfrastructurePage';
import HostelPage from './pages/public/HostelPage';
import GalleryPage from './pages/public/GalleryPage';
import ContactPage from './pages/public/ContactPage';
import SitemapPage from './pages/public/SitemapPage';
import SitemapXmlPage from './pages/public/SitemapXmlPage';
import AchievementsPage from './pages/public/AchievementsPage';
import AcademicAchievementsPage from './pages/public/AcademicAchievementsPage';
import CurriculumPage from './pages/public/CurriculumPage';
import DistinctionHoldersPage from './pages/public/DistinctionHoldersPage';
import SportsPage from './pages/public/SportsPage';
import ScienceClubPage from './pages/public/ScienceClubPage';
import QuizPage from './pages/public/QuizPage';
import SlsmeePage from './pages/public/SlsmeePage';
import InspireAwardPage from './pages/public/InspireAwardPage';
import NcscPage from './pages/public/NcscPage';
import ScienceTourPage from './pages/public/ScienceTourPage';
import IncentiveAwardsPage from './pages/public/IncentiveAwardsPage';
import MathematicsCompetitionPage from './pages/public/MathematicsCompetitionPage';
import PublicStaffDetailPage from './pages/public/PublicStaffDetailPage';
import { examRoutines } from './constants';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<{ id: string; message: string; type: NotificationType; title?: string; }[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    // Placeholder data structures - these would normally be states synced with Firestore
    const staff: any[] = [];
    const gradeDefinitions: any = {};
    const academicYear = "2025-2026";
    const tcRecords: any[] = [];
    const serviceCerts: any[] = [];
    const onlineAdmissions: any[] = [];
    const news: any[] = [];
    const calendarEvents: any[] = [];
    const conductLog: any[] = [];
    const hostelDisciplineLog: any[] = [];
    const hostelResidents: any[] = [];
    const hostelStaff: any[] = [];
    const hostelInventory: any[] = [];
    const hostelStockLogs: any[] = [];
    const hostelChoreRoster: any = {};
    const feeStructure: any = {};
    const assignedGrade: any = null;
    const assignedSubjects: any[] = [];
    const attendanceData: any = null;
    const classSchedules: any = timetableData;
    const sitemapContent = "";

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            role: userData?.role || 'pending',
                            studentIds: userData?.studentIds,
                            claimedStudentId: userData?.claimedStudentId,
                            claimedDateOfBirth: userData?.claimedDateOfBirth,
                            claimedStudents: userData?.claimedStudents,
                            registrationDetails: userData?.registrationDetails
                        });
                    } else {
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            role: 'pending'
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
             const unsubStudents = db.collection('students').onSnapshot(snapshot => {
                 const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student));
                 setStudents(data);
             }, error => console.error("Error fetching students:", error));
             
             let unsubUsers = () => {};
             if (user.role === 'admin') {
                 unsubUsers = db.collection('users').onSnapshot(snapshot => {
                     const data = snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as User));
                     setAllUsers(data);
                 }, error => console.error("Error fetching users:", error));
             }

             return () => {
                 unsubStudents();
                 unsubUsers();
             }
        }
    }, [user?.uid, user?.role]);

    const addNotification = (message: string, type: NotificationType, title?: string) => {
        const id = Math.random().toString(36).substring(7);
        setNotifications(prev => [...prev, { id, message, type, title }]);
    };

    const handleAuthAction = async (action: Promise<any>, successMsg: string) => {
        try {
            await action;
            addNotification(successMsg, 'success');
        } catch (error: any) {
            addNotification(error.message, 'error', 'Authentication Failed');
            return { success: false, message: error.message };
        }
        return { success: true };
    };

    const handleLogout = () => {
        auth.signOut();
        setUser(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <SpinnerIcon className="w-10 h-10 text-sky-600" />
            </div>
        );
    }

    return (
        <>
            <NotificationContainer 
                notifications={notifications} 
                onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} 
            />
            <OfflineIndicator />
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<PublicHomePage news={news} />} />
                    <Route path="/news" element={<NewsPage news={news} />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/faculty" element={<FacultyPage staff={staff} gradeDefinitions={gradeDefinitions} />} />
                    <Route path="/rules" element={<RulesPage />} />
                    <Route path="/admissions" element={<AdmissionsPage />} />
                    <Route path="/fees" element={<FeesPage feeStructure={feeStructure} students={[]} academicYear={academicYear} onUpdateFeePayments={() => {}} addNotification={addNotification} />} />
                    <Route path="/supplies" element={<SuppliesPage />} />
                    <Route path="/student-life" element={<StudentLifePage />} />
                    <Route path="/ncc" element={<NccPage />} />
                    <Route path="/arts-culture" element={<ArtsCulturePage />} />
                    <Route path="/eco-club" element={<EcoClubPage />} />
                    <Route path="/facilities" element={<FacilitiesPage />} />
                    <Route path="/infrastructure" element={<InfrastructurePage />} />
                    <Route path="/hostel" element={<HostelPage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/sitemap" element={<SitemapPage />} />
                    <Route path="/achievements" element={<AchievementsPage />} />
                    <Route path="/achievements/academic" element={<AcademicAchievementsPage />} />
                    <Route path="/academics/curriculum" element={<CurriculumPage gradeDefinitions={gradeDefinitions} />} />
                    <Route path="/achievements/academic/distinction-holders/:year" element={<DistinctionHoldersPage />} />
                    <Route path="/achievements/sports" element={<SportsPage />} />
                    <Route path="/achievements/science" element={<ScienceClubPage />} />
                    <Route path="/achievements/quiz" element={<QuizPage />} />
                    <Route path="/achievements/science/slsmee" element={<SlsmeePage />} />
                    <Route path="/achievements/science/inspire-award" element={<InspireAwardPage />} />
                    <Route path="/achievements/science/ncsc" element={<NcscPage />} />
                    <Route path="/achievements/science/science-tour" element={<ScienceTourPage />} />
                    <Route path="/achievements/science/incentive-awards" element={<IncentiveAwardsPage />} />
                    <Route path="/achievements/science/mathematics-competition" element={<MathematicsCompetitionPage />} />
                    <Route path="/staff/:staffId" element={<PublicStaffDetailPage staff={staff} gradeDefinitions={gradeDefinitions} />} />
                    <Route path="/routine" element={<RoutinePage examSchedules={examRoutines as any} classSchedules={classSchedules} user={user} />} />
                    <Route path="/admissions/online" element={<OnlineAdmissionPage onOnlineAdmissionSubmit={async () => true} />} />
                    <Route path="/login" element={<LoginPage onLogin={(e, p) => handleAuthAction(auth.signInWithEmailAndPassword(e, p), "Logged in")} error="" notification="" />} />
                    <Route path="/signup" element={<SignUpPage onSignUp={async () => ({success: true})} />} />
                    <Route path="/parent-registration" element={<ParentRegistrationPage />} />
                    <Route path="/parent-signup" element={<ParentSignUpPage onSignUp={async () => ({success: true})} />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage onForgotPassword={async () => ({success: true})} />} />
                    <Route path="/reset-password" element={<ResetPasswordPage onResetPassword={async () => ({success: true})} />} />
                    <Route path="/sitemap.xml" element={<SitemapXmlPage sitemapContent={sitemapContent} />} />
                </Route>

                {user ? (
                    <Route element={
                        <DashboardLayout 
                            user={user} 
                            onLogout={handleLogout} 
                            students={students} 
                            staff={staff} 
                            tcRecords={tcRecords} 
                            serviceCerts={serviceCerts} 
                            academicYear={academicYear}
                        >
                            {/* Nested routes are rendered here by Outlet */}
                            {null}
                        </DashboardLayout>
                    }>
                        <Route path="/portal/dashboard" element={<DashboardPage user={user} onAddStudent={() => {}} studentCount={students.length} academicYear={academicYear} onSetAcademicYear={() => {}} allUsers={allUsers} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} isReminderServiceActive={false} onToggleReminderService={() => {}} calendarEvents={calendarEvents} onlineAdmissions={onlineAdmissions} />} />
                        <Route path="/portal/parent-dashboard" element={<ParentDashboardPage user={user} allStudents={students} />} />
                        <Route path="/portal/students" element={<StudentListPage students={students} onAdd={() => {}} onEdit={() => {}} academicYear={academicYear} user={user} assignedGrade={assignedGrade} />} />
                        <Route path="/portal/student/:studentId" element={<StudentDetailPage students={students} onEdit={() => {}} academicYear={academicYear} user={user} assignedGrade={assignedGrade} feeStructure={feeStructure} conductLog={conductLog} hostelDisciplineLog={hostelDisciplineLog} onAddConductEntry={async () => true} onDeleteConductEntry={async () => {}} />} />
                        <Route path="/portal/classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={() => {}} user={user} />} />
                        <Route path="/portal/classes/:grade" element={<ClassStudentsPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateClassTeacher={() => {}} academicYear={academicYear} onOpenImportModal={() => {}} onDelete={() => {}} user={user} assignedGrade={assignedGrade} onAddStudentToClass={() => {}} onUpdateBulkFeePayments={async () => {}} feeStructure={feeStructure} />} />
                        <Route path="/portal/classes/:grade/attendance" element={<StudentAttendancePage students={students} allAttendance={attendanceData} onUpdateAttendance={async () => {}} user={user} fetchStudentAttendanceForMonth={async () => ({})} fetchStudentAttendanceForRange={async () => ({})} academicYear={academicYear} assignedGrade={assignedGrade} />} />
                        <Route path="/portal/student/:studentId/attendance-log" element={<StudentAttendanceLogPage students={students} fetchStudentAttendanceForMonth={async () => ({})} user={user} />} />
                        <Route path="/portal/staff" element={<ManageStaffPage staff={staff} gradeDefinitions={gradeDefinitions} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} user={user} />} />
                        <Route path="/portal/staff/:staffId" element={<StaffDetailPage staff={staff} onEdit={() => {}} gradeDefinitions={gradeDefinitions} />} />
                        <Route path="/portal/staff/attendance" element={<StaffAttendancePage user={user} staff={staff} attendance={{}} onMarkAttendance={() => {}} fetchStaffAttendanceForMonth={async () => ({})} fetchStaffAttendanceForRange={async () => ({})} academicYear={academicYear} />} />
                        <Route path="/portal/staff/attendance-logs" element={<StaffAttendanceLogPage staff={staff} students={students} gradeDefinitions={gradeDefinitions} fetchStaffAttendanceForMonth={async () => ({})} fetchStaffAttendanceForRange={async () => ({})} academicYear={academicYear} user={user} />} />
                        <Route path="/portal/fees" element={<FeeManagementPage students={students} academicYear={academicYear} onUpdateFeePayments={() => {}} user={user} feeStructure={feeStructure} onUpdateFeeStructure={() => {}} addNotification={addNotification} />} />
                        <Route path="/portal/reports/academics" element={<ReportSearchPage students={students} academicYear={academicYear} />} />
                        <Route path="/portal/student/:studentId/academics" element={<AcademicPerformancePage students={students} onUpdateAcademic={() => {}} gradeDefinitions={gradeDefinitions} academicYear={academicYear} user={user} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} />} />
                        <Route path="/portal/reports/class/:grade/:examId" element={<ClassMarkStatementPage students={students} academicYear={academicYear} user={user} gradeDefinitions={gradeDefinitions} onUpdateAcademic={async () => {}} />} />
                        <Route path="/portal/insights" element={<InsightsPage students={students} gradeDefinitions={gradeDefinitions} conductLog={conductLog} user={user} />} />
                        <Route path="/portal/homework-scanner" element={<HomeworkScannerPage />} />
                        <Route path="/portal/activity-log" element={<ActivityLogPage students={students} user={user} gradeDefinitions={gradeDefinitions} academicYear={academicYear} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onBulkUpdateActivityLogs={async () => {}} />} />
                        <Route path="/portal/subjects" element={<ManageSubjectsPage gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={() => {}} user={user} onResetAllMarks={async () => {}} />} />
                        <Route path="/portal/exams" element={<ExamSelectionPage />} />
                        <Route path="/portal/exams/:examId" element={<ExamClassSelectionPage gradeDefinitions={gradeDefinitions} staff={staff} user={user} />} />
                        <Route path="/portal/promotion" element={<PromotionPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear} onPromoteStudents={async () => {}} user={user} />} />
                        <Route path="/portal/staff/certificates" element={<StaffDocumentsPage serviceCertificateRecords={serviceCerts} user={user} />} />
                        <Route path="/portal/staff/certificates/generate" element={<GenerateServiceCertificatePage staff={staff} onSave={() => {}} user={user} />} />
                        <Route path="/portal/staff/certificates/print/:certId" element={<PrintServiceCertificatePage serviceCertificateRecords={serviceCerts} />} />
                        <Route path="/portal/transfers" element={<TransferManagementPage />} />
                        <Route path="/portal/transfers/generate" element={<GenerateTcPage students={students} tcRecords={tcRecords} academicYear={academicYear} onGenerateTc={async () => true} isSaving={false} />} />
                        <Route path="/portal/transfers/generate/:studentId" element={<GenerateTcPage students={students} tcRecords={tcRecords} academicYear={academicYear} onGenerateTc={async () => true} isSaving={false} />} />
                        <Route path="/portal/transfers/records" element={<TcRecordsPage tcRecords={tcRecords} />} />
                        <Route path="/portal/transfers/print/:tcId" element={<PrintTcPage tcRecords={tcRecords} />} />
                        <Route path="/progress-report/:studentId/:examId" element={<ProgressReportPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} academicYear={academicYear} />} />
                        <Route path="/portal/reports/bulk-print/:grade/:examId" element={<BulkProgressReportPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} academicYear={academicYear} />} />
                        <Route path="/portal/hostel-dashboard" element={<HostelDashboardPage disciplineLog={hostelDisciplineLog} />} />
                        <Route path="/portal/hostel/students" element={<HostelStudentListPage residents={hostelResidents} students={students} onAdd={() => {}} onAddById={async () => ({success: true})} onEdit={() => {}} onDelete={() => {}} user={user} academicYear={academicYear} />} />
                        <Route path="/portal/hostel/rooms" element={<HostelRoomListPage residents={hostelResidents} students={students} />} />
                        <Route path="/portal/hostel/fees" element={<HostelFeePage />} />
                        <Route path="/portal/hostel/attendance" element={<HostelAttendancePage />} />
                        <Route path="/portal/hostel/mess" element={<HostelMessPage />} />
                        <Route path="/portal/hostel/staff" element={<HostelStaffPage staff={hostelStaff} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} user={user} />} />
                        <Route path="/portal/hostel/inventory" element={<HostelInventoryPage inventory={hostelInventory} stockLogs={hostelStockLogs} onUpdateStock={() => {}} user={user} />} />
                        <Route path="/portal/hostel/discipline" element={<HostelDisciplinePage user={user} students={students} residents={hostelResidents} disciplineLog={hostelDisciplineLog} onSave={async () => {}} onDelete={() => {}} academicYear={academicYear} />} />
                        <Route path="/portal/hostel/health" element={<HostelHealthPage />} />
                        <Route path="/portal/hostel/communication" element={<HostelCommunicationPage />} />
                        <Route path="/portal/hostel/settings" element={<HostelSettingsPage />} />
                        <Route path="/portal/hostel/chores" element={<HostelChoreRosterPage user={user} students={students} residents={hostelResidents} choreRoster={hostelChoreRoster} onUpdateChoreRoster={async () => {}} academicYear={academicYear} />} />
                        <Route path="/portal/communication" element={<CommunicationPage students={students} user={user} />} />
                        <Route path="/portal/calendar" element={<CalendarPage events={calendarEvents} user={user} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} notificationDaysBefore={-1} onUpdatePrefs={() => {}} />} />
                        <Route path="/portal/news-management" element={<ManageNewsPage news={news} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} user={user} />} />
                        <Route path="/portal/users" element={<UserManagementPage allUsers={allUsers} students={students} academicYear={academicYear} currentUser={user} onUpdateUserRole={() => {}} onDeleteUser={() => {}} onUpdateUser={async () => {}} onApproveParent={() => {}} />} />
                        <Route path="/portal/admissions" element={<OnlineAdmissionsListPage admissions={onlineAdmissions} onUpdateStatus={() => {}} />} />
                        <Route path="/portal/change-password" element={<ChangePasswordPage onChangePassword={async () => ({success: true})} />} />
                        <Route path="/portal/sitemap-editor" element={<SitemapEditorPage initialContent={sitemapContent} onSave={async () => {}} />} />
                        <Route path="/portal/inventory" element={<InventoryPage inventory={[]} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} user={user} />} />
                    </Route>
                ) : (
                    <Route path="/portal/*" element={<Navigate to="/login" replace />} />
                )}
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};

export default App;
