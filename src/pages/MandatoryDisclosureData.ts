// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentEntry {
    label: string;
    fileUrl?: string;
}

export interface AcademicEntry {
    label: string;
    fileUrl?: string;
}

export interface EnrolmentRow {
    className: string;
    boys?: string;
    girls?: string;
    total?: string;
}

export interface BoardResultRow {
    year: string;
    appeared?: string;
    passed?: string;
    passPercent?: string;
    distinction?: string;
}

export interface FeeRow {
    head: string;
    amount?: string;
    remarks?: string;
}

export interface CommitteeRow {
    name: string;
    details?: string;
    fileUrl?: string;
}

export interface DisclosureData {
    lastUpdated: string;
    general: {
        schoolName: string;
        affiliationNo: string;
        schoolCode: string;
        udiseCode: string;
        address: string;
        town: string;
        district: string;
        state: string;
        pinCode: string;
        principalName: string;
        principalQualification: string;
        email: string;
        website: string;
        contactNumber: string;
        yearEstablished: string;
        schoolType: string;
        classesOffered: string;
        medium: string;
        boardingType: string;
        managementType: string;
        minorityStatus: string;
        sessionStart: string;
    };
    documents: DocumentEntry[];
    academics: AcademicEntry[];
    teachingStaff: {
        principal: string;
        totalTeachers: string;
        tgt: string;
        prt: string;
        teacherStudentRatio: string;
        specialEducator: string;
        counsellor: string;
    };
    nonTeachingStaff: {
        adminStaff: string;
        wardenMale: string;
        wardenFemale: string;
        supportStaff: string;
        security: string;
    };
    infrastructure: {
        campusArea: string;
        classrooms: string;
        labs: string;
        libraryBooks: string;
        internet: string;
        sports: string;
        hostelBoys: string;
        hostelGirls: string;
        girlsToilets: string;
        boysToilets: string;
        drinkingWater: string;
        electricity: string;
        ramp: string;
        cctv: string;
        buildingType: string;
    };
    enrolment: {
        rows: EnrolmentRow[];
        totalBoys?: string;
        totalGirls?: string;
        grandTotal: string;
    };
    boardResults: BoardResultRow[];
    feeStructure: FeeRow[];
    committees: CommitteeRow[];
}

// ─── Section metadata (used by Admin Panel) ──────────────────────────────────

export const DISCLOSURE_SECTIONS = [
    { id: 'general',         label: 'A. General Information' },
    { id: 'documents',       label: 'B. Documents & Information' },
    { id: 'academics',       label: 'C. Results & Academics' },
    { id: 'teachingStaff',   label: 'D. Staff (Teaching)' },
    { id: 'nonTeachingStaff',label: 'E. Staff (Non-Teaching)' },
    { id: 'infrastructure',  label: 'F. School Infrastructure' },
    { id: 'enrolment',       label: 'G. Student Enrolment' },
    { id: 'boardResults',    label: 'H. HSLC Board Results' },
    { id: 'feeStructure',    label: 'I. Fee Structure' },
    { id: 'committees',      label: 'J. Statutory Committees' },
];

// ─── Default / seed data ─────────────────────────────────────────────────────

export const DEFAULT_DISCLOSURE_DATA: DisclosureData = {
    lastUpdated: 'March 2026',
    general: {
        schoolName: 'Bethel Mission School',
        affiliationNo: '',
        schoolCode: '',
        udiseCode: '',
        address: 'Bethel Veng, Champhai',
        town: 'Champhai',
        district: 'Champhai',
        state: 'Mizoram',
        pinCode: '796321',
        principalName: '',
        principalQualification: '',
        email: 'info@bms04.com',
        website: 'www.bms04.com',
        contactNumber: '',
        yearEstablished: '1996',
        schoolType: 'Co-Educational',
        classesOffered: 'Nursery to Class X',
        medium: 'English',
        boardingType: 'Day School with Residential Boarding Facility',
        managementType: 'Private Unaided',
        minorityStatus: 'Yes – Christian Minority Institution',
        sessionStart: 'March / April (as per MBSE notification)',
    },
    documents: [
        { label: 'Copies of Affiliation / Recognition Letter and recent renewal, if any' },
        { label: 'Copies of Society / Trust / Company Registration / Renewal Certificate' },
        { label: 'Copy of No Objection Certificate (NOC) issued by the State Government' },
        { label: 'Copies of Recognition Certificate under RTE Act, 2009, and its renewal' },
        { label: 'Copy of valid Building Safety Certificate as per the National Building Code' },
        { label: 'Copy of valid Fire Safety Certificate issued by the competent authority' },
        { label: 'Copy of Self Certification submitted by the school for affiliation / upgradation' },
        { label: 'Copies of valid Water, Health and Sanitation Certificates' },
        { label: 'Land / Property Documents of the school' },
        { label: 'Latest Inspection / Monitoring Report by DEO / SDEO' },
    ],
    academics: [
        { label: 'Fee Structure of the School' },
        { label: 'Annual Academic Calendar (2026-2027)' },
        { label: 'List of School Management Committee (SMC) Members' },
        { label: 'List of Parent-Teacher Association (PTA) Members' },
        { label: 'Last Three-Year Result of Board Examination (HSLC – Class X)' },
        { label: 'Subject-wise Result Analysis (latest year)' },
        { label: 'Scholarship / Achievement Details' },
    ],
    teachingStaff: {
        principal: '1',
        totalTeachers: '',
        tgt: '',
        prt: '',
        teacherStudentRatio: '',
        specialEducator: 'NIL',
        counsellor: '',
    },
    nonTeachingStaff: {
        adminStaff: '',
        wardenMale: '2',
        wardenFemale: '1',
        supportStaff: '',
        security: '',
    },
    infrastructure: {
        campusArea: '',
        classrooms: '',
        labs: '',
        libraryBooks: '',
        internet: 'Yes',
        sports: 'Yes',
        hostelBoys: 'Yes – 70-seater Boys\' Hostel',
        hostelGirls: 'Yes – 70-seater Girls\' Hostel',
        girlsToilets: '',
        boysToilets: '',
        drinkingWater: '',
        electricity: 'Yes',
        ramp: '',
        cctv: '',
        buildingType: 'Permanent / Private Building',
    },
    enrolment: {
        rows: [
            { className: 'Nursery / LKG / UKG' },
            { className: 'Class I – II' },
            { className: 'Class III – V' },
            { className: 'Class VI – VIII' },
            { className: 'Class IX – X' },
        ],
        totalBoys: '',
        totalGirls: '',
        grandTotal: '',
    },
    boardResults: [
        { year: '2023–24' },
        { year: '2024–25' },
        { year: '2025–26' },
    ],
    feeStructure: [
        { head: 'Tuition Fee', remarks: 'Per annum' },
        { head: 'Admission / Registration Fee', remarks: 'One-time' },
        { head: 'Examination Fee' },
        { head: 'Development / Building Fund' },
        { head: 'Hostel Fee (Boarding)', remarks: 'If applicable' },
        { head: 'Mess / Catering Fee', remarks: 'Hostel boarders only' },
        { head: 'Library Fee' },
        { head: 'Sports / Activity Fee' },
        { head: 'Computer Lab Fee' },
        { head: 'Uniform (approximate)', remarks: 'As per school norms' },
    ],
    committees: [
        { name: 'School Management Committee (SMC)' },
        { name: 'Parent-Teacher Association (PTA)' },
        { name: 'Child Protection Committee (CPC)' },
        { name: 'Anti-Ragging / Anti-Bullying Committee' },
        { name: 'Internal Complaints Committee (ICC) – POSH Act' },
        { name: 'Grievance Redressal Committee' },
    ],
};
