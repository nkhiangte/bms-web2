import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Grade, GradeDefinition, Exam, StudentStatus, Staff, Attendance, SubjectMark, SubjectDefinition } from '@/types';
import { BackIcon, PrinterIcon } from '@/components/Icons';
import { TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES, SCHOOL_BANNER_URL } from '@/constants';
import { formatDateForDisplay, normalizeSubjectName, formatStudentId, getNextGrade, subjectsMatch } from '@/utils';
import PhotoWithFallback from '@/components/PhotoWithFallback';
import { db } from '@/firebaseConfig';

const { useParams, useNavigate } = ReactRouterDOM as any;

interface ProgressReportPageProps {
  students: Student[];
  staff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
}

const findResultWithAliases = (results: SubjectMark[] | undefined, subjectDef: SubjectDefinition) => {
    if (!results || !Array.isArray(results) || !subjectDef?.name) return undefined;
    return results.find(r => r?.subject != null && subjectsMatch(r.subject, subjectDef.name));
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

        let gTotal = 0;
        let fSubjects = 0;
        let gSubjectsPassed = 0;

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
                if (totalMark < 33) fSubjects++;
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

    return { id: student.id, grandTotal, examTotal, activityTotal, percentage, result: currentStudentStats.result, division, academicGrade, remark, rank };
};

// ─────────────────────────────────────────────────────────────────────────────
//  Multi-Term Report Card
// ─────────────────────────────────────────────────────────────────────────────
const MultiTermReportCard: React.FC<{
    student: Student;
    gradeDef: GradeDefinition;
    exams: Record<'terminal1' | 'terminal2' | 'terminal3', Exam | undefined>;
    summaries: Record<'terminal1' | 'terminal2' | 'terminal3', ReturnType<typeof calculateTermSummary>>;
    staff: Staff[];
}> = ({ student, gradeDef, exams, summaries, staff }) => {
    const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    const isIXorX = student.grade === Grade.IX || student.grade === Grade.X;
    const isIXTerminal3Report = student.grade === Grade.IX || student.grade === Grade.X;
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

    return (
        <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
                <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                        <th rowSpan={hasActivities || isIXorX ? 2 : 1} style={thStyle}>SUBJECT</th>
                        <th colSpan={isIXorX ? 2 : hasActivities ? 2 : 1} style={thStyle}>I Terminal</th>
                        <th colSpan={isIXorX ? 2 : hasActivities ? 2 : 1} style={thStyle}>II Terminal</th>
                        <th colSpan={isIXorX ? 2 : hasActivities ? 2 : 1} style={thStyle}>III Terminal</th>
                    </tr>
                    {(hasActivities || isIXorX) && (
                        <tr style={{ background: '#f1f5f9', fontSize: '7pt' }}>
                            {hasActivities ? (
                                <>
                                    <th style={thStyle}>Sum.</th><th style={thStyle}>Act.</th>
                                    <th style={thStyle}>Sum.</th><th style={thStyle}>Act.</th>
                                    <th style={thStyle}>Sum.</th><th style={thStyle}>Act.</th>
                                </>
                            ) : isIXorX ? (
                                <>
                                    <th colSpan={2} style={thStyle}>Marks</th>
                                    <th colSpan={2} style={thStyle}>Marks</th>
                                    <th style={thStyle}>SA/80</th>
                                    <th style={thStyle}>FA/20</th>
                                </>
                            ) : null}
                        </tr>
                    )}
                </thead>
                <tbody>
                    {(gradeDef.subjects ?? []).filter(Boolean).map(sd => {
                        const t1 = findResultWithAliases(exams.terminal1?.results, sd);
                        const t2 = findResultWithAliases(exams.terminal2?.results, sd);
                        const t3 = findResultWithAliases(exams.terminal3?.results, sd);
                        const isGraded = sd.gradingSystem === 'OABC';
                        return (
                            <tr key={sd.name} style={{ textAlign: 'center' }}>
                                <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 600 }}>{sd.name}</td>
                                {hasActivities ? (
                                    isGraded ? (
                                        <><td colSpan={2} style={tdStyle}>{t1?.grade ?? '-'}</td><td colSpan={2} style={tdStyle}>{t2?.grade ?? '-'}</td><td colSpan={2} style={tdStyle}>{t3?.grade ?? '-'}</td></>
                                    ) : (
                                        <><td style={tdStyle}>{t1?.examMarks ?? '-'}</td><td style={tdStyle}>{t1?.activityMarks ?? '-'}</td><td style={tdStyle}>{t2?.examMarks ?? '-'}</td><td style={tdStyle}>{t2?.activityMarks ?? '-'}</td><td style={tdStyle}>{t3?.examMarks ?? '-'}</td><td style={tdStyle}>{t3?.activityMarks ?? '-'}</td></>
                                    )
                                ) : isIXTerminal3Report ? (
                                    isGraded ? (
                                        <><td colSpan={2} style={tdStyle}>{t1?.grade ?? '-'}</td><td colSpan={2} style={tdStyle}>{t2?.grade ?? '-'}</td><td colSpan={2} style={tdStyle}>{t3?.grade ?? '-'}</td></>
                                    ) : (
                                        <><td colSpan={2} style={tdStyle}>{t1?.marks ?? '-'}</td><td colSpan={2} style={tdStyle}>{t2?.marks ?? '-'}</td><td style={tdStyle}>{t3?.saMarks ?? t3?.marks ?? '-'}</td><td style={tdStyle}>{t3?.faMarks ?? '-'}</td></>
                                    )
                                ) : (
                                    <><td style={tdStyle}>{isGraded ? (t1?.grade ?? '-') : (t1?.marks ?? '-')}</td><td style={tdStyle}>{isGraded ? (t2?.grade ?? '-') : (t2?.marks ?? '-')}</td><td style={tdStyle}>{isGraded ? (t3?.grade ?? '-') : (t3?.marks ?? '-')}</td></>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    {hasActivities && (
                        <tr style={{ fontWeight: 'bold', textAlign: 'center' }}>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>Total</td>
                            <td style={tdStyle}>{summaries.terminal1?.examTotal ?? '-'}</td><td style={tdStyle}>{summaries.terminal1?.activityTotal ?? '-'}</td>
                            <td style={tdStyle}>{summaries.terminal2?.examTotal ?? '-'}</td><td style={tdStyle}>{summaries.terminal2?.activityTotal ?? '-'}</td>
                            <td style={tdStyle}>{summaries.terminal3?.examTotal ?? '-'}</td><td style={tdStyle}>{summaries.terminal3?.activityTotal ?? '-'}</td>
                        </tr>
                    )}
                    {[
                        ['Grand Total', summaries.terminal1?.grandTotal, summaries.terminal2?.grandTotal, summaries.terminal3?.grandTotal],
                        ['Result',      summaries.terminal1?.result,     summaries.terminal2?.result,     summaries.terminal3?.result],
                        ['Rank',        summaries.terminal1?.rank,        summaries.terminal2?.rank,        summaries.terminal3?.rank],
                        ['Percentage',  summaries.terminal1?.percentage != null ? summaries.terminal1.percentage.toFixed(1) : '-',
                                        summaries.terminal2?.percentage != null ? summaries.terminal2.percentage.toFixed(1) : '-',
                                        summaries.terminal3?.percentage != null ? summaries.terminal3.percentage.toFixed(1) : '-'],
                        [isIXorX ? 'Division' : 'Grade',
                                        isIXorX ? summaries.terminal1?.division : summaries.terminal1?.academicGrade,
                                        isIXorX ? summaries.terminal2?.division : summaries.terminal2?.academicGrade,
                                        isIXorX ? summaries.terminal3?.division : summaries.terminal3?.academicGrade],
                        ['Attendance %',getAttendancePercent(exams.terminal1?.attendance), getAttendancePercent(exams.terminal2?.attendance), getAttendancePercent(exams.terminal3?.attendance)],
                    ].map(([label, v1, v2, v3]) => (
                        <tr key={label as string} style={{ fontWeight: 'bold', textAlign: 'center' }}>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{label}</td>
                            <td colSpan={hasActivities || isIXorX ? 2 : 1} style={tdStyle}>{v1 ?? '-'}</td>
                            <td colSpan={hasActivities || isIXorX ? 2 : 1} style={tdStyle}>{v2 ?? '-'}</td>
                            <td colSpan={hasActivities || isIXorX ? 2 : 1} style={tdStyle}>{v3 ?? '-'}</td>
                        </tr>
                    ))}
                </tfoot>
            </table>

            <div style={{ marginTop: '6px', border: '1px solid #94a3b8', borderRadius: '3px', padding: '3px 6px', fontSize: '8pt' }}>
                <strong>Final Remarks:</strong> {finalRemark}
            </div>

            <div style={{ marginTop: '10px', fontSize: '8pt' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ height: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minWidth: '140px' }}>
                            {classTeacher && <p style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '8pt', margin: 0 }}>{classTeacher.firstName} {classTeacher.lastName}</p>}
                        </div>
                        <p style={{ borderTop: '2px solid #0f172a', paddingTop: '3px', fontWeight: 600, paddingLeft: '16px', paddingRight: '16px', margin: 0 }}>Class Teacher's Signature</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ height: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minWidth: '140px' }}>
                            <p style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '8pt', margin: 0 }}>K Malsawmdawngi</p>
                        </div>
                        <p style={{ borderTop: '2px solid #0f172a', paddingTop: '3px', fontWeight: 600, paddingLeft: '16px', paddingRight: '16px', margin: 0 }}>Principal's Signature</p>
                    </div>
                </div>
                <div style={{ marginTop: '6px', fontSize: '7pt', color: '#64748b' }}>
                    <p style={{ margin: 0 }}>Date : {formatDateForDisplay(new Date().toISOString().split('T')[0])}</p>
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
        <div>
            <h3 style={{ fontSize: '10pt', fontWeight: 'bold', textAlign: 'center', margin: '0 0 4px 0', borderBottom: '1px solid #94a3b8', paddingBottom: '3px' }}>{examTemplate.name}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
                <thead>
                    {isNurseryToII ? (
                        <tr>
                            <th style={thStyle}>Subject</th>
                            <th style={thStyle}>Full Marks</th>
                            <th style={thStyle}>Pass Marks</th>
                            <th style={thStyle}>Marks Obtained</th>
                        </tr>
                    ) : hasActivities ? (
                        <>
                            <tr>
                                <th rowSpan={2} style={{ ...thStyle, textAlign: 'left' }}>Subject</th>
                                <th colSpan={2} style={thStyle}>Summative</th>
                                <th colSpan={2} style={thStyle}>Activity</th>
                                <th rowSpan={2} style={thStyle}>Total</th>
                            </tr>
                            <tr>
                                <th style={thStyle}>Full</th><th style={thStyle}>Obt.</th>
                                <th style={thStyle}>Full</th><th style={thStyle}>Obt.</th>
                            </tr>
                        </>
                    ) : (
                        <tr>
                            <th style={{ ...thStyle, textAlign: 'left' }}>Subject</th>
                            <th style={thStyle}>Full Marks</th>
                            <th style={thStyle}>Pass Marks</th>
                            <th style={thStyle}>Marks Obtained</th>
                        </tr>
                    )}
                </thead>
                <tbody>
                    {(gradeDef.subjects ?? []).filter(Boolean).map((sd: any) => {
                        const result = findResultWithAliases(exam?.results, sd);
                        const isGraded = sd.gradingSystem === 'OABC';
                        return (
                            <tr key={sd.name}>
                                <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500 }}>{sd.name}</td>
                                {isNurseryToII ? (
                                    <><td style={tdStyle}>{isGraded ? 'Graded' : sd.examFullMarks}</td><td style={tdStyle}>{isGraded ? '-' : 35}</td><td style={{ ...tdStyle, fontWeight: 'bold' }}>{isGraded ? (result?.grade || '-') : (result?.marks ?? 0)}</td></>
                                ) : hasActivities ? (
                                    isGraded ? (
                                        <td colSpan={5} style={{ ...tdStyle, fontWeight: 'bold', textAlign: 'center' }}>{result?.grade || '-'}</td>
                                    ) : (
                                        <><td style={tdStyle}>{sd.examFullMarks}</td><td style={tdStyle}>{result?.examMarks ?? 0}</td><td style={tdStyle}>{sd.activityFullMarks}</td><td style={tdStyle}>{result?.activityMarks ?? 0}</td><td style={{ ...tdStyle, fontWeight: 'bold' }}>{Number(result?.examMarks ?? 0) + Number(result?.activityMarks ?? 0)}</td></>
                                    )
                                ) : (
                                    <><td style={tdStyle}>{isGraded ? 'Graded' : sd.examFullMarks}</td><td style={tdStyle}>{isGraded ? '-' : 33}</td><td style={{ ...tdStyle, fontWeight: 'bold' }}>{isGraded ? (result?.grade || '-') : (result?.marks ?? 0)}</td></>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div style={{ marginTop: '4px', padding: '4px 6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '8pt' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 16px' }}>
                    {hasActivities && (<><span style={{ textAlign: 'right', color: '#475569', fontWeight: 600 }}>Summative Total:</span><span style={{ fontWeight: 'bold' }}>{processedReportData?.examTotal}</span><span style={{ textAlign: 'right', color: '#475569', fontWeight: 600 }}>Activity Total:</span><span style={{ fontWeight: 'bold' }}>{processedReportData?.activityTotal}</span></>)}
                    <span style={{ textAlign: 'right', color: '#475569', fontWeight: 600 }}>Grand Total:</span><span style={{ fontWeight: 'bold' }}>{processedReportData?.grandTotal}</span>
                    <span style={{ textAlign: 'right', color: '#475569', fontWeight: 600 }}>Percentage:</span><span style={{ fontWeight: 'bold' }}>{processedReportData?.percentage?.toFixed(2) ?? '0.00'}%</span>
                    {!isClassIXorX && (<><span style={{ textAlign: 'right', color: '#475569', fontWeight: 600 }}>Grade:</span><span style={{ fontWeight: 'bold' }}>{processedReportData?.academicGrade}</span></>)}
                    {isClassIXorX && (<><span style={{ textAlign: 'right', color: '#475569', fontWeight: 600 }}>Division:</span><span style={{ fontWeight: 'bold' }}>{processedReportData?.division}</span></>)}
                    <span style={{ textAlign: 'right', color: '#475569', fontWeight: 600 }}>Result:</span><span style={{ fontWeight: 'bold', color: processedReportData?.result !== 'PASS' ? '#dc2626' : '#059669' }}>{processedReportData?.result}</span>
                    <span style={{ textAlign: 'right', color: '#475569', fontWeight: 600 }}>Rank:</span><span style={{ fontWeight: 'bold' }}>{processedReportData?.rank}</span>
                    <span style={{ textAlign: 'right', color: '#475569', fontWeight: 600 }}>Attendance %:</span><span style={{ fontWeight: 'bold' }}>{(exam?.attendance && exam.attendance.totalWorkingDays > 0) ? `${((exam.attendance.daysPresent / exam.attendance.totalWorkingDays) * 100).toFixed(0)}%` : 'N/A'}</span>
                </div>
                <div style={{ marginTop: '3px', paddingTop: '3px', borderTop: '1px solid #e2e8f0', fontSize: '7.5pt' }}>
                    <strong>Teacher's Remarks: </strong>{exam?.teacherRemarks || processedReportData?.remark || 'N/A'}
                </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '8pt' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ height: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minWidth: '140px' }}>
                            {classTeacher && <p style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '8pt', margin: 0 }}>{classTeacher.firstName} {classTeacher.lastName}</p>}
                        </div>
                        <p style={{ borderTop: '2px solid #0f172a', paddingTop: '3px', fontWeight: 600, paddingLeft: '16px', paddingRight: '16px', margin: 0 }}>Class Teacher's Signature</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ height: '28px', minWidth: '140px' }}></div>
                        <p style={{ borderTop: '2px solid #0f172a', paddingTop: '3px', fontWeight: 600, paddingLeft: '16px', paddingRight: '16px', margin: 0 }}>Principal's Signature</p>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '7pt', color: '#64748b' }}>
                    <p style={{ margin: 0 }}>Date : {formatDateForDisplay(new Date().toISOString().split('T')[0])}</p>
                    <p style={{ margin: 0 }}>Time : {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                </div>
            </div>
        </div>
    );
};

// Shared inline style helpers
const thStyle: React.CSSProperties = {
    padding: '2px 4px',
    border: '1px solid #94a3b8',
    textAlign: 'center',
    fontWeight: 600,
    background: '#f1f5f9',
};
const tdStyle: React.CSSProperties = {
    padding: '2px 4px',
    border: '1px solid #94a3b8',
    textAlign: 'center',
};

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────
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
        if (student.grade === Grade.IX || student.grade === Grade.X) {
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

    const dynamicPrintStyles = useMemo(() => `
@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }
  body * { visibility: hidden; }
  #progress-report-printable, #progress-report-printable * { visibility: visible; }
  #progress-report-printable {
    position: fixed;
    top: 0; left: 0;
    width: 210mm;
    padding: ${examId === 'terminal3' ? '8.5cm' : '0.5cm'} 1cm 1cm 1cm;
    box-sizing: border-box;
    font-size: 9pt;
    font-family: serif;
  }
  .print-hidden { display: none !important; }
}
`, [examId]);

    if (!student) return <div className="p-8 text-center">Loading student data...</div>;
    if (!gradeDef) return <div className="p-8 text-center"><p>Curriculum not defined for {student.grade}.</p></div>;

    return (
        <div className="bg-slate-100 print:bg-white">
            {/* Inject dynamic print styles */}
            <style dangerouslySetInnerHTML={{ __html: dynamicPrintStyles }} />

            {/* Screen nav bar */}
            <div className="print-hidden container mx-auto p-4 flex justify-between items-center sticky top-0 bg-slate-100/80 backdrop-blur-sm z-10 shadow-sm">
                <button onClick={() => navigate(-1)} className="btn btn-secondary"><BackIcon className="w-5 h-5" /> Back</button>
                <div className="text-center">
                    <h2 className="text-xl font-bold">Print Preview</h2>
                    <p className="text-sm text-slate-600">{student.name} — {examTemplate?.name}</p>
                </div>
                <button onClick={() => window.print()} className="btn btn-primary"><PrinterIcon className="w-5 h-5" /> Print Report</button>
            </div>

            {/* Screen preview card */}
            <div className="container mx-auto bg-white p-6 my-4 shadow-lg print:hidden">
                <p className="text-xs text-slate-400 mb-2 text-center">Screen preview — actual print output uses A4 with 8 cm top margin for letterhead.</p>
            </div>

            {/* ── Printable area ── */}
            <div id="progress-report-printable" className="container mx-auto bg-white p-6 my-4 shadow-lg print:w-full print:max-w-none print:my-0 print:shadow-none print:p-0">
              <div className="font-serif text-xs text-slate-900">
                    {/* On screen: show banner for terminal1/2, blank space for terminal3. In print: show banner only for terminal 1 & 2 */}
                    <div className={examId === 'terminal3' ? "print:hidden" : ""}>
                        {examId !== 'terminal3' ? (
                            <img src={SCHOOL_BANNER_URL} alt="School Banner" className="w-full h-auto mb-2" />
                        ) : (
                            <div className="h-28 bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs mb-2">
                                8 cm header space (pre-printed letterhead)
                            </div>
                        )}
                    </div>

                    {/* Title & session */}
                    <header className="text-center mb-1">
                        <h2 className="text-base font-semibold inline-block border-b-2 border-slate-700 px-6 pb-0.5">
                            STUDENT'S PROGRESS REPORT
                        </h2>
                        <p className="font-semibold mt-0.5 text-xs">Academic Session: {academicYear}</p>
                    </header>

                    {/* Student info */}
                    <section className="mb-1 border-2 border-slate-400 rounded text-xs flex items-stretch">
                        <div className="flex-1 p-1.5 grid grid-cols-3 gap-x-2 gap-y-0.5 content-start">
                            <div><strong className="block text-slate-600">Student's Name:</strong><span className="font-bold">{student.name}</span></div>
                            <div><strong className="block text-slate-600">Father's Name:</strong><span className="font-bold">{student.fatherName}</span></div>
                            <div><strong className="block text-slate-600">Date of Birth:</strong><span className="font-bold">{formatDateForDisplay(student.dateOfBirth)}</span></div>
                            <div><strong className="block text-slate-600">Class:</strong><span className="font-bold">{student.grade}</span></div>
                            <div><strong className="block text-slate-600">Roll No:</strong><span className="font-bold">{student.rollNo}</span></div>
                            <div><strong className="block text-slate-600">Student ID:</strong><span className="font-bold">{formatStudentId(student, academicYear)}</span></div>
                        </div>
                        <div className="border-l-2 border-slate-400 flex-shrink-0 w-20 print:w-16 flex items-center justify-center p-1">
                            <PhotoWithFallback src={student.photographUrl} alt={student.name} className="rounded" />
                        </div>
                    </section>

                    {/* Report body */}
                    <section className="mt-1">
                        {examId === 'terminal3' ? (
                            <MultiTermReportCard student={student} gradeDef={gradeDef} exams={exams} summaries={summaries} staff={staff} />
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
