


import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Grade, GradeDefinition, Exam, StudentStatus, Staff, Attendance, SubjectMark, SubjectDefinition } from '../types';
import { BackIcon, PrinterIcon } from '../components/Icons';
import { TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES, SCHOOL_BANNER_URL } from '../constants';
import { formatDateForDisplay, normalizeSubjectName, formatStudentId, getNextGrade } from '../utils';
import { db } from '../firebaseConfig';

const { useParams, useNavigate } = ReactRouterDOM as any;

interface ProgressReportPageProps {
  students: Student[];
  staff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
}

// --- Reusable Logic and Components (copied from ProgressReportPage) ---

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
// FIX: Use nullish coalescing operator to ensure operands are numbers, as properties from Firestore can be undefined.
                subjectFullMarks = (sd.examFullMarks ?? 0) + (sd.activityFullMarks ?? 0);
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
        if (s.result === 'FAIL' || s.result === 'SIMPLE PASS') {
            finalRankedData.set(s.id, { ...s, rank: '-' });
        } else {
            const rankIndex = uniqueScores.indexOf(s.grandTotal);
            const rank = rankIndex !== -1 ? rankIndex + 1 : '-';
            finalRankedData.set(s.id, { ...s, rank });
        }
    });
    
    return finalRankedData.get(student.id) || null;
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
                                        <td className="p-1 border border-slate-400">{term3Result?.activityMarks  ?? '-'}