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

// ─── Subject matching: handles common name variations ────────────────────────
const findResultWithAliases = (results: SubjectMark[] | undefined, subjectDef: SubjectDefinition) => {
    if (!results || !Array.isArray(results) || !subjectDef?.name) return undefined;
    const normSubjDefName = normalizeSubjectName(subjectDef.name);

    return results.find(r => {
        if (!r?.subject) return false;
        const normResultName = normalizeSubjectName(r.subject);

        // Exact match
        if (normResultName === normSubjDefName) return true;

        // Math aliases
        const mathNames = ['math', 'maths', 'mathematics'];
        if (mathNames.includes(normSubjDefName) && mathNames.includes(normResultName)) return true;

        // English aliases
        if (normSubjDefName === 'english' && normResultName === 'english i') return true;
        if (normSubjDefName === 'english - ii' && normResultName === 'english ii') return true;
        if (normSubjDefName === 'eng-i' && (normResultName === 'english' || normResultName === 'english i')) return true;
        if (normSubjDefName === 'eng-ii' && (normResultName === 'english ii' || normResultName === 'english - ii')) return true;

        // Social Studies aliases - ENHANCED
        const socialNames = ['social studies', 'social science', 'social-studies', 'socialstudies'];
        if (socialNames.includes(normSubjDefName) && socialNames.includes(normResultName)) return true;

        // Science aliases
        const scienceNames = ['science', 'general science'];
        if (scienceNames.includes(normSubjDefName) && scienceNames.includes(normResultName)) return true;

        // Other aliases
        if (normSubjDefName === 'spellings' && normResultName === 'spelling') return true;
        if (normSubjDefName === 'spelling' && normResultName === 'spellings') return true;
        if (normSubjDefName === 'rhymes' && normResultName === 'rhyme') return true;
        if (normSubjDefName === 'rhyme' && normResultName === 'rhymes') return true;

        return false;
    });
};

// ─── Core summary calculation ─────────────────────────────────────────────────
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

    // Build subjects map — merge gradeDef subjects with any extra subjects found in this student's exam results
    const subjectsMap = new Map<string, SubjectDefinition>();
    (gradeDef.subjects || []).forEach(s => subjectsMap.set(normalizeSubjectName(s.name), s));

    // Also add subjects from the current student's exam results that might not be in gradeDef
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
    const numericSubjects = activeSubjects.filter(sd => sd.gradingSystem !== 'OABC');
    const gradedSubjects = activeSubjects.filter(sd => sd.gradingSystem === 'OABC');

    const classmates = allStudents.filter(s => s.grade === student.grade && s.status === StudentStatus.ACTIVE);

    // Calculate totals for all classmates for rank computation
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
    const uniqueScores = [...new Set(passedStudents.map(s => s.grandTotal))].sort((a, b) => b - a);

    const currentStudentStats = studentData.find(s => s.id === student.id);
    if (!currentStudentStats) return null;

    let rank: number | '-' = '-';
    if (currentStudentStats.result === 'PASS') {
        const rankIndex = uniqueScores.indexOf(currentStudentStats.grandTotal);
        rank = rankIndex !== -1 ? rankIndex + 1 : '-';
    }

    // Calculate current student's own totals using the exam passed in
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
        } else if (isClassIXorX && examId === 'terminal3') {
            const saMark = Number(result?.saMarks ?? result?.marks ?? 0);
            const faMark = Number(result?.faMarks ?? 0);
            totalSubjectMark = result?.saMarks != null ? saMark + faMark : Number(result?.marks ?? 0);
            examTotal += totalSubjectMark;
            subjectFullMarks = 100;
            if (totalSubjectMark < 33) failedSubjects.push(sd.name);
        } else {
            totalSubjectMark = Number(result?.marks ?? result?.examMarks ?? 0);
            examTotal += totalSubjectMark;
            subjectFullMarks = sd.examFullMarks ?? 100;
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
        rank,
        activeSubjects,
    };
};

// ─── Multi-term report (Terminal 3 only) ─────────────────────────────────────
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
            if (student.grade === Grade.X) return `Passed Class X. School reopens on April 1, 2026`;
            if (nextGradeLabel) return `Promoted to ${nextGradeLabel}. School reopens on April 1, 2026`;
            return `Promoted. School reopens on April 1, 2026`;
        } else if (summary3?.result === 'FAIL') {
            return "Detained";
        }
        return exam3?.teacherRemarks || summary3?.remark || "Awaiting final results.";
    }, [summaries.terminal3, exams.terminal3, student.grade]);

    // Build merged subject list across all three exams
    const allSubjects = useMemo(() => {
        const subjectsMap = new Map<string, SubjectDefinition>();
        (gradeDef.subjects || []).forEach(s => subjectsMap.set(normalizeSubjectName(s.name), s));
        ['terminal1', 'terminal2', 'terminal3'].forEach(tid => {
            const ex = exams[tid as 'terminal1' | 'terminal2' | 'terminal3'];
            ex?.results?.forEach(res => {
                const normalized = normalizeSubjectName(res.subject);
                if (!subjectsMap.has(normalized)) {
                    subjectsMap.set(normalized, {
                        name: res.subject, examFullMarks: 100, activityFullMarks: 0,
                        gradingSystem: res.grade ? 'OABC' : 'Numerical'
                    });
                }
            });
        });
        return Array.from(subjectsMap.values());
    }, [gradeDef, exams]);

    return (
        <div>
            <table className="w-full border-collapse border border-slate-400 text-sm">
                <thead>
                    <tr className="bg-slate-100">
                        <th rowSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 align-middle text-slate-800">SUBJECT</th>
                        <th colSpan={isIXorX ? 2 : hasActivities ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">I Terminal Examination</th>
                        <th colSpan={isIXorX ? 2 : hasActivities ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">II Terminal Examination</th>
                        <th colSpan={isIXorX ? 2 : hasActivities ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">III Terminal Examination</th>
                    </tr>
                    {(hasActivities || isIXorX) && (
                        <tr className="bg-slate-100 text-xs">
                            {hasActivities ? (
                                <>
                                    <th className="p-1 border border-slate-400 font-semibold text-slate-700">Summative</th>
                                    <th className="p-1 border border-slate-400 font-semibold text-slate-700">Activity</th>
                                    <th className="p-1 border border-slate-400 font-semibold text-slate-700">Summative</th>
                                    <th className="p-1 border border-slate-400 font-semibold text-slate-700">Activity</th>
                                    <th className="p-1 border border-slate-400 font-semibold text-slate-700">Summative</th>
                                    <th className="p-1 border border-slate-400 font-semibold text-slate-700">Activity</th>
                                </>
                            ) : isIXorX ? (
                                <>
                                    <th colSpan={2} className="p-1 border border-slate-400 font-semibold text-slate-500">Marks</th>
                                    <th colSpan={2} className="p-1 border border-slate-400 font-semibold text-slate-500">Marks</th>
                                    <th className="p-1 border border-slate-400 font-semibold text-slate-700">SA <span className="font-normal text-slate-400">/80</span></th>
                                    <th className="p-1 border border-slate-400 font-semibold text-slate-700">FA <span className="font-normal text-slate-400">/20</span></th>
                                </>
                            ) : null}
                        </tr>
                    )}
                </thead>
                <tbody>
                    {allSubjects.map(sd => {
                        const term1Result = findResultWithAliases(exams.terminal1?.results, sd);
                        const term2Result = findResultWithAliases(exams.terminal2?.results, sd);
                        const term3Result = findResultWithAliases(exams.terminal3?.results, sd);
                        const isGraded = sd.gradingSystem === 'OABC';

                        return (
                            <tr key={sd.name} className="text-center">
                                <td className="p-1 border border-slate-400 text-left font-semibold text-slate-800">{sd.name}</td>
                                {hasActivities ? (
                                    isGraded ? (
                                        <>
                                            <td colSpan={2} className="p-1 border border-slate-400 font-bold text-slate-800">{term1Result?.grade ?? '-'}</td>
                                            <td colSpan={2} className="p-1 border border-slate-400 font-bold text-slate-800">{term2Result?.grade ?? '-'}</td>
                                            <td colSpan={2} className="p-1 border border-slate-400 font-bold text-slate-800">{term3Result?.grade ?? '-'}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-1 border border-slate-400 text-slate-800">{term1Result?.examMarks ?? '-'}</td>
                                            <td className="p-1 border border-slate-400 text-slate-800">{term1Result?.activityMarks ?? '-'}</td>
                                            <td className="p-1 border border-slate-400 text-slate-800">{term2Result?.examMarks ?? '-'}</td>
                                            <td className="p-1 border border-slate-400 text-slate-800">{term2Result?.activityMarks ?? '-'}</td>
                                            <td className="p-1 border border-slate-400 text-slate-800">{term3Result?.examMarks ?? '-'}</td>
                                            <td className="p-1 border border-slate-400 text-slate-800">{term3Result?.activityMarks ?? '-'}</td>
                                        </>
                                    )
                                ) : isIXTerminal3Report ? (
                                    isGraded ? (
                                        <>
                                            <td colSpan={2} className="p-1 border border-slate-400 font-bold text-slate-800">{term1Result?.grade ?? '-'}</td>
                                            <td colSpan={2} className="p-1 border border-slate-400 font-bold text-slate-800">{term2Result?.grade ?? '-'}</td>
                                            <td colSpan={2} className="p-1 border border-slate-400 font-bold text-slate-800">{term3Result?.grade ?? '-'}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td colSpan={2} className="p-1 border border-slate-400 font-bold text-slate-800">{term1Result?.marks ?? '-'}</td>
                                            <td colSpan={2} className="p-1 border border-slate-400 font-bold text-slate-800">{term2Result?.marks ?? '-'}</td>
                                            <td className="p-1 border border-slate-400 font-bold text-slate-800">{term3Result?.saMarks ?? (term3Result?.marks != null ? term3Result.marks : '-')}</td>
                                            <td className="p-1 border border-slate-400 font-bold text-slate-800">{term3Result?.faMarks ?? '-'}</td>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <td className="p-1 border border-slate-400 font-bold text-slate-800">{isGraded ? (term1Result?.grade ?? '-') : (term1Result?.marks ?? '-')}</td>
                                        <td className="p-1 border border-slate-400 font-bold text-slate-800">{isGraded ? (term2Result?.grade ?? '-') : (term2Result?.marks ?? '-')}</td>
                                        <td className="p-1 border border-slate-400 font-bold text-slate-800">{isGraded ? (term3Result?.grade ?? '-') : (term3Result?.marks ?? '-')}</td>
                                    </>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    {hasActivities && (
                        <tr className="font-bold text-center">
                            <td className="p-1 border border-slate-400 text-left text-slate-800">Total</td>
                            <td className="p-1 border border-slate-400 text-slate-800">{summaries.terminal1?.examTotal ?? '-'}</td>
                            <td className="p-1 border border-slate-400 text-slate-800">{summaries.terminal1?.activityTotal ?? '-'}</td>
                            <td className="p-1 border border-slate-400 text-slate-800">{summaries.terminal2?.examTotal ?? '-'}</td>
                            <td className="p-1 border border-slate-400 text-slate-800">{summaries.terminal2?.activityTotal ?? '-'}</td>
                            <td className="p-1 border border-slate-400 text-slate-800">{summaries.terminal3?.examTotal ?? '-'}</td>
                            <td className="p-1 border border-slate-400 text-slate-800">{summaries.terminal3?.activityTotal ?? '-'}</td>
                        </tr>
                    )}
                    <tr className="font-bold text-center">
                        <td className="p-1 border border-slate-400 text-left text-slate-800">Grand Total</td>
                        <td colSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{summaries.terminal1?.grandTotal ?? '-'}</td>
                        <td colSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{summaries.terminal2?.grandTotal ?? '-'}</td>
                        <td colSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{summaries.terminal3?.grandTotal ?? '-'}</td>
                    </tr>
                    <tr className="font-bold text-center">
                        <td className="p-1 border border-slate-400 text-left text-slate-800">Result</td>
                        <td colSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{summaries.terminal1?.result ?? '-'}</td>
                        <td colSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{summaries.terminal2?.result ?? '-'}</td>
                        <td colSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{summaries.terminal3?.result ?? '-'}</td>
                    </tr>
                    <tr className="font-bold text-center">
                        <td className="p-1 border border-slate-400 text-left text-slate-800">Rank</td>
                        <td colSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{summaries.terminal1?.rank ?? '-'}</td>
                        <td colSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{summaries.terminal2?.rank ?? '-'}</td>
                        <td colSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{summaries.terminal3?.rank ?? '-'}</td>
                    </tr>
                    <tr className="font-bold text-center">
                        <td className="p-1 border border-slate-400 text-left text-slate-800">Percentage</td>
                        <td colSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{summaries.terminal1?.percentage?.toFixed(1) ?? '-'}</td>
                        <td colSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{summaries.terminal2?.percentage?.toFixed(1) ?? '-'}</td>
                        <td colSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{summaries.terminal3?.percentage?.toFixed(1) ?? '-'}</td>
                    </tr>
                    <tr className="font-bold text-center">
                        <td className="p-1 border border-slate-400 text-left text-slate-800">{isIXorX ? 'Division' : 'Grade'}</td>
                        <td colSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{isIXorX ? (summaries.terminal1?.division ?? '-') : (summaries.terminal1?.academicGrade ?? '-')}</td>
                        <td colSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{isIXorX ? (summaries.terminal2?.division ?? '-') : (summaries.terminal2?.academicGrade ?? '-')}</td>
                        <td colSpan={hasActivities || isIXorX ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{isIXorX ? (summaries.terminal3?.division ?? '-') : (summaries.terminal3?.academicGrade ?? '-')}</td>
                    </tr>
                    <tr className="font-bold text-center">
                        <td className="p-1 border border-slate-400 text-left text-slate-800">Attendance %</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{getAttendancePercent(exams.terminal1?.attendance)}</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{getAttendancePercent(exams.terminal2?.attendance)}</td>
                        <td colSpan={hasActivities ? 2 : 1} className="p-1 border border-slate-400 text-slate-800">{getAttendancePercent(exams.terminal3?.attendance)}</td>
                    </tr>
                </tfoot>
            </table>

            <div className="mt-4 border border-slate-400 rounded-lg p-2 text-sm break-inside-avoid">
                <strong className="text-slate-800">Final Remarks:</strong> <span className="text-slate-800">{finalRemark}</span>
            </div>

            <div className="mt-8 text-sm break-inside-avoid">
                <div className="flex justify-between items-end">
                    <div className="text-center">
                        <div className="h-12 flex flex-col justify-end pb-1 min-w-[150px]">
                            {classTeacher ? (
                                <p className="font-bold uppercase text-slate-900 text-xs">{classTeacher.firstName} {classTeacher.lastName}</p>
                            ) : (
                                <div className="h-4"></div>
                            )}
                        </div>
                        <p className="border-t-2 border-slate-500 pt-2 font-semibold px-4 text-slate-800">Class Teacher's Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="h-12 flex flex-col justify-end pb-1 min-w-[150px]">
                            <p className="font-bold uppercase text-slate-900 text-xs">K Malsawmdawngi</p>
                        </div>
                        <p className="border-t-2 border-slate-500 pt-2 font-semibold px-4 text-slate-800">Principal's Signature</p>
                    </div>
                </div>
                <div className="flex justify-between mt-4 text-xs text-slate-500">
                    <p>Date : {formatDateForDisplay(new Date().toISOString().split('T')[0])}</p>
                </div>
            </div>
        </div>
    );
};

// ─── Single-term report card ──────────────────────────────────────────────────
const ReportCard: React.FC<any> = ({ student, gradeDef, exam, examTemplate, allStudents, academicYear, staff }) => {
    const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    const isClassIXorX = student.grade === Grade.IX || student.grade === Grade.X;
    const isNurseryToII = [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(student.grade);

    const processedReportData = useMemo(() => {
        return calculateTermSummary(student, exam, examTemplate.id as any, gradeDef, allStudents);
    }, [student, exam, examTemplate.id, gradeDef, allStudents]);

    // Build subject list: merge gradeDef subjects + any extra from this exam's results
    const displaySubjects = useMemo(() => {
        const subjectsMap = new Map<string, SubjectDefinition>();
        (gradeDef.subjects || []).forEach((s: SubjectDefinition) => subjectsMap.set(normalizeSubjectName(s.name), s));
        exam?.results?.forEach((res: SubjectMark) => {
            const normalized = normalizeSubjectName(res.subject);
            if (!subjectsMap.has(normalized)) {
                subjectsMap.set(normalized, {
                    name: res.subject, examFullMarks: 100, activityFullMarks: 0,
                    gradingSystem: res.grade ? 'OABC' : 'Numerical'
                });
            }
        });
        return Array.from(subjectsMap.values());
    }, [gradeDef, exam]);

    const classTeacher = useMemo(() => {
        if (!staff || !gradeDef?.classTeacherId) return null;
        return staff.find((s: Staff) => s.id === gradeDef.classTeacherId);
    }, [staff, gradeDef]);

    return (
        <div className="border border-slate-400 rounded-lg overflow-hidden break-inside-avoid page-break-inside-avoid print:border-2 print:rounded-none">
            <h3 className="text-lg font-bold text-center text-slate-800 p-2 bg-slate-100 print:bg-transparent print:py-1 print:text-base print:border-b print:border-slate-400">
                {examTemplate.name}
            </h3>
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
                    {displaySubjects.map((sd: SubjectDefinition) => {
                        const result = findResultWithAliases(exam?.results, sd);
                        const isGraded = sd.gradingSystem === 'OABC';
                        return (
                            <tr key={sd.name} className="border-t border-slate-300">
                                <td className="px-2 py-1 font-medium text-slate-800 border-r border-slate-300">{sd.name}</td>
                                {isNurseryToII ? (
                                    <>
                                        <td className="px-2 py-1 text-center text-slate-700 border-r border-slate-300">{isGraded ? 'Graded' : sd.examFullMarks}</td>
                                        <td className="px-2 py-1 text-center text-slate-700 border-r border-slate-300">{isGraded ? '-' : 35}</td>
                                        <td className="px-2 py-1 text-center font-bold text-slate-800">{isGraded ? (result?.grade || '-') : (result?.marks ?? 0)}</td>
                                    </>
                                ) : hasActivities ? (
                                    isGraded ? (
                                        <td colSpan={5} className="px-2 py-1 text-center font-bold text-slate-800">{result?.grade || '-'}</td>
                                    ) : (
                                        <>
                                            <td className="px-2 py-1 text-center text-slate-700 border-r border-slate-300">{sd.examFullMarks}</td>
                                            <td className="px-2 py-1 text-center font-bold text-slate-800 border-r border-slate-300">{result?.examMarks ?? 0}</td>
                                            <td className="px-2 py-1 text-center text-slate-700 border-r border-slate-300">{sd.activityFullMarks}</td>
                                            <td className="px-2 py-1 text-center font-bold text-slate-800 border-r border-slate-300">{result?.activityMarks ?? 0}</td>
                                            <td className="px-2 py-1 text-center font-bold text-slate-800">{Number(result?.examMarks ?? 0) + Number(result?.activityMarks ?? 0)}</td>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <td className="px-2 py-1 text-center text-slate-700 border-r border-slate-300">{isGraded ? 'Graded' : sd.examFullMarks}</td>
                                        <td className="px-2 py-1 text-center text-slate-700 border-r border-slate-300">{isGraded ? '-' : 33}</td>
                                        <td className="px-2 py-1 text-center font-bold text-slate-800">{isGraded ? (result?.grade || '-') : (result?.marks ?? result?.examMarks ?? 0)}</td>
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
                    <div className={`font-bold ${processedReportData?.result !== 'PASS' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {processedReportData?.result}
                    </div>

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
                    <span className="font-semibold text-slate-700">Teacher's Remarks: </span>
                    <span className="text-slate-800">{exam?.teacherRemarks || processedReportData?.remark || 'N/A'}</span>
                </div>
            </div>
            <div className="mt-4 text-sm break-inside-avoid p-3 print:mt-2 print:pt-0">
                <div className="flex justify-between items-end">
                    <div className="text-center">
                        <div className="h-12 flex flex-col justify-end pb-1 min-w-[150px]">
                            {classTeacher ? (
                                <p className="font-bold uppercase text-slate-900 text-xs">{classTeacher.firstName} {classTeacher.lastName}</p>
                            ) : (
                                <div className="h-4"></div>
                            )}
                        </div>
                        <p className="border-t-2 border-slate-500 pt-2 font-semibold px-4 text-slate-800">Class Teacher's Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="h-12 min-w-[150px]"></div>
                        <p className="border-t-2 border-slate-500 pt-2 font-semibold px-4 text-slate-800">Principal's Signature</p>
                    </div>
                </div>
                <div className="flex justify-between mt-4 print:mt-1">
                    <p className="text-slate-600">Date : {formatDateForDisplay(new Date().toISOString().split('T')[0])}</p>
                    <p className="text-slate-600">Time : {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page Component ──────────────────────────────────────────────────────
const ProgressReportPage: React.FC<ProgressReportPageProps> = ({ students, staff, gradeDefinitions, academicYear }) => {
    const { studentId, examId } = useParams() as { studentId: string; examId: string };
    const navigate = useNavigate();

    // Student from prop (may be slightly stale after save)
    const studentFromProp = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);

    // Fetch classmates fresh from Firestore so rank is always accurate
    const [classmates, setClassmates] = useState<Student[]>([]);

    useEffect(() => {
        if (!studentFromProp) return;
        const unsubscribe = db.collection('students')
            .where('grade', '==', studentFromProp.grade)
            .where('status', '==', StudentStatus.ACTIVE)
            .onSnapshot(snapshot => {
                const fetchedClassmates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
                setClassmates(fetchedClassmates);
            });
        return () => unsubscribe();
    }, [studentFromProp]);

    // FIX: Use the fresh student data from Firestore classmates snapshot
    // so that marks saved in ClassMarkStatementPage are immediately reflected here
    const student = useMemo(() => {
        if (classmates.length === 0) return studentFromProp;
        return classmates.find(s => s.id === studentId) ?? studentFromProp;
    }, [classmates, studentId, studentFromProp]);

    const gradeDef = useMemo(() => {
        if (!student || !gradeDefinitions[student.grade]) return null;
        const def = gradeDefinitions[student.grade];
        if (student.grade === Grade.IX || student.grade === Grade.X) {
            return {
                ...def,
                subjects: (def.subjects || []).map(s => ({
                    ...s,
                    examFullMarks: 100,
                    activityFullMarks: 0
                }))
            };
        }
        return def;
    }, [student, gradeDefinitions]);

    const examTemplate = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);

    const exams = useMemo(() => ({
        terminal1: student?.academicPerformance?.find(e => e.id === 'terminal1'),
        terminal2: student?.academicPerformance?.find(e => e.id === 'terminal2'),
        terminal3: student?.academicPerformance?.find(e => e.id === 'terminal3'),
    }), [student?.academicPerformance]);

    // Only calculate summaries once classmates are loaded from Firestore
    const canCalculate = student != null && gradeDef != null && classmates.length > 0;

    const summaries = {
        terminal1: useMemo(() =>
            canCalculate ? calculateTermSummary(student!, exams.terminal1, 'terminal1', gradeDef!, classmates) : null,
        [canCalculate, student, exams.terminal1, gradeDef, classmates]),

        terminal2: useMemo(() =>
            canCalculate ? calculateTermSummary(student!, exams.terminal2, 'terminal2', gradeDef!, classmates) : null,
        [canCalculate, student, exams.terminal2, gradeDef, classmates]),

        terminal3: useMemo(() =>
            canCalculate ? calculateTermSummary(student!, exams.terminal3, 'terminal3', gradeDef!, classmates) : null,
        [canCalculate, student, exams.terminal3, gradeDef, classmates]),
    };

    const singleExam = useMemo(() =>
        exams[examId as 'terminal1' | 'terminal2' | 'terminal3'],
    [exams, examId]);

    if (!student) {
        return <div className="p-8 text-center text-slate-700">Loading student data...</div>;
    }

    if (!gradeDef) {
        return (
            <div className="p-8 text-center text-slate-700">
                <p>Curriculum not defined for {student.grade}. Please contact an administrator.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-100 print:bg-white">
            <div className="print-hidden container mx-auto p-4 flex justify-between items-center sticky top-0 bg-slate-100/80 backdrop-blur-sm z-10 shadow-sm">
                <button onClick={() => navigate(-1)} className="btn btn-secondary"><BackIcon className="w-5 h-5"/> Back</button>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-800">Print Preview</h2>
                    <p className="text-sm text-slate-600">{student.name} - {examTemplate?.name}</p>
                </div>
                <button onClick={() => window.print()} className="btn btn-primary"><PrinterIcon className="w-5 h-5"/> Print Report</button>
            </div>

            <div className="container mx-auto bg-white p-6 my-4 shadow-lg print:w-full print:max-w-none print:my-0 print:p-0 print:shadow-none">
                <div id={`printable-report-${student.id}`} className="font-serif print:text-sm">
                    <header className="text-center mb-2">
                        {examId !== 'terminal3' ? (
                            <img src={SCHOOL_BANNER_URL} alt="School Banner" className="w-full h-auto mb-2"/>
                        ) : (
                            <div className="h-32 md:h-40 print:h-48" aria-hidden="true"></div>
                        )}
                        <h2 className="text-xl font-semibold inline-block border-b-2 border-slate-700 px-8 pb-1 mt-2 print:text-lg print:mt-0 text-slate-800">
                            STUDENT'S PROGRESS REPORT
                        </h2>
                        <p className="font-semibold mt-1 print:text-sm text-slate-700">Academic Session: {academicYear}</p>
                    </header>

                    <section className="mb-2 border-2 border-slate-400 rounded-lg text-sm print:mb-1 flex items-stretch">
                        <div className="flex-1 p-2 print:p-1 grid grid-cols-3 gap-x-2 gap-y-1 print:gap-y-0.5 content-start">
                            <div><strong className="block text-slate-600">Student's Name:</strong><span className="font-bold text-base text-slate-800">{student.name}</span></div>
                            <div><strong className="block text-slate-600">Father's Name:</strong><span className="font-bold text-base text-slate-800">{student.fatherName}</span></div>
                            <div><strong className="block text-slate-600">Date of Birth:</strong><span className="font-bold text-base text-slate-800">{formatDateForDisplay(student.dateOfBirth)}</span></div>
                            <div><strong className="block text-slate-600">Class:</strong><span className="font-bold text-base text-slate-800">{student.grade}</span></div>
                            <div><strong className="block text-slate-600">Roll No:</strong><span className="font-bold text-base text-slate-800">{student.rollNo}</span></div>
                            <div><strong className="block text-slate-600">Student ID:</strong><span className="font-bold text-base text-slate-800">{formatStudentId(student, academicYear)}</span></div>
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

                    {/* Show loading indicator while classmates are being fetched */}
                    {classmates.length === 0 && (
                        <div className="text-center py-4 text-slate-500 text-sm">Loading class data for rank calculation...</div>
                    )}

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
                            <ReportCard
                                student={student}
                                gradeDef={gradeDef}
                                exam={singleExam}
                                examTemplate={examTemplate}
                                allStudents={classmates.length > 0 ? classmates : [student]}
                                academicYear={academicYear}
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
