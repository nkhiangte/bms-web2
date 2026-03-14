import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import PublicLayout from '@/layouts/PublicLayout';
import { User, Student, Staff, TcRecord, ServiceCertificateRecord, FeeStructure, AdmissionSettings, NotificationType, Grade, GradeDefinition, SubjectAssignment, FeePayments, Exam, Syllabus, Homework, Notice, CalendarEvent, DailyStudentAttendance, StudentAttendanceRecord, StaffAttendanceRecord, InventoryItem, HostelResident, HostelStaff, HostelInventoryItem, StockLog, HostelDisciplineEntry, ChoreRoster, ConductEntry, ExamRoutine, DailyRoutine, NewsItem, OnlineAdmission, FeeHead, FeeSet, BloodGroup, StudentClaim, ActivityLog, SubjectMark, StudentStatus, NavMenuItem } from '@/types';
import { DEFAULT_ADMISSION_SETTINGS, DEFAULT_FEE_STRUCTURE, GRADE_DEFINITIONS, FEE_SET_GRADES, GRADES_LIST } from '@/constants';
import { db, auth, firebase } from '@/firebaseConfig';
import { getCurrentAcademicYear, getNextAcademicYear, formatStudentId, calculateStudentResult, getNextGrade } from '@/utils';

// Page Imports
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import ParentSignUpPage from '@/pages/ParentSignUpPage';
import ParentRegistrationPage from '@/pages/ParentRegistrationPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import StudentListPage from '@/pages/StudentListPage';
import StudentDetailPage from '@/pages/StudentDetailPage';
import ClassListPage from '@/pages/ClassListPage';
import ClassStudentsPage from '@/pages/ClassStudentsPage';
import StaffAttendancePage from '@/pages/StaffAttendancePage';
import StaffAttendanceLogPage from '@/pages/StaffAttendanceLogPage';
import ManageStaffPage from '@/pages/ManageStaffPage';
import StaffDetailPage from '@/pages/StaffDetailPage';
import StaffDocumentsPage from '@/pages/StaffDocumentsPage';
import GenerateServiceCertificatePage from '@/pages/GenerateServiceCertificatePage';
import PrintServiceCertificatePage from '@/pages/PrintServiceCertificatePage';
import AdmissionPaymentPage from '@/pages/public/AdmissionPaymentPage';
import TransferManagementPage from '@/pages/TransferManagementPage';
import { GenerateTcPage } from '@/pages/GenerateTcPage';
import TcRecordsPage from '@/pages/TcRecordsPage';
import PrintTcPage from '@/pages/PrintTcPage';
import InventoryPage from '@/pages/InventoryPage';
import HostelDashboardPage from '@/pages/HostelDashboardPage';
import HostelStudentListPage from '@/pages/HostelStudentListPage';
import HostelRoomListPage from '@/pages/HostelRoomListPage';
import HostelChoreRosterPage from '@/pages/HostelChoreRosterPage';
import HostelFeePage from '@/pages/HostelFeePage';
import HostelAttendancePage from '@/pages/HostelAttendancePage';
import HostelMessPage from '@/pages/HostelMessPage';
import HostelStaffPage from '@/pages/HostelStaffPage';
import HostelInventoryPage from '@/pages/HostelInventoryPage';
import HostelDisciplinePage from '@/pages/HostelDisciplinePage';
import HostelHealthPage from '@/pages/HostelHealthPage';
import HostelCommunicationPage from '@/pages/HostelCommunicationPage';
import HostelSettingsPage from '@/pages/HostelSettingsPage';
import CalendarPage from '@/pages/CalendarPage';
import CommunicationPage from '@/pages/CommunicationPage';
import ManageNoticesPage from '@/pages/ManageNoticesPage';
import NewsPage from '@/pages/public/NewsPage';
import ManageNewsPage from '@/pages/ManageNewsPage';
import GalleryManagerPage from '@/pages/GalleryManagerPage';
import WebsiteMediaManagerPage from '@/pages/WebsiteMediaManagerPage';
import UserProfilePage from '@/pages/UserProfilePage';
import ChangePasswordPage from '@/pages/ChangePasswordPage';
import { UserManagementPage } from '@/pages/UserManagementPage';
import AdminPage from '@/pages/AdminPage';
import PromotionPage from '@/pages/PromotionPage';
import { ManageSubjectsPage } from '@/pages/ManageSubjectsPage';
import SitemapEditorPage from '@/pages/SitemapEditorPage';
import PublicHomePage from '@/pages/public/PublicHomePage';
import AboutPage from '@/pages/public/AboutPage';
import HistoryPage from '@/pages/public/HistoryPage';
import FacultyPage from '@/pages/public/FacultyPage';
import RulesPage from '@/pages/public/RulesPage';
import AdmissionsPage from '@/pages/public/AdmissionsPage';
import OnlineAdmissionPage from '@/pages/public/OnlineAdmissionPage';
import AdmissionStatusPage from '@/pages/public/AdmissionStatusPage';
import SuppliesPage from '@/pages/public/SuppliesPage';
import StudentLifePage from '@/pages/public/StudentLifePage';
import NccPage from '@/pages/public/NccPage';
import ArtsCulturePage from '@/pages/public/ArtsCulturePage';
import EcoClubPage from '@/pages/public/EcoClubPage';
import ScienceClubPage from '@/pages/public/ScienceClubPage';
import SlsmeePage from '@/pages/public/SlsmeePage';
import InspireAwardPage from '@/pages/public/InspireAwardPage';
import NcscPage from '@/pages/public/NcscPage';
import ScienceTourPage from '@/pages/public/ScienceTourPage';
import IncentiveAwardsPage from '@/pages/public/IncentiveAwardsPage';
import MathematicsCompetitionPage from '@/pages/public/MathematicsCompetitionPage';
import QuizPage from '@/pages/public/QuizPage';
import AchievementsPage from '@/pages/public/AchievementsPage';
import AcademicAchievementsPage from '@/pages/public/AcademicAchievementsPage';
import DistinctionHoldersPage from '@/pages/public/DistinctionHoldersPage';
import SportsPage from '@/pages/public/SportsPage';
import FacilitiesPage from '@/pages/public/FacilitiesPage';
import InfrastructurePage from '@/pages/public/InfrastructurePage';
import GalleryPage from '@/pages/public/GalleryPage';
import ContactPage from '@/pages/public/ContactPage';
import SitemapPage from '@/pages/public/SitemapPage';
import SitemapXmlPage from '@/pages/public/SitemapXmlPage';
import AcademicPerformancePage from '@/pages/AcademicPerformancePage';
import ReportSearchPage from '@/pages/ReportSearchPage';
import ClassMarkStatementPage from '@/pages/ClassMarkStatementPage';
import BulkProgressReportPage from '@/pages/BulkProgressReportPage';
import ProgressReportPage from '@/pages/ProgressReportPage';
import RoutinePage from '@/pages/public/RoutinePage';
import ExamSelectionPage from '@/pages/ExamSelectionPage';
import ExamClassSelectionPage from '@/pages/ExamClassSelectionPage';
import AdmissionSettingsPage from '@/pages/AdmissionSettingsPage';
import MandatoryDisclosurePage from '@/pages/public/MandatoryDisclosurePage';
import ParentDashboardPage from '@/pages/ParentDashboardPage';
import HomeworkScannerPage from '@/pages/HomeworkScannerPage';
import ActivityLogPage from '@/pages/ActivityLogPage';
import SchoolSettingsPage from '@/pages/SchoolSettingsPage';
import ManageHomeworkPage from '@/pages/ManageHomeworkPage';
import ManageSyllabusPage from '@/pages/ManageSyllabusPage';
import { ParentsManagementPage } from '@/pages/ParentsManagementPage';
import PublicStaffDetailPage from '@/pages/public/PublicStaffDetailPage';
import StudentAttendancePage from '@/pages/StudentAttendancePage';
import StudentAttendanceLogPage from '@/pages/StudentAttendanceLogPage';
import SyllabusPage from '@/pages/public/SyllabusPage';
import OnlineAdmissionsListPage from '@/pages/OnlineAdmissionsListPage';
import HostelPage from '@/pages/public/HostelPage';
import AcademicsPage from '@/pages/public/AcademicsPage';
import CurriculumPage from '@/pages/public/CurriculumPage';
import FeeManagementPage from '@/pages/FeeManagementPage';
import FeesPage from '@/pages/public/FeesPage';
import InsightsPage from '@/pages/InsightsPage';
import ManageNavigationPage from '@/pages/ManageNavigationPage';
import TextbooksPage from '@/pages/public/TextbooksPage';
import ManageTextbooksPage from '@/pages/ManageTextbooksPage';

import NotificationContainer from '@/components/NotificationContainer';
import OfflineIndicator from '@/components/OfflineIndicator';
import { SpinnerIcon } from '@/components/Icons';

const { Routes, Route, Navigate, useLocation, useNavigate } = ReactRouterDOM as any;

// ── Helper: resolve Firestore collection from admission ID prefix ─────────────
const getAdmissionCollection = (id: string): string =>
  id.startsWith('BMSHST') ? 'hostel_admissions' : 'online_admissions';

// ── Helper: generate a unique hostel admission ID ─────────────────────────────
const generateHostelAdmissionId = (): string => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BMSHST${ts}${rand}`;
};

const App: React.FC = () => {
  // ── State ─────────────────────────────────────────────────────────────────
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [onlineAdmissions, setOnlineAdmissions] = useState<OnlineAdmission[]>([]);
  const [hostelAdmissions, setHostelAdmissions] = useState<OnlineAdmission[]>([]);
  const [navigation, setNavigation] = useState<NavMenuItem[]>([]);

  // Config
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [feeStructure, setFeeStructure] = useState<FeeStructure>(DEFAULT_FEE_STRUCTURE);
  const [admissionSettings, setAdmissionSettings] = useState<AdmissionSettings>(DEFAULT_ADMISSION_SETTINGS);
  const [schoolConfig, setSchoolConfig] = useState({ paymentQRCodeUrl: '', upiId: '' });
  const [gradeDefinitions, setGradeDefinitions] = useState<Record<Grade, GradeDefinition>>(GRADE_DEFINITIONS);

  // Records
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
  const [sitemapContent, setSitemapContent] = useState<string>(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://bms04.netlify.app/</loc></url></urlset>`);

  // Hostel
  const [hostelResidents, setHostelResidents] = useState<HostelResident[]>([]);
  const [hostelStaff, setHostelStaff] = useState<HostelStaff[]>([]);
  const [hostelInventory, setHostelInventory] = useState<HostelInventoryItem[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [choreRoster, setChoreRoster] = useState({} as ChoreRoster);

  // Logs & Attendance
  const [conductLog, setConductLog] = useState<ConductEntry[]>([]);
  const [hostelDisciplineLog, setHostelDisciplineLog] = useState<HostelDisciplineEntry[]>([]);
  const [dailyStudentAttendance, setDailyStudentAttendance] = useState<Record<Grade, Record<string, StudentAttendanceRecord>>>(
    GRADES_LIST.reduce((acc, grade) => ({ ...acc, [grade]: {} }), {}) as Record<Grade, Record<string, StudentAttendanceRecord>>
  );
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceRecord>({});
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: NotificationType; title?: string }[]>([]);

  // ── Derived ───────────────────────────────────────────────────────────────
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

  const pendingAdmissionsCount =
    onlineAdmissions.filter(a => a.status === 'pending').length +
    hostelAdmissions.filter(a => a.status === 'pending').length;
  const pendingParentCount = users.filter(u => u.role === 'pending_parent').length;
  const pendingStaffCount  = users.filter(u => u.role === 'pending').length;

  // ── Notifications ─────────────────────────────────────────────────────────
  const addNotification = (message: string, type: NotificationType, title?: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type, title }]);
  };
  const removeNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleLogin = async (email?: string, password?: string) => {
    if (!email || !password) return { success: false, message: 'Credentials missing' };
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

  // ── Students ──────────────────────────────────────────────────────────────
  const handleAddStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      const ref = db.collection('students').doc();
      const studentId = formatStudentId(studentData, academicYear);
      await ref.set({ ...studentData, id: ref.id, studentId, academicYear });
      addNotification('Student added successfully!', 'success');
    } catch (error: any) {
      addNotification('Failed to add student.', 'error');
    }
  };

  const handleEditStudent = async (studentData: Student) => {
    try {
      const { id, feePayments, academicPerformance, ...updatableData } = studentData;
      await db.collection('students').doc(id).update(updatableData);
      addNotification('Student updated successfully!', 'success');
    } catch (error: any) {
      addNotification('Failed to update student.', 'error');
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    try {
      await db.collection('students').doc(student.id).update({ status: 'Dropped' });
      addNotification(`Student ${student.name} marked as dropped.`, 'success');
    } catch (error: any) {
      addNotification('Failed to drop student.', 'error');
    }
  };

  const handleUpdateFeePayments = async (studentId: string, payments: FeePayments) => {
    try {
      await db.collection('students').doc(studentId).update({ feePayments: payments });
      addNotification('Fee payments updated successfully!', 'success');
    } catch (error: any) {
      addNotification('Failed to update fee payments.', 'error');
    }
  };

  const handleUpdateBulkFeePayments = async (updates: Array<{ studentId: string; payments: FeePayments }>) => {
    const batch = db.batch();
    updates.forEach(({ studentId, payments }) => {
      batch.update(db.collection('students').doc(studentId), { feePayments: payments });
    });
    try {
      await batch.commit();
      addNotification('Bulk fee payments updated successfully!', 'success');
    } catch (error: any) {
      addNotification('Failed to update bulk fee payments.', 'error');
    }
  };

  const handleUpdateAcademic = async (studentId: string, performance: Exam[]) => {
    try {
      await db.collection('students').doc(studentId).update({ academicPerformance: performance });
    } catch (error: any) {
      addNotification('Failed to update academic performance.', 'error');
    }
  };

  const handleResetAllAcademicMarks = async () => {
    try {
      const batch = db.batch();
      const snap = await db.collection('students').get();
      snap.docs.forEach(doc => batch.update(db.collection('students').doc(doc.id), { academicPerformance: [] }));
      await batch.commit();
      addNotification('All academic records have been reset.', 'success');
    } catch (error: any) {
      addNotification('Failed to reset all academic records.', 'error');
    }
  };

  // ── Config ────────────────────────────────────────────────────────────────
  const handleUpdateAcademicYear = async (year: string) => {
    try {
      await db.collection('config').doc('academic').set({ currentAcademicYear: year });
      setAcademicYear(year);
      addNotification(`Academic year set to ${year}.`, 'success');
    } catch (error: any) {
      addNotification('Failed to set academic year.', 'error');
    }
  };

  const handleUpdateFeeStructure = async (newStructure: FeeStructure) => {
    try {
      await db.collection('config').doc('feeStructure').set(newStructure);
      addNotification('Fee structure updated successfully!', 'success');
      return true;
    } catch (error: any) {
      addNotification('Failed to update fee structure.', 'error');
      return false;
    }
  };

  const handleUpdateGradeDefinition = async (grade: Grade, newDefinition: GradeDefinition) => {
    try {
      await db.collection('config').doc('gradeDefinitions').set({ ...gradeDefinitions, [grade]: newDefinition });
      addNotification(`Grade definition for ${grade} updated.`, 'success');
    } catch (error: any) {
      addNotification('Failed to update grade definition.', 'error');
    }
  };

  // ── Enrollment ────────────────────────────────────────────────────────────
  // Routes to the correct Firestore collection based on admission ID prefix.
  // Existing students keep their previousStudentId; new students get BMS26[Class][Roll].
  const handleEnrollStudent = async (admissionId: string, studentData: Omit<Student, 'id'>) => {
    try {
      const batch = db.batch();
      const studentRef = db.collection('students').doc();
      batch.set(studentRef, { ...studentData, id: studentRef.id, status: StudentStatus.ACTIVE });
      const admissionRef = db.collection(getAdmissionCollection(admissionId)).doc(admissionId);
      batch.update(admissionRef, { status: 'approved', isEnrolled: true, temporaryStudentId: studentData.studentId });
      await batch.commit();
      addNotification(`${studentData.name} enrolled with ID ${studentData.studentId}!`, 'success', 'Enrollment Complete');
    } catch (error: any) {
      addNotification('Failed to enroll student. Check database permissions.', 'error', 'Enrollment Failed');
      throw error;
    }
  };

  // ── Admission Submit ──────────────────────────────────────────────────────
  // Day Scholars → online_admissions (BMSAPP… ID)
  // Boarders → hostel_admissions (BMSHST… ID)
  const handleOnlineAdmissionSubmit = async (data: Partial<OnlineAdmission>, id?: string): Promise<string> => {
    try {
      const sanitized = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === undefined ? null : v])
      );

      if (id) {
        await db.collection(getAdmissionCollection(id)).doc(id).set(sanitized, { merge: true });
        return id;
      }

      if (data.boardingType === 'Boarder') {
        const newId = generateHostelAdmissionId();
        await db.collection('hostel_admissions').doc(newId).set({
          ...sanitized, id: newId, submissionDate: new Date().toISOString(),
        });
        return newId;
      } else {
        const docRef = db.collection('online_admissions').doc();
        const customId = `BMSAPP${docRef.id}`;
        await db.collection('online_admissions').doc(customId).set({
          ...sanitized, id: customId, temporaryStudentId: customId, submissionDate: new Date().toISOString(),
        });
        return customId;
      }
    } catch (error: any) {
      addNotification('Failed to save admission. Please try again.', 'error');
      throw error;
    }
  };

  // ── Admission Status / Delete ─────────────────────────────────────────────
  const handleAdmissionUpdateStatus = async (id: string, status: OnlineAdmission['status']): Promise<void> => {
    try {
      await db.collection(getAdmissionCollection(id)).doc(id).update({ status });
      addNotification('Application status updated.', 'success');
    } catch (error: any) {
      addNotification('Failed to update status.', 'error');
    }
  };

  const handleAdmissionDelete = async (id: string): Promise<void> => {
    try {
      await db.collection(getAdmissionCollection(id)).doc(id).delete();
      addNotification('Application deleted.', 'success');
    } catch (error: any) {
      addNotification('Failed to delete application.', 'error');
    }
  };

  // ── Promotion ─────────────────────────────────────────────────────────────
  // Archives every active student, promotes to next grade with new IDs,
  // graduates Class X, resets marks & fees, advances academic year.
  const handlePromoteStudents = async () => {
    try {
      const currentYear = academicYear;
      const nextYear    = getNextAcademicYear(currentYear);
      const activeStudents = students.filter(s => s.status === StudentStatus.ACTIVE);

      // Chunk into batches of 400 (Firestore limit is 500 ops/batch)
      const CHUNK = 400;
      for (let i = 0; i < activeStudents.length; i += CHUNK) {
        const batch = db.batch();
        const chunk = activeStudents.slice(i, i + CHUNK);

        chunk.forEach(student => {
          // Archive snapshot
          const archiveRef = db
            .collection('students_archive')
            .doc(currentYear)
            .collection('students')
            .doc(student.id);
          batch.set(archiveRef, {
            ...student,
            archivedAt: new Date().toISOString(),
            archivedFromYear: currentYear,
          });

          const studentRef = db.collection('students').doc(student.id);

          if (student.grade === Grade.X) {
            // Class X → Graduate
            batch.update(studentRef, {
              status: StudentStatus.GRADUATED,
              academicYear: currentYear,
            });
          } else {
            // All others → promote
            const gradeDef    = gradeDefinitions[student.grade];
            const resultStatus = calculateStudentResult(student, gradeDef);
            const nextGrade   = resultStatus === 'FAIL' ? student.grade : (getNextGrade(student.grade) || student.grade);
            const newStudentId = formatStudentId({ grade: nextGrade, rollNo: student.rollNo } as any, nextYear);

            batch.update(studentRef, {
              grade: nextGrade,
              studentId: newStudentId,
              academicYear: nextYear,
              academicPerformance: [],
              feePayments: {
                admissionFeePaid: true,
                tuitionFeesPaid: {},
                examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
              },
            });
          }
        });

        await batch.commit();
      }

      // Also clear attendance records
      const [saSnap, staffSnap] = await Promise.all([
        db.collection('studentAttendance').get(),
        db.collection('staffAttendance').get(),
      ]);
      if (saSnap.docs.length + staffSnap.docs.length > 0) {
        const attBatch = db.batch();
        saSnap.docs.forEach(doc => attBatch.delete(db.collection('studentAttendance').doc(doc.id)));
        staffSnap.docs.forEach(doc => attBatch.delete(db.collection('staffAttendance').doc(doc.id)));
        await attBatch.commit();
      }

      // Advance academic year
      await db.collection('config').doc('academic').set({ currentAcademicYear: nextYear });
      setAcademicYear(nextYear);

      addNotification(
        `${activeStudents.length} students promoted. Academic year is now ${nextYear}.`,
        'success', 'Promotion Complete'
      );
      window.location.reload();
    } catch (error: any) {
      console.error('Promotion failed:', error);
      addNotification(`Promotion failed: ${error.message}`, 'error', 'Promotion Error');
    }
  };

  // ── TC / Service Certificates ─────────────────────────────────────────────
  const handleGenerateTc = async (tcData: Omit<TcRecord, 'id'>) => {
    try {
      await db.collection('tcRecords').add(tcData);
      await db.collection('students').doc(tcData.studentDbId).update({ status: StudentStatus.TRANSFERRED });
      addNotification('Transfer Certificate generated.', 'success');
      return true;
    } catch (error: any) {
      addNotification('Failed to generate Transfer Certificate.', 'error');
      return false;
    }
  };

  const handleGenerateServiceCertificate = async (certData: Omit<ServiceCertificateRecord, 'id'>) => {
    try {
      await db.collection('serviceCertificates').add(certData);
      await db.collection('staff').doc(certData.staffDetails.staffNumericId).update({ status: StudentStatus.TRANSFERRED });
      addNotification('Service Certificate generated.', 'success');
    } catch (error: any) {
      addNotification('Failed to generate Service Certificate.', 'error');
    }
  };

  // ── Inventory ─────────────────────────────────────────────────────────────
  const handleAddInventoryItem    = async (item: Omit<InventoryItem, 'id'>) => { try { await db.collection('inventory').add(item); addNotification('Item added.', 'success'); } catch { addNotification('Failed to add item.', 'error'); } };
  const handleEditInventoryItem   = async (item: InventoryItem)             => { try { await db.collection('inventory').doc(item.id).update(item); addNotification('Item updated.', 'success'); } catch { addNotification('Failed to update item.', 'error'); } };
  const handleDeleteInventoryItem = async (item: InventoryItem)             => { try { await db.collection('inventory').doc(item.id).delete(); addNotification('Item deleted.', 'success'); } catch { addNotification('Failed to delete item.', 'error'); } };

  const handleUpdateStock = async (itemId: string, change: number, notes: string) => {
    try {
      const itemRef = db.collection('hostelInventory').doc(itemId);
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(itemRef);
        if (!doc.exists) throw new Error('Item does not exist!');
        const newStock = (doc.data()?.currentStock || 0) + change;
        if (newStock < 0) throw new Error('Not enough stock!');
        transaction.update(itemRef, { currentStock: newStock });
        await db.collection('stockLogs').add({ itemId, itemName: doc.data()?.name || 'Unknown', quantity: Math.abs(change), type: change > 0 ? 'IN' : 'OUT', date: new Date().toISOString(), notes });
      });
      addNotification('Stock updated.', 'success');
    } catch (error: any) {
      addNotification(`Failed to update stock: ${error.message}`, 'error');
    }
  };

  // ── Hostel Residents ──────────────────────────────────────────────────────
  const handleAddHostelResident    = async (r: Omit<HostelResident, 'id'>) => { try { await db.collection('hostelResidents').add(r); addNotification('Resident added.', 'success'); } catch { addNotification('Failed to add resident.', 'error'); } };
  const handleEditHostelResident   = async (r: HostelResident)             => { try { await db.collection('hostelResidents').doc(r.id).update(r); addNotification('Resident updated.', 'success'); } catch { addNotification('Failed to update resident.', 'error'); } };
  const handleDeleteHostelResident = async (r: HostelResident)             => { try { await db.collection('hostelResidents').doc(r.id).delete(); addNotification('Resident removed.', 'success'); } catch { addNotification('Failed to remove resident.', 'error'); } };

  const handleAddHostelResidentById = async (studentIdInput: string) => {
    try {
      const student = students.find(s => formatStudentId(s, academicYear).toLowerCase() === studentIdInput.toLowerCase());
      if (!student) return { success: false, message: 'Student ID not found.' };
      if (hostelResidents.find(r => r.studentId === student.id)) return { success: false, message: `${student.name} is already a resident.` };
      await db.collection('hostelResidents').add({ studentId: student.id, dormitory: 'Boys Dorm A' as any, dateOfJoining: new Date().toISOString().split('T')[0] });
      addNotification(`${student.name} added as hostel resident.`, 'success');
      return { success: true };
    } catch (error: any) {
      addNotification('Failed to add hostel resident.', 'error');
      return { success: false, message: 'Failed to add. Please try again.' };
    }
  };

  // ── Hostel Staff ──────────────────────────────────────────────────────────
  const handleAddHostelStaff    = async (s: Omit<HostelStaff, 'id'>) => { try { await db.collection('hostelStaff').add(s); addNotification('Hostel staff added.', 'success'); } catch { addNotification('Failed to add hostel staff.', 'error'); } };
  const handleEditHostelStaff   = async (s: HostelStaff)             => { try { await db.collection('hostelStaff').doc(s.id).update(s); addNotification('Hostel staff updated.', 'success'); } catch { addNotification('Failed to update hostel staff.', 'error'); } };
  const handleDeleteHostelStaff = async (s: HostelStaff)             => { try { await db.collection('hostelStaff').doc(s.id).delete(); addNotification('Hostel staff deleted.', 'success'); } catch { addNotification('Failed to delete hostel staff.', 'error'); } };

  // ── Hostel Discipline ─────────────────────────────────────────────────────
  const handleSaveHostelDisciplineEntry = async (entryData: Omit<HostelDisciplineEntry, 'id' | 'reportedBy' | 'reportedById'>, id?: string) => {
    try {
      const fullEntry = { ...entryData, reportedBy: user?.displayName || user?.email || 'Unknown', reportedById: user!.uid };
      if (id) { await db.collection('hostelDisciplineLog').doc(id).update(fullEntry); }
      else { await db.collection('hostelDisciplineLog').add(fullEntry); }
      addNotification('Discipline record saved.', 'success');
    } catch (error: any) {
      addNotification('Failed to save discipline entry.', 'error');
    }
  };

  const handleDeleteHostelDisciplineEntry = async (entry: HostelDisciplineEntry) => {
    try { await db.collection('hostelDisciplineLog').doc(entry.id).delete(); addNotification('Discipline record deleted.', 'success'); }
    catch { addNotification('Failed to delete discipline entry.', 'error'); }
  };

  const handleSaveChoreRoster = async (roster: ChoreRoster) => {
    try { await db.collection('choreRoster').doc('current').set(roster); addNotification('Chore roster updated.', 'success'); }
    catch { addNotification('Failed to update chore roster.', 'error'); }
  };

  // ── Attendance ────────────────────────────────────────────────────────────
  const handleMarkStudentAttendance = async (grade: Grade, date: string, records: StudentAttendanceRecord) => {
    try { await db.collection('studentAttendance').doc(date).set({ [grade]: records }, { merge: true }); addNotification('Attendance saved.', 'success'); }
    catch { addNotification('Failed to save attendance.', 'error'); }
  };

  const fetchStudentAttendanceForMonth = async (grade: Grade, year: number, month: number) => {
    try {
      const pad = String(month).padStart(2, '0');
      const snap = await db.collection('studentAttendance')
        .where(firebase.firestore.FieldPath.documentId(), '>=', `${year}-${pad}-01`)
        .where(firebase.firestore.FieldPath.documentId(), '<=', `${year}-${pad}-31`)
        .get();
      const result: Record<string, StudentAttendanceRecord> = {};
      snap.forEach(doc => { const d = doc.data(); if (d[grade]) result[doc.id] = d[grade]; });
      return result;
    } catch { return {}; }
  };

  const fetchStudentAttendanceForRange = async (grade: Grade, startDate: string, endDate: string) => {
    try {
      const snap = await db.collection('studentAttendance')
        .where(firebase.firestore.FieldPath.documentId(), '>=', startDate)
        .where(firebase.firestore.FieldPath.documentId(), '<=', endDate)
        .get();
      const result: Record<string, StudentAttendanceRecord> = {};
      snap.forEach(doc => { const d = doc.data(); if (d[grade]) result[doc.id] = d[grade]; });
      return result;
    } catch { return {}; }
  };

  const handleMarkStaffAttendance = async (staffId: string, status: StaffAttendanceRecord[string]) => {
    const today = new Date().toISOString().split('T')[0];
    try { await db.collection('staffAttendance').doc(today).set({ [staffId]: status }, { merge: true }); addNotification('Staff attendance marked.', 'success'); }
    catch { addNotification('Failed to mark staff attendance.', 'error'); }
  };

  const fetchStaffAttendanceForMonth = async (year: number, month: number) => {
    try {
      const pad = String(month).padStart(2, '0');
      const snap = await db.collection('staffAttendance')
        .where(firebase.firestore.FieldPath.documentId(), '>=', `${year}-${pad}-01`)
        .where(firebase.firestore.FieldPath.documentId(), '<=', `${year}-${pad}-31`)
        .get();
      const result: Record<string, StaffAttendanceRecord> = {};
      snap.forEach(doc => { result[doc.id] = doc.data() as StaffAttendanceRecord; });
      return result;
    } catch { return {}; }
  };

  const fetchStaffAttendanceForRange = async (startDate: string, endDate: string) => {
    try {
      const snap = await db.collection('staffAttendance')
        .where(firebase.firestore.FieldPath.documentId(), '>=', startDate)
        .where(firebase.firestore.FieldPath.documentId(), '<=', endDate)
        .get();
      const result: Record<string, StaffAttendanceRecord> = {};
      snap.forEach(doc => { result[doc.id] = doc.data() as StaffAttendanceRecord; });
      return result;
    } catch { return {}; }
  };

  // ── Academic / Activity ───────────────────────────────────────────────────
  const handleBulkUpdateActivityLogs = async (updates: Array<{ studentId: string; examId: 'terminal1' | 'terminal2' | 'terminal3'; subjectName: string; activityLog: ActivityLog; activityMarks: number }>) => {
    const batch = db.batch();
    for (const update of updates) {
      const ref = db.collection('students').doc(update.studentId);
      const doc = await ref.get();
      if (doc.exists) {
        const perf = (doc.data()?.academicPerformance || []) as Exam[];
        const examIdx = perf.findIndex(e => e.id === update.examId);
        const exam: Exam = examIdx !== -1 ? { ...perf[examIdx] } : { id: update.examId, name: update.examId, results: [] };
        const resIdx = exam.results.findIndex(r => r.subject === update.subjectName);
        const newResult: SubjectMark = { subject: update.subjectName, activityLog: update.activityLog, activityMarks: update.activityMarks };
        if (resIdx !== -1) { exam.results[resIdx] = { ...exam.results[resIdx], ...newResult }; }
        else { exam.results.push(newResult); }
        if (examIdx !== -1) { perf[examIdx] = exam; } else { perf.push(exam); }
        batch.update(ref, { academicPerformance: perf });
      }
    }
    try { await batch.commit(); addNotification('Activity logs updated.', 'success'); }
    catch { addNotification('Failed to update activity logs.', 'error'); }
  };

  // ── Staff ─────────────────────────────────────────────────────────────────
  const handleSaveStaff = async (staffData: Omit<Staff, 'id'>, id: string | undefined, assignedGradeKey: Grade | null) => {
    try {
      if (id) {
        await db.collection('staff').doc(id).update(staffData);
        if (assignedGradeKey) {
          await db.collection('config').doc('gradeDefinitions').update({ [assignedGradeKey]: { ...gradeDefinitions[assignedGradeKey], classTeacherId: id } });
        } else {
          const cur = Object.keys(gradeDefinitions).find(g => gradeDefinitions[g as Grade]?.classTeacherId === id) as Grade | undefined;
          if (cur) await db.collection('config').doc('gradeDefinitions').update({ [cur]: { ...gradeDefinitions[cur], classTeacherId: firebase.firestore.FieldValue.delete() } });
        }
        addNotification('Staff updated.', 'success');
      } else {
        const ref = db.collection('staff').doc();
        await ref.set({ ...staffData, id: ref.id });
        if (assignedGradeKey) await db.collection('config').doc('gradeDefinitions').update({ [assignedGradeKey]: { ...gradeDefinitions[assignedGradeKey], classTeacherId: ref.id } });
        addNotification('Staff added.', 'success');
      }
    } catch (error: any) {
      addNotification('Failed to save staff.', 'error');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      await db.collection('staff').doc(id).delete();
      const cur = Object.keys(gradeDefinitions).find(g => gradeDefinitions[g as Grade]?.classTeacherId === id) as Grade | undefined;
      if (cur) await db.collection('config').doc('gradeDefinitions').update({ [cur]: { ...gradeDefinitions[cur], classTeacherId: firebase.firestore.FieldValue.delete() } });
      addNotification('Staff deleted.', 'success');
    } catch { addNotification('Failed to delete staff.', 'error'); }
  };

  // ── Content ───────────────────────────────────────────────────────────────
  const handleSaveHomework = async (hw: Omit<Homework, 'id' | 'createdBy'>, id?: string) => {
    try {
      const data = { ...hw, createdBy: { uid: user!.uid, name: user!.displayName || user!.email! } };
      if (id) { await db.collection('homework').doc(id).update(data); } else { await db.collection('homework').add(data); }
      addNotification('Homework saved.', 'success');
    } catch { addNotification('Failed to save homework.', 'error'); }
  };
  const handleDeleteHomework = async (id: string) => { try { await db.collection('homework').doc(id).delete(); addNotification('Homework deleted.', 'success'); } catch { addNotification('Failed to delete homework.', 'error'); } };

  const handleSaveSyllabus = async (syl: Omit<Syllabus, 'id'>, id: string) => {
    try { await db.collection('syllabus').doc(id).set(syl); addNotification('Syllabus saved.', 'success'); }
    catch { addNotification('Failed to save syllabus.', 'error'); }
  };

  const handleSaveNotice = async (notice: Omit<Notice, 'id' | 'createdBy'>, id?: string) => {
    try {
      const data = { ...notice, createdBy: { uid: user!.uid, name: user!.displayName || user!.email! } };
      if (id) { await db.collection('notices').doc(id).update(data); } else { await db.collection('notices').add(data); }
      addNotification('Notice saved.', 'success');
    } catch { addNotification('Failed to save notice.', 'error'); }
  };
  const handleDeleteNotice = async (id: string) => { try { await db.collection('notices').doc(id).delete(); addNotification('Notice deleted.', 'success'); } catch { addNotification('Failed to delete notice.', 'error'); } };

  const handleSaveNews = async (item: Omit<NewsItem, 'id'>, id?: string) => {
    try {
      if (id) { await db.collection('news').doc(id).update(item); } else { await db.collection('news').add(item); }
      addNotification('News item saved.', 'success');
    } catch { addNotification('Failed to save news item.', 'error'); }
  };
  const handleDeleteNews = async (id: string) => { try { await db.collection('news').doc(id).delete(); addNotification('News item deleted.', 'success'); } catch { addNotification('Failed to delete news item.', 'error'); } };

  const handleSaveCalendarEvent = async (event: Omit<CalendarEvent, 'id'>, id?: string) => {
    try {
      if (id) { await db.collection('calendarEvents').doc(id).update(event); } else { await db.collection('calendarEvents').add(event); }
      addNotification('Calendar event saved.', 'success'); return true;
    } catch { addNotification('Failed to save calendar event.', 'error'); return false; }
  };
  const handleDeleteCalendarEvent = async (event: CalendarEvent) => { try { await db.collection('calendarEvents').doc(event.id).delete(); addNotification('Calendar event deleted.', 'success'); } catch { addNotification('Failed to delete calendar event.', 'error'); } };

  const handleSaveExamRoutine = async (routine: Omit<ExamRoutine, 'id'>, id?: string) => {
    try {
      if (id) { await db.collection('examRoutines').doc(id).update(routine); } else { await db.collection('examRoutines').add(routine); }
      addNotification('Exam routine saved.', 'success'); return true;
    } catch { addNotification('Failed to save exam routine.', 'error'); return false; }
  };
  const handleDeleteExamRoutine = async (routine: ExamRoutine) => { try { await db.collection('examRoutines').doc(routine.id).delete(); addNotification('Exam routine deleted.', 'success'); } catch { addNotification('Failed to delete exam routine.', 'error'); } };

  const handleUpdateClassRoutine = async (day: string, routine: DailyRoutine) => {
    try { await db.collection('classRoutines').doc(day).set({ routine }); addNotification(`Class routine for ${day} updated.`, 'success'); }
    catch { addNotification('Failed to update class routine.', 'error'); }
  };

  // ── Users ─────────────────────────────────────────────────────────────────
  const handleUpdateUserProfile  = async (updates: { photoURL?: string }) => { try { await auth.currentUser?.updateProfile(updates); await db.collection('users').doc(user!.uid).update(updates); addNotification('Profile updated.', 'success'); return { success: true }; } catch (error: any) { return { success: false, message: error.message }; } };
  const handleUpdateUserRole     = async (uid: string, newRole: 'admin' | 'user' | 'pending' | 'warden') => { try { await db.collection('users').doc(uid).update({ role: newRole }); addNotification(`User role updated to ${newRole}.`, 'success'); } catch { addNotification('Failed to update user role.', 'error'); } };
  const handleDeleteUser         = async (uid: string) => { try { await db.collection('users').doc(uid).delete(); addNotification('User deleted.', 'success'); } catch { addNotification('Failed to delete user.', 'error'); } };
  const handleUpdateParentUser   = async (uid: string, updates: Partial<User>) => { try { await db.collection('users').doc(uid).update(updates); addNotification('Parent account updated.', 'success'); } catch { addNotification('Failed to update parent account.', 'error'); } };

  const handleSendMessage = async (message: { fromParentId: string; fromParentName: string; toTeacherId: string; toTeacherName: string; childId: string; childName: string; message: string }) => {
    try { await db.collection('parentMessages').add({ ...message, timestamp: firebase.firestore.FieldValue.serverTimestamp(), read: false }); addNotification('Message sent!', 'success'); return true; }
    catch { addNotification('Failed to send message.', 'error'); return false; }
  };

  // ── Nav & Sitemap ─────────────────────────────────────────────────────────
  const handleSaveNavItem    = async (item: Partial<NavMenuItem>) => { try { const id = item.id || db.collection('navigation').doc().id; await db.collection('navigation').doc(id).set({ ...item, id, isActive: true, updatedAt: new Date().toISOString() }, { merge: true }); addNotification('Navigation item saved.', 'success'); } catch { addNotification('Failed to save navigation item.', 'error'); } };
  const handleDeleteNavItem  = async (id: string) => { try { await db.collection('navigation').doc(id).delete(); addNotification('Navigation item deleted.', 'success'); } catch { addNotification('Failed to delete navigation item.', 'error'); } };
  const handleSaveSitemapContent = async (content: string) => { try { await db.collection('config').doc('sitemap').set({ content }); addNotification('Sitemap updated.', 'success'); } catch { addNotification('Failed to save sitemap.', 'error'); } };

  // ── Firestore Listeners ───────────────────────────────────────────────────
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const unsubs = [
      db.collection('config').doc('academic').onSnapshot(doc => {
        if (doc.exists) setAcademicYear(doc.data()?.currentAcademicYear || getCurrentAcademicYear());
      }),
      db.collection('studentAttendance').doc(today).onSnapshot(doc => {
        if (doc.exists) setDailyStudentAttendance(doc.data() as any);
        else setDailyStudentAttendance(GRADES_LIST.reduce((acc, g) => ({ ...acc, [g]: {} }), {}) as any);
      }),
      db.collection('staffAttendance').doc(today).onSnapshot(doc => {
        setStaffAttendance(doc.exists ? doc.data() as StaffAttendanceRecord : {});
      }),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
          if (userDoc.exists) {
            setUser({ uid: firebaseUser.uid, ...userDoc.data() } as User);
          } else {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email || '', displayName: firebaseUser.displayName || 'User', role: 'user' });
          }
        } catch { setUser(null); }
      } else { setUser(null); }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Public data
  useEffect(() => {
    const unsubs = [
      db.collection('news').onSnapshot(s => setNews(s.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem)))),
      db.collection('examRoutines').onSnapshot(s => setExamRoutines(s.docs.map(d => ({ id: d.id, ...d.data() } as ExamRoutine)))),
      db.collection('classRoutines').onSnapshot(s => {
        const r: Record<string, DailyRoutine> = {};
        s.docs.forEach(d => r[d.id] = d.data()?.routine as DailyRoutine);
        setClassRoutines(r);
      }),
      db.collection('config').doc('schoolSettings').onSnapshot(doc => { if (doc.exists) setSchoolConfig(doc.data() as any); }),
      db.collection('config').doc('feeStructure').onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data() || {};
          const migrateSet = (s: any): FeeSet => {
            if (s && Array.isArray(s.heads)) return s;
            const heads: FeeHead[] = [];
            if (s?.tuitionFee) heads.push({ id: 'tui', name: 'Tuition Fee (Monthly)', amount: Number(s.tuitionFee), type: 'monthly' });
            if (s?.examFee)    heads.push({ id: 'eTerm', name: 'Exam Fee (Per Term)', amount: Number(s.examFee), type: 'term' });
            return { heads };
          };
          setFeeStructure({ set1: migrateSet(data.set1), set2: migrateSet(data.set2), set3: migrateSet(data.set3), gradeMap: data.gradeMap || FEE_SET_GRADES });
        }
      }),
      db.collection('config').doc('admissionSettings').onSnapshot(doc => {
        if (doc.exists) setAdmissionSettings({ ...DEFAULT_ADMISSION_SETTINGS, ...doc.data() } as AdmissionSettings);
      }),
      db.collection('config').doc('gradeDefinitions').onSnapshot(doc => { if (doc.exists) setGradeDefinitions(doc.data() as any); }),
      db.collection('config').doc('sitemap').onSnapshot(doc => { if (doc.exists && doc.data()?.content) setSitemapContent(doc.data()?.content); }),
      db.collection('navigation').onSnapshot(snap => {
        setNavigation(snap.docs.map(d => ({ id: d.id, ...d.data() } as NavMenuItem)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      }),
      db.collection('syllabus').onSnapshot(s => setSyllabus(s.docs.map(d => ({ id: d.id, ...d.data() } as Syllabus)))),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  // Protected data
  useEffect(() => {
    if (!user) return;
    const unsubs: (() => void)[] = [
      db.collection('students').onSnapshot(s => setStudents(s.docs.map(d => {
        const data = d.data();
        if (Array.isArray(data.academicPerformance)) {
          data.academicPerformance = data.academicPerformance.map((exam: any) => ({
            ...exam, results: Array.isArray(exam.results) ? exam.results : Object.values(exam.results || {}),
          }));
        }
        return { id: d.id, ...data } as Student;
      }))),
      db.collection('staff').onSnapshot(s => setStaff(s.docs.map(d => ({ id: d.id, ...d.data() } as Staff)))),
      db.collection('calendarEvents').onSnapshot(s => setCalendarEvents(s.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEvent)))),
      db.collection('notices').onSnapshot(s => setNotices(s.docs.map(d => ({ id: d.id, ...d.data() } as Notice)))),
      db.collection('homework').onSnapshot(s => setHomework(s.docs.map(d => ({ id: d.id, ...d.data() } as Homework)))),
      db.collection('conductLog').onSnapshot(s => setConductLog(s.docs.map(d => ({ id: d.id, ...d.data() } as ConductEntry)))),
    ];

    if (['admin', 'warden', 'user'].includes(user.role)) {
      unsubs.push(
db.collection('online_admissions').onSnapshot(s => setOnlineAdmissions(prev => [
    ...s.docs.map(d => ({ id: d.id, ...d.data() } as OnlineAdmission)),
    ...prev.filter(a => a.id.startsWith('BMSHSTMM'))
])),
        db.collection('hostel_admissions').onSnapshot(s => setOnlineAdmissions(prev => [
    ...prev.filter(a => !a.id.startsWith('BMSHSTMM')),
    ...s.docs.map(d => ({ id: d.id, ...d.data(), studentType: 'Boarder' } as OnlineAdmission))
])),
        db.collection('users').onSnapshot(s => setUsers(s.docs.map(d => ({ uid: d.id, ...d.data() } as User)))),
        db.collection('inventory').onSnapshot(s => setInventory(s.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem)))),
        db.collection('tcRecords').onSnapshot(s => setTcRecords(s.docs.map(d => ({ id: d.id, ...d.data() } as TcRecord)))),
        db.collection('serviceCertificates').onSnapshot(s => setServiceCerts(s.docs.map(d => ({ id: d.id, ...d.data() } as ServiceCertificateRecord)))),
        db.collection('hostelDisciplineLog').onSnapshot(s => setHostelDisciplineLog(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelDisciplineEntry)))),
      );
    }

    if (['admin', 'warden'].includes(user.role)) {
      unsubs.push(
        db.collection('hostelResidents').onSnapshot(s => setHostelResidents(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelResident)))),
        db.collection('hostelStaff').onSnapshot(s => setHostelStaff(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelStaff)))),
        db.collection('hostelInventory').onSnapshot(s => setHostelInventory(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelInventoryItem)))),
        db.collection('stockLogs').onSnapshot(s => setStockLogs(s.docs.map(d => ({ id: d.id, ...d.data() } as StockLog)))),
        db.collection('choreRoster').doc('current').onSnapshot(d => { if (d.exists) setChoreRoster(d.data() as ChoreRoster); }),
      );
    }

    return () => unsubs.forEach(u => u());
  }, [user]);

  // ── Loading screen ────────────────────────────────────────────────────────
  const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <SpinnerIcon className="w-10 h-10 text-sky-600 animate-spin" />
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <OfflineIndicator />
      <NotificationContainer notifications={notifications} onDismiss={removeNotification} />

      <Routes>
        {/* ── Public Routes ─────────────────────────────────────────────── */}
        <Route path="/" element={<PublicLayout user={user} navigation={navigation} />}>
          <Route index element={<PublicHomePage news={news} user={user} />} />
          <Route path="about" element={<AboutPage user={user} />} />
          <Route path="history" element={<HistoryPage user={user} />} />
          <Route path="faculty" element={<FacultyPage staff={staff} gradeDefinitions={gradeDefinitions} user={user} />} />
          <Route path="staff/:staffId" element={<PublicStaffDetailPage staff={staff} gradeDefinitions={gradeDefinitions} />} />
          <Route path="rules" element={<RulesPage user={user} />} />
          <Route path="admissions" element={<AdmissionsPage user={user} />} />
          <Route path="admissions/online" element={<OnlineAdmissionPage user={user} onOnlineAdmissionSubmit={handleOnlineAdmissionSubmit} />} />
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
          <Route path="gallery/*" element={<GalleryPage user={user} />} />
          <Route path="contact" element={<ContactPage user={user} />} />
         <Route path="disclosure" element={<MandatoryDisclosurePage user={user} />} />
          <Route path="routine" element={<RoutinePage examSchedules={examRoutines} classSchedules={classRoutines} user={user} onSaveExamRoutine={handleSaveExamRoutine} onDeleteExamRoutine={handleDeleteExamRoutine} onUpdateClassRoutine={handleUpdateClassRoutine} />} />
          <Route path="news" element={<NewsPage news={news} user={user} />} />
          <Route path="fees" element={<FeesPage students={students} feeStructure={feeStructure} admissionSettings={admissionSettings} onUpdateFeePayments={handleUpdateFeePayments} academicYear={academicYear} addNotification={addNotification} user={user} />} />
          <Route path="sitemap" element={<SitemapPage />} />
          <Route path="textbooks" element={<TextbooksPage />} />
          <Route path="syllabus" element={<TextbooksPage />} />
          <Route path="syllabus/:grade" element={<SyllabusPage syllabus={syllabus} gradeDefinitions={gradeDefinitions} />} />
        </Route>

        <Route path="/sitemap.xml" element={<SitemapXmlPage sitemapContent={sitemapContent} />} />

        {/* ── Auth Routes ───────────────────────────────────────────────── */}
        <Route path="/login" element={
          authLoading ? <LoadingScreen /> : user ? <Navigate to="/portal/dashboard" replace /> : <LoginPage onLogin={handleLogin} onGoogleSignIn={handleGoogleSignIn} error="" notification="" />
        } />
        <Route path="/signup" element={<SignUpPage onSignUp={async (n, e, p) => {
          try {
            const c = await auth.createUserWithEmailAndPassword(e, p);
            if (c.user) { await c.user.updateProfile({ displayName: n }); await db.collection('users').doc(c.user.uid).set({ displayName: n, email: e, role: 'pending' }); return { success: true, message: 'Awaiting approval.' }; }
            return { success: false };
          } catch (err: any) { return { success: false, message: err.message }; }
        }} />} />
        <Route path="/parent-registration" element={<ParentRegistrationPage />} />
        <Route path="/parent-signup" element={<ParentSignUpPage onSignUp={async (n, e, p, sid, dob, sname, rel) => {
          try {
            const c = await auth.createUserWithEmailAndPassword(e, p);
            if (c.user) {
              await c.user.updateProfile({ displayName: n });
              await db.collection('users').doc(c.user.uid).set({ displayName: n, email: e, role: 'pending_parent', claimedStudents: [{ fullName: sname, studentId: sid, dob, relationship: rel }], registrationDetails: { fullName: n, relationship: rel } });
              return { success: true, message: 'Awaiting approval.' };
            }
            return { success: false };
          } catch (err: any) { return { success: false, message: err.message }; }
        }} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage onForgotPassword={async (e) => {
          try { await auth.sendPasswordResetEmail(e); return { success: true, message: 'Password reset email sent! Check your inbox.' }; }
          catch (err: any) { return { success: false, message: err.message }; }
        }} />} />
        <Route path="/reset-password" element={<ResetPasswordPage onResetPassword={async (newPassword) => {
          try {
            const actionCode = new URLSearchParams(window.location.search).get('oobCode');
            if (!actionCode) throw new Error('Missing action code.');
            await auth.confirmPasswordReset(actionCode, newPassword);
            return { success: true, message: 'Password reset! You can now log in.' };
          } catch (err: any) { return { success: false, message: err.message }; }
        }} />} />

        {/* ── Portal Routes ─────────────────────────────────────────────── */}
        <Route path="/portal" element={
          authLoading ? <LoadingScreen /> : (user ? <DashboardLayout user={user} onLogout={handleLogout} students={students} staff={staff} tcRecords={tcRecords} serviceCerts={serviceCerts} academicYear={academicYear} /> : <Navigate to="/login" replace />)
        }>
          <Route path="dashboard" element={<DashboardPage user={user!} studentCount={students.length} academicYear={academicYear} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} calendarEvents={calendarEvents} pendingAdmissionsCount={pendingAdmissionsCount} pendingParentCount={pendingParentCount} pendingStaffCount={pendingStaffCount} onUpdateAcademicYear={handleUpdateAcademicYear} disciplineLog={hostelDisciplineLog} />} />
          <Route path="parent-dashboard" element={<ParentDashboardPage user={user!} allStudents={students} onLinkChild={async (c: StudentClaim) => { await db.collection('users').doc(user!.uid).update({ claimedStudents: firebase.firestore.FieldValue.arrayUnion(c) }); addNotification('Child linking request submitted!', 'success'); }} currentAttendance={dailyStudentAttendance} news={news} staff={staff} gradeDefinitions={gradeDefinitions} homework={homework} syllabus={syllabus} onSendMessage={handleSendMessage} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} feeStructure={feeStructure} />} />
          <Route path="admin" element={<AdminPage pendingAdmissionsCount={pendingAdmissionsCount} pendingParentCount={pendingParentCount} pendingStaffCount={pendingStaffCount} students={students} academicYear={academicYear} />} />
          <Route path="profile" element={<UserProfilePage currentUser={user!} onUpdateProfile={handleUpdateUserProfile} />} />
          <Route path="change-password" element={<ChangePasswordPage onChangePassword={async (c, n) => {
            try { const cr = firebase.auth.EmailAuthProvider.credential(user!.email!, c); await auth.currentUser?.reauthenticateWithCredential(cr); await auth.currentUser?.updatePassword(n); return { success: true, message: 'Password changed.' }; }
            catch (err: any) { return { success: false, message: err.message }; }
          }} />} />
          <Route path="students" element={<StudentListPage students={students} onAdd={handleAddStudent} onEdit={handleEditStudent} academicYear={academicYear} user={user!} assignedGrade={assignedGrade} />} />
          <Route path="student/:studentId" element={<StudentDetailPage students={students} onEdit={handleEditStudent} academicYear={academicYear} user={user!} assignedGrade={assignedGrade} feeStructure={feeStructure} conductLog={conductLog} hostelDisciplineLog={hostelDisciplineLog} onAddConductEntry={async (e) => { await db.collection('conductLog').add(e); return true; }} onDeleteConductEntry={async (id) => { await db.collection('conductLog').doc(id).delete(); }} />} />
          <Route path="student/:studentId/academics" element={<AcademicPerformancePage students={students} onUpdateAcademic={handleUpdateAcademic} gradeDefinitions={gradeDefinitions} academicYear={academicYear} user={user!} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} />} />
          <Route path="student/:studentId/attendance-log" element={<StudentAttendanceLogPage students={students} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} user={user!} calendarEvents={calendarEvents} />} />
          <Route path="classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={async () => {}} user={user!} />} />
          <Route path="classes/:grade" element={<ClassStudentsPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateClassTeacher={(g, tid) => handleUpdateGradeDefinition(g, { ...gradeDefinitions[g], classTeacherId: tid })} academicYear={academicYear} onOpenImportModal={async () => {}} onDelete={handleDeleteStudent} user={user!} assignedGrade={assignedGrade} onAddStudentToClass={handleAddStudent} onUpdateBulkFeePayments={handleUpdateBulkFeePayments} feeStructure={feeStructure} />} />
          <Route path="classes/:grade/attendance" element={<StudentAttendancePage students={students} allAttendance={dailyStudentAttendance} onUpdateAttendance={handleMarkStudentAttendance} user={user!} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} fetchStudentAttendanceForRange={fetchStudentAttendanceForRange} academicYear={academicYear} assignedGrade={assignedGrade} calendarEvents={calendarEvents} />} />
          <Route path="staff" element={<ManageStaffPage staff={staff} gradeDefinitions={gradeDefinitions} onSaveStaff={handleSaveStaff} onDeleteStaff={handleDeleteStaff} user={user!} />} />
          <Route path="staff/attendance" element={<StaffAttendancePage user={user!} staff={staff} attendance={staffAttendance} onMarkAttendance={handleMarkStaffAttendance} fetchStaffAttendanceForMonth={fetchStaffAttendanceForMonth} fetchStaffAttendanceForRange={fetchStaffAttendanceForRange} academicYear={academicYear} calendarEvents={calendarEvents} />} />
          <Route path="staff/attendance-logs" element={<StaffAttendanceLogPage staff={staff} students={students} gradeDefinitions={gradeDefinitions} fetchStaffAttendanceForMonth={fetchStaffAttendanceForMonth} fetchStaffAttendanceForRange={fetchStaffAttendanceForRange} academicYear={academicYear} user={user!} calendarEvents={calendarEvents} />} />
          <Route path="staff/:staffId" element={<StaffDetailPage staff={staff} onEdit={handleSaveStaff} gradeDefinitions={gradeDefinitions} />} />
          <Route path="staff/certificates" element={<StaffDocumentsPage serviceCertificateRecords={serviceCerts} user={user!} />} />
          <Route path="staff/certificates/generate" element={<GenerateServiceCertificatePage staff={staff} onSave={handleGenerateServiceCertificate} user={user!} />} />
          <Route path="staff/certificates/print/:certId" element={<PrintServiceCertificatePage serviceCertificateRecords={serviceCerts} />} />
          <Route path="transfers" element={<TransferManagementPage />} />
          <Route path="transfers/generate" element={<GenerateTcPage students={students} tcRecords={tcRecords} academicYear={academicYear} onGenerateTc={handleGenerateTc} isSaving={false} />} />
          <Route path="transfers/generate/:studentId" element={<GenerateTcPage students={students} tcRecords={tcRecords} academicYear={academicYear} onGenerateTc={handleGenerateTc} isSaving={false} />} />
          <Route path="transfers/records" element={<TcRecordsPage tcRecords={tcRecords} />} />
          <Route path="transfers/print/:tcId" element={<PrintTcPage tcRecords={tcRecords} />} />
          <Route path="inventory" element={<InventoryPage inventory={inventory} onAdd={handleAddInventoryItem} onEdit={handleEditInventoryItem} onDelete={handleDeleteInventoryItem} user={user!} />} />
          <Route path="hostel-dashboard" element={<HostelDashboardPage disciplineLog={hostelDisciplineLog} />} />
          <Route path="hostel/students" element={<HostelStudentListPage residents={hostelResidents} students={students} onAdd={handleAddHostelResident} onAddById={handleAddHostelResidentById} onEdit={handleEditHostelResident} onDelete={handleDeleteHostelResident} user={user!} academicYear={academicYear} />} />
          <Route path="hostel/rooms" element={<HostelRoomListPage residents={hostelResidents} students={students} />} />
          <Route path="hostel/chores" element={<HostelChoreRosterPage user={user!} students={students} residents={hostelResidents} choreRoster={choreRoster} onUpdateChoreRoster={handleSaveChoreRoster} academicYear={academicYear} />} />
          <Route path="hostel/fees" element={<HostelFeePage />} />
          <Route path="hostel/attendance" element={<HostelAttendancePage />} />
          <Route path="hostel/mess" element={<HostelMessPage />} />
          <Route path="hostel/staff" element={<HostelStaffPage staff={hostelStaff} onAdd={handleAddHostelStaff} onEdit={handleEditHostelStaff} onDelete={handleDeleteHostelStaff} user={user!} />} />
          <Route path="hostel/inventory" element={<HostelInventoryPage inventory={hostelInventory} stockLogs={stockLogs} onUpdateStock={handleUpdateStock} user={user!} />} />
          <Route path="hostel/discipline" element={<HostelDisciplinePage user={user!} students={students} residents={hostelResidents} disciplineLog={hostelDisciplineLog} onSave={handleSaveHostelDisciplineEntry} onDelete={handleDeleteHostelDisciplineEntry} academicYear={academicYear} />} />
          <Route path="hostel/health" element={<HostelHealthPage />} />
          <Route path="hostel/communication" element={<HostelCommunicationPage />} />
          <Route path="hostel/settings" element={<HostelSettingsPage />} />
          <Route path="calendar" element={<CalendarPage events={calendarEvents} user={user!} onAdd={async (e, id) => { await handleSaveCalendarEvent(e, id); }} onEdit={async (e) => { await handleSaveCalendarEvent(e, e.id); }} onDelete={handleDeleteCalendarEvent} notificationDaysBefore={-1} onUpdatePrefs={async () => { addNotification('Notification preferences saved.', 'success'); }} />} />
          <Route path="communication" element={<CommunicationPage students={students} user={user!} />} />
          <Route path="manage-notices" element={<ManageNoticesPage user={user!} allNotices={notices} onSave={handleSaveNotice} onDelete={handleDeleteNotice} />} />
          <Route path="news-management" element={<ManageNewsPage news={news} user={user!} onSave={handleSaveNews} onDelete={handleDeleteNews} />} />
          <Route path="gallery-manager" element={<GalleryManagerPage user={user!} />} />
          <Route path="media-manager" element={<WebsiteMediaManagerPage user={user!} />} />
          <Route path="users" element={<UserManagementPage allUsers={users} currentUser={user!} onUpdateUserRole={handleUpdateUserRole} onDeleteUser={handleDeleteUser} />} />
          <Route path="parents" element={<ParentsManagementPage allUsers={users} students={students} academicYear={academicYear} currentUser={user!} onDeleteUser={handleDeleteUser} onUpdateUser={handleUpdateParentUser} />} />
          <Route path="promotion" element={<PromotionPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear} onPromoteStudents={handlePromoteStudents} user={user!} />} />
          <Route path="subjects" element={<ManageSubjectsPage gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} user={user!} onResetAllMarks={handleResetAllAcademicMarks} />} />
          <Route path="sitemap-editor" element={<SitemapEditorPage initialContent={sitemapContent} onSave={handleSaveSitemapContent} />} />
          <Route path="reports/academics" element={<ReportSearchPage students={students} academicYear={academicYear} />} />
          <Route path="reports/class/:grade/:examId" element={<ClassMarkStatementPage students={students} academicYear={academicYear} user={user!} gradeDefinitions={gradeDefinitions} onUpdateAcademic={handleUpdateAcademic} onUpdateGradeDefinition={handleUpdateGradeDefinition} />} />
          <Route path="reports/bulk-print/:grade/:examId" element={<BulkProgressReportPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} academicYear={academicYear} />} />
          <Route path="progress-report/:studentId/:examId" element={<ProgressReportPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} academicYear={academicYear} />} />
          <Route path="routine" element={<RoutinePage examSchedules={examRoutines} classSchedules={classRoutines} user={user!} onSaveExamRoutine={handleSaveExamRoutine} onDeleteExamRoutine={handleDeleteExamRoutine} onUpdateClassRoutine={handleUpdateClassRoutine} />} />
          <Route path="exams" element={<ExamSelectionPage />} />
          <Route path="exams/:examId" element={<ExamClassSelectionPage gradeDefinitions={gradeDefinitions} staff={staff} user={user!} />} />
          <Route path="admission-settings" element={<AdmissionSettingsPage admissionConfig={admissionSettings} onUpdateConfig={async (c) => { await db.collection('config').doc('admissionSettings').set(c); return true; }} />} />
          <Route path="admissions" element={
            <OnlineAdmissionsListPage
              admissions={onlineAdmissions}
              hostelAdmissions={hostelAdmissions}
              onUpdateStatus={handleAdmissionUpdateStatus}
              onDelete={handleAdmissionDelete}
              onEnrollStudent={handleEnrollStudent}
              academicYear={academicYear}
            />
          } />
          <Route path="homework-scanner" element={<HomeworkScannerPage />} />
          <Route path="activity-log" element={<ActivityLogPage students={students} user={user!} gradeDefinitions={gradeDefinitions} academicYear={academicYear} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onBulkUpdateActivityLogs={handleBulkUpdateActivityLogs} />} />
          <Route path="manage-homework" element={<ManageHomeworkPage user={user!} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onSave={handleSaveHomework} onDelete={handleDeleteHomework} allHomework={homework} />} />
          <Route path="manage-syllabus" element={<ManageSyllabusPage user={user!} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onSave={handleSaveSyllabus} allSyllabus={syllabus} gradeDefinitions={gradeDefinitions} />} />
          <Route path="syllabus" element={<TextbooksPage />} />
          <Route path="manage-textbooks" element={<ManageTextbooksPage />} />
          <Route path="syllabus/:grade" element={<SyllabusPage syllabus={syllabus} gradeDefinitions={gradeDefinitions} />} />
          <Route path="insights" element={<InsightsPage students={students} gradeDefinitions={gradeDefinitions} conductLog={conductLog} user={user!} />} />
          <Route path="manage-navigation" element={<ManageNavigationPage navigation={navigation} onSave={handleSaveNavItem} onDelete={handleDeleteNavItem} />} />
          <Route path="settings" element={<SchoolSettingsPage config={schoolConfig} onUpdate={async (c) => { await db.collection('config').doc('schoolSettings').set(c, { merge: true }); setSchoolConfig(prev => ({ ...prev, ...c })); return true; }} />} />
          <Route path="fees" element={<FeeManagementPage students={students} academicYear={academicYear} onUpdateFeePayments={handleUpdateFeePayments} user={user!} feeStructure={feeStructure} onUpdateFeeStructure={handleUpdateFeeStructure} addNotification={addNotification} schoolConfig={schoolConfig} />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
