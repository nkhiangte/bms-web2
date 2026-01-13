




import React, { useState, useEffect, useCallback, lazy, Suspense, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
// FIX: Corrected import paths
import { auth, db, firebase } from './firebaseConfig';
import { 
    User, Student, Staff, Grade, GradeDefinition, FeeStructure,
    InventoryItem, HostelResident, HostelStaff, StockLog, HostelDisciplineEntry, HostelInventoryItem, 
    StaffAttendanceRecord, StudentAttendanceRecord, DailyStudentAttendance, 
    CalendarEvent, ConductEntry, NewsItem, ChoreRoster, ServiceCertificateRecord, FeePayments, StudentStatus, TcRecord,
    Exam, AttendanceStatus, ExamRoutine, DailyRoutine, OnlineAdmission
} from './types';
import { 
    GRADE_DEFINITIONS, DEFAULT_FEE_STRUCTURE,
    GRADES_LIST, HOSTEL_DORMITORY_LIST, TERMINAL_EXAMS, ROUTINE_DAYS, PERIOD_TIMES, PERIOD_LABELS,
    examRoutines as defaultExamRoutines
} from './constants';
import { timetableData } from './timetableData';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';

// Components
import StudentFormModal from './components/StudentFormModal';
import ConfirmationModal from './components/ConfirmationModal';
import NotificationContainer from './components/NotificationContainer';
import OfflineIndicator from './components/OfflineIndicator';
import { createDefaultFeePayments, getCurrentAcademicYear, getNextGrade, formatStudentId, normalizeSubjectName, parseSubjectAndTeacher, formatDateForDisplay } from './utils';

const { Routes, Route, Navigate, useNavigate, useLocation } = ReactRouterDOM as any;

// Lazy-loaded Modals
const StaffFormModal = lazy(() => import('./components/StaffFormModal'));
const InventoryFormModal = lazy(() => import('./components/InventoryFormModal'));
const HostelResidentFormModal = lazy(() => import('./components/HostelResidentFormModal'));
const HostelStaffFormModal = lazy(() => import('./components/HostelStaffFormModal'));
const HostelDisciplineFormModal = lazy(() => import('./components/HostelDisciplineFormModal'));
const NewsFormModal = lazy(() => import('./components/NewsFormModal'));
const CalendarEventFormModal = lazy(() => import('./components/CalendarEventFormModal'));
const ImportStudentsModal = lazy(() => import('./components/ImportStudentsModal').then(m => ({ default: m.ImportStudentsModal })));

// Lazy-loaded Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StudentListPage = lazy(() => import('./pages/StudentListPage'));
const StudentDetailPage = lazy(() => import('./pages/StudentDetailPage'));
const ClassListPage = lazy(() => import('./pages/ClassListPage'));
const ClassStudentsPage = lazy(() => import('./pages/ClassStudentsPage'));
const StudentAttendancePage = lazy(() => import('./pages/StudentAttendancePage'));
const ManageStaffPage = lazy(() => import('./pages/ManageStaffPage').then(m => ({ default: m.ManageStaffPage })));
const StaffDetailPage = lazy(() => import('./pages/StaffDetailPage'));
const StaffAttendancePage = lazy(() => import('./pages/StaffAttendancePage'));
const StaffAttendanceLogPage = lazy(() => import('./pages/StaffAttendanceLogPage'));
const StaffDocumentsPage = lazy(() => import('./pages/StaffDocumentsPage'));
const GenerateServiceCertificatePage = lazy(() => import('./pages/GenerateServiceCertificatePage'));
const PrintServiceCertificatePage = lazy(() => import('./pages/PrintServiceCertificatePage'));
const FeeManagementPage = lazy(() => import('./pages/FeeManagementPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const HostelDashboardPage = lazy(() => import('./pages/HostelDashboardPage'));
const HostelStudentListPage = lazy(() => import('./pages/HostelStudentListPage'));
const HostelRoomListPage = lazy(() => import('./pages/HostelRoomListPage'));
const HostelFeePage = lazy(() => import('./pages/HostelFeePage'));
const HostelAttendancePage = lazy(() => import('./pages/HostelAttendancePage'));
const HostelMessPage = lazy(() => import('./pages/HostelMessPage'));
const HostelStaffPage = lazy(() => import('./pages/HostelStaffPage'));
const HostelInventoryPage = lazy(() => import('./pages/HostelInventoryPage'));
const HostelDisciplinePage = lazy(() => import('./pages/HostelDisciplinePage'));
const HostelHealthPage = lazy(() => import('./pages/HostelHealthPage'));
const HostelCommunicationPage = lazy(() => import('./pages/HostelCommunicationPage'));
const HostelSettingsPage = lazy(() => import('./pages/HostelSettingsPage'));
const HostelChoreRosterPage = lazy(() => import('./pages/HostelChoreRosterPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const CommunicationPage = lazy(() => import('./pages/CommunicationPage'));
const ManageNewsPage = lazy(() => import('./pages/ManageNewsPage'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage').then(m => ({ default: m.UserManagementPage })));
const PromotionPage = lazy(() => import('./pages/PromotionPage'));
const ParentSignUpPage = lazy(() => import('./pages/ParentSignUpPage'));
const ParentDashboardPage = lazy(() => import('./pages/ParentDashboardPage'));
const RoutinePage = lazy(() => import('./pages/public/RoutinePage'));
const ManageSubjectsPage = lazy(() => import('./pages/ManageSubjectsPage').then(m => ({ default: m.ManageSubjectsPage })));
const ReportSearchPage = lazy(() => import('./pages/ReportSearchPage'));
const AcademicPerformancePage = lazy(() => import('./pages/AcademicPerformancePage'));
const ActivityLogPage = lazy(() => import('./pages/ActivityLogPage'));
const ClassMarkStatementPage = lazy(() => import('./pages/ClassMarkStatementPage'));
const BulkProgressReportPage = lazy(() => import('./pages/BulkProgressReportPage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const StudentAttendanceLogPage = lazy(() => import('./pages/StudentAttendanceLogPage'));
const HomeworkScannerPage = lazy(() => import('./pages/HomeworkScannerPage'));
const TransferManagementPage = lazy(() => import('./pages/TransferManagementPage'));
const GenerateTcPage = lazy(() => import('./pages/GenerateTcPage'));
const TcRecordsPage = lazy(() => import('./pages/TcRecordsPage'));
const PrintTcPage = lazy(() => import('./pages/PrintTcPage'));

// Public Pages
const PublicHomePage = lazy(() => import('./pages/public/PublicHomePage'));
const NewsPage = lazy(() => import('./pages/public/NewsPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const AdmissionsPage = lazy(() => import('./pages/public/AdmissionsPage'));
const OnlineAdmissionPage = lazy(() => import('./pages/public/OnlineAdmissionPage'));
const FeesPage = lazy(() => import('./pages/public/FeesPage'));
const StudentLifePage = lazy(() => import('./pages/public/StudentLifePage'));
const FacilitiesPage = lazy(() => import('./pages/public/FacilitiesPage'));
const FacultyPage = lazy(() => import('./pages/public/FacultyPage'));
const SuppliesPage = lazy(() => import('./pages/public/SuppliesPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const HistoryPage = lazy(() => import('./pages/public/HistoryPage'));
const RulesPage = lazy(() => import('./pages/public/RulesPage'));
const SportsPage = lazy(() => import('./pages/public/SportsPage'));
const NccPage = lazy(() => import('./pages/public/NccPage'));
const EcoClubPage = lazy(() => import('./pages/public/EcoClubPage'));
const ArtsCulturePage = lazy(() => import('./pages/public/ArtsCulturePage'));
const ScienceClubPage = lazy(() => import('./pages/public/ScienceClubPage'));
const InfrastructurePage = lazy(() => import('./pages/public/InfrastructurePage'));
const HostelPage = lazy(() => import('./pages/public/HostelPage'));
const GalleryPage = lazy(() => import('./pages/public/GalleryPage'));
const SitemapPage = lazy(() => import('./pages/public/SitemapPage'));
const SitemapXmlPage = lazy(() => import('./pages/public/SitemapXmlPage'));
const PublicStaffDetailPage = lazy(() => import('./pages/public/PublicStaffDetailPage'));
const QuizClubPage = lazy(() => import('./pages/public/QuizClubPage'));
const AcademicsPage = lazy(() => import('./pages/public/AcademicsPage'));
const CurriculumPage = lazy(() => import('./pages/public/CurriculumPage'));
const AcademicAchievementsPage = lazy(() => import('./pages/public/AcademicAchievementsPage'));
const DistinctionHoldersPage = lazy(() => import('./pages/public/DistinctionHoldersPage'));
const SlsmeePage = lazy(() => import('./pages/public/SlsmeePage'));
const InspireAwardPage = lazy(() => import('./pages/public/InspireAwardPage'));
const NcscPage = lazy(() => import('./pages/public/NcscPage'));
const ScienceTourPage = lazy(() => import('./pages/public/ScienceTourPage'));
const IncentiveAwardsPage = lazy(() => import('./pages/public/IncentiveAwardsPage'));
const MathematicsCompetitionPage = lazy(() => import('./pages/public/MathematicsCompetitionPage'));
const SitemapEditorPage = lazy(() => import('./pages/SitemapEditorPage'));
const ProgressReportPage = lazy(() => import('./pages/ProgressReportPage'));


const FullScreenLoader: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-slate-100 flex items-center justify-center z-50">
            <div className="text-center">
                <img src="https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png" alt="Bethel Mission School Logo" className="mx-auto h-32 mb-4 animate-pulse" />
                <p className="text-slate-700 font-semibold">Loading Application...</p>
            </div>
        </div>
    );
};

type DeletionItem = 
    | { type: 'student'; data: Student }
    | { type: 'staff'; data: Staff }
    | { type: 'inventory'; data: InventoryItem }
    | { type: 'hostelResident'; data: HostelResident }
    | { type: 'hostelStaff'; data: HostelStaff }
    | { type: 'hostelDiscipline'; data: HostelDisciplineEntry }
    | { type: 'news'; data: NewsItem }
    | { type: 'calendar'; data: CalendarEvent }
    | { type: 'user'; data: User }
    | { type: 'examRoutine'; data: ExamRoutine };

// Safe array helper to prevent undefined length errors
const safeArray = <T,>(array: T[] | undefined | null): T[] => {
    return Array.isArray(array) ? array : [];
};

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState('');
    const [academicYear, setAcademicYear] = useState<string>('');
    
    const [students, setStudents] = useState<Student[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [gradeDefinitions, setGradeDefinitions] = useState<Record<Grade, GradeDefinition>>(GRADE_DEFINITIONS);
    const [feeStructure, setFeeStructure] = useState<FeeStructure>(DEFAULT_FEE_STRUCTURE);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [hostelResidents, setHostelResidents] = useState<HostelResident[]>([]);
    const [hostelStaff, setHostelStaff] = useState<HostelStaff[]>([]);
    const [hostelInventory, setHostelInventory] = useState<HostelInventoryItem[]>([]);
    const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
    const [hostelDisciplineLog, setHostelDisciplineLog] = useState<HostelDisciplineEntry[]>([]);
    const [staffAttendance, setStaffAttendance] = useState<Record<string, StaffAttendanceRecord>>({});
    const [studentAttendance, setStudentAttendance] = useState<DailyStudentAttendance | null>(null);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [conductLog, setConductLog] = useState<ConductEntry[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [choreRoster, setChoreRoster] = useState<ChoreRoster>({});
    const [serviceCerts, setServiceCerts] = useState<ServiceCertificateRecord[]>([]);
    const [tcRecords, setTcRecords] = useState<TcRecord[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [sitemapContent, setSitemapContent] = useState<string>('');
    const [calendarPrefs, setCalendarPrefs] = useState({ notificationDaysBefore: -1 });
    const [isReminderServiceActive, setIsReminderServiceActive] = useState(() => {
        try {
            return localStorage.getItem('isReminderServiceActive') === 'true';
        } catch {
            return false;
        }
    });
    
    // Initialize with default data to prevent empty flash and ensure restore functionality
    const [examSchedules, setExamSchedules] = useState<ExamRoutine[]>(defaultExamRoutines.map((r, idx) => ({ id: `default-${idx}`, ...r })));
    const [classSchedules, setClassSchedules] = useState<Record<string, DailyRoutine>>(timetableData);

    const navigate = useNavigate();
    const location = useLocation();

    const [notifications, setNotifications] = useState<any[]>([]);
    const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info' | 'offline', title?: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, message, type, title }]);
    }, []);
    
    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    
    const handleToggleReminderService = (isActive: boolean) => {
        setIsReminderServiceActive(isActive);
        try {
            localStorage.setItem('isReminderServiceActive', String(isActive));
            addNotification(`SMS Reminder service is now ${isActive ? 'ACTIVE' : 'INACTIVE'}.`, 'info');
        } catch (e) {
            console.error("Could not save reminder service preference:", e);
            addNotification("Could not save reminder preference.", 'error');
        }
    };

    useEffect(() => {
        let userListener: (() => void) | undefined;

        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
          if (userListener) userListener();

          if (firebaseUser) {
            userListener = db
              .collection('users')
              .doc(firebaseUser.uid)
              .onSnapshot(
                async (userDoc) => {
                  try {
                    if (userDoc.exists) {
                      const userData = userDoc.data();
                      setUser({ uid: firebaseUser.uid, ...(userData as Omit<User, 'uid'>) });
                    } else {
                      await db.collection('users').doc(firebaseUser.uid).set({
                        displayName: firebaseUser.displayName,
                        email: firebaseUser.email,
                        photoURL: firebaseUser.photoURL,
                        role: 'pending',
                      });
                    }

                    const settingsDoc = await db.collection('settings').doc('academic').get();
                    if (settingsDoc.exists) {
                      const year = settingsDoc.data()?.year;
                      if (year) {
                        setAcademicYear(year);
                      } else {
                        addNotification('Critical: Academic year setting is missing.', 'error');
                      }
                    } else {
                      addNotification('Critical: Could not find academic year settings.', 'error');
                    }
                  } catch (error) {
                    console.error('Error fetching user data or settings:', error);
                    addNotification('Failed to fetch user profile or settings.', 'error');
                    auth.signOut();
                  }
                },
                (error) => {
                  console.error('Error listening to user document:', error);
                  addNotification('Failed to listen for user profile updates.', 'error');
                  auth.signOut();
                }
              );
          } else {
            setUser(null);
            setAcademicYear('');
            setLoading(false);
          }
        });

        return () => {
          unsubscribe();
          if (userListener) userListener();
        };
      }, [addNotification]);
    
    // Data Listeners
    useEffect(() => {
        const unsubscribers: (() => void)[] = [];
    
        const addListener = (query: any, setter: React.Dispatch<any>, collectionName: string, normalizer?: (data: any) => any) => {
            const unsub = query.onSnapshot(
                (snapshot: firebase.firestore.DocumentSnapshot | firebase.firestore.QuerySnapshot) => {
                    try {
                        if ('docs' in snapshot) { // Type guard for QuerySnapshot
                            const docs = safeArray(snapshot.docs);
                            const data = docs.map((doc: firebase.firestore.QueryDocumentSnapshot) => normalizer ? normalizer({ id: doc.id, ...doc.data() }) : ({ id: doc.id, ...doc.data() }));
                            setter(data);
                        } else { // DocumentSnapshot
                            const data = snapshot.exists ? snapshot.data() : null;
                            if (collectionName === 'user calendar prefs') {
                                const prefsData = (typeof data === 'object' && data !== null) ? data : {};
                                setter({ notificationDaysBefore: -1, ...prefsData });
                            } else {
                                setter(data);
                            }
                        }
                    } catch (error) {
                        console.error(`Error processing ${collectionName}:`, error);
                    }
                },
                (err: any) => {
                    console.error(`Error fetching ${collectionName}:`, err.message);
                    addNotification(`Failed to load ${collectionName}.`, 'error');
                }
            );
            unsubscribers.push(unsub);
        };
        
        // Routine Listeners (Available to all)
        // Exam Routines
        db.collection('examRoutines').onSnapshot((snapshot: any) => {
            const data = (safeArray(snapshot.docs) as any[]).map((doc: any) => ({ id: doc.id, ...doc.data() } as ExamRoutine));
            // Always set the data from the DB, even if empty. 
            // This allows the user to delete all routines if desired.
            setExamSchedules(data);
        }, (error: any) => {
            console.log("Firestore error (examRoutines):", error.message);
            // Fallback is already set in initial state, so we just log the error
        });

        // Class Routines
        db.collection('classRoutines').onSnapshot((snapshot: any) => {
            const data: Record<string, DailyRoutine> = {};
            const docs = safeArray(snapshot.docs) as any[];
            
            // Always process docs, even if empty (which results in empty data object)
            docs.forEach((doc: any) => {
                data[doc.id] = doc.data().routine;
            });
            
            setClassSchedules(data);
        }, (error: any) => {
            console.log("Firestore error (classRoutines):", error.message);
            // Fallback is already set in initial state
        });

        
        const staffNormalizer = (data: any) => ({ ...data, status: data.status || 'Active', staffType: data.staffType || 'Teaching' });
        const feeSetter = (data: FeeStructure | null) => setFeeStructure(data || DEFAULT_FEE_STRUCTURE);
        const newsSetter = (data: NewsItem[]) => {
            const safeData = safeArray(data);
            setNews(safeData.sort((a,b) => (b.date || '').localeCompare(a.date || '')));
        };
        const sitemapSetter = (data: {xml: string} | null) => setSitemapContent(data?.xml || '');
        const calendarSetter = (data: CalendarEvent[]) => {
            const safeData = safeArray(data);
            setCalendarEvents(safeData.sort((a,b) => (a.date || '').localeCompare(b.date || '')));
        };
        
        const gradeDefSetter = (doc: firebase.firestore.DocumentSnapshot) => {
            const dbGrades = doc.exists ? doc.data()?.grades || {} : {};
            const newDefinitions = JSON.parse(JSON.stringify(GRADE_DEFINITIONS));
            GRADES_LIST.forEach(gradeKey => {
                if (dbGrades[gradeKey]) newDefinitions[gradeKey] = { ...newDefinitions[gradeKey], ...dbGrades[gradeKey] };
            });

            if (newDefinitions[Grade.NURSERY]) {
                newDefinitions[Grade.NURSERY].subjects = GRADE_DEFINITIONS[Grade.NURSERY].subjects;
            }

            setGradeDefinitions(newDefinitions);
        };

        if (user && ['admin', 'user', 'warden'].includes(user.role)) {
            addListener(db.collection('staff'), setStaff, 'staff', staffNormalizer);
            addListener(db.collection('config').doc('feeStructure'), feeSetter, 'fee structure');
            addListener(db.collection('news'), newsSetter, 'news');
            addListener(db.doc('config/sitemap'), sitemapSetter, 'sitemap');
            unsubscribers.push(db.collection('config').doc('gradeDefinitions').onSnapshot(gradeDefSetter));
            addListener(db.collection('calendarEvents'), calendarSetter, 'calendar events');
        } else {
            db.collection('staff').get().then(snap => {
                const docs = safeArray(snap.docs);
                setStaff(docs.map((d: any) => staffNormalizer({ id: d.id, ...d.data() })));
            }).catch(e => console.warn(`Public staff fetch failed: ${e.message}`));
            
            db.collection('config').doc('feeStructure').get().then(d => feeSetter(d.exists ? d.data() as FeeStructure : null)).catch(e => console.warn(`Public fee structure fetch failed: ${e.message}`));
            db.collection('news').get().then(snap => {
                const docs = safeArray(snap.docs);
                newsSetter(docs.map((d: any) => ({ id: d.id, ...d.data() })) as NewsItem[]);
            }).catch(e => console.warn(`Public news fetch failed: ${e.message}`));
            
            db.doc('config/sitemap').get().then(d => sitemapSetter(d.exists ? d.data() as {xml: string} : null)).catch(e => console.warn(`Public sitemap fetch failed: ${e.message}`));
            db.collection('config').doc('gradeDefinitions').get().then(gradeDefSetter).catch(e => console.warn(`Public grade definitions fetch failed: ${e.message}`));
            db.collection('calendarEvents').get().then(snap => {
                const docs = safeArray(snap.docs);
                calendarSetter(docs.map((d: any) => ({ id: d.id, ...d.data() })) as CalendarEvent[]);
            }).catch(e => console.warn(`Public calendar events fetch failed: ${e.message}`));
        }
    
        if (user && academicYear) {
            const studentNormalizer = (data: any) => ({ ...data, status: data.status || StudentStatus.ACTIVE });
            const todayDocId = new Date().toISOString().split('T')[0];
    
            switch (user.role) {
                case 'admin':
                case 'warden':
                case 'user':
                    addListener(db.collection('students'), setStudents, 'students', studentNormalizer);
                    addListener(db.collection('conductLog'), setConductLog, 'conduct log');
                    addListener(db.collection('studentAttendance').doc(todayDocId), setStudentAttendance, 'student attendance');

                    addListener(db.collection('staffAttendance'), (data: { id: string; [key: string]: any }[]) => {
                        const records: Record<string, StaffAttendanceRecord> = {};
                        const safeData = safeArray(data);
                        safeData.forEach(doc => {
                            const { id, ...attendanceRecord } = doc;
                            records[id] = attendanceRecord as StaffAttendanceRecord;
                        });
                        setStaffAttendance(records);
                    }, 'staff attendance');
    
                    if (user.role === 'admin' || user.role === 'warden') {
                        addListener(db.collection('hostelResidents'), setHostelResidents, 'hostel residents');
                        addListener(db.collection('hostelStaff'), setHostelStaff, 'hostel staff');
                        addListener(db.collection('hostelInventory'), setHostelInventory, 'hostel inventory');
                        addListener(db.collection('stockLogs'), (data: StockLog[]) => {
                            const safeData = safeArray(data);
                            setStockLogs(safeData.sort((a,b) => (b.date || '').localeCompare(a.date || '')));
                        }, 'stock logs');
                        addListener(db.collection('hostelDisciplineLog'), setHostelDisciplineLog, 'hostel discipline');
                        addListener(db.doc('choreRoster/main'), (data: ChoreRoster) => setChoreRoster(data || {}), 'chore roster');
                    }
                    if (user.role === 'admin') {
                        addListener(db.collection('inventory'), setInventory, 'inventory');
                        addListener(db.collection('serviceCertificates'), setServiceCerts, 'service certificates');
                        addListener(db.collection('users'), (data: (User & { id: string })[]) => {
                            const safeData = safeArray(data);
                            setAllUsers(safeData.map(d => ({...d, uid: d.id })));
                        }, 'users');
                        addListener(db.collection('tcRecords'), (data: TcRecord[]) => {
                            const safeData = safeArray(data);
                            setTcRecords(safeData.sort((a,b) => (b.dateOfIssueOfTc || '').localeCompare(a.dateOfIssueOfTc || '')));
                        }, 'tc records');
                    }
                    if (user.role === 'admin' || user.role === 'user') {
                        addListener(db.collection('users').doc(user.uid).collection('prefs').doc('calendar'), setCalendarPrefs, 'user calendar prefs');
                    } else {
                        setCalendarPrefs({ notificationDaysBefore: -1 });
                    }
                    break;
    
                case 'parent':
                    if (user.studentIds && safeArray(user.studentIds).length > 0) {
                        addListener(db.collection('students').where(firebase.firestore.FieldPath.documentId(), 'in', user.studentIds), setStudents, "parent's students", studentNormalizer);
                        addListener(db.collection('conductLog').where('studentId', 'in', user.studentIds), setConductLog, 'parent conduct log');
                        addListener(db.collection('hostelDisciplineLog').where('studentId', 'in', user.studentIds), setHostelDisciplineLog, 'parent hostel discipline');
                    } else {
                        setStudents([]); setConductLog([]); setHostelDisciplineLog([]);
                    }
                    break;
    
                case 'pending':
                case 'pending_parent':
                    break;
            }
            setLoading(false);
    
        } else if (!user) {
            setStudents([]); setInventory([]); setHostelResidents([]); setHostelStaff([]);
            setHostelInventory([]); setStockLogs([]); setHostelDisciplineLog([]);
            setStaffAttendance({}); setStudentAttendance(null); setConductLog([]);
            setChoreRoster({}); setServiceCerts([]); setTcRecords([]); setAllUsers([]);
            setCalendarPrefs({ notificationDaysBefore: -1 });
        }
    
        return () => unsubscribers.forEach(unsub => unsub());
    
    }, [user, academicYear, addNotification]);

    // ... (SMS Notification and Reminder Service useEffect hooks - no changes)

    const staffProfile = useMemo(() => {
        if (!user || !user.email) return null;
        return staff.find(s => s.emailAddress.toLowerCase() === user.email?.toLowerCase());
    }, [user, staff]);

    const assignedGrade = useMemo(() => {
        if (!staffProfile) return null;
        const gradeEntry = Object.entries(gradeDefinitions).find(([, def]: [string, GradeDefinition]) => def.classTeacherId === staffProfile.id);
        return gradeEntry ? (gradeEntry[0] as Grade) : null;
    }, [staffProfile, gradeDefinitions]);

    const assignedSubjects = useMemo(() => {
        return staffProfile?.assignedSubjects || [];
    }, [staffProfile]);

    const userWithProfilePhoto = useMemo(() => {
        if (!user) return null;
        return {
            ...user,
            photoURL: user.photoURL || staffProfile?.photographUrl || user.photoURL
        };
    }, [user, staffProfile]);

    // ... (State variables for modals - no changes)
    
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [newStudentTargetGrade, setNewStudentTargetGrade] = useState<Grade | null>(null);
    
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
    const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);

    const [isHostelResidentModalOpen, setIsHostelResidentModalOpen] = useState(false);
    const [editingHostelResident, setEditingHostelResident] = useState<HostelResident | null>(null);

    const [isHostelStaffModalOpen, setIsHostelStaffModalOpen] = useState(false);
    const [editingHostelStaff, setEditingHostelStaff] = useState<HostelStaff | null>(null);
    
    const [isHostelDisciplineModalOpen, setIsHostelDisciplineModalOpen] = useState(false);
    const [editingHostelDiscipline, setEditingHostelDiscipline] = useState<HostelDisciplineEntry | null>(null);

    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [editingCalendar, setEditingCalendar] = useState<CalendarEvent | null>(null);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importTargetGrade, setImportTargetGrade] = useState<Grade | null>(null);
    
    const [isSaving, setIsSaving] = useState(false);
    const [modalError, setModalError] = useState('');
    const [itemToDelete, setItemToDelete] = useState<DeletionItem | null>(null);

    const handleSave = async (collection: string, data: object, id?: string, successMessage?: string) => {
        setIsSaving(true);
        setModalError('');
        try {
            const collectionRef = db.collection(collection);
            if (id) {
                await collectionRef.doc(id).update(data);
                addNotification(successMessage || 'Item updated successfully!', 'success');
            } else {
                await collectionRef.add(data);
                addNotification(successMessage || 'Item added successfully!', 'success');
            }
            return true;
        } catch (error: any) {
            setModalError(error.message || 'Failed to save data.');
            console.error(`Error saving to ${collection}:`, error);
            return false;
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        const { type, data } = itemToDelete;
        setIsSaving(true);
        try {
            // Special handling for archiving students
            if (type === 'student') {
                const batch = db.batch();
                const studentRef = db.collection('students').doc(data.id);
                // Use a separate collection for archives
                const archiveRef = db.collection('archived_students').doc(data.id);
                
                const archiveData = {
                    ...data,
                    archivedAt: new Date().toISOString(),
                    archivedBy: user?.email || 'Unknown',
                    archiveReason: 'Manual Deletion'
                };

                batch.set(archiveRef, archiveData);
                batch.delete(studentRef);
                
                await batch.commit();
                addNotification(`Student record archived successfully.`, 'success');
            } else if (type === 'examRoutine') {
                await db.collection('examRoutines').doc(data.id).delete();
                addNotification('Exam routine deleted successfully.', 'success');
            } else {
                // Existing logic for other types
                const collectionMap: { [key: string]: string } = {
                    staff: 'staff', inventory: 'inventory',
                    hostelResident: 'hostelResidents', hostelStaff: 'hostelStaff',
                    hostelDiscipline: 'hostelDisciplineLog', news: 'news',
                    calendar: 'calendarEvents', user: 'users'
                };
                const collectionName = collectionMap[type];
                if (!collectionName) throw new Error("Unknown deletion type");

                const docId = 'uid' in data ? data.uid : data.id;
                await db.collection(collectionName).doc(docId).delete();
                addNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} record deleted.`, 'success');
            }
        } catch (error: any) {
            console.error(`Error deleting ${type}:`, error);
            addNotification(`Failed to delete ${type}: ${error.message}`, 'error');
        } finally {
            setItemToDelete(null);
            setIsSaving(false);
        }
    };

    // ... (Handler functions for modals - no changes)
    const handleAddStudent = () => {
        setNewStudentTargetGrade(null);
        setEditingStudent(null);
        setIsStudentModalOpen(true);
    };

    const handleSetAcademicYear = async (year: string) => {
        try {
            await db.collection('settings').doc('academic').set({ year });
            addNotification(`Academic year changed to ${year}.`, 'success');
        } catch (error: any) {
            console.error("Error updating academic year:", error);
            addNotification(error.message || 'Failed to update academic year.', 'error');
        }
    };

    const handleStudentSubmit = async (studentData: Omit<Student, 'id'>) => {
        const success = await handleSave('students', studentData, editingStudent?.id, editingStudent ? 'Student updated!' : 'Student added!');
        if(success) setIsStudentModalOpen(false);
    };

    const handleStaffSubmit = async (staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => {
        setIsSaving(true);
        const batch = db.batch();
        const staffRef = editingStaff 
            ? db.collection('staff').doc(editingStaff.id)
            : db.collection('staff').doc();

        batch.set(staffRef, staffData, { merge: true });

        const currentAssignment = Object.entries(gradeDefinitions).find(([,def]: [string, GradeDefinition]) => def.classTeacherId === staffRef.id)?.[0];
        
        if (currentAssignment !== assignedGradeKey) { 
            if (currentAssignment) { 
                const oldGradeDef = { ...gradeDefinitions[currentAssignment as Grade], classTeacherId: firebase.firestore.FieldValue.delete() };
                batch.set(db.collection('config').doc('gradeDefinitions'), { grades: { [currentAssignment]: oldGradeDef } }, { merge: true });
            }
            if (assignedGradeKey) { 
                const newGradeDef = { ...gradeDefinitions[assignedGradeKey], classTeacherId: staffRef.id };
                batch.set(db.collection('config').doc('gradeDefinitions'), { grades: { [assignedGradeKey]: newGradeDef } }, { merge: true });
            }
        }
        
        try {
            await batch.commit();
            addNotification(editingStaff ? 'Staff updated successfully!' : 'Staff added successfully!', 'success');
            setIsStaffModalOpen(false);
        } catch (error) {
            console.error("Error saving staff data:", error);
            addNotification("Failed to save staff data.", "error");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleInventorySubmit = async (item: Omit<InventoryItem, 'id'>) => {
        const success = await handleSave('inventory', item, editingInventory?.id);
        if (success) setIsInventoryModalOpen(false);
    };
    
    const handleHostelResidentSubmit = async (resident: Omit<HostelResident, 'id'>) => {
        const success = await handleSave('hostelResidents', resident, editingHostelResident?.id);
        if(success) setIsHostelResidentModalOpen(false);
    };
    
    const handleHostelStaffSubmit = async (staffMember: Omit<HostelStaff, 'id'>) => {
        const success = await handleSave('hostelStaff', staffMember, editingHostelStaff?.id);
        if(success) setIsHostelStaffModalOpen(false);
    };

    const handleHostelDisciplineSubmit = async (entry: Omit<HostelDisciplineEntry, 'id' | 'reportedBy' | 'reportedById'>, id?: string) => {
        const dataToSave = {
            ...entry,
            reportedBy: user!.displayName || user!.email!,
            reportedById: user!.uid,
        };
        const success = await handleSave('hostelDisciplineLog', dataToSave, id, 'Discipline entry saved!');
        if(success) setIsHostelDisciplineModalOpen(false);
    };

    const handleNewsSubmit = async (item: Omit<NewsItem, 'id'>) => {
        const success = await handleSave('news', item, editingNews?.id);
        if (success) setIsNewsModalOpen(false);
    };

    const handleCalendarEventSubmit = async (event: Omit<CalendarEvent, 'id'>) => {
        const success = await handleSave('calendarEvents', event, editingCalendar?.id);
        if(success) setIsCalendarModalOpen(false);
    };

    const handleOpenImportModal = (grade: Grade | null) => {
        setImportTargetGrade(grade);
        setIsImportModalOpen(true);
    };
    
    const handleImportStudents = async (newStudents: Omit<Student, 'id'>[], grade: Grade) => {
        setIsSaving(true);
        const batch = db.batch();
        newStudents.forEach(student => {
            const studentRef = db.collection('students').doc();
            batch.set(studentRef, student);
        });
        
        try {
            await batch.commit();
            addNotification(`${newStudents.length} students imported successfully into ${grade}!`, 'success');
            setIsImportModalOpen(false);
        } catch (error) {
            console.error("Error importing students:", error);
            addNotification("Failed to import students.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddConductEntry = async (entry: Omit<ConductEntry, 'id'>) => {
        return handleSave('conductLog', entry, undefined, 'Conduct entry added.');
    };

    const handleDeleteConductEntry = async (entryId: string) => {
        try {
            await db.collection('conductLog').doc(entryId).delete();
            addNotification('Conduct entry deleted.', 'success');
        } catch (error) {
            console.error("Error deleting conduct entry:", error);
            addNotification("Failed to delete entry.", 'error');
        }
    };
    
    const handleUpdateGradeDefinition = async (grade: Grade, newDefinition: GradeDefinition) => {
        try {
            await db.collection('config').doc('gradeDefinitions').set({
                grades: { [grade]: newDefinition }
            }, { merge: true });
            addNotification(`Curriculum for ${grade} updated.`, 'success');
        } catch (error) {
            console.error("Failed to update grade definition:", error);
            addNotification("Failed to save curriculum.", 'error');
        }
    };

    const handleUpdateFeePayments = async (studentId: string, payments: FeePayments) => {
        try {
            await db.collection('students').doc(studentId).update({ feePayments: payments });
            addNotification("Fee payment status updated.", 'success');
        } catch (error) {
            console.error("Error updating fee payments:", error);
            addNotification("Failed to update payment status.", 'error');
        }
    };

    const handleUpdateBulkFeePayments = async (updates: Array<{ studentId: string; payments: FeePayments }>) => {
        const batch = db.batch();
        updates.forEach(({ studentId, payments }) => {
            const studentRef = db.collection('students').doc(studentId);
            batch.update(studentRef, { feePayments: payments });
        });
        try {
            await batch.commit();
            addNotification(`${updates.length} students' fee records updated.`, 'success');
        } catch (error) {
            console.error("Error updating bulk fees:", error);
            addNotification('Failed to update fee records.', 'error');
        }
    };

    const handleUpdateFeeStructure = async (newStructure: FeeStructure) => {
        try {
            await db.collection('config').doc('feeStructure').set(newStructure);
            addNotification('Fee structure updated.', 'success');
        } catch (error) {
            console.error("Error updating fee structure:", error);
            addNotification('Failed to update fee structure.', 'error');
        }
    };
    
    const handleUpdateAcademicPerformance = async (studentId: string, performance: Exam[]) => {
        try {
            await db.collection('students').doc(studentId).update({ academicPerformance: performance });
            addNotification("Academic records saved.", "success");
        } catch (e) {
            console.error("Error saving academic data:", e);
            addNotification("Failed to save academic records.", "error");
        }
    };

    const handleBulkUpdateActivityLogs = async (updates: Array<{ studentId: string; examId: 'terminal1' | 'terminal2' | 'terminal3'; subjectName: string; activityLog: any; activityMarks: number }>) => {
        if (updates.length === 0) return;
        
        const batch = db.batch();
        
        updates.forEach(update => {
            const studentRef = db.collection('students').doc(update.studentId);
            const student = students.find(s => s.id === update.studentId);
            if (!student) return;

            const performance = student.academicPerformance ? [...student.academicPerformance] : [];
            let exam = performance.find(e => e.id === update.examId);
            if (!exam) {
                exam = { id: update.examId, name: TERMINAL_EXAMS.find(t => t.id === update.examId)!.name, results: [] };
                performance.push(exam);
            }
            
            let result = exam.results.find(r => normalizeSubjectName(r.subject) === normalizeSubjectName(update.subjectName));
            if (!result) {
                result = { subject: update.subjectName };
                exam.results.push(result);
            }
            
            result.activityLog = update.activityLog;
            result.activityMarks = update.activityMarks;

            batch.update(studentRef, { academicPerformance: performance });
        });

        try {
            await batch.commit();
            addNotification(`Activity logs updated for ${updates.length} students.`, "success");
        } catch (e) {
            console.error("Error bulk updating activity logs:", e);
            addNotification("Failed to save activity logs.", "error");
        }
    };

    const handleUpdateChoreRoster = async (newRoster: ChoreRoster) => {
        try {
            await db.doc('choreRoster/main').set(newRoster, { merge: true });
            addNotification('Chore roster updated successfully.', 'success');
        } catch (e) {
            console.error("Error updating chore roster:", e);
            addNotification('Failed to save chore roster.', 'error');
        }
    };
    
    const handleResetAllMarks = async () => {
        const batch = db.batch();
        students.forEach(student => {
            const studentRef = db.collection('students').doc(student.id);
            batch.update(studentRef, { academicPerformance: firebase.firestore.FieldValue.delete() });
        });
        
        try {
            await batch.commit();
            addNotification("All academic records have been reset.", "success");
        } catch (e) {
            console.error("Error resetting all marks:", e);
            addNotification("Failed to reset academic records.", "error");
        }
    };
    
    const handlePromoteStudents = async () => {
        const batch = db.batch();
        const archiveCollection = db.collection(`archive_${academicYear.replace('-', '_')}`);
        
        const studentsToPromote = students.filter(s => s.status === StudentStatus.ACTIVE && s.grade !== Grade.X);
        const studentsToGraduate = students.filter(s => s.status === StudentStatus.ACTIVE && s.grade === Grade.X);

        studentsToPromote.forEach(student => {
            const nextGrade = getNextGrade(student.grade);
            if (nextGrade) {
                const archiveRef = archiveCollection.doc(student.id);
                batch.set(archiveRef, student);
                
                const studentRef = db.collection('students').doc(student.id);
                batch.update(studentRef, { 
                    grade: nextGrade,
                    rollNo: 0, // Reset roll no
                    academicPerformance: firebase.firestore.FieldValue.delete(),
                    feePayments: createDefaultFeePayments(),
                });
            }
        });

        studentsToGraduate.forEach(student => {
            const archiveRef = archiveCollection.doc(student.id);
            batch.set(archiveRef, student);

            const studentRef = db.collection('students').doc(student.id);
            batch.update(studentRef, { status: StudentStatus.TRANSFERRED, transferDate: new Date().toISOString().split('T')[0] });
        });

        const newAcademicYear = `${parseInt(academicYear.split('-')[0]) + 1}-${parseInt(academicYear.split('-')[1]) + 1}`;
        batch.set(db.collection('settings').doc('academic'), { year: newAcademicYear });
        
        try {
            await batch.commit();
            addNotification("Promotion successful! System is now set to the new academic year.", "success");
            window.location.reload();
        } catch(e) {
            console.error("Promotion failed:", e);
            addNotification("A critical error occurred during promotion. Please check the logs.", "error");
        }
    };
    
    const handleGenerateTc = async (tcData: Omit<TcRecord, 'id'>) => {
        const studentRef = db.collection('students').doc(tcData.studentDbId);
        const tcRef = db.collection('tcRecords').doc();

        const batch = db.batch();
        batch.set(tcRef, tcData);
        batch.update(studentRef, { status: StudentStatus.TRANSFERRED, transferDate: tcData.dateOfIssueOfTc });

        try {
            await batch.commit();
            addNotification("Transfer Certificate generated successfully.", "success");
            navigate(`/portal/transfers/print/${tcRef.id}`);
            return true;
        } catch (e) {
            console.error("Error generating TC:", e);
            addNotification("Failed to generate TC.", "error");
            return false;
        }
    };

    const handleOnlineAdmissionSubmit = async (data: Omit<OnlineAdmission, 'id' | 'submissionDate'>) => {
        return handleSave('online_admissions', { ...data, submissionDate: new Date().toISOString() }, undefined, 'Admission form submitted successfully!');
    };

    // ... (Auth handlers - no changes)
    const handleAuthAction = async (action: Promise<any>, successMessage: string, navigateTo: string, state?: object) => {
        setAuthError('');
        try {
            await action;
            if(navigateTo === '/login') sessionStorage.setItem('loginMessage', successMessage);
            navigate(navigateTo, { state: { message: successMessage, ...state } });
            return { success: true, message: successMessage };
        } catch (err: any) {
            setAuthError(err.message);
            return { success: false, message: err.message };
        }
    };

    const handleLogin = (email: string, password: string) => 
        handleAuthAction(auth.signInWithEmailAndPassword(email, password), "Login successful!", "/portal");

    const handleSignUp = (name: string, email: string, password: string) => 
        handleAuthAction(
            auth.createUserWithEmailAndPassword(email, password).then(cred => cred.user?.updateProfile({ displayName: name })),
            "Registration successful! Please wait for an admin to approve your account.",
            "/login"
        );

    const handleParentSignUp = async (name: string, email: string, password: string, studentId: string) => {
        return handleAuthAction(
            auth.createUserWithEmailAndPassword(email, password).then(cred => {
                cred.user?.updateProfile({ displayName: name });
                return db.collection('users').doc(cred.user?.uid).set({
                    displayName: name,
                    email: email,
                    photoURL: cred.user?.photoURL,
                    role: 'pending_parent',
                    claimedStudentId: studentId
                });
            }),
            "Registration successful! Please wait for admin approval.",
            "/login"
        );
    };
    
    const handleForgotPassword = async (email: string) => {
        try {
            await auth.sendPasswordResetEmail(email);
            return { success: true, message: 'Password reset email sent.' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    };
    
    const handleResetPassword = async (newPassword: string) => {
        const query = new URLSearchParams(window.location.search);
        const oobCode = query.get('oobCode');
        if (!oobCode) return { success: false, message: 'Invalid or missing reset code.' };
        
        try {
            await auth.confirmPasswordReset(oobCode, newPassword);
             return { success: true, message: 'Password reset successfully. Please login.' };
        } catch (e: any) {
             return { success: false, message: e.message };
        }
    };

    const handleChangePassword = async (currentPass: string, newPass: string) => {
        if (!auth.currentUser || !auth.currentUser.email) return { success: false, message: 'Not logged in.' };
        try {
            const cred = firebase.auth.EmailAuthProvider.credential(auth.currentUser.email, currentPass);
            await auth.currentUser.reauthenticateWithCredential(cred);
            await auth.currentUser.updatePassword(newPass);
            await auth.signOut();
            return { success: true, message: 'Password changed successfully. Please login again.' };
        } catch (e: any) {
            return { success: false, message: e.message };
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleUpdateUserRole = async (uid: string, newRole: 'admin' | 'user' | 'pending' | 'warden') => {
        try {
            await db.collection('users').doc(uid).update({ role: newRole });
            addNotification('User role updated successfully.', 'success');
        } catch (e) {
            console.error("Error updating user role:", e);
            addNotification('Failed to update user role.', 'error');
        }
    };

    const handleApproveParent = async (uid: string, claimedStudentId: string) => {
        try {
            const student = students.find(s => formatStudentId(s, academicYear).toLowerCase() === claimedStudentId.toLowerCase());
            if (student) {
                await db.collection('users').doc(uid).update({ 
                    role: 'parent', 
                    studentIds: firebase.firestore.FieldValue.arrayUnion(student.id),
                    claimedStudentId: firebase.firestore.FieldValue.delete()
                });
                addNotification('Parent approved and linked to student.', 'success');
            } else {
                addNotification(`Student ID ${claimedStudentId} not found. Cannot approve.`, 'error');
            }
        } catch (e) {
            console.error("Error approving parent:", e);
            addNotification('Failed to approve parent.', 'error');
        }
    };
    
    const handleDeleteUser = async (uid: string) => {
         setItemToDelete({ type: 'user', data: { uid } as User });
    };
    
    // --- Helper for Attendance ---
    const fetchStudentAttendanceForMonth = async (grade: Grade, year: number, month: number) => {
        // Calculate start and end dates for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of month
        return fetchStudentAttendanceForRange(grade, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
    };

    const fetchStudentAttendanceForRange = async (grade: Grade, startDate: string, endDate: string) => {
        const attendanceData: { [date: string]: StudentAttendanceRecord } = {};
        try {
            // Range query on document IDs (dates)
            const snapshot = await db.collection('studentAttendance')
                .where(firebase.firestore.FieldPath.documentId(), '>=', startDate)
                .where(firebase.firestore.FieldPath.documentId(), '<=', endDate)
                .get();
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data && data[grade]) {
                    attendanceData[doc.id] = data[grade];
                }
            });
        } catch (error) {
            console.error("Error fetching student attendance range:", error);
            throw error;
        }
        return attendanceData;
    };

    const fetchStaffAttendanceForMonth = async (year: number, month: number) => {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        return fetchStaffAttendanceForRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
    };

    const fetchStaffAttendanceForRange = async (startDate: string, endDate: string) => {
        const attendanceData: { [date: string]: StaffAttendanceRecord } = {};
        try {
             const snapshot = await db.collection('staffAttendance')
                .where(firebase.firestore.FieldPath.documentId(), '>=', startDate)
                .where(firebase.firestore.FieldPath.documentId(), '<=', endDate)
                .get();
            
             snapshot.forEach(doc => {
                attendanceData[doc.id] = doc.data() as StaffAttendanceRecord;
            });
        } catch (e) {
            console.error("Error fetching staff attendance range:", e);
            throw e;
        }
        return attendanceData;
    };

    const updateStaffAttendance = (staffId: string, status: AttendanceStatus) => {
        const todayStr = new Date().toISOString().split('T')[0];
        db.collection('staffAttendance').doc(todayStr).set({
            [staffId]: status
        }, { merge: true })
        .then(() => addNotification('Attendance marked.', 'success'))
        .catch(err => {
            console.error(err);
            addNotification('Failed to mark attendance.', 'error');
        });
    };

    const updateStudentAttendance = async (grade: Grade, date: string, records: StudentAttendanceRecord) => {
        try {
            await db.collection('studentAttendance').doc(date).set({
                [grade]: records
            }, { merge: true });
        } catch (error) {
            console.error("Error saving attendance:", error);
            throw new Error("Failed to save attendance");
        }
    };
    
    const handleUpdateUserPrefs = (prefs: any) => {
        if (!user) return;
        db.collection('users').doc(user.uid).collection('prefs').doc('calendar').set(prefs, { merge: true })
            .then(() => addNotification('Preferences updated.', 'success'))
            .catch(e => {
                console.error(e);
                addNotification('Failed to update preferences.', 'error');
            });
    };

    const handleSaveSitemap = async (content: string) => {
        try {
            await db.doc('config/sitemap').set({ xml: content });
            addNotification('Sitemap updated successfully.', 'success');
        } catch (error) {
            console.error("Error saving sitemap:", error);
            addNotification('Failed to save sitemap.', 'error');
        }
    };

    // --- Handlers for Routine Management ---
    const handleSaveExamRoutine = async (routine: Omit<ExamRoutine, 'id'>, id?: string) => {
        const success = await handleSave('examRoutines', routine, id, id ? 'Exam routine updated.' : 'Exam routine added.');
        return success;
    };

    const handleDeleteExamRoutine = async (routine: ExamRoutine) => {
        setItemToDelete({ type: 'examRoutine', data: routine });
    };

    const handleUpdateClassRoutine = async (day: string, routine: DailyRoutine) => {
        try {
            await db.collection('classRoutines').doc(day).set({ routine });
            addNotification(`Class routine for ${day} updated successfully.`, 'success');
        } catch (error: any) {
            console.error("Error saving class routine:", error);
            addNotification('Failed to save class routine.', 'error');
        }
    };

    if (loading) {
        return <FullScreenLoader />;
    }

    return (
      <>
        <OfflineIndicator />
        <NotificationContainer notifications={notifications} onDismiss={dismissNotification} />
        
        <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicHomePage news={news} />} />
            <Route path="/news" element={<NewsPage news={news} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/admissions" element={<AdmissionsPage />} />
            <Route path="/admissions/online" element={<OnlineAdmissionPage onOnlineAdmissionSubmit={handleOnlineAdmissionSubmit} />} />
            <Route path="/fees" element={<FeesPage feeStructure={feeStructure} students={students} academicYear={academicYear} onUpdateFeePayments={handleUpdateFeePayments} addNotification={addNotification} />} />
            <Route path="/student-life" element={<StudentLifePage />} />
            <Route path="/ncc" element={<NccPage />} />
            <Route path="/arts-culture" element={<ArtsCulturePage />} />
            <Route path="/eco-club" element={<EcoClubPage />} />
            <Route path="/sports" element={<SportsPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/infrastructure" element={<InfrastructurePage />} />
            <Route path="/faculty" element={<FacultyPage staff={staff} gradeDefinitions={gradeDefinitions} />} />
            <Route path="/staff/:staffId" element={<PublicStaffDetailPage staff={staff} gradeDefinitions={gradeDefinitions} />} />
            <Route path="/supplies" element={<SuppliesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/hostel" element={<HostelPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route path="/sitemap.xml" element={<SitemapXmlPage sitemapContent={sitemapContent} />} />
            <Route path="/achievements/quiz" element={<QuizClubPage />} />
            <Route path="/academics" element={<AcademicsPage />} />
            <Route path="/academics/curriculum" element={<CurriculumPage gradeDefinitions={gradeDefinitions} />} />
            <Route path="/achievements/academic" element={<AcademicAchievementsPage />} />
            <Route path="/achievements/academic/distinction-holders/:year" element={<DistinctionHoldersPage />} />
            <Route path="/achievements/sports" element={<SportsPage />} />
            <Route path="/achievements/science" element={<ScienceClubPage />} />
            <Route path="/achievements/science/slsmee" element={<SlsmeePage />} />
            <Route path="/achievements/science/inspire-award" element={<InspireAwardPage />} />
            <Route path="/achievements/science/ncsc" element={<NcscPage />} />
            <Route path="/achievements/science/science-tour" element={<ScienceTourPage />} />
            <Route path="/achievements/science/incentive-awards" element={<IncentiveAwardsPage />} />
            <Route path="/achievements/science/mathematics-competition" element={<MathematicsCompetitionPage />} />

            <Route path="/login" element={<LoginPage onLogin={handleLogin} error={authError} notification={location.state?.message || ''} />} />
            <Route path="/signup" element={<SignUpPage onSignUp={handleSignUp} />} />
            <Route path="/parent-signup" element={<ParentSignUpPage onSignUp={handleParentSignUp} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage onForgotPassword={handleForgotPassword} />} />
            <Route path="/reset-password" element={<ResetPasswordPage onResetPassword={handleResetPassword} />} />
            
            {/* Public Route for Routine */}
            <Route path="/routine" element={
                <RoutinePage 
                    examSchedules={examSchedules} 
                    classSchedules={classSchedules}
                    user={user}
                    onSaveExamRoutine={handleSaveExamRoutine}
                    onDeleteExamRoutine={handleDeleteExamRoutine}
                    onUpdateClassRoutine={handleUpdateClassRoutine}
                />
            } />
          </Route>

          {/* Protected Routes */}
          {userWithProfilePhoto ? (
             <Route path="/portal/*" element={
                <DashboardLayout 
                    user={userWithProfilePhoto} 
                    onLogout={handleLogout}
                    students={students}
                    staff={staff}
                    tcRecords={tcRecords}
                    serviceCerts={serviceCerts}
                    academicYear={academicYear}
                >
                   <Routes>
                      <Route path="dashboard" element={
                          <DashboardPage 
                             user={userWithProfilePhoto} 
                             onAddStudent={handleAddStudent} 
                             studentCount={students.length} 
                             academicYear={academicYear}
                             onSetAcademicYear={handleSetAcademicYear}
                             allUsers={allUsers}
                             assignedGrade={assignedGrade}
                             assignedSubjects={assignedSubjects}
                             isReminderServiceActive={isReminderServiceActive}
                             onToggleReminderService={handleToggleReminderService}
                             calendarEvents={calendarEvents}
                          />
                      } />
                      <Route path="parent-dashboard" element={
                          <ParentDashboardPage user={userWithProfilePhoto} allStudents={students} />
                      } />
                      
                      <Route path="students" element={
                          <StudentListPage 
                             students={students} 
                             onAdd={handleAddStudent} 
                             onEdit={(s) => { setEditingStudent(s); setIsStudentModalOpen(true); }} 
                             academicYear={academicYear}
                             user={userWithProfilePhoto}
                             assignedGrade={assignedGrade}
                          />
                      } />
                      <Route path="student/:studentId" element={
                          <StudentDetailPage 
                             students={students} 
                             onEdit={(s) => { setEditingStudent(s); setIsStudentModalOpen(true); }} 
                             academicYear={academicYear}
                             user={userWithProfilePhoto}
                             assignedGrade={assignedGrade}
                             feeStructure={feeStructure}
                             conductLog={conductLog}
                             hostelDisciplineLog={hostelDisciplineLog}
                             onAddConductEntry={handleAddConductEntry}
                             onDeleteConductEntry={handleDeleteConductEntry}
                          />
                      } />
                      
                      <Route path="student/:studentId/academics" element={
                          <AcademicPerformancePage 
                             students={students}
                             onUpdateAcademic={handleUpdateAcademicPerformance}
                             gradeDefinitions={gradeDefinitions}
                             academicYear={academicYear}
                             user={userWithProfilePhoto}
                             assignedGrade={assignedGrade}
                             assignedSubjects={assignedSubjects}
                          />
                      } />
                      <Route path="student/:studentId/attendance-log" element={
                          <StudentAttendanceLogPage 
                             students={students}
                             fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth}
                             user={userWithProfilePhoto}
                          />
                      } />

                      <Route path="classes" element={
                          <ClassListPage 
                            gradeDefinitions={gradeDefinitions} 
                            staff={staff} 
                            onOpenImportModal={handleOpenImportModal}
                            user={userWithProfilePhoto}
                          />
                      } />
                      <Route path="classes/:grade" element={
                          <ClassStudentsPage 
                            students={students} 
                            staff={staff} 
                            gradeDefinitions={gradeDefinitions} 
                            onUpdateClassTeacher={(grade, teacherId) => {
                                const newGradeDef = { ...gradeDefinitions[grade], classTeacherId: teacherId };
                                handleUpdateGradeDefinition(grade, newGradeDef);
                            }}
                            academicYear={academicYear}
                            onOpenImportModal={handleOpenImportModal}
                            onDelete={(s) => { setItemToDelete({ type: 'student', data: s }); setIsSaving(false); }}
                            user={userWithProfilePhoto}
                            assignedGrade={assignedGrade}
                            onAddStudentToClass={(grade) => { 
                                setNewStudentTargetGrade(grade);
                                setEditingStudent(null);
                                setIsStudentModalOpen(true);
                            }}
                            onUpdateBulkFeePayments={handleUpdateBulkFeePayments}
                            feeStructure={feeStructure}
                          />
                      } />
                      <Route path="classes/:grade/attendance" element={
                          <StudentAttendancePage 
                            students={students}
                            allAttendance={studentAttendance}
                            onUpdateAttendance={updateStudentAttendance}
                            user={userWithProfilePhoto}
                            fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth}
                            fetchStudentAttendanceForRange={fetchStudentAttendanceForRange}
                            academicYear={academicYear}
                            assignedGrade={assignedGrade}
                          />
                      } />

                      <Route path="staff" element={
                          <ManageStaffPage 
                            staff={staff} 
                            gradeDefinitions={gradeDefinitions}
                            onAdd={() => { setEditingStaff(null); setIsStaffModalOpen(true); }}
                            onEdit={(s) => { setEditingStaff(s); setIsStaffModalOpen(true); }}
                            onDelete={(s) => { setItemToDelete({ type: 'staff', data: s }); }}
                            user={userWithProfilePhoto}
                          />
                      } />
                      <Route path="staff/attendance" element={
                          <StaffAttendancePage 
                             user={userWithProfilePhoto}
                             staff={staff}
                             attendance={staffAttendance[new Date().toISOString().split('T')[0]]}
                             onMarkAttendance={updateStaffAttendance}
                             fetchStaffAttendanceForMonth={fetchStaffAttendanceForMonth}
                             fetchStaffAttendanceForRange={fetchStaffAttendanceForRange}
                             academicYear={academicYear}
                          />
                      } />
                      <Route path="staff/attendance-logs" element={
                          <StaffAttendanceLogPage 
                             staff={staff}
                             students={students}
                             gradeDefinitions={gradeDefinitions}
                             fetchStaffAttendanceForMonth={fetchStaffAttendanceForMonth}
                             fetchStaffAttendanceForRange={fetchStaffAttendanceForRange}
                             academicYear={academicYear}
                             user={userWithProfilePhoto}
                          />
                      } />
                      <Route path="staff/certificates" element={
                          <StaffDocumentsPage serviceCertificateRecords={serviceCerts} user={userWithProfilePhoto} />
                      } />
                      <Route path="staff/certificates/generate" element={
                          <GenerateServiceCertificatePage staff={staff} onSave={(data) => handleSave('serviceCertificates', data)} user={userWithProfilePhoto} />
                      } />
                      <Route path="staff/certificates/print/:certId" element={
                          <PrintServiceCertificatePage serviceCertificateRecords={serviceCerts} />
                      } />

                      <Route path="fees" element={
                          <FeeManagementPage 
                            students={students} 
                            academicYear={academicYear} 
                            onUpdateFeePayments={handleUpdateFeePayments} 
                            user={userWithProfilePhoto}
                            feeStructure={feeStructure}
                            onUpdateFeeStructure={handleUpdateFeeStructure}
                            addNotification={addNotification}
                          />
                      } />

                      <Route path="inventory" element={
                          <InventoryPage 
                            inventory={inventory} 
                            onAdd={() => { setEditingInventory(null); setIsInventoryModalOpen(true); }}
                            onEdit={(i) => { setEditingInventory(i); setIsInventoryModalOpen(true); }}
                            onDelete={(i) => { setItemToDelete({ type: 'inventory', data: i }); }}
                            user={userWithProfilePhoto}
                          />
                      } />
                      
                      <Route path="transfers" element={<TransferManagementPage />} />
                      <Route path="transfers/generate" element={<GenerateTcPage students={students} tcRecords={tcRecords} academicYear={academicYear} onGenerateTc={handleGenerateTc} isSaving={isSaving} error={modalError} />} />
                      <Route path="transfers/generate/:studentId" element={<GenerateTcPage students={students} tcRecords={tcRecords} academicYear={academicYear} onGenerateTc={handleGenerateTc} isSaving={isSaving} error={modalError} />} />
                      <Route path="transfers/records" element={<TcRecordsPage tcRecords={tcRecords} />} />
                      <Route path="transfers/print/:tcId" element={<PrintTcPage tcRecords={tcRecords} />} />

                      <Route path="hostel-dashboard" element={<HostelDashboardPage disciplineLog={hostelDisciplineLog} />} />
                      <Route path="hostel/students" element={
                          <HostelStudentListPage 
                            residents={hostelResidents} 
                            students={students} 
                            onAdd={() => { setEditingHostelResident(null); setIsHostelResidentModalOpen(true); }}
                            onAddById={async (id) => {
                                const student = students.find(s => formatStudentId(s, academicYear) === id);
                                if (!student) return { success: false, message: "Student ID not found." };
                                if (hostelResidents.some(r => r.studentId === student.id)) return { success: false, message: "Student is already in hostel." };
                                await handleSave('hostelResidents', { studentId: student.id, dormitory: HOSTEL_DORMITORY_LIST[0], dateOfJoining: new Date().toISOString().split('T')[0] });
                                return { success: true };
                            }}
                            onEdit={(r) => { setEditingHostelResident(r); setIsHostelResidentModalOpen(true); }}
                            onDelete={(r) => { setItemToDelete({ type: 'hostelResident', data: r }); }}
                            user={userWithProfilePhoto}
                            academicYear={academicYear}
                          />
                      } />
                       <Route path="hostel/rooms" element={<HostelRoomListPage residents={hostelResidents} students={students} />} />
                       <Route path="hostel/fees" element={<HostelFeePage />} />
                       <Route path="hostel/attendance" element={<HostelAttendancePage />} />
                       <Route path="hostel/mess" element={<HostelMessPage />} />
                       <Route path="hostel/staff" element={
                          <HostelStaffPage 
                            staff={hostelStaff} 
                            onAdd={() => { setEditingHostelStaff(null); setIsHostelStaffModalOpen(true); }}
                            onEdit={(s) => { setEditingHostelStaff(s); setIsHostelStaffModalOpen(true); }}
                            onDelete={(s) => { setItemToDelete({ type: 'hostelStaff', data: s }); }}
                            user={userWithProfilePhoto}
                          />
                       } />
                       <Route path="hostel/inventory" element={
                          <HostelInventoryPage 
                             inventory={hostelInventory} 
                             stockLogs={stockLogs} 
                             onUpdateStock={(itemId, change, notes) => {
                                 const item = hostelInventory.find(i => i.id === itemId);
                                 if(item) {
                                     handleSave('hostelInventory', { currentStock: Math.max(0, item.currentStock + change) }, itemId);
                                     handleSave('stockLogs', { itemId, itemName: item.name, quantity: Math.abs(change), type: change > 0 ? 'IN' : 'OUT', date: new Date().toISOString(), notes });
                                 }
                             }}
                             user={userWithProfilePhoto}
                          />
                       } />
                       <Route path="hostel/discipline" element={
                          <HostelDisciplinePage 
                             user={userWithProfilePhoto} 
                             students={students} 
                             residents={hostelResidents}
                             disciplineLog={hostelDisciplineLog}
                             onSave={handleHostelDisciplineSubmit}
                             onDelete={(entry) => { setItemToDelete({ type: 'hostelDiscipline', data: entry }); }}
                             academicYear={academicYear}
                          />
                       } />
                       <Route path="hostel/health" element={<HostelHealthPage />} />
                       <Route path="hostel/communication" element={<HostelCommunicationPage />} />
                       <Route path="hostel/settings" element={<HostelSettingsPage />} />
                       <Route path="hostel/chores" element={
                           <HostelChoreRosterPage 
                               user={userWithProfilePhoto}
                               students={students}
                               residents={hostelResidents}
                               choreRoster={choreRoster}
                               onUpdateChoreRoster={handleUpdateChoreRoster}
                               academicYear={academicYear}
                           />
                       } />

                      <Route path="calendar" element={
                          <CalendarPage 
                             events={calendarEvents} 
                             user={userWithProfilePhoto}
                             onAdd={() => { setEditingCalendar(null); setIsCalendarModalOpen(true); }}
                             onEdit={(e) => { setEditingCalendar(e); setIsCalendarModalOpen(true); }}
                             onDelete={(e) => { setItemToDelete({ type: 'calendar', data: e }); }}
                             notificationDaysBefore={calendarPrefs.notificationDaysBefore}
                             onUpdatePrefs={(days) => handleUpdateUserPrefs({ notificationDaysBefore: days })}
                          />
                      } />
                      
                      <Route path="communication" element={<CommunicationPage students={students} user={userWithProfilePhoto} />} />
                      <Route path="change-password" element={<ChangePasswordPage onChangePassword={handleChangePassword} />} />
                      
                      {/* Portal Routine Route */}
                      <Route path="routine" element={
                          <RoutinePage 
                              examSchedules={examSchedules} 
                              classSchedules={classSchedules}
                              user={userWithProfilePhoto}
                              onSaveExamRoutine={handleSaveExamRoutine}
                              onDeleteExamRoutine={handleDeleteExamRoutine}
                              onUpdateClassRoutine={handleUpdateClassRoutine}
                          />
                      } />
                      
                      <Route path="reports/academics" element={<ReportSearchPage students={students} academicYear={academicYear} />} />
                      <Route path="reports/class/:grade/:examId" element={
                          <ClassMarkStatementPage 
                             students={students} 
                             academicYear={academicYear} 
                             user={userWithProfilePhoto} 
                             gradeDefinitions={gradeDefinitions} 
                             onUpdateAcademic={handleUpdateAcademicPerformance} 
                          />
                      } />
                      <Route path="reports/bulk-print/:grade/:examId" element={
                          <BulkProgressReportPage 
                              students={students}
                              staff={staff}
                              gradeDefinitions={gradeDefinitions}
                              academicYear={academicYear}
                          />
                      } />

                      <Route path="insights" element={
                          <InsightsPage 
                             students={students}
                             gradeDefinitions={gradeDefinitions}
                             conductLog={conductLog}
                             user={userWithProfilePhoto}
                          />
                      } />

                      <Route path="homework-scanner" element={<HomeworkScannerPage />} />
                      <Route path="activity-log" element={
                          <ActivityLogPage 
                             students={students} 
                             user={userWithProfilePhoto} 
                             gradeDefinitions={gradeDefinitions} 
                             academicYear={academicYear} 
                             assignedGrade={assignedGrade} 
                             assignedSubjects={assignedSubjects} 
                             onBulkUpdateActivityLogs={handleBulkUpdateActivityLogs} 
                          />
                      } />

                      {userWithProfilePhoto.role === 'admin' && (
                          <>
                            <Route path="news-management" element={
                                <ManageNewsPage 
                                    news={news} 
                                    onAdd={() => { setEditingNews(null); setIsNewsModalOpen(true); }}
                                    onEdit={(i) => { setEditingNews(i); setIsNewsModalOpen(true); }}
                                    onDelete={(i) => { setItemToDelete({ type: 'news', data: i }); }}
                                    user={userWithProfilePhoto}
                                />
                            } />
                             <Route path="users" element={
                                <UserManagementPage 
                                   allUsers={allUsers} 
                                   students={students}
                                   academicYear={academicYear}
                                   currentUser={userWithProfilePhoto}
                                   onUpdateUserRole={handleUpdateUserRole}
                                   onDeleteUser={handleDeleteUser}
                                   onApproveParent={handleApproveParent}
                                />
                             } />
                             <Route path="promotion" element={
                                <PromotionPage 
                                    students={students} 
                                    gradeDefinitions={gradeDefinitions} 
                                    academicYear={academicYear} 
                                    onPromoteStudents={handlePromoteStudents} 
                                    user={userWithProfilePhoto} 
                                />
                             } />
                             <Route path="subjects" element={
                                 <ManageSubjectsPage 
                                     gradeDefinitions={gradeDefinitions} 
                                     onUpdateGradeDefinition={handleUpdateGradeDefinition} 
                                     user={userWithProfilePhoto}
                                     onResetAllMarks={handleResetAllMarks}
                                 />
                             } />
                              <Route path="sitemap-editor" element={
                                  <SitemapEditorPage initialContent={sitemapContent} onSave={handleSaveSitemap} />
                              } />
                          </>
                      )}
                   </Routes>
                </DashboardLayout>
             } />
          ) : null}
          
          {/* Progress Report Public View (Unprotected but specific URL) */}
          <Route path="/progress-report/:studentId/:examId" element={
              <ProgressReportPage 
                  students={students} 
                  staff={staff} 
                  gradeDefinitions={gradeDefinitions} 
                  academicYear={academicYear} 
              />
          } />
          
          <Route path="/staff/:staffId" element={<PublicStaffDetailPage staff={staff} gradeDefinitions={gradeDefinitions} />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
        
        <StudentFormModal
            isOpen={isStudentModalOpen}
            onClose={() => setIsStudentModalOpen(false)}
            onSubmit={handleStudentSubmit}
            student={editingStudent}
            newStudentTargetGrade={newStudentTargetGrade}
            academicYear={academicYear}
            isSaving={isSaving}
            error={modalError}
        />

        <Suspense fallback={null}>
            {isStaffModalOpen && (
                <StaffFormModal
                    isOpen={isStaffModalOpen}
                    onClose={() => setIsStaffModalOpen(false)}
                    onSubmit={handleStaffSubmit}
                    staffMember={editingStaff}
                    allStaff={staff}
                    gradeDefinitions={gradeDefinitions}
                    isSaving={isSaving}
                    error={modalError}
                />
            )}

            {isInventoryModalOpen && (
                <InventoryFormModal
                    isOpen={isInventoryModalOpen}
                    onClose={() => setIsInventoryModalOpen(false)}
                    onSubmit={handleInventorySubmit}
                    item={editingInventory}
                />
            )}

            {isHostelResidentModalOpen && (
                <HostelResidentFormModal
                    isOpen={isHostelResidentModalOpen}
                    onClose={() => setIsHostelResidentModalOpen(false)}
                    onSubmit={handleHostelResidentSubmit}
                    resident={editingHostelResident}
                    preselectedStudent={null}
                    allStudents={students}
                    allResidents={hostelResidents}
                    isSaving={isSaving}
                    error={modalError}
                />
            )}

            {isHostelStaffModalOpen && (
                <HostelStaffFormModal
                    isOpen={isHostelStaffModalOpen}
                    onClose={() => setIsHostelStaffModalOpen(false)}
                    onSubmit={handleHostelStaffSubmit}
                    staffMember={editingHostelStaff}
                    isSaving={isSaving}
                    error={modalError}
                />
            )}

            {isHostelDisciplineModalOpen && (
                <HostelDisciplineFormModal
                    isOpen={isHostelDisciplineModalOpen}
                    onClose={() => setIsHostelDisciplineModalOpen(false)}
                    onSubmit={handleHostelDisciplineSubmit}
                    entry={editingHostelDiscipline}
                    residents={hostelResidents}
                    students={students}
                    isSaving={isSaving}
                    academicYear={academicYear}
                />
            )}

            {isNewsModalOpen && (
                <NewsFormModal
                    isOpen={isNewsModalOpen}
                    onClose={() => setIsNewsModalOpen(false)}
                    onSubmit={handleNewsSubmit}
                    item={editingNews}
                    isSaving={isSaving}
                    error={modalError}
                />
            )}

            {isCalendarModalOpen && (
                <CalendarEventFormModal
                    isOpen={isCalendarModalOpen}
                    onClose={() => setIsCalendarModalOpen(false)}
                    onSubmit={handleCalendarEventSubmit}
                    event={editingCalendar}
                />
            )}

            {isImportModalOpen && (
                <ImportStudentsModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onImport={handleImportStudents}
                    grade={importTargetGrade}
                    allStudents={students}
                    allGrades={GRADES_LIST}
                    isImporting={isSaving}
                />
            )}
        </Suspense>

        <ConfirmationModal
            isOpen={!!itemToDelete}
            onClose={() => setItemToDelete(null)}
            onConfirm={handleConfirmDelete}
            title={`Delete ${itemToDelete?.type}`}
        >
            <p>Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.</p>
        </ConfirmationModal>
        
      </>
    );
};

export default App;