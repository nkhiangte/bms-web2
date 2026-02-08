
import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Grade, GradeDefinition, Exam, StudentStatus, Staff, Attendance, SubjectMark, SubjectDefinition, User } from '../types';
import { BackIcon, PrinterIcon, SpinnerIcon, SaveIcon, InboxArrowDownIcon, EditIcon, CogIcon, HomeIcon } from '../components/Icons';
import { TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES, SCHOOL_BANNER_URL } from '../constants';
import { formatDateForDisplay, normalizeSubjectName, formatStudentId, getNextGrade } from '../utils';
import { ImportMarksModal } from '../components/ImportMarksModal';
import ConfirmationModal from '../components/ConfirmationModal';
import EditSubjectsModal from '../components/EditSubjectsModal';
import { db } from '../firebaseConfig';

const { useParams, useNavigate, Link } = ReactRouterDOM as any;

interface ClassMarkStatementPageProps {
  students: Student[];
  academicYear: string;
  user: User;
  gradeDefinitions: Record<Grade, GradeDefinition>;
  onUpdateAcademic: (studentId: string, performance: Exam[]) => Promise<void>;
  onUpdateGradeDefinition: (grade: Grade, newDefinition: GradeDefinition) => Promise<void>;
}

type MarksData = Record<string, Record<string, number | string | null>>;
type AttendanceData = Record<string, { totalWorkingDays: number | null, daysPresent: number | null }>;

interface ProcessedStudent extends Student {
    grandTotal: number;
    examTotal: number;
    activityTotal: number;
    percentage: number;
    result: string;
    division: string;
    academicGrade: string;
    remark: string;
    rank: number | '-';
}

type SortCriteria = 'rollNo' | 'name' | 'totalMarks';

// --- Reusable Logic and Components ---

const findResultWithAliases = (results: SubjectMark[] | undefined, subjectDef: SubjectDefinition) => {
    if (!results) return undefined;
    const normSubjDefName = normalizeSubjectName(subjectDef.name);
    
    return results.find(r => {
        const normResultName = normalizeSubjectName(r.subject);
        if (normResultName === normSubjDefName) return true;

        // Fallbacks for common name variations
        const mathNames = ['math', 'maths', 'mathematics'];
        if (mathNames.includes(normSubjDefName) && mathNames.includes(normResultName)) return true;
        
        if (normSubjDefName === 'english' && normResultName === 'english i') return true;
        if (normSubjDefName === 'english - ii' && normResultName === 'english ii') return true;
        if (normSubjDefName === 'social studies' && normResultName === 'social science') return true;
        if (normSubjDefName === 'eng-i' && (normResultName === 'english' || normResultName === 'english i')) return true;
        if (normSubjDefName === 'eng-ii' && (normResultName === 'english ii' || normResultName === 'english - ii')) return true;
        if (normSubjDefName === 'spellings' && normResultName === 'spelling') return true;
        if (normSubjDefName === 'rhymes' && normResultName === 'rhyme') return true;

        return false;
    });
};


const calculateTermSummary = (
    student: Student,
    exam: Exam | undefined,
    examId: 'terminal1' | 'terminal2' | 'terminal3',
    gradeDef: GradeDefinition,
    allStudents: Student[]
) => {
    if (!gradeDef || !gradeDef.subjects) return null;

    const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    const isClassIXorX = student.grade === Grade.IX || student.grade === Grade.X;
    const isNurseryToII = [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(student.grade);

    const classmates = allStudents.filter(s => s.grade === student.grade && s.status === StudentStatus.ACTIVE);
    const numericSubjects = gradeDef.subjects.filter(sd => sd.gradingSystem !== 'OABC');
    const gradedSubjects = gradeDef.subjects.filter(sd => sd.gradingSystem === 'OABC');

    const studentData = classmates.map(s => {
        const studentExam = s.academicPerformance?.find(e => {
            const examTemplate = TERMINAL_EXAMS.find(t => t.id === examId);
            if (!examTemplate) return false;
            return e.id === examId || (e.name && e.name.trim().toLowerCase() === examTemplate.name.trim().toLowerCase());
        });
        
        // FIX: Explicitly typed numeric accumulators to avoid potential arithmetic operand type errors.
        let localGrandTotal: number = 0;
        let failedSubjectsCount: number = 0;
        let gradedSubjectsPassed: number = 0;

        for (const sd of numericSubjects) {
            const result = findResultWithAliases(studentExam?.results, sd);
            let totalSubjectMark: number = 0;

            if (hasActivities) {
                const examMark = Number(result?.examMarks ?? 0);
                const activityMark = Number(result?.activityMarks ?? 0);
                totalSubjectMark = examMark + activityMark;
                if (examMark < 20) { failedSubjectsCount++; }
            } else {
                totalSubjectMark = Number(result?.marks ?? 0);
                const failLimit = isClassIXorX ? 33 : 35; // KG, I, II use 35
                if (totalSubjectMark < failLimit) { failedSubjectsCount++; }
            }
            // FIX: Ensured numeric assignment using += on explicitly typed number.
            localGrandTotal += totalSubjectMark;
        }

        gradedSubjects.forEach(sd => {
            const result = findResultWithAliases(studentExam?.results, sd);
            if (result?.grade && OABC_GRADES.includes(result.grade as any)) gradedSubjectsPassed++;
        });
        
        let resultStatus = 'PASS';
        if (gradedSubjectsPassed < gradedSubjects.length) resultStatus = 'FAIL';
        else if (failedSubjectsCount > 1) resultStatus = 'FAIL';
        else if (failedSubjectsCount === 1) resultStatus = 'SIMPLE PASS';
        if (isNurseryToII && failedSubjectsCount > 0) resultStatus = 'FAIL';
        
        return { id: s.id, grandTotal: localGrandTotal, result: resultStatus };
    });

    const passedStudents = studentData.filter(s => s.result === 'PASS');
    const uniqueScores = [...new Set(passedStudents.map(s => s.grandTotal))].sort((a,b) => b-a);

    const finalRankedData = new Map<string, typeof studentData[0] & {rank: number | '-'}>();
    
    studentData.forEach(s => {
        if (s.result === 'FAIL' || s.result === 'SIMPLE PASS') {
            finalRankedData.set(s.id, { ...s, rank: '-' });
        } else {
            const rankIndex = uniqueScores.indexOf(s.grandTotal);
            const rank = rankIndex !== -1 ? (rankIndex + 1) : '-';
            finalRankedData.set(s.id, { ...s, rank });
        }
    });
    
    const rankEntry = finalRankedData.get(student.id);
    if (!rankEntry) return null;

    let grandTotal: number = 0;
    let examTotal: number = 0;
    let activityTotal: number = 0;
    let fullMarksTotal: number = 0;
    const failedSubjects: string[] = [];
    let gradedSubjectsPassed: number = 0;

    numericSubjects.forEach(sd => {
        const result = findResultWithAliases(exam?.results, sd);
        let totalSubjMark = 0, subjectFM = 0;

        if (hasActivities) {
            const examMark = Number(result?.examMarks ?? 0);
            const activityMark = Number(result?.activityMarks ?? 0);
            examTotal += Number(examMark);
            activityTotal += Number(activityMark);
            totalSubjMark = Number(examMark) + Number(activityMark);
            subjectFM = Number(sd.examFullMarks ?? 0) + Number(sd.activityFullMarks ?? 0);
            if (examMark < 20) failedSubjects.push(sd.name);
        } else {
            totalSubjMark = Number(result?.marks ?? 0);
            examTotal += Number(totalSubjMark);
            subjectFM = Number(sd.examFullMarks);
            const failLimit = isClassIXorX ? 33 : 35;
            if (totalSubjMark < failLimit) failedSubjects.push(sd.name);
        }
        grandTotal += Number(totalSubjMark);
        fullMarksTotal += Number(subjectFM);
    });

    gradedSubjects.forEach(sd => {
        const result = findResultWithAliases(exam?.results, sd);
        if (result?.grade && OABC_GRADES.includes(result.grade as any)) gradedSubjectsPassed++;
    });

    const percentage = fullMarksTotal > 0 ? (grandTotal / fullMarksTotal) * 100 : 0;
    
    let resultStatus = rankEntry.result;

    let division = '-';
    if (isClassIXorX && resultStatus === 'PASS') {
        if (percentage >= 75) division = 'Distinction';
        else if (percentage >= 60) division = 'I Div';
        else if (percentage >= 45) division = 'II Div';
        else if (percentage >= 35) division = 'III Div';
    }

    let academicGrade = '-';
    if (resultStatus === 'FAIL') academicGrade = 'E';
    else {
        if (percentage > 89) academicGrade = 'O'; else if (percentage > 79) academicGrade = 'A'; else if (percentage > 69) academicGrade = 'B'; else if (percentage > 59) academicGrade = 'C'; else academicGrade = 'D';
    }
    
    let remark = '';
    if (resultStatus === 'FAIL') {
        remark = `Needs significant improvement${failedSubjects.length > 0 ? ` in ${failedSubjects.join(', ')}` : ''}.`;
    } else if (resultStatus === 'SIMPLE PASS') {
        remark = `Simple Pass. Focus on improving in ${failedSubjects.join(', ')}.`;
    } else if (resultStatus === 'PASS') {
        if (percentage >= 90) remark = "Outstanding performance!";
        else if (percentage >= 75) remark = "Excellent performance.";
        else if (percentage >= 60) remark = "Good performance.";
        else if (percentage >= 45) remark = "Satisfactory performance.";
        else remark = "Passed. Needs to work harder to improve scores.";
    }

    return { id: student.id, grandTotal, examTotal, activityTotal, percentage, result: resultStatus, division, academicGrade, remark, rank: rankEntry.rank };
};

const ClassMarkStatementPage: React.FC<ClassMarkStatementPageProps> = ({ students, academicYear, user, gradeDefinitions, onUpdateAcademic, onUpdateGradeDefinition }) => {
  const { grade: encodedGrade, examId } = useParams() as { grade: string; examId: string };
  const navigate = useNavigate();
  
  const grade = useMemo(() => encodedGrade ? decodeURIComponent(encodedGrade) as Grade : undefined, [encodedGrade]);
  const examDetails = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);

  const classStudents = useMemo(() => {
    if (!grade) return [];
    return students.filter(s => s.grade === grade && s.status === StudentStatus.ACTIVE).sort((a, b) => a.rollNo - b.rollNo);
  }, [students, grade]);

  const subjectDefinitions = useMemo(() => {
    if (!grade) return [];
    let subjects = gradeDefinitions[grade]?.subjects || [];
    if (grade === Grade.IX || grade === Grade.X) {
        subjects = subjects.map(sub => ({ ...sub, examFullMarks: 100, activityFullMarks: 0 }));
    }
    return subjects;
  }, [grade, gradeDefinitions]);
  
  const hasActivities = useMemo(() => {
    if (!grade) return false;
    return !GRADES_WITH_NO_ACTIVITIES.includes(grade);
  }, [grade]);

  const isClassIXorX = useMemo(() => grade === Grade.IX || grade === Grade.X, [grade]);
  const isNurseryToII = useMemo(() => [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(grade as Grade), [grade]);

  const [marksData, setMarksData] = useState<MarksData>({});
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [changedStudents, setChangedStudents] = useState<Set<string>>(new Set());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('rollNo');
  const [isEditSubjectsModalOpen, setIsEditSubjectsModalOpen] = useState(false);


  useEffect(() => {
    if (classStudents.length === 0) return;
    if (Object.keys(marksData).length > 0 && changedStudents.size > 0) return;

    const initialMarks: MarksData = {};
    const initialAttendance: AttendanceData = {};
    classStudents.forEach(student => {
      initialMarks[student.id] = {};
      const studentExam = student.academicPerformance?.find(e => 
          e.id === examId || (e.name && examDetails && e.name.trim().toLowerCase() === examDetails.name.trim().toLowerCase())
      );
      initialAttendance[student.id] = {
          totalWorkingDays: studentExam?.attendance?.totalWorkingDays ?? null,
          daysPresent: studentExam?.attendance?.daysPresent ?? null,
      };
      subjectDefinitions.forEach(subjectDef => {
        const normSubjName = normalizeSubjectName(subjectDef.name);
        const result = studentExam?.results.find(r => {
            const normResultName = normalizeSubjectName(r.subject);
            if (normResultName === normSubjName) return true;

            // Fallbacks for common name variations
            const mathNames = ['math', 'maths', 'mathematics'];
            if (mathNames.includes(normSubjName) && mathNames.includes(normResultName)) return true;
            
            if (normSubjName === 'english' && normResultName === 'english i') return true;
            if (normSubjName === 'english - ii' && normResultName === 'english ii') return true;
            if (normSubjName === 'social studies' && normResultName === 'social science') return true;
            if (normSubjName === 'eng-i' && (normResultName === 'english' || normResultName === 'english i')) return true;
            if (normSubjName === 'eng-ii' && (normResultName === 'english ii' || normResultName === 'english - ii')) return true;
            if (normSubjName === 'spellings' && normResultName === 'spelling') return true;
            if (normSubjName === 'rhymes' && normResultName === 'rhyme') return true;

            return false;
        });
        
        if (subjectDef.gradingSystem === 'OABC') {
            initialMarks[student.id][subjectDef.name] = result?.grade ?? null;
        } else if (hasActivities) {
            initialMarks[student.id][subjectDef.name + '_exam'] = result?.examMarks ?? result?.marks ?? null;
            initialMarks[student.id][subjectDef.name + '_activity'] = result?.activityMarks ?? null;
        } else {
            initialMarks[student.id][subjectDef.name] = result?.marks ?? null;
        }
      });
    });
    setMarksData(initialMarks);
    setAttendanceData(initialAttendance);
  }, [classStudents, subjectDefinitions, examId, hasActivities, examDetails]);
  
  const handleMarkChange = (studentId: string, subjectName: string, value: string, type: 'exam' | 'activity' | 'total' | 'grade') => {
    const subjectDef = subjectDefinitions.find(sd => sd.name === subjectName);
    if (!subjectDef) return;

    let key = subjectName;
    if (type === 'grade') {
        setMarksData(prev => ({ ...prev, [studentId]: { ...prev[studentId], [key]: value }}));
        setChangedStudents(prev => new Set(prev).add(studentId));
        return;
    }

    let fullMarks = type === 'exam' ? subjectDef.examFullMarks : type === 'activity' ? subjectDef.activityFullMarks : subjectDef.examFullMarks;
    if (type === 'exam') key = subjectName + '_exam';
    else if (type === 'activity') key = subjectName + '_activity';

    if (!/^\d*$/.test(value)) return;
    const numericValue = value === '' ? null : Math.max(0, Math.min(parseInt(value, 10), fullMarks));

    setMarksData(prev => ({ ...prev, [studentId]: { ...prev[studentId], [key]: numericValue }}));
    setChangedStudents(prev => new Set(prev).add(studentId));
  };
  
  const handleAttendanceChange = (studentId: string, field: 'totalWorkingDays' | 'daysPresent', value: string) => {
    if (!/^\d*$/.test(value)) return;
    const numericValue = value === '' ? null : Math.max(0, parseInt(value, 10));
    setAttendanceData(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: numericValue }}));
    setChangedStudents(prev => new Set(prev).add(studentId));
  };
  
  const handleApplyImport = (importedMarks: MarksData) => {
    setMarksData(prev => {
        const newMarksData = { ...prev };
        for (const studentId in importedMarks) {
            newMarksData[studentId] = { ...newMarksData[studentId], ...importedMarks[studentId] };
        }
        return newMarksData;
    });
    setChangedStudents(prev => new Set([...prev, ...Object.keys(importedMarks)]));
  };

  const processedData: ProcessedStudent[] = useMemo(() => {
    const numericSubjects = subjectDefinitions.filter(sd => sd.gradingSystem !== 'OABC');
    const gradedSubjects = subjectDefinitions.filter(sd => sd.gradingSystem === 'OABC');

    const studentData = classStudents.map(student => {
      // FIX: Explicitly typed arithmetic accumulators to avoid potential operand type errors.
      let grandTotalAccumulator: number = 0;
      let examTotalAccumulator: number = 0;
      let activityTotalAccumulator: number = 0;
      let fullMarksTotalAccumulator: number = 0;
      let failedSubjectsCount: number = 0;
      let gradedSubjectsPassed: number = 0;
      const studentMarks = marksData[student.id] || {};
      const failedSubjectsList: string[] = [];

      for (const sd of numericSubjects) {
        // FIX: Explicitly typed numeric variables.
        let localSubjMark: number = 0;
        let localSubjFM: number = 0;
        if (hasActivities) {
            const examMark = Number(studentMarks[sd.name + '_exam']) || 0;
            const activityMark = Number(studentMarks[sd.name + '_activity']) || 0;
            
            examTotalAccumulator += examMark;
            activityTotalAccumulator += activityMark;
            localSubjMark = examMark + activityMark;
            localSubjFM = (sd.examFullMarks || 0) + (sd.activityFullMarks || 0);
            
            if (examMark < 20) { failedSubjectsCount++; failedSubjectsList.push(sd.name); }
        } else {
            localSubjMark = Number(studentMarks[sd.name]) || 0;
            examTotalAccumulator += localSubjMark;
            localSubjFM = sd.examFullMarks || 0;
            const failLimit = isClassIXorX ? 33 : isNurseryToII ? 35 : 33;
            if (localSubjMark < failLimit) { failedSubjectsCount++; failedSubjectsList.push(sd.name); }
        }
        // FIX: Ensured numeric addition using += on explicitly typed variables.
        grandTotalAccumulator += localSubjMark;
        fullMarksTotalAccumulator += localSubjFM;
      }

      gradedSubjects.forEach(sd => {
        const gradeValue = studentMarks[sd.name];
        if (gradeValue && typeof gradeValue === 'string' && OABC_GRADES.includes(gradeValue)) gradedSubjectsPassed++;
      });
      
      const percentage = fullMarksTotalAccumulator > 0 ? (grandTotalAccumulator / fullMarksTotalAccumulator) * 100 : 0;
      let result = (gradedSubjectsPassed < gradedSubjects.length || failedSubjectsCount > 1) ? 'FAIL' : failedSubjectsCount === 1 ? 'SIMPLE PASS' : 'PASS';
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

      return { ...student, grandTotal: grandTotalAccumulator, examTotal: examTotalAccumulator, activityTotal: activityTotalAccumulator, percentage, result, division, academicGrade, remark };
    });

    const passedStudents = studentData.filter(s => s.result === 'PASS');
    const uniqueScores = [...new Set(passedStudents.map(s => s.grandTotal))].sort((a, b) => b - a);
    
    const finalData = studentData.map(s => {
        if (s.result === 'FAIL' || s.result === 'SIMPLE PASS') {
            return { ...s, rank: '-' as const };
        }
        const rankIndex = uniqueScores.indexOf(s.grandTotal);
        return { ...s