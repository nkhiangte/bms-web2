import { Student, Staff, Grade, FeePayments, GradeDefinition, StaffAttendanceRecord, StudentAttendanceRecord, AttendanceStatus, StudentAttendanceStatus, FeeStructure, HostelDisciplineEntry, HostelResident, CalendarEvent, FeeSet, SubjectMark, SubjectDefinition, Exam, ProcessedStudent } from '@/types';
import { academicMonths, GRADES_LIST, FEE_SET_GRADES, IMGBB_API_KEY, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES, TERMINAL_EXAMS } from '@/constants';
import { useState, useEffect } from 'react';

// Custom hook to dynamically load an external script
export const useScript = (src: string) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'idle'>(src ? "loading" : "idle");

  useEffect(() => {
    if (!src || typeof document === 'undefined') {
      setStatus("idle");
      return;
    }

    let script = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-status", "loading");
      document.body.appendChild(script);

      const setAttribute = (event: Event) => {
        script.setAttribute("data-status", event.type === "load" ? "ready" : "error");
      };

      script.addEventListener("load", setAttribute);
      script.addEventListener("error", setAttribute);
    } else {
      setStatus(script.getAttribute("data-status") as any || 'ready');
    }

    const setState = (event: Event) => {
      setStatus(event.type === "load" ? "ready" : "error");
    };

    script.addEventListener("load", setState);
    script.addEventListener("error", setState);

    return () => {
      if (script) {
        script.removeEventListener("load", setState);
        script.removeEventListener("error", setState);
      }
    };
  }, [src]);

  return status;
};


const getGradeCode = (grade: Grade): string => {
    switch (grade) {
        case Grade.NURSERY: return 'NU';
        case Grade.KINDERGARTEN: return 'KG';
        case Grade.I: return '01';
        case Grade.II: return '02';
        case Grade.III: return '03';
        case Grade.IV: return '04';
        case Grade.V: return '05';
        case Grade.VI: return '06';
        case Grade.VII: return '07';
        case Grade.VIII: return '08';
        case Grade.IX: return '09';
        case Grade.X: return '10';
        default: return 'XX'; // Fallback for any unexpected grade
    }
};

export const formatStudentId = (student: Partial<Student>, academicYear: string): string => {
    if (student?.studentId) {
        return student.studentId;
    }
    if (!student?.grade || typeof student.rollNo !== 'number' || !academicYear) {
        return student?.id ? `ID-${student.id}` : 'INVALID-STUDENT-ID';
    }
    const startYear = academicYear.substring(0, 4);
    const yearSuffix = startYear.slice(-2);
    const gradeCode = getGradeCode(student.grade);
    const paddedRollNo = String(student.rollNo).padStart(2, '0');
    return `BMS${yearSuffix}${gradeCode}${paddedRollNo}`;
};

export const getFeeDetails = (grade: Grade, feeStructure: FeeStructure): FeeSet => {
    const map = feeStructure.gradeMap || FEE_SET_GRADES;

    let set: FeeSet | undefined;
    if (map.set1?.includes(grade)) {
        set = feeStructure.set1;
    } else if (map.set2?.includes(grade)) {
        set = feeStructure.set2;
    } else if (map.set3?.includes(grade)) {
        set = feeStructure.set3;
    }
    
    return set || { heads: [] };
};

export const calculateDues = (student: Student, feeStructure: FeeStructure): string[] => {
    const defaultPayments: FeePayments = {
        admissionFeePaid: false,
        tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
        examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
    };
    const feePayments = student.feePayments || defaultPayments;
    const feeSet = getFeeDetails(student.grade, feeStructure);

    const duesMessages: string[] = [];

    const oneTimeFees = (feeSet.heads || []).filter(h => h.type === 'one-time');
    const monthlyFees = (feeSet.heads || []).filter(h => h.type === 'monthly');
    const termFees = (feeSet.heads || []).filter(h => h.type === 'term');

    if (!feePayments.admissionFeePaid && oneTimeFees.length > 0) {
        const totalOneTime = oneTimeFees.reduce((sum, h) => sum + h.amount, 0);
        const names = oneTimeFees.map(h => h.name).join(', ');
        duesMessages.push(`${names}: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(totalOneTime)}`);
    }

    const unpaidTuitionMonths = academicMonths.filter(month => !feePayments.tuitionFeesPaid?.[month]);
    if (unpaidTuitionMonths.length > 0 && monthlyFees.length > 0) {
        const monthlyTotal = monthlyFees.reduce((sum, h) => sum + h.amount, 0);
        const totalDue = unpaidTuitionMonths.length * monthlyTotal;
        const names = monthlyFees.map(h => h.name).join(' + ');
        duesMessages.push(`${names}: ${unpaidTuitionMonths.length} month(s) pending (${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(totalDue)})`);
    }

    if (termFees.length > 0) {
        const termTotal = termFees.reduce((sum, h) => sum + h.amount, 0);
        const unpaidExams: string[] = [];
        if (!feePayments.examFeesPaid?.terminal1) unpaidExams.push('Term 1');
        if (!feePayments.examFeesPaid?.terminal2) unpaidExams.push('Term 2');
        if (!feePayments.examFeesPaid?.terminal3) unpaidExams.push('Term 3');
        
        if (unpaidExams.length > 0) {
            const totalTermDue = unpaidExams.length * termTotal;
            const names = termFees.map(h => h.name).join(' + ');
            duesMessages.push(`${names}: ${unpaidExams.join(', ')} (${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(totalTermDue)})`);
        }
    }

    return duesMessages;
};

export interface DueItem {
    description: string;
    amount: number;
}
export interface DuesSummary {
    items: DueItem[];
    total: number;
}

export const getDuesSummary = (student: Student, feeStructure: FeeStructure): DuesSummary => {
    const items: DueItem[] = [];
    const defaultPayments: FeePayments = {
        admissionFeePaid: false,
        tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
        examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
    };
    const feePayments = student.feePayments || defaultPayments;
    const feeSet = getFeeDetails(student.grade, feeStructure);

    const oneTimeFees = (feeSet.heads || []).filter(h => h.type === 'one-time');
    const monthlyFees = (feeSet.heads || []).filter(h => h.type === 'monthly');
    const termFees = (feeSet.heads || []).filter(h => h.type === 'term');

    if (!feePayments.admissionFeePaid) {
        oneTimeFees.forEach(head => {
            items.push({ description: head.name, amount: head.amount });
        });
    }

    const unpaidTuitionMonths = academicMonths.filter(month => !feePayments.tuitionFeesPaid?.[month]);
    if (unpaidTuitionMonths.length > 0) {
        monthlyFees.forEach(head => {
            const totalForHead = unpaidTuitionMonths.length * head.amount;
            items.push({ description: `${head.name} (${unpaidTuitionMonths.length} months)`, amount: totalForHead });
        });
    }

    const unpaidExams: string[] = [];
    if (!feePayments.examFeesPaid?.terminal1) unpaidExams.push('Term 1');
    if (!feePayments.examFeesPaid?.terminal2) unpaidExams.push('Term 2');
    if (!feePayments.examFeesPaid?.terminal3) unpaidExams.push('Term 3');
    
    if (unpaidExams.length > 0) {
        termFees.forEach(head => {
             const totalForHead = unpaidExams.length * head.amount;
             items.push({ description: `${head.name} (${unpaidExams.join(', ')})`, amount: totalForHead });
        });
    }

    const total = items.reduce((sum, item) => sum + item.amount, 0);
    return { items, total };
};

export const createDefaultFeePayments = (): FeePayments => ({
    admissionFeePaid: true,
    tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
    examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
});

export const getNextGrade = (currentGrade: Grade): Grade | null => {
    const currentIndex = GRADES_LIST.indexOf(currentGrade);
    if (currentIndex === -1 || currentIndex >= GRADES_LIST.length - 1) {
        return null;
    }
    return GRADES_LIST[currentIndex + 1];
};

export const getNextAcademicYear = (currentYear: string): string => {
    const [start, end] = currentYear.split('-').map(Number);
    if (!start || !end) return "2026-27"; // Fallback
    // Handle both YYYY-YYYY and YYYY-YY formats
    const startYear = start + 1;
    const endYearStr = String(end).length === 2 ? String(end + 1).padStart(2, '0') : String(end + 1);
    return `${startYear}-${endYearStr}`;
};

export const normalizeAcademicYear = (year?: string): string => {
    if (!year) return '2025-26';
    // Remove all whitespace
    const cleanYear = year.trim().replace(/\s/g, '');
    if (cleanYear === '') return '2025-26';
    
    const parts = cleanYear.split('-');
    if (parts.length === 2) {
        let [start, end] = parts;
        // Normalize YYYY-YYYY or YY-YY to YYYY-YY
        if (start.length === 2) start = '20' + start;
        if (end.length === 4) end = end.substring(2);
        return `${start}-${end}`;
    }
    return cleanYear;
};

const SUBJECT_ALIASES: string[][] = [
    ['english', 'englishi', 'english1', 'engi', 'eng1', 'englishl'],
    ['englishii', 'english2', 'engii', 'eng2'],
    ['math', 'maths', 'mathematics'],
    ['socialstudies', 'socialscience', 'socstudies', 'evs'],
    ['mizo', 'lushei'],
    ['drawing', 'art'],
    ['cursive', 'writing', 'handwriting'],
    ['spelling', 'spellings']
];

/**
 * Aggressive normalization: strips ALL non-alphanumeric characters, including spaces.
 * This ensures "English I" and "English" or "English - I" can be compared reliably.
 * Also canonicalizes known subject aliases.
 */
export const normalizeSubjectName = (name: string): string => {
    if (!name) return '';
    const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    for (const group of SUBJECT_ALIASES) {
        if (group.includes(normalized)) {
            return group[0];
        }
    }
    
    return normalized;
};

/**
 * Robust subject matching that handles common aliases and special characters.
 */
export const subjectsMatch = (name1: string, name2: string): boolean => {
    const n1 = normalizeSubjectName(name1);
    const n2 = normalizeSubjectName(name2);
    
    if (!n1 || !n2) return false;
    return n1 === n2;
};

export const calculateStudentResult = (student: Student, gradeDef: GradeDefinition): 'PASS' | 'FAIL' => {
    if (!gradeDef || !gradeDef.subjects) return 'PASS';

    const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    const isClassIXorX = student.grade === Grade.IX || student.grade === Grade.X;
    
    const studentExam = student.academicPerformance?.find(e => e.id === 'terminal3');
    
    if (!studentExam) return 'PASS';

    const numericSubjects = gradeDef.subjects.filter(sd => sd.gradingSystem !== 'OABC');
    const gradedSubjects = gradeDef.subjects.filter(sd => sd.gradingSystem === 'OABC');

    let failedSubjectsCount_III_to_VIII = 0;
    let failedSubjectsCount_IX_to_X = 0;
    let gradedSubjectsPassed = 0;

    numericSubjects.forEach(sd => {
        const result = studentExam.results.find(r => subjectsMatch(r.subject, sd.name));
        if (hasActivities) { 
            const examMark = result?.examMarks ?? 0;
            if (examMark < 20) { 
                failedSubjectsCount_III_to_VIII++;
            }
        } else { 
            if (isClassIXorX) {
                const totalSubjectMark = result?.marks ?? 0;
                if (totalSubjectMark < 33) { 
                    failedSubjectsCount_IX_to_X++;
                }
            }
        }
    });

    gradedSubjects.forEach(sd => {
        const result = studentExam.results.find(r => subjectsMatch(r.subject, sd.name));
        if (result?.grade && OABC_GRADES.includes(result.grade as any)) {
            gradedSubjectsPassed++;
        }
    });
    
    if (gradedSubjectsPassed < gradedSubjects.length) {
        return 'FAIL';
    } else if (hasActivities && failedSubjectsCount_III_to_VIII > 1) {
        return 'FAIL';
    } else if (isClassIXorX && failedSubjectsCount_IX_to_X > 1) {
        return 'FAIL';
    }

    return 'PASS';
};

export const findResultWithAliases = (results: SubjectMark[] | undefined, subjectDef: SubjectDefinition) => {
  if (!results || !Array.isArray(results) || !subjectDef?.name) return undefined;
  return results.find(r => r?.subject != null && subjectsMatch(r.subject, subjectDef.name));
};

export const getStudentExam = (student: Student, examId: string): Exam | undefined => {
  return student.academicPerformance?.find(e => {
    if (e.id === examId) return true;
    if (!e.name) return false;
    const eName = e.name.trim().toLowerCase();
    const tmpl = TERMINAL_EXAMS.find(t => t.id === examId);
    if (tmpl && eName === tmpl.name.trim().toLowerCase()) return true;
    
    const legacyNames: Record<string, string[]> = {
      terminal1: ['first terminal examination', 'i terminal examination'],
      terminal2: ['second terminal examination', 'ii terminal examination'],
      terminal3: ['third terminal examination', 'iii terminal examination'],
    };
    return (legacyNames[examId] || []).includes(eName);
  });
};

export const getProcessedClassData = (
  students: Student[],
  grade: Grade,
  examId: string,
  gradeDefinitions: Record<Grade, GradeDefinition>,
  academicYear: string,
  options: { 
    showAllYears?: boolean,
    marksOverride?: Record<string, Record<string, string | number>>
  } = {}
): ProcessedStudent[] => {
  const { showAllYears = false, marksOverride } = options;
  const gradeDef = gradeDefinitions[grade];
  if (!gradeDef) return [];

  const selectedYearNorm = normalizeAcademicYear(academicYear);

  // 1. Filter students
  const classStudents = students.filter(s => {
    const matchesGrade = s.grade === grade;
    const studentYearNorm = normalizeAcademicYear(s.academicYear);
    const effectiveYear = s.academicYear ? studentYearNorm : normalizeAcademicYear('2025-26');
    const matchesYear = effectiveYear === selectedYearNorm;
    const hasMarksForExam = s.academicPerformance?.some(exam => {
        if (exam.id === examId) return true;
        if (!exam.name) return false;
        const eName = exam.name.trim().toLowerCase();
        const tmpl = TERMINAL_EXAMS.find(t => t.id === examId);
        if (tmpl && eName === tmpl.name.trim().toLowerCase()) return true;
        const legacyNames: Record<string, string[]> = {
            terminal1: ['first terminal examination', 'i terminal examination'],
            terminal2: ['second terminal examination', 'ii terminal examination'],
            terminal3: ['third terminal examination', 'iii terminal examination'],
        };
        return (legacyNames[examId] || []).includes(eName);
    });
    return matchesGrade && (matchesYear || hasMarksForExam || showAllYears);
  });

  // 2. Determine subjects
  const subjectsMap = new Map<string, SubjectDefinition>();
  (gradeDef.subjects || []).forEach(s => subjectsMap.set(normalizeSubjectName(s.name), s));
  
  classStudents.forEach(student => {
    const studentExam = getStudentExam(student, examId);
    let results = studentExam?.results || [];
    
    // Also include subjects from marksOverride if present
    const override = marksOverride?.[student.id];
    if (override) {
        Object.keys(override).forEach(key => {
            const rawSubj = key.replace(/_(exam|activity|sa|fa)$/, '');
            const normalized = normalizeSubjectName(rawSubj);
            if (!subjectsMap.has(normalized)) {
                // Heuristic for new subjects in override
                subjectsMap.set(normalized, {
                    name: rawSubj,
                    examFullMarks: 100,
                    activityFullMarks: 0,
                    gradingSystem: 'Numerical'
                });
            }
        });
    }

    if (results) {
      results.forEach(res => {
        const normalized = normalizeSubjectName(res.subject);
        if (!subjectsMap.has(normalized)) {
          subjectsMap.set(normalized, {
            name: res.subject,
            examFullMarks: 100,
            activityFullMarks: 0,
            gradingSystem: res.grade ? 'OABC' : 'Numerical'
          });
        }
      });
    }
  });

  const numericSubjects = Array.from(subjectsMap.values()).filter(s => s.gradingSystem !== 'OABC');
  const gradedSubjects = Array.from(subjectsMap.values()).filter(s => s.gradingSystem === 'OABC');

  const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(grade);
  const isClassIXorX = grade === Grade.IX || grade === Grade.X;
  const isIXTerminal3 = (grade === Grade.IX || grade === Grade.X) && examId === 'terminal3';
  const isNurseryToII = [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(grade);

  // 3. Process marks
  const studentData = classStudents.map(student => {
    const studentExam = getStudentExam(student, examId);
    const override = marksOverride?.[student.id];

    let localGrandTotal = 0;
    let localExamTotal = 0;
    let localActivityTotal = 0;
    let localFullMarksTotal = 0;
    let failedSubjectsCount = 0;
    let failedSubjectsList: string[] = [];
    let gradedSubjectsPassed = 0;

    numericSubjects.forEach(sd => {
      let result = findResultWithAliases(studentExam?.results, sd);
      let currentSubjMarkValue = 0;
      let currentSubjFMValue = 0;

      if (hasActivities) {
        const examMark = override?.[sd.name + '_exam'] !== undefined ? Number(override[sd.name + '_exam']) : Number(result?.examMarks ?? 0);
        const activityMark = override?.[sd.name + '_activity'] !== undefined ? Number(override[sd.name + '_activity']) : Number(result?.activityMarks ?? 0);
        
        localExamTotal += examMark;
        localActivityTotal += activityMark;
        currentSubjMarkValue = examMark + activityMark;
        currentSubjFMValue = Number(sd.examFullMarks || (isClassIXorX ? 100 : 0)) + Number(sd.activityFullMarks || 0);
        if (examMark < 20) { failedSubjectsCount++; failedSubjectsList.push(sd.name); }
      } else if (isIXTerminal3) {
        const saMark = override?.[sd.name + '_sa'] !== undefined ? Number(override[sd.name + '_sa']) : Number(result?.saMarks ?? result?.marks ?? 0);
        const faMark = override?.[sd.name + '_fa'] !== undefined ? Number(override[sd.name + '_fa']) : Number(result?.faMarks ?? 0);
        
        currentSubjMarkValue = saMark + faMark;
        localExamTotal += currentSubjMarkValue;
        currentSubjFMValue = 100;
        if (currentSubjMarkValue < 33) { failedSubjectsCount++; failedSubjectsList.push(sd.name); }
      } else {
        currentSubjMarkValue = override?.[sd.name] !== undefined ? Number(override[sd.name]) : Number(result?.marks ?? 0);
        localExamTotal += currentSubjMarkValue;
        currentSubjFMValue = Number(sd.examFullMarks || (isClassIXorX ? 100 : 0));
        const failLimit = isClassIXorX ? 33 : isNurseryToII ? 35 : 33;
        if (currentSubjMarkValue < failLimit) { failedSubjectsCount++; failedSubjectsList.push(sd.name); }
      }
      localGrandTotal += currentSubjMarkValue;
      localFullMarksTotal += currentSubjFMValue;
    });

    gradedSubjects.forEach(sd => {
      const result = findResultWithAliases(studentExam?.results, sd);
      const gradeValue = override?.[sd.name] !== undefined ? override[sd.name] : result?.grade;
      if (gradeValue && OABC_GRADES.includes(gradeValue as any)) gradedSubjectsPassed++;
    });

    const percentage = localFullMarksTotal > 0 ? (localGrandTotal / localFullMarksTotal) * 100 : 0;
    let result: 'PASS' | 'FAIL' | 'SIMPLE PASS' = (gradedSubjectsPassed < gradedSubjects.length || failedSubjectsCount > 1) ? 'FAIL' : failedSubjectsCount === 1 ? 'SIMPLE PASS' : 'PASS';
    if (isNurseryToII && failedSubjectsCount > 0) result = 'FAIL';

    let division = isClassIXorX && result === 'PASS' ? (percentage >= 75 ? 'Distinction' : percentage >= 60 ? 'I Div' : percentage >= 45 ? 'II Div' : percentage >= 35 ? 'III Div' : '-') : '-';
    let academicGrade = result === 'FAIL' ? 'E' : (percentage > 89 ? 'O' : percentage > 79 ? 'A' : percentage > 69 ? 'B' : percentage > 59 ? 'C' : 'D');

    let remark = '';
    if (result === 'FAIL') {
      remark = `Needs improvement in ${failedSubjectsList.join(', ')}`;
    } else if (result === 'SIMPLE PASS') {
      remark = `Focus on ${failedSubjectsList.join(', ')}`;
    } else {
      if (percentage >= 90) remark = "Outstanding performance!";
      else if (percentage >= 75) remark = "Excellent progress. Keep up the great work.";
      else if (percentage >= 60) remark = "Good progress. Well done.";
      else if (percentage >= 45) remark = "Satisfactory performance. Consistent effort will lead to better results.";
      else remark = "Passed. Consistent effort is needed to improve scores.";
    }

    return {
      ...student,
      grandTotal: localGrandTotal,
      examTotal: localExamTotal,
      activityTotal: localActivityTotal,
      percentage,
      result,
      division,
      academicGrade,
      remark,
      rank: '-',
      failedSubjects: failedSubjectsList
    } as ProcessedStudent;
  });

  // 4. Ranking
  const passedStudents = studentData.filter(s => s.result === 'PASS');
  
  return studentData.map(s => {
    let rank: number | '-' = '-';
    if (s.result === 'PASS') {
      // Standard Competition Ranking: 1 + number of students with strictly higher marks
      const higherCount = passedStudents.filter(other => other.grandTotal > s.grandTotal).length;
      rank = higherCount + 1;
    }
    return { ...s, rank };
  });
};

export const formatDateForDisplay = (isoDate?: string): string => {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return isoDate || '';
  }
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

export const formatDateForStorage = (displayDate?: string): string => {
  if (!displayDate) {
    return '';
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(displayDate)) {
    return displayDate;
  }
  const match = displayDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return ''; 
  }
  const [, day, month, year] = match;
  const paddedDay = day.padStart(2, '0');
  const paddedMonth = month.padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
};

export const formatDateForNews = (isoDate?: string): string => {
    if (!isoDate) return '';
    const date = new Date(isoDate + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c;
    return d;
}

export const getHolidayDates = (events: CalendarEvent[]): Set<string> => {
    const holidayDates = new Set<string>();
    events.forEach(event => {
        if (event.type === 'Holiday') {
            let current = new Date(event.date);
            const end = new Date(event.endDate || event.date);
            current.setHours(0,0,0,0);
            end.setHours(0,0,0,0);
            while (current <= end) {
                holidayDates.add(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
        }
    });
    return holidayDates;
}

export const exportAttendanceToCsv = ({
    people,
    attendanceData,
    startDate,
    endDate,
    entityName,
    entityType,
    academicYear,
    holidays
}: {
    people: (Student | Staff)[];
    attendanceData: { [date: string]: StaffAttendanceRecord | StudentAttendanceRecord };
    startDate: string;
    endDate: string;
    entityName: string;
    entityType: 'Student' | 'Staff';
    academicYear: string;
    holidays?: Set<string>;
}) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
    }

    const isStaff = entityType === 'Staff';

    const headers = [
        `${entityType} ID`,
        'Name',
        ...dates.map(d => {
            const [yyyy, mm, dd] = d.split('-');
            return `${dd}/${mm}`;
        }),
        'Total Working Days',
        'Days Present',
        'Days Absent',
        'Days on Leave',
    ];
    if (isStaff) headers.push('Days Late');
    
    const rows = people.map(person => {
        const rowData = [
            entityType === 'Student' ? formatStudentId(person as Student, academicYear) : (person as Staff).employeeId,
            entityType === 'Student' ? (person as Student).name : `${(person as Staff).firstName} ${(person as Staff).lastName}`,
        ];

        let presentCount = 0;
        let absentCount = 0;
        let leaveCount = 0;
        let lateCount = 0; 
        let totalDaysCount = 0;

        dates.forEach(dateStr => {
            const dateObj = new Date(dateStr + 'T00:00:00');
            const isWeekend = dateObj.getDay() === 0; // Sunday (0) is a holiday
            const isHoliday = holidays?.has(dateStr);

            if (isWeekend || isHoliday) {
                rowData.push('Holiday');
            } else {
                const dayRecord = attendanceData[dateStr];
                const status = dayRecord ? dayRecord[person.id] : undefined;
                
                let statusChar = '-';
                
                if (status) {
                    totalDaysCount++;
                    if (status === AttendanceStatus.PRESENT || status === StudentAttendanceStatus.PRESENT) {
                        statusChar = 'P';
                        presentCount++;
                    } else if (status === AttendanceStatus.ABSENT || status === StudentAttendanceStatus.ABSENT) {
                        statusChar = 'A';
                        absentCount++;
                    } else if (status === AttendanceStatus.LEAVE || status === StudentAttendanceStatus.LEAVE) {
                        statusChar = 'LV';
                        leaveCount++;
                    } else if (isStaff && status === AttendanceStatus.LATE) {
                        statusChar = 'L';
                        lateCount++;
                    }
                }
                rowData.push(statusChar);
            }
        });

        rowData.push(String(totalDaysCount), String(presentCount), String(absentCount), String(leaveCount));
        if (isStaff) rowData.push(String(lateCount));
        
        return rowData.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${entityType}_Attendance_${entityName.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const formatPhoneNumberForWhatsApp = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
        return digitsOnly;
    }
    if (digitsOnly.length === 10) {
        return `91${digitsOnly}`;
    }
    return digitsOnly;
};

export const exportDisciplineLogToCsv = ({
    logEntries,
    students,
    residents,
    fileName,
    academicYear,
}: {
    logEntries: HostelDisciplineEntry[];
    students: Student[];
    residents: HostelResident[];
    fileName: string;
    academicYear: string;
}) => {
    const studentMap = new Map(students.map(s => [s.id, s]));

    const headers = [
        'Date', 'Student Name', 'Student ID', 'Class', 'Category', 
        'Severity', 'Status', 'Description', 'Action Taken', 'Reported By'
    ];
    
    const escapeCsvField = (field: any): string => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        if (/[",\n\r]/.test(stringField)) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    };

    const rows = logEntries.map(entry => {
        const student = students.find(s => s.id === entry.studentId);
        
        return [
            escapeCsvField(formatDateForDisplay(entry.date)),
            escapeCsvField(student?.name || 'N/A'),
            escapeCsvField(student ? formatStudentId(student, academicYear) : 'N/A'),
            escapeCsvField(student?.grade || 'N/A'),
            escapeCsvField(entry.category),
            escapeCsvField(entry.severity),
            escapeCsvField(entry.status),
            escapeCsvField(entry.actionTaken),
            escapeCsvField(entry.reportedBy),
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const parseSubjectAndTeacher = (subjectString: string): { subject: string, teacher: string | null } => {
    const match = subjectString.match(/(.+?)\s*\((.+?)\)/);
    if (match) {
        return { subject: match[1].trim(), teacher: match[2].trim() };
    }
    return { subject: subjectString.trim(), teacher: null };
};

export const playNotificationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); 
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};

export const getCurrentAcademicYear = (): string => {
    const now = new Date();
    const currentMonth = now.getMonth(); 
    const currentYear = now.getFullYear();
    const startYear = currentMonth < 3 ? currentYear - 1 : currentYear;
    const endYear = (startYear + 1) % 100;
    return `${startYear}-${String(endYear).padStart(2, '0')}`;
};

export const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!e.target?.result) {
                return reject(new Error("FileReader did not return a result."));
            }
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (err) => reject(err);
            img.src = e.target.result as string;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};

export const uploadToImgBB = async (base64Image: string): Promise<string> => {
    const formData = new FormData();
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
    formData.append('image', cleanBase64);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();
    if (data.success) {
        return data.data.url;
    } else {
        throw new Error(data.error?.message || 'Failed to upload image to ImgBB');
    }
};

export const stripHtml = (html: string): string => {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};
