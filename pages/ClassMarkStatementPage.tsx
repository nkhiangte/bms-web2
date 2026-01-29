
import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Grade, GradeDefinition, Exam, StudentStatus, Staff, Attendance, SubjectMark, SubjectDefinition, User } from '../types';
import { BackIcon, HomeIcon, PrinterIcon, SpinnerIcon, SaveIcon, InboxArrowDownIcon, EditIcon, CogIcon } from '../components/Icons';
import { TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES, SCHOOL_BANNER_URL } from '../constants';
import { formatDateForDisplay, normalizeSubjectName, formatStudentId, getNextGrade } from '../utils';
import { ImportMarksModal } from '../components/ImportMarksModal';
import ConfirmationModal from '../components/ConfirmationModal';
import EditSubjectsModal from '../components/EditSubjectsModal';

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

    const numericSubjects = gradeDef.subjects.filter(sd => sd.gradingSystem !== 'OABC');
    const gradedSubjects = gradeDef.subjects.filter(sd => sd.gradingSystem === 'OABC');

    const studentData = allStudents.map(s => {
        const studentExam = s.academicPerformance?.find(e => {
            const examTemplate = TERMINAL_EXAMS.find(t => t.id === examId);
            if (!examTemplate) return false;
            return e.id === examId || (e.name && e.name.trim().toLowerCase() === examTemplate.name.trim().toLowerCase());
        });
        
        let grandTotal = 0;
        let failedSubjectsCount = 0;
        let gradedSubjectsPassed = 0;

        numericSubjects.forEach(sd => {
            const result = findResultWithAliases(studentExam?.results, sd);
            let totalSubjectMark = 0;

            if (hasActivities) {
                const examMark = result?.examMarks ?? 0;
                const activityMark = result?.activityMarks ?? 0;
                totalSubjectMark = examMark + activityMark;
                if (examMark < 20) { failedSubjectsCount++; }
            } else {
                totalSubjectMark = result?.marks ?? 0;
                const failLimit = isClassIXorX ? 33 : 35; // KG, I, II use 35
                if (totalSubjectMark < failLimit) { failedSubjectsCount++; }
            }
            grandTotal += totalSubjectMark;
        });

        gradedSubjects.forEach(sd => {
            const result = findResultWithAliases(studentExam?.results, sd);
            if (result?.grade && OABC_GRADES.includes(result.grade as any)) gradedSubjectsPassed++;
        });
        
        let resultStatus = 'PASS';
        if (gradedSubjectsPassed < gradedSubjects.length) resultStatus = 'FAIL';
        else if (failedSubjectsCount > 1) resultStatus = 'FAIL';
        else if (failedSubjectsCount === 1) resultStatus = 'SIMPLE PASS';
        if (isNurseryToII && failedSubjectsCount > 0) resultStatus = 'FAIL';
        
        return { id: s.id, grandTotal, result: resultStatus };
    });

    const passedStudents = studentData.filter(s => s.result === 'PASS');
    const uniqueScores = [...new Set(passedStudents.map(s => s.grandTotal))].sort((a,b) => b-a);

    const currentStudentStats = studentData.find(s => s.id === student.id);
    if (!currentStudentStats) return null;

    let rank: number | '-' = '-';
    if (currentStudentStats.result === 'PASS') {
        const rankIndex = uniqueScores.indexOf(currentStudentStats.grandTotal);
        rank = rankIndex !== -1 ? rankIndex + 1 : '-';
    }

    let grandTotal = 0, examTotal = 0, activityTotal = 0, fullMarksTotal = 0;
    let failedSubjectsCount = 0, gradedSubjectsPassed = 0;
    const failedSubjects: string[] = [];

    const studentExam = exam;

    numericSubjects.forEach(sd => {
        const result = findResultWithAliases(studentExam?.results, sd);
        let totalSubjectMark = 0, subjectFullMarks = 0;

        if (hasActivities) {
            const examMark = result?.examMarks ?? 0;
            const activityMark = result?.activityMarks ?? 0;
            examTotal += examMark;
            activityTotal += activityMark;
            totalSubjectMark = examMark + activityMark;
            subjectFullMarks = (sd.examFullMarks ?? 0) + (sd.activityFullMarks ?? 0);
            if (examMark < 20) { failedSubjectsCount++; failedSubjects.push(sd.name); }
        } else {
            totalSubjectMark = result?.marks ?? 0;
            examTotal += totalSubjectMark;
            subjectFullMarks = sd.examFullMarks;
            const failLimit = isClassIXorX ? 33 : 35;
            if (totalSubjectMark < failLimit) { failedSubjectsCount++; failedSubjects.push(sd.name); }
        }
        grandTotal += totalSubjectMark;
        fullMarksTotal += subjectFullMarks;
    });

    gradedSubjects.forEach(sd => {
        const result = findResultWithAliases(studentExam?.results, sd);
        if (result?.grade && OABC_GRADES.includes(result.grade as any)) gradedSubjectsPassed++;
    });

    const percentage = fullMarksTotal > 0 ? (grandTotal / fullMarksTotal) * 100 : 0;
    
    let resultStatus = 'PASS';
    if (gradedSubjectsPassed < gradedSubjects.length) resultStatus = 'FAIL';
    else if (failedSubjectsCount > 1) resultStatus = 'FAIL';
    else if (failedSubjectsCount === 1) resultStatus = 'SIMPLE PASS';
    if (isNurseryToII && failedSubjectsCount > 0) resultStatus = 'FAIL';

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

    return { id: student.id, grandTotal, examTotal, activityTotal, percentage, result: resultStatus, division, academicGrade, remark, rank };
};

const MultiTermReportCard: React.FC<{
    student: Student;
    gradeDef: GradeDefinition;
    exams: Record<'terminal1' | 'terminal2' | 'terminal3', Exam | undefined>;
    summaries: Record<'terminal1' | 'terminal2' | 'terminal3', ReturnType<typeof calculateTermSummary>>;
    staff: Staff[];
}> = ({ student, gradeDef, exams, summaries, staff }) => {
    const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    const classTeacher = staff.find(s => s.id === gradeDef?.classTeacherId);

    const getAttendancePercent = (attendance?: Attendance) => {
        if (attendance && attendance.totalWorkingDays > 0) {
            return `${((attendance.daysPresent / attendance.totalWorkingDays) * 100).toFixed(0)}%`;
        }
        return '-';
    };

    const finalRemark = useMemo(() => {
        const summary3 = summaries.terminal3;
        const exam3 = exams.terminal3;
        const nextGrade = getNextGrade(student.grade);

        if (summary3?.result === 'PASS' || summary3?.result === 'SIMPLE PASS') {
            if (student.grade === Grade.X) {
                return `Passed. School reopens on April 7, 2025`;
            }
            if (nextGrade) {
                return `Promoted to ${nextGrade}. School reopens on April 7, 2025`;
            }
            return `Promoted. School reopens on April 7, 2025`;
        } else if (summary3?.result === 'FAIL') {
            return "Detained";
        }
        return exam3?.teacherRemarks || summary3?.remark || "Awaiting final results.";
    }, [summaries.terminal3, exams.terminal3, student.grade]);

    return (
        <div>
            <table className="w-full border-collapse border border-slate-400 text-sm">
                <thead>
                    <tr className="bg-slate-100">
                        <th rowSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400 align-middle">SUBJECT</th>
                        <th colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">I Entry</th>
                        <th colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">II Entry</th>
                        <th colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">III Entry</th>
                    </tr>
                    {hasActivities && (
                        <tr className="bg-slate-100 text-xs">
                            <th className="p-1 border border-slate-400 font-semibold">Summative</th>
                            <th className="p-1 border border-slate-400 font-semibold">Activity</th>
                            <th className="p-1 border border-slate-400 font-semibold">Summative</th>
                            <th className="p-1 border border-slate-400 font-semibold">Activity</th>
                            <th className="p-1 border border-slate-400 font-semibold">Summative</th>
                            <th className="p-1 border border-slate-400 font-semibold">Activity</th>
                        </tr>
                    )}
                </thead>
                <tbody>
                    {gradeDef.subjects.map(sd => {
                        const term1Result = findResultWithAliases(exams.terminal1?.results, sd);
                        const term2Result = findResultWithAliases(exams.terminal2?.results, sd);
                        const term3Result = findResultWithAliases(exams.terminal3?.results, sd);

                        return (
                            <tr key={sd.name} className="text-center">
                                <td className="p-1 border border-slate-400 text-left font-semibold">{sd.name}</td>
                                {hasActivities ? (
                                    <>
                                        <td className="p-1 border border-slate-400">{term1Result?.examMarks ?? '-'}</td>
                                        <td className="p-1 border border-slate-400">{term1Result?.activityMarks ?? '-'}</td>
                                        <td className="p-1 border border-slate-400">{term2Result?.examMarks ?? '-'}</td>
                                        <td className="p-1 border border-slate-400">{term2Result?.activityMarks ?? '-'}</td>
                                        <td className="p-1 border border-slate-400">{term3Result?.examMarks ?? '-'}</td>
                                        <td className="p-1 border border-slate-400">{term3Result?.activityMarks ?? '-'}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-1 border border-slate-400">{term1Result?.marks ?? '-'}</td>
                                        <td className="p-1 border border-slate-400">{term2Result?.marks ?? '-'}</td>
                                        <td className="p-1 border border-slate-400">{term3Result?.marks ?? '-'}</td>
                                    </>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    {hasActivities && (
                        <tr className="font-bold text-center">
                            <td className="p-1 border border-slate-400 text-left">Total</td>
                            <td className="p-1 border border-slate-400">{summaries.terminal1?.examTotal ?? '-'}</td>
                            <td className="p-1 border border-slate-400">{summaries.terminal1?.activityTotal ?? '-'}</td>
                            <td className="p-1 border border-slate-400">{summaries.terminal2?.examTotal ?? '-'}</td>
                            <td className="p-1 border border-slate-400">{summaries.terminal2?.activityTotal ?? '-'}</td>
                            <td className="p-1 border border-slate-400">{summaries.terminal3?.examTotal ?? '-'}</td>
                            <td className="p-1 border border-slate-400">{summaries.terminal3?.activityTotal ?? '-'}</td>
                        </tr>
                    )}
                    <tr className="font-bold text-center">
                        <td className="p-1 border border-slate-400 text-left">Grand Total</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{summaries.terminal1?.grandTotal ?? '-'}</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{summaries.terminal2?.grandTotal ?? '-'}</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{summaries.terminal3?.grandTotal ?? '-'}</td>
                    </tr>
                    <tr className="font-bold text-center">
                        <td className="p-1 border border-slate-400 text-left">Result</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{summaries.terminal1?.result ?? '-'}</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{summaries.terminal2?.result ?? '-'}</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{summaries.terminal3?.result ?? '-'}</td>
                    </tr>
                    <tr className="font-bold text-center">
                        <td className="p-1 border border-slate-400 text-left">Rank</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{summaries.terminal1?.rank ?? '-'}</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{summaries.terminal2?.rank ?? '-'}</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{summaries.terminal3?.rank ?? '-'}</td>
                    </tr>
                    <tr className="font-bold text-center">
                        <td className="p-1 border border-slate-400 text-left">Percentage</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{summaries.terminal1?.percentage?.toFixed(1) ?? '-'}</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{summaries.terminal2?.percentage?.toFixed(1) ?? '-'}</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{summaries.terminal3?.percentage?.toFixed(1) ?? '-'}</td>
                    </tr>
                    <tr className="font-bold text-center">
                        <td className="p-1 border border-slate-400 text-left">Grade</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{summaries.terminal1?.academicGrade ?? '-'}</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{summaries.terminal2?.academicGrade ?? '-'}</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{summaries.terminal3?.academicGrade ?? '-'}</td>
                    </tr>
                    <tr className="font-bold text-center">
                        <td className="p-1 border border-slate-400 text-left">Attendance %</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{getAttendancePercent(exams.terminal1?.attendance)}</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{getAttendancePercent(exams.terminal2?.attendance)}</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400">{getAttendancePercent(exams.terminal3?.attendance)}</td>
                    </tr>
                </tfoot>
            </table>

            <div className="mt-4 border border-slate-400 rounded-lg p-2 text-sm break-inside-avoid">
                <strong>Final Remarks:</strong> {finalRemark}
            </div>
            
            <div className="mt-8 text-sm break-inside-avoid">
                <div className="flex justify-between items-end">
                    <div className="text-center">
                         <div className="h-8 flex flex-col justify-end pb-1 min-w-[150px]">
                             {classTeacher ? (
                                 <p className="font-bold uppercase text-slate-900 text-xs border-b border-transparent">{classTeacher.firstName} {classTeacher.lastName}</p>
                             ) : (
                                 <div className="h-4"></div>
                             )}
                        </div>
                        <p className="border-t-2 border-slate-500 pt-2 font-semibold px-4">Class Teacher's Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="h-12 min-w-[150px]"></div>
                        <p className="border-t-2 border-slate-500 pt-2 font-semibold px-4">Principal's Signature</p>
                    </div>
                </div>
                <div className="flex justify-between mt-4 text-xs text-slate-500">
                    <p>Date : {formatDateForDisplay(new Date().toISOString().split('T')[0])}</p>
                    <p>Time : {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                </div>
            </div>
        </div>
    );
};

const ReportCard: React.FC<any> = ({ student, gradeDef, exam, examTemplate, allStudents, academicYear, staff }) => {
    const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    const isClassIXorX = student.grade === Grade.IX || student.grade === Grade.X;
    const isNurseryToII = [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(student.grade);

    const processedReportData = useMemo(() => {
        return calculateTermSummary(student, exam, examTemplate.id as any, gradeDef, allStudents);
    }, [student, exam, examTemplate.id, gradeDef, allStudents]);

    const classTeacher = useMemo(() => {
        if (!staff || !gradeDef?.classTeacherId) return null;
        return staff.find((s: Staff) => s.id === gradeDef.classTeacherId);
    }, [staff, gradeDef]);

    return (
        <div className="border border-slate-400 rounded-lg overflow-hidden break-inside-avoid page-break-inside-avoid print:border-2 print:rounded-none">
            <h3 className="text-lg font-bold text-center text-slate-800 p-2 bg-slate-100 print:bg-transparent print:py-1 print:text-base print:border-b print:border-slate-400">{examTemplate.name}</h3>
            <table className="min-w-full text-sm border-collapse">
                <thead className="bg-slate-50 print:bg-transparent">
                    {isNurseryToII ? (
                        <tr className="border-b border-slate-400">
                            <th className="px-2 py-1 text-left font-semibold text-slate-600 border-r border-slate-300">Subject</th>
                            <th className="px-2 py-1 text-center font-semibold text-slate-600 border-r border-slate-300">Full Marks</th>
                            <th className="px-2 py-1 text-center font-semibold text-slate-600 border-r border-slate-300">Pass Marks</th>
                            <th className="px-2 py-1 text-center font-semibold text-slate-600">Marks Obtained</th>
                        </tr>
                    ) : hasActivities ? (
                        <>
                            <tr className="border-b border-slate-400">
                                <th rowSpan={2} className="px-2 py-1 text-left font-semibold text-slate-600 border-r border-slate-300 align-middle">Subject</th>
                                <th colSpan={2} className="px-2 py-1 text-center font-semibold text-slate-600 border-b border-r border-slate-300">Summative</th>
                                <th colSpan={2} className="px-2 py-1 text-center font-semibold text-slate-600 border-b border-r border-slate-300">Activity</th>
                                <th rowSpan={2} className="px-2 py-1 text-center font-semibold text-slate-600 align-middle">Total Obtained</th>
                            </tr>
                            <tr className="border-b border-slate-400">
                                <th className="px-2 py-1 text-center font-semibold text-slate-600 border-r border-slate-300">Full Marks</th>
                                <th className="px-2 py-1 text-center font-semibold text-slate-600 border-r border-slate-300">Marks Obt.</th>
                                <th className="px-2 py-1 text-center font-semibold text-slate-600 border-r border-slate-300">Full Marks</th>
                                <th className="px-2 py-1 text-center font-semibold text-slate-600 border-r border-slate-300">Full Marks</th>
                            </tr>
                        </>
                    ) : ( // IX & X
                         <tr className="border-b border-slate-400">
                            <th className="px-2 py-1 text-left font-semibold text-slate-600 border-r border-slate-300">Subject</th>
                            <th className="px-2 py-1 text-center font-semibold text-slate-600 border-r border-slate-300">Full Marks</th>
                            <th className="px-2 py-1 text-center font-semibold text-slate-600 border-r border-slate-300">Pass Marks</th>
                            <th className="px-2 py-1 text-center font-semibold text-slate-600">Marks Obtained</th>
                        </tr>
                    )}
                </thead>
                <tbody>
                     {gradeDef.subjects.map((sd: any) => {
                        const result = findResultWithAliases(exam?.results, sd);
                        const isGraded = sd.gradingSystem === 'OABC';
                        
                        return (
                             <tr key={sd.name} className="border-t border-slate-300">
                                <td className="px-2 py-1 font-medium border-r border-slate-300">{sd.name}</td>
                                {isNurseryToII ? (
                                    <>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{isGraded ? 'Graded' : sd.examFullMarks}</td>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{isGraded ? '-' : 35}</td>
                                        <td className="px-2 py-1 text-center font-bold">{isGraded ? (result?.grade || '-') : (result?.marks ?? 0)}</td>
                                    </>
                                ) : hasActivities ? (
                                    isGraded ? (
                                        <td colSpan={5} className="px-2 py-1 text-center font-bold">{result?.grade || '-'}</td>
                                    ) : (
                                        <>
                                            <td className="px-2 py-1 text-center border-r border-slate-300">{sd.examFullMarks}</td>
                                            <td className="px-2 py-1 text-center border-r border-slate-300">{result?.examMarks ?? 0}</td>
                                            <td className="px-2 py-1 text-center border-r border-slate-300">{sd.activityFullMarks}</td>
                                            <td className="px-2 py-1 text-center border-r border-slate-300">{result?.activityMarks ?? 0}</td>
                                            {/* Fix: Wrap calculations in Number() to avoid type errors with null/undefined */}
                                            <td className="px-2 py-1 text-center font-bold">{Number(result?.examMarks ?? 0) + Number(result?.activityMarks ?? 0)}</td>
                                        </>
                                    )
                                ) : ( // IX & X
                                    <>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{isGraded ? 'Graded' : sd.examFullMarks}</td>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{isGraded ? '-' : 33}</td>
                                        <td className="px-2 py-1 text-center font-bold">{isGraded ? (result?.grade || '-') : (result?.marks ?? 0)}</td>
                                    </>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="p-3 bg-slate-50 border-t border-slate-400 space-y-1 text-sm print:py-1 print:bg-transparent">
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {hasActivities && (
                        <>
                            <div className="font-semibold text-slate-600 text-right">Summative Total:</div>
                            <div className="font-bold text-slate-800">{processedReportData?.examTotal}</div>
                            <div className="font-semibold text-slate-600 text-right">Activity Total:</div>
                            <div className="font-bold text-slate-800">{processedReportData?.activityTotal}</div>
                        </>
                    )}
                    <div className="font-semibold text-slate-600 text-right">Grand Total:</div>
                    <div className="font-bold text-slate-800">{processedReportData?.grandTotal}</div>
                    
                    <div className="font-semibold text-slate-600 text-right">Percentage:</div>
                    <div className="font-bold text-slate-800">{processedReportData?.percentage?.toFixed(2) ?? '0.00'}%</div>

                    {!isClassIXorX && (
                        <>
                            <div className="font-semibold text-slate-600 text-right">Grade:</div>
                            <div className="font-bold text-slate-800">{processedReportData?.academicGrade}</div>
                        </>
                    )}
                    {isClassIXorX && (
                         <>
                            <div className="font-semibold text-slate-600 text-right">Division:</div>
                            <div className="font-bold text-slate-800">{processedReportData?.division}</div>
                        </>
                    )}

                    <div className="font-semibold text-slate-600 text-right">Result:</div>
                    <div className={`font-bold ${processedReportData?.result !== 'PASS' ? 'text-red-600' : 'text-emerald-600'}`}>{processedReportData?.result}</div>
                    
                    <div className="font-semibold text-slate-600 text-right">Rank:</div>
                    <div className="font-bold text-slate-800">{processedReportData?.rank}</div>
                    <div className="font-semibold text-slate-600 text-right">Attendance %:</div>
                    <div className="font-bold text-slate-800">
                        {(exam?.attendance && exam.attendance.totalWorkingDays > 0)
                            ? `${((exam.attendance.daysPresent / exam.attendance.totalWorkingDays) * 100).toFixed(0)}%`
                            : 'N/A'}
                    </div>
                </div>
                
                <div className="pt-1.5 mt-1.5 border-t">
                    <span className="font-semibold">Teacher's Remarks: </span>
                    <span>{exam?.teacherRemarks || processedReportData?.remark || 'N/A'}</span>
                </div>
            </div>
             <div className="mt-4 text-sm break-inside-avoid p-3 print:mt-2 print:pt-0">
                <div className="flex justify-between items-end">
                    <div className="text-center">
                         <div className="h-12 flex flex-col justify-end pb-1 min-w-[150px]">
                             {classTeacher ? (<p className="font-bold uppercase text-slate-900 text-xs border-b border-transparent">{classTeacher.firstName} {classTeacher.lastName}</p>) : (<div className="h-4"></div>)}
                        </div>
                        <p className="border-t-2 border-slate-500 pt-2 font-semibold px-4">Class Teacher's Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="h-12 min-w-[150px]"></div>
                        <p className="border-t-2 border-slate-500 pt-2 font-semibold px-4">Principal's Signature</p>
                    </div>
                </div>
                <div className="flex justify-between mt-4 print:mt-1">
                    <p>Date : {formatDateForDisplay(new Date().toISOString().split('T')[0])}</p>
                    <p>Time : {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                </div>
            </div>
        </div>
    );
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
      let grandTotal = 0, examTotal = 0, activityTotal = 0, fullMarksTotal = 0;
      let failedSubjectsCount = 0, gradedSubjectsPassed = 0;
      const studentMarks = marksData[student.id] || {};
      const failedSubjects: string[] = [];

      numericSubjects.forEach(sd => {
        let totalSubjectMark = 0, subjectFullMarks = 0;
        if (hasActivities) {
            const examMark = Number(studentMarks[sd.name + '_exam']) || 0;
            const activityMark = Number(studentMarks[sd.name + '_activity']) || 0;
            examTotal += examMark; activityTotal += activityMark;
            totalSubjectMark = examMark + activityMark;
            const eFM = Number(sd.examFullMarks || 0);
            const aFM = Number(sd.activityFullMarks || 0);
            subjectFullMarks = eFM + aFM;
            
            if (examMark < 20) { failedSubjectsCount++; failedSubjects.push(sd.name); }
        } else {
            totalSubjectMark = Number(studentMarks[sd.name]) || 0;
            examTotal += totalSubjectMark;
            subjectFullMarks = Number(sd.examFullMarks) || 0;
            const failLimit = isClassIXorX ? 33 : isNurseryToII ? 35 : 33;
            if (totalSubjectMark < failLimit) { failedSubjectsCount++; failedSubjects.push(sd.name); }
        }
        grandTotal += totalSubjectMark; fullMarksTotal += subjectFullMarks;
      });

      gradedSubjects.forEach(sd => {
        const gradeValue = studentMarks[sd.name];
        if (gradeValue && typeof gradeValue === 'string' && OABC_GRADES.includes(gradeValue)) gradedSubjectsPassed++;
      });
      
      const percentage = fullMarksTotal > 0 ? (grandTotal / fullMarksTotal) * 100 : 0;
      let result = (gradedSubjectsPassed < gradedSubjects.length || failedSubjectsCount > 1) ? 'FAIL' : failedSubjectsCount === 1 ? 'SIMPLE PASS' : 'PASS';
      if (isNurseryToII && failedSubjectsCount > 0) result = 'FAIL';


      let division = isClassIXorX && result === 'PASS' ? (percentage >= 75 ? 'Distinction' : percentage >= 60 ? 'I Div' : percentage >= 45 ? 'II Div' : percentage >= 35 ? 'III Div' : '-') : '-';
      let academicGrade = result === 'FAIL' ? 'E' : (percentage > 89 ? 'O' : percentage > 79 ? 'A' : percentage > 69 ? 'B' : percentage > 59 ? 'C' : 'D');
      
      let remark = '';
      if (result === 'FAIL') {
          remark = `Needs improvement in ${failedSubjects.join(', ')}`;
      } else if (result === 'SIMPLE PASS') {
          remark = `Focus on ${failedSubjects.join(', ')}`;
      } else {
          if (percentage >= 90) remark = "Outstanding performance!";
          else if (percentage >= 75) remark = "Excellent progress. Keep up the great work.";
          else if (percentage >= 60) remark = "Good progress. Well done.";
          else if (percentage >= 45) remark = "Satisfactory performance. Consistent effort will lead to better results.";
          else remark = "Passed. Consistent effort is needed to improve scores.";
      }

      return { ...student, grandTotal, examTotal, activityTotal, percentage, result, division, academicGrade, remark };
    });

    const passedStudents = studentData.filter(s => s.result === 'PASS');
    const uniqueScores = [...new Set(passedStudents.map(s => s.grandTotal))].sort((a, b) => b - a);
    
    const finalData = studentData.map(s => {
        if (s.result === 'FAIL' || s.result === 'SIMPLE PASS') {
            return { ...s, rank: '-' as const };
        }
        const rankIndex = uniqueScores.indexOf(s.grandTotal);
        return { ...s, rank: rankIndex !== -1 ? rankIndex + 1 : '-' as const };
    });
    
    let sortedData = finalData;

    if (sortCriteria === 'name') {
        sortedData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortCriteria === 'totalMarks') {
        sortedData.sort((a, b) => {
            const aIsFail = a.result === 'FAIL';
            const bIsFail = b.result === 'FAIL';

            if (aIsFail && !bIsFail) return 1;
            if (!aIsFail && bIsFail) return -1;
            
            return b.grandTotal - a.grandTotal;
        });
    } else {
        sortedData.sort((a, b) => a.rollNo - b.rollNo);
    }
    
    return sortedData;
  }, [marksData, classStudents, subjectDefinitions, hasActivities, isClassIXorX, isNurseryToII, sortCriteria]);

  const handleConfirmSave = async () => {
    if (!examDetails || changedStudents.size === 0) return;
    setIsSaving(true);

    const updatePromises = Array.from(changedStudents).map(studentId => {
        const student = classStudents.find(s => s.id === studentId);
        if (!student) return Promise.resolve();

        const studentMarks = marksData[studentId] || {};
        const originalExam = student.academicPerformance?.find(e => e.id === examId);

        const newResults = subjectDefinitions.map(sd => {
            const originalResult = originalExam?.results.find(r => normalizeSubjectName(r.subject) === normalizeSubjectName(sd.name));
            const newResult: SubjectMark = { subject: sd.name, ...(originalResult?.activityLog && { activityLog: originalResult.activityLog }) };

            if (sd.gradingSystem === 'OABC') {
                if (studentMarks[sd.name]) newResult.grade = studentMarks[sd.name] as any;
            } else if (hasActivities) {
                if (studentMarks[sd.name + '_exam'] !== undefined) newResult.examMarks = studentMarks[sd.name + '_exam'] as number;
                if (studentMarks[sd.name + '_activity'] !== undefined) newResult.activityMarks = studentMarks[sd.name + '_activity'] as number;
            } else {
                if (studentMarks[sd.name] !== undefined) newResult.marks = studentMarks[sd.name] as number;
            }
            return newResult;
        }).filter(r => r.marks != null || r.examMarks != null || r.activityMarks != null || r.grade != null);

        const newExamData: Exam = {
            id: examId as any,
            name: examDetails.name,
            results: newResults,
        };
        
        if (attendanceData[studentId]?.totalWorkingDays != null && attendanceData[studentId]?.daysPresent != null) {
            newExamData.attendance = { 
                totalWorkingDays: attendanceData[studentId].totalWorkingDays!, 
                daysPresent: attendanceData[studentId].daysPresent! 
            };
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
        if(grade) {
            await onUpdateGradeDefinition(grade, newDef);
            setIsEditSubjectsModalOpen(false);
        }
  }

  if (!grade || !examDetails) return <div>Error: Invalid grade or exam.</div>;

  return (
    <>
    <div id="mark-statement-container" className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center print-hidden">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800"><BackIcon className="w-5 h-5"/> Back</button>
            <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home"><HomeIcon className="w-5 h-5"/> Home</Link>
        </div>
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">Mark Entry</h1>
            <p className="text-slate-600 mt-1 text-lg"><span className="font-semibold">Class:</span> {grade} | <span className="font-semibold">Exam:</span> {examDetails.name}</p>
        </div>

        <div className="mt-6 flex justify-end items-center gap-2 print-hidden">
            <span className="text-sm font-semibold text-slate-600">Sort by:</span>
            <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-100">
                <button 
                    onClick={() => setSortCriteria('rollNo')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${sortCriteria === 'rollNo' ? 'bg-sky-600 text-white shadow' : 'text-slate-600 hover:bg-white'}`}
                >
                    Roll No
                </button>
                <button
                    onClick={() => setSortCriteria('name')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${sortCriteria === 'name' ? 'bg-sky-600 text-white shadow' : 'text-slate-600 hover:bg-white'}`}
                >
                    Name
                </button>
                <button
                    onClick={() => setSortCriteria('totalMarks')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${sortCriteria === 'totalMarks' ? 'bg-sky-600 text-white shadow' : 'text-slate-600 hover:bg-white'}`}
                >
                    Total Marks
                </button>
            </div>
        </div>
        
        <div className="mt-2 overflow-x-auto border rounded-lg">
            <table id="mark-statement-table" className="min-w-full text-sm">
                 <thead className="bg-slate-100">
                    <tr>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-left font-bold text-slate-800 sticky left-0 bg-slate-100 z-10 border-b border-r w-16 align-middle">No</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-left font-bold text-slate-800 border-b border-r min-w-48 align-middle">Student Name</th>
                        
                        {subjectDefinitions.map(sd => {
                            if (hasActivities && sd.gradingSystem !== 'OABC') {
                                return <th key={sd.name} colSpan={2} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l">{sd.name}</th>;
                            } else {
                                return <th key={sd.name} rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">{sd.name}</th>;
                            }
                        })}
                        
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Total</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Percentage</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Rank</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">{isClassIXorX ? 'Division' : '-'}</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Result</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-left font-bold text-slate-800 border-b border-l min-w-48 align-middle">Remark</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Working Days</th>
                        <th rowSpan={hasActivities ? 2 : 1} className="px-3 py-2 text-center font-bold text-slate-800 border-b border-l align-middle">Days Present</th>
                    </tr>
                    {hasActivities && (
                        <tr>
                            {subjectDefinitions.flatMap(sd => 
                                sd.gradingSystem !== 'OABC' ? [
                                    <th key={`${sd.name}-exam`} className="px-2 py-1 text-center font-semibold text-slate-600 text-xs border-b border-l">Exam</th>,
                                    <th key={`${sd.name}-activity`} className="px-2 py-1 text-center font-semibold text-slate-600 text-xs border-b border-l border-r">Activity</th>
                                ] : []
                            )}
                        </tr>
                    )}
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {processedData.map(student => (
                        <tr key={student.id} className={`hover:bg-slate-50 ${changedStudents.has(student.id) ? 'bg-sky-50' : ''}`}>
                            <td className="px-3 py-2 font-bold text-center border-r sticky left-0 bg-inherit">{student.rollNo}</td>
                            <td className="px-3 py-2 font-medium border-r">{student.name}</td>
                            
                            {subjectDefinitions.map(sd => {
                                const isOABC = sd.gradingSystem === 'OABC';

                                if (isOABC) {
                                    return (
                                        <td key={sd.name} colSpan={1} className="px-1 py-1 border-l text-center">
                                            <select
                                                value={marksData[student.id]?.[sd.name] as string ?? ''}
                                                onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'grade')}
                                                className="form-select w-20 text-center"
                                            >
                                                <option value="">-</option>
                                                {OABC_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </td>
                                    );
                                }

                                if (hasActivities) {
                                    return (
                                        <React.Fragment key={sd.name}>
                                            <td className="px-1 py-1 border-l text-center">
                                                <input type="number" value={marksData[student.id]?.[sd.name + '_exam'] ?? ''} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'exam')} className="form-input w-20 text-center" placeholder="-" />
                                            </td>
                                            <td className="px-1 py-1 border-l text-center">
                                                <input type="number" value={marksData[student.id]?.[sd.name + '_activity'] ?? ''} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'activity')} className="form-input w-20 text-center" placeholder="-" />
                                            </td>
                                        </React.Fragment>
                                    );
                                }
                                
                                return (
                                    <td key={sd.name} className="px-1 py-1 border-l text-center">
                                        <input type="number" value={marksData[student.id]?.[sd.name] ?? ''} onChange={(e) => handleMarkChange(student.id, sd.name, e.target.value, 'total')} className="form-input w-20 text-center" placeholder="-" />
                                    </td>
                                );
                            })}

                            <td className="px-3 py-2 text-center font-bold text-sky-700 border-l">{student.grandTotal}</td>
                            <td className="px-3 py-2 text-center border-l">{student.percentage.toFixed(2)}</td>
                            <td className="px-3 py-2 text-center font-bold border-l">{student.rank}</td>
                            <td className="px-3 py-2 text-center border-l">{isClassIXorX ? student.division : '-'}</td>
                            <td className={`px-3 py-2 text-center font-bold border-l ${student.result === 'PASS' || student.result === 'SIMPLE PASS' ? 'text-emerald-600' : 'text-red-600'}`}>{student.result}</td>
                            <td className="px-3 py-2 text-sm border-l">{student.remark}</td>
                            <td className="px-1 py-1 border-l">
                                <input type="number" value={attendanceData[student.id]?.totalWorkingDays ?? ''} onChange={(e) => handleAttendanceChange(student.id, 'totalWorkingDays', e.target.value)} className="form-input w-20 text-center" />
                            </td>
                            <td className="px-1 py-1 border-l">
                                <input type="number" value={attendanceData[student.id]?.daysPresent ?? ''} onChange={(e) => handleAttendanceChange(student.id, 'daysPresent', e.target.value)} className="form-input w-20 text-center" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="mt-6 flex justify-end gap-4 print-hidden">
            <button onClick={() => setIsEditSubjectsModalOpen(true)} className="btn btn-secondary">
                <CogIcon className="w-5 h-5" /> Manage Subjects
            </button>
            <Link
                to={`/portal/reports/bulk-print/${encodedGrade}/${examId}`}
                target="_blank"
                className="btn btn-secondary"
            >
                <PrinterIcon className="w-5 h-5" />
                Bulk Print Reports
            </Link>
            <button onClick={() => setIsImportModalOpen(true)} className="btn btn-secondary">
                <InboxArrowDownIcon className="w-5 h-5" /> Import Marks
            </button>
            <button
                onClick={() => setIsConfirmSaveModalOpen(true)}
                disabled={isSaving || changedStudents.size === 0}
                className="btn btn-primary"
            >
                {isSaving ? <SpinnerIcon className="w-5 h-5"/> : <SaveIcon className="w-5 h-5" />}
                <span>Save Changes ({changedStudents.size})</span>
            </button>
        </div>
    </div>
    
    <ConfirmationModal
        isOpen={isConfirmSaveModalOpen}
        onClose={() => setIsConfirmSaveModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Save Changes"
        confirmDisabled={isSaving}
    >
        <p>Save marks for {changedStudents.size} student(s)?</p>
    </ConfirmationModal>

    {examDetails && <ImportMarksModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onApplyImport={handleApplyImport}
        classStudents={classStudents}
        subjectDefinitions={subjectDefinitions}
        examName={examDetails.name}
        hasActivities={hasActivities}
        isSaving={isSaving}
    />}
    
    {grade && gradeDefinitions[grade] && <EditSubjectsModal
        isOpen={isEditSubjectsModalOpen}
        onClose={() => setIsEditSubjectsModalOpen(false)}
        onSave={handleSaveSubjects}
        grade={grade}
        initialGradeDefinition={gradeDefinitions[grade]}
    />}
    </>
  );
};

export default ClassMarkStatementPage;
