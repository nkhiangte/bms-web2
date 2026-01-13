







// Add Razorpay to the window object for global access
declare global {
    interface Window {
        Razorpay: any;
    }
}

// NEW: Attendance object
export interface Attendance {
    totalWorkingDays: number;
    daysPresent: number;
}


// FIX: Added missing academic types
export type ConductGrade = 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement';

export interface SubjectDefinition {
    name: string;
    examFullMarks: number;
    activityFullMarks: number;
    gradingSystem?: 'OABC'; // For non-numeric subjects
}

// --- NEW: Academic & Subject Management ---
export interface Assessment {
    marksObtained: number | null;
    maxMarks: number | null;
}

export interface ActivityComponentLog {
    assessments: Assessment[];
    weightage: number;
    scaledMarks: number;
}

export type ActivityLog = {
    classTest: ActivityComponentLog;
    homework: ActivityComponentLog;
    project: ActivityComponentLog;
};

export interface SubjectMark {
    subject: string;
    marks?: number; // For simpler grading systems
    examMarks?: number; // For systems with activities
    activityMarks?: number;
    activityLog?: ActivityLog;
    grade?: 'O' | 'A' | 'B' | 'C'; // For non-numeric subjects
}

export interface Exam {
    id: 'terminal1' | 'terminal2' | 'terminal3';
    name: string;
    results: SubjectMark[];
    teacherRemarks?: string;
    generalConduct?: ConductGrade;
    attendance?: Attendance;
}

// --- NEW: Staff Subject Assignment ---
export interface SubjectAssignment {
    grade: Grade;
    subject: string;
}

// --- NEW: Distinction Holders ---
export interface DistinctionHolder {
    name: string;
    parentage: string;
    imageUrl: string;
}


export type NotificationType = 'success' | 'error' | 'info' | 'offline';

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'admin' | 'user' | 'pending' | 'parent' | 'warden' | 'pending_parent';
  studentIds?: string[]; // For parent role
  claimedStudentId?: string; // For pending_parent role
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
  X = "Class X",
}

export enum Gender {
    MALE = "Male",
    FEMALE = "Female",
    OTHER = "Other",
}

export enum StudentStatus {
    ACTIVE = "Active",
    TRANSFERRED = "Transferred",
}

export enum EmploymentStatus {
    ACTIVE = "Active",
    ON_LEAVE = "On Leave",
    RESIGNED = "Resigned",
    RETIRED = "Retired",
}

export enum Category {
    GENERAL = "General",
    SC = "SC",
    ST = "ST",
    OBC = "OBC",
}

// --- NEW Enums for Teacher ---
export enum MaritalStatus {
    SINGLE = "Single",
    MARRIED = "Married",
    DIVORCED = "Divorced",
    WIDOWED = "Widowed",
}

export enum Department {
    ADMINISTRATION = "Administration",
    SCIENCE = "Science",
    MATHEMATICS = "Mathematics",
    SOCIAL_STUDIES = "Social Science",
    LANGUAGES = "Languages",
    COMPUTER_SCIENCE = "Computer Science",
    ARTS = "Arts",
    SPORTS = "Sports",
    SUPPORT_STAFF = "Support Staff",
}

export enum Designation {
    PRINCIPAL = "Principal",
    HEAD_OF_DEPARTMENT = "Head of Department",
    TEACHER = "Teacher",
    SPORTS_TEACHER = "Sports Teacher",
    LAB_ASSISTANT = "Lab Assistant",
    LIBRARIAN = "Librarian",
    CLERK = "Clerk",
}

export enum EmployeeType {
    FULL_TIME = "Full-time",
    PART_TIME = "Part-time",
    CONTRACT = "Contract",
}

export enum Qualification {
    SSLC = "SSLC",
    HSLC = "HSLC",
    HSSLC = "HSSLC",
    GRADUATE = "Graduate", // B.A, B.Sc, B.Com, etc.
    POST_GRADUATE = "Post-Graduate", // M.A, M.Sc, etc.
    B_ED = "B.Ed",
    M_ED = "M.Ed",
    PHD = "Ph.D.",
    DIPLOMA = "Diploma",
    OTHER = "Other",
}

export enum BloodGroup {
    A_POSITIVE = "A+",
    A_NEGATIVE = "A-",
    B_POSITIVE = "B+",
    B_NEGATIVE = "B-",
    AB_POSITIVE = "AB+",
    AB_NEGATIVE = "AB-",
    O_POSITIVE = "O+",
    O_NEGATIVE = "O-",
}

export type StaffType = 'Teaching' | 'Non-Teaching';

export interface Staff {
    id: string;
    staffType: StaffType;

    // 1. Personal Details
    employeeId: string;
    firstName: string;
    lastName: string;
    gender: Gender;
    dateOfBirth: string; // YYYY-MM-DD
    nationality: string;
    maritalStatus: MaritalStatus;
    photographUrl: string;
    bloodGroup: BloodGroup;
    aadhaarNumber: string;
    
    // 2. Contact Information
    contactNumber: string;
    emailAddress: string;
    permanentAddress: string;
    currentAddress: string;
    
    // 3. Qualifications & Experience
    educationalQualification: Qualification;
    specialization: string;
    yearsOfExperience: number;
    previousExperience: string; // textarea for details
    
    // 4. Professional Details
    dateOfJoining: string; // YYYY-MM-DD
    department: Department;
    designation: Designation;
    employeeType: EmployeeType;
    status: EmploymentStatus;
    teacherLicenseNumber?: string; // Specific to Teaching staff

    // 5. Payroll Details
    salaryGrade?: string;
    basicSalary?: number | null;
    bankAccountNumber?: string;
    bankName?: string;
    panNumber?: string;

    // 6. Emergency Contact
    emergencyContactName: string;
    emergencyContactRelationship: string;
    emergencyContactNumber: string;
    medicalConditions?: string;
    
    assignedSubjects?: SubjectAssignment[];
}


// UPDATED: GradeDefinition now only contains an optional class teacher ID.
export interface GradeDefinition {
  classTeacherId?: string;
  subjects: SubjectDefinition[];
}

export interface FeePayments {
  admissionFeePaid: boolean;
  tuitionFeesPaid: Record<string, boolean>; // e.g., { "April": true, "May": false }
  examFeesPaid: {
    terminal1: boolean;
    terminal2: boolean;
    terminal3: boolean;
  };
}


export interface Student {
  id: string;
  studentId?: string;
  rollNo: number;
  name: string;
  grade: Grade;
  contact: string;
  photographUrl: string;

  // New detailed biodata
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
  address: string;
  aadhaarNumber: string; // Student's Aadhaar
  pen: string; // Permanent Education Number
  category: Category;
  religion: string;
  bloodGroup?: BloodGroup;
  cwsn?: 'Yes' | 'No'; // Children with Special Needs


  // Parent Information
  fatherName: string;
  fatherOccupation: string;
  fatherAadhaar: string;
  motherName: string;
  motherOccupation: string;
  motherAadhaar: string;

  // Guardian Information (optional)
  guardianName?: string;
  guardianRelationship?: string;
  
  // Academic & Health (optional)
  lastSchoolAttended?: string;
  healthConditions?: string;
  achievements?: string;

  // Fee Payments
  feePayments?: FeePayments;

  // Status for Transfer Management
  status: StudentStatus;
  transferDate?: string; // YYYY-MM-DD

  academicPerformance?: Exam[];
}

export interface OnlineAdmission {
    id: string;
    status: 'pending' | 'reviewed' | 'approved' | 'rejected';
    submissionDate: string; // ISO String
    
    // Form fields
    admissionGrade: Grade;
    academicYear: string;
    studentName: string;
    dateOfBirth: string;
    gender: Gender;
    studentAadhaar: string;
    fatherName: string;
    motherName: string;
    fatherOccupation: string;
    motherOccupation: string;
    parentAadhaar: string;
    guardianName: string;
    guardianRelationship: string;
    permanentAddress: string;
    presentAddress: string;
    contactNumber: string;
    penNumber: string;
    motherTongue: string;
    isCWSN: 'Yes' | 'No';
    bloodGroup?: BloodGroup;
    email: string;
    lastSchoolAttended: string;
    lastDivision: string;
    generalBehaviour: 'Mild' | 'Normal' | 'Hyperactive';
    siblingsInSchool: number;
    achievements: string;
    healthIssues: string;

    // Document URLs
    transferCertificateUrl?: string;
    birthCertificateUrl?: string;
    reportCardUrl?: string;
    paymentScreenshotUrl: string;
}

// --- NEW: Fee Structure Types ---
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

// --- Service Certificate Types ---
export interface ServiceCertificateData {
  refNo: string;
  lastWorkingDay: string;
  issueDate: string;
  reasonForLeaving: string;
  generalConduct: string;
  remarks: string;
}

export interface ServiceCertificateStaffDetails {
  staffId: string; // Formatted Employee ID: BMS-T-001
  staffNumericId: string; // Original staff numeric ID
  name: string;
  gender: Gender;
  designation: Designation;
  dateOfJoining: string;
  dateOfBirth: string;
}

export interface ServiceCertificateRecord {
  id: string;
  certData: ServiceCertificateData;
  staffDetails: ServiceCertificateStaffDetails;
}

// --- Transfer Certificate Types ---
export interface TcRecord {
  id: string;
  refNo: string;
  studentDbId: string;
  studentDisplayId: string;
  
  nameOfStudent: string;
  gender: Gender;
  fatherName: string;
  motherName: string;
  currentClass: Grade;
  rollNo: number;
  dateOfBirth: string; // YYYY-MM-DD
  dateOfBirthInWords: string;
  category: Category;
  religion: string;
  
  schoolDuesIfAny: string;
  qualifiedForPromotion: 'Yes' | 'No' | 'Not Applicable';
  dateOfLastAttendance?: string; // YYYY-MM-DD
  dateOfApplicationOfTc: string; // YYYY-MM-DD
  dateOfIssueOfTc: string; // YYYY-MM-DD
  reasonForLeaving: string;
  generalConduct: string;
  anyOtherRemarks: string;
}


// --- NEW: Inventory Management Types ---
export enum InventoryCategory {
    CLASSROOM = "Classroom Furniture & Fixtures",
    TEACHING_MATERIALS = "Teaching & Learning Materials",
    LAB_EQUIPMENT = "Laboratory Equipment",
    LIBRARY = "Library Resources",
    SPORTS = "Sports & Physical Education",
    OFFICE = "Office & Administration",
    AV_TECH = "Audio-Visual & Technology",
    CLEANING = "Cleaning & Maintenance",
    TRANSPORT = "Transport Assets",
}

export enum InventoryStatus {
    GOOD = "In Good Condition",
    NEEDS_REPAIR = "Needs Repair",
    NEEDS_REPLACEMENT = "Needs Replacement",
}

export interface InventoryItem {
    id: string;
    name: string;
    category: InventoryCategory;
    subCategory?: string;
    quantity: number;
    status: InventoryStatus;
    location: string;
    purchaseDate: string; // YYYY-MM-DD
    lastMaintenanceDate?: string; // YYYY-MM-DD
    notes?: string;
}

// --- NEW: Hostel Management Types ---
export enum HostelDormitory {
    GIRLS_I = "Girls I",
    GIRLS_II = "Girls II",
    BOYS_I = "Boys I",
}

export interface HostelResident {
    id: string; // Unique resident ID
    studentId: string; // Links to Student interface
    dormitory: HostelDormitory;
    dateOfJoining: string; // YYYY-MM-DD
}

export enum HostelStaffRole {
    WARDEN = "Warden",
    MESS_MANAGER = "Mess Manager",
    MESS_COOK = "Mess Cook",
    MESS_HELPER = "Mess Helper",
    SECURITY = "Security",
    CLEANING_STAFF = "Cleaning Staff",
}

export enum PaymentStatus {
    PAID = "Paid",
    PENDING = "Pending",
}

export interface HostelStaff {
    id: string;
    // Personal Details
    name: string;
    gender: Gender;
    dateOfBirth: string; // YYYY-MM-DD
    photographUrl: string;
    bloodGroup?: BloodGroup;
    aadhaarNumber?: string;

    // Contact
    contactNumber: string;
    emailAddress?: string;
    permanentAddress?: string;
    
    // Professional Details
    role: HostelStaffRole;
    dateOfJoining: string; // YYYY-MM-DD
    dutyShift?: string; // e.g., "Morning (6 AM - 2 PM)"
    assignedBlock?: HostelDormitory;
    
    // Qualifications & Expertise
    qualification?: Qualification;
    expertise?: string;

    // Payroll
    salary: number;
    paymentStatus: PaymentStatus;
    
    // Other
    attendancePercent: number;
    emergencyContactName?: string;
    emergencyContactRelationship?: string;
    emergencyContactNumber?: string;
}

// --- NEW: Hostel Inventory ---
export enum HostelInventoryCategory {
    FURNITURE_BEDDING_ELECTRICAL = "Furniture, Bedding, & Electrical",
    CLEANING_SUPPLIES = "Cleaning Supplies",
    KITCHEN_EQUIPMENT = "Kitchen Equipment",
    GROCERIES_FOOD = "Groceries & Food Items",
}

export enum StockLogType {
    IN = "IN",
    OUT = "OUT",
}

export interface HostelInventoryItem {
    id: string;
    name: string;
    category: HostelInventoryCategory;
    currentStock: number;
    reorderLevel: number; // Alert when stock drops to this level
    notes?: string;
}

export interface StockLog {
    id: string; 
    itemId: string;
    itemName: string;
    type: StockLogType;
    quantity: number;
    date: string; // ISO string
    notes?: string;
}

// --- NEW: Hostel Discipline ---
export enum IncidentSeverity {
    MINOR = "Minor",
    MAJOR = "Major",
    CRITICAL = "Critical",
}

export enum IncidentStatus {
    OPEN = "Open",
    RESOLVED = "Resolved",
    PENDING_ACTION = "Pending Action",
}

export interface HostelDisciplineEntry {
    id: string;
    studentId: string; // Links to Student
    residentId: string; // Links to HostelResident
    date: string; // YYYY-MM-DD
    category: string; // e.g., "Late return", "Property damage"
    description: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    actionTaken?: string;
    reportedBy: string; // name of user
    reportedById: string; // uid of user
}

// --- NEW: Staff Attendance Types ---
export enum AttendanceStatus {
    PRESENT = "Present",
    ABSENT = "Absent",
    LEAVE = "On Leave",
    LATE = "Late",
}

export interface StaffAttendanceRecord {
    [staffId: string]: AttendanceStatus;
}

// --- NEW: Student Attendance Types ---
export enum StudentAttendanceStatus {
    PRESENT = "Present",
    ABSENT = "Absent",
    LEAVE = "On Leave",
}

export interface StudentAttendanceRecord {
    [studentId: string]: StudentAttendanceStatus;
}

export interface DailyStudentAttendance {
    [grade: string]: StudentAttendanceRecord;
}

// --- NEW: Calendar Types ---
export enum CalendarEventType {
    HOLIDAY = "Holiday",
    EXAM = "Exam Schedule",
    EVENT = "School Event",
    MEETING = "Staff Meeting",
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD (Start Date)
    endDate?: string; // YYYY-MM-DD (Optional End Date)
    type: CalendarEventType;
    description?: string;
}

// --- NEW: Conduct & Discipline ---
export enum ConductEntryType {
    MERIT = "Merit",
    DEMERIT = "Demerit",
}

export interface ConductEntry {
    id: string;
    studentId: string;
    date: string; // YYYY-MM-DD
    type: ConductEntryType;
    category: string;
    description: string;
    recordedBy: string; // name of the user who recorded it
    recordedById: string; // UID of the user
}

// --- NEW: News Management ---
export interface NewsItem {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    content: string;
    imageUrls?: string[];
}

// --- NEW: Hostel Chore Roster Types ---
export enum Chore {
    GIRLS_I_CLEANING = "Girls I Cleaning Routine",
    GIRLS_II_CLEANING = "Girls II Cleaning Routine",
    BOYS_DORM_CLEANER = "Boys Dorm Cleaner",
    SHOE_POLISHER = "Shoe Polisher",
    TEACHERS_PLATE_WASHER = "Teacher's Plate Washer",
    DINING_HALL_SWEEPER = "Dining Hall Sweeper",
    BIO_WASTE_WATER_BOYS = "Bio Waste Water Boys",
    FOOD_SERVER = "Food Server Routine",
    VERANDA_CLEANING = "Veranda Cleaning Routine",
    TEA_SERVER = "Tea Server Routine",
    RAG_WASHER = "Rag Clothes Washer Routine",
    MOPPER = "Mopper Routine",
    ROAD_SWEEPER = "Road Sweeper Routine",
}

// UPDATED: ChoreRoster now supports daily assignments
export interface DailyChoreAssignment {
    [day: string]: string[]; // day: 'Monday', 'Tuesday', etc. Array of resident IDs.
}

export interface ChoreRoster {
    [chore: string]: DailyChoreAssignment;
}

// --- NEW: Routine Types ---
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