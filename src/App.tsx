
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import PublicLayout from '@/layouts/PublicLayout';
import { User, Student, Staff, TcRecord, ServiceCertificateRecord, FeeStructure, AdmissionSettings, NotificationType, Grade, GradeDefinition, SubjectAssignment, FeePayments, Exam, Syllabus, Homework, Notice, CalendarEvent, DailyStudentAttendance, StudentAttendanceRecord, StaffAttendanceRecord, InventoryItem, HostelResident, HostelStaff, HostelInventoryItem, StockLog, HostelDisciplineEntry, ChoreRoster, ConductEntry, ExamRoutine, DailyRoutine, NewsItem, OnlineAdmission, FeeHead, FeeSet, BloodGroup, StudentClaim, ActivityLog, SubjectMark, StudentStatus } from '@/types';
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
import NotificationContainer from '@/components/NotificationContainer';
import OfflineIndicator from '@/components/OfflineIndicator';
import { SpinnerIcon } from '@/components/Icons';

const { Routes, Route, Navigate, useLocation, useNavigate } = ReactRouterDOM as any;

const App: React.FC = () => {
  // --- State Declarations ---
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [onlineAdmissions, setOnlineAdmissions] = useState<OnlineAdmission[]>([]);
  const [navigation, setNavigation] = useState<NavMenuItem[]>([]);
  
  // Configuration
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
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
  const [choreRoster, setChoreRoster] = useState({} as ChoreRoster);
  
  // Other Logs
  const [conductLog, setConductLog] = useState<ConductEntry[]>([]);
  const [hostelDisciplineLog, setHostelDisciplineLog] = useState<HostelDisciplineEntry[]>([]); // FIX: Declared disciplineLog
  const [dailyStudentAttendance, setDailyStudentAttendance] = useState<Record<Grade, Record<string, StudentAttendanceRecord>>>( // FIX: Use correct type as declared in types.ts
    GRADES_LIST.reduce((acc, grade) => ({ ...acc, [grade]: {} }), {}) as Record<Grade, Record<string, StudentAttendanceRecord>>
  );
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
  const handleUpdateAcademicYear = async (year: string) => {
      try {
          await db.collection('config').doc('academic').set({ currentAcademicYear: year });
          setAcademicYear(year);
          addNotification(`Academic year set to ${year}.`, 'success');
      } catch (error: any) {
          console.error("Error setting academic year:", error);
          addNotification('Failed to set academic year.', 'error');
      }
  };

  const handleAddStudent = async (studentData: Omit<Student, 'id'>) => {
      try {
          const newStudentRef = db.collection('students').doc();
          const studentId = formatStudentId(studentData, academicYear);
          await newStudentRef.set({ ...studentData, id: newStudentRef.id, studentId, academicYear });
          addNotification('Student added successfully!', 'success');
      } catch (error: any) {
          console.error("Error adding student:", error);
          addNotification('Failed to add student.', 'error');
      }
  };

  const handleEditStudent = async (studentData: Student) => {
      try {
          // Exclude properties that shouldn't be updated or might cause issues
          const { id, feePayments, academicPerformance, ...updatableData } = studentData;
          await db.collection('students').doc(id).update(updatableData);
          addNotification('Student updated successfully!', 'success');
      } catch (error: any) {
          console.error("Error updating student:", error);
          addNotification('Failed to update student.', 'error');
      }
  };

  const handleDeleteStudent = async (student: Student) => {
      try {
          await db.collection('students').doc(student.id).update({ status: 'Dropped' }); // Mark as dropped instead of deleting
          addNotification(`Student ${student.name} marked as dropped.`, 'success');
      } catch (error: any) {
          console.error("Error deleting student:", error);
          addNotification('Failed to drop student.', 'error');
      }
  };

  const handleUpdateFeePayments = async (studentId: string, payments: FeePayments) => {
      try {
          await db.collection('students').doc(studentId).update({ feePayments: payments });
          addNotification('Fee payments updated successfully!', 'success');
      } catch (error: any) {
          console.error("Error updating fee payments:", error);
          addNotification('Failed to update fee payments.', 'error');
      }
  };
  
  const handleUpdateBulkFeePayments = async (updates: Array<{ studentId: string; payments: FeePayments }>) => {
      const batch = db.batch();
      updates.forEach(({ studentId, payments }) => {
          const ref = db.collection('students').doc(studentId);
          batch.update(ref, { feePayments: payments });
      });
      try {
          await batch.commit();
          addNotification('Bulk fee payments updated successfully!', 'success');
      } catch (error: any) {
          console.error("Error updating bulk fee payments:", error);
          addNotification('Failed to update bulk fee payments.', 'error');
      }
  };

  const handleUpdateAcademic = async (studentId: string, performance: Exam[]) => {
      try {
          await db.collection('students').doc(studentId).update({ academicPerformance: performance });
          addNotification('Academic performance updated successfully!', 'success');
      } catch (error: any) {
          console.error("Error updating academic performance:", error);
          addNotification('Failed to update academic performance.', 'error');
      }
  };
  
  const handleUpdateGradeDefinition = async (grade: Grade, newDefinition: GradeDefinition) => {
      try {
          const newDefs = { ...gradeDefinitions, [grade]: newDefinition };
          await db.collection('config').doc('gradeDefinitions').set(newDefs);
          addNotification(`Grade definition for ${grade} updated.`, 'success');
      } catch (error: any) {
          console.error("Error updating grade definition:", error);
          addNotification('Failed to update grade definition.', 'error');
      }
  };

  const handleResetAllAcademicMarks = async () => {
    try {
      const batch = db.batch();
      const studentRefs = await db.collection('students').get();
      studentRefs.docs.forEach(doc => {
        const studentRef = db.collection('students').doc(doc.id);
        batch.update(studentRef, { academicPerformance: [] });
      });
      await batch.commit();
      addNotification('All academic records have been reset.', 'success');
    } catch (error: any) {
      console.error("Error resetting all academic marks:", error);
      addNotification('Failed to reset all academic records.', 'error');
    }
  };

  const handleUpdateFeeStructure = async (newStructure: FeeStructure) => {
      try {
          await db.collection('config').doc('feeStructure').set(newStructure);
          addNotification('Fee structure updated successfully!', 'success');
          return true;
      } catch (error: any) {
          console.error("Error updating fee structure:", error);
          addNotification('Failed to update fee structure.', 'error');
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
              id: studentRef.id,
              status: StudentStatus.ACTIVE // FIX: Use StudentStatus enum
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
      } catch (error: any) {
          console.error("Enrollment failed:", error);
          addNotification("Failed to enroll student. Please check database permissions.", 'error', 'Enrollment Failed');
          throw error;
      }
  };

  const handleGenerateTc = async (tcData: Omit<TcRecord, 'id'>) => {
      try {
          const docRef = await db.collection('tcRecords').add(tcData);
          await db.collection('students').doc(tcData.studentDbId).update({ status: StudentStatus.TRANSFERRED }); // FIX: Use StudentStatus enum
          addNotification('Transfer Certificate generated and student status updated.', 'success');
          return true;
      } catch (error: any) {
          console.error("Error generating TC:", error);
          addNotification('Failed to generate Transfer Certificate.', 'error');
          return false;
      }
  };

  const handleGenerateServiceCertificate = async (certData: Omit<ServiceCertificateRecord, 'id'>) => {
      try {
          const docRef = await db.collection('serviceCertificates').add(certData);
          await db.collection('staff').doc(certData.staffDetails.staffNumericId).update({ status: StudentStatus.TRANSFERRED }); // FIX: Using StudentStatus for Staff status as well, assuming it fits or needs separate enum
          addNotification('Service Certificate generated and staff status updated.', 'success');
      } catch (error: any) {
          console.error("Error generating Service Certificate:", error);
          addNotification('Failed to generate Service Certificate.', 'error');
      }
  };

  const handleAddInventoryItem = async (itemData: Omit<InventoryItem, 'id'>) => {
      try {
          await db.collection('inventory').add(itemData);
          addNotification('Inventory item added successfully.', 'success');
      } catch (error: any) {
          console.error("Error adding inventory item:", error);
          addNotification('Failed to add inventory item.', 'error');
      }
  };

  const handleEditInventoryItem = async (itemData: InventoryItem) => {
      try {
          await db.collection('inventory').doc(itemData.id).update(itemData);
          addNotification('Inventory item updated successfully.', 'success');
      } catch (error: any) {
          console.error("Error editing inventory item:", error);
          addNotification('Failed to edit inventory item.', 'error');
      }
  };

  const handleDeleteInventoryItem = async (itemData: InventoryItem) => {
      try {
          await db.collection('inventory').doc(itemData.id).delete();
          addNotification('Inventory item deleted successfully.', 'success');
      } catch (error: any) {
          console.error("Error deleting inventory item:", error);
          addNotification('Failed to delete inventory item.', 'error');
      }
  };
  
  const handleUpdateStock = async (itemId: string, change: number, notes: string) => {
      try {
          const itemRef = db.collection('hostelInventory').doc(itemId);
          await db.runTransaction(async (transaction) => {
              const itemDoc = await transaction.get(itemRef);
              if (!itemDoc.exists) {
                  throw new Error("Item does not exist!");
              }
              const newStock = (itemDoc.data()?.currentStock || 0) + change;
              if (newStock < 0) {
                  throw new Error("Not enough stock for this operation!");
              }
              transaction.update(itemRef, { currentStock: newStock });

              await db.collection('stockLogs').add({
                  itemId,
                  itemName: itemDoc.data()?.name || 'Unknown',
                  quantity: Math.abs(change),
                  type: change > 0 ? 'IN' : 'OUT',
                  date: new Date().toISOString(),
                  notes,
              });
          });
          addNotification('Stock updated successfully!', 'success');
      } catch (error: any) {
          console.error("Error updating stock:", error);
          addNotification(`Failed to update stock: ${error.message}`, 'error');
      }
  };

  const handleAddHostelResident = async (residentData: Omit<HostelResident, 'id'>) => {
      try {
          await db.collection('hostelResidents').add(residentData);
          addNotification('Hostel resident added successfully!', 'success');
      } catch (error: any) {
          console.error("Error adding hostel resident:", error);
          addNotification('Failed to add hostel resident.', 'error');
      }
  };

  const handleAddHostelResidentById = async (studentIdInput: string) => {
      try {
          const student = students.find(s => formatStudentId(s, academicYear).toLowerCase() === studentIdInput.toLowerCase());
          if (!student) {
              return { success: false, message: 'Student ID not found in school records.' };
          }
          const existingResident = hostelResidents.find(r => r.studentId === student.id);
          if (existingResident) {
              return { success: false, message: `Student ${student.name} is already a hostel resident.` };
          }

          const newResident: Omit<HostelResident, 'id'> = {
              studentId: student.id,
              dormitory: 'Boys Dorm A' as HostelDormitory, // FIX: Use enum value
              dateOfJoining: new Date().toISOString().split('T')[0],
          };
          await db.collection('hostelResidents').add(newResident);
          addNotification(`Student ${student.name} added as hostel resident.`, 'success');
          return { success: true };
      } catch (error: any) {
          console.error("Error adding hostel resident by ID:", error);
          addNotification('Failed to add hostel resident by ID.', 'error');
          return { success: false, message: 'Failed to add. Please try again.' };
      }
  };

  const handleEditHostelResident = async (residentData: HostelResident) => {
      try {
          await db.collection('hostelResidents').doc(residentData.id).update(residentData);
          addNotification('Hostel resident updated successfully!', 'success');
      } catch (error: any) {
          console.error("Error editing hostel resident:", error);
          addNotification('Failed to edit hostel resident.', 'error');
      }
  };

  const handleDeleteHostelResident = async (residentData: HostelResident) => {
      try {
          await db.collection('hostelResidents').doc(residentData.id).delete();
          addNotification('Hostel resident deleted successfully!', 'success');
      } catch (error: any) {
          console.error("Error deleting hostel resident:", error);
          addNotification('Failed to delete hostel resident.', 'error');
      }
  };

  const handleAddHostelStaff = async (staffData: Omit<HostelStaff, 'id'>) => {
      try {
          await db.collection('hostelStaff').add(staffData);
          addNotification('Hostel staff added successfully!', 'success');
      } catch (error: any) {
          console.error("Error adding hostel staff:", error);
          addNotification('Failed to add hostel staff.', 'error');
      }
  };

  const handleEditHostelStaff = async (staffData: HostelStaff) => {
      try {
          await db.collection('hostelStaff').doc(staffData.id).update(staffData);
          addNotification('Hostel staff updated successfully!', 'success');
      } catch (error: any) {
          console.error("Error editing hostel staff:", error);
          addNotification('Failed to edit hostel staff.', 'error');
      }
  };

  const handleDeleteHostelStaff = async (staffData: HostelStaff) => {
      try {
          await db.collection('hostelStaff').doc(staffData.id).delete();
          addNotification('Hostel staff deleted successfully!', 'success');
      } catch (error: any) {
          console.error("Error deleting hostel staff:", error);
          addNotification('Failed to delete hostel staff.', 'error');
      }
  };

  const handleSaveChoreRoster = async (newRoster: ChoreRoster) => {
      try {
          await db.collection('choreRoster').doc('current').set(newRoster);
          addNotification('Chore roster updated successfully!', 'success');
      } catch (error: any) {
          console.error("Error updating chore roster:", error);
          addNotification('Failed to update chore roster.', 'error');
      }
  };
  
  const handleSaveHostelDisciplineEntry = async (entryData: Omit<HostelDisciplineEntry, 'id' | 'reportedBy' | 'reportedById'>, id?: string) => {
      try {
          const fullEntry = {
              ...entryData,
              reportedBy: user?.displayName || user?.email || 'Unknown',
              reportedById: user!.uid,
          };
          if (id) {
              await db.collection('hostelDisciplineLog').doc(id).update(fullEntry);
          } else {
              await db.collection('hostelDisciplineLog').add(fullEntry);
          }
          addNotification('Discipline record saved successfully!', 'success');
      } catch (error: any) {
          console.error("Error saving discipline entry:", error);
          addNotification('Failed to save discipline entry.', 'error');
      }
  };

  const handleDeleteHostelDisciplineEntry = async (entry: HostelDisciplineEntry) => {
      try {
          await db.collection('hostelDisciplineLog').doc(entry.id).delete();
          addNotification('Discipline record deleted successfully!', 'success');
      } catch (error: any) {
          console.error("Error deleting discipline entry:", error);
          addNotification('Failed to delete discipline entry.', 'error');
      }
  };

  const handleMarkStudentAttendance = async (grade: Grade, date: string, records: StudentAttendanceRecord) => {
      try {
          await db.collection('studentAttendance').doc(date).set({ [grade]: records }, { merge: true });
          addNotification('Student attendance saved.', 'success');
      } catch (error: any) {
          console.error("Error marking student attendance:", error);
          addNotification('Failed to save student attendance.', 'error');
      }
  };

  const fetchStudentAttendanceForMonth = async (grade: Grade, year: number, month: number): Promise<{ [date: string]: StudentAttendanceRecord }> => {
      try {
          const querySnapshot = await db.collection('studentAttendance')
              .where(firebase.firestore.FieldPath.documentId(), '>=', `${year}-${String(month).padStart(2, '0')}-01`)
              .where(firebase.firestore.FieldPath.documentId(), '<=', `${year}-${String(month).padStart(2, '0')}-31`)
              .get();

          const monthData: { [date: string]: StudentAttendanceRecord } = {};
          querySnapshot.forEach(doc => {
              const data = doc.data();
              if (data && data[grade]) {
                  monthData[doc.id] = data[grade];
              }
          });
          return monthData;
      } catch (error: any) {
          console.error("Error fetching student attendance for month:", error);
          addNotification('Failed to fetch student attendance data.', 'error');
          return {};
      }
  };

  const fetchStudentAttendanceForRange = async (grade: Grade, startDate: string, endDate: string): Promise<{ [date: string]: StudentAttendanceRecord }> => {
      try {
          const querySnapshot = await db.collection('studentAttendance')
              .where(firebase.firestore.FieldPath.documentId(), '>=', startDate)
              .where(firebase.firestore.FieldPath.documentId(), '<=', endDate)
              .get();

          const rangeData: { [date: string]: StudentAttendanceRecord } = {};
          querySnapshot.forEach(doc => {
              const data = doc.data();
              if (data && data[grade]) {
                  rangeData[doc.id] = data[grade];
              }
          });
          return rangeData;
      } catch (error: any) {
          console.error("Error fetching student attendance for range:", error);
          addNotification('Failed to fetch student attendance data for range.', 'error');
          return {};
      }
  };

  const handleMarkStaffAttendance = async (staffId: string, status: StaffAttendanceRecord[string]) => {
      const today = new Date().toISOString().split('T')[0];
      try {
          await db.collection('staffAttendance').doc(today).set({ [staffId]: status }, { merge: true });
          addNotification('Staff attendance marked.', 'success');
      } catch (error: any) {
          console.error("Error marking staff attendance:", error);
          addNotification('Failed to mark staff attendance.', 'error');
      }
  };

  const fetchStaffAttendanceForMonth = async (year: number, month: number): Promise<{ [date: string]: StaffAttendanceRecord }> => {
      try {
          const querySnapshot = await db.collection('staffAttendance')
              .where(firebase.firestore.FieldPath.documentId(), '>=', `${year}-${String(month).padStart(2, '0')}-01`)
              .where(firebase.firestore.FieldPath.documentId(), '<=', `${year}-${String(month).padStart(2, '0')}-31`)
              .get();

          const monthData: { [date: string]: StaffAttendanceRecord } = {};
          querySnapshot.forEach(doc => {
              monthData[doc.id] = doc.data() as StaffAttendanceRecord;
          });
          return monthData;
      } catch (error: any) {
          console.error("Error fetching staff attendance for month:", error);
          addNotification('Failed to fetch staff attendance data.', 'error');
          return {};
      }
  };

  const fetchStaffAttendanceForRange = async (startDate: string, endDate: string): Promise<{ [date: string]: StaffAttendanceRecord }> => {
      try {
          const querySnapshot = await db.collection('staffAttendance')
              .where(firebase.firestore.FieldPath.documentId(), '>=', startDate)
              .where(firebase.firestore.FieldPath.documentId(), '<=', endDate)
              .get();

          const rangeData: { [date: string]: StaffAttendanceRecord } = {};
          querySnapshot.forEach(doc => {
              rangeData[doc.id] = doc.data() as StaffAttendanceRecord;
          });
          return rangeData;
      } catch (error: any) {
          console.error("Error fetching staff attendance for range:", error);
          addNotification('Failed to fetch staff attendance data for range.', 'error');
          return {};
      }
  };

  const handleSaveHomework = async (homework: Omit<Homework, 'id' | 'createdBy'>, id?: string) => {
      try {
          const dataWithCreator = {
              ...homework,
              createdBy: { uid: user!.uid, name: user!.displayName || user!.email! }
          };
          if (id) {
              await db.collection('homework').doc(id).update(dataWithCreator);
          } else {
              await db.collection('homework').add(dataWithCreator);
          }
          addNotification('Homework saved successfully!', 'success');
      } catch (error: any) {
          console.error("Error saving homework:", error);
          addNotification('Failed to save homework.', 'error');
      }
  };

  const handleDeleteHomework = async (id: string) => {
      try {
          await db.collection('homework').doc(id).delete();
          addNotification('Homework deleted successfully!', 'success');
      } catch (error: any) {
          console.error("Error deleting homework:", error);
          addNotification('Failed to delete homework.', 'error');
      }
  };

  const handleSaveSyllabus = async (syllabus: Omit<Syllabus, 'id'>, id: string) => {
      try {
          await db.collection('syllabus').doc(id).set(syllabus);
          addNotification('Syllabus saved successfully!', 'success');
      } catch (error: any) {
          console.error("Error saving syllabus:", error);
          addNotification('Failed to save syllabus.', 'error');
      }
  };

  const handleBulkUpdateActivityLogs = async (updates: Array<{ studentId: string; examId: 'terminal1' | 'terminal2' | 'terminal3'; subjectName: string; activityLog: ActivityLog; activityMarks: number }>) => {
      const batch = db.batch();
      for (const update of updates) {
          const studentRef = db.collection('students').doc(update.studentId);
          const studentDoc = await studentRef.get();
          if (studentDoc.exists) {
              const currentPerformance = (studentDoc.data()?.academicPerformance || []) as Exam[];
              const existingExamIndex = currentPerformance.findIndex(e => e.id === update.examId);
              
              const newExam: Exam = existingExamIndex !== -1
                  ? { ...currentPerformance[existingExamIndex], name: currentPerformance[existingExamIndex].name }
                  : { id: update.examId, name: update.examId, results: [] };
              
              const existingResultIndex = newExam.results.findIndex(r => r.subject === update.subjectName);
              const newResult: SubjectMark = {
                  subject: update.subjectName,
                  activityLog: update.activityLog,
                  activityMarks: update.activityMarks
              };
              
              if (existingResultIndex !== -1) {
                  newExam.results[existingResultIndex] = { ...newExam.results[existingResultIndex], ...newResult };
              } else {
                  newExam.results.push(newResult);
              }

              if (existingExamIndex !== -1) {
                  currentPerformance[existingExamIndex] = newExam;
              } else {
                  currentPerformance.push(newExam);
              }
              batch.update(studentRef, { academicPerformance: currentPerformance });
          }
      }
      try {
          await batch.commit();
          addNotification('Activity logs updated successfully!', 'success');
      } catch (error: any) {
          console.error("Error bulk updating activity logs:", error);
          addNotification('Failed to bulk update activity logs.', 'error');
      }
  };

  const handleSendMessage = async (message: { fromParentId: string; fromParentName: string; toTeacherId: string; toTeacherName: string; childId: string; childName: string; message: string; }) => {
      try {
          await db.collection('parentMessages').add({
              ...message,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              read: false,
          });
          addNotification('Message sent to teacher!', 'success');
          return true;
      } catch (error: any) {
          console.error("Error sending message:", error);
          addNotification('Failed to send message.', 'error');
          return false;
      }
  };

  const handleSaveNotice = async (notice: Omit<Notice, 'id' | 'createdBy'>, id?: string) => {
      try {
          const dataWithCreator = {
              ...notice,
              createdBy: { uid: user!.uid, name: user!.displayName || user!.email! }
          };
          if (id) {
              await db.collection('notices').doc(id).update(dataWithCreator);
          } else {
              await db.collection('notices').add(dataWithCreator);
          }
          addNotification('Notice saved successfully!', 'success');
      } catch (error: any) {
          console.error("Error saving notice:", error);
          addNotification('Failed to save notice.', 'error');
      }
  };

  const handleDeleteNotice = async (id: string) => {
      try {
          await db.collection('notices').doc(id).delete();
          addNotification('Notice deleted successfully!', 'success');
      } catch (error: any) {
          console.error("Error deleting notice:", error);
          addNotification('Failed to delete notice.', 'error');
      }
  };
  
  const handleSaveNews = async (item: Omit<NewsItem, 'id'>, id?: string) => {
    try {
        if (id) {
            await db.collection('news').doc(id).update(item);
        } else {
            await db.collection('news').add(item);
        }
        addNotification('News item saved successfully!', 'success');
    } catch (error: any) {
        console.error("Error saving news item:", error);
        addNotification('Failed to save news item.', 'error');
    }
  };

  const handleDeleteNews = async (id: string) => {
      try {
          await db.collection('news').doc(id).delete();
          addNotification('News item deleted successfully!', 'success');
      } catch (error: any) {
          console.error("Error deleting news item:", error);
          addNotification('Failed to delete news item.', 'error');
      }
  };

  const handleSaveCalendarEvent = async (event: Omit<CalendarEvent, 'id'>, id?: string) => {
      try {
          if (id) {
              await db.collection('calendarEvents').doc(id).update(event);
          } else {
              await db.collection('calendarEvents').add(event);
          }
          addNotification('Calendar event saved successfully!', 'success');
          return true;
      } catch (error: any) {
          console.error("Error saving calendar event:", error);
          addNotification('Failed to save calendar event.', 'error');
          return false;
      }
  };

  const handleDeleteCalendarEvent = async (event: CalendarEvent) => {
      try {
          await db.collection('calendarEvents').doc(event.id).delete();
          addNotification('Calendar event deleted successfully!', 'success');
      } catch (error: any) {
          console.error("Error deleting calendar event:", error);
          addNotification('Failed to delete calendar event.', 'error');
      }
  };

  const handleSaveExamRoutine = async (routine: Omit<ExamRoutine, 'id'>, id?: string) => {
      try {
          if (id) {
              await db.collection('examRoutines').doc(id).update(routine);
          } else {
              await db.collection('examRoutines').add(routine);
          }
          addNotification('Exam routine saved successfully!', 'success');
          return true;
      } catch (error: any) {
          console.error("Error saving exam routine:", error);
          addNotification('Failed to save exam routine.', 'error');
          return false;
      }
  };

  const handleDeleteExamRoutine = async (routine: ExamRoutine) => {
      try {
          await db.collection('examRoutines').doc(routine.id).delete();
          addNotification('Exam routine deleted successfully!', 'success');
      } catch (error: any) {
          console.error("Error deleting exam routine:", error);
          addNotification('Failed to delete exam routine.', 'error');
      }
  };

  const handleUpdateClassRoutine = async (day: string, routine: DailyRoutine) => {
      try {
          await db.collection('classRoutines').doc(day).set({ routine });
          addNotification(`Class routine for ${day} updated.`, 'success');
      } catch (error: any) {
          console.error("Error updating class routine:", error);
          addNotification('Failed to update class routine.', 'error');
      }
  };

  const handleSaveSitemapContent = async (newContent: string) => {
      try {
          await db.collection('config').doc('sitemap').set({ content: newContent });
          addNotification('Sitemap updated successfully!', 'success');
      } catch (error: any) {
          console.error("Error saving sitemap:", error);
          addNotification('Failed to save sitemap.', 'error');
      }
  };

  const handleUpdateUserProfile = async (updates: { photoURL?: string }) => {
    try {
        if (!user || !user.uid) return { success: false, message: "User not authenticated." };
        await auth.currentUser?.updateProfile(updates);
        await db.collection('users').doc(user.uid).update(updates);
        addNotification('Profile updated successfully!', 'success');
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user profile:", error);
        addNotification(`Failed to update profile: ${error.message}`, 'error');
        return { success: false, message: error.message };
    }
  };

  const handleUpdateUserRole = async (uid: string, newRole: 'admin' | 'user' | 'pending' | 'warden') => {
    try {
        await db.collection('users').doc(uid).update({ role: newRole });
        addNotification(`User role updated to ${newRole}.`, 'success');
    } catch (error: any) {
        console.error("Error updating user role:", error);
        addNotification('Failed to update user role.', 'error');
    }
  };

  const handleDeleteUser = async (uid: string) => {
      try {
          // Note: Deleting auth user requires backend functions for security.
          // For now, this marks the user as deleted in Firestore and blocks access.
          await db.collection('users').doc(uid).delete();
          addNotification('User deleted successfully (Firestore record).', 'success');
      } catch (error: any) {
          console.error("Error deleting user:", error);
          addNotification('Failed to delete user.', 'error');
      }
  };
  
  const handleUpdateParentUser = async (uid: string, updates: Partial<User>) => {
      try {
          await db.collection('users').doc(uid).update(updates);
          addNotification('Parent account updated successfully!', 'success');
      } catch (error: any) {
          console.error("Error updating parent user:", error);
          addNotification('Failed to update parent account.', 'error');
      }
  };

  const handleSaveStaff = async (staffData: Omit<Staff, 'id'>, id: string | undefined, assignedGradeKey: Grade | null) => {
      try {
          if (id) {
              await db.collection('staff').doc(id).update(staffData);
              // Update grade definition if this staff is assigned as a class teacher
              if (assignedGradeKey) {
                  await db.collection('config').doc('gradeDefinitions').update({
                      [assignedGradeKey]: { ...gradeDefinitions[assignedGradeKey], classTeacherId: id }
                  });
              } else {
                  // If unassigned, clear classTeacherId from any grade it was previously assigned to
                  const currentAssignedGrade = Object.keys(gradeDefinitions).find(g => gradeDefinitions[g as Grade]?.classTeacherId === id) as Grade | undefined;
                  if (currentAssignedGrade) {
                      await db.collection('config').doc('gradeDefinitions').update({
                          [currentAssignedGrade]: { ...gradeDefinitions[currentAssignedGrade], classTeacherId: firebase.firestore.FieldValue.delete() }
                      });
                  }
              }
              addNotification('Staff updated successfully!', 'success');
          } else {
              const newStaffRef = db.collection('staff').doc();
              await newStaffRef.set({ ...staffData, id: newStaffRef.id });
              // If new staff is assigned as a class teacher, update grade definition
              if (assignedGradeKey) {
                  await db.collection('config').doc('gradeDefinitions').update({
                      [assignedGradeKey]: { ...gradeDefinitions[assignedGradeKey], classTeacherId: newStaffRef.id }
                  });
              }
              addNotification('Staff added successfully!', 'success');
          }
      } catch (error: any) {
          console.error("Error saving staff:", error);
          addNotification('Failed to save staff.', 'error');
      }
  };

  const handleDeleteStaff = async (id: string) => {
      try {
          await db.collection('staff').doc(id).delete();
          // Also remove from class teacher assignment if applicable
          const assignedGradeToDeletedStaff = Object.keys(gradeDefinitions).find(g => gradeDefinitions[g as Grade]?.classTeacherId === id) as Grade | undefined;
          if (assignedGradeToDeletedStaff) {
              await db.collection('config').doc('gradeDefinitions').update({
                  [assignedGradeToDeletedStaff]: { ...gradeDefinitions[assignedGradeToDeletedStaff], classTeacherId: firebase.firestore.FieldValue.delete() }
              });
          }
          addNotification('Staff deleted successfully!', 'success');
      } catch (error: any) {
          console.error("Error deleting staff:", error);
          addNotification('Failed to delete staff.', 'error');
      }
  };

  const handlePromoteStudents = async () => {
      try {
          const currentYear = academicYear;
          const nextYear = getNextAcademicYear(currentYear);
          const batch = db.batch();

          // 1. Archive current student data
          const studentSnapshot = await db.collection('students').get();
          studentSnapshot.docs.forEach(doc => {
              const studentData = doc.data() as Student;
              const archivedStudentRef = db.collection(`archive_${currentYear}_students`).doc(doc.id);
              batch.set(archivedStudentRef, studentData); // Archive the current state

              // 2. Determine new grade or mark as graduated/dropped
              let newGrade: Grade | null = null;
              let newStatus: StudentStatus = studentData.status;

              if (studentData.status === StudentStatus.ACTIVE) {
                  const gradeDef = gradeDefinitions[studentData.grade];
                  const resultStatus = calculateStudentResult(studentData, gradeDef); // FIX: Use imported calculateStudentResult

                  if (resultStatus === 'PASS') {
                      if (studentData.grade === Grade.X) {
                          newStatus = StudentStatus.GRADUATED;
                      } else {
                          newGrade = getNextGrade(studentData.grade); // FIX: Use imported getNextGrade
                          if (!newGrade) newStatus = StudentStatus.GRADUATED; // No next grade
                      }
                  } else {
                      // Student failed, detain them in the same grade
                      newGrade = studentData.grade;
                      newStatus = StudentStatus.ACTIVE; // Still active in the same grade
                  }
              } else {
                  // Keep status for non-active students (transferred, dropped)
                  newStatus = studentData.status;
                  newGrade = studentData.grade; // Stay in same grade for non-active
              }
              
              const studentRef = db.collection('students').doc(doc.id);
              const updatedGrade = newGrade || studentData.grade;
              const newStudentId = formatStudentId({ ...studentData, grade: updatedGrade }, nextYear);
              batch.update(studentRef, {
                  grade: updatedGrade, // Update grade for promoted, keep for detained
                  studentId: newStudentId, // Keep studentId current with new grade+year
                  academicYear: nextYear,
                  academicPerformance: [], // Reset academic performance for the new year
                  feePayments: { // Reset fees for the new year
                      admissionFeePaid: false,
                      tuitionFeesPaid: firebase.firestore.FieldValue.delete(), // Remove old monthly records
                      examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
                  },
                  status: newStatus,
              });
          });

     // ADD THESE INSIDE THE APP COMPONENT
const handleSaveNavItem = async (item: Partial<NavMenuItem>) => {
    try {
        // This uses your existing 'db' (Firestore) instance
        const id = item.id || db.collection('navigation').doc().id;
        await db.collection('navigation').doc(id).set({
            ...item,
            id,
            isActive: true,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        // If you have a toast/notification system, call it here:
        // addNotification('Saved successfully', 'success');
    } catch (error) {
        console.error("Error saving navigation item:", error);
    }
};

const handleDeleteNavItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
        try {
            await db.collection('navigation').doc(id).delete();
        } catch (error) {
            console.error("Error deleting navigation item:", error);
        }
    }
};

          // 4. Delete old staff attendance records
          const staffAttendanceSnapshot = await db.collection('staffAttendance').get();
          staffAttendanceSnapshot.docs.forEach(doc => {
              batch.delete(db.collection('staffAttendance').doc(doc.id));
          });

          // 5. Update academic year in config
          const configRef = db.collection('config').doc('academic');
          batch.update(configRef, { currentAcademicYear: nextYear });

          await batch.commit();
          addNotification(`Academic year advanced to ${nextYear}. Students promoted/detained.`, 'success', 'Promotion Complete');
          window.location.reload(); // Force reload to fetch new year's data
      } catch (error: any) {
          console.error("Error promoting students:", error);
          addNotification('Failed to promote students. Check console for details.', 'error', 'Promotion Failed');
      }
  };

  // --- Firestore Data Listeners ---
  useEffect(() => {
    // Academic Year Listener
    const unsubAcademicYear = db.collection('config').doc('academic').onSnapshot(doc => {
        if (doc.exists) {
            setAcademicYear(doc.data()?.currentAcademicYear || getCurrentAcademicYear());
        }
    });

    // Student Attendance Listener (Real-time for today's data)
    const today = new Date().toISOString().split('T')[0];
    const unsubDailyStudentAttendance = db.collection('studentAttendance').doc(today).onSnapshot(doc => {
      if (doc.exists) {
        setDailyStudentAttendance(doc.data() as Record<Grade, Record<string, StudentAttendanceRecord>>); // FIX: Cast to correct type
      } else {
        setDailyStudentAttendance(GRADES_LIST.reduce((acc, grade) => ({ ...acc, [grade]: {} }), {}) as Record<Grade, Record<string, StudentAttendanceRecord>>); // FIX: Initialize with correct type
      }
    });

    // Staff Attendance Listener (Real-time for today's data)
    const unsubStaffAttendance = db.collection('staffAttendance').doc(today).onSnapshot(doc => {
      if (doc.exists) {
        setStaffAttendance(doc.data() as StaffAttendanceRecord);
      } else {
        setStaffAttendance({});
      }
    });

    return () => {
        unsubAcademicYear();
        unsubDailyStudentAttendance();
        unsubStaffAttendance();
    };
  }, []); // Run only once on mount

  // Fetch Navigation Menu
    const unsubNav = db.collection('navigation').orderBy('order', 'asc').onSnapshot(snapshot => {
        setNavigation(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NavMenuItem)));
    });
  
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
            } catch (error: any) {
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
         s.docs.forEach(doc => routines[doc.id] = doc.data()?.routine as DailyRoutine);
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
                const heads: FeeHead[] = [];
                if (oldSet?.tuitionFee) heads.push({ id: 'tui', name: 'Tuition Fee (Monthly)', amount: Number(oldSet.tuitionFee), type: 'monthly' });
                if (oldSet?.examFee) heads.push({ id: 'eTerm', name: 'Exam Fee (Per Term)', amount: Number(oldSet.examFee), type: 'term' });
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
    
    // Sitemap Content
    const unsubSitemap = db.collection('config').doc('sitemap').onSnapshot(doc => {
        if (doc.exists && doc.data()?.content) {
            setSitemapContent(doc.data()?.content);
        }
    });


    return () => {
        unsubNews();
        unsubExamRoutines();
        unsubClassRoutines();
        unsubSchoolSettings();
        unsubFeeStructure();
        unsubAdmSettings();
        unsubGradeDefs();
        unsubSitemap();
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
            db.collection('hostelDisciplineLog').onSnapshot(s => setHostelDisciplineLog(s.docs.map(d => ({ id: d.id, ...d.data() } as HostelDisciplineEntry)))); // FIX: Add listener for hostelDisciplineLog
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

  const [sitemapContent, setSitemapContent] = useState<string>(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://bms04.netlify.app/</loc></url></urlset>`);

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
      <Route 
  path="manage-navigation" 
  element={
    <ManageNavigationPage 
      navigation={navigation} 
      onSave={handleSaveNavItem} 
      onDelete={handleDeleteNavItem} 
    />
  } 
/>       
      const sanitizedData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [key, value === undefined ? null : value])
              );

              if (id) {
                  await db.collection('online_admissions').doc(id).set(sanitizedData, { merge: true });
                  return id;
              } else {
                  const docRef = db.collection('online_admissions').doc();
                  const customId = `BMSAPP${docRef.id}`;
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
          <Route path="routine" element={<RoutinePage examSchedules={examRoutines} classSchedules={classRoutines} user={user} onSaveExamRoutine={handleSaveExamRoutine} onDeleteExamRoutine={handleDeleteExamRoutine} onUpdateClassRoutine={handleUpdateClassRoutine} />} />
          <Route path="news" element={<NewsPage news={news} user={user} />} />
          <Route path="fees" element={<FeesPage students={students} feeStructure={feeStructure} admissionSettings={admissionSettings} onUpdateFeePayments={handleUpdateFeePayments} academicYear={academicYear} addNotification={addNotification} user={user} />} />
          <Route path="sitemap" element={<SitemapPage />} />
        </Route>

        <Route path="/sitemap.xml" element={<SitemapXmlPage sitemapContent={sitemapContent} />} />

        {/* Auth Routes */}
        <Route path="/login" element={
            authLoading
            ? <div className="min-h-screen flex items-center justify-center bg-slate-50"><SpinnerIcon className="w-10 h-10 text-sky-600 animate-spin"/></div>
            : user ? <Navigate to="/portal/dashboard" replace /> : <LoginPage onLogin={handleLogin} onGoogleSignIn={handleGoogleSignIn} error="" notification="" />
        } />
        <Route path="/signup" element={<SignUpPage onSignUp={async (n, e, p) => { try { const c = await auth.createUserWithEmailAndPassword(e, p); if(c.user) { await c.user.updateProfile({ displayName: n }); await db.collection('users').doc(c.user.uid).set({ displayName: n, email: e, role: 'pending' }); return { success: true, message: "Awaiting approval." }; } return { success: false }; } catch(err: any) { return { success: false, message: err.message }; }}} />} />
        <Route path="/parent-registration" element={<ParentRegistrationPage />} />
        <Route path="/parent-signup" element={<ParentSignUpPage onSignUp={async (n, e, p, sid, dob, sname, rel) => { try { const c = await auth.createUserWithEmailAndPassword(e, p); if(c.user) { await c.user.updateProfile({ displayName: n }); await db.collection('users').doc(c.user.uid).set({ displayName: n, email: e, role: 'pending_parent', claimedStudents: [{ fullName: sname, studentId: sid, dob: dob, relationship: rel }], registrationDetails: { fullName: n, relationship: rel } }); return { success: true, message: "Awaiting approval." }; } return { success: false }; } catch(err: any) { return { success: false, message: err.message }; }}} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage onForgotPassword={async (e) => { try { await auth.sendPasswordResetEmail(e); return { success: true, message: "Password reset email sent! Please check your inbox." }; } catch(err: any) { return { success: false, message: err.message }; }}} />} />
        <Route path="/reset-password" element={<ResetPasswordPage onResetPassword={async (newPassword) => { try { const actionCode = new URLSearchParams(window.location.search).get('oobCode'); if (!actionCode) throw new Error("Missing action code for password reset."); await auth.confirmPasswordReset(actionCode, newPassword); return { success: true, message: "Password reset successfully! You can now log in." }; } catch(err: any) { return { success: false, message: err.message }; }}} />} />

        {/* Protected Portal Routes */}
        <Route path="/portal" element={
            authLoading 
            ? <div className="min-h-screen flex items-center justify-center bg-slate-50"><SpinnerIcon className="w-10 h-10 text-sky-600 animate-spin"/></div>
            : (user ? <DashboardLayout user={user} onLogout={handleLogout} students={students} staff={staff} tcRecords={tcRecords} serviceCerts={serviceCerts} academicYear={academicYear} /> : <Navigate to="/login" replace />)
        }>
           <Route path="dashboard" element={<DashboardPage user={user!} studentCount={students.length} academicYear={academicYear} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} calendarEvents={calendarEvents} pendingAdmissionsCount={pendingAdmissionsCount} pendingParentCount={pendingParentCount} pendingStaffCount={pendingStaffCount} onUpdateAcademicYear={handleUpdateAcademicYear} disciplineLog={hostelDisciplineLog} />} />
           <Route path="parent-dashboard" element={<ParentDashboardPage user={user!} allStudents={students} onLinkChild={async (c: StudentClaim) => { await db.collection('users').doc(user!.uid).update({ claimedStudents: firebase.firestore.FieldValue.arrayUnion(c) }); addNotification('Child linking request submitted for approval!', 'success'); }} currentAttendance={dailyStudentAttendance} news={news} staff={staff} gradeDefinitions={gradeDefinitions} homework={homework} syllabus={syllabus} onSendMessage={handleSendMessage} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} feeStructure={feeStructure} />} />
           <Route path="admin" element={<AdminPage pendingAdmissionsCount={pendingAdmissionsCount} pendingParentCount={pendingParentCount} pendingStaffCount={pendingStaffCount} students={students} academicYear={academicYear} />} />
           <Route path="profile" element={<UserProfilePage currentUser={user!} onUpdateProfile={handleUpdateUserProfile} />} />
           <Route path="change-password" element={<ChangePasswordPage onChangePassword={async (c, n) => { try { const cr = firebase.auth.EmailAuthProvider.credential(user!.email!, c); await auth.currentUser?.reauthenticateWithCredential(cr); await auth.currentUser?.updatePassword(n); return { success: true, message: "Password changed. Please log in again." }; } catch(err: any) { return { success: false, message: err.message }; }}} />} />
           <Route path="students" element={<StudentListPage students={students} onAdd={handleAddStudent} onEdit={handleEditStudent} academicYear={academicYear} user={user!} assignedGrade={assignedGrade} />} />
           <Route path="student/:studentId" element={<StudentDetailPage students={students} onEdit={handleEditStudent} academicYear={academicYear} user={user!} assignedGrade={assignedGrade} feeStructure={feeStructure} conductLog={conductLog} hostelDisciplineLog={hostelDisciplineLog} onAddConductEntry={async (e) => { await db.collection('conductLog').add(e); return true; }} onDeleteConductEntry={async (id) => { await db.collection('conductLog').doc(id).delete(); }} />} />
           <Route path="student/:studentId/academics" element={<AcademicPerformancePage students={students} onUpdateAcademic={handleUpdateAcademic} gradeDefinitions={gradeDefinitions} academicYear={academicYear} user={user!} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} />} />
           <Route path="student/:studentId/attendance-log" element={<StudentAttendanceLogPage students={students} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} user={user!} calendarEvents={calendarEvents} />} />
           <Route path="classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={async (grade) => { /* Placeholder for import modal */ addNotification(`Import dialog for ${grade || 'all grades'} would open here.`, 'info'); }} user={user!} />} />
           <Route path="classes/:grade" element={<ClassStudentsPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateClassTeacher={(g, tid) => handleUpdateGradeDefinition(g, { ...gradeDefinitions[g], classTeacherId: tid })} academicYear={academicYear} onOpenImportModal={async (grade) => { /* Placeholder for import modal */ addNotification(`Import dialog for ${grade} would open here.`, 'info'); }} onDelete={handleDeleteStudent} user={user!} assignedGrade={assignedGrade} onAddStudentToClass={handleAddStudent} onUpdateBulkFeePayments={handleUpdateBulkFeePayments} feeStructure={feeStructure} />} />
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
           <Route path="calendar" element={<CalendarPage events={calendarEvents} user={user!} onAdd={async (eventData, id) => { await handleSaveCalendarEvent(eventData, id); }} onEdit={async (eventData) => { await handleSaveCalendarEvent(eventData, eventData.id); }} onDelete={handleDeleteCalendarEvent} notificationDaysBefore={-1} onUpdatePrefs={async () => { addNotification('Notification preferences saved.', 'success'); }} />} />
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
           <Route path="admissions" element={<OnlineAdmissionsListPage admissions={onlineAdmissions} onUpdateStatus={async (id, s) => { await db.collection('online_admissions').doc(id).update({ status: s }); }} onDelete={async (id) => { await db.collection('online_admissions').doc(id).delete(); }} onEnrollStudent={handleEnrollStudent} academicYear={academicYear} />} />
           <Route path="homework-scanner" element={<HomeworkScannerPage />} />
           <Route path="activity-log" element={<ActivityLogPage students={students} user={user!} gradeDefinitions={gradeDefinitions} academicYear={academicYear} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onBulkUpdateActivityLogs={handleBulkUpdateActivityLogs} />} />
           <Route path="manage-homework" element={<ManageHomeworkPage user={user!} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onSave={handleSaveHomework} onDelete={handleDeleteHomework} allHomework={homework} />} />
           <Route path="manage-syllabus" element={<ManageSyllabusPage user={user!} assignedGrade={assignedGrade} assignedSubjects={assignedSubjects} onSave={handleSaveSyllabus} allSyllabus={syllabus} gradeDefinitions={gradeDefinitions} />} />
           <Route path="syllabus/:grade" element={<SyllabusPage syllabus={syllabus} gradeDefinitions={gradeDefinitions} />} />
           <Route path="insights" element={<InsightsPage students={students} gradeDefinitions={gradeDefinitions} conductLog={conductLog} user={user!} />} />
           <Route path="settings" element={<SchoolSettingsPage config={schoolConfig} onUpdate={async (c) => { await db.collection('config').doc('schoolSettings').set(c, { merge: true }); setSchoolConfig(prev => ({ ...prev, ...c })); return true; }} />} />
 <Route 
  path="manage-navigation" 
  element={
    <ManageNavigationPage 
      navigation={navigation} 
      onSave={handleSaveNavItem}    // Must match the function name above
      onDelete={handleDeleteNavItem} // Must match the function name above
    />
  } 
/>
          <Route path="fees" element={<FeeManagementPage students={students} academicYear={academicYear} onUpdateFeePayments={handleUpdateFeePayments} user={user!} feeStructure={feeStructure} onUpdateFeeStructure={handleUpdateFeeStructure} addNotification={addNotification} schoolConfig={schoolConfig} />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
