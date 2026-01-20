import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Student, Grade, GradeDefinition, Exam, StudentStatus, Staff, Attendance } from '../types';
import { BackIcon, PrinterIcon } from '../components/Icons';
import { TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES, SCHOOL_BANNER_URL } from '../constants';
import { formatDateForDisplay, normalizeSubjectName, formatStudentId, getNextGrade } from '../utils';

// --- Reusable Logic and Components (copied from ProgressReportPage) ---

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
        const studentExam = s.academicPerformance?.find(e => e.id === examId);
        
        let grandTotal = 0, examTotal = 0, activityTotal = 0, fullMarksTotal = 0;
        let failedSubjectsCount_III_to_VIII = 0, failedSubjectsCount_IX_to_X = 0, failedSubjectsCount_N_to_II = 0, gradedSubjectsPassed = 0;
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
            const result = studentExam?.results.find(r => normalizeSubjectName(r.subject) === normalizeSubjectName(sd.name));
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
            if (percentage >= 90) remark = "Outstanding performance!"; else if (percentage >= 75) remark = "Excellent performance."; else if (percentage >= 60) remark = "Good performance."; else if (percentage >= 45) remark = "Satisfactory performance."; else remark = "Passed, needs improvement.";
        }

        return { id: s.id, grandTotal, examTotal, activityTotal, percentage, result: resultStatus, division, academicGrade, remark };
    });

    // Filter only 'PASS' for ranking to match Statement of Marks logic
    const eligibleForRanking = studentData.filter(s => s.result === 'PASS');
    eligibleForRanking.sort((a, b) => b.grandTotal - a.grandTotal);
    
    const rankedData = new Map<string, typeof studentData[0] & {rank: number | '-'}>();

    if (eligibleForRanking.length > 0) {
        let rank = 1;
        rankedData.set(eligibleForRanking[0].id, {...eligibleForRanking[0], rank});
        for (let i = 1; i < eligibleForRanking.length; i++) {
            // Use Dense Ranking (1, 1, 2) to match Mark Statement
            if (eligibleForRanking[i].grandTotal < eligibleForRanking[i - 1].grandTotal) {
                rank++;
            }
            rankedData.set(eligibleForRanking[i].id, {...eligibleForRanking[i], rank});
        }
    }
    
    studentData.forEach(s => {
        if (!rankedData.has(s.id)) {
            rankedData.set(s.id, { ...s, rank: '-' });
        }
    });
    
    return rankedData.get(student.id);
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
                        const result = exam?.results.find((r: any) => normalizeSubjectName(r.subject) === normalizeSubjectName(sd.name));
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
                    <p>Time : {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                </div>
            </div>
        </div>
    );
};

interface BulkProgressReportPageProps {
  students: Student[];
  staff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
}

const BulkProgressReportPage: React.FC<BulkProgressReportPageProps> = ({ students, staff, gradeDefinitions, academicYear }) => {
    // Fix: Cast untyped useParams call to specific type to resolve build error
    const { grade: encodedGrade, examId } = useParams() as { grade: string; examId: string };
    const navigate = useNavigate();

    const grade = useMemo(() => encodedGrade ? decodeURIComponent(encodedGrade) as Grade : undefined, [encodedGrade]);
    const examTemplate = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);

    const classStudents = useMemo(() => {
        if (!grade) return [];
        return students.filter(s => s.grade === grade && s.status === StudentStatus.ACTIVE).sort((a, b) => a.rollNo - b.rollNo);
    }, [students, grade]);
    
    // Logic to override gradeDef for IX/X
    const gradeDef = useMemo(() => {
        if (!grade || !gradeDefinitions[grade]) return null;
        const def = gradeDefinitions[grade];
        
        if (grade === Grade.IX || grade === Grade.X) {
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
    }, [grade, gradeDefinitions]);


    if (!grade || !examTemplate) {
        return <div className="p-8 text-center">Invalid class or exam specified.</div>;
    }

    if (!gradeDef) {
        return <div className="p-8 text-center">Curriculum not defined for {grade}.</div>;
    }

    return (
        <div className="bg-slate-100 print:bg-white">
            <div className="print-hidden container mx-auto p-4 flex justify-between items-center sticky top-0 bg-slate-100 z-10 shadow-sm">
                <div>
                    <button onClick={() => navigate(-1)} className="btn btn-secondary"><BackIcon className="w-5 h-5"/> Back</button>
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold">Print Preview</h2>
                    <p className="text-sm text-slate-600">{grade} - {examTemplate.name}</p>
                </div>
                <button onClick={() => window.print()} className="btn btn-primary"><PrinterIcon className="w-5 h-5"/> Print All</button>
            </div>
            
            <div id="bulk-printable-area">
                <style>{`
                    @page { 
                        size: A4; 
                        margin: 5mm; 
                    }
                    @media print {
                        html, body {
                            height: auto !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: visible !important;
                        }
                        .report-card-container {
                            page-break-after: always;
                            page-break-inside: avoid;
                            break-inside: avoid;
                            display: block;
                            width: 100% !important;
                            position: relative;
                            margin: 0 !important;
                            margin-bottom: 0 !important;
                            padding: 0 !important;
                            border: none !important;
                            box-shadow: none !important;
                            height: auto !important;
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                        .report-card-container:last-child {
                            page-break-after: auto;
                        }
                        
                        /* Force table elements to stay together */
                        table, tr, td, th, tbody, thead, tfoot {
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                        }
                        
                        /* Optimization for text */
                        .print-text-xs {
                            font-size: 0.75rem;
                            line-height: 1rem;
                        }
                        
                        /* Ensure full width in print */
                        .print\\:w-full {
                            width: 100% !important;
                        }
                        .print\\:max-w-none {
                            max-width: none !important;
                        }
                    }
                `}</style>
                {classStudents.map(student => (
                    <div key={student.id} className="report-card-container container mx-auto bg-white p-6 my-4 shadow-lg print:w-full print:max-w-none print:my-0 print:p-0 print:shadow-none">
                        <div id={`printable-report-${student.id}`} className="font-serif print:text-sm">
                             <header className="text-center mb-2">
                                <img src={SCHOOL_BANNER_URL} alt="School Banner" className="w-full h-auto mb-2"/>
                                <h2 className="text-xl font-semibold inline-block border-b-2 border-slate-700 px-8 pb-1 mt-2 print:text-lg print:mt-0">
                                    STUDENT'S PROGRESS REPORT
                                </h2>
                                <p className="font-semibold mt-1 print:text-sm">Academic Session: {academicYear}</p>
                            </header>

                            <section className="mb-2 p-2 border-2 border-slate-400 rounded-lg grid grid-cols-3 print:grid-cols-3 gap-x-2 gap-y-1 text-sm print:mb-1 print:p-1 print:gap-y-0.5">
                                <div><strong className="block text-slate-600">Student's Name:</strong><span className="font-bold text-base">{student.name}</span></div>
                                <div><strong className="block text-slate-600">Father's Name:</strong><span className="font-bold text-base">{student.fatherName}</span></div>
                                <div><strong className="block text-slate-600">Date of Birth:</strong><span className="font-bold text-base">{formatDateForDisplay(student.dateOfBirth)}</span></div>
                                <div><strong className="block text-slate-600">Class:</strong><span className="font-bold text-base">{student.grade}</span></div>
                                <div><strong className="block text-slate-600">Roll No:</strong><span className="font-bold text-base">{student.rollNo}</span></div>
                                <div><strong className="block text-slate-600">Student ID:</strong><span className="font-bold text-base">{formatStudentId(student, academicYear)}</span></div>
                            </section>

                            <section className="mt-4 print:mt-2">
                                <ReportCard 
                                    student={student} 
                                    gradeDef={gradeDef} 
                                    exam={student.academicPerformance?.find(e => e.id === examId)} 
                                    examTemplate={examTemplate} 
                                    allStudents={students} 
                                    academicYear={academicYear}
                                    staff={staff}
                                />
                            </section>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BulkProgressReportPage;