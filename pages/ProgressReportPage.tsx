
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Student, Grade, GradeDefinition, Exam, StudentStatus, Staff, Attendance } from '../types';
import { BackIcon, PrinterIcon } from '../components/Icons';
import { TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES } from '../constants';
import { formatDateForDisplay, normalizeSubjectName, formatStudentId, getNextGrade } from '../utils';
import { db } from '../firebaseConfig';

interface ProgressReportPageProps {
  students: Student[];
  staff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
}

// --- Reusable Logic and Components ---

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
            const result = studentExam?.results.find(r => normalizeSubjectName(r.subject) === normalizeSubjectName(sd.name));
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
            const result = studentExam?.results.find(r => normalizeSubjectName(r.subject) === normalizeSubjectName(sd.name));
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
                        const term1Result = exams.terminal1?.results.find(r => normalizeSubjectName(r.subject) === normalizeSubjectName(sd.name));
                        const term2Result = exams.terminal2?.results.find(r => normalizeSubjectName(r.subject) === normalizeSubjectName(sd.name));
                        const term3Result = exams.terminal3?.results.find(r => normalizeSubjectName(r.subject) === normalizeSubjectName(sd.name));

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

                <div id="printable-report" className="bg-white p-6 shadow-lg print:shadow-none print:p-0 pt-24 print:pt-0">
                    <header className="text-center mb-4">
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
                    
                    {examId === 'terminal3' ? (
                        <MultiTermReportCard 
                            student={student}
                            gradeDef={gradeDef}
                            exams={exams}
                            summaries={summaries}
                            staff={staff}
                        />
                    ) : (
                        <p className="text-center font-bold text-red-600 p-4 bg-red-50 rounded-lg">
                            This consolidated view is only available for the Final (Third) Term. Please select the Third Term to see the full year's report.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressReportPage;
