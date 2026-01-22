

export interface StudentClaim {
  fullName: string;
  studentId: string;
  dob: string;
  relationship: string;
}

export interface RegistrationDetails {
  fullName: string;
  relationship: string;
  contactNumber: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  language: string;
  communicationPreferences: {
    sms: boolean;
    email: boolean;
    push: boolean;
  };
  securityQuestion: string;
  securityAnswer: string;
  agreements: {
    terms: boolean;
    privacy: boolean;
    identity: boolean;
    photoRelease: boolean;
  };
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'admin' | 'user' | 'pending' | 'parent' | 'warden' | 'pending_parent';
  studentIds?: string[];
  claimedStudentId?: string;
  claimedDateOfBirth?: string;
  claimedStudents?: StudentClaim[];
  registrationDetails?: RegistrationDetails;
}

export enum Grade {
  NURSERY = "Nursery",
  KINDERGARTEN = "Kindergarten",
  I = "Class I",
  II = "Class II",
  III = "Class III",
  IV = "Class IV",
  V = "Class V",
  VI = "Class VI",
  VII = "Class VII",
  VIII = "Class VIII",
  IX = "Class IX",
  X = "Class X"
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  OTHER = "Other"
}

export enum Category {
  GENERAL = "General",
  SC = "SC",
  ST = "ST",
  OBC = "OBC"
}

export enum StudentStatus {
  ACTIVE = "Active",
  TRANSFERRED = "Transferred",
  DROPPED_OUT = "Dropped Out",
  GRADUATED = "Graduated"
}

export interface FeeSet {
  admissionFee: number;
  tuitionFee: number;
  examFee: number;
}

export interface FeeStructure {
  set1: FeeSet;
  set2: FeeSet;
  set3: FeeSet;
}

export interface FeePayments {
  admissionFeePaid: boolean;
  tuitionFeesPaid: Record<string, boolean>;
  examFeesPaid: {
    terminal1: boolean;
    terminal2: boolean;
    terminal3: boolean;
  };
}

export interface Assessment {
    marksObtained: number | null;
    maxMarks: number | null;
}

export interface ComponentLog {
    assessments: Assessment[];
    weightage: number;
    scaledMarks: number;
}

export interface ActivityLog {
    classTest: ComponentLog;
    homework: ComponentLog;
    project: ComponentLog;
}

export interface SubjectMark {
  subject: string;
  marks?: number | null;
  examMarks?: number | null;
  activityMarks?: number | null;
  grade?: 'O' | 'A' | 'B' | 'C';
  activityLog?: ActivityLog;
}

export interface Attendance {
    totalWorkingDays: number;
    daysPresent: number;
}

export interface Exam {
  id: 'terminal1' | 'terminal2' | 'terminal3';
  name: string;
  results: SubjectMark[];
  teacherRemarks?: string;
  generalConduct?: ConductGrade;
  attendance?: Attendance;
}

export interface Student {
  id: string;
  rollNo: number;
  name: string;
  grade: Grade;
  studentId: string;
  contact: string;
  photographUrl?: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  aadhaarNumber: string;
  pen: string;
  category: Category;
  religion: string;
  bloodGroup?: BloodGroup;
  cwsn: 'Yes' | 'No';
  fatherName: string;
  fatherOccupation: string;
  fatherAadhaar: string;
  motherName: string;
  motherOccupation: string;
  motherAadhaar: string;
  guardianName: string;
  guardianRelationship: string;
  lastSchoolAttended: string;
  healthConditions: string;
  achievements: string;
  status: StudentStatus;
  feePayments?: FeePayments;
  academicPerformance?: Exam[];
}

export interface SubjectDefinition {
    name: string;
    examFullMarks: number;
    activityFullMarks: number;
    gradingSystem?: 'OABC';
}

export interface GradeDefinition {
    classTeacherId?: string;
    subjects: SubjectDefinition[];
}

export enum StaffType {
    TEACHING = "Teaching",
    NON_TEACHING = "Non-Teaching"
}

export enum EmploymentStatus {
    ACTIVE = "Active",
    ON_LEAVE = "On Leave",
    RESIGNED = "Resigned",
    RETIRED = "Retired"
}

export enum MaritalStatus {
    SINGLE = "Single",
    MARRIED = "Married",
    DIVORCED = "Divorced",
    WIDOWED = "Widowed"
}

export enum BloodGroup {
    A_POSITIVE = "A+",
    A_NEGATIVE = "A-",
    B_POSITIVE = "B+",
    B_NEGATIVE = "B-",
    AB_POSITIVE = "AB+",
    AB_NEGATIVE = "AB-",
    O_POSITIVE = "O+",
    O_NEGATIVE = "O-"
}

export enum Qualification {
    UNDER_GRADUATE = "Under Graduate",
    GRADUATE = "Graduate",
    POST_GRADUATE = "Post Graduate",
    DOCTORATE = "Doctorate",
    OTHER = "Other"
}

export enum Department {
    SCIENCES = "Sciences",
    MATHEMATICS = "Mathematics",
    LANGUAGES = "Languages",
    SOCIAL_SCIENCES = "Social Sciences",
    ARTS = "Arts",
    SPORTS = "Sports",
    ADMINISTRATION = "Administration",
    SUPPORT_STAFF = "Support Staff"
}

export enum Designation {
    PRINCIPAL = "Principal",
    VICE_PRINCIPAL = "Vice Principal",
    HEADMASTER = "Headmaster",
    TEACHER = "Teacher",
    ASSISTANT_TEACHER = "Assistant Teacher",
    CLERK = "Clerk",
    LIBRARIAN = "Librarian",
    SPORTS_TEACHER = "Sports Teacher",
    WARDEN = "Warden",
    STAFF = "Staff"
}

export enum EmployeeType {
    FULL_TIME = "Full Time",
    PART_TIME = "Part Time",
    CONTRACTUAL = "Contractual"
}

export interface SubjectAssignment {
    grade: Grade;
    subject: string;
}

export interface Staff {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    staffType: StaffType | string;
    gender: Gender;
    dateOfBirth: string;
    nationality: string;
    maritalStatus: MaritalStatus;
    photographUrl?: string;
    bloodGroup?: BloodGroup;
    aadhaarNumber: string;
    contactNumber: string;
    emailAddress: string;
    permanentAddress: string;
    currentAddress: string;
    educationalQualification: Qualification;
    specialization: string;
    yearsOfExperience: number;
    previousExperience?: string;
    dateOfJoining: string;
    department: Department;
    designation: Designation;
    employeeType: EmployeeType;
    status: EmploymentStatus;
    assignedSubjects?: SubjectAssignment[];
    teacherLicenseNumber?: string;
    salaryGrade?: string;
    basicSalary?: number | null;
    bankAccountNumber?: string;
    bankName?: string;
    panNumber?: string;
    emergencyContactName: string;
    emergencyContactRelationship: string;
    emergencyContactNumber: string;
    medicalConditions?: string;
}

export enum InventoryCategory {
    FURNITURE = "Furniture",
    ELECTRONICS = "Electronics",
    STATIONERY = "Stationery",
    SPORTS_EQUIPMENT = "Sports Equipment",
    LAB_EQUIPMENT = "Lab Equipment",
    OTHER = "Other"
}

export enum InventoryStatus {
    GOOD = "Good",
    NEEDS_REPAIR = "Needs Repair",
    NEEDS_REPLACEMENT = "Needs Replacement",
    LOST = "Lost"
}

export interface InventoryItem {
    id: string;
    name: string;
    category: InventoryCategory | string;
    subCategory?: string;
    quantity: number;
    status: InventoryStatus | string;
    location: string;
    purchaseDate: string;
    lastMaintenanceDate?: string;
    notes?: string;
}

export enum HostelDormitory {
    BOYS_BLOCK_A = "Boys Block A",
    BOYS_BLOCK_B = "Boys Block B",
    GIRLS_BLOCK_A = "Girls Block A",
    GIRLS_BLOCK_B = "Girls Block B"
}

export enum HostelStaffRole {
    WARDEN = "Warden",
    COOK = "Cook",
    CLEANER = "Cleaner",
    SECURITY = "Security",
    OTHER = "Other"
}

export interface HostelStaff {
    id: string;
    name: string;
    gender: Gender;
    dateOfBirth: string;
    photographUrl?: string;
    bloodGroup?: BloodGroup;
    aadhaarNumber?: string;
    contactNumber: string;
    emailAddress?: string;
    permanentAddress?: string;
    role: HostelStaffRole;
    dateOfJoining: string;
    dutyShift?: string;
    assignedBlock?: HostelDormitory;
    qualification?: Qualification;
    expertise?: string;
    salary: number;
    paymentStatus: PaymentStatus;
    attendancePercent?: number;
    emergencyContactName?: string;
    emergencyContactRelationship?: string;
    emergencyContactNumber?: string;
}

export enum PaymentStatus {
    PAID = "Paid",
    PENDING = "Pending"
}

export interface HostelResident {
    id: string;
    studentId: string;
    dormitory: HostelDormitory;
    dateOfJoining: string;
}

export enum HostelInventoryCategory {
    BEDDING = "Bedding",
    KITCHEN = "Kitchen",
    CLEANING = "Cleaning",
    FURNITURE = "Furniture",
    OTHER = "Other"
}

export enum StockLogType {
    IN = "IN",
    OUT = "OUT"
}

export interface HostelInventoryItem {
    id: string;
    name: string;
    category: HostelInventoryCategory | string;
    currentStock: number;
    reorderLevel: number;
}

export interface StockLog {
    id: string;
    itemId: string;
    itemName: string;
    quantity: number;
    type: StockLogType;
    date: string;
    updatedBy: string;
    notes?: string;
}

export enum IncidentSeverity {
    MINOR = "Minor",
    MAJOR = "Major",
    CRITICAL = "Critical"
}

export enum IncidentStatus {
    OPEN = "Open",
    RESOLVED = "Resolved",
    PENDING_ACTION = "Pending Action"
}

export interface HostelDisciplineEntry {
    id: string;
    residentId: string;
    studentId: string;
    date: string;
    category: string;
    description: string;
    severity: IncidentSeverity;
    actionTaken?: string;
    reportedBy: string;
    reportedById?: string;
    status: IncidentStatus;
}

export enum Chore {
    GIRLS_I_CLEANING = "Girls I Cleaning",
    GIRLS_II_CLEANING = "Girls II Cleaning",
    BOYS_DORM_CLEANER = "Boys Dorm Cleaner",
    FOOD_SERVER = "Food Server",
    SHOE_POLISHER = "Shoe Polisher",
    VERANDA_CLEANING = "Veranda Cleaning",
    TEACHERS_PLATE_WASHER = "Teacher's Plate Washer",
    TEA_SERVER = "Tea Server",
    RAG_WASHER = "Rag Washer",
    DINING_HALL_SWEEPER = "Dining Hall Sweeper",
    MOPPER = "Mopper",
    BIO_WASTE_WATER_BOYS = "Bio Waste Water (Boys)",
    ROAD_SWEEPER = "Road Sweeper"
}

export type DailyChoreAssignment = Record<string, string[]>;
export type ChoreRoster = Record<Chore | string, DailyChoreAssignment>;

export enum CalendarEventType {
    HOLIDAY = "Holiday",
    EXAM = "Exam Schedule",
    EVENT = "School Event",
    MEETING = "Staff Meeting"
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    endDate?: string;
    type: CalendarEventType;
    description?: string;
}

export type NotificationType = 'success' | 'error' | 'info' | 'offline';

export type ConductGrade = 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement';

export enum ConductEntryType {
    MERIT = "Merit",
    DEMERIT = "Demerit"
}

export interface ConductEntry {
    id: string;
    studentId: string;
    date: string;
    type: ConductEntryType;
    category: string;
    description: string;
    recordedBy: string;
    recordedById: string;
}

export interface NewsItem {
    id: string;
    title: string;
    date: string;
    content: string;
    imageUrls?: string[];
}

export interface TcRecord {
    id: string;
    refNo: string;
    studentDbId?: string;
    studentDisplayId?: string;
    nameOfStudent: string;
    gender: string;
    fatherName: string;
    motherName: string;
    currentClass: string;
    rollNo: number;
    dateOfBirth: string;
    dateOfBirthInWords: string;
    category: string;
    religion: string;
    schoolDuesIfAny: string;
    qualifiedForPromotion: string;
    dateOfLastAttendance?: string;
    dateOfApplicationOfTc: string;
    dateOfIssueOfTc: string;
    reasonForLeaving: string;
    generalConduct: string;
    anyOtherRemarks?: string;
}

export interface ServiceCertificateRecord {
    id: string;
    staffDetails: {
        staffId: string;
        staffNumericId: string;
        name: string;
        gender: string;
        designation: string;
        dateOfJoining: string;
        dateOfBirth: string;
    };
    certData: {
        refNo: string;
        lastWorkingDay: string;
        issueDate: string;
        reasonForLeaving: string;
        generalConduct: string;
        remarks: string;
    };
}

export enum AttendanceStatus {
    PRESENT = "Present",
    ABSENT = "Absent",
    LEAVE = "Leave",
    LATE = "Late"
}

export type StaffAttendanceRecord = Record<string, AttendanceStatus>;

export enum StudentAttendanceStatus {
    PRESENT = "Present",
    ABSENT = "Absent",
    LEAVE = "Leave"
}

export type StudentAttendanceRecord = Record<string, StudentAttendanceStatus>;
export type DailyStudentAttendance = Record<Grade, StudentAttendanceRecord>;

export interface Period {
  subject: string;
}

export interface ClassRoutine {
  class: string;
  periods: Period[];
}

export type DailyRoutine = ClassRoutine[];

export interface ExamScheduleItem {
    date: string;
    day: string;
    morning?: string;
    afternoon?: string;
}

export interface ExamRoutine {
    id: string;
    title: string;
    exams: ExamScheduleItem[];
}

export interface DistinctionHolder {
    name: string;
    parentage: string;
    imageUrl: string;
}

export interface OnlineAdmission {
    id: string;
    admissionGrade: string;
    studentName: string;
    dateOfBirth: string;
    gender: string;
    studentAadhaar: string;
    fatherName: string;
    motherName: string;
    fatherOccupation?: string;
    motherOccupation?: string;
    parentAadhaar?: string;
    guardianName?: string;
    guardianRelationship?: string;
    permanentAddress: string;
    presentAddress: string;
    contactNumber: string;
    email?: string;
    penNumber?: string;
    motherTongue?: string;
    isCWSN?: string;
    bloodGroup?: string;
    lastSchoolAttended?: string;
    lastDivision?: string;
    generalBehaviour?: string;
    siblingsInSchool?: number;
    achievements?: string;
    healthIssues?: string;
    birthCertificateUrl?: string;
    transferCertificateUrl?: string;
    reportCardUrl?: string;
    paymentScreenshotUrl?: string;
    submissionDate: string;
    status: 'pending' | 'reviewed' | 'approved' | 'rejected';
}

// FIX: Added missing 'Homework' interface.
export interface Homework {
    id: string;
    grade: Grade;
    subject: string;
    date: string;
    assignmentDetails: string;
    dueDate?: string;
    createdBy: {
        uid: string;
        name: string;
    };
}

// FIX: Added missing 'Syllabus' related interfaces.
export interface SyllabusTopic {
    name: string;
    status: 'Completed' | 'In Progress' | 'Not Started';
}

export interface Syllabus {
    id: string; // composite key e.g., "Class V-Science"
    grade: Grade;
    subject: string;
    topics: SyllabusTopic[];
}

declare global {
    interface Window {
        Razorpay: any;
    }
}