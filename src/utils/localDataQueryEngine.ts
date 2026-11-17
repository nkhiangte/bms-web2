import { GRADES_LIST } from '@/constants';
import { StudentStatus } from '@/types';
import { SchoolAiSnapshot, SchoolDataScope } from '@/utils/aiDataSnapshot';

export interface LocalQueryResponse {
  answer: string;
  metrics: Array<{ label: string; value: string; note?: string }>;
  table: {
    title?: string;
    columns: string[];
    rows: string[][];
  } | null;
  followUps: string[];
  engine: 'local';
}

const GRADE_ALIASES: Array<{ grade: string; patterns: RegExp[] }> = [
  { grade: 'Nursery', patterns: [/\bnursery\b/i] },
  { grade: 'Kindergarten', patterns: [/\bkindergarten\b/i, /\bkg\b/i] },
  { grade: 'Class I', patterns: [/\bclass[\s-]*i\b(?![ivx])/i, /\bclass[\s-]*1\b/i, /\bgrade[\s-]*1\b/i] },
  { grade: 'Class II', patterns: [/\bclass[\s-]*ii\b(?!i)/i, /\bclass[\s-]*2\b/i, /\bgrade[\s-]*2\b/i] },
  { grade: 'Class III', patterns: [/\bclass[\s-]*iii\b/i, /\bclass[\s-]*3\b/i, /\bgrade[\s-]*3\b/i] },
  { grade: 'Class IV', patterns: [/\bclass[\s-]*iv\b/i, /\bclass[\s-]*4\b/i, /\bgrade[\s-]*4\b/i] },
  { grade: 'Class V', patterns: [/\bclass[\s-]*v\b(?![i])/i, /\bclass[\s-]*5\b/i, /\bgrade[\s-]*5\b/i] },
  { grade: 'Class VI', patterns: [/\bclass[\s-]*vi\b(?!i)/i, /\bclass[\s-]*6\b/i, /\bgrade[\s-]*6\b/i] },
  { grade: 'Class VII', patterns: [/\bclass[\s-]*vii\b(?!i)/i, /\bclass[\s-]*7\b/i, /\bgrade[\s-]*7\b/i] },
  { grade: 'Class VIII', patterns: [/\bclass[\s-]*viii\b/i, /\bclass[\s-]*8\b/i, /\bgrade[\s-]*8\b/i] },
  { grade: 'Class IX', patterns: [/\bclass[\s-]*ix\b/i, /\bclass[\s-]*9\b/i, /\bgrade[\s-]*9\b/i] },
  { grade: 'Class X', patterns: [/\bclass[\s-]*x\b/i, /\bclass[\s-]*10\b/i, /\bgrade[\s-]*10\b/i] },
];

function detectGradeFilter(q: string): string | null {
  for (const item of GRADE_ALIASES) {
    if (item.patterns.some(rx => rx.test(q))) {
      return item.grade;
    }
  }
  return null;
}

function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function queryLocalSchoolSnapshot(
  rawQuestion: string,
  snapshot: SchoolAiSnapshot,
  scope: SchoolDataScope
): LocalQueryResponse {
  const q = rawQuestion.trim();
  const ql = q.toLowerCase();
  const cy = snapshot.aggregates.studentsCurrentYearActive;
  const all = snapshot.aggregates.studentsAllYearsOverall;
  const yearLabel = snapshot.meta.activeAcademicYear;
  const targetGrade = detectGradeFilter(q);

  const wantsList = /\b(list|show names|who|which students|names|students without|students missing|students with|find|search|roster|details)\b/i.test(q);
  const wantsMissing = /\b(missing|without|no |don't have|do not have|not assigned|empty|blank|pending|unpaid)\b/i.test(q);

  // Scoped active students array from snapshot.records.students
  const activeScopedStudents = snapshot.records.students.filter(
    s => (!s.status || s.status === StudentStatus.ACTIVE) && (!targetGrade || s.grade === targetGrade)
  );

  // ── 1. PEN Number Queries ─────────────────────────────────────────────────
  if (/\bpen\b/i.test(ql) || /permanent education/i.test(ql)) {
    const scopeText =
      scope === 'all_years'
        ? `All Academic Sessions (${all.activeAllYears} active students; ${all.activeWithPenAllYears} with PEN)`
        : `Session ${yearLabel} Active Students`;

    if (targetGrade) {
      const gRow = cy.byGrade.find(g => g.grade === targetGrade);
      const matchingStudents = wantsMissing
        ? activeScopedStudents.filter(s => !s.hasPen)
        : wantsList
          ? activeScopedStudents.filter(s => s.hasPen)
          : activeScopedStudents;

      const total = scope === 'all_years' ? activeScopedStudents.length : (gRow?.totalActive ?? activeScopedStudents.length);
      const withPen = scope === 'all_years' ? activeScopedStudents.filter(s => s.hasPen).length : (gRow?.withPen ?? 0);
      const withoutPen = total - withPen;
      const pct = total > 0 ? Math.round((withPen / total) * 1000) / 10 : 0;

      return {
        answer: `In **${targetGrade}** (${scopeText}), **${withPen} out of ${total}** active students (${pct}%) have a PEN number, and **${withoutPen}** ${withoutPen === 1 ? 'student is' : 'students are'} missing a PEN.`,
        metrics: [
          { label: `${targetGrade} Active`, value: String(total) },
          { label: 'With PEN', value: String(withPen), note: `${pct}% coverage` },
          { label: 'Missing PEN', value: String(withoutPen) },
        ],
        table: {
          title: wantsMissing
            ? `${targetGrade} Students Missing PEN`
            : `${targetGrade} Student PEN Status`,
          columns: ['Student ID', 'Roll', 'Name', 'Gender', 'PEN Number', 'Father Name', 'Contact'],
          rows: matchingStudents
            .sort((a, b) => a.roll - b.roll)
            .slice(0, 120)
            .map(s => [s.sid, String(s.roll || '-'), s.name, s.gender, s.hasPen ? s.pen : 'Missing', s.father, s.contact]),
        },
        followUps: [
          `List ${targetGrade} students missing PEN`,
          'Show PEN coverage across all classes',
          `Check ${targetGrade} Aadhaar coverage`,
        ],
        engine: 'local',
      };
    }

    if (wantsList && wantsMissing) {
      const missingList = activeScopedStudents
        .filter(s => !s.hasPen)
        .sort((a, b) => {
          const gi = GRADES_LIST.indexOf(a.grade as any) - GRADES_LIST.indexOf(b.grade as any);
          return gi !== 0 ? gi : a.roll - b.roll;
        });

      return {
        answer: `Found **${missingList.length}** active students without a valid PEN number (${scopeText}).${missingList.length > 150 ? ' Showing the first 150 rows below; use CSV export or filter by class.' : ''}`,
        metrics: [
          { label: 'Missing PEN', value: String(missingList.length) },
          { label: 'With PEN', value: String(scope === 'all_years' ? all.activeWithPenAllYears : cy.withPen) },
          { label: 'Active Total', value: String(scope === 'all_years' ? all.activeAllYears : cy.total) },
        ],
        table: {
          title: 'Active Students Missing PEN Number',
          columns: ['Class', 'Roll', 'Student ID', 'Name', 'Gender', 'Father Name', 'Contact'],
          rows: missingList
            .slice(0, 150)
            .map(s => [s.grade, String(s.roll || '-'), s.sid, s.name, s.gender, s.father, s.contact]),
        },
        followUps: [
          'Show PEN count by class',
          'Which students have pending admission fees?',
          'How many students have Aadhaar numbers?',
        ],
        engine: 'local',
      };
    }

    const classRows =
      scope === 'all_years'
        ? GRADES_LIST.map(grade => {
            const list = snapshot.records.students.filter(
              s => s.grade === grade && (!s.status || s.status === StudentStatus.ACTIVE)
            );
            const wp = list.filter(s => s.hasPen).length;
            const wo = list.length - wp;
            const pct = list.length > 0 ? `${Math.round((wp / list.length) * 1000) / 10}%` : '0%';
            return [grade, String(list.length), String(wp), String(wo), pct];
          })
        : cy.byGrade.map(g => {
            const pct = g.totalActive > 0 ? `${Math.round((g.withPen / g.totalActive) * 1000) / 10}%` : '0%';
            return [g.grade, String(g.totalActive), String(g.withPen), String(g.withoutPen), pct];
          });

    const totalActive = scope === 'all_years' ? all.activeAllYears : cy.total;
    const totalWithPen = scope === 'all_years' ? all.activeWithPenAllYears : cy.withPen;
    const totalWithoutPen = totalActive - totalWithPen;
    const totalPct = totalActive > 0 ? Math.round((totalWithPen / totalActive) * 1000) / 10 : 0;

    return {
      answer: `Across **${scopeText}**, there are **${totalActive}** active students: **${totalWithPen}** students (${totalPct}%) have a PEN number and **${totalWithoutPen}** students do not have a PEN assigned yet.${
        scope === 'current_year' && all.totalWithPenIncludingInactive !== cy.withPen
          ? ` (Including all sessions and TC/dropped records, ${all.totalWithPenIncludingInactive} total records have a PEN.)`
          : ''
      }`,
      metrics: [
        { label: 'Active Students', value: String(totalActive), note: scope === 'all_years' ? 'All sessions' : `Session ${yearLabel}` },
        { label: 'With PEN', value: String(totalWithPen), note: `${totalPct}% coverage` },
        { label: 'Missing PEN', value: String(totalWithoutPen) },
        { label: 'Online Admission PENs', value: String(snapshot.aggregates.admissions.onlineWithPenNumber) },
      ],
      table: {
        title: `Class-wise PEN Breakdown (${scope === 'all_years' ? 'All Sessions' : `Session ${yearLabel}`})`,
        columns: ['Class', 'Active Students', 'With PEN', 'Missing PEN', 'Coverage %'],
        rows: classRows,
      },
      followUps: [
        'List all active students missing PEN',
        'List Class IX students without PEN',
        'How many students have Aadhaar numbers?',
      ],
      engine: 'local',
    };
  }

  // ── 2. Aadhaar Queries ────────────────────────────────────────────────────
  if (/aadhaar|aadhar/i.test(ql)) {
    if (wantsList && wantsMissing) {
      const missing = activeScopedStudents.filter(s => !s.hasAadhaar);
      return {
        answer: `Found **${missing.length}** active students without an Aadhaar number in ${targetGrade || `Session ${yearLabel}`}.`,
        metrics: [
          { label: 'Missing Aadhaar', value: String(missing.length) },
          { label: 'With Aadhaar', value: String(cy.withAadhaar) },
        ],
        table: {
          title: 'Active Students Missing Aadhaar',
          columns: ['Class', 'Roll', 'Student ID', 'Name', 'Father Name', 'Contact'],
          rows: missing.slice(0, 150).map(s => [s.grade, String(s.roll || '-'), s.sid, s.name, s.father, s.contact]),
        },
        followUps: [
          'Show class-wise PEN coverage',
          'Class-wise enrollment breakdown',
          'List students missing PEN',
        ],
        engine: 'local',
      };
    }

    const pct = cy.total > 0 ? Math.round((cy.withAadhaar / cy.total) * 1000) / 10 : 0;
    return {
      answer: `For **Session ${yearLabel}**, **${cy.withAadhaar} out of ${cy.total}** active students (${pct}%) have an Aadhaar number recorded, while **${cy.withoutAadhaar}** are missing Aadhaar.`,
      metrics: [
        { label: 'Active Students', value: String(cy.total) },
        { label: 'With Aadhaar', value: String(cy.withAadhaar), note: `${pct}%` },
        { label: 'Missing Aadhaar', value: String(cy.withoutAadhaar) },
      ],
      table: {
        title: `Class-wise Aadhaar Coverage (Session ${yearLabel})`,
        columns: ['Class', 'Active', 'With Aadhaar', 'Missing Aadhaar'],
        rows: cy.byGrade.map(g => [g.grade, String(g.totalActive), String(g.withAadhaar), String(g.withoutAadhaar)]),
      },
      followUps: [
        'List students missing Aadhaar',
        'How many students have PEN numbers?',
        'Show class-wise student strength',
      ],
      engine: 'local',
    };
  }

  // ── 3. Fee & Pending Dues Queries ─────────────────────────────────────────
  if (/\b(fee|fees|dues|unpaid|tuition|admission fee|payment)\b/i.test(ql)) {
    const f = cy.fees;
    if (wantsList) {
      const duesList = activeScopedStudents
        .filter(s => (ql.includes('admission') ? !s.admPaid : s.duesInr > 0))
        .sort((a, b) => b.duesInr - a.duesInr);

      return {
        answer: `Found **${duesList.length}** active students ${ql.includes('admission') ? 'with unpaid admission fee' : 'with pending fee dues'} in ${targetGrade || `Session ${yearLabel}`}. Total pending amount across Session ${yearLabel} is **${formatInr(f.totalPendingDuesInr)}**.`,
        metrics: [
          { label: 'Students with Dues', value: String(f.studentsWithPendingDues) },
          { label: 'Total Pending Dues', value: formatInr(f.totalPendingDuesInr) },
          { label: 'Admission Paid', value: String(f.admissionFeePaid) },
          { label: 'Admission Unpaid', value: String(f.admissionFeeUnpaid) },
        ],
        table: {
          title: 'Students with Pending Fees',
          columns: ['Class', 'Roll', 'Name', 'Adm. Fee', 'Paid Months', 'Pending Dues'],
          rows: duesList.slice(0, 120).map(s => [
            s.grade,
            String(s.roll || '-'),
            s.name,
            s.admPaid ? 'Paid' : 'Unpaid',
            String(s.paidTuitionMonthsCount),
            formatInr(s.duesInr),
          ]),
        },
        followUps: [
          'Show class-wise fee summary',
          'How many students have PEN numbers?',
          'Show class-wise enrollment breakdown',
        ],
        engine: 'local',
      };
    }

    return {
      answer: `For **Session ${yearLabel}**: **${f.admissionFeePaid}** students have paid the admission fee (**${f.admissionFeeUnpaid}** unpaid). Overall, **${f.studentsWithPendingDues}** active students currently have pending dues totaling **${formatInr(f.totalPendingDuesInr)}**.`,
      metrics: [
        { label: 'Admission Paid', value: String(f.admissionFeePaid) },
        { label: 'Admission Unpaid', value: String(f.admissionFeeUnpaid) },
        { label: 'Students with Dues', value: String(f.studentsWithPendingDues) },
        { label: 'Total Pending Dues', value: formatInr(f.totalPendingDuesInr) },
      ],
      table: {
        title: `Class-wise Fee Status (Session ${yearLabel})`,
        columns: ['Class', 'Active', 'Adm. Paid', 'Adm. Unpaid', 'With Pending Dues'],
        rows: cy.byGrade.map(g => [
          g.grade,
          String(g.totalActive),
          String(g.admissionFeePaid),
          String(g.admissionFeeUnpaid),
          String(g.withPendingDues),
        ]),
      },
      followUps: [
        'List students with unpaid admission fee',
        'List students with pending dues',
        'How many students have PEN numbers?',
      ],
      engine: 'local',
    };
  }

  // ── 4. Staff Queries ──────────────────────────────────────────────────────
  if (/\b(staff|teacher|teachers|faculty|department|designation|non-teaching)\b/i.test(ql)) {
    const st = snapshot.aggregates.staff;
    const deptSummary = Object.entries(st.byDepartmentActive)
      .map(([dept, count]) => `${dept}: ${count}`)
      .join(', ');

    return {
      answer: `There are **${st.activeCount}** active staff members (**${st.activeTeaching}** Teaching, **${st.activeNonTeaching}** Non-Teaching) and **${st.inactiveOrResignedCount}** inactive/resigned records. Departments: ${deptSummary || 'N/A'}.`,
      metrics: [
        { label: 'Active Staff', value: String(st.activeCount) },
        { label: 'Teaching Staff', value: String(st.activeTeaching) },
        { label: 'Non-Teaching Staff', value: String(st.activeNonTeaching) },
        { label: 'Resigned / Dropped', value: String(st.inactiveOrResignedCount) },
      ],
      table: {
        title: 'Staff Directory',
        columns: ['Emp ID', 'Name', 'Type', 'Department', 'Designation', 'Status', 'Phone'],
        rows: snapshot.records.staff.map(m => [
          m.empId,
          m.name,
          m.type,
          m.dept,
          m.desig,
          m.status,
          m.phone,
        ]),
      },
      followUps: [
        'How many students are in each class?',
        'Show hostel residents by dormitory',
        'How many students have PEN numbers?',
      ],
      engine: 'local',
    };
  }

  // ── 5. Hostel Queries ─────────────────────────────────────────────────────
  if (/\b(hostel|dorm|dormitory|resident|residents|boarder|warden)\b/i.test(ql)) {
    const h = snapshot.aggregates.hostel;
    const dormText = Object.entries(h.byDormitory)
      .map(([d, c]) => `${d}: ${c}`)
      .join(', ');

    return {
      answer: `There are **${h.totalResidents}** registered hostel residents (**${h.activeResidents}** currently active students). Distribution: ${dormText || 'None'}. Hostel also employs **${h.hostelStaffCount}** hostel staff.`,
      metrics: [
        { label: 'Total Residents', value: String(h.totalResidents) },
        { label: 'Active Residents', value: String(h.activeResidents) },
        { label: 'Hostel Staff', value: String(h.hostelStaffCount) },
        { label: 'Inventory Alerts', value: String(h.hostelInventoryNeedsAttention) },
      ],
      table: {
        title: 'Hostel Residents',
        columns: ['Student Name', 'Class', 'Dormitory', 'Date Joined'],
        rows: snapshot.records.hostelResidents.map(r => [r.name, r.grade, r.dorm, r.joined]),
      },
      followUps: [
        'Pending hostel and online admissions',
        'Show active teaching staff breakdown',
        'How many students have PEN numbers?',
      ],
      engine: 'local',
    };
  }

  // ── 6. Admissions Queries ─────────────────────────────────────────────────
  if (/\b(admission|admissions|applicant|applicants|application)\b/i.test(ql)) {
    const a = snapshot.aggregates.admissions;
    return {
      answer: `Online Admissions: **${a.onlineTotal}** total (**${a.onlineByStatus['pending'] || 0}** pending, **${a.onlineByStatus['approved'] || 0}** approved, **${a.onlineByStatus['rejected'] || 0}** rejected), with **${a.onlineWithPenNumber}** including a PEN number. Hostel Admissions: **${a.hostelTotal}** total (**${a.hostelByStatus['pending'] || 0}** pending).`,
      metrics: [
        { label: 'Online Total', value: String(a.onlineTotal) },
        { label: 'Online Pending', value: String(a.onlineByStatus['pending'] || 0) },
        { label: 'Online Approved', value: String(a.onlineByStatus['approved'] || 0) },
        { label: 'Hostel Pending', value: String(a.hostelByStatus['pending'] || 0) },
      ],
      table: {
        title: 'Online Admission Applications',
        columns: ['Ref ID', 'Student Name', 'Class', 'Status', 'Payment', 'PEN', 'Submitted'],
        rows: snapshot.records.onlineAdmissions
          .slice(0, 100)
          .map(o => [o.ref, o.name, o.grade, o.status, o.payStatus, o.pen || '—', o.submitted]),
      },
      followUps: [
        'Show class-wise enrollment breakdown',
        'How many students have PEN numbers?',
        'Show inventory status',
      ],
      engine: 'local',
    };
  }

  // ── 7. Inventory Queries ──────────────────────────────────────────────────
  if (/\b(inventory|stock|repair|replacement|asset|assets|equipment|furniture)\b/i.test(ql)) {
    const inv = snapshot.aggregates.inventory;
    const items = wantsMissing
      ? snapshot.records.inventory.filter(
          i => i.status !== 'Good' || i.currentStock <= i.reorderLevel || i.qty <= 1
        )
      : snapshot.records.inventory;

    return {
      answer: `School Inventory contains **${inv.totalItems}** item entries (**${inv.totalQuantity}** total units). **${inv.itemsNeedingAttentionOrLowStock}** items need repair, replacement, or restocking.`,
      metrics: [
        { label: 'Total Entries', value: String(inv.totalItems) },
        { label: 'Total Quantity', value: String(inv.totalQuantity) },
        { label: 'Needs Attention / Low', value: String(inv.itemsNeedingAttentionOrLowStock) },
      ],
      table: {
        title: wantsMissing ? 'Inventory Items Needing Attention' : 'School Inventory',
        columns: ['Item Name', 'Category', 'Quantity', 'Stock / Reorder', 'Status', 'Location'],
        rows: items.slice(0, 100).map(i => [
          i.name,
          i.category,
          String(i.qty),
          `${i.currentStock} / ${i.reorderLevel}`,
          i.status,
          i.location,
        ]),
      },
      followUps: [
        'How many students have PEN numbers?',
        'Show active staff breakdown',
        'Show hostel residents by dormitory',
      ],
      engine: 'local',
    };
  }

  // ── 8. Transfer Certificate / TC Queries ──────────────────────────────────
  if (/\b(tc|transfer|transferred|dropped|graduated)\b/i.test(ql)) {
    const tcCount = snapshot.aggregates.transfersAndCertificates.tcRecordsCount;
    return {
      answer: `There are **${tcCount}** Transfer Certificate (TC) records issued. Across all years, student status counts are: Active (**${all.byStatus['Active'] || 0}**), Taken TC (**${all.byStatus['Taken TC'] || 0}**), Dropped (**${all.byStatus['Dropped'] || 0}**), Graduated (**${all.byStatus['Graduated'] || 0}**).`,
      metrics: [
        { label: 'TC Records', value: String(tcCount) },
        { label: 'Taken TC', value: String(all.byStatus['Taken TC'] || 0) },
        { label: 'Dropped', value: String(all.byStatus['Dropped'] || 0) },
        { label: 'Service Certs', value: String(snapshot.aggregates.transfersAndCertificates.serviceCertificatesCount) },
      ],
      table: {
        title: 'Transfer Certificate Records',
        columns: ['Ref No', 'Student Name', 'Class', 'Issue Date', 'Reason'],
        rows: snapshot.records.tcRecords.slice(0, 100).map(t => [t.refNo, t.name, t.grade, t.issueDate, t.reason]),
      },
      followUps: [
        'Show class-wise student strength',
        'How many students have PEN numbers?',
        'Show pending admissions',
      ],
      engine: 'local',
    };
  }

  // ── 9. Single Class or Specific Student Lookup ────────────────────────────
  if (targetGrade) {
    const gRow = cy.byGrade.find(g => g.grade === targetGrade);
    return {
      answer: `**${targetGrade}** (Session ${yearLabel}) has **${gRow?.totalActive ?? activeScopedStudents.length}** active students (**${gRow?.male ?? 0}** Male, **${gRow?.female ?? 0}** Female). **${gRow?.withPen ?? 0}** have a PEN (**${gRow?.withoutPen ?? 0}** missing) and **${gRow?.withAadhaar ?? 0}** have Aadhaar. Class Teacher: **${gRow?.classTeacher || 'Unassigned'}**.`,
      metrics: [
        { label: `${targetGrade} Active`, value: String(gRow?.totalActive ?? activeScopedStudents.length) },
        { label: 'Boys / Girls', value: `${gRow?.male ?? 0} / ${gRow?.female ?? 0}` },
        { label: 'With PEN', value: String(gRow?.withPen ?? 0) },
        { label: 'Class Teacher', value: gRow?.classTeacher || 'Unassigned' },
      ],
      table: {
        title: `${targetGrade} Student Roster`,
        columns: ['Roll', 'Student ID', 'Name', 'Gender', 'PEN', 'Father Name', 'Contact'],
        rows: activeScopedStudents
          .sort((a, b) => a.roll - b.roll)
          .slice(0, 120)
          .map(s => [String(s.roll || '-'), s.sid, s.name, s.gender, s.hasPen ? s.pen : 'Missing', s.father, s.contact]),
      },
      followUps: [
        `List ${targetGrade} students missing PEN`,
        'Show PEN coverage across all classes',
        'Show pending fee dues by class',
      ],
      engine: 'local',
    };
  }

  // Search by keyword/name/ID if query doesn't match broad stats
  const searchTokens = ql
    .replace(/\b(find|search|show|who|is|student|staff|get|tell|me|about|for|details|of|pen|id|number)\b/g, ' ')
    .trim();

  if (searchTokens.length >= 3 && !/\b(class|enrollment|strength|gender|category|religion|cwsn|summary|overview|total|how many)\b/i.test(ql)) {
    const matchedStudents = snapshot.records.students.filter(
      s =>
        s.name.toLowerCase().includes(searchTokens) ||
        s.sid.toLowerCase().includes(searchTokens) ||
        s.pen.toLowerCase().includes(searchTokens) ||
        s.father.toLowerCase().includes(searchTokens) ||
        s.contact.toLowerCase().includes(searchTokens)
    );
    const matchedStaff = snapshot.records.staff.filter(
      st =>
        st.name.toLowerCase().includes(searchTokens) ||
        st.empId.toLowerCase().includes(searchTokens)
    );

    if (matchedStudents.length > 0 || matchedStaff.length > 0) {
      return {
        answer: `Found **${matchedStudents.length}** matching student record(s) and **${matchedStaff.length}** matching staff record(s) for **"${searchTokens}"**.`,
        metrics: [
          { label: 'Matched Students', value: String(matchedStudents.length) },
          { label: 'Matched Staff', value: String(matchedStaff.length) },
        ],
        table:
          matchedStudents.length > 0
            ? {
                title: `Student Search Results (${searchTokens})`,
                columns: ['Student ID', 'Class', 'Roll', 'Name', 'Status', 'PEN', 'Father', 'Contact'],
                rows: matchedStudents.slice(0, 80).map(s => [
                  s.sid,
                  s.grade,
                  String(s.roll || '-'),
                  s.name,
                  s.status,
                  s.hasPen ? s.pen : 'Missing',
                  s.father,
                  s.contact,
                ]),
              }
            : {
                title: `Staff Search Results (${searchTokens})`,
                columns: ['Emp ID', 'Name', 'Department', 'Designation', 'Status', 'Phone'],
                rows: matchedStaff.slice(0, 50).map(m => [m.empId, m.name, m.dept, m.desig, m.status, m.phone]),
              },
        followUps: [
          'How many students have PEN in each class?',
          'Show class-wise student strength',
          'Show pending fee dues summary',
        ],
        engine: 'local',
      };
    }
  }

  // ── 10. Default / General Enrollment & School Overview ────────────────────
  const catSummary = Object.entries(cy.category)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  return {
    answer: `**Session ${yearLabel} School Overview**: **${cy.total}** active students (**${cy.gender['Male'] || 0}** Male, **${cy.gender['Female'] || 0}** Female; CWSN: **${cy.cwsn.yes}**). Categories: ${catSummary || 'N/A'}. PEN recorded for **${cy.withPen}/${cy.total}** (${cy.penCoveragePercent}%), Aadhaar for **${cy.withAadhaar}/${cy.total}**. Active staff: **${snapshot.aggregates.staff.activeCount}**, Hostel residents: **${snapshot.aggregates.hostel.activeResidents}**.`,
    metrics: [
      { label: 'Active Students', value: String(cy.total), note: `Session ${yearLabel}` },
      { label: 'Male / Female', value: `${cy.gender['Male'] || 0} / ${cy.gender['Female'] || 0}` },
      { label: 'With PEN', value: String(cy.withPen), note: `${cy.penCoveragePercent}%` },
      { label: 'Active Staff', value: String(snapshot.aggregates.staff.activeCount) },
      { label: 'Hostel Residents', value: String(snapshot.aggregates.hostel.activeResidents) },
    ],
    table: {
      title: `Class-wise Breakdown (Session ${yearLabel})`,
      columns: ['Class', 'Active', 'Boys', 'Girls', 'With PEN', 'Missing PEN', 'Adm Paid', 'Class Teacher'],
      rows: cy.byGrade.map(g => [
        g.grade,
        String(g.totalActive),
        String(g.male),
        String(g.female),
        String(g.withPen),
        String(g.withoutPen),
        String(g.admissionFeePaid),
        g.classTeacher,
      ]),
    },
    followUps: [
      'List all active students missing PEN',
      'How many students haven’t paid admission fee?',
      'Summarize active teaching staff by department',
    ],
    engine: 'local',
  };
}
