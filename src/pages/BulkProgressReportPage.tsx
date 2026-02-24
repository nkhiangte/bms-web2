import React, { useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Grade, GradeDefinition, Exam, StudentStatus, Staff, Attendance, SubjectMark, SubjectDefinition } from '@/types';
import { BackIcon, PrinterIcon } from '@/components/Icons';
import { TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES, SCHOOL_BANNER_URL } from '@/constants';
import { formatDateForDisplay, normalizeSubjectName, formatStudentId, getNextGrade, subjectsMatch } from '@/utils';

const { useParams, useNavigate } = ReactRouterDOM as any;

interface ProgressReportPageProps {
  students: Student[];
  staff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
}

const findResultWithAliases = (results: SubjectMark[] | undefined, subjectDef: SubjectDefinition) => {
    if (!subjectDef?.name) return undefined;
    if (!results) return undefined;
    if (!Array.isArray(results)) {
        console.warn('[BulkReport] results is not an array:', typeof results, results);
        return undefined;
    }
    return results.find(r => r?.subject != null && subjectsMatch(r.subject, subjectDef.name));
};

const calculateTermSummary = (
    student: Student,
    exam: Exam | undefined,
    examId: 'terminal1' | 'terminal2' | 'terminal3',
    gradeDef: GradeDefinition,
    allStudents: Student[]
) => {
    if (!gradeDef) return null;

    // Fix: Dynamically find all subjects present in the Firestore results
    const subjectsMap = new Map<string, SubjectDefinition>();
    (gradeDef.subjects || []).forEach(s => subjectsMap.set(normalizeSubjectName(s.name), s));

    if (exam?.results) {
        exam.results.forEach(res => {
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
    const activeSubjects = Array.from(subjectsMap.values());

    const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    const isClassIXorX = student.grade === Grade.IX || student.grade === Grade.X;
    const isNurseryToII = [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(student.grade);

    const classmates = allStudents.filter(s => s.grade === student.grade && s.status === StudentStatus.ACTIVE);
    const numericSubjects = activeSubjects.filter(sd => sd.gradingSystem !== 'OABC');
    const gradedSubjects = activeSubjects.filter(sd => sd.gradingSystem === 'OABC');
   

    const studentData = classmates.map(s => {
        const sExam = s.academicPerformance?.find((e) => {
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
        
        let gTotal = 0;
        let fSubjects = 0;
        let gSubjectsPassed = 0;

        numericSubjects.forEach(sd => {
            const r = findResultWithAliases(sExam?.results, sd);
            let totalMark = 0;
            if (hasActivities) {
                const eMark = Number(r?.examMarks ?? 0);
                const aMark = Number(r?.activityMarks ?? 0);
                totalMark = eMark + aMark;
                if (eMark < 20) fSubjects++;
            } else if (isClassIXorX && examId === 'terminal3') {
                const saMark = Number(r?.saMarks ?? r?.marks ?? 0);
                const faMark = Number(r?.faMarks ?? 0);
                totalMark = r?.saMarks != null ? saMark + faMark : Number(r?.marks ?? 0);
                if (totalMark < 33) fSubjects++;
            } else {
                totalMark = Number(r?.marks ?? 0);
                const limit = isClassIXorX ? 33 : 35;
                if (totalMark < limit) fSubjects++;
            }
            gTotal += totalMark;
        });

        gradedSubjects.forEach(sd => {
            const r = findResultWithAliases(sExam?.results, sd);
            if (r?.grade && OABC_GRADES.includes(r.grade as any)) gSubjectsPassed++;
        });

        let res = 'PASS';
        if (gSubjectsPassed < gradedSubjects.length) res = 'FAIL';
        else if (fSubjects > 1) res = 'FAIL';
        else if (fSubjects === 1) res = 'SIMPLE PASS';
        if (isNurseryToII && fSubjects > 0) res = 'FAIL';

        return { id: s.id, grandTotal: gTotal, result: res };
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
    const failedSubjects: string[] = [];
    let gradedSubjectsPassed = 0;

    numericSubjects.forEach(sd => {
        const result = findResultWithAliases(exam?.results, sd);
        let totalSubjectMark = 0;
        let subjectFullMarks = 0;

        if (hasActivities) {
            const examMark = Number(result?.examMarks ?? 0);
            const activityMark = Number(result?.activityMarks ?? 0);
            examTotal += examMark;
            activityTotal += activityMark;
            totalSubjectMark = examMark + activityMark;
            subjectFullMarks = (sd.examFullMarks ?? 0) + (sd.activityFullMarks ?? 0);
            if (examMark < 20) failedSubjects.push(sd.name);
        } else {
            totalSubjectMark = Number(result?.marks ?? 0);
            examTotal += totalSubjectMark;
            subjectFullMarks = sd.examFullMarks;
            const failLimit = isClassIXorX ? 33 : 35;
            if (totalSubjectMark < failLimit) failedSubjects.push(sd.name);
        }
        grandTotal += totalSubjectMark;
        fullMarksTotal += subjectFullMarks;
    });

    gradedSubjects.forEach(sd => {
        const result = findResultWithAliases(exam?.results, sd);
        if (result?.grade && OABC_GRADES.includes(result.grade as any)) gradedSubjectsPassed++;
    });

    const percentage = fullMarksTotal > 0 ? (grandTotal / fullMarksTotal) * 100 : 0;
    
    let division = '-';
    if (isClassIXorX && currentStudentStats.result === 'PASS') {
        if (percentage >= 75) division = 'Distinction';
        else if (percentage >= 60) division = 'I Div';
        else if (percentage >= 45) division = 'II Div';
        else if (percentage >= 35) division = 'III Div';
    }

    let academicGrade = '-';
    if (currentStudentStats.result === 'FAIL') academicGrade = 'E';
    else {
        if (percentage > 89) academicGrade = 'O';
        else if (percentage > 79) academicGrade = 'A';
        else if (percentage > 69) academicGrade = 'B';
        else if (percentage > 59) academicGrade = 'C';
        else academicGrade = 'D';
    }

    let remark = '';
    if (currentStudentStats.result === 'FAIL') {
        remark = `Needs significant improvement${failedSubjects.length > 0 ? ` in ${failedSubjects.join(', ')}` : ''}.`;
    } else if (currentStudentStats.result === 'SIMPLE PASS') {
        remark = `Simple Pass. Focus on improving in ${failedSubjects.join(', ')}.`;
    } else if (currentStudentStats.result === 'PASS') {
        if (percentage >= 90) remark = "Outstanding performance!";
        else if (percentage >= 75) remark = "Excellent performance.";
        else if (percentage >= 60) remark = "Good performance.";
        else if (percentage >= 45) remark = "Satisfactory performance.";
        else remark = "Passed. Needs to work harder.";
    }

    return { 
        id: student.id, 
        grandTotal, 
        examTotal, 
        activityTotal, 
        percentage, 
        result: currentStudentStats.result, 
        division, 
        academicGrade, 
        remark, 
        rank 
    };
};

// ─── CELL STYLE CONSTANTS ────────────────────────────────────────────────────
const TD = "p-2 border border-slate-400";
const TH = "p-2 border border-slate-400";

const MultiTermReportCard: React.FC<{
    student: Student;
    gradeDef: GradeDefinition;
    exams: Record<'terminal1' | 'terminal2' | 'terminal3', Exam | undefined>;
    summaries: Record<'terminal1' | 'terminal2' | 'terminal3', ReturnType<typeof calculateTermSummary>>;
    staff: Staff[];
}> = ({ student, gradeDef, exams, summaries, staff }) => {
    const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    const isIXorX = student.grade === Grade.IX || student.grade === Grade.X;
    const isIXTerminal3Report = student.grade === Grade.IX;
    const isNurseryToII = [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(student.grade);
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

        const gradeLabel: Record<string, string> = {
            'Nursery': 'Nursery', 'Kindergarten': 'Kindergarten',
            'Class I': 'Class I', 'Class II': 'Class II', 'Class III': 'Class III',
            'Class IV': 'Class IV', 'Class V': 'Class V', 'Class VI': 'Class VI',
            'Class VII': 'Class VII', 'Class VIII': 'Class VIII', 'Class IX': 'Class IX',
        };
        const nextGradeLabel = nextGrade ? (gradeLabel[nextGrade] ?? nextGrade) : null;

        if (summary3?.result === 'PASS' || summary3?.result === 'SIMPLE PASS') {
            if (student.grade === Grade.X) {
                return `Passed Class X. School reopens on April 1, 2026`;
            }
            if (nextGradeLabel) {
                return `Promoted to ${nextGradeLabel}. School reopens on April 1, 2026`;
            }
            return `Promoted. School reopens on April 1, 2026`;
        } else if (summary3?.result === 'FAIL') {
            return "Detained";
        }
        return exam3?.teacherRemarks || summary3?.remark || "Awaiting final results.";
    }, [summaries.terminal3, exams.terminal3, student.grade]);

    return (
        <div>
            <style>
                {`@media print { 
                    body { font-size: 15px !important; } 
                    table { font-size: 15px !important; }
                    .report-signatures { margin-top: 3rem !important; }
                }`}
            </style>
            {/* fontSize 15 on the whole table for better readability */}
            <table className="w-full border-collapse border border-slate-400" style={{ fontSize: 15 }}>
                <thead>
                    <tr className="bg-slate-100">
                        <th rowSpan={hasActivities ? 2 : 1} className={`${TH} align-middle`}>SUBJECT</th>
                        {!hasActivities && (
                            <>
                                <th className={TH}>Full Marks</th>
                                <th className={TH}>Pass Marks</th>
                            </>
                        )}
                        <th colSpan={2} className={TH}>I Entry</th>
                        <th colSpan={2} className={TH}>II Entry</th>
                        <th colSpan={2} className={TH}>III Entry</th>
                    </tr>
                    {hasActivities && (
                        <tr className="bg-slate-100 text-xs">
                            <th className={`${TH} font-semibold`}>Summative<br/>60</th>
                            <th className={`${TH} font-semibold`}>Activity<br/>40</th>
                            <th className={`${TH} font-semibold`}>Summative<br/>60</th>
                            <th className={`${TH} font-semibold`}>Activity<br/>40</th>
                            <th className={`${TH} font-semibold`}>Summative<br/>60</th>
                            <th className={`${TH} font-semibold`}>Activity<br/>40</th>
                        </tr>
                    )}
                </thead>
                <tbody>
                    {(() => {
                        const subjectsMap = new Map<string, SubjectDefinition>();
                        (gradeDef.subjects || []).forEach(s => subjectsMap.set(normalizeSubjectName(s.name), s));
                        
                        // Add any subjects from exam results that aren't in gradeDef
                        exams.terminal3?.results?.forEach(res => {
                            const normalized = normalizeSubjectName(res.subject);
                            if (!subjectsMap.has(normalized)) {
                                subjectsMap.set(normalized, {
                                    name: res.subject, examFullMarks: 100, activityFullMarks: 0,
                                    gradingSystem: res.grade ? 'OABC' : 'Numerical'
                                });
                            }
                        });
                        return Array.from(subjectsMap.values());
                    })().map((sd: any) => {
                        const isGraded = sd.gradingSystem === 'OABC';
                        const result1 = findResultWithAliases(exams.terminal1?.results, sd);
                        const result2 = findResultWithAliases(exams.terminal2?.results, sd);
                        const result3 = findResultWithAliases(exams.terminal3?.results, sd);
                        
                        return (
                            <tr key={sd.name} className="border-t border-slate-300">
                                <td className="px-2 py-1 font-medium border-r border-slate-300">{sd.name}</td>
                                {!hasActivities && (
                                    <>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{isGraded ? 'Graded' : (sd.examFullMarks ?? 100)}</td>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{isGraded ? '-' : 35}</td>
                                    </>
                                )}
                                {hasActivities && !isGraded ? (
                                    <>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{result1?.examMarks ?? 0}</td>
                                        <td className="px-2 py-1 text-center font-bold border-r border-slate-300">{result1?.activityMarks ?? 0}</td>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{result2?.examMarks ?? 0}</td>
                                        <td className="px-2 py-1 text-center font-bold border-r border-slate-300">{result2?.activityMarks ?? 0}</td>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{result3?.examMarks ?? 0}</td>
                                        <td className="px-2 py-1 text-center font-bold">{result3?.activityMarks ?? 0}</td>
                                    </>
                                ) : hasActivities && isGraded ? (
                                    <>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{result1?.grade || '-'}</td>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{result1?.grade || '-'}</td>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{result2?.grade || '-'}</td>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{result2?.grade || '-'}</td>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{result3?.grade || '-'}</td>
                                        <td className="px-2 py-1 text-center">{result3?.grade || '-'}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-2 py-1 text-center font-bold border-r border-slate-300">{isGraded ? (result1?.grade || '-') : (result1?.marks ?? 0)}</td>
                                        <td className="px-2 py-1 text-center font-bold border-r border-slate-300">{isGraded ? (result2?.grade || '-') : (result2?.marks ?? 0)}</td>
                                        <td className="px-2 py-1 text-center font-bold">{isGraded ? (result3?.grade || '-') : (result3?.marks ?? 0)}</td>
                                    </>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr className="font-bold text-center">
                        <td className={`${TD} text-left`}>Grand Total</td>
                        {!hasActivities && (
                            <>
                                <td className={TD}></td>
                                <td className={TD}></td>
                            </>
                        )}
                        {hasActivities ? (
                            <>
                                <td className={TD}>{summaries.terminal1?.examTotal ?? '-'}</td>
                                <td className={TD}>{summaries.terminal1?.activityTotal ?? '-'}</td>
                                <td className={TD}>{summaries.terminal2?.examTotal ?? '-'}</td>
                                <td className={TD}>{summaries.terminal2?.activityTotal ?? '-'}</td>
                                <td className={TD}>{summaries.terminal3?.examTotal ?? '-'}</td>
                                <td className={TD}>{summaries.terminal3?.activityTotal ?? '-'}</td>
                            </>
                        ) : (
                            <>
                                <td className={TD}>{summaries.terminal1?.grandTotal ?? '-'}</td>
                                <td className={TD}>{summaries.terminal2?.grandTotal ?? '-'}</td>
                                <td className={TD}>{summaries.terminal3?.grandTotal ?? '-'}</td>
                            </>
                        )}
                    </tr>
                    <tr className="font-bold text-center">
                        <td className={`${TD} text-left`}>Result</td>
                        {!hasActivities && (
                            <>
                                <td className={TD}></td>
                                <td className={TD}></td>
                            </>
                        )}
                        {hasActivities ? (
                            <>
                                <td colSpan={2} className={TD}>{summaries.terminal1?.result ?? '-'}</td>
                                <td colSpan={2} className={TD}>{summaries.terminal2?.result ?? '-'}</td>
                                <td colSpan={2} className={TD}>{summaries.terminal3?.result ?? '-'}</td>
                            </>
                        ) : (
                            <>
                                <td className={TD}>{summaries.terminal1?.result ?? '-'}</td>
                                <td className={TD}>{summaries.terminal2?.result ?? '-'}</td>
                                <td className={TD}>{summaries.terminal3?.result ?? '-'}</td>
                            </>
                        )}
                    </tr>
                    <tr className="font-bold text-center">
                        <td className={`${TD} text-left`}>Rank</td>
                        {!hasActivities && (
                            <>
                                <td className={TD}></td>
                                <td className={TD}></td>
                            </>
                        )}
                        {hasActivities ? (
                            <>
                                <td colSpan={2} className={TD}>{summaries.terminal1?.rank ?? '-'}</td>
                                <td colSpan={2} className={TD}>{summaries.terminal2?.rank ?? '-'}</td>
                                <td colSpan={2} className={TD}>{summaries.terminal3?.rank ?? '-'}</td>
                            </>
                        ) : (
                            <>
                                <td className={TD}>{summaries.terminal1?.rank ?? '-'}</td>
                                <td className={TD}>{summaries.terminal2?.rank ?? '-'}</td>
                                <td className={TD}>{summaries.terminal3?.rank ?? '-'}</td>
                            </>
                        )}
                    </tr>
                    <tr className="font-bold text-center">
                        <td className={`${TD} text-left`}>Percentage</td>
                        {!hasActivities && (
                            <>
                                <td className={TD}></td>
                                <td className={TD}></td>
                            </>
                        )}
                        {hasActivities ? (
                            <>
                                <td colSpan={2} className={TD}>{summaries.terminal1?.percentage?.toFixed(1) ?? '-'}</td>
                                <td colSpan={2} className={TD}>{summaries.terminal2?.percentage?.toFixed(1) ?? '-'}</td>
                                <td colSpan={2} className={TD}>{summaries.terminal3?.percentage?.toFixed(1) ?? '-'}</td>
                            </>
                        ) : (
                            <>
                                <td className={TD}>{summaries.terminal1?.percentage?.toFixed(1) ?? '-'}</td>
                                <td className={TD}>{summaries.terminal2?.percentage?.toFixed(1) ?? '-'}</td>
                                <td className={TD}>{summaries.terminal3?.percentage?.toFixed(1) ?? '-'}</td>
                            </>
                        )}
                    </tr>
                    <tr className="font-bold text-center">
                        <td className={`${TD} text-left`}>{isIXorX ? 'Division' : 'Grade'}</td>
                        {!hasActivities && (
                            <>
                                <td className={TD}></td>
                                <td className={TD}></td>
                            </>
                        )}
                        {hasActivities ? (
                            <>
                                <td colSpan={2} className={TD}>{isIXorX ? (summaries.terminal1?.division ?? '-') : (summaries.terminal1?.academicGrade ?? '-')}</td>
                                <td colSpan={2} className={TD}>{isIXorX ? (summaries.terminal2?.division ?? '-') : (summaries.terminal2?.academicGrade ?? '-')}</td>
                                <td colSpan={2} className={TD}>{isIXorX ? (summaries.terminal3?.division ?? '-') : (summaries.terminal3?.academicGrade ?? '-')}</td>
                            </>
                        ) : (
                            <>
                                <td className={TD}>{isIXorX ? (summaries.terminal1?.division ?? '-') : (summaries.terminal1?.academicGrade ?? '-')}</td>
                                <td className={TD}>{isIXorX ? (summaries.terminal2?.division ?? '-') : (summaries.terminal2?.academicGrade ?? '-')}</td>
                                <td className={TD}>{isIXorX ? (summaries.terminal3?.division ?? '-') : (summaries.terminal3?.academicGrade ?? '-')}</td>
                            </>
                        )}
                    </tr>
                    <tr className="font-bold text-center">
                        <td className={`${TD} text-left`}>Attendance %</td>
                        {!hasActivities && (
                            <>
                                <td className={TD}></td>
                                <td className={TD}></td>
                            </>
                        )}
                        {hasActivities ? (
                            <>
                                <td colSpan={2} className={TD}>{getAttendancePercent(exams.terminal1?.attendance)}</td>
                                <td colSpan={2} className={TD}>{getAttendancePercent(exams.terminal2?.attendance)}</td>
                                <td colSpan={2} className={TD}>{getAttendancePercent(exams.terminal3?.attendance)}</td>
                            </>
                        ) : (
                            <>
                                <td className={TD}>{getAttendancePercent(exams.terminal1?.attendance)}</td>
                                <td className={TD}>{getAttendancePercent(exams.terminal2?.attendance)}</td>
                                <td className={TD}>{getAttendancePercent(exams.terminal3?.attendance)}</td>
                            </>
                        )}
                    </tr>
                </tfoot>
            </table>

            {/* Increased spacing and font size on Final Remarks */}
            <div className="mt-8 border border-slate-400 rounded-lg p-3 break-inside-avoid" style={{ fontSize: 15 }}>
                <strong>Final Remarks:</strong> {finalRemark}
            </div>

            {/* Large top margin to push signatures well below Final Remarks */}
            <div className="mt-16 break-inside-avoid report-signatures" style={{ fontSize: 15 }}>
                <div className="flex justify-between items-end">
                    <div className="text-center">
                        {/* Taller signature space */}
                        <div className="h-20 flex flex-col justify-end pb-1 min-w-[150px]">
                            {classTeacher ? (
                                <p className="font-bold uppercase text-slate-900 text-xs border-b border-transparent">
                                    {classTeacher.firstName} {classTeacher.lastName}
                                </p>
                            ) : (
                                <div className="h-4"></div>
                            )}
                        </div>
                        <p className="border-t-2 border-slate-500 pt-2 font-semibold px-4">Class Teacher's Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="h-20 min-w-[150px]"></div>
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
            <table className="min-w-full border-collapse" style={{ fontSize: 15 }}>
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
                    ) : (
                        <tr className="border-b border-slate-400">
                            <th className="px-2 py-1 text-left font-semibold text-slate-600 border-r border-slate-300">Subject</th>
                            <th className="px-2 py-1 text-center font-semibold text-slate-600 border-r border-slate-300">Full Marks</th>
                            <th className="px-2 py-1 text-center font-semibold text-slate-600 border-r border-slate-300">Pass Marks</th>
                            <th className="px-2 py-1 text-center font-semibold text-slate-600">Marks Obtained</th>
                        </tr>
                    )}
                </thead>
                <tbody>
                    {(gradeDef.subjects ?? []).filter(Boolean).map((sd: any) => {
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
                                            <td className="px-2 py-1 text-center font-bold">{Number(result?.examMarks ?? 0) + Number(result?.activityMarks ?? 0)}</td>
                                        </>
                                    )
                                ) : (
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
            <div className="p-3 bg-slate-50 border-t border-slate-400 space-y-1 print:py-1 print:bg-transparent" style={{ fontSize: 15 }}>
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
                <div className="flex justify-between mt-4 print:mt-1">
                    <p>Date : {formatDateForDisplay(new Date().toISOString().split('T')[0])}</p>
                </div>
            </div>
        </div>
    );
};

const BulkProgressReportPage: React.FC<ProgressReportPageProps> = ({ students, staff, gradeDefinitions, academicYear }) => {
    const { grade: encodedGrade, examId } = useParams() as { grade: string; examId: string };
    const navigate = useNavigate();
    const grade = decodeURIComponent(encodedGrade) as Grade;

    const classStudents = useMemo(() => {
        return students
            .filter(s => s.grade === grade && s.status === StudentStatus.ACTIVE)
            .sort((a, b) => a.rollNo - b.rollNo);
    }, [students, grade]);

    const gradeDef = useMemo(() => {
        if (!gradeDefinitions[grade]) return null;
        const def = gradeDefinitions[grade];
        if (grade === Grade.IX || grade === Grade.X) {
            return {
                ...def,
                subjects: (def.subjects ?? []).map(s => ({ ...s, examFullMarks: 100, activityFullMarks: 0 }))
            };
        }
        return def;
    }, [grade, gradeDefinitions]);

    const examTemplate = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);

    useEffect(() => {
        const styleId = 'progress-report-print-style';
        let style = document.getElementById(styleId) as HTMLStyleElement | null;
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        style.textContent = `
            @media print {
                @page {
                    size: A4 portrait;
                    margin-top: 9.5cm;
                    margin-bottom: 1.5cm;
                    margin-left: 0.6cm;
                    margin-right: 0.6cm;
                }
                .progress-report-page {
                    page-break-after: always;
                    break-after: page;
                }
                .progress-report-page .report-inner {
                    zoom: 0.72;
                }
                .report-banner-placeholder {
                    display: none !important;
                }
                .report-signatures {
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                }
            }
        `;
        return () => {
            if (style) style.textContent = '';
        };
    }, []);

    const allSummaries = useMemo(() => {
        if (examId !== 'terminal3' || !gradeDef) return null;
        const summariesMap: Record<string, any> = {};
        classStudents.forEach(student => {
            const exams = {
                terminal1: student?.academicPerformance?.find(e => e.id === 'terminal1'),
                terminal2: student?.academicPerformance?.find(e => e.id === 'terminal2'),
                terminal3: student?.academicPerformance?.find(e => e.id === 'terminal3'),
            };
            summariesMap[student.id] = {
                terminal1: calculateTermSummary(student, exams.terminal1, 'terminal1', gradeDef, classStudents),
                terminal2: calculateTermSummary(student, exams.terminal2, 'terminal2', gradeDef, classStudents),
                terminal3: calculateTermSummary(student, exams.terminal3, 'terminal3', gradeDef, classStudents),
            };
        });
        return summariesMap;
    }, [classStudents, gradeDef, examId]);

    if (!gradeDef || !examTemplate) return <div>Invalid Configuration</div>;

    return (
        <div className="bg-slate-100 print:bg-white min-h-screen">
            <div className="print-hidden container mx-auto p-4 flex justify-between items-center sticky top-0 bg-slate-100/80 backdrop-blur-sm z-10 shadow-sm">
                <button onClick={() => navigate(-1)} className="btn btn-secondary"><BackIcon className="w-5 h-5"/> Back</button>
                <div className="text-center">
                    <h2 className="text-xl font-bold">Bulk Print Reports</h2>
                    <p className="text-sm text-slate-600">{grade} - {examTemplate.name} ({classStudents.length} students)</p>
                </div>
                <button onClick={() => window.print()} className="btn btn-primary"><PrinterIcon className="w-5 h-5"/> Print All</button>
            </div>

            <div className="container mx-auto print:w-full print:max-w-none">
                {classStudents.map((student) => {
                    const studentExams = student.academicPerformance || [];
                    const singleExam = studentExams.find(e => e.id === examId);
                    const exams = {
                        terminal1: studentExams.find(e => e.id === 'terminal1'),
                        terminal2: studentExams.find(e => e.id === 'terminal2'),
                        terminal3: studentExams.find(e => e.id === 'terminal3'),
                    };
                    const summaries = allSummaries ? allSummaries[student.id] : null;

                    return (
                        <div key={student.id} className="bg-white p-8 my-8 shadow-lg print:shadow-none print:my-0 print:p-0 progress-report-page">
                            <div className="font-serif print:text-xs report-inner">
                                <header className="text-center mb-2">
                                    {examId !== 'terminal3' ? (
                                        <img src={SCHOOL_BANNER_URL} alt="School Banner" className="w-full h-auto mb-2"/>
                                    ) : (
                                        <div className="h-32 md:h-40 report-banner-placeholder" aria-hidden="true"></div>
                                    )}
                                    <h2 className="text-xl font-semibold inline-block border-b-2 border-slate-700 px-8 pb-1 mt-2 print:text-lg print:mt-0">
                                        STUDENT'S PROGRESS REPORT
                                    </h2>
                                    <p className="font-semibold mt-1 print:text-sm">Academic Session: {academicYear}</p>
                                </header>

                                <section className="mb-2 border-2 border-slate-400 rounded-lg text-sm print:mb-1 flex items-stretch">
                                    <div className="flex-1 p-2 print:p-1 grid grid-cols-3 gap-x-2 gap-y-1 print:gap-y-0.5 content-start">
                                        <div><strong className="block text-slate-600">Student's Name:</strong><span className="font-bold text-base">{student.name}</span></div>
                                        <div><strong className="block text-slate-600">Father's Name:</strong><span className="font-bold text-base">{student.fatherName}</span></div>
                                        <div><strong className="block text-slate-600">Date of Birth:</strong><span className="font-bold text-base">{formatDateForDisplay(student.dateOfBirth)}</span></div>
                                        <div><strong className="block text-slate-600">Class:</strong><span className="font-bold text-base">{student.grade}</span></div>
                                        <div><strong className="block text-slate-600">Roll No:</strong><span className="font-bold text-base">{student.rollNo}</span></div>
                                        <div><strong className="block text-slate-600">Student ID:</strong><span className="font-bold text-base">{formatStudentId(student, academicYear)}</span></div>
                                    </div>
                                    <div className="border-l-2 border-slate-400 flex-shrink-0 w-24 print:w-20 flex items-center justify-center p-1">
                                        {student.photographUrl ? (
                                            <img
                                                src={student.photographUrl}
                                                alt={student.name}
                                                className="w-full h-24 print:h-20 object-cover rounded"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="w-full h-24 print:h-20 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs text-center">No Photo</div>
                                        )}
                                    </div>
                                </section>

                                <section className="mt-4 print:mt-2">
                                    {examId === 'terminal3' && summaries ? (
                                        <MultiTermReportCard
                                            student={student}
                                            gradeDef={gradeDef}
                                            exams={exams}
                                            summaries={summaries}
                                            staff={staff}
                                        />
                                    ) : (
                                        <ReportCard
                                            student={student}
                                            gradeDef={gradeDef}
                                            exam={singleExam}
                                            examTemplate={examTemplate}
                                            allStudents={classStudents}
                                            academicYear={academicYear}
                                            staff={staff}
                                        />
                                    )}
                                </section>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BulkProgressReportPage;
