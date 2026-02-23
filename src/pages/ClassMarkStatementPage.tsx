import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Grade, GradeDefinition, Exam, StudentStatus, Staff, Attendance, SubjectMark, SubjectDefinition, User } from '@/types';
import { BackIcon, PrinterIcon, SpinnerIcon, SaveIcon, InboxArrowDownIcon, EditIcon, CogIcon, HomeIcon } from '@/components/Icons';
import { TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES, SCHOOL_BANNER_URL } from '@/constants';
import { formatDateForDisplay, normalizeSubjectName, formatStudentId, getNextGrade, subjectsMatch } from '@/utils';
import { ImportMarksModal } from '@/components/ImportMarksModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import EditSubjectsModal from '@/components/EditSubjectsModal';
import { db } from '@/firebaseConfig';

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

const findResultWithAliases = (results: SubjectMark[] | undefined, subjectDef: SubjectDefinition) => {
    if (!results) return undefined;
    return results.find(r => subjectsMatch(r.subject, subjectDef.name));
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
  }, [grade, gradeDefinitions]) as SubjectDefinition[];
  
  const hasActivities = useMemo(() => {
    if (!grade) return false;
    return !GRADES_WITH_NO_ACTIVITIES.includes(grade);
  }, [grade]);

  const isClassIXorX = useMemo(() => grade === Grade.IX || grade === Grade.X, [grade]);
  const isNurseryToII = useMemo(() => [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(grade as Grade), [grade]);
  const isIXTerminal3 = useMemo(() => grade === Grade.IX && examId === 'terminal3', [grade, examId]);

  const tableRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const current = e.currentTarget;
    const row = parseInt(current.getAttribute('data-row') || '0', 10);
    const col = parseInt(current.getAttribute('data-col') || '0', 10);
    const next = tableRef.current?.querySelector<HTMLInputElement>(
      `input[data-row="${row + 1}"][data-col="${col}"]`
    );
    if (next) {
      next.focus();
      next.select();
    } else {
      const nextColFirst = tableRef.current?.querySelector<HTMLInputElement>(
        `input[data-col="${col + 1}"][data-row="0"]`
      );
      if (nextColFirst) {
        nextColFirst.focus();
        nextColFirst.select();
      }
    }
  }, []);

  const [marksData, setMarksData] = useState<MarksData>({});
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [changedStudents, setChangedStudents] = useState<Set<string>>(new Set());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('rollNo');
  const [isEditSubjectsModalOpen, setIsEditSubjectsModalOpen] = useState(false);

  const isInitialized = useRef(false);

  useEffect(() => {
    if (classStudents.length === 0) return;
    if (isInitialized.current) return;
    isInitialized.current = true;

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
        const result = findResultWithAliases(studentExam?.results, subjectDef);
        
        if (subjectDef.gradingSystem === 'OABC') {
            initialMarks[student.id][subjectDef.name] = result?.grade ?? null;
        } else if (hasActivities) {
            initialMarks[student.id][subjectDef.name + '_exam'] = result?.examMarks ?? result?.marks ?? null;
            initialMarks[student.id][subjectDef.name + '_activity'] = result?.activityMarks ?? null;
        } else if (grade === Grade.IX && examId === 'terminal3') {
            initialMarks[student.id][subjectDef.name + '_sa'] = result?.saMarks ?? result?.examMarks ?? result?.marks ?? null;
            initialMarks[student.id][subjectDef.name + '_fa'] = result?.faMarks ?? result?.activityMarks ?? null;
        } else {
            initialMarks[student.id][subjectDef.name] = result?.marks ?? result?.examMarks ?? null;
        }
      });
    });
    setMarksData(initialMarks);
    setAttendanceData(initialAttendance);
  }, [classStudents, subjectDefinitions, examId, hasActivities, examDetails]);
  
  const handleMarkChange = (studentId: string, subjectName: string, value: string, type: 'exam' | 'activity' | 'total' | 'grade' | 'sa' | 'fa') => {
    const subjectDef = subjectDefinitions.find(sd => sd.name === subjectName);
    if (!subjectDef) return;

    let key = subjectName;
    if (type === 'grade') {
        setMarksData(prev => ({ ...prev, [studentId]: { ...prev[studentId], [key]: value }}));
        setChangedStudents(prev => new Set(prev).add(studentId));
        return;
    }

    let fullMarks = type === 'exam' ? subjectDef.examFullMarks : type === 'activity' ? subjectDef.activityFullMarks : type === 'sa' ? 80 : type === 'fa' ? 20 : subjectDef.examFullMarks;
    if (type === 'exam') key = subjectName + '_exam';
    else if (type === 'activity') key = subjectName + '_activity';
    else if (type === 'sa') key = subjectName + '_sa';
    else if (type === 'fa') key = subjectName + '_fa';

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

  const isMarkFailed = useCallback((studentId: string, sd: SubjectDefinition): boolean => {
    const studentMarks = marksData[studentId] || {};
    if (sd.gradingSystem === 'OABC') return false;
    if (isIXTerminal3) {
        const saMark = Number(studentMarks[sd.name + '_sa'] || 0);
        return saMark < 27;
    }
    if (hasActivities) {
        const examMark = Number(studentMarks[sd.name + '_exam'] || 0);
        return examMark < 20;
    }
    const mark = Number(studentMarks[sd.name] || 0);
    const failLimit = isClassIXorX ? 33 : isNurseryToII ? 35 : 33;
    return mark < failLimit;
  }, [marksData, isIXTerminal3, hasActivities, isClassIXorX, isNurseryToII]);

  const processedData: ProcessedStudent[] = useMemo(() => {
    const numericSubjects = subjectDefinitions.filter(sd => sd.gradingSystem !== 'OABC');
    const gradedSubjects = subjectDefinitions.filter(sd => sd.gradingSystem === 'OABC');

    const studentData = classStudents.map(student => {
      let localGrandTotal: number = 0;
      let localExamTotal: number = 0;
      let localActivityTotal: number = 0;
      let localFullMarksTotal: number = 0;
      let failedSubjectsCount: number = 0;
      let gradedSubjectsPassed: number = 0;
      const studentMarks = marksData[student.id] || {};
      const failedSubjectsList: string[] = [];

      for (const sd of numericSubjects) {
        let currentSubjMarkValue: number = 0;
        let currentSubjFMValue: number = 0;
        
        if (hasActivities) {
            const examMark = Number(studentMarks[sd.name + '_exam'] || 0);
            const activityMark = Number(studentMarks[sd.name + '_activity'] || 0);
            localExamTotal += examMark;
            localActivityTotal += activityMark;
            currentSubjMarkValue = examMark + activityMark;
            currentSubjFMValue = Number(sd.examFullMarks || 0) + Number(sd.activityFullMarks || 0);
            if (examMark < 20) { failedSubjectsCount++; failedSubjectsList.push(sd.name); }
        } else if (isIXTerminal3) {
            const saMark = Number(studentMarks[sd.name + '_sa'] || 0);
            const faMark = Number(studentMarks[sd.name + '_fa'] || 0);
            currentSubjMarkValue = saMark + faMark;
            localExamTotal += currentSubjMarkValue;
            currentSubjFMValue = 100;
            if (saMark < 27) { failedSubjectsCount++; failedSubjectsList.push(sd.name); }
        } else {
            currentSubjMarkValue = Number(studentMarks[sd.name] || 0);
            localExamTotal += currentSubjMarkValue;
            currentSubjFMValue = Number(sd.examFullMarks || 0);
            const failLimit = isClassIXorX ? 33 : isNurseryToII ? 35 : 33;
            if (currentSubjMarkValue < failLimit) { failedSubjectsCount++; failedSubjectsList.push(sd.name); }
        }
        localGrandTotal += currentSubjMarkValue;
        localFullMarksTotal += currentSubjFMValue;
      }

      gradedSubjects.forEach(sd => {
        const gradeValue = studentMarks[sd.name];
        if (gradeValue && typeof gradeValue === 'string' && OABC_GRADES.includes(gradeValue)) gradedSubjectsPassed++;
      });
      
      const percentage = localFullMarksTotal > 0 ? (localGrandTotal / localFullMarksTotal) * 100 : 0;
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
          else if (percentage >= 45) remark = "Satisfactory. Consistent effort will lead to better results.";
          else remark = "Passed. Consistent effort needed to improve.";
      }

      return { ...student, grandTotal: localGrandTotal, examTotal: localExamTotal, activityTotal: localActivityTotal, percentage, result, division, academicGrade, remark, rank: 0 } as ProcessedStudent;
    });

    const passedStudents = studentData.filter(s => s.result === 'PASS');
    const uniqueScores = [...new Set(passedStudents.map(s => s.grandTotal))].sort((a, b) => Number(b) - Number(a));
    
    const finalData = studentData.map(s => {
        let rank: number | '-' = '-';
        if (s.result !== 'FAIL' && s.result !== 'SIMPLE PASS') {
            const rankIndex = uniqueScores.indexOf(s.grandTotal);
            rank = rankIndex !== -1 ? (rankIndex + 1) : '-';
        }
        return { ...s, rank };
    });
    
    if (sortCriteria === 'name') finalData.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortCriteria === 'totalMarks') finalData.sort((a, b) => { const aF = a.result === 'FAIL'; const bF = b.result === 'FAIL'; if (aF && !bF) return 1; if (!aF && bF) return -1; return Number(b.grandTotal) - Number(a.grandTotal); });
    else finalData.sort((a, b) => a.rollNo - b.rollNo);
    
    return finalData as ProcessedStudent[];
  }, [marksData, classStudents, subjectDefinitions, hasActivities, isClassIXorX, isNurseryToII, isIXTerminal3, sortCriteria]);

  const handleConfirmSave = async () => {
    if (!examDetails || changedStudents.size === 0) return;
    setIsSaving(true);

    const updatePromises = Array.from(changedStudents).map(studentId => {
        const student = classStudents.find(s => s.id === studentId);
        if (!student) return Promise.resolve();

        const studentMarks = marksData[studentId] || {};
        const originalExam = student.academicPerformance?.find(e => e.id === examId);

        const newResults = subjectDefinitions.map(sd => {
            const originalResult = originalExam?.results.find(r => subjectsMatch(r.subject, sd.name));
            const newResult: SubjectMark = { subject: sd.name, ...(originalResult?.activityLog && { activityLog: originalResult.activityLog }) };

            if (sd.gradingSystem === 'OABC') {
                if (studentMarks[sd.name]) newResult.grade = studentMarks[sd.name] as any;
            } else if (hasActivities) {
                if (studentMarks[sd.name + '_exam'] !== undefined) newResult.examMarks = studentMarks[sd.name + '_exam'] as number;
                if (studentMarks[sd.name + '_activity'] !== undefined) newResult.activityMarks = studentMarks[sd.name + '_activity'] as number;
            } else if (grade === Grade.IX && examId === 'terminal3') {
                if (studentMarks[sd.name + '_sa'] !== undefined) newResult.saMarks = studentMarks[sd.name + '_sa'] as number;
                if (studentMarks[sd.name + '_fa'] !== undefined) newResult.faMarks = studentMarks[sd.name + '_fa'] as number;
                newResult.marks = (Number(studentMarks[sd.name + '_sa'] || 0) + Number(studentMarks[sd.name + '_fa'] || 0)) || undefined;
            } else {
                if (studentMarks[sd.name] !== undefined) newResult.marks = studentMarks[sd.name] as number;
            }
            return newResult;
        }).filter(r => r.marks != null || r.examMarks != null || r.activityMarks != null || r.saMarks != null || r.faMarks != null || r.grade != null);

const studentProcessed = processedData.find(p => p.id === studentId);

const newExamData: Exam = { 
    id: examId as any, 
    name: examDetails.name, 
    results: newResults,
    rank: studentProcessed?.rank ?? null,
    total: studentProcessed?.grandTotal ?? null,
    percentage: Number(studentProcessed?.percentage.toFixed(1)) ?? null,
    result: studentProcessed?.result ?? null,
    division: studentProcessed?.division ?? null,
};        
        if (attendanceData[studentId]?.totalWorkingDays != null && attendanceData[studentId]?.daysPresent != null) {
            newExamData.attendance = { totalWorkingDays: attendanceData[studentId].totalWorkingDays!, daysPresent: attendanceData[studentId].daysPresent! };
        }

        const newPerformance: Exam[] = [...(student.academicPerformance?.filter(e => e.id !== examId) || []), newExamData];
        return onUpdateAcademic(studentId, newPerformance);
    });

    await Promise.all(updatePromises);
    setChangedStudents(new Set());
    setIsSaving(false);
    setIsConfirmSaveModalOpen(false);
  };

  const handleSaveSubjects = async (newDef: GradeDefinition) => {
        if(grade) { await onUpdateGradeDefinition(grade, newDef); setIsEditSubjectsModalOpen(false); }
  }

  if (!grade || !examDetails) return <div>Error: Invalid grade or exam.</div>;

  return (
    <>
    <div id="mark-statement-container" className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center print-hidden">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"><BackIcon className="w-5 h-5"/> Back</button>
            <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home"><HomeIcon className="w-5 h-5"/> Home</Link>
        </div>
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">Mark Entry</h1>
            <p className="text-slate-600 mt-1 text-lg"><span className="font-semibold">Class:</span> {grade} | <span className="font-semibold">Exam:</span> {examDetails.name}</p>
        </div>

        <div className="mt-6 flex justify-end items-center gap-2 print-hidden">
            <span className="text-sm font-semibold text-slate-600">Sort by:</span>
            <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-100">
                {(['rollNo', 'name', 'totalMarks'] as SortCriteria[]).map(c => (
                    <button key={c} onClick={() => setSortCriteria(c)}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${sortCriteria === c ? 'bg-sky-600 text-white shadow' : 'text-slate-600 hover:bg-white'}`}>
                        {c === 'rollNo' ? 'Roll No' : c === 'name' ? 'Name' : 'Total Marks'}
                    </button>
                ))}
            </div>
        </div>
        
        {/* ── TABLE ── */}
        <div className="mt-2 overflow-x-auto overflow-y-auto border rounded-lg" style={{ maxHeight: '70vh' }} ref={tableRef}>
            {/* 
                KEY FIXES:
                1. w-auto (not w-full or min-w-[1600px]) so columns size to content
                2. whitespace-nowrap on table prevents text wrapping in cells
                3. No column: w-10 min-w-[40px] for consistent sticky offset
                4. Name column: sticky left-10 (offset = No column width = 40px)
                5. Remark: max-w-[160px] with break-words to keep it compact
            */}
            <table id="mark-statement-table" className="w-auto text-xs border-collapse whitespace-nowrap">
                <thead className="bg-slate-100 sticky top-0 z-20">
                    <tr>
                        {/* No — sticky left-0, fixed width 40px */}
                        <th rowSpan={hasActivities || isIXTerminal3 ? 2 : 1}
                            className="px-2 py-2 text-center font-bold text-slate-800 sticky left-0 bg-slate-100 z-30 border-b border-r w-10 min-w-[40px] align-middle text-xs">
                            No
                        </th>
                        {/* Name — sticky left-10 (40px offset) */}
                        <th rowSpan={hasActivities || isIXTerminal3 ? 2 : 1}
                            className="px-2 py-2 text-left font-bold text-slate-800 sticky left-10 bg-slate-100 z-30 border-b border-r min-w-[130px] align-middle text-xs shadow-[2px_0_5px_-1px_rgba(0,0,0,0.2)]">
                            Student Name
                        </th>
                        
                        {subjectDefinitions.map(sd => {
                            if ((hasActivities || isIXTerminal3) && sd.gradingSystem !== 'OABC') {
                                return <th key={sd.name} colSpan={2} className="px-1 py-2 text-center font-bold text-slate-800 border-b border-l text-xs">{sd.name}</th>;
                            }
                            return <th key={sd.name} rowSpan={hasActivities || isIXTerminal3 ? 2 : 1} className="px-1 py-2 text-center font-bold text-slate-800 border-b border-l align-middle text-xs">{sd.name}</th>;
                        })}
                        
                        <th rowSpan={hasActivities || isIXTerminal3 ? 2 : 1} className="px-2 py-2 text-center font-bold text-slate-800 border-b border-l align-middle text-xs">Total</th>
                        <th rowSpan={hasActivities || isIXTerminal3 ? 2 : 1} className="px-2 py-2 text-center font-bold text-slate-800 border-b border-l align-middle text-xs">%</th>
                        <th rowSpan={hasActivities || isIXTerminal3 ? 2 : 1} className="px-2 py-2 text-center font-bold text-slate-800 border-b border-l align-middle text-xs">Rank</th>
                        <th rowSpan={hasActivities || isIXTerminal3 ? 2 : 1} className="px-2 py-2 text-center font-bold text-slate-800 border-b border-l align-middle text-xs">{isClassIXorX ? 'Div' : '-'}</th>
                        <th rowSpan={hasActivities || isIXTerminal3 ? 2 : 1} className="px-2 py-2 text-center font-bold text-slate-800 border-b border-l align-middle text-xs">Result</th>
                        <th rowSpan={hasActivities || isIXTerminal3 ? 2 : 1}
                            className="px-2 py-2 text-left font-bold text-slate-800 border-b border-l align-middle text-xs"
                            style={{ minWidth: 420 }}>
                            Remark
                        </th>
                        <th rowSpan={hasActivities || isIXTerminal3 ? 2 : 1} className="px-2 py-2 text-center font-bold text-slate-800 border-b border-l align-middle text-xs">W.Days</th>
                        <th rowSpan={hasActivities || isIXTerminal3 ? 2 : 1} className="px-2 py-2 text-center font-bold text-slate-800 border-b border-l align-middle text-xs">Present</th>
                    </tr>
                    {(hasActivities || isIXTerminal3) && (
                        <tr>
                            {isIXTerminal3
                                ? subjectDefinitions.flatMap(sd =>
                                    sd.gradingSystem !== 'OABC' ? [
                                        <th key={`${sd.name}-sa`} className="px-0 py-1 text-center font-semibold text-slate-600 text-xs border-b border-l bg-slate-100">SA<br/><span className="font-normal text-slate-400">/80</span></th>,
                                        <th key={`${sd.name}-fa`} className="px-0 py-1 text-center font-semibold text-slate-600 text-xs border-b border-l bg-slate-100">FA<br/><span className="font-normal text-slate-400">/20</span></th>
                                    ] : []
                                )
                                : subjectDefinitions.flatMap(sd =>
                                    sd.gradingSystem !== 'OABC' ? [
                                        <th key={`${sd.name}-exam`} className="px-0 py-1 text-center font-semibold text-slate-600 text-xs border-b border-l bg-slate-100">Exam</th>,
                                        <th key={`${sd.name}-activity`} className="px-0 py-1 text-center font-semibold text-slate-600 text-xs border-b border-l bg-slate-100">Act.</th>
                                    ] : []
                                )
                            }
                        </tr>
                    )}
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {processedData.map((student, studentIndex) => {
                        let colIndex = 0;
                        return (
                        <tr key={student.id} className={`hover:bg-slate-50 ${changedStudents.has(student.id) ? 'bg-sky-50' : ''}`}>
                            {/* No — sticky, fixed 40px */}
                            <td className="px-2 py-1 font-bold text-center border-r sticky left-0 bg-white z-10 text-xs w-10 min-w-[40px]">
                                {student.rollNo}
                            </td>
                            {/* Name — sticky at left-10 with shadow separator */}
                            <td className="px-2 py-1 font-medium border-r sticky left-10 bg-white z-10 text-xs shadow-[2px_0_5px_-1px_rgba(0,0,0,0.15)]">
                                {student.name}
                            </td>
                            
                            {subjectDefinitions.map(sd => {
                                const isOABC = sd.gradingSystem === 'OABC';

                                if (isOABC) {
                                    colIndex++;
                                    return (
                                        <td key={sd.name} className="px-0 py-1 border-l text-center">
                                            <select value={marksData[student.id]?.[sd.name] as string ?? ''} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'grade')} className="form-select w-12 text-center text-xs">
                                                <option value="">-</option>
                                                {OABC_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </td>
                                    );
                                }

                                if (isIXTerminal3) {
                                    const saCol = colIndex++;
                                    const faCol = colIndex++;
                                    const saMark = marksData[student.id]?.[sd.name + '_sa'];
                                    const saFailed = saMark !== null && saMark !== undefined && saMark !== '' && Number(saMark) < 27;
                                    return (
                                        <React.Fragment key={sd.name}>
                                            <td className="px-0 py-1 border-l text-center">
                                                <input type="number" value={saMark ?? ''} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'sa')} onKeyDown={handleKeyDown} data-row={studentIndex} data-col={saCol} className={`form-input w-12 text-center text-xs ${saFailed ? 'text-red-600 font-bold' : ''}`} placeholder="-" max={80} />
                                            </td>
                                            <td className="px-0 py-1 border-l text-center">
                                                <input type="number" value={marksData[student.id]?.[sd.name + '_fa'] ?? ''} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'fa')} onKeyDown={handleKeyDown} data-row={studentIndex} data-col={faCol} className="form-input w-12 text-center text-xs" placeholder="-" max={20} />
                                            </td>
                                        </React.Fragment>
                                    );
                                }

                                if (hasActivities) {
                                    const examCol = colIndex++;
                                    const actCol = colIndex++;
                                    const examMark = marksData[student.id]?.[sd.name + '_exam'];
                                    const examFailed = examMark !== null && examMark !== undefined && examMark !== '' && Number(examMark) < 20;
                                    return (
                                        <React.Fragment key={sd.name}>
                                            <td className="px-0 py-1 border-l text-center">
                                                <input type="number" value={examMark ?? ''} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'exam')} onKeyDown={handleKeyDown} data-row={studentIndex} data-col={examCol} className={`form-input w-12 text-center text-xs ${examFailed ? 'text-red-600 font-bold' : ''}`} placeholder="-" />
                                            </td>
                                            <td className="px-0 py-1 border-l text-center">
                                                <input type="number" value={marksData[student.id]?.[sd.name + '_activity'] ?? ''} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'activity')} onKeyDown={handleKeyDown} data-row={studentIndex} data-col={actCol} className="form-input w-12 text-center text-xs" placeholder="-" />
                                            </td>
                                        </React.Fragment>
                                    );
                                }
                                
                                const totalCol = colIndex++;
                                const mark = marksData[student.id]?.[sd.name];
                                const failLimit = isClassIXorX ? 33 : isNurseryToII ? 35 : 33;
                                const markFailed = mark !== null && mark !== undefined && mark !== '' && Number(mark) < failLimit;
                                return (
                                    <td key={sd.name} className="px-0 py-1 border-l text-center">
                                        <input type="number" value={mark ?? ''} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'total')} onKeyDown={handleKeyDown} data-row={studentIndex} data-col={totalCol} className={`form-input w-12 text-center text-xs ${markFailed ? 'text-red-600 font-bold' : ''}`} placeholder="-" />
                                    </td>
                                );
                            })}

                            <td className="px-2 py-1 text-center font-bold text-sky-700 border-l text-xs">{student.grandTotal}</td>
                            <td className="px-2 py-1 text-center border-l text-xs">{student.percentage.toFixed(1)}</td>
                            <td className="px-2 py-1 text-center font-bold border-l text-xs">{student.rank}</td>
                            <td className="px-2 py-1 text-center border-l text-xs">{isClassIXorX ? student.division : '-'}</td>
                            <td className={`px-2 py-1 text-center font-bold border-l text-xs ${student.result === 'PASS' || student.result === 'SIMPLE PASS' ? 'text-emerald-600' : 'text-red-600'}`}>{student.result}</td>
                            <td className="px-2 py-1 text-xs border-l" style={{ minWidth: 420 }}>
                                {student.remark}
                            </td>
                            <td className="px-1 py-1 border-l">
                                <input type="number" value={attendanceData[student.id]?.totalWorkingDays ?? ''} onChange={(e) => handleAttendanceChange(student.id, 'totalWorkingDays', e.target.value)} className="form-input w-12 text-center text-xs" />
                            </td>
                            <td className="px-1 py-1 border-l">
                                <input type="number" value={attendanceData[student.id]?.daysPresent ?? ''} onChange={(e) => handleAttendanceChange(student.id, 'daysPresent', e.target.value)} className="form-input w-12 text-center text-xs" />
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3 print-hidden border-t pt-6">
            <button onClick={() => setIsEditSubjectsModalOpen(true)} className="btn btn-secondary flex items-center gap-2">
                <CogIcon className="w-5 h-5" />
                <span>Manage Subjects</span>
            </button>
            <Link to={`/portal/reports/bulk-print/${encodedGrade}/${examId}`} target="_blank" className="btn btn-secondary flex items-center gap-2">
                <PrinterIcon className="w-5 h-5" />
                <span>Bulk Print Reports</span>
            </Link>
            <button onClick={() => setIsImportModalOpen(true)} className="btn btn-secondary flex items-center gap-2">
                <InboxArrowDownIcon className="w-5 h-5" />
                <span>Import Marks</span>
            </button>
            <button onClick={() => setIsConfirmSaveModalOpen(true)} disabled={isSaving || changedStudents.size === 0} className="btn btn-primary flex items-center gap-2 disabled:bg-slate-400">
                {isSaving ? <SpinnerIcon className="w-5 h-5"/> : <SaveIcon className="w-5 h-5" />}
                <span>Save Changes ({changedStudents.size})</span>
            </button>
        </div>
    </div>
    
    <ConfirmationModal isOpen={isConfirmSaveModalOpen} onClose={() => setIsConfirmSaveModalOpen(false)} onConfirm={handleConfirmSave} title="Save Changes" confirmDisabled={isSaving}>
        <p>Save marks for {changedStudents.size} student(s)?</p>
    </ConfirmationModal>

    {examDetails && <ImportMarksModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onApplyImport={handleApplyImport} classStudents={classStudents} subjectDefinitions={subjectDefinitions} examName={examDetails.name} hasActivities={hasActivities} isSaving={isSaving} />}
    
    {grade && gradeDefinitions[grade] && <EditSubjectsModal isOpen={isEditSubjectsModalOpen} onClose={() => setIsEditSubjectsModalOpen(false)} onSave={handleSaveSubjects} grade={grade} initialGradeDefinition={gradeDefinitions[grade]} />}
    </>
  );
};

export default ClassMarkStatementPage;
