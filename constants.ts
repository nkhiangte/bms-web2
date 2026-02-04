
import { Grade, Gender, Category, GradeDefinition, Staff, MaritalStatus, Department, Designation, EmployeeType, BloodGroup, EmploymentStatus, StaffType, InventoryCategory, InventoryStatus, HostelDormitory, HostelStaffRole, HostelInventoryCategory, StockLogType, Qualification, CalendarEventType, IncidentSeverity, IncidentStatus, Chore, ConductGrade, DistinctionHolder, AdmissionSettings } from './types';

// TODO: Replace with your actual ImgBB API key. You can get one for free from https://api.imgbb.com/
export const IMGBB_API_KEY = 'd36909d21412322dc45661e15078de9f';

export const QUALIFICATION_LIST: Qualification[] = Object.values(Qualification);
export const MARITAL_STATUS_LIST: MaritalStatus[] = Object.values(MaritalStatus);
export const DEPARTMENT_LIST: Department[] = Object.values(Department);
export const DESIGNATION_LIST: Designation[] = Object.values(Designation);
export const EMPLOYEE_TYPE_LIST: EmployeeType[] = Object.values(EmployeeType);
export const BLOOD_GROUP_LIST: BloodGroup[] = Object.values(BloodGroup);
export const EMPLOYMENT_STATUS_LIST: EmploymentStatus[] = Object.values(EmploymentStatus);
export const STAFF_TYPE_LIST: StaffType[] = [StaffType.TEACHING, StaffType.NON_TEACHING];

export const GRADES_LIST: Grade[] = Object.values(Grade);
export const GENDER_LIST: Gender[] = Object.values(Gender);
export const CATEGORY_LIST: Category[] = Object.values(Category);

export const MERIT_CATEGORIES = [
    "Helpfulness to Peers",
    "Leadership",
    "Good Citizenship",
    "Integrity / Honesty",
    "Exceptional Classroom Conduct",
    "Volunteering",
    "Academic Effort",
];

export const DEMERIT_CATEGORIES = [
    "Classroom Disruption",
    "Disrespect to Staff/Peers",
    "Non-compliance with Rules",
    "Tardiness / Punctuality Issue",
    "Uniform Infraction",
    "Academic Dishonesty",
    "Bullying / Harassment",
    "Property Damage",
];

export const GRADE_DEFINITIONS: Record<Grade, GradeDefinition> = {
    [Grade.NURSERY]: {
        subjects: [
            { name: 'ABC Oral', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'ABC Writing', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Numbers Oral', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Numbers Writing', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Rhyme', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Conversation', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Drawing', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'A for APPLE Oral', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'A for APPLE Writing', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'O-N-E Oral', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'O-N-E Writing', examFullMarks: 100, activityFullMarks: 0 },
        ],
    },
    [Grade.KINDERGARTEN]: {
        subjects: [
            { name: 'English I', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'English II', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Maths', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Writing', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Spellings', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Rhymes', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Conversation', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Drawing', examFullMarks: 100, activityFullMarks: 0 },
        ],
    },
    [Grade.I]: {
        subjects: [
            { name: 'English', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Mizo', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Mathematics', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'EVS', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Cursive', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' },
            { name: 'Drawing', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' },
        ],
    },
    [Grade.II]: {
        subjects: [
            { name: 'ENG-I', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'ENG-II', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'MIZO', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'MATH', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Spellings', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Hindi', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'EVS', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Cursive', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' },
            { name: 'Drawing', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' },
        ],
    },
    [Grade.III]: {
        subjects: [
            { name: 'English', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'English - II', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Hindi', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'EVS', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Cursive', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' },
            { name: 'Drawing', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' },
        ],
    },
    [Grade.IV]: {
        subjects: [
            { name: 'English', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'English - II', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Hindi', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'EVS', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Cursive', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' },
            { name: 'Drawing', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' },
        ],
    },
    [Grade.V]: {
        subjects: [
            { name: 'English', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'English - II', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Hindi', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'EVS', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Cursive', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' },
            { name: 'Drawing', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' },
        ],
    },
    [Grade.VI]: {
        subjects: [
            { name: 'English', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'English - II', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Science', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Social Studies', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Hindi', examFullMarks: 60, activityFullMarks: 40 },
        ],
    },
    [Grade.VII]: {
        subjects: [
            { name: 'English', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'English - II', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Science', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Social Studies', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Hindi', examFullMarks: 60, activityFullMarks: 40 },
        ],
    },
    [Grade.VIII]: {
        subjects: [
            { name: 'English', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'English - II', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Science', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Social Studies', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 },
            { name: 'Hindi', examFullMarks: 60, activityFullMarks: 40 },
        ],
    },
    [Grade.IX]: {
        subjects: [
            { name: 'English', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Mizo', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Mathematics', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Science', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Social Studies', examFullMarks: 100, activityFullMarks: 0 },
        ],
    },
    [Grade.X]: {
        subjects: [
            { name: 'English', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Mizo', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Mathematics', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Science', examFullMarks: 100, activityFullMarks: 0 },
            { name: 'Social Studies', examFullMarks: 100, activityFullMarks: 0 },
        ],
    },
};


export const academicMonths = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

export const DEFAULT_FEE_STRUCTURE = {
  set1: {
      heads: [
          { id: 'adm', name: 'Admission Fee', amount: 5000, type: 'one-time' },
          { id: 'tui', name: 'Tuition Fee (Monthly)', amount: 1500, type: 'monthly' },
          { id: 'exam', name: 'Exam Fee (Per Term)', amount: 500, type: 'term' }
      ]
  },
  set2: {
      heads: [
          { id: 'adm', name: 'Admission Fee', amount: 6000, type: 'one-time' },
          { id: 'tui', name: 'Tuition Fee (Monthly)', amount: 2000, type: 'monthly' },
          { id: 'exam', name: 'Exam Fee (Per Term)', amount: 600, type: 'term' }
      ]
  },
  set3: {
      heads: [
          { id: 'adm', name: 'Admission Fee', amount: 7000, type: 'one-time' },
          { id: 'tui', name: 'Tuition Fee (Monthly)', amount: 2500, type: 'monthly' },
          { id: 'exam', name: 'Exam Fee (Per Term)', amount: 700, type: 'term' }
      ]
  },
};

export const FEE_SET_GRADES: Record<string, Grade[]> = {
    set1: [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II],
    set2: [Grade.III, Grade.IV, Grade.V, Grade.VI],
    set3: [Grade.VII, Grade.VIII, Grade.IX, Grade.X],
};

// --- Admission Fee Detailed Structure (Default) ---
export const ADMISSION_FEE_STRUCTURE = {
    newStudent: {
        oneTime: [
            { id: 'reg', name: 'Registration', amount: 100, type: 'one-time' },
            { id: 'adm', name: 'Admission Fee', amount: 3000, type: 'one-time' },
            { id: 'sec', name: 'Refundable Security Deposit', amount: 1000, type: 'one-time' },
        ],
        annual: [
            { id: 'dev', name: 'Annual Development Fund', amount: 100, type: 'one-time' },
            { id: 'tui', name: 'Tuition Fee (for 1st month only)', amount: 1000, type: 'one-time' },
            { id: 'exam', name: 'Term Examination Fee', amount: 1000, type: 'one-time' },
            { id: 'lib', name: 'Library & Digital Resource Fee', amount: 100, type: 'one-time' },
            { id: 'med', name: 'Medical & Infirmary Fee', amount: 100, type: 'one-time' },
            { id: 'evt', name: 'Events, Sports & Celebration Fee', amount: 100, type: 'one-time' },
            { id: 'app', name: 'School App & Smart-Class Fee', amount: 150, type: 'one-time' },
            { id: 'act', name: 'Activity & Hobby Club Fee', amount: 100, type: 'one-time' },
        ]
    },
    existingStudent: {
        oneTime: [
            { id: 'reg', name: 'Registration', amount: 100, type: 'one-time' },
            { id: 'adm', name: 'Admission Fee', amount: 2000, type: 'one-time' },
            { id: 'sec', name: 'Refundable Security Deposit', amount: 1000, type: 'one-time' },
        ],
        annual: [
            { id: 'dev', name: 'Annual Development Fund', amount: 100, type: 'one-time' },
            { id: 'tui', name: 'Tuition Fee (for 1st month only)', amount: 1000, type: 'one-time' },
            { id: 'exam', name: 'Term Examination Fee', amount: 1000, type: 'one-time' },
            { id: 'lib', name: 'Library & Digital Resource Fee', amount: 100, type: 'one-time' },
            { id: 'med', name: 'Medical & Infirmary Fee', amount: 100, type: 'one-time' },
            { id: 'evt', name: 'Events, Sports & Celebration Fee', amount: 100, type: 'one-time' },
            { id: 'app', name: 'School App & Smart-Class Fee', amount: 150, type: 'one-time' },
            { id: 'act', name: 'Activity & Hobby Club Fee', amount: 100, type: 'one-time' },
        ]
    }
};

export const INVENTORY_CATEGORY_LIST: InventoryCategory[] = Object.values(InventoryCategory);
export const INVENTORY_STATUS_LIST: InventoryStatus[] = Object.values(InventoryStatus);
export const HOSTEL_DORMITORY_LIST: HostelDormitory[] = Object.values(HostelDormitory);
export const HOSTEL_STAFF_ROLE_LIST: HostelStaffRole[] = Object.values(HostelStaffRole);
export const HOSTEL_INVENTORY_CATEGORY_LIST: HostelInventoryCategory[] = Object.values(HostelInventoryCategory);
export const CALENDAR_EVENT_TYPE_LIST: CalendarEventType[] = Object.values(CalendarEventType);

// --- NEW: Admission Payment Items ---
export const ADMISSION_FEE_AMOUNT = 1000;
export const NOTEBOOK_SET_PRICES: Record<Grade, number> = {
    [Grade.NURSERY]: 500,
    [Grade.KINDERGARTEN]: 600,
    [Grade.I]: 700,
    [Grade.II]: 750,
    [Grade.III]: 800,
    [Grade.IV]: 850,
    [Grade.V]: 900,
    [Grade.VI]: 950,
    [Grade.VII]: 1000,
    [Grade.VIII]: 1050,
    [Grade.IX]: 1100,
    [Grade.X]: 0, // No new admissions
};

export const OTHER_ADMISSION_ITEMS = {
    'ID Card': 150,
    'Diary': 100,
    'Song Book': 200,
};

export const UNIFORM_SIZES = ['22', '24', '26', '28', '30', '32', '34', '36', '38', '40'];
export const UNIFORM_ITEMS = [
    { name: 'Shirt (Boy/Girl)', price: 400, sizes: UNIFORM_SIZES },
    { name: 'Pants (Boy)', price: 450, sizes: UNIFORM_SIZES },
    { name: 'Skirt (Girl)', price: 450, sizes: UNIFORM_SIZES },
    { name: 'Cardigan (Boy/Girl)', price: 600, sizes: UNIFORM_SIZES },
    { name: 'Pullover (Boy/Girl)', price: 550, sizes: UNIFORM_SIZES },
    { name: 'Sweater (Boy/Girl)', price: 700, sizes: UNIFORM_SIZES },
];

export const DEFAULT_ADMISSION_SETTINGS: AdmissionSettings = {
    academicYearLabel: '2026-27',
    admissionFee: 1000,
    notebookPrices: NOTEBOOK_SET_PRICES,
    items: [
        { id: 'diary', name: 'Diary', price: 100, mandatory: true, type: 'general' },
        { id: 'songbook', name: 'Song Book', price: 200, mandatory: true, type: 'general' },
        { id: 'idcard', name: 'ID Card', price: 150, mandatory: false, type: 'general' },
        ...UNIFORM_ITEMS.map((item, index) => {
            // Helper to generate default size prices for initialization
            const priceBySize: Record<string, number> = {};
            UNIFORM_SIZES.forEach(size => {
                priceBySize[size] = item.price; // Start with base price for all sizes
            });

            return {
                id: `uniform-${index}`,
                name: item.name,
                price: item.price,
                priceBySize: priceBySize, // Initialize with default map
                mandatory: false,
                type: 'uniform' as const
            };
        })
    ],
    feeStructure: ADMISSION_FEE_STRUCTURE
};

// --- NEW: Hostel Discipline ---
export const INCIDENT_SEVERITY_LIST: IncidentSeverity[] = Object.values(IncidentSeverity);
export const INCIDENT_STATUS_LIST: IncidentStatus[] = Object.values(IncidentStatus);
export const INCIDENT_CATEGORIES = [
    "Late Return",
    "Property Damage",
    "Misconduct with Staff/Peers",
    "Rule Violation (General)",
    "Unauthorized Absence",
    "Health & Safety Violation",
    "Other",
];

// --- NEW: Hostel Chores ---
export const CHORE_LIST: Chore[] = Object.values(Chore);
export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// --- NEW: Class Routine ---
export const ROUTINE_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
export const PERIOD_LABELS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
export const PERIOD_TIMES = [
    { start: { h: 9, m: 20 }, end: { h: 10, m: 0 }, label: '09:20 - 10:00 AM' },
    { start: { h: 10, m: 0 }, end: { h: 10, m: 40 }, label: '10:00 - 10:40 AM' },
    { start: { h: 10, m: 40 }, end: { h: 11, m: 20 }, label: '10:40 - 11:20 AM' },
    { start: { h: 11, m: 20 }, end: { h: 12, m: 0 }, label: '11:20 - 12:00 PM' },
    // Lunch Break: 12:00 PM - 1:00 PM
    { start: { h: 13, m: 0 }, end: { h: 13, m: 40 }, label: '01:00 - 01:40 PM' },
    { start: { h: 13, m: 40 }, end: { h: 14, m: 20 }, label: '01:40 - 02:20 PM' },
    { start: { h: 14, m: 20 }, end: { h: 15, m: 0 }, label: '02:20 - 03:00 PM' },
];

// --- NEW: Exam Routines ---
interface Exam {
    date: string;
    day: string;
    morning?: string;
    afternoon?: string;
}

interface Routine {
    title: string;
    exams: Exam[];
}

export const examRoutines: Routine[] = [
    {
        title: "II SEM EXAM ROUTINE For CL IX & X",
        exams: [
            { date: "06/11/2025", day: "Thursday", morning: "Mathematics" },
            { date: "07/11/2025", day: "Friday", morning: "English" },
            { date: "10/11/2025", day: "Monday", morning: "Social Science" },
            { date: "11/11/2025", day: "Tuesday", morning: "Mizo" },
            { date: "12/11/2025", day: "Wednesday", morning: "Science" },
        ]
    },
    {
        title: "II SEM EXAM ROUTINE For CL VI - VIII",
        exams: [
            { date: "06/11/2025", day: "Thursday", morning: "Mathematics" },
            { date: "07/11/2025", day: "Friday", morning: "English I", afternoon: "English II" },
            { date: "10/11/2025", day: "Monday", morning: "Social Science" },
            { date: "11/11/2025", day: "Tuesday", morning: "Mizo" },
            { date: "12/11/2025", day: "Wednesday", morning: "Science" },
        ]
    },
    {
        title: "II SEM EXAM ROUTINE For CL III TO V",
        exams: [
            { date: "06/11/2025", day: "Thursday", morning: "Mathematics" },
            { date: "07/11/2025", day: "Friday", morning: "English I", afternoon: "English II" },
            { date: "10/11/2025", day: "Monday", morning: "Mizo", afternoon: "Hindi" },
            { date: "11/11/2025", day: "Tuesday", morning: "EVS", afternoon: "Drawing/Cursive" },
        ]
    }
];


// FIX: Added explicit type to prevent TS from widening the 'id' property to a generic string.
export const TERMINAL_EXAMS: { id: 'terminal1' | 'terminal2' | 'terminal3'; name: string }[] = [
    { id: 'terminal1', name: 'First Terminal Examination' },
    { id: 'terminal2', name: 'Second Terminal Examination' },
    { id: 'terminal3', name: 'Third Terminal Examination' },
];

export const CONDUCT_GRADE_LIST: ConductGrade[] = ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement'];

export const OABC_GRADES = ['O', 'A', 'B', 'C'];

export const GRADES_WITH_NO_ACTIVITIES: Grade[] = [
    Grade.NURSERY,
    Grade.KINDERGARTEN,
    Grade.I,
    Grade.II,
    Grade.IX,
    Grade.X,
];

// Data for top rankers and distinction holders
export const DISTINCTION_HOLDERS_BY_YEAR: Record<string, DistinctionHolder[]> = {
    '2023': [ { name: 'Esther Tingbiakmuani', parentage: 'D/o Z.L. Thanga', imageUrl: 'https://i.ibb.co/v4zsJtrq/esther.jpg' } ],
    '2020': [ { name: 'Manngaihsangi', parentage: 'D/o K. Lalthlamuana', imageUrl: 'https://i.ibb.co/4wrY5r7B/manngaih.jpg' } ],
    '2019': [ { name: 'C.L. Kimteii', parentage: 'D/o C. Lalthazuala', imageUrl: 'https://i.ibb.co/ks8prn9Z/cl-kim.jpg' }, { name: 'R. Lalrinmawii', parentage: 'D/o R. Lalfakzuala', imageUrl: 'https://i.ibb.co/1fYFM37C/r-rinmawii.jpg' } ],
};

export const SCHOOL_BANNER_URL = 'https://i.ibb.co/fY4hX8MZ/Sch-banner.png';
