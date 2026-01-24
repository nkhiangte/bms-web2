
import React, { useMemo } from 'react';
import { Student, Exam, Grade, GradeDefinition, StudentStatus, ConductGrade, Attendance } from '../types';
import AcademicRecordTable from './AcademicRecordTable';
import { GRADES_WITH_NO_ACTIVITIES, OABC_GRADES, CONDUCT_GRADE_LIST } from '../constants';
import { normalizeSubjectName } from '../utils';

interface ExamPerformanceCardProps {
    exam: Exam;
    student: Student;
    gradeDefinitions: Record<Grade, GradeDefinition>;
    allStudents: Student[];
    isEditing: boolean;
    canEdit: boolean;
    onUpdateExamData: (examId: string, field: 'results' | 'teacherRemarks' | 'generalConduct' | 'attendance', value: any) => void;
    onOpenActivityLog: (examId: string, subjectName: string) => void;
    academicYear: string;
}

const ExamPerformanceCard: React.FC<ExamPerformanceCardProps> = ({
    exam,
    student,
    gradeDefinitions,
    allStudents,
    isEditing,
    canEdit,
    onUpdateExamData,
    onOpenActivityLog,
    academicYear,
}) => {
    const gradeDef = gradeDefinitions[student.grade];
    const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    const isClassIXorX = student.grade === Grade.IX || student.grade === Grade.X;
    const isNurseryToII = [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(student.grade);

    const subjectDefinitionsForTable = useMemo(() => {
        if (!gradeDef?.subjects) return [];
        let subjects = gradeDef.subjects;
        if (student.grade === Grade.IX || student.grade === Grade.X) {
            subjects = subjects.map(sub => ({ ...sub, examFullMarks: 100, activityFullMarks: 0 }));
        }
        return subjects;
    }, [gradeDef, student.grade]);
  
    const examSummary = useMemo(() => {
        if (!student) return null;
        const gradeDef = gradeDefinitions[student.grade];
        if (!gradeDef) return null;
    
        const classmates = allStudents.filter(s => s.grade === student.grade && s.status === StudentStatus.ACTIVE);
        const numericSubjects = gradeDef.subjects.filter(sd => sd.gradingSystem !== 'OABC');
        const gradedSubjects = gradeDef.subjects.filter(sd => sd.gradingSystem === 'OABC');
    
        const studentData = classmates.map(s => {
            let studentExam;
            if (s.id === student.id) {
                studentExam = exam;
            } else {
                studentExam = s.academicPerformance?.find(e => 
                    e.id === exam.id || (e.name && e.name.trim().toLowerCase() === exam.name.trim().toLowerCase())
                );
            }
            
            let grandTotal = 0, examTotal = 0, activityTotal = 0, fullMarksTotal = 0;
            let failedSubjectsCount_III_to_VIII = 0, failedSubjectsCount_IX_to_X = 0, failedSubjectsCount_N_to_II = 0, gradedSubjectsPassed = 0;
            const failedSubjects: string[] = [];
    
            numericSubjects.forEach(sd => {
                const normSubjDefName = normalizeSubjectName(sd.name);
                const result = studentExam?.results.find(r => {
                    const normResultName = normalizeSubjectName(r.subject);
                    if (normResultName === normSubjDefName) return true;
                    // Fallbacks for legacy data
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
                    // FIX: Use nullish coalescing operator to ensure operands are numbers, as properties from Firestore can be undefined.
                    subjectFullMarks = (sd.examFullMarks ?? 0) + (sd.activityFullMarks ?? 0);
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
                if (result?.grade != null && OABC_GRADES.includes(result.grade as any)) gradedSubjectsPassed++;
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
            if (resultStatus === 'FAIL') remark = `Needs significant improvement${failedSubjects.length > 0 ? ` in ${failedSubjects.join(', ')}` : ''}.`;
            else if (resultStatus === 'SIMPLE PASS') remark = `Simple Pass. Focus on improving in ${failedSubjects.join(', ')}.`;
            else if (resultStatus === 'PASS') {
                if (percentage >= 90) remark = "Outstanding performance!"; else if (percentage >= 75) remark = "Excellent performance."; else if (percentage >= 60) remark = "Good performance."; else if (percentage >= 45) remark = "Satisfactory performance."; else remark = "Passed, needs improvement.";
            }
    
            return { id: s.id, grandTotal, examTotal, activityTotal, percentage, result: resultStatus, division, academicGrade, remark };
        });
    
        const passedStudents = studentData.filter(s => s.result === 'PASS');
        const uniqueScores = [...new Set(passedStudents.map(s => s.grandTotal))].sort((a, b) => b - a);
        
        const finalRankedData = new Map<string, typeof studentData[0] & { rank: number | '-' }>();
        
        studentData.forEach(s => {
            if (s.result === 'FAIL' || s.result === 'SIMPLE PASS') {
                finalRankedData.set(s.id, { ...s, rank: '-' });
            } else {
                const rankIndex = uniqueScores.indexOf(s.grandTotal);
                const rank = rankIndex !== -1 ? rankIndex + 1 : '-';
                finalRankedData.set(s.id, { ...s, rank });
            }
        });
        
        return finalRankedData.get(student.id);
    }, [exam, student, allStudents, gradeDefinitions, hasActivities, isClassIXorX, isNurseryToII]);
    
    const handleAttendanceChange = (field: 'totalWorkingDays' | 'daysPresent', value: string) => {
        if (!/^\d*$/.test(value)) return;
        const numValue = value === '' ? 0 : parseInt(value, 10);

        const newAttendance: Attendance = {
            totalWorkingDays: exam.attendance?.totalWorkingDays ?? 0,
            daysPresent: exam.attendance?.daysPresent ?? 0,
            [field]: numValue
        };

        onUpdateExamData(exam.id, 'attendance', newAttendance);
    };

    const attendancePercent = (exam.attendance && exam.attendance.totalWorkingDays > 0) 
        ? `${((exam.attendance.daysPresent / exam.attendance.totalWorkingDays) * 100).toFixed(2)}%`
        : 'N/A';

    return (
        <div className="mb-8">
            <AcademicRecordTable
                examName={exam.name}
                examId={exam.id}
                academicYear={academicYear}
                results={exam.results}
                isEditing={isEditing}
                onUpdate={(newResults) => onUpdateExamData(exam.id, 'results', newResults)}
                subjectDefinitions={subjectDefinitionsForTable}
                grade={student.grade}
                onOpenActivityLog={(subjectName) => onOpenActivityLog(exam.id, subjectName)}
            />

            <div className="mt-4 p-4 bg-slate-50 border rounded-lg space-y-2 text-sm">
                <h3 className="text-md font-bold text-slate-800 mb-2">Academic Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                    {hasActivities && (
                        <>
                            <div><span className="font-semibold text-slate-600">Subj. Total:</span> <span className="font-bold text-slate-800">{examSummary?.examTotal}</span></div>
                            <div><span className="font-semibold text-slate-600">Activity Total:</span> <span className="font-bold text-slate-800">{examSummary?.activityTotal}</span></div>
                        </>
                    )}
                    <div><span className="font-semibold text-slate-600">Grand Total:</span> <span className="font-bold text-slate-800">{examSummary?.grandTotal}</span></div>
                    <div><span className="font-semibold text-slate-600">Percentage:</span> <span className="font-bold text-slate-800">{examSummary?.percentage?.toFixed(2) ?? '0.00'}%</span></div>
                    {!isClassIXorX && <div><span className="font-semibold text-slate-600">Grade:</span> <span className="font-bold text-slate-800">{examSummary?.academicGrade}</span></div>}
                    {isClassIXorX && <div><span className="font-semibold text-slate-600">Division:</span> <span className="font-bold text-slate-800">{examSummary?.division}</span></div>}
                    <div><span className="font-semibold text-slate-600">Result:</span> <span className={`font-bold ${examSummary?.result !== 'PASS' ? 'text-red-600' : 'text-emerald-600'}`}>{examSummary?.result}</span></div>
                    <div><span className="font-semibold text-slate-600">Rank:</span> <span className="font-bold text-slate-800">{examSummary?.rank}</span></div>
                </div>
                <div><span className="font-semibold text-slate-600">Attendance:</span> <span className="font-bold text-slate-800">{attendancePercent}</span></div>
                <div className="pt-2 border-t mt-2">
                    <span className="font-semibold">Generated Remark: </span>
                    <span className="italic">{examSummary?.remark || 'N/A'}</span>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-800 mb-1">Teacher's Remarks for {exam.name}</label>
                    {isEditing && canEdit ? (
                        <textarea
                            value={exam.teacherRemarks || ''}
                            onChange={e => onUpdateExamData(exam.id, 'teacherRemarks', e.target.value)}
                            rows={3}
                            className="w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                            placeholder="Enter feedback or comments..."
                        />
                    ) : (
                        <p className="text-slate-700 p-3 bg-slate-50 rounded-md border min-h-[4rem]">
                            {exam.teacherRemarks || <span className="italic text-slate-500">No remarks added.</span>}
                        </p>
                    )}
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-800 mb-1">General Conduct for {exam.name}</label>
                    {isEditing && canEdit ? (
                        <select
                            value={exam.generalConduct || ''}
                            onChange={e => onUpdateExamData(exam.id, 'generalConduct', e.target.value as ConductGrade)}
                            className="w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        >
                            <option value="">-- Select Conduct Grade --</option>
                            {CONDUCT_GRADE_LIST.map(gradeValue => <option key={gradeValue} value={gradeValue}>{gradeValue}</option>)}
                        </select>
                    ) : (
                        <p className="text-slate-700 p-3 bg-slate-50 rounded-md border min-h-[4rem]">
                            {exam.generalConduct || <span className="italic text-slate-500">Not graded.</span>}
                        </p>
                    )}
                </div>
                 <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-800 mb-1">Attendance for {exam.name}</label>
                    {isEditing && canEdit ? (
                        <div className="grid grid-cols-2 gap-2 p-2 bg-slate-100 border rounded-md">
                            <div>
                                <label className="text-xs font-semibold">Working Days</label>
                                <input
                                    type="tel" pattern="[0-9]*"
                                    value={exam.attendance?.totalWorkingDays ?? ''}
                                    onChange={e => handleAttendanceChange('totalWorkingDays', e.target.value)}
                                    className="w-full border-slate-300 rounded-md shadow-sm text-center"
                                    placeholder="Total"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold">Days Present</label>
                                <input
                                    type="tel" pattern="[0-9]*"
                                    value={exam.attendance?.daysPresent ?? ''}
                                    onChange={e => handleAttendanceChange('daysPresent', e.target.value)}
                                    className="w-full border-slate-300 rounded-md shadow-sm text-center"
                                    placeholder="Present"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-700 p-3 bg-slate-50 rounded-md border min-h-[4rem]">
                            <span className="font-semibold">Total Days:</span> {exam.attendance?.totalWorkingDays ?? 'N/A'} <br/>
                            <span className="font-semibold">Present:</span> {exam.attendance?.daysPresent ?? 'N/A'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamPerformanceCard;