import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Grade, GradeDefinition, Exam, StudentStatus, Staff, Attendance, SubjectMark, SubjectDefinition } from '@/types';
import { BackIcon, PrinterIcon } from '@/components/Icons';
import { TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES, SCHOOL_BANNER_URL } from '@/constants';
import { formatDateForDisplay, normalizeSubjectName, formatStudentId, getNextGrade } from '@/utils';
import { db } from '@/firebaseConfig';

const { useParams, useNavigate } = ReactRouterDOM as any;

interface ProgressReportPageProps {
  students: Student[];
  staff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
}

// ─── Grade group helpers ──────────────────────────────────────────────────────
const NURSERY_TO_II: Grade[] = [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II];
const CLASS_III_TO_VIII: Grade[] = [Grade.III, Grade.IV, Grade.V, Grade.VI, Grade.VII, Grade.VIII];
const CLASS_IX_TO_X: Grade[] = [Grade.IX, Grade.X];

// ─── Shared helpers ───────────────────────────────────────────────────────────
const findResultWithAliases = (results: SubjectMark[] | undefined, subjectDef: SubjectDefinition) => {
    if (!results || !Array.isArray(results) || !subjectDef?.name) return undefined;
    const normSubjDefName = normalizeSubjectName(subjectDef.name);
    return results.find(r => {
        const normResultName = normalizeSubjectName(r.subject);
        if (normResultName === normSubjDefName) return true;
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
    const isClassIXorX = CLASS_IX_TO_X.includes(student.grade);
    const isNurseryToII = NURSERY_TO_II.includes(student.grade);
    const classmates = allStudents.filter(s => s.grade === student.grade && s.status === StudentStatus.ACTIVE);
    const numericSubjects = gradeDef.subjects.filter(sd => sd.gradingSystem !== 'OABC');
    const gradedSubjects = gradeDef.subjects.filter(sd => sd.gradingSystem === 'OABC');

    const studentData = classmates.map(s => {
        const studentExam = s.academicPerformance?.find((e) => {
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
        let gTotal = 0, fSubjects = 0, gSubjectsPassed = 0;
        numericSubjects.forEach(sd => {
            const r = findResultWithAliases(studentExam?.results, sd);
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
    // Pass rule: SA must be >= 27. FA has no pass mark.
    if (saMark < 27) fSubjects++;
} else {
                totalMark = Number(r?.marks ?? 0);
                const limit = isClassIXorX ? 33 : 35;
                if (totalMark < limit) fSubjects++;
            }
            gTotal += totalMark;
        });
        gradedSubjects.forEach(sd => {
            const r = findResultWithAliases(studentExam?.results, sd);
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
    const uniqueScores = [...new Set(passedStudents.map(s => s.grandTotal))].sort((a, b) => b - a);
    const currentStudentStats = studentData.find(s => s.id === student.id);
    if (!currentStudentStats) return null;

    let rank: number | '-' = '-';
    if (currentStudentStats.result === 'PASS') {
        const rankIndex = uniqueScores.indexOf(currentStudentStats.grandTotal);
        rank = rankIndex !== -1 ? rankIndex + 1 : '-';
    }

    let grandTotal = 0, examTotal = 0, activityTotal = 0, fullMarksTotal = 0;
    const failedSubjects: string[] = [];

    numericSubjects.forEach(sd => {
        const result = findResultWithAliases(exam?.results, sd);
        let totalSubjectMark = 0, subjectFullMarks = 0;
        if (hasActivities) {
            const examMark = Number(result?.examMarks ?? 0);
            const activityMark = Number(result?.activityMarks ?? 0);
            examTotal += examMark; activityTotal += activityMark;
            totalSubjectMark = examMark + activityMark;
            subjectFullMarks = (sd.examFullMarks ?? 0) + (sd.activityFullMarks ?? 0);
            if (examMark < 20) failedSubjects.push(sd.name);
        } else if (isClassIXorX && examId === 'terminal3') {
            const saMark = Number(result?.saMarks ?? result?.marks ?? 0);
            const faMark = Number(result?.faMarks ?? 0);
            totalSubjectMark = result?.saMarks != null ? saMark + faMark : Number(result?.marks ?? 0);
            examTotal += totalSubjectMark;
            subjectFullMarks = 100; // SA 80 + FA 20
            // Pass rule: SA must be >= 27. FA has no pass mark.
            if (saMark < 27) failedSubjects.push(sd.name);
        } else {
            totalSubjectMark = Number(result?.marks ?? 0);
            examTotal += totalSubjectMark;
            subjectFullMarks = sd.examFullMarks;
            const failLimit = isClassIXorX ? 33 : 35;
            if (totalSubjectMark < failLimit) failedSubjects.push(sd.name);
        }
        grandTotal += totalSubjectMark; fullMarksTotal += subjectFullMarks;
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
    else if (percentage > 89) academicGrade = 'O';
    else if (percentage > 79) academicGrade = 'A';
    else if (percentage > 69) academicGrade = 'B';
    else if (percentage > 59) academicGrade = 'C';
    else academicGrade = 'D';

    let remark = '';
    if (currentStudentStats.result === 'FAIL') remark = `Needs significant improvement${failedSubjects.length > 0 ? ` in ${failedSubjects.join(', ')}` : ''}.`;
    else if (currentStudentStats.result === 'SIMPLE PASS') remark = `Simple Pass. Focus on improving in ${failedSubjects.join(', ')}.`;
    else if (percentage >= 90) remark = "Outstanding performance!";
    else if (percentage >= 75) remark = "Excellent performance.";
    else if (percentage >= 60) remark = "Good performance.";
    else if (percentage >= 45) remark = "Satisfactory performance.";
    else remark = "Passed. Needs to work harder.";

    return { id: student.id, grandTotal, examTotal, activityTotal, percentage, result: currentStudentStats.result, division, academicGrade, remark, rank };
};

// ─── Shared footer ────────────────────────────────────────────────────────────
const ReportFooter: React.FC<{ finalRemark: string; classTeacher?: Staff }> = ({ finalRemark, classTeacher }) => (
    <>
        <div className="mt-4 border border-slate-400 rounded-lg p-2 text-sm break-inside-avoid">
            <strong>Final Remarks:</strong> {finalRemark}
        </div>
        <div className="mt-8 text-sm break-inside-avoid">
            <div className="flex justify-between items-end">
                <div className="text-center">
                    <div className="h-12 flex flex-col justify-end pb-1 min-w-[150px]">
                        {classTeacher
                            ? <p className="font-bold uppercase text-slate-900 text-xs">{classTeacher.firstName} {classTeacher.lastName}</p>
                            : <div className="h-4" />}
                    </div>
                    <p className="border-t-2 border-slate-500 pt-2 font-semibold px-4">Class Teacher's Signature</p>
                </div>
                <div className="text-center">
                    <div className="h-12 flex flex-col justify-end pb-1 min-w-[150px]">
                        <p className="font-bold uppercase text-slate-900 text-xs">K Malsawmdawngi</p>
                    </div>
                    <p className="border-t-2 border-slate-500 pt-2 font-semibold px-4">Principal's Signature</p>
                </div>
            </div>
            <div className="flex justify-between mt-4 text-xs text-slate-500">
                <p>Date : {formatDateForDisplay(new Date().toISOString().split('T')[0])}</p>
            </div>
        </div>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
//  LAYOUT A: Nursery → Class II
//  Labels: "I Terminal Exam", "II Terminal Exam", "III Terminal Exam"
//  No activities — single Marks column per exam, shows Full Marks + Pass Marks
// ─────────────────────────────────────────────────────────────────────────────
const NurseryToIIMultiTermCard: React.FC<{
    student: Student;
    gradeDef: GradeDefinition;
    exams: Record<'terminal1' | 'terminal2' | 'terminal3', Exam | undefined>;
    summaries: Record<'terminal1' | 'terminal2' | 'terminal3', ReturnType<typeof calculateTermSummary>>;
    staff: Staff[];
}> = ({ student, gradeDef, exams, summaries, staff }) => {
    const classTeacher = staff.find(s => s.id === gradeDef?.classTeacherId);
    const getAtt = (att?: Attendance) => att && att.totalWorkingDays > 0 ? `${((att.daysPresent / att.totalWorkingDays) * 100).toFixed(0)}%` : '-';

    const finalRemark = useMemo(() => {
        const s3 = summaries.terminal3; const e3 = exams.terminal3;
        const nextGrade = getNextGrade(student.grade);
        const labels: Record<string, string> = { Nursery: 'Nursery', Kindergarten: 'Kindergarten', 'Class I': 'Class I', 'Class II': 'Class II', 'Class III': 'Class III' };
        const nl = nextGrade ? (labels[nextGrade] ?? nextGrade) : null;
        if (s3?.result === 'PASS' || s3?.result === 'SIMPLE PASS') return nl ? `Promoted to ${nl}. School reopens on April 1, 2026` : 'Promoted. School reopens on April 1, 2026';
        if (s3?.result === 'FAIL') return 'Detained';
        return e3?.teacherRemarks || s3?.remark || 'Awaiting final results.';
    }, [summaries.terminal3, exams.terminal3, student.grade]);

    const getSummaryVal = (s: ReturnType<typeof calculateTermSummary>, key: string) => {
        if (!s) return '-';
        if (key === 'percentage') return s.percentage?.toFixed(1) ?? '-';
        return (s as any)[key] ?? '-';
    };

    return (
        <div>
            <table className="w-full border-collapse border border-slate-400 text-sm">
                <thead>
                    <tr className="bg-slate-100 font-bold">
                        <th className="p-1 border border-slate-400 text-left">Subject</th>
                        <th className="p-1 border border-slate-400">Full Marks</th>
                        <th className="p-1 border border-slate-400">Pass Marks</th>
                        <th className="p-1 border border-slate-400">I Terminal Exam</th>
                        <th className="p-1 border border-slate-400">II Terminal Exam</th>
                        <th className="p-1 border border-slate-400">III Terminal Exam</th>
                    </tr>
                </thead>
                <tbody>
                    {(gradeDef.subjects ?? []).filter(Boolean).map(sd => {
                        const isGraded = sd.gradingSystem === 'OABC';
                        const r1 = findResultWithAliases(exams.terminal1?.results, sd);
                        const r2 = findResultWithAliases(exams.terminal2?.results, sd);
                        const r3 = findResultWithAliases(exams.terminal3?.results, sd);
                        return (
                            <tr key={sd.name} className="text-center border-t border-slate-200">
                                <td className="p-1 border border-slate-400 text-left font-semibold">{sd.name}</td>
                                <td className="p-1 border border-slate-400">{isGraded ? 'Graded' : (sd.examFullMarks ?? 100)}</td>
                                <td className="p-1 border border-slate-400">{isGraded ? '-' : 35}</td>
                                <td className="p-1 border border-slate-400 font-bold">{isGraded ? (r1?.grade ?? '-') : (r1?.marks ?? '-')}</td>
                                <td className="p-1 border border-slate-400 font-bold">{isGraded ? (r2?.grade ?? '-') : (r2?.marks ?? '-')}</td>
                                <td className="p-1 border border-slate-400 font-bold">{isGraded ? (r3?.grade ?? '-') : (r3?.marks ?? '-')}</td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot className="font-bold text-center">
                    {[['Grand Total', 'grandTotal'], ['Result', 'result'], ['Rank', 'rank'], ['Percentage', 'percentage'], ['Grade', 'academicGrade']].map(([label, key]) => (
                        <tr key={label}>
                            <td className="p-1 border border-slate-400 text-left">{label}</td>
                            <td className="p-1 border border-slate-400" /><td className="p-1 border border-slate-400" />
                            <td className="p-1 border border-slate-400">{getSummaryVal(summaries.terminal1, key)}</td>
                            <td className="p-1 border border-slate-400">{getSummaryVal(summaries.terminal2, key)}</td>
                            <td className="p-1 border border-slate-400">{getSummaryVal(summaries.terminal3, key)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td className="p-1 border border-slate-400 text-left">Attendance %</td>
                        <td className="p-1 border border-slate-400" /><td className="p-1 border border-slate-400" />
                        <td className="p-1 border border-slate-400">{getAtt(exams.terminal1?.attendance)}</td>
                        <td className="p-1 border border-slate-400">{getAtt(exams.terminal2?.attendance)}</td>
                        <td className="p-1 border border-slate-400">{getAtt(exams.terminal3?.attendance)}</td>
                    </tr>
                </tfoot>
            </table>
            <ReportFooter finalRemark={finalRemark} classTeacher={classTeacher} />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  LAYOUT B: Class III → VIII
//  Labels: "I Entry", "II Entry", "III Entry"
//  With activities — Summative /60 + Activity /40 sub-columns
// ─────────────────────────────────────────────────────────────────────────────
const ClassIIIToVIIIMultiTermCard: React.FC<{
    student: Student;
    gradeDef: GradeDefinition;
    exams: Record<'terminal1' | 'terminal2' | 'terminal3', Exam | undefined>;
    summaries: Record<'terminal1' | 'terminal2' | 'terminal3', ReturnType<typeof calculateTermSummary>>;
    staff: Staff[];
}> = ({ student, gradeDef, exams, summaries, staff }) => {
    const classTeacher = staff.find(s => s.id === gradeDef?.classTeacherId);
    const getAtt = (att?: Attendance) => att && att.totalWorkingDays > 0 ? `${((att.daysPresent / att.totalWorkingDays) * 100).toFixed(0)}%` : '-';

    const finalRemark = useMemo(() => {
        const s3 = summaries.terminal3; const e3 = exams.terminal3;
        const nextGrade = getNextGrade(student.grade);
        const labels: Record<string, string> = { 'Class III': 'Class III', 'Class IV': 'Class IV', 'Class V': 'Class V', 'Class VI': 'Class VI', 'Class VII': 'Class VII', 'Class VIII': 'Class VIII', 'Class IX': 'Class IX' };
        const nl = nextGrade ? (labels[nextGrade] ?? nextGrade) : null;
        if (s3?.result === 'PASS' || s3?.result === 'SIMPLE PASS') return nl ? `Promoted to ${nl}. School reopens on April 1, 2026` : 'Promoted. School reopens on April 1, 2026';
        if (s3?.result === 'FAIL') return 'Detained';
        return e3?.teacherRemarks || s3?.remark || 'Awaiting final results.';
    }, [summaries.terminal3, exams.terminal3, student.grade]);

    const getSummaryVal = (s: ReturnType<typeof calculateTermSummary>, key: string) => {
        if (!s) return '-';
        if (key === 'percentage') return s.percentage?.toFixed(1) ?? '-';
        return (s as any)[key] ?? '-';
    };

    return (
        <div>
            <table className="w-full border-collapse border border-slate-400 text-sm">
                <thead>
                    <tr className="bg-slate-100 font-bold">
                        <th rowSpan={2} className="p-1 border border-slate-400 text-left align-middle">Subject</th>
                        <th colSpan={2} className="p-1 border border-slate-400">I Entry</th>
                        <th colSpan={2} className="p-1 border border-slate-400">II Entry</th>
                        <th colSpan={2} className="p-1 border border-slate-400">III Entry</th>
                    </tr>
                    <tr className="bg-slate-100 text-xs font-semibold">
                        <th className="p-1 border border-slate-400">Sum.<br/>/60</th><th className="p-1 border border-slate-400">Act.<br/>/40</th>
                        <th className="p-1 border border-slate-400">Sum.<br/>/60</th><th className="p-1 border border-slate-400">Act.<br/>/40</th>
                        <th className="p-1 border border-slate-400">Sum.<br/>/60</th><th className="p-1 border border-slate-400">Act.<br/>/40</th>
                    </tr>
                </thead>
                <tbody>
                    {(gradeDef.subjects ?? []).filter(Boolean).map(sd => {
                        const isGraded = sd.gradingSystem === 'OABC';
                        const r1 = findResultWithAliases(exams.terminal1?.results, sd);
                        const r2 = findResultWithAliases(exams.terminal2?.results, sd);
                        const r3 = findResultWithAliases(exams.terminal3?.results, sd);
                        return (
                            <tr key={sd.name} className="text-center border-t border-slate-200">
                                <td className="p-1 border border-slate-400 text-left font-semibold">{sd.name}</td>
                                {isGraded ? (
                                    <>
                                        <td colSpan={2} className="p-1 border border-slate-400 font-bold">{r1?.grade ?? '-'}</td>
                                        <td colSpan={2} className="p-1 border border-slate-400 font-bold">{r2?.grade ?? '-'}</td>
                                        <td colSpan={2} className="p-1 border border-slate-400 font-bold">{r3?.grade ?? '-'}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-1 border border-slate-400">{r1?.examMarks ?? '-'}</td><td className="p-1 border border-slate-400">{r1?.activityMarks ?? '-'}</td>
                                        <td className="p-1 border border-slate-400">{r2?.examMarks ?? '-'}</td><td className="p-1 border border-slate-400">{r2?.activityMarks ?? '-'}</td>
                                        <td className="p-1 border border-slate-400">{r3?.examMarks ?? '-'}</td><td className="p-1 border border-slate-400">{r3?.activityMarks ?? '-'}</td>
                                    </>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot className="font-bold text-center">
                    <tr>
                        <td className="p-1 border border-slate-400 text-left">Sub-Total</td>
                        <td className="p-1 border border-slate-400">{summaries.terminal1?.examTotal ?? '-'}</td><td className="p-1 border border-slate-400">{summaries.terminal1?.activityTotal ?? '-'}</td>
                        <td className="p-1 border border-slate-400">{summaries.terminal2?.examTotal ?? '-'}</td><td className="p-1 border border-slate-400">{summaries.terminal2?.activityTotal ?? '-'}</td>
                        <td className="p-1 border border-slate-400">{summaries.terminal3?.examTotal ?? '-'}</td><td className="p-1 border border-slate-400">{summaries.terminal3?.activityTotal ?? '-'}</td>
                    </tr>
                    {[['Grand Total', 'grandTotal'], ['Result', 'result'], ['Rank', 'rank'], ['Percentage', 'percentage'], ['Grade', 'academicGrade']].map(([label, key]) => (
                        <tr key={label}>
                            <td className="p-1 border border-slate-400 text-left">{label}</td>
                            <td colSpan={2} className="p-1 border border-slate-400">{getSummaryVal(summaries.terminal1, key)}</td>
                            <td colSpan={2} className="p-1 border border-slate-400">{getSummaryVal(summaries.terminal2, key)}</td>
                            <td colSpan={2} className="p-1 border border-slate-400">{getSummaryVal(summaries.terminal3, key)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td className="p-1 border border-slate-400 text-left">Attendance %</td>
                        <td colSpan={2} className="p-1 border border-slate-400">{getAtt(exams.terminal1?.attendance)}</td>
                        <td colSpan={2} className="p-1 border border-slate-400">{getAtt(exams.terminal2?.attendance)}</td>
                        <td colSpan={2} className="p-1 border border-slate-400">{getAtt(exams.terminal3?.attendance)}</td>
                    </tr>
                </tfoot>
            </table>
            <ReportFooter finalRemark={finalRemark} classTeacher={classTeacher} />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  LAYOUT C: Class IX & X
//  Labels: "I Terminal Exam", "II Terminal Exam", "III Terminal Exam"
//  III Terminal: nested SA /80 + FA /20 + Total /100 columns
//  Footer: Division (not Grade)
// ─────────────────────────────────────────────────────────────────────────────
const IXXMultiTermCard: React.FC<{
    student: Student;
    gradeDef: GradeDefinition;
    exams: Record<'terminal1' | 'terminal2' | 'terminal3', Exam | undefined>;
    summaries: Record<'terminal1' | 'terminal2' | 'terminal3', ReturnType<typeof calculateTermSummary>>;
    staff: Staff[];
}> = ({ student, gradeDef, exams, summaries, staff }) => {
    const classTeacher = staff.find(s => s.id === gradeDef?.classTeacherId);
    const getAtt = (att?: Attendance) => att && att.totalWorkingDays > 0 ? `${((att.daysPresent / att.totalWorkingDays) * 100).toFixed(0)}%` : '-';

    const finalRemark = useMemo(() => {
        const s3 = summaries.terminal3; const e3 = exams.terminal3;
        if (s3?.result === 'PASS' || s3?.result === 'SIMPLE PASS')
            return student.grade === Grade.X ? 'Passed Class X. School reopens on April 1, 2026' : 'Promoted to Class X. School reopens on April 1, 2026';
        if (s3?.result === 'FAIL') return 'Detained';
        return e3?.teacherRemarks || s3?.remark || 'Awaiting final results.';
    }, [summaries.terminal3, exams.terminal3, student.grade]);

    const numSubjects = (gradeDef.subjects ?? []).filter(s => s.gradingSystem !== 'OABC').length;

    return (
        <div>
            <table className="w-full border-collapse border border-slate-400 text-sm">
                <thead>
                    <tr className="bg-slate-100 font-bold">
                        <th rowSpan={2} className="p-1 border border-slate-400 text-left align-middle">Subject</th>
                        <th rowSpan={2} className="p-1 border border-slate-400 align-middle">Full<br/>Marks</th>
                        <th rowSpan={2} className="p-1 border border-slate-400 align-middle">I Terminal Exam<br/><span className="font-normal text-slate-500 text-xs">Marks</span></th>
                        <th rowSpan={2} className="p-1 border border-slate-400 align-middle">II Terminal Exam<br/><span className="font-normal text-slate-500 text-xs">Marks</span></th>
                        <th colSpan={3} className="p-1 border border-slate-400">III Terminal Exam</th>
                    </tr>
                    <tr className="bg-slate-100 text-xs font-semibold">
                        <th className="p-1 border border-slate-400">SA<br/><span className="font-normal text-slate-400">/80</span></th>
                        <th className="p-1 border border-slate-400">FA<br/><span className="font-normal text-slate-400">/20</span></th>
                        <th className="p-1 border border-slate-400">Total<br/><span className="font-normal text-slate-400">/100</span></th>
                    </tr>
                </thead>
                <tbody>
                    {(gradeDef.subjects ?? []).filter(Boolean).map(sd => {
                        const isGraded = sd.gradingSystem === 'OABC';
                        const r1 = findResultWithAliases(exams.terminal1?.results, sd);
                        const r2 = findResultWithAliases(exams.terminal2?.results, sd);
                        const r3 = findResultWithAliases(exams.terminal3?.results, sd);
                        const sa = r3?.saMarks ?? r3?.examMarks ?? null;
                        const fa = r3?.faMarks ?? r3?.activityMarks ?? null;
                        const t3Total = sa != null && fa != null ? Number(sa) + Number(fa) : (r3?.marks ?? '-');
                        return (
                            <tr key={sd.name} className="text-center border-t border-slate-200">
                                <td className="p-1 border border-slate-400 text-left font-semibold">{sd.name}</td>
                                <td className="p-1 border border-slate-400">{isGraded ? 'Graded' : 100}</td>
                                <td className="p-1 border border-slate-400 font-bold">{isGraded ? (r1?.grade ?? '-') : (r1?.marks ?? '-')}</td>
                                <td className="p-1 border border-slate-400 font-bold">{isGraded ? (r2?.grade ?? '-') : (r2?.marks ?? '-')}</td>
                                {isGraded
                                    ? <td colSpan={3} className="p-1 border border-slate-400 font-bold">{r3?.grade ?? '-'}</td>
                                    : <>
                                        <td className="p-1 border border-slate-400 font-bold">{sa ?? '-'}</td>
                                        <td className="p-1 border border-slate-400 font-bold">{fa ?? '-'}</td>
                                        <td className="p-1 border border-slate-400 font-bold">{t3Total}</td>
                                    </>
                                }
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot className="font-bold text-center">
                    <tr>
                        <td className="p-1 border border-slate-400 text-left">Grand Total</td>
                        <td className="p-1 border border-slate-400">{numSubjects * 100}</td>
                        <td className="p-1 border border-slate-400">{summaries.terminal1?.grandTotal ?? '-'}</td>
                        <td className="p-1 border border-slate-400">{summaries.terminal2?.grandTotal ?? '-'}</td>
                        <td className="p-1 border border-slate-400">-</td><td className="p-1 border border-slate-400">-</td>
                        <td className="p-1 border border-slate-400">{summaries.terminal3?.grandTotal ?? '-'}</td>
                    </tr>
                    <tr>
                        <td className="p-1 border border-slate-400 text-left">Result</td><td className="p-1 border border-slate-400" />
                        <td className="p-1 border border-slate-400">{summaries.terminal1?.result ?? '-'}</td>
                        <td className="p-1 border border-slate-400">{summaries.terminal2?.result ?? '-'}</td>
                        <td colSpan={3} className="p-1 border border-slate-400">{summaries.terminal3?.result ?? '-'}</td>
                    </tr>
                    <tr>
                        <td className="p-1 border border-slate-400 text-left">Rank</td><td className="p-1 border border-slate-400" />
                        <td className="p-1 border border-slate-400">{summaries.terminal1?.rank ?? '-'}</td>
                        <td className="p-1 border border-slate-400">{summaries.terminal2?.rank ?? '-'}</td>
                        <td colSpan={3} className="p-1 border border-slate-400">{summaries.terminal3?.rank ?? '-'}</td>
                    </tr>
                    <tr>
                        <td className="p-1 border border-slate-400 text-left">Percentage</td><td className="p-1 border border-slate-400" />
                        <td className="p-1 border border-slate-400">{summaries.terminal1?.percentage?.toFixed(1) ?? '-'}</td>
                        <td className="p-1 border border-slate-400">{summaries.terminal2?.percentage?.toFixed(1) ?? '-'}</td>
                        <td colSpan={3} className="p-1 border border-slate-400">{summaries.terminal3?.percentage?.toFixed(1) ?? '-'}</td>
                    </tr>
                    <tr>
                        <td className="p-1 border border-slate-400 text-left">Division</td><td className="p-1 border border-slate-400" />
                        <td className="p-1 border border-slate-400">{summaries.terminal1?.division ?? '-'}</td>
                        <td className="p-1 border border-slate-400">{summaries.terminal2?.division ?? '-'}</td>
                        <td colSpan={3} className="p-1 border border-slate-400">{summaries.terminal3?.division ?? '-'}</td>
                    </tr>
                    <tr>
                        <td className="p-1 border border-slate-400 text-left">Attendance %</td><td className="p-1 border border-slate-400" />
                        <td className="p-1 border border-slate-400">{getAtt(exams.terminal1?.attendance)}</td>
                        <td className="p-1 border border-slate-400">{getAtt(exams.terminal2?.attendance)}</td>
                        <td colSpan={3} className="p-1 border border-slate-400">{getAtt(exams.terminal3?.attendance)}</td>
                    </tr>
                </tfoot>
            </table>
            <ReportFooter finalRemark={finalRemark} classTeacher={classTeacher} />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Single-exam ReportCard (Terminal 1 & 2)
// ─────────────────────────────────────────────────────────────────────────────
const ReportCard: React.FC<any> = ({ student, gradeDef, exam, examTemplate, allStudents, academicYear, staff }) => {
    const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    const isClassIXorX = CLASS_IX_TO_X.includes(student.grade);
    const isNurseryToII = NURSERY_TO_II.includes(student.grade);
    const processedReportData = useMemo(() => calculateTermSummary(student, exam, examTemplate.id as any, gradeDef, allStudents), [student, exam, examTemplate.id, gradeDef, allStudents]);
    const classTeacher = useMemo(() => staff?.find((s: Staff) => s.id === gradeDef?.classTeacherId), [staff, gradeDef]);

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
                                <th className="px-2 py-1 text-center font-semibold text-slate-600 border-r border-slate-300">Marks Obt.</th>
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
                                {isNurseryToII ? (<>
                                    <td className="px-2 py-1 text-center border-r border-slate-300">{isGraded ? 'Graded' : sd.examFullMarks}</td>
                                    <td className="px-2 py-1 text-center border-r border-slate-300">{isGraded ? '-' : 35}</td>
                                    <td className="px-2 py-1 text-center font-bold">{isGraded ? (result?.grade || '-') : (result?.marks ?? 0)}</td>
                                </>) : hasActivities ? (isGraded
                                    ? <td colSpan={5} className="px-2 py-1 text-center font-bold">{result?.grade || '-'}</td>
                                    : (<>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{sd.examFullMarks}</td>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{result?.examMarks ?? 0}</td>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{sd.activityFullMarks}</td>
                                        <td className="px-2 py-1 text-center border-r border-slate-300">{result?.activityMarks ?? 0}</td>
                                        <td className="px-2 py-1 text-center font-bold">{Number(result?.examMarks ?? 0) + Number(result?.activityMarks ?? 0)}</td>
                                    </>)
                                ) : (<>
                                    <td className="px-2 py-1 text-center border-r border-slate-300">{isGraded ? 'Graded' : (isClassIXorX ? 100 : sd.examFullMarks)}</td>
                                    <td className="px-2 py-1 text-center border-r border-slate-300">{isGraded ? '-' : 33}</td>
                                    <td className="px-2 py-1 text-center font-bold">{isGraded ? (result?.grade || '-') : (result?.marks ?? 0)}</td>
                                </>)}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="p-3 bg-slate-50 border-t border-slate-400 space-y-1 text-sm print:py-1 print:bg-transparent">
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {hasActivities && (<>
                        <div className="font-semibold text-slate-600 text-right">Summative Total:</div><div className="font-bold text-slate-800">{processedReportData?.examTotal}</div>
                        <div className="font-semibold text-slate-600 text-right">Activity Total:</div><div className="font-bold text-slate-800">{processedReportData?.activityTotal}</div>
                    </>)}
                    <div className="font-semibold text-slate-600 text-right">Grand Total:</div><div className="font-bold text-slate-800">{processedReportData?.grandTotal}</div>
                    <div className="font-semibold text-slate-600 text-right">Percentage:</div><div className="font-bold text-slate-800">{processedReportData?.percentage?.toFixed(2) ?? '0.00'}%</div>
                    {!isClassIXorX && (<><div className="font-semibold text-slate-600 text-right">Grade:</div><div className="font-bold text-slate-800">{processedReportData?.academicGrade}</div></>)}
                    {isClassIXorX && (<><div className="font-semibold text-slate-600 text-right">Division:</div><div className="font-bold text-slate-800">{processedReportData?.division}</div></>)}
                    <div className="font-semibold text-slate-600 text-right">Result:</div>
                    <div className={`font-bold ${processedReportData?.result !== 'PASS' ? 'text-red-600' : 'text-emerald-600'}`}>{processedReportData?.result}</div>
                    <div className="font-semibold text-slate-600 text-right">Rank:</div><div className="font-bold text-slate-800">{processedReportData?.rank}</div>
                    <div className="font-semibold text-slate-600 text-right">Attendance %:</div>
                    <div className="font-bold text-slate-800">{exam?.attendance && exam.attendance.totalWorkingDays > 0 ? `${((exam.attendance.daysPresent / exam.attendance.totalWorkingDays) * 100).toFixed(0)}%` : 'N/A'}</div>
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
                            {classTeacher ? <p className="font-bold uppercase text-slate-900 text-xs">{classTeacher.firstName} {classTeacher.lastName}</p> : <div className="h-4" />}
                        </div>
                        <p className="border-t-2 border-slate-500 pt-2 font-semibold px-4">Class Teacher's Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="h-12 flex flex-col justify-end pb-1 min-w-[150px]">
                            <p className="font-bold uppercase text-slate-900 text-xs">K Malsawmdawngi</p>
                        </div>
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

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const ProgressReportPage: React.FC<ProgressReportPageProps> = ({ students, staff, gradeDefinitions, academicYear }) => {
    const { studentId, examId } = useParams() as { studentId: string; examId: string };
    const navigate = useNavigate();

    const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);
    const [classmates, setClassmates] = useState<Student[]>([]);

    useEffect(() => {
        if (student) {
            const unsubscribe = db.collection('students')
                .where('grade', '==', student.grade)
                .where('status', '==', StudentStatus.ACTIVE)
                .onSnapshot(snapshot => {
                    setClassmates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
                });
            return () => unsubscribe();
        }
    }, [student]);

    const gradeDef = useMemo(() => {
        if (!student || !gradeDefinitions[student.grade]) return null;
        const def = gradeDefinitions[student.grade];
        if (CLASS_IX_TO_X.includes(student.grade)) {
            return { ...def, subjects: def.subjects.map(s => ({ ...s, examFullMarks: 100, activityFullMarks: 0 })) };
        }
        return def;
    }, [student, gradeDefinitions]);

    const examTemplate = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);

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

    const singleExam = useMemo(() => exams[examId as 'terminal1' | 'terminal2' | 'terminal3'], [exams, examId]);

    if (!student) return <div className="p-8 text-center">Loading student data...</div>;
    if (!gradeDef) return <div className="p-8 text-center"><p>Curriculum not defined for {student?.grade}. Please contact an administrator.</p></div>;

    const isIXorX = CLASS_IX_TO_X.includes(student.grade);
    const isIIItoVIII = CLASS_III_TO_VIII.includes(student.grade);

    return (
        <div className="bg-slate-100 print:bg-white">
            <div className="print-hidden container mx-auto p-4 flex justify-between items-center sticky top-0 bg-slate-100/80 backdrop-blur-sm z-10 shadow-sm">
                <button onClick={() => navigate(-1)} className="btn btn-secondary"><BackIcon className="w-5 h-5"/> Back</button>
                <div className="text-center">
                    <h2 className="text-xl font-bold">Print Preview</h2>
                    <p className="text-sm text-slate-600">{student.name} - {examTemplate?.name}</p>
                </div>
                <button onClick={() => window.print()} className="btn btn-primary"><PrinterIcon className="w-5 h-5"/> Print Report</button>
            </div>

            <div className="container mx-auto bg-white p-6 my-4 shadow-lg print:w-full print:max-w-none print:my-0 print:p-0 print:shadow-none">
                <div id={`printable-report-${student.id}`} className="font-serif print:text-sm">
                    <header className="text-center mb-2">
                        {examId !== 'terminal3'
                            ? <img src={SCHOOL_BANNER_URL} alt="School Banner" className="w-full h-auto mb-2"/>
                            : <div className="h-32 md:h-40 print:h-48" aria-hidden="true" />}
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
                            {student.photographUrl
                                ? <img src={student.photographUrl} alt={student.name} className="w-full h-24 print:h-20 object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                : <div className="w-full h-24 print:h-20 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs text-center">No Photo</div>}
                        </div>
                    </section>

                    <section className="mt-4 print:mt-2">
                        {examId === 'terminal3' ? (
                            // ── Route to correct layout based on grade group ──
                            isIXorX ? (
                                <IXXMultiTermCard student={student} gradeDef={gradeDef} exams={exams} summaries={summaries} staff={staff} />
                            ) : isIIItoVIII ? (
                                <ClassIIIToVIIIMultiTermCard student={student} gradeDef={gradeDef} exams={exams} summaries={summaries} staff={staff} />
                            ) : (
                                <NurseryToIIMultiTermCard student={student} gradeDef={gradeDef} exams={exams} summaries={summaries} staff={staff} />
                            )
                        ) : (
                            <ReportCard student={student} gradeDef={gradeDef} exam={singleExam} examTemplate={examTemplate} allStudents={classmates} academicYear={academicYear} staff={staff} />
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProgressReportPage;
