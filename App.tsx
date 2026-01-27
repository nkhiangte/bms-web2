
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth, db, firebase } from './firebaseConfig';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ParentSignUpPage from './pages/ParentSignUpPage';
import ParentRegistrationPage from './pages/ParentRegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import { 
    User, NotificationType, Student, Staff, NewsItem, CalendarEvent, 
    ConductEntry, HostelResident, HostelStaff, HostelInventoryItem, 
    StockLog, HostelDisciplineEntry, ChoreRoster, FeeStructure, 
    Grade, GradeDefinition, SubjectAssignment, OnlineAdmission,
    Exam, FeePayments, StudentAttendanceRecord, StaffAttendanceRecord, AttendanceStatus,
    StudentClaim, ExamRoutine, DailyRoutine, Homework, Syllabus, AdmissionItem,
    HostelDormitory, StockLogType, Notice, StudentStatus, DailyStudentAttendance, AdmissionSettings
} from './types';
import NotificationContainer from './components/NotificationContainer';
import OfflineIndicator from './components/OfflineIndicator';
import { SpinnerIcon } from './components/Icons';

// Data & Constants
import { timetableData } from './timetableData';
import { DEFAULT_FEE_STRUCTURE, GRADE_DEFINITIONS, DEFAULT_ADMISSION_SETTINGS } from './constants';
import { calculateStudentResult, createDefaultFeePayments, formatStudentId, getNextAcademicYear, getNextGrade } from './utils';

// Portal Pages
import DashboardPage from './pages/DashboardPage';
import ParentDashboardPage from './pages/ParentDashboardPage';
import AdminPage from './pages/AdminPage';
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
import ParentsManagementPage from './pages/ParentsManagementPage';
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
import UserProfilePage from './pages/UserProfilePage';
import ManageHomeworkPage from './pages/ManageHomeworkPage';
import ManageSyllabusPage from './pages/ManageSyllabusPage';
import ManageNoticesPage from './pages/ManageNoticesPage';
import SchoolSettingsPage from './pages/SchoolSettingsPage';
import AdmissionSettingsPage from './pages/AdmissionSettingsPage';

// Modals
import NewsFormModal from './components/NewsFormModal';
import HostelResidentFormModal from './components/HostelResidentFormModal';
import HostelStaffFormModal from './components/HostelStaffFormModal';

// Public Pages
import PublicHomePage from './pages/public/PublicHomePage';
import NewsPage from './pages/public/NewsPage';
import AboutPage from './pages/public/AboutPage';
import HistoryPage from './pages/public/HistoryPage';
import FacultyPage from './pages/public/FacultyPage';
import RulesPage from './pages/public/RulesPage';
import AdmissionsPage from './pages/public/AdmissionsPage';
import OnlineAdmissionPage from './pages/public/OnlineAdmissionPage';
import AdmissionPaymentPage from './pages/public/AdmissionPaymentPage';
import AdmissionStatusPage from './pages/public/AdmissionStatusPage';
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
import SyllabusPage from './pages/public/SyllabusPage';

const App: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<{ id: string; message: string; type: NotificationType; title?: string; }[]>([]);
    
    // Core Data State
    const [students, setStudents] = useState<Student[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [conductLog, setConductLog] = useState<ConductEntry[]>([]);
    const [tcRecords, setTcRecords] = useState<any[]>([]);
    const [serviceCerts, setServiceCerts] = useState<any[]>([]);
    const [onlineAdmissions, setOnlineAdmissions] = useState<OnlineAdmission[]>([]);
    const [examSchedules, setExamSchedules] = useState<ExamRoutine[]>([]);
    const [classSchedules, setClassSchedules] = useState<Record<string, DailyRoutine>>(timetableData);
    const [homework, setHomework] = useState<Homework[]>([]);
    const [syllabus, setSyllabus] = useState<Syllabus[]>([]);
    const [notices, setNotices] = useState<Notice[]>([]);
    
    // Hostel State
    const [hostelResidents, setHostelResidents] = useState<HostelResident[]>([]);
    const [hostelStaff, setHostelStaff] = useState<HostelStaff[]>([]);
    const [hostelInventory, setHostelInventory] = useState<HostelInventoryItem[]>([]);
    const [hostelStockLogs, setHostelStockLogs] = useState<StockLog[]>([]);
    const [hostelDisciplineLog, setHostelDisciplineLog] = useState<HostelDisciplineEntry[]>([]);
    const [hostelChoreRoster, setHostelChoreRoster] = useState<ChoreRoster>({} as ChoreRoster);
    
    // Config State
    const [academicYear, setAcademicYear] = useState<string>("2025-2026");
    const [feeStructure, setFeeStructure] = useState<FeeStructure>(DEFAULT_FEE_STRUCTURE);
    const [gradeDefinitions, setGradeDefinitions] = useState<Record<Grade, GradeDefinition>>(GRADE_DEFINITIONS);
    const [sitemapContent, setSitemapContent] = useState<string>('');
    const [schoolConfig, setSchoolConfig] = useState<{ paymentQRCodeUrl?: string; upiId?: string }>({});
    const [admissionConfig, setAdmissionConfig] = useState<AdmissionSettings>(DEFAULT_ADMISSION_SETTINGS);

    // Attendance State
    const [currentStudentAttendance, setCurrentStudentAttendance] = useState<DailyStudentAttendance | null>(null);
    const [currentStaffAttendance, setCurrentStaffAttendance] = useState<StaffAttendanceRecord | null>(null);

    // Modal State
    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
    const [editingNewsItem, setEditingNewsItem] = useState<NewsItem | null>(null);
    const [isSavingNews, setIsSavingNews] = useState(false);
    const [isHostelResidentModalOpen, setIsHostelResidentModalOpen] = useState(false);
    const [editingHostelResident, setEditingHostelResident] = useState<HostelResident | null>(null);
    const [isSavingHostelResident, setIsSavingHostelResident] = useState(false);
    const [isHostelStaffModalOpen, setIsHostelStaffModalOpen] = useState(false);
    const [editingHostelStaff, setEditingHostelStaff] = useState<HostelStaff | null>(null);
    const [isSavingHostelStaff, setIsSavingHostelStaff] = useState(false);


    // Derived User Properties
    const staffProfile = useMemo(() => staff.find(s => s.emailAddress.toLowerCase() === user?.email?.toLowerCase()), [staff, user?.email]);
    const assignedGrade = useMemo(() => {
        if (!staffProfile) return null;
        const entry = Object.entries(gradeDefinitions).find(([, def]) => (def as any).classTeacherId === staffProfile.id);
        return entry ? entry[0] as Grade : null;
    }, [staffProfile, gradeDefinitions]);
    const assignedSubjects = useMemo(() => staffProfile?.assignedSubjects || [], [staffProfile]);

    // Derived Counts for Admin
    const pendingAdmissionsCount = useMemo(() => onlineAdmissions.filter(a => a.status === 'pending').length, [onlineAdmissions]);
    const pendingParentCount = useMemo(() => allUsers.filter(u => u.role === 'pending_parent').length, [allUsers]);
    const pendingStaffCount = useMemo(() => allUsers.filter(u => u.role === 'pending').length, [allUsers]);
    
    // Filtered Students based on Academic Year
    // Only pass this filtered list to student management components to ensure year consistency
    const studentsForCurrentYear = useMemo(() => {
        return students.filter(s => s.academicYear === academicYear || (!s.academicYear && academicYear === '2025-2026')); // Fallback for legacy
    }, [students, academicYear]);
    
    const studentsForFees = useMemo(() => {
        // Fee management might need to see all students or specific logic, but generally current year
        return studentsForCurrentYear;
    }, [studentsForCurrentYear]);


    const addNotification = (message: string, type: NotificationType, title?: string) => {
        const id = Math.random().toString(36).substring(7);
        setNotifications(prev => [...prev, { id, message, type, title }]);
    };

    // Firebase Auth Setup
    useEffect(() => {
        let userDocUnsubscribe: () => void;

        const authUnsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (userDocUnsubscribe) userDocUnsubscribe();

            if (firebaseUser) {
                const userDocRef = db.collection('users').doc(firebaseUser.uid);
                const userDoc = await userDocRef.get();

                if (!userDoc.exists) {
                    const newUser = {
                        displayName: firebaseUser.displayName,
                        email: firebaseUser.email,
                        photoURL: firebaseUser.photoURL,
                        role: 'pending', 
                        createdAt: new Date().toISOString(),
                    };
                    await userDocRef.set(newUser);
                }

                userDocUnsubscribe = userDocRef.onSnapshot(
                    (doc) => {
                        const userData = doc.data();
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
                            registrationDetails: userData?.registrationDetails,
                        });
                        setLoading(false);
                    },
                    (error) => {
                        console.error("Error listening to user document:", error);
                        setUser(null);
                        setLoading(false);
                    }
                );
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            authUnsubscribe();
            if (userDocUnsubscribe) userDocUnsubscribe();
        };
    }, []);

    // Core Global Real-time Sync
    useEffect(() => {
        const unsubNews = db.collection('news').onSnapshot(s => setNews(s.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem))));
        const unsubStaff = db.collection('staff').onSnapshot(s => setStaff(s.docs.map(d => ({ id: d.id, ...d.data() } as Staff))));
        const unsubCal = db.collection('calendarEvents').onSnapshot(s => setCalendarEvents(s.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEvent))));
        const unsubFees = db.collection('config').doc('feeStructure').onSnapshot(d => d.exists && setFeeStructure(d.data() as FeeStructure));
        const unsubGradeDefs = db.collection('config').doc('gradeDefinitions').onSnapshot(d => d.exists && setGradeDefinitions(d.data() as any));
        const unsubAcademic = db.collection('settings').doc('academic').onSnapshot(d => d.exists && setAcademicYear(d.data()?.currentYear || "2025-2026"));
        const unsubSitemap = db.collection('config').doc('sitemap').onSnapshot(d => d.exists && setSitemapContent(d.data()?.content || ''));
        const unsubExams = db.collection('examRoutines').onSnapshot(s => setExamSchedules(s.docs.map(d => ({ id: d.id, ...d.data() } as ExamRoutine))));
        const unsubClasses = db.collection('classRoutines').onSnapshot(snapshot => {
            const routines: Record<string, DailyRoutine> = { ...timetableData };
            snapshot.forEach(doc => {
                if (doc.data()?.schedule) {
                    routines[doc.id] = doc.data().schedule as DailyRoutine;
                }
            });
            setClassSchedules(routines);
        });
        const unsubSyllabus = db.collection('syllabus').onSnapshot(s => setSyllabus(s.docs.map(d => ({ id: d.id, ...d.data() } as Syllabus))));
        const unsubSchoolDetails = db.collection('config').doc('schoolDetails').onSnapshot(d => d.exists && setSchoolConfig(d.data() as any));
        const unsubAdmissionConfig = db.collection('config').doc('admissionSettings').onSnapshot(d => d.exists && setAdmissionConfig(d.data() as AdmissionSettings));

        return () => {
            unsubNews(); unsubStaff(); unsubCal(); unsubFees(); unsubGradeDefs(); unsubAcademic(); unsubSitemap(); unsubExams(); unsubClasses(); unsubSyllabus(); unsubSchoolDetails(); unsubAdmissionConfig();
        };
    }, []);

    // Authenticated Real-time Sync
    useEffect(() => {
        if (!user) {
            setStudents([]); setConductLog([]); setTcRecords([]); setServiceCerts([]);
            setAllUsers([]); setOnlineAdmissions([]); setHomework([]); setNotices([]);
            setCurrentStudentAttendance(null); setCurrentStaffAttendance(null);
            setHostelResidents([]); setHostelStaff([]); setHostelInventory([]); setHostelDisciplineLog([]); setHostelChoreRoster({} as ChoreRoster);
            return;
        };
    
        const isStaff = ['admin', 'user', 'warden'].includes(user.role);
        const isAdmin = user.role === 'admin';
        const isParent = user.role === 'parent';
        const isWardenOrAdmin = isAdmin || user.role === 'warden';
        
        const unsubscribers: (() => void)[] = [];
    
        if (isStaff) {
            unsubscribers.push(db.collection('students').onSnapshot(s => setStudents(s.docs.map(d => ({ id: d.id, ...d.data() } as Student)))));
            unsubscribers.push(db.collection('conductLog').onSnapshot(s => setConductLog(s.docs.map(d => ({ id: d.id, ...d.data() } as ConductEntry)))));
        } else if (isParent && user.studentIds && user.studentIds.length > 0) {
            unsubscribers.push(db.collection('students').where(firebase.firestore.FieldPath.documentId(), 'in', user.studentIds).onSnapshot(s => setStudents(s.docs.map(d => ({ id: d.id, ...d.data() } as Student)))));
            unsubscribers.push(db.collection('conductLog').where('studentId', 'in', user.studentIds).onSnapshot(s => setConductLog(s.docs.map(d => ({ id: d.id, ...d.data() } as ConductEntry)))));
        }

        if (isStaff || isParent) {
            unsubscribers.push(db.collection('homework').onSnapshot(s => setHomework(s.docs.map(d => ({ id: d.id, ...d.data() } as Homework)))));
            unsubscribers.push(db.collection('notices').onSnapshot(s => setNotices(s.docs.map(d => ({ id: d.id, ...d.data() } as Notice)))));
        }
    
        if (isStaff) {
            unsubscribers.push(db.collection('tcRecords').onSnapshot(s => setTcRecords(s.docs.map(d => ({ id: d.id, ...d.data() })))));
            unsubscribers.push(db.collection('serviceCertificates').onSnapshot(s => setServiceCerts(s.docs.map(d => ({ id: d.id, ...d.data() })))));
        }
        
        if (isAdmin) {
            unsubscribers.push(db.collection('users').onSnapshot(s => setAllUsers(s.docs.map(d => ({ uid: d.id, ...d.data() } as User)))));
            unsubscribers.push(db.collection('online_admissions').onSnapshot(s => setOnlineAdmissions(s.docs.map(d => ({ id: d.id, ...d.data() } as OnlineAdmission)))));
        }
    
        if (isWardenOrAdmin) {
            unsubscribers.push(db.collection('hostelResidents').onSnapshot(s => setHostelResidents(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelResident)))));
            unsubscribers.push(db.collection('hostelStaff').onSnapshot(s => setHostelStaff(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelStaff)))));
            unsubscribers.push(db.collection('hostelInventory').onSnapshot(s => setHostelInventory(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelInventoryItem)))));
            unsubscribers.push(db.collection('hostelDisciplineLog').onSnapshot(s => setHostelDisciplineLog(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelDisciplineEntry)))));
            unsubscribers.push(db.collection('choreRoster').doc('current').onSnapshot(d => d.exists && setHostelChoreRoster(d.data() as ChoreRoster)));
        } else if (isParent && user.studentIds && user.studentIds.length > 0) {
            unsubscribers.push(db.collection('hostelDisciplineLog').where('studentId', 'in', user.studentIds).onSnapshot(s => {
                setHostelDisciplineLog(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelDisciplineEntry)));
            }));
        }
    
        const todayStr = new Date().toISOString().split('T')[0];
        unsubscribers.push(db.collection('studentAttendance').doc(todayStr).onSnapshot(d => d.exists && setCurrentStudentAttendance(d.data() as any)));
        unsubscribers.push(db.collection('staffAttendance').doc(todayStr).onSnapshot(d => d.exists && setCurrentStaffAttendance(d.data() as StaffAttendanceRecord)));
    
        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [user]);

    // HANDLERS
    const handleUpdateAcademic = async (studentId: string, performance: Exam[]) => {
        try {
            await db.collection('students').doc(studentId).update({ academicPerformance: performance });
            addNotification("Academic record updated", "success");
        } catch (e: any) {
            addNotification(e.message, "error");
        }
    };

    const handleUpdateGradeDefinition = async (grade: Grade, newDefinition: GradeDefinition) => {
        try {
            await db.collection('config').doc('gradeDefinitions').update({
                [grade]: newDefinition
            });
            addNotification(`Successfully updated subjects for ${grade}.`, 'success');
        } catch (e: any) {
            console.error("Error updating grade definition:", e);
            addNotification(`Failed to update subjects: ${e.message}`, 'error');
        }
    };

    const handleAddConductEntry = async (entry: Omit<ConductEntry, 'id'>): Promise<boolean> => {
        try {
            await db.collection('conductLog').add(entry);
            addNotification("Conduct entry added successfully", "success");
            return true;
        } catch (e: any) {
            addNotification(e.message, "error", "Save Failed");
            return false;
        }
    };
    
    const handleDeleteConductEntry = async (entryId: string): Promise<void> => {
        try {
            await db.collection('conductLog').doc(entryId).delete();
            addNotification("Conduct entry deleted", "success");
        } catch (e: any) {
            addNotification(e.message, "error", "Delete Failed");
        }
    };


    const handleUpdateAttendance = async (grade: Grade, date: string, records: StudentAttendanceRecord) => {
        try {
            await db.collection('studentAttendance').doc(date).set({ [grade]: records }, { merge: true });
        } catch (e: any) {
            addNotification(e.message, "error");
        }
    };

    const fetchStudentAttendanceForMonth = async (grade: Grade, year: number, month: number) => {
        const start = `${year}-${String(month).padStart(2, '0')}-01`;
        const end = `${year}-${String(month).padStart(2, '0')}-31`;
        const snapshot = await db.collection('studentAttendance').where(firebase.firestore.FieldPath.documentId(), '>=', start).where(firebase.firestore.FieldPath.documentId(), '<=', end).get();
        const data: any = {};
        snapshot.docs.forEach(doc => {
            if (doc.data()[grade]) data[doc.id] = doc.data()[grade];
        });
        return data;
    };

    const handleUpdateFeePayments = async (studentId: string, payments: FeePayments) => {
        try {
            await db.collection('students').doc(studentId).update({ feePayments: payments });
            addNotification("Payment record updated", "success");
        } catch (e: any) {
            addNotification(e.message, "error");
        }
    };

    const handleUpdateFeeStructure = async (newStructure: FeeStructure) => {
        try {
            await db.collection('config').doc('feeStructure').set(newStructure, { merge: true });
            addNotification("Fee structure updated successfully", "success");
        } catch (e: any) {
            addNotification(e.message, "error", "Update Failed");
        }
    };
    
    const handleOnlineAdmissionSubmit = async (data: Omit<OnlineAdmission, 'id' | 'submissionDate' | 'status'>): Promise<string | null> => {
        try {
            const submissionDataWithTimestamp = {
                ...data,
                submissionDate: new Date().toISOString(),
                status: 'pending' as 'pending',
                paymentStatus: 'pending' as 'pending'
            };

            const cleanedData: { [key: string]: any } = {};
            Object.entries(submissionDataWithTimestamp).forEach(([key, value]) => {
                if (value !== undefined) {
                    cleanedData[key] = value;
                }
            });

            const docRef = await db.collection('online_admissions').add(cleanedData);
            return docRef.id;
        } catch (error: any) {
            addNotification(error.message, 'error', 'Submission Failed');
            return null;
        }
    };

    const handleUpdateAdmissionPayment = async (
        admissionId: string, 
        updates: { paymentAmount: number, purchasedItems: AdmissionItem[], paymentScreenshotUrl: string, paymentTransactionId: string, billId: string }
    ) => {
         try {
            await db.collection('online_admissions').doc(admissionId).update({
                ...updates,
                paymentStatus: 'paid',
                status: 'reviewed' 
            });
            addNotification("Payment details saved successfully!", 'success');
            return true;
        } catch (error: any) {
            addNotification(error.message, 'error', 'Payment Update Failed');
            return false;
        }
    };
    
    const handleUpdateAdmissionStatus = async (id: string, status: OnlineAdmission['status']) => {
        try {
            const docRef = db.collection('online_admissions').doc(id);
            const admissionDoc = await docRef.get();
            
            if (!admissionDoc.exists) {
                throw new Error("Admission record not found");
            }

            const admissionData = admissionDoc.data() as OnlineAdmission;
            const updates: Partial<OnlineAdmission> = { status };

            // Logic for Approving and Enrolling
            if (status === 'approved' && !admissionData.isEnrolled) {
                
                // 1. Calculate Next Roll Number for the specific grade (in current academic year if needed, or globally for simple logic)
                const studentsSnapshot = await db.collection('students')
                    .where('grade', '==', admissionData.admissionGrade)
                    .where('academicYear', '==', academicYear) // Filter for current year
                    .get();
                
                let maxRoll = 0;
                studentsSnapshot.forEach(doc => {
                    const sData = doc.data() as Student;
                    if (sData.rollNo && typeof sData.rollNo === 'number') {
                        maxRoll = Math.max(maxRoll, sData.rollNo);
                    }
                });
                const newRollNo = maxRoll + 1;

                // 2. Map Admission Data to Student Data
                const newStudentData: Omit<Student, 'id'> = {
                    rollNo: newRollNo,
                    name: admissionData.studentName.toUpperCase(),
                    grade: admissionData.admissionGrade as Grade,
                    academicYear: academicYear, // Set to current system academic year
                    studentId: '', // Will be updated after generation
                    contact: admissionData.contactNumber,
                    dateOfBirth: admissionData.dateOfBirth,
                    gender: admissionData.gender as any, 
                    address: admissionData.presentAddress,
                    aadhaarNumber: admissionData.studentAadhaar,
                    pen: admissionData.penNumber || '',
                    category: 'General' as any, 
                    fatherName: admissionData.fatherName,
                    fatherOccupation: admissionData.fatherOccupation || '',
                    fatherAadhaar: admissionData.parentAadhaar || '',
                    motherName: admissionData.motherName,
                    motherOccupation: admissionData.motherOccupation || '',
                    motherAadhaar: '', 
                    guardianName: admissionData.guardianName || '',
                    guardianRelationship: admissionData.guardianRelationship || '',
                    lastSchoolAttended: admissionData.lastSchoolAttended || '',
                    healthConditions: admissionData.healthIssues || '',
                    achievements: admissionData.achievements || '',
                    status: StudentStatus.ACTIVE,
                    cwsn: admissionData.isCWSN as any || 'No',
                    religion: 'Christian',
                    bloodGroup: admissionData.bloodGroup as any,
                    photographUrl: '', 
                    feePayments: createDefaultFeePayments(),
                    academicPerformance: []
                };

                // Generate ID
                const getGradeCode = (g: string) => {
                    if(g === 'Nursery') return 'NU';
                    if(g === 'Kindergarten') return 'KG';
                    const roman = g.replace('Class ', '');
                    const map: any = { 'I':'01', 'II':'02', 'III':'03', 'IV':'04', 'V':'05', 'VI':'06', 'VII':'07', 'VIII':'08', 'IX':'09', 'X':'10' };
                    return map[roman] || '00';
                };
                
                const startYear = academicYear.substring(0, 4);
                const yearSuffix = startYear.slice(-2);
                const gradeCode = getGradeCode(admissionData.admissionGrade);
                const paddedRoll = String(newRollNo).padStart(2, '0');
                const generatedStudentId = `BMS${yearSuffix}${gradeCode}${paddedRoll}`;

                newStudentData.studentId = generatedStudentId;

                // 3. Create Student Document
                await db.collection('students').add(newStudentData);

                // 4. Mark admission as enrolled
                updates.isEnrolled = true;
                updates.temporaryStudentId = generatedStudentId;
                
                addNotification(`Student enrolled successfully to ${admissionData.admissionGrade} with Roll No: ${newRollNo}`, 'success');
            } else if (status === 'approved' && admissionData.isEnrolled) {
                 addNotification("This student is already enrolled.", "info");
                 return;
            }

            await docRef.update(updates);
            addNotification(`Application status updated to ${status}`, 'success');
        } catch (error: any) {
            console.error("Error updating admission status:", error);
            addNotification("Failed to update status: " + error.message, 'error');
        }
    };


    const handleMarkStaffAttendance = async (staffId: string, status: AttendanceStatus) => {
        const todayStr = new Date().toISOString().split('T')[0];
        try {
            await db.collection('staffAttendance').doc(todayStr).set({ [staffId]: status }, { merge: true });
        } catch (e: any) {
            addNotification(e.message, "error");
        }
    };

    const handleLogout = () => {
        auth.signOut();
        setUser(null);
        navigate('/', { replace: true });
    };
    
    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.email) {
            const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPassword);
            try {
                await currentUser.reauthenticateWithCredential(credential);
                await currentUser.updatePassword(newPassword);
                sessionStorage.setItem('loginMessage', 'Password changed successfully. Please log in again.');
                handleLogout(); 
                return { success: true, message: 'Password changed successfully. Please log in again.' };
            } catch (error: any) {
                console.error("Password change error:", error);
                return { success: false, message: error.message };
            }
        }
        return { success: false, message: "No user is currently signed in." };
    };

    const handleUpdateUserRole = async (uid: string, newRole: 'admin' | 'user' | 'pending' | 'warden') => {
        try {
            await db.collection('users').doc(uid).update({ role: newRole });
            addNotification("User role updated successfully", "success");
        } catch (e: any) {
            addNotification(e.message, "error", "Role Update Failed");
        }
    };

    const handleDeleteUser = async (uid: string) => {
        try {
            await db.collection('users').doc(uid).delete();
            addNotification("User record deleted. Auth user may still exist.", "info");
        } catch (e: any) {
            addNotification(e.message, "error", "Deletion Failed");
        }
    };
    
    const handleUpdateUser = async (uid: string, updates: Partial<User>) => {
        try {
            await db.collection('users').doc(uid).update(updates);
            addNotification("User updated successfully.", "success");
        } catch (e: any) {
            addNotification(e.message, "error", "User Update Failed");
        }
    };
    
    const handleUpdateUserProfile = async (updates: { displayName?: string, photoURL?: string }) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            addNotification("You must be logged in to update your profile.", "error");
            return { success: false, message: "No user logged in." };
        }

        try {
            await currentUser.updateProfile(updates);
            await db.collection('users').doc(currentUser.uid).update(updates);
            addNotification("Profile updated successfully!", "success");
            return { success: true };
        } catch (error: any) {
            console.error("Profile update error:", error);
            addNotification(error.message, "error", "Update Failed");
            return { success: false, message: error.message };
        }
    };


    const handleParentSignUp = async (name: string, email: string, password: string, studentId: string, dateOfBirth: string, studentName: string, relationship: string) => {
        try {
            const methods = await auth.fetchSignInMethodsForEmail(email);
            if (methods.length > 0) {
                return { success: false, message: "An account with this email already exists." };
            }
            
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            if (user) {
                await user.updateProfile({ displayName: name });
                
                const studentClaim: StudentClaim = {
                    fullName: studentName,
                    studentId: studentId,
                    dob: dateOfBirth,
                    relationship: relationship,
                };

                await db.collection('users').doc(user.uid).set({
                    displayName: name,
                    email: email,
                    role: 'pending_parent',
                    claimedStudents: [studentClaim],
                    createdAt: new Date().toISOString(),
                });
                
                return { success: true, message: "Account created successfully! Please wait for admin approval. You will be notified once your account is active." };
            }
            return { success: false, message: "Failed to create user account. Please try again." };
        } catch (error: any) {
            console.error("Parent SignUp Error:", error);
            return { success: false, message: error.message };
        }
    };
    
    const handleLinkChildRequest = async (claim: StudentClaim) => {
        if (!user) {
            addNotification("You must be logged in to perform this action.", "error");
            return;
        }
        try {
            await db.collection('users').doc(user.uid).update({
                claimedStudents: firebase.firestore.FieldValue.arrayUnion(claim)
            });
            addNotification("Request to link child has been sent for approval.", "success");
        } catch (e: any) {
            console.error("Error submitting link child request:", e);
            addNotification(e.message, "error", "Request Failed");
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await auth.signInWithPopup(provider);
            return { success: true };
        } catch (error: any) {
            let message = error.message;
            if (error.code === 'auth/account-exists-with-different-credential') {
                message = "An account already exists with this email address. Please sign in with your original method.";
            }
            addNotification(message, 'error', 'Google Sign-In Failed');
            return { success: false, message: message };
        }
    };
    
    const handleSaveExamRoutine = async (routine: Omit<ExamRoutine, 'id'>, id?: string): Promise<boolean> => {
        try {
            if (id) {
                await db.collection('examRoutines').doc(id).update(routine);
                addNotification("Exam routine updated successfully", "success");
            } else {
                await db.collection('examRoutines').add(routine);
                addNotification("Exam routine added successfully", "success");
            }
            return true;
        } catch (e: any) {
            addNotification(e.message, "error", "Save Failed");
            return false;
        }
    };

    const handleDeleteExamRoutine = async (routine: ExamRoutine) => {
        if (window.confirm(`Are you sure you want to delete the routine "${routine.title}"? This action cannot be undone.`)) {
            try {
                await db.collection('examRoutines').doc(routine.id).delete();
                addNotification("Exam routine deleted successfully.", "success");
            } catch (e: any) {
                addNotification(e.message, "error", "Deletion Failed");
            }
        }
    };
    
    const handleUpdateClassRoutine = async (day: string, routine: DailyRoutine) => {
        try {
            await db.collection('classRoutines').doc(day).set({ schedule: routine });
            addNotification(`${day}'s class routine updated successfully`, "success");
        } catch (e: any) {
            addNotification(e.message, "error", "Update Failed");
        }
    };

    const handleSendMessage = async (message: any) => {
        try {
            await db.collection('parentMessages').add({
                ...message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'sent',
            });
            addNotification("Message sent successfully!", "success");
            return true;
        } catch (e: any) {
            addNotification(e.message, "error", "Message Failed");
            return false;
        }
    };

    const handleOpenAddNews = () => {
        setEditingNewsItem(null);
        setIsNewsModalOpen(true);
    };

    const handleOpenEditNews = (item: NewsItem) => {
        setEditingNewsItem(item);
        setIsNewsModalOpen(true);
    };

    const handleSaveNews = async (itemData: Omit<NewsItem, 'id'>) => {
        setIsSavingNews(true);
        try {
            if (editingNewsItem) {
                await db.collection('news').doc(editingNewsItem.id).update(itemData);
                addNotification("News item updated successfully", "success");
            } else {
                await db.collection('news').add(itemData);
                addNotification("News item added successfully", "success");
            }
            setIsNewsModalOpen(false);
        } catch (e: any) {
            addNotification(e.message, "error", "Save Failed");
        } finally {
            setIsSavingNews(false);
        }
    };

    const handleDeleteNews = async (item: NewsItem) => {
        if (window.confirm(`Are you sure you want to delete "${item.title}"? This is irreversible.`)) {
            try {
                await db.collection('news').doc(item.id).delete();
                addNotification("News item deleted successfully", "success");
            } catch (e: any) {
                addNotification(e.message, "error", "Deletion Failed");
            }
        }
    };

    const handleSaveNotice = async (noticeData: Omit<Notice, 'id' | 'createdBy'>, id?: string) => {
        if (!user) return;
        const dataToSave = {
            ...noticeData,
            createdBy: {
                uid: user.uid,
                name: user.displayName || user.email || 'Admin'
            }
        };
        try {
            if (id) {
                await db.collection('notices').doc(id).update(dataToSave);
                addNotification("Notice updated successfully", "success");
            } else {
                await db.collection('notices').add(dataToSave);
                addNotification("Notice added successfully", "success");
            }
        } catch (e: any) {
            addNotification(e.message, "error", "Save Failed");
        }
    };

    const handleDeleteNotice = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this notice?")) {
            try {
                await db.collection('notices').doc(id).delete();
                addNotification("Notice deleted successfully", "success");
            } catch (e: any) {
                addNotification(e.message, "error", "Delete Failed");
            }
        }
    };

    const handleAddHostelResidentById = async (studentId: string): Promise<{ success: boolean, message?: string }> => {
        const student = students.find(s => formatStudentId(s, academicYear).toLowerCase() === studentId.toLowerCase());
        if (!student) {
            return { success: false, message: 'Student ID not found in school records.' };
        }
        const isAlreadyResident = hostelResidents.some(r => r.studentId === student.id);
        if (isAlreadyResident) {
            return { success: false, message: 'This student is already registered as a hostel resident.' };
        }
        
        try {
            await db.collection('hostelResidents').add({
                studentId: student.id,
                dormitory: HostelDormitory.BOYS_DORM_A, // Defaulting, can be changed
                dateOfJoining: new Date().toISOString().split('T')[0],
            });
            addNotification(`${student.name} added to hostel residents.`, 'success');
            return { success: true };
        } catch (e: any) {
            addNotification(e.message, 'error', 'Failed to add resident');
            return { success: false, message: e.message };
        }
    };

    const handleOpenAddHostelResident = () => {
        setEditingHostelResident(null);
        setIsHostelResidentModalOpen(true);
    };

    const handleOpenEditHostelResident = (resident: HostelResident) => {
        setEditingHostelResident(resident);
        setIsHostelResidentModalOpen(true);
    };

    const handleSaveHostelResident = async (residentData: Omit<HostelResident, 'id'>) => {
        setIsSavingHostelResident(true);
        try {
            if (editingHostelResident) {
                await db.collection('hostelResidents').doc(editingHostelResident.id).update(residentData);
                addNotification("Hostel resident updated.", "success");
            } else {
                await db.collection('hostelResidents').add(residentData);
                addNotification("Hostel resident added.", "success");
            }
            setIsHostelResidentModalOpen(false);
        } catch (e: any) {
            addNotification(e.message, "error", "Save failed");
        } finally {
            setIsSavingHostelResident(false);
        }
    };
    
    const handleDeleteHostelResident = async (resident: HostelResident) => {
        if (window.confirm("Are you sure you want to remove this student from the hostel records?")) {
            try {
                await db.collection('hostelResidents').doc(resident.id).delete();
                addNotification("Hostel resident removed.", "success");
            } catch (e: any) {
                addNotification(e.message, "error", "Deletion failed");
            }
        }
    };

    const handleOpenAddHostelStaff = () => {
        setEditingHostelStaff(null);
        setIsHostelStaffModalOpen(true);
    };

    const handleOpenEditHostelStaff = (staffMember: HostelStaff) => {
        setEditingHostelStaff(staffMember);
        setIsHostelStaffModalOpen(true);
    };
    
    const handleSaveHostelStaff = async (staffData: Omit<HostelStaff, 'id'>) => {
        setIsSavingHostelStaff(true);
        try {
            if (editingHostelStaff) {
                await db.collection('hostelStaff').doc(editingHostelStaff.id).update(staffData);
                addNotification("Hostel staff updated.", "success");
            } else {
                await db.collection('hostelStaff').add(staffData);
                addNotification("Hostel staff added.", "success");
            }
            setIsHostelStaffModalOpen(false);
        } catch (e: any) {
            addNotification(e.message, "error", "Save failed");
        } finally {
            setIsSavingHostelStaff(false);
        }
    };
    
    const handleDeleteHostelStaff = async (staffMember: HostelStaff) => {
        if (window.confirm(`Are you sure you want to delete ${staffMember.name}?`)) {
            try {
                await db.collection('hostelStaff').doc(staffMember.id).delete();
                addNotification("Hostel staff member removed.", "success");
            } catch (e: any) {
                addNotification(e.message, "error", "Deletion failed");
            }
        }
    };

    const handleUpdateHostelStock = async (itemId: string, change: number, notes: string) => {
        if (!user) return;
        const itemRef = db.collection('hostelInventory').doc(itemId);
        const logRef = db.collection('stockLogs');
        try {
            await db.runTransaction(async (transaction) => {
                const itemDoc = await transaction.get(itemRef);
                if (!itemDoc.exists) {
                    throw "Item not found!";
                }
                const itemData = itemDoc.data() as HostelInventoryItem;
                const newStock = itemData.currentStock + change;
                if (newStock < 0) {
                    throw "Not enough stock to issue.";
                }
                transaction.update(itemRef, { currentStock: newStock });
                
                const logEntry = {
                    itemId: itemId,
                    itemName: itemData.name,
                    quantity: Math.abs(change),
                    type: change > 0 ? StockLogType.IN : StockLogType.OUT,
                    date: new Date().toISOString(),
                    updatedBy: user.displayName || user.email || 'System',
                    notes: notes
                };
                transaction.set(logRef.doc(), logEntry);
            });
            addNotification("Stock updated successfully.", "success");
        } catch (e: any) {
            const message = e instanceof Error ? e.message : String(e);
            addNotification(message, "error", "Stock update failed");
        }
    };

    const handleSaveHostelDisciplineEntry = async (entryData: Omit<HostelDisciplineEntry, 'id' | 'reportedBy' | 'reportedById'>, id?: string) => {
        if (!user) return;
        const dataToSave = {
            ...entryData,
            reportedBy: user.displayName || user.email || 'System',
            reportedById: user.uid
        };
        try {
            if (id) {
                await db.collection('hostelDisciplineLog').doc(id).update(dataToSave);
                addNotification("Discipline entry updated.", "success");
            } else {
                await db.collection('hostelDisciplineLog').add(dataToSave);
                addNotification("Discipline entry added.", "success");
            }
        } catch (e: any) {
            addNotification(e.message, "error", "Save Failed");
        }
    };

    const handleDeleteHostelDisciplineEntry = async (entry: HostelDisciplineEntry) => {
         if (window.confirm(`Are you sure you want to delete this incident for ${students.find(s => s.id === entry.studentId)?.name}?`)) {
            try {
                await db.collection('hostelDisciplineLog').doc(entry.id).delete();
                addNotification("Discipline entry deleted.", "success");
            } catch (e: any) {
                addNotification(e.message, "error", "Deletion failed");
            }
        }
    };
    
    const handleUpdateChoreRoster = async (newRoster: ChoreRoster) => {
        try {
            await db.collection('choreRoster').doc('current').set(newRoster);
            addNotification("Chore roster updated successfully.", "success");
        } catch (e: any) {
            addNotification(e.message, "error", "Update Failed");
        }
    };

    const handleUpdateSchoolConfig = async (updates: { paymentQRCodeUrl?: string; upiId?: string }) => {
        try {
            await db.collection('config').doc('schoolDetails').set(updates, { merge: true });
            addNotification("School settings updated successfully.", "success");
            return true;
        } catch (e: any) {
            addNotification(e.message, "error", "Update Failed");
            return false;
        }
    };

    const handleUpdateAdmissionConfig = async (newConfig: AdmissionSettings) => {
        try {
            await db.collection('config').doc('admissionSettings').set(newConfig, { merge: true });
            addNotification("Admission settings updated successfully.", "success");
            return true;
        } catch (e: any) {
            addNotification(e.message, "error", "Update Failed");
            return false;
        }
    };

    const handleUpdateAcademicYear = async (year: string) => {
        try {
            await db.collection('settings').doc('academic').set({ currentYear: year }, { merge: true });
            addNotification(`Academic Year changed to ${year}`, 'success');
        } catch (error: any) {
             addNotification(error.message, 'error', 'Update Failed');
        }
    };

    const handlePromoteStudents = async () => {
        try {
            const nextAcademicYear = getNextAcademicYear(academicYear);
            const archiveCollectionName = `archive_students_${academicYear.replace('-', '_')}`;
            
            // Get all active students - Note: We fetch ALL active students regardless of year here
            // to process the promotion for the *current* batch.
            const snapshot = await db.collection('students').where('status', '==', StudentStatus.ACTIVE).get();
            
            // Filter to ensure we are only promoting students from the current year context if multiple years existed
            const studentsToPromote = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Student))
                .filter(s => s.academicYear === academicYear || !s.academicYear);

            const batchSize = 500;
            let batch = db.batch();
            let opCount = 0;

            const commitBatch = async () => {
                if (opCount > 0) {
                    await batch.commit();
                    batch = db.batch();
                    opCount = 0;
                }
            };

            for (const student of studentsToPromote) {
                // 1. Archive
                const archiveRef = db.collection(archiveCollectionName).doc(student.id);
                batch.set(archiveRef, student);
                opCount++;

                // 2. Calculate Result
                const gradeDef = gradeDefinitions[student.grade];
                const result = calculateStudentResult(student, gradeDef);

                // 3. Prepare Update
                const updates: Partial<Student> = {
                    academicPerformance: [],
                    feePayments: createDefaultFeePayments(),
                    academicYear: nextAcademicYear, // Move student to the new academic year
                };

                if (result === 'PASS') {
                    if (student.grade === Grade.X) {
                        updates.status = StudentStatus.GRADUATED;
                    } else {
                        const nextGrade = getNextGrade(student.grade);
                        if (nextGrade) {
                            updates.grade = nextGrade;
                        }
                    }
                }
                // If FAIL, grade remains same (detained) but year updates to new year

                const studentRef = db.collection('students').doc(student.id);
                batch.update(studentRef, updates);
                opCount++;

                if (opCount >= batchSize) await commitBatch();
            }
            
            await commitBatch();

            // 4. Update Academic Year Setting
            await db.collection('settings').doc('academic').set({ currentYear: nextAcademicYear }, { merge: true });
            
            addNotification(`Successfully promoted students to academic session ${nextAcademicYear}`, 'success');
            // Force reload to refresh context
            window.location.reload();

        } catch (error: any) {
            console.error("Promotion Error:", error);
            addNotification(`Promotion failed: ${error.message}`, 'error');
        }
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
             <NewsFormModal
                isOpen={isNewsModalOpen}
                onClose={() => setIsNewsModalOpen(false)}
                onSubmit={handleSaveNews}
                item={editingNewsItem}
                isSaving={isSavingNews}
            />
            <HostelResidentFormModal 
                isOpen={isHostelResidentModalOpen}
                onClose={() => setIsHostelResidentModalOpen(false)}
                onSubmit={handleSaveHostelResident}
                resident={editingHostelResident}
                preselectedStudent={null}
                allStudents={studentsForCurrentYear}
                allResidents={hostelResidents}
                isSaving={isSavingHostelResident}
            />
             <HostelStaffFormModal
                isOpen={isHostelStaffModalOpen}
                onClose={() => setIsHostelStaffModalOpen(false)}
                onSubmit={handleSaveHostelStaff}
                staffMember={editingHostelStaff}
                isSaving={isSavingHostelStaff}
            />

            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<PublicHomePage news={news} />} />
                    <Route path="/news" element={<NewsPage news={news} />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/faculty" element={<FacultyPage staff={staff} gradeDefinitions={gradeDefinitions} />} />
                    <Route path="/rules" element={<RulesPage />} />
                    <Route path="/admissions" element={<AdmissionsPage />} />
                    <Route path="/admissions/status" element={<AdmissionStatusPage />} />
                    <Route path="/fees" element={<FeesPage feeStructure={feeStructure} students={studentsForFees} academicYear={academicYear} onUpdateFeePayments={handleUpdateFeePayments} addNotification={addNotification} />} />
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
                    <Route path="/routine" element={<RoutinePage examSchedules={examSchedules} classSchedules={classSchedules} user={user} onSaveExamRoutine={handleSaveExamRoutine} onDeleteExamRoutine={handleDeleteExamRoutine} onUpdateClassRoutine={handleUpdateClassRoutine} />} />
                    <Route path="/admissions/online" element={<OnlineAdmissionPage onOnlineAdmissionSubmit={handleOnlineAdmissionSubmit} />} />
                    <Route path="/admissions/payment/:admissionId" element={<AdmissionPaymentPage onUpdateAdmissionPayment={handleUpdateAdmissionPayment} addNotification={addNotification} schoolConfig={schoolConfig} admissionConfig={admissionConfig} />} />
                    <Route path="/portal/syllabus/:grade" element={<SyllabusPage syllabus={syllabus} gradeDefinitions={gradeDefinitions} />} />
                    <Route path="/login" element={<LoginPage onLogin={async (e, p) => { try { await auth.signInWithEmailAndPassword(e, p); return {success:true}; } catch(err:any){ return {success:false, message:err.message}; } }} onGoogleSignIn={handleGoogleSignIn} error="" notification="" />} />
                    <Route path="/signup" element={<SignUpPage onSignUp={async () => ({success: true})} />} />
                    <Route path="/parent-registration" element={<ParentRegistrationPage />} />
                    <Route path="/parent-signup" element={<ParentSignUpPage onSignUp={handleParentSignUp} />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage onForgotPassword={async () => ({success: true})} />} />
                    <Route path="/reset-password" element={<ResetPasswordPage onResetPassword={async () => ({success: true})} />} />
                    <Route path="/sitemap.xml" element={<SitemapXmlPage sitemapContent={sitemapContent} />} />
                </Route>

                {user ? (
                    <Route element={
                        <DashboardLayout 
                            user={user} 
                            onLogout={handleLogout} 
                            students={studentsForCurrentYear} 
                            staff={staff} 
                            tcRecords={tcRecords} 
                            serviceCerts={serviceCerts} 
                            academicYear={academicYear}
                        />
                    }>
                        <Route path="/portal/dashboard" element={
                            user.role === 'parent' ? <Navigate to="/portal/parent-dashboard" replace /> :
                            user.role === 'warden' ? <Navigate to="/portal/hostel-dashboard" replace /> :
                            <DashboardPage user={user} studentCount={studentsForCurrentYear.length} academicYear={academicYear} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} calendarEvents={calendarEvents} pendingAdmissionsCount={pendingAdmissionsCount} pendingParentCount={pendingParentCount} pendingStaffCount={pendingStaffCount} onUpdateAcademicYear={handleUpdateAcademicYear} />
                        } />
                        <Route path="/portal/parent-dashboard" element={<ParentDashboardPage feeStructure={feeStructure} user={user} allStudents={students} onLinkChild={handleLinkChildRequest} currentAttendance={currentStudentAttendance} news={news} staff={staff} gradeDefinitions={gradeDefinitions} homework={homework} syllabus={syllabus} onSendMessage={handleSendMessage} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth}/>} />
                        {user.role === 'admin' && (
                            <>
                                <Route path="/portal/admin" element={<AdminPage pendingAdmissionsCount={pendingAdmissionsCount} pendingParentCount={pendingParentCount} pendingStaffCount={pendingStaffCount} />} />
                                <Route path="/portal/admission-settings" element={<AdmissionSettingsPage admissionConfig={admissionConfig} onUpdateConfig={handleUpdateAdmissionConfig} />} />
                            </>
                        )}
                        <Route path="/portal/students" element={<StudentListPage students={studentsForCurrentYear} onAdd={() => undefined} onEdit={() => undefined} academicYear={academicYear} user={user} assignedGrade={assignedGrade} />} />
                        <Route path="/portal/student/:studentId" element={<StudentDetailPage students={students} onEdit={() => undefined} academicYear={academicYear} user={user} assignedGrade={assignedGrade} feeStructure={feeStructure} conductLog={conductLog} hostelDisciplineLog={hostelDisciplineLog} onAddConductEntry={handleAddConductEntry} onDeleteConductEntry={handleDeleteConductEntry} />} />
                        <Route path="/portal/classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={() => undefined} user={user} />} />
                        <Route path="/portal/classes/:grade" element={<ClassStudentsPage students={studentsForCurrentYear} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateClassTeacher={() => undefined} academicYear={academicYear} onOpenImportModal={() => undefined} onDelete={() => undefined} user={user} assignedGrade={assignedGrade} onAddStudentToClass={() => undefined} onUpdateBulkFeePayments={async () => undefined} feeStructure={feeStructure} />} />
                        <Route path="/portal/classes/:grade/attendance" element={<StudentAttendancePage students={studentsForCurrentYear} allAttendance={currentStudentAttendance} onUpdateAttendance={handleUpdateAttendance} user={user} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} fetchStudentAttendanceForRange={async () => ({})} academicYear={academicYear} assignedGrade={assignedGrade} calendarEvents={calendarEvents} />} />
                        <Route path="/portal/student/:studentId/attendance-log" element={<StudentAttendanceLogPage students={students} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} user={user} calendarEvents={calendarEvents} />} />
                        <Route path="/portal/staff" element={<ManageStaffPage staff={staff} gradeDefinitions={gradeDefinitions} onAdd={() => undefined} onEdit={() => undefined} onDelete={() => undefined} user={user} />} />
                        <Route path="/portal/staff/:staffId" element={<StaffDetailPage staff={staff} onEdit={() => undefined} gradeDefinitions={gradeDefinitions} />} />
                        <Route path="/portal/staff/attendance" element={<StaffAttendancePage user={user} staff={staff} attendance={currentStaffAttendance} onMarkAttendance={handleMarkStaffAttendance} fetchStaffAttendanceForMonth={async () => ({})} fetchStaffAttendanceForRange={async () => ({})} academicYear={academicYear} calendarEvents={calendarEvents} />} />
                        <Route path="/portal/staff/attendance-logs" element={<StaffAttendanceLogPage staff={staff} students={students} gradeDefinitions={gradeDefinitions} fetchStaffAttendanceForMonth={async () => ({})} fetchStaffAttendanceForRange={async () => ({})} academicYear={academicYear} user={user} calendarEvents={calendarEvents} />} />
                        <Route path="/portal/fees" element={<FeeManagementPage students={studentsForFees} academicYear={academicYear} onUpdateFeePayments={handleUpdateFeePayments} user={user} feeStructure={feeStructure} onUpdateFeeStructure={handleUpdateFeeStructure} addNotification={addNotification} />} />
                        <Route path="/portal/reports/academics" element={<ReportSearchPage students={studentsForCurrentYear} academicYear={academicYear} />} />
                        <Route path="/portal/student/:studentId/academics" element={<AcademicPerformancePage students={students} onUpdateAcademic={handleUpdateAcademic} gradeDefinitions={gradeDefinitions} academicYear={academicYear} user={user} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} />} />
                        <Route path="/portal/reports/class/:grade/:examId" element={<ClassMarkStatementPage students={studentsForCurrentYear} academicYear={academicYear} user={user} gradeDefinitions={gradeDefinitions} onUpdateAcademic={handleUpdateAcademic} onUpdateGradeDefinition={handleUpdateGradeDefinition} />} />
                        <Route path="/portal/insights" element={<InsightsPage students={studentsForCurrentYear} gradeDefinitions={gradeDefinitions} conductLog={conductLog} user={user} />} />
                        <Route path="/portal/homework-scanner" element={<HomeworkScannerPage />} />
                        <Route path="/portal/activity-log" element={<ActivityLogPage students={studentsForCurrentYear} user={user} gradeDefinitions={gradeDefinitions} academicYear={academicYear} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onBulkUpdateActivityLogs={async () => undefined} />} />
                        <Route path="/portal/routine" element={<RoutinePage examSchedules={examSchedules} classSchedules={classSchedules} user={user} onSaveExamRoutine={handleSaveExamRoutine} onDeleteExamRoutine={handleDeleteExamRoutine} onUpdateClassRoutine={handleUpdateClassRoutine} />} />
                        <Route path="/portal/subjects" element={<ManageSubjectsPage gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} user={user} onResetAllMarks={async () => undefined} />} />
                        <Route path="/portal/exams" element={<ExamSelectionPage />} />
                        <Route path="/portal/exams/:examId" element={<ExamClassSelectionPage gradeDefinitions={gradeDefinitions} staff={staff} user={user} />} />
                        <Route path="/portal/promotion" element={<PromotionPage students={studentsForCurrentYear} gradeDefinitions={gradeDefinitions} academicYear={academicYear} onPromoteStudents={handlePromoteStudents} user={user} />} />
                        <Route path="/portal/staff/certificates" element={<StaffDocumentsPage serviceCertificateRecords={serviceCerts} user={user} />} />
                        <Route path="/portal/staff/certificates/generate" element={<GenerateServiceCertificatePage staff={staff} onSave={() => undefined} user={user} />} />
                        <Route path="/portal/staff/certificates/print/:certId" element={<PrintServiceCertificatePage serviceCertificateRecords={serviceCerts} />} />
                        <Route path="/portal/transfers" element={<TransferManagementPage />} />
                        <Route path="/portal/transfers/generate" element={<GenerateTcPage students={students} tcRecords={tcRecords} academicYear={academicYear} onGenerateTc={async () => true} isSaving={false} />} />
                        <Route path="/portal/transfers/generate/:studentId" element={<GenerateTcPage students={students} tcRecords={tcRecords} academicYear={academicYear} onGenerateTc={async () => true} isSaving={false} />} />
                        <Route path="/portal/transfers/records" element={<TcRecordsPage tcRecords={tcRecords} />} />
                        <Route path="/portal/transfers/print/:tcId" element={<PrintTcPage tcRecords={tcRecords} />} />
                        <Route path="/progress-report/:studentId/:examId" element={<ProgressReportPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} academicYear={academicYear} />} />
                        <Route path="/portal/reports/bulk-print/:grade/:examId" element={<BulkProgressReportPage students={studentsForCurrentYear} staff={staff} gradeDefinitions={gradeDefinitions} academicYear={academicYear} />} />
                        <Route path="/portal/hostel-dashboard" element={<HostelDashboardPage disciplineLog={hostelDisciplineLog} />} />
                        <Route path="/portal/hostel/students" element={<HostelStudentListPage residents={hostelResidents} students={students} onAdd={handleOpenAddHostelResident} onAddById={handleAddHostelResidentById} onEdit={handleOpenEditHostelResident} onDelete={handleDeleteHostelResident} user={user} academicYear={academicYear} />} />
                        <Route path="/portal/hostel/rooms" element={<HostelRoomListPage residents={hostelResidents} students={students} />} />
                        <Route path="/portal/hostel/fees" element={<HostelFeePage />} />
                        <Route path="/portal/hostel/attendance" element={<HostelAttendancePage />} />
                        <Route path="/portal/hostel/mess" element={<HostelMessPage />} />
                        <Route path="/portal/hostel/staff" element={<HostelStaffPage staff={hostelStaff} onAdd={handleOpenAddHostelStaff} onEdit={handleOpenEditHostelStaff} onDelete={handleDeleteHostelStaff} user={user} />} />
                        <Route path="/portal/hostel/inventory" element={<HostelInventoryPage inventory={hostelInventory} stockLogs={hostelStockLogs} onUpdateStock={handleUpdateHostelStock} user={user} />} />
                        <Route path="/portal/hostel/discipline" element={<HostelDisciplinePage user={user} students={students} residents={hostelResidents} disciplineLog={hostelDisciplineLog} onSave={handleSaveHostelDisciplineEntry} onDelete={handleDeleteHostelDisciplineEntry} academicYear={academicYear} />} />
                        <Route path="/portal/hostel/health" element={<HostelHealthPage />} />
                        <Route path="/portal/hostel/communication" element={<HostelCommunicationPage />} />
                        <Route path="/portal/hostel/settings" element={<HostelSettingsPage />} />
                        <Route path="/portal/hostel/chores" element={<HostelChoreRosterPage user={user} students={students} residents={hostelResidents} choreRoster={hostelChoreRoster} onUpdateChoreRoster={handleUpdateChoreRoster} academicYear={academicYear} />} />
                        <Route path="/portal/communication" element={<CommunicationPage students={studentsForCurrentYear} user={user} />} />
                        <Route path="/portal/calendar" element={<CalendarPage events={calendarEvents} user={user} onAdd={() => undefined} onEdit={() => undefined} onDelete={() => undefined} notificationDaysBefore={-1} onUpdatePrefs={() => undefined} />} />
                        <Route path="/portal/news-management" element={<ManageNewsPage news={news} onAdd={handleOpenAddNews} onEdit={handleOpenEditNews} onDelete={handleDeleteNews} user={user} />} />
                        <Route path="/portal/users" element={<UserManagementPage allUsers={allUsers} currentUser={user} onUpdateUserRole={handleUpdateUserRole} onDeleteUser={handleDeleteUser} />} />
                        <Route path="/portal/parents" element={<ParentsManagementPage allUsers={allUsers} students={students} academicYear={academicYear} currentUser={user} onDeleteUser={handleDeleteUser} onUpdateUser={handleUpdateUser} />} />
                        <Route path="/portal/admissions" element={<OnlineAdmissionsListPage admissions={onlineAdmissions} onUpdateStatus={handleUpdateAdmissionStatus} />} />
                        <Route path="/portal/profile" element={<UserProfilePage currentUser={user} onUpdateProfile={handleUpdateUserProfile} />} />
                        <Route path="/portal/change-password" element={<ChangePasswordPage onChangePassword={handleChangePassword} />} />
                        <Route path="/portal/sitemap-editor" element={<SitemapEditorPage initialContent={sitemapContent} onSave={async () => undefined} />} />
                        <Route path="/portal/inventory" element={<InventoryPage inventory={[]} onAdd={() => undefined} onEdit={() => undefined} onDelete={() => undefined} user={user} />} />
                        <Route path="/portal/manage-homework" element={<ManageHomeworkPage user={user} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onSave={async () => {}} onDelete={async () => {}} allHomework={homework} />} />
                        <Route path="/portal/manage-syllabus" element={<ManageSyllabusPage user={user} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onSave={async () => {}} allSyllabus={syllabus} gradeDefinitions={gradeDefinitions}/>} />
                        <Route path="/portal/manage-notices" element={<ManageNoticesPage user={user} allNotices={notices} onSave={handleSaveNotice} onDelete={handleDeleteNotice} />} />
                        <Route path="/portal/settings" element={<SchoolSettingsPage config={schoolConfig} onUpdate={handleUpdateSchoolConfig} />} />
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
