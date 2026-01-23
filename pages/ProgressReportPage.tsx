
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Student, Grade, GradeDefinition, Exam, StudentStatus, Staff, Attendance, SubjectMark, SubjectDefinition } from '../types';
import { BackIcon, PrinterIcon } from '../components/Icons';
import { TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES, SCHOOL_BANNER_URL } from '../constants';
import { formatDateForDisplay, normalizeSubjectName, formatStudentId, getNextGrade } from '../utils';
import { db } from '../firebaseConfig';

interface ProgressReportPageProps {
  students: Student[];
  staff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
}

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
        
        let grandTotal = 0, examTotal = 0, activityTotal = 0, fullMarksTotal = 0;
        let failedSubjectsCount = 0;
        let gradedSubjectsPassed = 0;
        const failedSubjects: string[] = [];

        numericSubjects.forEach(sd => {
            const result = findResultWithAliases(studentExam?.results, sd);
            let totalSubjectMark = 0, subjectFullMarks = 0;

            if (hasActivities) {
                const examMark = result?.examMarks ?? 0;
                const activityMark = result?.activityMarks ?? 0;
                examTotal += examMark;
                activityTotal += activityMark;
                totalSubjectMark = examMark + activityMark;
                subjectFullMarks = sd.examFullMarks + sd.activityFullMarks;
                if (examMark < 20) { failedSubjectsCount++; failedSubjects.push(sd.name); }
            } else {
                totalSubjectMark = result?.marks ?? 0;
                examTotal += totalSubjectMark;
                subjectFullMarks = sd.examFullMarks;
                const failLimit = isClassIXorX ? 33 : 35; // KG, I, II use 35
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

        return { id: s.id, grandTotal, examTotal, activityTotal, percentage, result: resultStatus, division, academicGrade, remark };
    });

    const passedStudents = studentData.filter(s => s.result === 'PASS');
    const uniqueScores = [...new Set(passedStudents.map(s => s.grandTotal))].sort((a,b) => b-a);

    const finalRankedData = new Map<string, typeof studentData[0] & {rank: number | '-'}>();
    
    studentData.forEach(s => {
        if (s.result !== 'PASS') {
            finalRankedData.set(s.id, { ...s, rank: '-' });
        } else {
            const rankIndex = uniqueScores.indexOf(s.grandTotal);
            const rank = rankIndex !== -1 ? rankIndex + 1 : '-';
            finalRankedData.set(s.id, { ...s, rank });
        }
    });
    
    return finalRankedData.get(student.id) || null;
};

// --- MULTI-TERM FINAL REPORT COMPONENT ---

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
                        <div className="h-8 min-w-[150px]"></div>
                        <p className="border-t-2 border-slate-500 pt-2 font-semibold px-4">Principal's Signature</p>
                    </div>
                </div>
                <div className="flex justify-between mt-4 text-xs text-slate-500">
                    <p>Date : {formatDateForDisplay(new Date().toISOString().split('T')[0])}</p>
                </div>
            </div>
        </div>
    );
};

const SingleTermReportCard: React.FC<{
    student: Student;
    gradeDef: GradeDefinition;
    exam: Exam | undefined;
    examTemplate: { id: string; name: string; } | undefined;
    summary: ReturnType<typeof calculateTermSummary>;
    staff: Staff[];
}> = ({ student, gradeDef, exam, examTemplate, summary, staff }) => {
    const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    const isClassIXorX = student.grade === Grade.IX || student.grade === Grade.X;
    const isNurseryToII = [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(student.grade);
    const classTeacher = staff.find(s => s.id === gradeDef?.classTeacherId);

    return (
        <div className="border border-slate-400 rounded-lg overflow-hidden break-inside-avoid page-break-inside-avoid print:border-2 print:rounded-none">
            <h3 className="text-lg font-bold text-center text-slate-800 p-2 bg-slate-100 print:bg-transparent print:py-1 print:text-base print:border-b print:border-slate-400">{examTemplate?.name}</h3>
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
                                            <td className="px-2 py-1 text-center font-bold">{(result?.examMarks ?? 0) + (result?.activityMarks ?? 0)}</td>
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
                            <div className="font-bold text-slate-800">{summary?.examTotal}</div>
                            <div className="font-semibold text-slate-600 text-right">Activity Total:</div>
                            <div className="font-bold text-slate-800">{summary?.activityTotal}</div>
                        </>
                    )}
                    <div className="font-semibold text-slate-600 text-right">Grand Total:</div>
                    <div className="font-bold text-slate-800">{summary?.grandTotal}</div>
                    <div className="font-semibold text-slate-600 text-right">Percentage:</div>
                    <div className="font-bold text-slate-800">{summary?.percentage?.toFixed(2) ?? '0.00'}%</div>
                    {!isClassIXorX && <><div className="font-semibold text-slate-600 text-right">Grade:</div><div className="font-bold text-slate-800">{summary?.academicGrade}</div></>}
                    {isClassIXorX && <><div className="font-semibold text-slate-600 text-right">Division:</div><div className="font-bold text-slate-800">{summary?.division}</div></>}
                    <div className="font-semibold text-slate-600 text-right">Result:</div>
                    <div className={`font-bold ${summary?.result !== 'PASS' ? 'text-red-600' : 'text-emerald-600'}`}>{summary?.result}</div>
                    <div className="font-semibold text-slate-600 text-right">Rank:</div>
                    <div className="font-bold text-slate-800">{summary?.rank}</div>
                    <div className="font-semibold text-slate-600 text-right">Attendance %:</div>
                    <div className="font-bold text-slate-800">
                        {(exam?.attendance && exam.attendance.totalWorkingDays > 0)
                            ? `${((exam.attendance.daysPresent / exam.attendance.totalWorkingDays) * 100).toFixed(0)}%`
                            : 'N/A'}
                    </div>
                </div>
                <div className="pt-1.5 mt-1.5 border-t">
                    <span className="font-semibold">Teacher's Remarks: </span>
                    <span>{exam?.teacherRemarks || summary?.remark || 'N/A'}</span>
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
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

const ProgressReportPage: React.FC<ProgressReportPageProps> = ({ students, staff, gradeDefinitions, academicYear }) => {
    const { studentId, examId } = useParams() as { studentId: string; examId: string };
    const navigate = useNavigate();

    const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);
    const [classmates, setClassmates] = useState<Student[]>([]);
    
    useEffect(() => {
        if (student) {
            // This could be optimized to not re-fetch if students prop is comprehensive
            const unsubscribe = db.collection('students')
                .where('grade', '==', student.grade)
                .where('status', '==', StudentStatus.ACTIVE)
                .onSnapshot(snapshot => {
                    const fetchedClassmates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
                    setClassmates(fetchedClassmates);
                });
            
            return () => unsubscribe();
        }
    }, [student]);

    const gradeDef = useMemo(() => {
        if (!student || !gradeDefinitions[student.grade]) return null;
        return gradeDefinitions[student.grade];
    }, [student, gradeDefinitions]);

    const exams = useMemo(() => ({
        terminal1: student?.academicPerformance?.find(e => e.id === 'terminal1'),
        terminal2: student?.academicPerformance?.find(e => e.id === 'terminal2'),
        terminal3: student?.academicPerformance?.find(e => e.id === 'terminal3'),
    }), [student?.academicPerformance]);

    const summaries = {
        terminal1: useMemo(() => student && gradeDef && classmates.length > 0 ? calculateTermSummary(student, exams.terminal1, 'terminal1', gradeDef, classmates) : null, [student, exams.terminal1, gradeDef, classmates]),
        terminal2: useMemo(() => student && gradeDef && classmates.length > 0 ? calculateTermSummary(student, exams.terminal2, 'terminal2', gradeDef, classmates) : null, [student, exams.terminal2, gradeDef, classmates]),
        terminal3: useMemo(() => student && gradeDef && classmates.length > 0 ? calculateTermSummary(student, exams.terminal3, 'terminal3', gradeDef, classmates) : null, [student, exams.terminal3, gradeDef, classmates]),
    };
    
    if (!student || !examId) return <div className="p-8 text-center">Invalid student or exam specified.</div>;
    if (!gradeDef) return <div className="p-8 text-center">Curriculum not defined for this student's grade.</div>;
    
    const handlePrint = () => window.print();

    const currentExam = exams[examId as keyof typeof exams];
    const currentSummary = summaries[examId as keyof typeof summaries];
    const currentExamTemplate = TERMINAL_EXAMS.find(e => e.id === examId);

    return (
        <div className="bg-slate-100 min-h-screen p-4 sm:p-8 print:bg-white print:p-0">
            <style>{`
                @page { size: A4 portrait; margin: 1.5cm; }
                @media print {
                    html, body { background-color: white; height: auto; margin: 0; padding: 0; }
                    body > *:not(#root) { display: none; }
                    #printable-report { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; }
                    .report-card-wrapper { page-break-inside: avoid; break-inside: avoid; }
                }
            `}</style>
            
            <div className="max-w-4xl mx-auto print:w-full print:max-w-none">
                <div className="mb-6 flex justify-between items-center print:hidden">
                    <button onClick={() => navigate(-1)} className="btn btn-secondary"><BackIcon className="w-5 h-5"/> Back</button>
                    <button onClick={handlePrint} className="btn btn-primary"><PrinterIcon className="w-5 h-5"/> Print Report</button>
                </div>

                <div id="printable-report" className="bg-white p-6 shadow-lg print:shadow-none print:p-0">
                    <header className="text-center mb-4">
                         {examId !== 'terminal3' ? (
                            <img src={SCHOOL_BANNER_URL} alt="School Banner" className="w-full h-auto mb-2"/>
                        ) : (
                            <div className="h-32 md:h-40 print:h-48" aria-hidden="true"></div>
                        )}
                        <h2 className="text-xl font-semibold inline-block border-b-2 border-slate-700 px-8 pb-1 mt-4 print:mt-2 print:text-lg">
                            STUDENT'S PROGRESS REPORT
                        </h2>
                        <p className="font-semibold mt-1 text-sm">Academic Session: {academicYear}</p>
                    </header>

                    <section className="mb-4 p-3 border-2 border-slate-400 rounded-lg grid grid-cols-2 md:grid-cols-3 gap-x-2 gap-y-1 text-sm print:grid-cols-3 print:gap-y-0.5 print:mb-2">
                        <div><strong className="text-slate-600">Student's Name:</strong> <span className="font-bold text-base ml-1">{student.name}</span></div>
                        <div><strong className="text-slate-600">Father's Name:</strong> <span className="font-bold text-base ml-1">{student.fatherName}</span></div>
                        <div><strong className="text-slate-600">Date of Birth:</strong> <span className="font-bold text-base ml-1">{formatDateForDisplay(student.dateOfBirth)}</span></div>
                        <div><strong className="text-slate-600">Class:</strong> <span className="font-bold text-base ml-1">{student.grade}</span></div>
                        <div><strong className="text-slate-600">Roll No:</strong> <span className="font-bold text-base ml-1">{student.rollNo}</span></div>
                        <div><strong className="text-slate-600">Student ID:</strong> <span className="font-bold text-base ml-1">{formatStudentId(student, academicYear)}</span></div>
                    </section>
                    
                     <section className="mt-4 print:mt-2">
                        {examId === 'terminal3' ? (
                            <MultiTermReportCard 
                                student={student}
                                gradeDef={gradeDef}
                                exams={exams}
                                summaries={summaries}
                                staff={staff}
                            />
                        ) : (
                            <SingleTermReportCard
                                student={student}
                                gradeDef={gradeDef}
                                exam={currentExam}
                                examTemplate={currentExamTemplate}
                                summary={currentSummary}
                                staff={staff}
                            />
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProgressReportPage;
