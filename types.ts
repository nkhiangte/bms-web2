
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
    createdBy: {
        uid: string;
        name: string;
    };
}

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

// FIX: Add the missing 'Notice' interface.
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

declare global {
    interface Window {
        Razorpay: any;
    }
}