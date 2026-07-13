
import { Grade, Gender, Category, GradeDefinition, Staff, MaritalStatus, Department, Designation, EmployeeType, BloodGroup, EmploymentStatus, StaffType, InventoryCategory, InventoryStatus, HostelDormitory, HostelStaffRole, HostelInventoryCategory, StockLogType, Qualification, CalendarEventType, IncidentSeverity, IncidentStatus, Chore, ConductGrade, DistinctionHolder, AdmissionSettings, SchoolCalendarEntry } from './types';

// TODO: Replace with your actual ImgBB API key. You can get one for free from https://api.imgbb.com/
export const IMGBB_API_KEY = 'd36909d21412322dc45661e15078de9f';

export const SCHOOL_CALENDAR_2026_2027: SchoolCalendarEntry[] = [
    // ── SCHOOL RE-OPENS ──
    {
        id: 'sc-pm-reopen',
        date: '2026-03-23',
        title: 'School Re-opens (Primary & Middle)',
        type: CalendarEventType.EVENT,
        levels: ['primary', 'middle'],
        description: 'Academic session 2026-2027 begins for Primary and Middle Schools.',
    },
    {
        id: 'sc-hs-reopen',
        date: '2026-04-01',
        title: 'High School Re-opens',
        type: CalendarEventType.EVENT,
        levels: ['high'],
        description: 'Academic session 2026-2027 begins for High Schools.',
    },

    // ── SHARED HOLIDAYS (all levels) ──
    {
        id: 'h-ram-navami',
        date: '2026-03-26',
        title: 'Ram Navami',
        type: CalendarEventType.HOLIDAY,
        levels: ['primary', 'middle'],
    },
    {
        id: 'h-mahavir',
        date: '2026-03-31',
        title: 'Mahavir Jayanti',
        type: CalendarEventType.HOLIDAY,
        levels: ['primary', 'middle'],
    },
    {
        id: 'h-good-friday',
        date: '2026-04-03',
        title: 'Good Friday',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
        description: 'Public holiday.',
    },
    {
        id: 'h-buddha',
        date: '2026-05-01',
        title: 'Buddha Purnima',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-bakrid',
        date: '2026-05-27',
        title: 'Id-ul-Zuha (Bakrid)',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-yma',
        date: '2026-06-15',
        title: 'YMA Day',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-muharram',
        date: '2026-06-26',
        title: 'Muharram',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-remna-ni',
        date: '2026-06-30',
        title: 'Remna Ni',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-mhip',
        date: '2026-07-06',
        title: 'MHIP Day',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-independence',
        date: '2026-08-15',
        title: 'Independence Day',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-milad',
        date: '2026-08-26',
        title: "Milad-un-Nabi (Prophet Mohammad's Birthday)",
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-janmashtami',
        date: '2026-09-04',
        title: 'Janmashtami (Vaishnava)',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-teachers',
        date: '2026-09-05',
        title: "Teachers' Day",
        type: CalendarEventType.EVENT,
        levels: ['all'],
        description: "Teachers' Day. Celebration to be held on 03.09.2026 (Thursday).",
    },
    {
        id: 'h-gandhi',
        date: '2026-10-02',
        title: "Mahatma Gandhi's Birthday",
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-dussehra',
        date: '2026-10-20',
        title: 'Dussehra',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-zirlaite',
        date: '2026-10-27',
        title: 'Zirlaite Ni (not a holiday)',
        type: CalendarEventType.EVENT,
        levels: ['all'],
        description: 'Zirlaite Ni — observed but not a school holiday.',
    },
    {
        id: 'h-diwali',
        date: '2026-11-08',
        title: 'Diwali (Deepawali)',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-guru-nanak',
        date: '2026-11-24',
        title: "Guru Nanak's Birthday",
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-missionary',
        date: '2027-01-11',
        title: 'Missionary Day',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-republic',
        date: '2027-01-26',
        title: 'Republic Day',
        type: CalendarEventType.HOLIDAY,
        levels: ['all'],
    },
    {
        id: 'h-state-day',
        date: '2027-02-20',
        title: 'State Day',
        type: CalendarEventType.HOLIDAY,
        levels: ['high'],
    },

    // ── PRIMARY SCHOOL SPORTS ──
    {
        id: 'sports-primary',
        date: '2026-04-08',
        endDate: '2026-04-10',
        title: 'Primary School Zonal Sports',
        type: CalendarEventType.EVENT,
        levels: ['primary'],
        description: 'Primary School Zonal Sports — 3 days.',
    },

    // ── MIDDLE SCHOOL SPORTS ──
    {
        id: 'sports-middle',
        date: '2026-04-15',
        endDate: '2026-04-17',
        title: 'Middle School Zonal Sports',
        type: CalendarEventType.EVENT,
        levels: ['middle'],
        description: 'Middle School Zonal Sports — 3 days.',
    },

    // ── HIGH SCHOOL SPORTS ──
    {
        id: 'sports-hs-district',
        date: '2026-09-29',
        endDate: '2026-10-01',
        title: 'District Secondary School Sports',
        type: CalendarEventType.EVENT,
        levels: ['high'],
        description: 'District Secondary School Sports — 3 days.',
    },
    {
        id: 'sports-hs-secondary',
        date: '2026-11-17',
        endDate: '2026-11-20',
        title: 'Secondary School Games',
        type: CalendarEventType.EVENT,
        levels: ['high'],
        description: 'Secondary School Games — 4 days.',
    },

    // ── HIGH SCHOOL TERM EXAMS ──
    {
        id: 'exam-hs-term1',
        date: '2026-07-07',
        endDate: '2026-07-17',
        title: 'HS First Term Exam & Result Publication',
        type: CalendarEventType.EXAM,
        levels: ['high'],
        description: 'High School First Term Examination and Publication of Results. (07 Jul – 17 Jul 2026)',
    },
    {
        id: 'exam-hs-term2',
        date: '2026-10-19',
        endDate: '2026-10-30',
        title: 'HS Second Term Exam & Result Publication',
        type: CalendarEventType.EXAM,
        levels: ['high'],
        description: 'High School Second Term Examination and Publication of Results. (19 Oct – 30 Oct 2026)',
    },
    {
        id: 'exam-hs-term3',
        date: '2027-01-18',
        endDate: '2027-01-29',
        title: 'HS Third Term Exam & Result Publication',
        type: CalendarEventType.EXAM,
        levels: ['high'],
        description: 'High School Third Term Examination and Publication of Results. (18 Jan – 29 Jan 2027)',
    },
    {
        id: 'hslc-exam',
        date: '2027-02-01',
        title: 'HSLC Examination (approx.)',
        type: CalendarEventType.EXAM,
        levels: ['high'],
        description: 'HSLC Examination may be conducted in the month of February 2027.',
    },

    // ── PRIMARY & MIDDLE SCHOOL TERM EXAMS (same dates) ──
    {
        id: 'exam-pm-term1',
        date: '2026-07-01',
        endDate: '2026-07-10',
        title: 'Primary/Middle First Term Exam & Result',
        type: CalendarEventType.EXAM,
        levels: ['primary', 'middle'],
        description: 'First Term Examination and Publication of Results for Primary and Middle Schools. (01 Jul – 10 Jul 2026)',
    },
    {
        id: 'exam-pm-term2',
        date: '2026-10-07',
        endDate: '2026-10-16',
        title: 'Primary/Middle Second Term Exam & Result',
        type: CalendarEventType.EXAM,
        levels: ['primary', 'middle'],
        description: 'Second Term Examination and Publication of Results for Primary and Middle Schools. (07 Oct – 16 Oct 2026)',
    },
    {
        id: 'exam-pm-term3',
        date: '2027-01-25',
        endDate: '2027-02-05',
        title: 'Primary/Middle Third Term Exam & Result',
        type: CalendarEventType.EXAM,
        levels: ['primary', 'middle'],
        description: 'Third Term Examination and Publication of Results for Primary and Middle Schools. (25 Jan – 05 Feb 2027)',
    },

    // ── HIGH SCHOOL TERM RE-OPENS ──
    {
        id: 'reopen-hs-2nd',
        date: '2026-07-21',
        title: 'HS School Re-opens for 2nd Term',
        type: CalendarEventType.EVENT,
        levels: ['high'],
    },
    {
        id: 'reopen-hs-3rd',
        date: '2026-11-03',
        title: 'HS School Re-opens for 3rd Term',
        type: CalendarEventType.EVENT,
        levels: ['high'],
    },

    // ── PRIMARY/MIDDLE TERM RE-OPENS ──
    {
        id: 'reopen-pm-2nd',
        date: '2026-07-13',
        title: 'Primary/Middle Re-opens for 2nd Term',
        type: CalendarEventType.EVENT,
        levels: ['primary', 'middle'],
    },
    {
        id: 'reopen-pm-3rd',
        date: '2026-10-21',
        title: 'Primary/Middle Re-opens for 3rd Term',
        type: CalendarEventType.EVENT,
        levels: ['primary', 'middle'],
    },

    // ── VACATIONS ──
    {
        id: 'vac-hs-1day-jul',
        date: '2026-07-20',
        title: 'Vacation (1 day) – High School',
        type: CalendarEventType.HOLIDAY,
        levels: ['high'],
    },
    {
        id: 'vac-pm-1day-oct',
        date: '2026-10-19',
        title: 'Vacation (1 day) – Primary/Middle',
        type: CalendarEventType.HOLIDAY,
        levels: ['primary', 'middle'],
    },
    {
        id: 'vac-hs-2nd-1day',
        date: '2026-11-02',
        title: 'Vacation (1 day) – High School',
        type: CalendarEventType.HOLIDAY,
        levels: ['high'],
    },
    {
        id: 'vac-winter-hs',
        date: '2026-12-21',
        endDate: '2027-01-05',
        title: 'Winter Vacation – High School (14 days)',
        type: CalendarEventType.HOLIDAY,
        levels: ['high'],
        description: 'High School Winter Vacation: 21 Dec 2026 – 05 Jan 2027 (14 days).',
    },
    {
        id: 'vac-winter-pm',
        date: '2026-12-21',
        endDate: '2027-01-04',
        title: 'Winter Vacation – Primary/Middle (13 days)',
        type: CalendarEventType.HOLIDAY,
        levels: ['primary', 'middle'],
        description: 'Primary/Middle Winter Vacation: 21 Dec 2026 – 04 Jan 2027 (13 days).',
    },
    {
        id: 'reopen-winter-all',
        date: '2027-01-06',
        title: 'School Re-opens after Winter Vacation',
        type: CalendarEventType.EVENT,
        levels: ['all'],
    },
    {
        id: 'vac-yearend-hs',
        date: '2027-02-01',
        endDate: '2027-02-23',
        title: 'Year End Vacation – High School (23 days)',
        type: CalendarEventType.HOLIDAY,
        levels: ['high'],
        description: 'High School Year End Vacation: 01 Feb – 23 Feb 2027 (23 days).',
    },
    {
        id: 'vac-yearend-pm',
        date: '2027-02-08',
        endDate: '2027-02-23',
        title: 'Year End Vacation – Primary/Middle (16 days)',
        type: CalendarEventType.HOLIDAY,
        levels: ['primary', 'middle'],
        description: 'Primary/Middle Year End Vacation: 08 Feb – 23 Feb 2027 (16 days).',
    },
    {
        id: 'reopen-2027',
        date: '2027-02-24',
        title: 'School Opens for 2027 Academic Session',
        type: CalendarEventType.EVENT,
        levels: ['all'],
        description: 'All schools reopen for the 2027-2028 Academic Session.',
    },
];

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
          { id: 'tui', name: 'Tuition Fee (Monthly)', amount: 1500, type: 'monthly' as const },
          { id: 'exam', name: 'Exam Fee (Per Term)', amount: 500, type: 'term' as const }
      ]
  },
  set2: {
      heads: [
          { id: 'tui', name: 'Tuition Fee (Monthly)', amount: 2000, type: 'monthly' as const },
          { id: 'exam', name: 'Exam Fee (Per Term)', amount: 600, type: 'term' as const }
      ]
  },
  set3: {
      heads: [
          { id: 'tui', name: 'Tuition Fee (Monthly)', amount: 2500, type: 'monthly' as const },
          { id: 'exam', name: 'Exam Fee (Per Term)', amount: 700, type: 'term' as const }
      ]
  },
};

export const FEE_SET_GRADES: Record<string, Grade[]> = {
    set1: [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II, Grade.III, Grade.IV],
    set2: [Grade.V, Grade.VI, Grade.VII, Grade.VIII],
    set3: [Grade.IX, Grade.X],
};

export const INVENTORY_CATEGORY_LIST: InventoryCategory[] = Object.values(InventoryCategory);
export const INVENTORY_STATUS_LIST: InventoryStatus[] = Object.values(InventoryStatus);
export const HOSTEL_DORMITORY_LIST: HostelDormitory[] = Object.values(HostelDormitory);
export const HOSTEL_STAFF_ROLE_LIST: HostelStaffRole[] = Object.values(HostelStaffRole);
export const HOSTEL_INVENTORY_CATEGORY_LIST: HostelInventoryCategory[] = Object.values(HostelInventoryCategory);
export const CALENDAR_EVENT_TYPE_LIST: CalendarEventType[] = Object.values(CalendarEventType);

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
    [Grade.X]: 0, 
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
    admissionFee: 0,
    notebookPrices: NOTEBOOK_SET_PRICES,
    items: [
        { id: 'diary', name: 'Diary', price: 100, mandatory: true, type: 'general' },
        { id: 'songbook', name: 'Song Book', price: 200, mandatory: true, type: 'general' },
        { id: 'idcard', name: 'ID Card', price: 150, mandatory: false, type: 'general' },
        ...UNIFORM_ITEMS.map((item, index) => {
            const priceBySize: Record<string, number> = {};
            UNIFORM_SIZES.forEach(size => {
                priceBySize[size] = item.price;
            });

            return {
                id: `uniform-${index}`,
                name: item.name,
                price: item.price,
                priceBySize: priceBySize,
                mandatory: false,
                type: 'uniform' as const
            };
        })
    ],
    feeStructure: {
        newStudent: {
            oneTime: [
                { id: 'reg', name: 'Registration', amount: 100 },
                { id: 'adm', name: 'Admission Fee', amount: 3000 },
                { id: 'med', name: 'Medical & Infirmary Fee', amount: 300 },
                { id: 'evt', name: 'Events, Sports & Celebration Fee', amount: 500 },
                { id: 'app', name: 'School App', amount: 100 }
            ],
            annual: [
                { id: 'lib', name: 'Library Fee', amount: 100 },
                { id: 'club', name: 'Activity & Hobby Club Fee', amount: 100 }
            ]
        },
        existingStudent: {
            oneTime: [
                { id: 'adm', name: 'Admission Fee', amount: 2500 },
                { id: 'med', name: 'Medical & Infirmary Fee', amount: 300 },
                { id: 'evt', name: 'Events, Sports & Celebration Fee', amount: 500 },
                { id: 'app', name: 'School App', amount: 100 },
                { id: 'reg', name: 'Registration Fee', amount: 100 }
            ],
            annual: [
                { id: 'lib', name: 'Library Fee', amount: 100 },
                { id: 'club', name: 'Activity & Hobby Club Fee', amount: 100 }
            ]
        }
    }
};

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

export const CHORE_LIST: Chore[] = Object.values(Chore);
export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const ROUTINE_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
export const PERIOD_LABELS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
export const PERIOD_TIMES = [
    { start: { h: 9, m: 20 }, end: { h: 10, m: 0 }, label: '09:20 - 10:00 AM' },
    { start: { h: 10, m: 0 }, end: { h: 10, m: 40 }, label: '10:00 - 10:40 AM' },
    { start: { h: 10, m: 40 }, end: { h: 11, m: 20 }, label: '10:40 - 11:20 AM' },
    { start: { h: 11, m: 20 }, end: { h: 12, m: 0 }, label: '11:20 - 12:00 PM' },
    { start: { h: 13, m: 0 }, end: { h: 13, m: 40 }, label: '01:00 - 01:40 PM' },
    { start: { h: 13, m: 40 }, end: { h: 14, m: 20 }, label: '01:40 - 02:20 PM' },
    { start: { h: 14, m: 20 }, end: { h: 15, m: 0 }, label: '02:20 - 03:00 PM' },
];

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
            { date: "10/11/2025", day: "Monday", morning: "Social Studies" },
            { date: "11/11/2025", day: "Tuesday", morning: "Mizo" },
            { date: "12/11/2025", day: "Wednesday", morning: "Science" },
        ]
    },
    {
        title: "II SEM EXAM ROUTINE For CL VI - VIII",
        exams: [
            { date: "06/11/2025", day: "Thursday", morning: "Mathematics" },
            { date: "07/11/2025", day: "Friday", morning: "English I", afternoon: "English II" },
            { date: "10/11/2025", day: "Monday", morning: "Social Studies" },
            { date: "11/11/2025", day: "Tuesday", morning: "Mizo" },
            { date: "12/11/2025", day: "Wednesday", morning: "Science" },
        ]
    },
    {
        title: "II SEM EXAM ROUTINE For CL CL III TO V",
        exams: [
            { date: "06/11/2025", day: "Thursday", morning: "Mathematics" },
            { date: "07/11/2025", day: "Friday", morning: "English I", afternoon: "English II" },
            { date: "10/11/2025", day: "Monday", morning: "Mizo", afternoon: "Hindi" },
            { date: "11/11/2025", day: "Tuesday", morning: "EVS", afternoon: "Drawing/Cursive" },
        ]
    }
];


export const TERMINAL_EXAMS: { id: 'terminal1' | 'terminal2' | 'terminal3'; name: string }[] = [
    { id: 'terminal1', name: 'I Terminal Examination' },
    { id: 'terminal2', name: 'II Terminal Examination' },
    { id: 'terminal3', name: 'III Terminal Examination' },
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

export const DISTINCTION_HOLDERS_BY_YEAR: Record<string, DistinctionHolder[]> = {
    '2023': [ { name: 'Esther Tingbiakmuani', parentage: 'D/o Z.L. Thanga', imageUrl: 'https://i.ibb.co/v4zsJtrq/esther.jpg' } ],
    '2020': [ { name: 'Manngaihsangi', parentage: 'D/o K. Lalthlamuana', imageUrl: 'https://i.ibb.co/4wrY5r7B/manngaih.jpg' } ],
    '2019': [ { name: 'C.L. Kimteii', parentage: 'D/o C. Lalthazuala', imageUrl: 'https://i.ibb.co/ks8prn9Z/cl-kim.jpg' }, { name: 'R. Lalrinmawii', parentage: 'D/o R. Lalfakzuala', imageUrl: 'https://i.ibb.co/1fYFM37C/r-rinmawii.jpg' } ],
};

export const SCHOOL_BANNER_URL = 'https://i.ibb.co/fY4hX8MZ/Sch-banner.png';
