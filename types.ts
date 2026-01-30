
export type NotificationType = 'success' | 'error' | 'info' | 'offline';

export enum Grade {
    NURSERY = 'Nursery',
    KINDERGARTEN = 'Kindergarten',
    I = 'Class I',
    II = 'Class II',
    III = 'Class III',
    IV = 'Class IV',
    V = 'Class V',
    VI = 'Class VI',
    VII = 'Class VII',
    VIII = 'Class VIII',
    IX = 'Class IX',
    X = 'Class X'
}

export enum Gender {
    MALE = 'Male',
    FEMALE = 'Female',
    OTHER = 'Other'
}

export enum Category {
    GENERAL = 'General',
    SC = 'SC',
    ST = 'ST',
    OBC = 'OBC'
}

export enum BloodGroup {
    A_POSITIVE = 'A+',
    A_NEGATIVE = 'A-',
    B_POSITIVE = 'B+',
    B_NEGATIVE = 'B-',
    AB_POSITIVE = 'AB+',
    AB_NEGATIVE = 'AB-',
    O_POSITIVE = 'O+',
    O_NEGATIVE = 'O-'
}

// --- Admission Configuration Types ---
export interface AdmissionItemConfig {
    id: string;
    name: string;
    price: number;
    priceBySize?: Record<string, number>; // Optional map for size-specific prices
    mandatory: boolean;
    type: 'general' | 'uniform'; // 'general' items don't have sizes, 'uniform' items do
}

export interface AdmissionSettings {
    academicYearLabel: string; // e.g. "2026-27"
    admissionFee: number;
    notebookPrices: Record<string, number>; // Key is Grade string
    items: AdmissionItemConfig[];
}
// -------------------------------------

export interface AdmissionItem {
    name: string;
    price: number;
    quantity: number;
    size?: string | null;
}

export interface OnlineAdmission {
    id: string;
    studentType?: 'Newcomer' | 'Existing';
    previousStudentId?: string;
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
    status: 'draft' | 'pending' | 'reviewed' | 'approved' | 'rejected';
    paymentStatus?: 'pending' | 'paid';
    paymentAmount?: number;
    paymentTransactionId?: string;
    purchasedItems?: AdmissionItem[];
    billId?: string;
    temporaryStudentId?: string;
    isEnrolled?: boolean;
}

export interface Homework {
    id: string;
    grade: Grade;
    subject: string;
    date: string;
    assignmentDetails: string;
    dueDate?: string;
    createdBy?: {
        uid: string;
        name: string;
    };
}

export interface SyllabusTopic {
    name: string;
    status: 'Completed' | 'In Progress' | 'Not Started';
}

export interface Syllabus {
    id: string;
    grade: Grade;
    subject: string;
    topics: SyllabusTopic[];
}

export interface Notice {
    id: string;
    title: string;
    content: string;
    date: string;
    targetGrades: Grade[] | 'all';
    createdBy: {
        uid: string;
        name: string;
    };
}

export interface StudentClaim {
    fullName: string;
    studentId: string;
    dob: string;
    relationship: string;
}

export enum StudentStatus {
    ACTIVE = 'Active',
    TRANSFERRED = 'Transferred',
    DROPPED = 'Dropped',
    GRADUATED = 'Graduated'
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

export interface SubjectMark {
    subject: string;
    marks?: number | null;
    examMarks?: number | null;
    activityMarks?: number | null;
    grade?: 'O' | 'A' | 'B' | 'C';
    activityLog?: ActivityLog;
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

export interface Attendance {
    totalWorkingDays: number;
    daysPresent: number;
}

export type ConductGrade = 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement';

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
    dateOfBirth: string;
    gender: Gender;
    address: string;
    aadhaarNumber: string;
    pen: string;
    category: Category;
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
    cwsn: string;
    religion: string;
    bloodGroup?: BloodGroup;
    photographUrl: string;
    feePayments: FeePayments;
    academicPerformance?: Exam[];
    academicYear?: string;
}

export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: 'admin' | 'user' | 'parent' | 'pending' | 'warden' | 'pending_parent';
    studentIds?: string[];
    claimedStudentId?: string;
    claimedDateOfBirth?: string;
    claimedStudents?: StudentClaim[];
    registrationDetails?: any;
}

export interface SubjectDefinition {
    name: string;
    examFullMarks: number;
    activityFullMarks: number;
    gradingSystem?: 'OABC';
}

export interface GradeDefinition {
    subjects: SubjectDefinition[];
    classTeacherId?: string;
}

export enum MaritalStatus {
    SINGLE = 'Single',
    MARRIED = 'Married',
    DIVORCED = 'Divorced',
    WIDOWED = 'Widowed'
}

export enum Department {
    LANGUAGES = 'Languages',
    SCIENCE = 'Science',
    MATHEMATICS = 'Mathematics',
    SOCIAL_STUDIES = 'Social Studies',
    ARTS = 'Arts',
    SPORTS = 'Sports',
    ADMINISTRATION = 'Administration',
    SUPPORT = 'Support Staff'
}

export enum Designation {
    PRINCIPAL = 'Principal',
    VICE_PRINCIPAL = 'Vice Principal',
    TEACHER = 'Teacher',
    ASSISTANT_TEACHER = 'Assistant Teacher',
    CLERK = 'Clerk',
    LIBRARIAN = 'Librarian',
    SPORTS_TEACHER = 'Sports Teacher',
    SUPPORT_STAFF = 'Support Staff'
}

export enum EmployeeType {
    FULL_TIME = 'Full Time',
    PART_TIME = 'Part Time',
    CONTRACT = 'Contract'
}

export enum EmploymentStatus {
    ACTIVE = 'Active',
    ON_LEAVE = 'On Leave',
    RESIGNED = 'Resigned',
    RETIRED = 'Retired'
}

export enum StaffType {
    TEACHING = 'Teaching',
    NON_TEACHING = 'Non-Teaching'
}

export enum Qualification {
    GRADUATE = 'Graduate',
    POST_GRADUATE = 'Post Graduate',
    PHD = 'PhD',
    BED = 'B.Ed',
    MED = 'M.Ed',
    DLED = 'D.El.Ed',
    HSSLC = 'HSSLC',
    HSLC = 'HSLC',
    OTHER = 'Other'
}

export interface SubjectAssignment {
    grade: Grade;
    subject: string;
}

export interface Staff {
    id: string;
    staffType: StaffType;
    employeeId: string;
    firstName: string;
    lastName: string;
    gender: Gender;
    dateOfBirth: string;
    nationality: string;
    maritalStatus: MaritalStatus;
    photographUrl: string;
    bloodGroup: BloodGroup;
    aadhaarNumber: string;
    contactNumber: string;
    emailAddress: string;
    permanentAddress: string;
    currentAddress: string;
    educationalQualification: Qualification;
    specialization: string;
    yearsOfExperience: number;
    previousExperience: string;
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

export interface InventoryItem {
    id: string;
    name: string;
    category: InventoryCategory;
    subCategory?: string;
    quantity: number;
    status: InventoryStatus;
    location: string;
    purchaseDate: string;
    lastMaintenanceDate?: string;
    notes?: string;
    reorderLevel: number;
    currentStock: number;
}

export enum InventoryCategory {
    FURNITURE = 'Furniture',
    ELECTRONICS = 'Electronics',
    STATIONERY = 'Stationery',
    SPORTS_EQUIPMENT = 'Sports Equipment',
    LAB_EQUIPMENT = 'Lab Equipment',
    BOOKS = 'Books',
    OTHER = 'Other'
}

export enum InventoryStatus {
    GOOD = 'Good',
    NEEDS_REPAIR = 'Needs Repair',
    NEEDS_REPLACEMENT = 'Needs Replacement'
}

export enum HostelDormitory {
    BOYS_DORM_A = 'Boys Dorm A',
    BOYS_DORM_B = 'Boys Dorm B',
    GIRLS_DORM_A = 'Girls Dorm A',
    GIRLS_DORM_B = 'Girls Dorm B'
}

export enum HostelStaffRole {
    WARDEN = 'Warden',
    COOK = 'Cook',
    CLEANER = 'Cleaner',
    SECURITY = 'Security'
}

export enum HostelInventoryCategory {
    FURNITURE = 'Furniture',
    BEDDING = 'Bedding',
    KITCHEN = 'Kitchen',
    CLEANING = 'Cleaning',
    OTHER = 'Other'
}

export enum StockLogType {
    IN = 'IN',
    OUT = 'OUT'
}

export interface HostelResident {
    id: string;
    studentId: string;
    dormitory: HostelDormitory;
    dateOfJoining: string;
}

export interface HostelStaff {
    id: string;
    name: string;
    role: HostelStaffRole;
    contactNumber: string;
    dateOfJoining: string;
    salary: number;
    paymentStatus: PaymentStatus;
    gender: Gender;
    dateOfBirth: string;
    photographUrl: string;
    bloodGroup?: BloodGroup;
    aadhaarNumber?: string;
    emailAddress?: string;
    permanentAddress?: string;
    dutyShift?: string;
    assignedBlock?: HostelDormitory;
    qualification?: Qualification;
    expertise?: string;
    attendancePercent?: number;
    emergencyContactName?: string;
    emergencyContactRelationship?: string;
    emergencyContactNumber?: string;
    medicalConditions?: string;
}

export enum PaymentStatus {
    PAID = 'Paid',
    PENDING = 'Pending'
}

export interface HostelInventoryItem extends InventoryItem {}

export interface StockLog {
    id: string;
    itemId: string;
    itemName: string;
    quantity: number;
    type: StockLogType;
    date: string;
    notes?: string;
}

export interface HostelDisciplineEntry {
    id: string;
    studentId: string;
    residentId?: string;
    date: string;
    category: string;
    description: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    actionTaken?: string;
    reportedBy: string;
    reportedById?: string;
}

export enum IncidentSeverity {
    MINOR = 'Minor',
    MAJOR = 'Major',
    CRITICAL = 'Critical'
}

export enum IncidentStatus {
    OPEN = 'Open',
    PENDING_ACTION = 'Pending Action',
    RESOLVED = 'Resolved'
}

export enum Chore {
    GIRLS_I_CLEANING = "Girls' I Cleaning",
    GIRLS_II_CLEANING = "Girls' II Cleaning",
    FOOD_SERVER = "Food Server",
    VERANDA_CLEANING = "Veranda Cleaning",
    TEA_SERVER = "Tea Server",
    RAG_WASHER = "Rag Washer",
    MOPPER = "Mopper",
    ROAD_SWEEPER = "Road Sweeper",
    BOYS_DORM_CLEANER = "Boys' Dorm Cleaner",
    SHOE_POLISHER = "Shoe Polisher",
    TEACHERS_PLATE_WASHER = "Teachers' Plate Washer",
    DINING_HALL_SWEEPER = "Dining Hall Sweeper",
    BIO_WASTE_WATER_BOYS = "Bio Waste Water (Boys)"
}

export type DailyChoreAssignment = Record<string, string[]>;
export type ChoreRoster = Record<Chore, DailyChoreAssignment>;

export enum CalendarEventType {
    HOLIDAY = 'Holiday',
    EXAM = 'Exam Schedule',
    EVENT = 'School Event',
    MEETING = 'Staff Meeting'
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    endDate?: string;
    type: CalendarEventType;
    description?: string;
}

export interface DistinctionHolder {
    name: string;
    parentage: string;
    imageUrl: string;
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

export enum ConductEntryType {
    MERIT = 'Merit',
    DEMERIT = 'Demerit'
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

export enum AttendanceStatus {
    PRESENT = 'Present',
    ABSENT = 'Absent',
    LATE = 'Late',
    LEAVE = 'Leave'
}

export enum StudentAttendanceStatus {
    PRESENT = 'Present',
    ABSENT = 'Absent',
    LEAVE = 'Leave'
}

export type StaffAttendanceRecord = Record<string, AttendanceStatus>;
export type StudentAttendanceRecord = Record<string, StudentAttendanceStatus>;
export type DailyStudentAttendance = Record<Grade, Record<string, StudentAttendanceRecord>>;

export interface TcRecord {
    id: string;
    refNo: string;
    studentDbId: string;
    studentDisplayId: string;
    nameOfStudent: string;
    gender: string;
    fatherName: string;
    motherName: string;
    currentClass: string;
    rollNo: number;
    dateOfBirth: string;
    category: string;
    religion: string;
    dateOfBirthInWords: string;
    schoolDuesIfAny: string;
    qualifiedForPromotion: string;
    dateOfLastAttendance: string;
    dateOfApplicationOfTc: string;
    dateOfIssueOfTc: string;
    reasonForLeaving: string;
    generalConduct: string;
    anyOtherRemarks: string;
}

export interface ServiceCertificateRecord {
    id: string;
    certData: {
        refNo: string;
        lastWorkingDay: string;
        issueDate: string;
        reasonForLeaving: string;
        generalConduct: string;
        remarks: string;
    };
    staffDetails: {
        staffId: string;
        staffNumericId: string;
        name: string;
        gender: Gender;
        designation: string;
        dateOfJoining: string;
        dateOfBirth: string;
    };
}

export interface NewsItem {
    id: string;
    title: string;
    date: string;
    content: string;
    imageUrls?: string[];
}

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

export interface Period {
  subject: string;
}

export interface ClassRoutine {
  class: string;
  periods: Period[];
}

export type DailyRoutine = ClassRoutine[];

declare global {
    interface Window {
        Razorpay: any;
    }
}
