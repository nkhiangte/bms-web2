import React, { useMemo } from 'react';
import { Student, Exam, Grade, GradeDefinition, Attendance } from '@/types';
import AcademicRecordTable from './AcademicRecordTable';
import { GRADES_WITH_NO_ACTIVITIES, CONDUCT_GRADE_LIST } from '@/constants';

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
    // const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade); // unused in this component scope, used in table

    const subjectDefinitionsForTable = useMemo(() => {
        if (!gradeDef?.subjects) return [];
        let subjects = gradeDef.subjects;
        if (student.grade === Grade.IX || student.grade === Grade.X) {
            subjects = subjects.map(sub => ({ ...sub, examFullMarks: 100, activityFullMarks: 0 }));
        }
        return subjects;
    }, [gradeDef, student.grade]);

    const handleResultUpdate = (newResults: any[]) => {
        onUpdateExamData(exam.id, 'results', newResults);
    };

    const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdateExamData(exam.id, 'teacherRemarks', e.target.value);
    };

    const handleConductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdateExamData(exam.id, 'generalConduct', e.target.value);
    };

     const handleAttendanceChange = (field: keyof Attendance, value: string) => {
        const numValue = parseInt(value) || 0;
        const currentAttendance = exam.attendance || { totalWorkingDays: 0, daysPresent: 0 };
        onUpdateExamData(exam.id, 'attendance', { ...currentAttendance, [field]: numValue });
    };

    return (
        <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
            <AcademicRecordTable
                examName={exam.name}
                examId={exam.id}
                academicYear={academicYear}
                results={exam.results}
                isEditing={isEditing}
                onUpdate={handleResultUpdate}
                subjectDefinitions={subjectDefinitionsForTable}
                grade={student.grade}
                onOpenActivityLog={(subject) => onOpenActivityLog(exam.id, subject)}
            />
            
            <div className="p-4 bg-slate-50 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Teacher's Remarks</label>
                    {isEditing ? (
                        <textarea
                            value={exam.teacherRemarks || ''}
                            onChange={handleRemarkChange}
                            rows={3}
                            className="form-textarea w-full text-sm"
                            placeholder="Enter remarks..."
                        />
                    ) : (
                        <p className="text-sm text-slate-800 italic">{exam.teacherRemarks || "No remarks."}</p>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">General Conduct</label>
                         {isEditing ? (
                            <select value={exam.generalConduct || ''} onChange={handleConductChange} className="form-select w-full text-sm">
                                <option value="">-- Select --</option>
                                {CONDUCT_GRADE_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        ) : (
                            <p className="text-sm text-slate-800">{exam.generalConduct || 'Not Graded'}</p>
                        )}
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Attendance (Term)</label>
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    placeholder="Present" 
                                    value={exam.attendance?.daysPresent || ''} 
                                    onChange={e => handleAttendanceChange('daysPresent', e.target.value)}
                                    className="form-input w-20 text-sm"
                                />
                                <span className="text-slate-500">/</span>
                                <input 
                                    type="number" 
                                    placeholder="Total" 
                                    value={exam.attendance?.totalWorkingDays || ''} 
                                    onChange={e => handleAttendanceChange('totalWorkingDays', e.target.value)}
                                    className="form-input w-20 text-sm"
                                />
                            </div>
                        ) : (
                            <p className="text-sm text-slate-800">
                                {exam.attendance ? `${exam.attendance.daysPresent} / ${exam.attendance.totalWorkingDays}` : 'Not Recorded'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamPerformanceCard;