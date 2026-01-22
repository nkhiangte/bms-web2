
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Student, Grade, GradeDefinition, Exam, StudentStatus, Staff, Attendance } from '../types';
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

interface ReportCardProps {
    student: Student;
    gradeDef: GradeDefinition;
    exam: Exam | undefined;
    examTemplate: { id: string; name: string };
    allStudents: Student[];
    academicYear: string;
    staff: Staff[];
}

const calculateTermSummary = (
    student: Student,
    exam: Exam | undefined,
    examId: 'terminal1' | 'terminal2' | 'terminal3',
    gradeDef: GradeDefinition,
    allStudents: Student[]
) => {
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
        let failedSubjectsCount_III_to_VIII = 0, failedSubjectsCount_IX_to_X = 0, failedSubjectsCount_N_to_II = 0, gradedSubjectsPassed = 0;
        const failedSubjects: string[] = [];

        numericSubjects.forEach(sd => {
            const normSubjDefName = normalizeSubjectName(sd.name);
            const result = studentExam?.results.find(r => {
                const normResultName = normalizeSubjectName(r.subject);
                if (normResultName === normSubjDefName) return true;
                if (normSubjDefName === 'english' && normResultName === 'english i') return true;
                if (normSubjDefName === 'english - ii' && normResultName === 'english ii') return true;
                if (normSubjDefName === 'social studies' && normResultName === 'social science') return true;
                // Fallbacks for Class II subjects
                if (normSubjDefName === 'math' && normResultName === 'mathematics') return true;
                if (normSubjDefName === 'eng-i' && (normResultName === 'english' || normResultName === 'english i')) return true;
                if (normSubjDefName === 'eng-ii' && (normResultName === 'english ii' || normResultName === 'english - ii')) return true;
                if (normSubjDefName === 'spellings' && normResultName === 'spelling') return true;
                return false;
            });

            let totalSubjectMark = 0, subjectFullMarks = 0;

            if (hasActivities) {
                const examMark = result?.examMarks ?? 0;
                const activityMark = result?.activityMarks ?? 0;
                examTotal += examMark;
                activityTotal += activityMark;
                totalSubjectMark = examMark + activityMark;
                subjectFullMarks = sd.examFullMarks + sd.activityFullMarks;
                if (examMark < 20) { failedSubjectsCount_III_to_VIII++; failedSubjects.push(sd.name); }
            } else {
                totalSubjectMark = result?.marks ?? 0;
                examTotal += totalSubjectMark;
                subjectFullMarks = sd.examFullMarks;
                if (isClassIXorX && totalSubjectMark < 33) { failedSubjectsCount_IX_to_X++; failedSubjects.push(sd.name); }
                if (isNurseryToII && totalSubjectMark < 35) { failedSubjectsCount_N_to_II++; failedSubjects.push(sd.name); }
            }
            grandTotal += totalSubjectMark;
            fullMarksTotal += subjectFullMarks;
        });

        gradedSubjects.forEach(sd => {
            const normSubjDefName = normalizeSubjectName(sd.name);
            const result = studentExam?.results.find(r => {
                const normResultName = normalizeSubjectName(r.subject);
                if (normResultName === normSubjDefName) return true;
                if (normSubjDefName === 'english' && normResultName === 'english i') return true;
                if (normSubjDefName === 'english - ii' && normResultName === 'english ii') return true;
                if (normSubjDefName === 'social studies' && normResultName === 'social science') return true;
                // Fallbacks for Class II subjects
                if (normSubjDefName === 'math' && normResultName === 'mathematics') return true;
                if (normSubjDefName === 'eng-i' && (normResultName === 'english' || normResultName === 'english i')) return true;
                if (normSubjDefName === 'eng-ii' && (normResultName === 'english ii' || normResultName === 'english - ii')) return true;
                if (normSubjDefName === 'spellings' && normResultName === 'spelling') return true;
                return false;
            });
            if (result?.grade && OABC_GRADES.includes(result.grade as any)) gradedSubjectsPassed++;
        });
        
        const percentage = fullMarksTotal > 0 ? (grandTotal / fullMarksTotal) * 100 : 0;
        
        let resultStatus = 'PASS';
        if (gradedSubjectsPassed < gradedSubjects.length) resultStatus = 'FAIL';
        else if (hasActivities && failedSubjectsCount_III_to_VIII > 1) resultStatus = 'FAIL';
        else if (hasActivities && failedSubjectsCount_III_to_VIII === 1) resultStatus = 'SIMPLE PASS';
        else if (isClassIXorX && failedSubjectsCount_IX_to_X > 1) resultStatus = 'FAIL';
        else if (isClassIXorX && failedSubjectsCount_IX_to_X === 1) resultStatus = 'SIMPLE PASS';
        else if (isNurseryToII && failedSubjectsCount_N_to_II > 0) resultStatus = 'FAIL';

        let division = '-';
        if (isClassIXorX && resultStatus === 'PASS') {
            if (percentage >= 75) division = 'Distinction';
            else if (percentage >= 60) division = 'I Div';
            else if (percentage >= 45) division = 'II Div';
            else if (percentage >= 35) division = 'III Div';
        }

        let academicGrade = '-';
        if (isNurseryToII) {
            if (resultStatus === 'FAIL') academicGrade = 'E';
            else {
                if (percentage > 89) academicGrade = 'O'; else if (percentage > 79) academicGrade = 'A'; else if (percentage > 69) academicGrade = 'B'; else if (percentage > 59) academicGrade = 'C'; else academicGrade = 'D';
            }
        } else {
            if (resultStatus === 'FAIL') academicGrade = 'E';
            else { if (percentage > 89) academicGrade = 'O'; else if (percentage > 79) academicGrade = 'A'; else if (percentage > 69) academicGrade = 'B'; else if (percentage > 59) academicGrade = 'C'; else academicGrade = 'D'; }
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

    const passedStudents = studentData.filter(s => s.result === 'PASS' || s.result === 'SIMPLE PASS').sort((a, b) => b.grandTotal - a.grandTotal);
    
    const rankedData = new Map<string, typeof studentData[0] & {rank: number | '-'}>();
    
    studentData.forEach(s => {
        if (s.result === 'FAIL') {
            rankedData.set(s.id, { ...s, rank: '-' });
        } else {
            const rankIndex = passedStudents.findIndex(p => p.grandTotal === s.grandTotal);
            const rank = rankIndex !== -1 ? rankIndex + 1 : '-';
            rankedData.set(s.id, { ...s, rank });
        }
    });
    
    return rankedData.get(student.id);
};


const ReportCard: React.FC<ReportCardProps> = ({ student, gradeDef, exam, examTemplate, allStudents, academicYear, staff }) => {
    const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    const isClassIXorX = student.grade === Grade.IX || student.grade === Grade.X;
    const isNurseryToII = [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(student.grade);

    const currentTermId = examTemplate.id as 'terminal1' | 'terminal2' | 'terminal3';
    
    const summary = useMemo(() => {
        if (allStudents.length === 0) return null;
        return calculateTermSummary(student, exam, currentTermId, gradeDef, allStudents);
    }, [student, exam, currentTermId, gradeDef, allStudents]);

    const classTeacher = useMemo(() => {
        if (!staff || !gradeDef?.classTeacherId) return null;
        return staff.find((s: Staff) => s.id === gradeDef.classTeacherId);
    }, [staff, gradeDef]);

    const finalRemark = useMemo(() => {
        if (currentTermId === 'terminal3') {
             const nextGrade = getNextGrade(student.grade);

            if (summary?.result === 'PASS' || summary?.result === 'SIMPLE PASS') {
                if (student.grade === Grade.X) {
                    return `Passed. School reopens on April 7, 2025`;
                }
                if (nextGrade) {
                    return `Promoted to ${nextGrade}. School reopens on April 7, 2025`;
                }
                return `Promoted. School reopens on April 7, 2025`;
            } else if (summary?.result === 'FAIL') {
                return "Detained";
            }
        }
        return exam?.teacherRemarks || summary?.remark || "Awaiting final results.";
    }, [currentTermId, summary, student.grade, exam?.teacherRemarks]);

    const getAttendancePercent = (attendance?: Attendance) => {
        if (attendance && attendance.totalWorkingDays > 0) {
            return `${((attendance.daysPresent / attendance.totalWorkingDays) * 100).toFixed(0)}%`;
        }
        return '-';
    };

    const termLabel = examTemplate.name;

    return (
        <div className="report-card-wrapper">
            <div className="border border-slate-400 rounded-lg overflow-hidden print:overflow-visible break-inside-avoid">
                <h3 className="text-lg font-bold text-center text-slate-800 p-2 bg-slate-100 border-b border-slate-400">{termLabel}</h3>
                <table className="min-w-full text-sm border-collapse">
                    <thead className="bg-slate-50">
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
                        {gradeDef.subjects.map((sd) => {
                            const normSubjDefName = normalizeSubjectName(sd.name);
                            const result = exam?.results.find(r => {
                                const normResultName = normalizeSubjectName(r.subject);
                                if (normResultName === normSubjDefName) return true;
                                if (normSubjDefName === 'english' && normResultName === 'english i') return true;
                                if (normSubjDefName === 'english - ii' && normResultName === 'english ii') return true;
                                if (normSubjDefName === 'social studies' && normResultName === 'social science') return true;
                                // Fallbacks for Class II subjects
                                if (normSubjDefName === 'math' && normResultName === 'mathematics') return true;
                                if (normSubjDefName === 'eng-i' && (normResultName === 'english' || normResultName === 'english i')) return true;
                                if (normSubjDefName === 'eng-ii' && (normResultName === 'english ii' || normResultName === 'english - ii')) return true;
                                if (normSubjDefName === 'spellings' && normResultName === 'spelling') return true;
                                return false;
                            });
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
                        {hasActivities && (
                            <tr className="border-t-2 border-slate-400 font-bold bg-slate-50">
                                <td className="px-2 py-1 text-right border-r border-slate-300">Total</td>
                                <td colSpan={2} className="px-2 py-1 text-center border-r border-slate-300">{summary?.examTotal}</td>
                                <td colSpan={2} className="px-2 py-1 text-center border-r border-slate-300">{summary?.activityTotal}</td>
                                <td className="px-2 py-1 text-center">{summary?.grandTotal}</td>
                            </tr>
                        )}
                        <tr className="font-bold bg-slate-100 border-t border-slate-400">
                            <td className="px-2 py-1 text-right border-r border-slate-300">Grand Total</td>
                            <td colSpan={hasActivities ? 5 : 3} className="px-2 py-1 text-center">{summary?.grandTotal}</td>
                        </tr>
                        <tr className="border-t border-slate-300">
                            <td className="px-2 py-1 text-right border-r border-slate-300 font-bold bg-slate-50">Result</td>
                            <td colSpan={hasActivities ? 5 : 3} className={`px-2 py-1 text-center font-bold ${summary?.result !== 'PASS' ? 'text-red-600' : 'text-emerald-600'}`}>
                                {summary?.result}
                            </td>
                        </tr>
                         <tr className="border-t border-slate-300">
                            <td className="px-2 py-1 text-right border-r border-slate-300 font-bold bg-slate-50">Percentage</td>
                            <td colSpan={hasActivities ? 5 : 3} className="px-2 py-1 text-center font-bold">{summary?.percentage?.toFixed(2)}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-2 border border-slate-400 rounded-lg p-2 text-sm space-y-1 bg-slate-50 break-inside-avoid">
                <div className="flex justify-between">
                    <span><strong>Attendance:</strong> {getAttendancePercent(exam?.attendance)}</span>
                    <span><strong>Rank:</strong> {summary?.rank}</span>
                    {isClassIXorX ? (
                        <span><strong>Division:</strong> {summary?.division}</span>
                    ) : (
                        <span><strong>Grade:</strong> {summary?.academicGrade}</span>
                    )}
                </div>
            </div>

            <div className="mt-2 border border-slate-400 rounded-lg p-2 text-sm break-inside-avoid">
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

const ProgressReportPage: React.FC<ProgressReportPageProps> = ({ students, staff, gradeDefinitions, academicYear }) => {
    const { studentId, examId } = useParams() as { studentId: string; examId: string };
    const navigate = useNavigate();

    const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);
    const [classmates, setClassmates] = useState<Student[]>([]);
    const examTemplate = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);

    useEffect(() => {
        if (student) {
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

    // Logic to override gradeDef for IX/X
    const gradeDef = useMemo(() => {
        if (!student || !gradeDefinitions[student.grade]) return null;
        const def = gradeDefinitions[student.grade];
        
        if (student.grade === Grade.IX || student.grade === Grade.X) {
            return {
                ...def,
                subjects: def.subjects.map(s => ({ 
                    ...s, 
                    examFullMarks: 100, 
                    activityFullMarks: 0 
                }))
            };
        }
        return def;
    }, [student, gradeDefinitions]);

    if (!student || !examTemplate) {
        return <div className="p-8 text-center">Invalid student or exam specified.</div>;
    }

    if (!gradeDef) {
        return <div className="p-8 text-center">Curriculum not defined for this student's grade.</div>;
    }

    const exam = student.academicPerformance?.find(e => 
        e.id === examId || (e.name && e.name.trim().toLowerCase() === examTemplate.name.trim().toLowerCase())
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-slate-100 min-h-screen p-4 sm:p-8 print:bg-white print:p-0">
            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 5mm;
                    }
                    html, body {
                        background-color: white;
                        height: auto;
                        margin: 0;
                        padding: 0;
                    }
                    body > *:not(#root) { display: none; }
                    
                    .print-hidden { display: none !important; }
                    
                    #printable-report {
                        width: 100% !important;
                        max-width: none !important;
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    
                    .report-card-wrapper {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                }
            `}</style>

            <div className="max-w-3xl mx-auto print:w-full print:max-w-none">
                <div className="mb-6 flex justify-between items-center print:hidden">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800"><BackIcon className="w-5 h-5"/> Back</button>
                    <button onClick={handlePrint} className="btn btn-primary"><PrinterIcon className="w-5 h-5"/> Print Report</button>
                </div>

                <div id="printable-report" className="bg-white p-8 shadow-lg print:shadow-none">
                     <header className="text-center mb-4">
                        <img src={SCHOOL_BANNER_URL} alt="School Banner" className="w-full h-auto"/>
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

                    <ReportCard 
                        student={student} 
                        gradeDef={gradeDef} 
                        exam={exam} 
                        examTemplate={examTemplate} 
                        allStudents={classmates} 
                        academicYear={academicYear}
                        staff={staff}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProgressReportPage;
