import {
  Student,
  Staff,
  OnlineAdmission,
  HostelResident,
  HostelStaff,
  HostelInventoryItem,
  InventoryItem,
  TcRecord,
  ServiceCertificateRecord,
  FeeStructure,
  Grade,
  GradeDefinition,
  Notice,
  NewsItem,
  CalendarEvent,
  User,
  StudentStatus,
  EmploymentStatus,
  Gender,
  InventoryStatus,
} from '@/types';
import { GRADES_LIST, academicMonths } from '@/constants';
import { formatStudentId, normalizeAcademicYear, getDuesSummary } from '@/utils';

export type SchoolDataScope = 'current_year' | 'all_years';

export interface SchoolAiSnapshotInput {
  students: Student[];
  staff: Staff[];
  onlineAdmissions?: OnlineAdmission[];
  hostelAdmissions?: OnlineAdmission[];
  hostelResidents?: HostelResident[];
  hostelStaff?: HostelStaff[];
  hostelInventory?: HostelInventoryItem[];
  inventory?: InventoryItem[];
  tcRecords?: TcRecord[];
  serviceCerts?: ServiceCertificateRecord[];
  feeStructure?: FeeStructure;
  gradeDefinitions?: Record<Grade, GradeDefinition>;
  academicYear: string;
  notices?: Notice[];
  news?: NewsItem[];
  calendarEvents?: CalendarEvent[];
  users?: User[];
}

export interface CompactGradeSummary {
  grade: string;
  totalActive: number;
  male: number;
  female: number;
  otherGender: number;
  withPen: number;
  withoutPen: number;
  withAadhaar: number;
  withoutAadhaar: number;
  cwsnYes: number;
  admissionFeePaid: number;
  admissionFeeUnpaid: number;
  withPendingDues: number;
  classTeacher: string;
}

export interface SchoolAiSnapshot {
  meta: {
    generatedAt: string;
    activeAcademicYear: string;
    scope: SchoolDataScope;
    totalStudentRecordsInDb: number;
    includedStudentRows: number;
  };
  aggregates: {
    studentsCurrentYearActive: {
      total: number;
      withPen: number;
      withoutPen: number;
      penCoveragePercent: number;
      withAadhaar: number;
      withoutAadhaar: number;
      gender: Record<string, number>;
      category: Record<string, number>;
      religion: Record<string, number>;
      cwsn: { yes: number; no: number };
      fees: {
        admissionFeePaid: number;
        admissionFeeUnpaid: number;
        studentsWithPendingDues: number;
        totalPendingDuesInr: number;
        tuitionPaidByMonth: Record<string, number>;
        examFeesPaid: { terminal1: number; terminal2: number; terminal3: number };
      };
      byGrade: CompactGradeSummary[];
    };
    studentsAllYearsOverall: {
      totalRecords: number;
      byStatus: Record<string, number>;
      activeAllYears: number;
      activeWithPenAllYears: number;
      activeWithoutPenAllYears: number;
      totalWithPenIncludingInactive: number;
      byAcademicYear: Array<{ academicYear: string; total: number; active: number; withPen: number; withoutPen: number }>;
    };
    admissions: {
      onlineTotal: number;
      onlineByStatus: Record<string, number>;
      onlineWithPenNumber: number;
      onlineByGrade: Record<string, number>;
      hostelTotal: number;
      hostelByStatus: Record<string, number>;
    };
    staff: {
      totalRecords: number;
      activeCount: number;
      inactiveOrResignedCount: number;
      activeTeaching: number;
      activeNonTeaching: number;
      byGenderActive: Record<string, number>;
      byDepartmentActive: Record<string, number>;
      byDesignationActive: Record<string, number>;
    };
    hostel: {
      totalResidents: number;
      activeResidents: number;
      byDormitory: Record<string, number>;
      hostelStaffCount: number;
      hostelInventoryCount: number;
      hostelInventoryNeedsAttention: number;
    };
    inventory: {
      totalItems: number;
      totalQuantity: number;
      byCategory: Record<string, number>;
      byStatus: Record<string, number>;
      itemsNeedingAttentionOrLowStock: number;
    };
    transfersAndCertificates: {
      tcRecordsCount: number;
      serviceCertificatesCount: number;
    };
    portalContentAndUsers: {
      newsCount: number;
      noticesCount: number;
      calendarEventsCount: number;
      usersByRole: Record<string, number>;
    };
  };
  records: {
    students: Array<{
      sid: string;
      name: string;
      grade: string;
      roll: number;
      ay: string;
      status: string;
      gender: string;
      category: string;
      religion: string;
      pen: string;
      hasPen: boolean;
      hasAadhaar: boolean;
      cwsn: string;
      father: string;
      contact: string;
      admPaid: boolean;
      duesInr: number;
      paidTuitionMonthsCount: number;
    }>;
    staff: Array<{
      empId: string;
      name: string;
      type: string;
      dept: string;
      desig: string;
      status: string;
      gender: string;
      qual: string;
      phone: string;
      assignedSubjectsCount: number;
    }>;
    onlineAdmissions: Array<{
      ref: string;
      name: string;
      grade: string;
      status: string;
      payStatus: string;
      pen: string;
      submitted: string;
    }>;
    hostelAdmissions: Array<{
      ref: string;
      name: string;
      grade: string;
      status: string;
      submitted: string;
    }>;
    hostelResidents: Array<{
      name: string;
      grade: string;
      dorm: string;
      joined: string;
    }>;
    inventory: Array<{
      name: string;
      category: string;
      qty: number;
      currentStock: number;
      reorderLevel: number;
      status: string;
      location: string;
    }>;
    tcRecords: Array<{
      refNo: string;
      name: string;
      grade: string;
      issueDate: string;
      reason: string;
    }>;
  };
}

const INVALID_ID_TOKENS = new Set([
  '',
  '-',
  '--',
  'n/a',
  'na',
  'nil',
  'none',
  'null',
  'undefined',
  '0',
  'pending',
  'not available',
  'not assigned',
]);

export function hasValidIdentifier(value?: string | null): boolean {
  if (typeof value !== 'string') return false;
  const cleaned = value.trim().toLowerCase();
  return cleaned.length > 0 && !INVALID_ID_TOKENS.has(cleaned);
}

export function getEffectiveStudentYear(student: Student): string {
  return student.academicYear ? normalizeAcademicYear(student.academicYear) : normalizeAcademicYear('2025-26');
}

export function isActiveStudent(student: Student): boolean {
  return !student.status || student.status === StudentStatus.ACTIVE;
}

function incrementCount(map: Record<string, number>, key?: string | null, fallback = 'Unspecified') {
  const k = key && String(key).trim() ? String(key).trim() : fallback;
  map[k] = (map[k] || 0) + 1;
}

export function buildSchoolAiSnapshot(
  input: SchoolAiSnapshotInput,
  scope: SchoolDataScope = 'current_year'
): SchoolAiSnapshot {
  const {
    students = [],
    staff = [],
    onlineAdmissions = [],
    hostelAdmissions = [],
    hostelResidents = [],
    hostelStaff = [],
    hostelInventory = [],
    inventory = [],
    tcRecords = [],
    serviceCerts = [],
    feeStructure,
    gradeDefinitions,
    academicYear,
    notices = [],
    news = [],
    calendarEvents = [],
    users = [],
  } = input;

  const targetNormalizedYear = normalizeAcademicYear(academicYear);

  const studentById = new Map<string, Student>();
  for (const s of students) {
    studentById.set(s.id, s);
  }

  const staffById = new Map<string, Staff>();
  for (const st of staff) {
    staffById.set(st.id, st);
  }

  // ── 1. Current Year Active Students Aggregates ──────────────────────────────
  const currentYearActiveStudents = students.filter(
    s => isActiveStudent(s) && getEffectiveStudentYear(s) === targetNormalizedYear
  );

  let cyWithPen = 0;
  let cyWithAadhaar = 0;
  let cyCwsnYes = 0;
  let cyAdmPaid = 0;
  let cyWithPendingDues = 0;
  let cyTotalPendingDuesInr = 0;
  let cyTerm1Paid = 0;
  let cyTerm2Paid = 0;
  let cyTerm3Paid = 0;

  const cyGender: Record<string, number> = {};
  const cyCategory: Record<string, number> = {};
  const cyReligion: Record<string, number> = {};
  const cyTuitionByMonth: Record<string, number> = academicMonths.reduce(
    (acc, m) => ({ ...acc, [m]: 0 }),
    {} as Record<string, number>
  );

  for (const s of currentYearActiveStudents) {
    if (hasValidIdentifier(s.pen)) cyWithPen++;
    if (hasValidIdentifier(s.aadhaarNumber)) cyWithAadhaar++;
    if (s.cwsn === 'Yes') cyCwsnYes++;

    incrementCount(cyGender, s.gender);
    incrementCount(cyCategory, s.category);
    incrementCount(cyReligion, s.religion);

    if (s.feePayments?.admissionFeePaid) cyAdmPaid++;
    if (s.feePayments?.examFeesPaid?.terminal1) cyTerm1Paid++;
    if (s.feePayments?.examFeesPaid?.terminal2) cyTerm2Paid++;
    if (s.feePayments?.examFeesPaid?.terminal3) cyTerm3Paid++;

    for (const m of academicMonths) {
      if (s.feePayments?.tuitionFeesPaid?.[m]) {
        cyTuitionByMonth[m] = (cyTuitionByMonth[m] || 0) + 1;
      }
    }

    if (feeStructure) {
      const dues = getDuesSummary(s, feeStructure);
      if (dues.total > 0) {
        cyWithPendingDues++;
        cyTotalPendingDuesInr += dues.total;
      }
    }
  }

  const byGrade: CompactGradeSummary[] = GRADES_LIST.map(grade => {
    const list = currentYearActiveStudents.filter(s => s.grade === grade);
    const male = list.filter(s => s.gender === Gender.MALE).length;
    const female = list.filter(s => s.gender === Gender.FEMALE).length;
    const withPen = list.filter(s => hasValidIdentifier(s.pen)).length;
    const withAadhaar = list.filter(s => hasValidIdentifier(s.aadhaarNumber)).length;
    const cwsnYes = list.filter(s => s.cwsn === 'Yes').length;
    const admissionFeePaid = list.filter(s => Boolean(s.feePayments?.admissionFeePaid)).length;
    const withPendingDues = feeStructure
      ? list.filter(s => getDuesSummary(s, feeStructure).total > 0).length
      : 0;

    const ctId = gradeDefinitions?.[grade]?.classTeacherId;
    const ctName = ctId ? `${staffById.get(ctId)?.firstName || ''} ${staffById.get(ctId)?.lastName || ''}`.trim() : '';

    return {
      grade,
      totalActive: list.length,
      male,
      female,
      otherGender: list.length - male - female,
      withPen,
      withoutPen: list.length - withPen,
      withAadhaar,
      withoutAadhaar: list.length - withAadhaar,
      cwsnYes,
      admissionFeePaid,
      admissionFeeUnpaid: list.length - admissionFeePaid,
      withPendingDues,
      classTeacher: ctName || 'Unassigned',
    };
  });

  // ── 2. All Years Overall Student Aggregates ─────────────────────────────────
  const byStatus: Record<string, number> = {};
  const yearMap = new Map<string, { total: number; active: number; withPen: number; withoutPen: number }>();

  let activeAllYears = 0;
  let activeWithPenAllYears = 0;
  let totalWithPenIncludingInactive = 0;

  for (const s of students) {
    const stLabel = s.status || StudentStatus.ACTIVE;
    incrementCount(byStatus, stLabel);

    const active = isActiveStudent(s);
    const validPen = hasValidIdentifier(s.pen);
    if (validPen) totalWithPenIncludingInactive++;
    if (active) {
      activeAllYears++;
      if (validPen) activeWithPenAllYears++;
    }

    const ay = getEffectiveStudentYear(s);
    const cur = yearMap.get(ay) || { total: 0, active: 0, withPen: 0, withoutPen: 0 };
    cur.total++;
    if (active) {
      cur.active++;
      if (validPen) cur.withPen++;
      else cur.withoutPen++;
    }
    yearMap.set(ay, cur);
  }

  // ── 3. Admissions, Staff, Hostel, Inventory, TC, Content ───────────────────
  const onlineByStatus: Record<string, number> = {};
  const onlineByGrade: Record<string, number> = {};
  let onlineWithPenNumber = 0;
  for (const adm of onlineAdmissions) {
    incrementCount(onlineByStatus, adm.status, 'pending');
    incrementCount(onlineByGrade, adm.admissionGrade);
    if (hasValidIdentifier(adm.penNumber)) onlineWithPenNumber++;
  }

  const hostelAdmByStatus: Record<string, number> = {};
  for (const hadm of hostelAdmissions) {
    incrementCount(hostelAdmByStatus, hadm.status, 'pending');
  }

  const activeStaffList = staff.filter(st => !st.status || st.status === EmploymentStatus.ACTIVE);
  const byGenderActive: Record<string, number> = {};
  const byDepartmentActive: Record<string, number> = {};
  const byDesignationActive: Record<string, number> = {};
  let activeTeaching = 0;
  let activeNonTeaching = 0;

  for (const st of activeStaffList) {
    if (st.staffType === 'Teaching') activeTeaching++;
    else activeNonTeaching++;
    incrementCount(byGenderActive, st.gender);
    incrementCount(byDepartmentActive, st.department);
    incrementCount(byDesignationActive, st.designation);
  }

  const byDormitory: Record<string, number> = {};
  let activeResidents = 0;
  for (const r of hostelResidents) {
    const linked = studentById.get(r.studentId);
    if (!linked || isActiveStudent(linked)) {
      activeResidents++;
    }
    incrementCount(byDormitory, r.dormitory);
  }

  const hostelInventoryNeedsAttention = hostelInventory.filter(
    item =>
      item.currentStock <= item.reorderLevel ||
      item.status === InventoryStatus.NEEDS_REPAIR ||
      item.status === InventoryStatus.NEEDS_REPLACEMENT
  ).length;

  const invByCategory: Record<string, number> = {};
  const invByStatus: Record<string, number> = {};
  let totalInvQty = 0;
  let itemsNeedingAttentionOrLowStock = 0;
  for (const item of inventory) {
    totalInvQty += Number(item.quantity) || 0;
    incrementCount(invByCategory, item.category);
    incrementCount(invByStatus, item.status);
    if (
      item.status === InventoryStatus.NEEDS_REPAIR ||
      item.status === InventoryStatus.NEEDS_REPLACEMENT ||
      (typeof item.currentStock === 'number' && typeof item.reorderLevel === 'number' && item.currentStock <= item.reorderLevel) ||
      Number(item.quantity) <= 1
    ) {
      itemsNeedingAttentionOrLowStock++;
    }
  }

  const usersByRole: Record<string, number> = {};
  for (const u of users) {
    incrementCount(usersByRole, u.role);
  }

  // ── 4. Compact Row Selection based on Scope ─────────────────────────────────
  const scopedStudents =
    scope === 'all_years'
      ? students
      : students.filter(s => getEffectiveStudentYear(s) === targetNormalizedYear);

  const compactStudents = scopedStudents.map(s => {
    const duesInr = feeStructure && isActiveStudent(s) ? getDuesSummary(s, feeStructure).total : 0;
    const paidMonthsCount = academicMonths.filter(m => Boolean(s.feePayments?.tuitionFeesPaid?.[m])).length;
    return {
      sid: formatStudentId(s, s.academicYear || academicYear),
      name: s.name || '',
      grade: s.grade || '',
      roll: Number(s.rollNo) || 0,
      ay: getEffectiveStudentYear(s),
      status: s.status || StudentStatus.ACTIVE,
      gender: s.gender || '',
      category: s.category || '',
      religion: s.religion || '',
      pen: (s.pen || '').trim(),
      hasPen: hasValidIdentifier(s.pen),
      hasAadhaar: hasValidIdentifier(s.aadhaarNumber),
      cwsn: s.cwsn || 'No',
      father: s.fatherName || '',
      contact: s.contact || '',
      admPaid: Boolean(s.feePayments?.admissionFeePaid),
      duesInr,
      paidTuitionMonthsCount: paidMonthsCount,
    };
  });

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      activeAcademicYear: targetNormalizedYear,
      scope,
      totalStudentRecordsInDb: students.length,
      includedStudentRows: compactStudents.length,
    },
    aggregates: {
      studentsCurrentYearActive: {
        total: currentYearActiveStudents.length,
        withPen: cyWithPen,
        withoutPen: currentYearActiveStudents.length - cyWithPen,
        penCoveragePercent:
          currentYearActiveStudents.length > 0
            ? Math.round((cyWithPen / currentYearActiveStudents.length) * 1000) / 10
            : 0,
        withAadhaar: cyWithAadhaar,
        withoutAadhaar: currentYearActiveStudents.length - cyWithAadhaar,
        gender: cyGender,
        category: cyCategory,
        religion: cyReligion,
        cwsn: { yes: cyCwsnYes, no: currentYearActiveStudents.length - cyCwsnYes },
        fees: {
          admissionFeePaid: cyAdmPaid,
          admissionFeeUnpaid: currentYearActiveStudents.length - cyAdmPaid,
          studentsWithPendingDues: cyWithPendingDues,
          totalPendingDuesInr: cyTotalPendingDuesInr,
          tuitionPaidByMonth: cyTuitionByMonth,
          examFeesPaid: { terminal1: cyTerm1Paid, terminal2: cyTerm2Paid, terminal3: cyTerm3Paid },
        },
        byGrade,
      },
      studentsAllYearsOverall: {
        totalRecords: students.length,
        byStatus,
        activeAllYears,
        activeWithPenAllYears,
        activeWithoutPenAllYears: activeAllYears - activeWithPenAllYears,
        totalWithPenIncludingInactive,
        byAcademicYear: Array.from(yearMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([ay, counts]) => ({ academicYear: ay, ...counts })),
      },
      admissions: {
        onlineTotal: onlineAdmissions.length,
        onlineByStatus,
        onlineWithPenNumber,
        onlineByGrade,
        hostelTotal: hostelAdmissions.length,
        hostelByStatus: hostelAdmByStatus,
      },
      staff: {
        totalRecords: staff.length,
        activeCount: activeStaffList.length,
        inactiveOrResignedCount: staff.length - activeStaffList.length,
        activeTeaching,
        activeNonTeaching,
        byGenderActive,
        byDepartmentActive,
        byDesignationActive,
      },
      hostel: {
        totalResidents: hostelResidents.length,
        activeResidents,
        byDormitory,
        hostelStaffCount: hostelStaff.length,
        hostelInventoryCount: hostelInventory.length,
        hostelInventoryNeedsAttention,
      },
      inventory: {
        totalItems: inventory.length,
        totalQuantity: totalInvQty,
        byCategory: invByCategory,
        byStatus: invByStatus,
        itemsNeedingAttentionOrLowStock,
      },
      transfersAndCertificates: {
        tcRecordsCount: tcRecords.length,
        serviceCertificatesCount: serviceCerts.length,
      },
      portalContentAndUsers: {
        newsCount: news.length,
        noticesCount: notices.length,
        calendarEventsCount: calendarEvents.length,
        usersByRole,
      },
    },
    records: {
      students: compactStudents,
      staff: staff.map(st => ({
        empId: st.employeeId || '',
        name: `${st.firstName || ''} ${st.lastName || ''}`.trim(),
        type: st.staffType || '',
        dept: st.department || '',
        desig: st.designation || '',
        status: st.status || EmploymentStatus.ACTIVE,
        gender: st.gender || '',
        qual: st.educationalQualification || '',
        phone: st.contactNumber || '',
        assignedSubjectsCount: st.assignedSubjects?.length || 0,
      })),
      onlineAdmissions: onlineAdmissions.map(a => ({
        ref: a.temporaryStudentId || a.id,
        name: a.studentName || '',
        grade: a.admissionGrade || '',
        status: a.status || 'pending',
        payStatus: a.paymentStatus || 'pending',
        pen: (a.penNumber || '').trim(),
        submitted: a.submissionDate || '',
      })),
      hostelAdmissions: hostelAdmissions.map(a => ({
        ref: a.temporaryStudentId || a.id,
        name: a.studentName || '',
        grade: a.admissionGrade || '',
        status: a.status || 'pending',
        submitted: a.submissionDate || '',
      })),
      hostelResidents: hostelResidents.map(r => {
        const st = studentById.get(r.studentId);
        return {
          name: st?.name || r.studentId,
          grade: st?.grade || '',
          dorm: r.dormitory || '',
          joined: r.dateOfJoining || '',
        };
      }),
      inventory: inventory.map(i => ({
        name: i.name || '',
        category: i.category || '',
        qty: Number(i.quantity) || 0,
        currentStock: Number(i.currentStock) || 0,
        reorderLevel: Number(i.reorderLevel) || 0,
        status: i.status || '',
        location: i.location || '',
      })),
      tcRecords: tcRecords.map(tc => ({
        refNo: tc.refNo || '',
        name: tc.nameOfStudent || '',
        grade: tc.currentClass || '',
        issueDate: tc.dateOfIssueOfTc || '',
        reason: tc.reasonForLeaving || '',
      })),
    },
  };
}
