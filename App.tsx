






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
    StudentClaim, ExamRoutine, DailyRoutine
} from './types';
import NotificationContainer from './components/NotificationContainer';
import OfflineIndicator from './components/OfflineIndicator';
import { SpinnerIcon } from './components/Icons';

// Data & Constants
import { timetableData } from './timetableData';
import { DEFAULT_FEE_STRUCTURE, GRADE_DEFINITIONS } from './constants';
// FIX: Import formatStudentId utility to be used in user management handlers.
import { formatStudentId } from './utils';

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
    
    // Hostel State
    const [hostelResidents, setHostelResidents] = useState<HostelResident[]>([]);
    const [hostelStaff, setHostelStaff] = useState<HostelStaff[]>([]);
    const [hostelInventory, setHostelInventory] = useState<HostelInventoryItem[]>([]);
    const [hostelStockLogs, setHostelStockLogs] = useState<StockLog[]>([]);
    const [hostelDisciplineLog, setHostelDisciplineLog] = useState<HostelDisciplineEntry[]>([]);
    const [hostelChoreRoster, setHostelChoreRoster] = useState<ChoreRoster>({});
    
    // Config State
    const [academicYear, setAcademicYear] = useState<string>("2025-2026");
    const [feeStructure, setFeeStructure] = useState<FeeStructure>(DEFAULT_FEE_STRUCTURE);
    const [gradeDefinitions, setGradeDefinitions] = useState<Record<Grade, GradeDefinition>>(GRADE_DEFINITIONS);
    const [sitemapContent, setSitemapContent] = useState<string>('');

    // Attendance State
    const [currentStudentAttendance, setCurrentStudentAttendance] = useState<Record<Grade, StudentAttendanceRecord> | null>(null);
    const [currentStaffAttendance, setCurrentStaffAttendance] = useState<StaffAttendanceRecord | null>(null);

    // Derived User Properties
    const staffProfile = useMemo(() => staff.find(s => s.emailAddress.toLowerCase() === user?.email?.toLowerCase()), [staff, user?.email]);
    const assignedGrade = useMemo(() => {
        if (!staffProfile) return null;
        const entry = Object.entries(gradeDefinitions).find(([, def]) => (def as any).classTeacherId === staffProfile.id);
        return entry ? entry[0] as Grade : null;
    }, [staffProfile, gradeDefinitions]);
    const assignedSubjects = useMemo(() => staffProfile?.assignedSubjects || [], [staffProfile]);

    const addNotification = (message: string, type: NotificationType, title?: string) => {
        const id = Math.random().toString(36).substring(7);
        setNotifications(prev => [...prev, { id, message, type, title }]);
    };

    // Firebase Auth Setup with Real-time User Doc Sync and Auto-Creation for New Users
    useEffect(() => {
        let userDocUnsubscribe: () => void;

        const authUnsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (userDocUnsubscribe) userDocUnsubscribe(); // Unsubscribe from previous user listener

            if (firebaseUser) {
                const userDocRef = db.collection('users').doc(firebaseUser.uid);
                const userDoc = await userDocRef.get();

                if (!userDoc.exists) {
                    // This is a first-time sign-in for this user (could be email or Google).
                    // Create a user document for them.
                    const newUser = {
                        displayName: firebaseUser.displayName,
                        email: firebaseUser.email,
                        photoURL: firebaseUser.photoURL,
                        role: 'pending', // A generic pending role. Admin will sort staff/parent.
                        createdAt: new Date().toISOString(),
                    };
                    await userDocRef.set(newUser);
                }

                // Now that we've ensured a doc exists, set up the real-time listener.
                userDocUnsubscribe = userDocRef.onSnapshot(
                    (doc) => {
                        const userData = doc.data();
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL, // Always use the fresh photoURL from Firebase Auth
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
            const routines: Record<string, DailyRoutine> = { ...timetableData }; // Start with fallback
            snapshot.forEach(doc => {
                if (doc.data()?.schedule) {
                    routines[doc.id] = doc.data().schedule as DailyRoutine;
                }
            });
            setClassSchedules(routines);
        });

        return () => {
            unsubNews(); unsubStaff(); unsubCal(); unsubFees(); unsubGradeDefs(); unsubAcademic(); unsubSitemap(); unsubExams(); unsubClasses();
        };
    }, []);

    // Authenticated Real-time Sync
    useEffect(() => {
        if (!user) {
            // Clear all data on logout
            setStudents([]); setConductLog([]); setTcRecords([]); setServiceCerts([]);
            setAllUsers([]); setOnlineAdmissions([]);
            setCurrentStudentAttendance(null); setCurrentStaffAttendance(null);
            setHostelResidents([]); setHostelStaff([]); setHostelInventory([]); setHostelDisciplineLog([]); setHostelChoreRoster({});
            return;
        };
    
        const isStaff = ['admin', 'user', 'warden'].includes(user.role);
        const isAdmin = user.role === 'admin';
        const isParent = user.role === 'parent';
        const isWardenOrAdmin = isAdmin || user.role === 'warden';
        
        const unsubscribers: (() => void)[] = [];
    
        // STUDENT & CONDUCT DATA
        if (isStaff) {
            unsubscribers.push(db.collection('students').onSnapshot(s => setStudents(s.docs.map(d => ({ id: d.id, ...d.data() } as Student)))));
            unsubscribers.push(db.collection('conductLog').onSnapshot(s => setConductLog(s.docs.map(d => ({ id: d.id, ...d.data() } as ConductEntry)))));
        } else if (isParent && user.studentIds && user.studentIds.length > 0) {
            unsubscribers.push(db.collection('students').where(firebase.firestore.FieldPath.documentId(), 'in', user.studentIds).onSnapshot(s => setStudents(s.docs.map(d => ({ id: d.id, ...d.data() } as Student)))));
            unsubscribers.push(db.collection('conductLog').where('studentId', 'in', user.studentIds).onSnapshot(s => setConductLog(s.docs.map(d => ({ id: d.id, ...d.data() } as ConductEntry)))));
        }
    
        // GENERAL STAFF-ONLY DATA
        if (isStaff) {
            unsubscribers.push(db.collection('tcRecords').onSnapshot(s => setTcRecords(s.docs.map(d => ({ id: d.id, ...d.data() })))));
            unsubscribers.push(db.collection('serviceCertificates').onSnapshot(s => setServiceCerts(s.docs.map(d => ({ id: d.id, ...d.data() })))));
        }
        
        // ADMIN-ONLY DATA
        if (isAdmin) {
            unsubscribers.push(db.collection('users').onSnapshot(s => setAllUsers(s.docs.map(d => ({ uid: d.id, ...d.data() } as User)))));
            unsubscribers.push(db.collection('online_admissions').onSnapshot(s => setOnlineAdmissions(s.docs.map(d => ({ id: d.id, ...d.data() } as OnlineAdmission)))));
        }
    
        // HOSTEL DATA
        if (isWardenOrAdmin) {
            unsubscribers.push(db.collection('hostelResidents').onSnapshot(s => setHostelResidents(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelResident)))));
            unsubscribers.push(db.collection('hostelStaff').onSnapshot(s => setHostelStaff(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelStaff)))));
            unsubscribers.push(db.collection('hostelInventory').onSnapshot(s => setHostelInventory(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelInventoryItem)))));
            unsubscribers.push(db.collection('hostelDisciplineLog').onSnapshot(s => setHostelDisciplineLog(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelDisciplineEntry)))));
            unsubscribers.push(db.collection('choreRoster').doc('current').onSnapshot(d => d.exists && setHostelChoreRoster(d.data() as ChoreRoster)));
        } else if (isParent && user.studentIds && user.studentIds.length > 0) {
            // Parents only get their children's discipline logs
            unsubscribers.push(db.collection('hostelDisciplineLog').where('studentId', 'in', user.studentIds).onSnapshot(s => {
                setHostelDisciplineLog(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelDisciplineEntry)));
            }));
        }
    
        // DATA FOR ALL AUTHENTICATED USERS (STAFF & PARENTS)
        const todayStr = new Date().toISOString().split('T')[0];
        unsubscribers.push(db.collection('studentAttendance').doc(todayStr).onSnapshot(d => d.exists && setCurrentStudentAttendance(d.data() as any)));
        unsubscribers.push(db.collection('staffAttendance').doc(todayStr).onSnapshot(d => d.exists && setCurrentStaffAttendance(d.data() as StaffAttendanceRecord)));
    
        // Cleanup function
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
            // onAuthStateChanged will handle the rest of the logic.
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
                    <Route path="/fees" element={<FeesPage feeStructure={feeStructure} students={students} academicYear={academicYear} onUpdateFeePayments={handleUpdateFeePayments} addNotification={addNotification} />} />
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
                    <Route path="/admissions/online" element={<OnlineAdmissionPage onOnlineAdmissionSubmit={async () => true} />} />
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
                            students={students} 
                            staff={staff} 
                            tcRecords={tcRecords} 
                            serviceCerts={serviceCerts} 
                            academicYear={academicYear}
                        />
                    }>
                        <Route path="/portal/dashboard" element={
                            user.role === 'parent' ? <Navigate to="/portal/parent-dashboard" replace /> :
                            user.role === 'warden' ? <Navigate to="/portal/hostel-dashboard" replace /> :
                            <DashboardPage user={user} onAddStudent={() => undefined} studentCount={students.length} academicYear={academicYear} onSetAcademicYear={() => undefined} allUsers={allUsers} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} isReminderServiceActive={false} onToggleReminderService={() => undefined} calendarEvents={calendarEvents} onlineAdmissions={onlineAdmissions} />
                        } />
                        <Route path="/portal/parent-dashboard" element={<ParentDashboardPage user={user} allStudents={students} onLinkChild={handleLinkChildRequest} />} />
                        <Route path="/portal/students" element={<StudentListPage students={students} onAdd={() => undefined} onEdit={() => undefined} academicYear={academicYear} user={user} assignedGrade={assignedGrade} />} />
                        <Route path="/portal/student/:studentId" element={<StudentDetailPage students={students} onEdit={() => undefined} academicYear={academicYear} user={user} assignedGrade={assignedGrade} feeStructure={feeStructure} conductLog={conductLog} hostelDisciplineLog={hostelDisciplineLog} onAddConductEntry={async () => true} onDeleteConductEntry={async () => undefined} />} />
                        <Route path="/portal/classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={() => undefined} user={user} />} />
                        <Route path="/portal/classes/:grade" element={<ClassStudentsPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateClassTeacher={() => undefined} academicYear={academicYear} onOpenImportModal={() => undefined} onDelete={() => undefined} user={user} assignedGrade={assignedGrade} onAddStudentToClass={() => undefined} onUpdateBulkFeePayments={async () => undefined} feeStructure={feeStructure} />} />
                        <Route path="/portal/classes/:grade/attendance" element={<StudentAttendancePage students={students} allAttendance={currentStudentAttendance} onUpdateAttendance={handleUpdateAttendance} user={user} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} fetchStudentAttendanceForRange={async () => ({})} academicYear={academicYear} assignedGrade={assignedGrade} />} />
                        <Route path="/portal/student/:studentId/attendance-log" element={<StudentAttendanceLogPage students={students} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} user={user} />} />
                        <Route path="/portal/staff" element={<ManageStaffPage staff={staff} gradeDefinitions={gradeDefinitions} onAdd={() => undefined} onEdit={() => undefined} onDelete={() => undefined} user={user} />} />
                        <Route path="/portal/staff/:staffId" element={<StaffDetailPage staff={staff} onEdit={() => undefined} gradeDefinitions={gradeDefinitions} />} />
                        <Route path="/portal/staff/attendance" element={<StaffAttendancePage user={user} staff={staff} attendance={currentStaffAttendance} onMarkAttendance={handleMarkStaffAttendance} fetchStaffAttendanceForMonth={async () => ({})} fetchStaffAttendanceForRange={async () => ({})} academicYear={academicYear} />} />
                        <Route path="/portal/staff/attendance-logs" element={<StaffAttendanceLogPage staff={staff} students={students} gradeDefinitions={gradeDefinitions} fetchStaffAttendanceForMonth={async () => ({})} fetchStaffAttendanceForRange={async () => ({})} academicYear={academicYear} user={user} />} />
                        <Route path="/portal/fees" element={<FeeManagementPage students={students} academicYear={academicYear} onUpdateFeePayments={handleUpdateFeePayments} user={user} feeStructure={feeStructure} onUpdateFeeStructure={() => undefined} addNotification={addNotification} />} />
                        <Route path="/portal/reports/academics" element={<ReportSearchPage students={students} academicYear={academicYear} />} />
                        <Route path="/portal/student/:studentId/academics" element={<AcademicPerformancePage students={students} onUpdateAcademic={handleUpdateAcademic} gradeDefinitions={gradeDefinitions} academicYear={academicYear} user={user} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} />} />
                        <Route path="/portal/reports/class/:grade/:examId" element={<ClassMarkStatementPage students={students} academicYear={academicYear} user={user} gradeDefinitions={gradeDefinitions} onUpdateAcademic={handleUpdateAcademic} />} />
                        <Route path="/portal/insights" element={<InsightsPage students={students} gradeDefinitions={gradeDefinitions} conductLog={conductLog} user={user} />} />
                        <Route path="/portal/homework-scanner" element={<HomeworkScannerPage />} />
                        <Route path="/portal/activity-log" element={<ActivityLogPage students={students} user={user} gradeDefinitions={gradeDefinitions} academicYear={academicYear} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onBulkUpdateActivityLogs={async () => undefined} />} />
                        <Route path="/portal/routine" element={<RoutinePage examSchedules={examSchedules} classSchedules={classSchedules} user={user} onSaveExamRoutine={handleSaveExamRoutine} onDeleteExamRoutine={handleDeleteExamRoutine} onUpdateClassRoutine={handleUpdateClassRoutine} />} />
                        <Route path="/portal/subjects" element={<ManageSubjectsPage gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={() => undefined} user={user} onResetAllMarks={async () => undefined} />} />
                        <Route path="/portal/exams" element={<ExamSelectionPage />} />
                        <Route path="/portal/exams/:examId" element={<ExamClassSelectionPage gradeDefinitions={gradeDefinitions} staff={staff} user={user} />} />
                        <Route path="/portal/promotion" element={<PromotionPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear} onPromoteStudents={async () => undefined} user={user} />} />
                        <Route path="/portal/staff/certificates" element={<StaffDocumentsPage serviceCertificateRecords={serviceCerts} user={user} />} />
                        <Route path="/portal/staff/certificates/generate" element={<GenerateServiceCertificatePage staff={staff} onSave={() => undefined} user={user} />} />
                        <Route path="/portal/staff/certificates/print/:certId" element={<PrintServiceCertificatePage serviceCertificateRecords={serviceCerts} />} />
                        <Route path="/portal/transfers" element={<TransferManagementPage />} />
                        <Route path="/portal/transfers/generate" element={<GenerateTcPage students={students} tcRecords={tcRecords} academicYear={academicYear} onGenerateTc={async () => true} isSaving={false} />} />
                        <Route path="/portal/transfers/generate/:studentId" element={<GenerateTcPage students={students} tcRecords={tcRecords} academicYear={academicYear} onGenerateTc={async () => true} isSaving={false} />} />
                        <Route path="/portal/transfers/records" element={<TcRecordsPage tcRecords={tcRecords} />} />
                        <Route path="/portal/transfers/print/:tcId" element={<PrintTcPage tcRecords={tcRecords} />} />
                        <Route path="/progress-report/:studentId/:examId" element={<ProgressReportPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} academicYear={academicYear} />} />
                        <Route path="/portal/reports/bulk-print/:grade/:examId" element={<BulkProgressReportPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} academicYear={academicYear} />} />
                        <Route path="/portal/hostel-dashboard" element={<HostelDashboardPage disciplineLog={hostelDisciplineLog} />} />
                        <Route path="/portal/hostel/students" element={<HostelStudentListPage residents={hostelResidents} students={students} onAdd={() => undefined} onAddById={async () => ({success: true})} onEdit={() => undefined} onDelete={() => undefined} user={user} academicYear={academicYear} />} />
                        <Route path="/portal/hostel/rooms" element={<HostelRoomListPage residents={hostelResidents} students={students} />} />
                        <Route path="/portal/hostel/fees" element={<HostelFeePage />} />
                        <Route path="/portal/hostel/attendance" element={<HostelAttendancePage />} />
                        <Route path="/portal/hostel/mess" element={<HostelMessPage />} />
                        <Route path="/portal/hostel/staff" element={<HostelStaffPage staff={hostelStaff} onAdd={() => undefined} onEdit={() => undefined} onDelete={() => undefined} user={user} />} />
                        <Route path="/portal/hostel/inventory" element={<HostelInventoryPage inventory={hostelInventory} stockLogs={hostelStockLogs} onUpdateStock={() => undefined} user={user} />} />
                        <Route path="/portal/hostel/discipline" element={<HostelDisciplinePage user={user} students={students} residents={hostelResidents} disciplineLog={hostelDisciplineLog} onSave={async () => undefined} onDelete={() => undefined} academicYear={academicYear} />} />
                        <Route path="/portal/hostel/health" element={<HostelHealthPage />} />
                        <Route path="/portal/hostel/communication" element={<HostelCommunicationPage />} />
                        <Route path="/portal/hostel/settings" element={<HostelSettingsPage />} />
                        <Route path="/portal/hostel/chores" element={<HostelChoreRosterPage user={user} students={students} residents={hostelResidents} choreRoster={hostelChoreRoster} onUpdateChoreRoster={async () => undefined} academicYear={academicYear} />} />
                        <Route path="/portal/communication" element={<CommunicationPage students={students} user={user} />} />
                        <Route path="/portal/calendar" element={<CalendarPage events={calendarEvents} user={user} onAdd={() => undefined} onEdit={() => undefined} onDelete={() => undefined} notificationDaysBefore={-1} onUpdatePrefs={() => undefined} />} />
                        <Route path="/portal/news-management" element={<ManageNewsPage news={news} onAdd={() => undefined} onEdit={() => undefined} onDelete={() => undefined} user={user} />} />
                        <Route path="/portal/users" element={<UserManagementPage allUsers={allUsers} currentUser={user} onUpdateUserRole={handleUpdateUserRole} onDeleteUser={handleDeleteUser} />} />
                        <Route path="/portal/parents" element={<ParentsManagementPage allUsers={allUsers} students={students} academicYear={academicYear} currentUser={user} onDeleteUser={handleDeleteUser} onUpdateUser={handleUpdateUser} />} />
                        <Route path="/portal/admissions" element={<OnlineAdmissionsListPage admissions={onlineAdmissions} onUpdateStatus={() => undefined} />} />
                        <Route path="/portal/profile" element={<UserProfilePage currentUser={user} onUpdateProfile={handleUpdateUserProfile} />} />
                        <Route path="/portal/change-password" element={<ChangePasswordPage onChangePassword={handleChangePassword} />} />
                        <Route path="/portal/sitemap-editor" element={<SitemapEditorPage initialContent={sitemapContent} onSave={async () => undefined} />} />
                        <Route path="/portal/inventory" element={<InventoryPage inventory={[]} onAdd={() => undefined} onEdit={() => undefined} onDelete={() => undefined} user={user} />} />
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