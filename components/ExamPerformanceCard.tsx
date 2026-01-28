
import React, { useMemo } from 'react';
import { Student, Exam, Grade, GradeDefinition } from '../types';
import AcademicRecordTable from './AcademicRecordTable';
import { GRADES_WITH_NO_ACTIVITIES, CONDUCT_GRADE_LIST } from '../constants';

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
    isEditing,
    onUpdateExamData,
    onOpenActivityLog,
    academicYear,
}) => {
    const gradeDef = gradeDefinitions[student.grade];

    const subjectDefinitionsForTable = useMemo(() => {
        if (!gradeDef?.subjects) return [];
        let subjects = gradeDef.subjects;
        if (student.grade === Grade.IX || student.grade === Grade.X) {
            subjects = subjects.map(sub => ({ ...sub, examFullMarks: 100, activityFullMarks: 0 }));
        }
        return subjects;
    }, [gradeDef, student.grade]);

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            {/* Header / Table */}
            <AcademicRecordTable
                examName={exam.name}
                examId={exam.id}
                academicYear={academicYear}
                results={exam.results}
                isEditing={isEditing}
                onUpdate={(newResults) => onUpdateExamData(exam.id, 'results', newResults)}
                subjectDefinitions={subjectDefinitionsForTable}
                grade={student.grade}
                onOpenActivityLog={(subj) => onOpenActivityLog(exam.id, subj)}
            />

            {/* Footer / Remarks */}
            <div className="bg-slate-50 p-4 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">General Conduct</label>
                        {isEditing ? (
                            <select
                                value={exam.generalConduct || ''}
                                onChange={(e) => onUpdateExamData(exam.id, 'generalConduct', e.target.value)}
                                className="form-select w-full"
                            >
                                <option value="">-- Select --</option>
                                {CONDUCT_GRADE_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        ) : (
                            <span className="text-slate-800">{exam.generalConduct || '-'}</span>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Attendance</label>
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <input
                                        type="number"
                                        placeholder="Present"
                                        value={exam.attendance?.daysPresent ?? ''}
                                        onChange={(e) => {
                                            const current = exam.attendance || { totalWorkingDays: 0, daysPresent: 0 };
                                            onUpdateExamData(exam.id, 'attendance', { ...current, daysPresent: parseInt(e.target.value) || 0 });
                                        }}
                                        className="form-input w-24"
                                    />
                                    <span className="text-slate-500">/</span>
                                    <input
                                        type="number"
                                        placeholder="Total"
                                        value={exam.attendance?.totalWorkingDays ?? ''}
                                        onChange={(e) => {
                                            const current = exam.attendance || { totalWorkingDays: 0, daysPresent: 0 };
                                            onUpdateExamData(exam.id, 'attendance', { ...current, totalWorkingDays: parseInt(e.target.value) || 0 });
                                        }}
                                        className="form-input w-24"
                                    />
                                </>
                            ) : (
                                <span className="text-slate-800">
                                    {exam.attendance ? `${exam.attendance.daysPresent} / ${exam.attendance.totalWorkingDays}` : '-'}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                         <label className="block text-sm font-bold text-slate-700 mb-1">Teacher's Remarks</label>
                         {isEditing ? (
                             <textarea
                                value={exam.teacherRemarks || ''}
                                onChange={(e) => onUpdateExamData(exam.id, 'teacherRemarks', e.target.value)}
                                className="form-textarea w-full"
                                rows={2}
                            />
                         ) : (
                             <p className="text-slate-800 italic">{exam.teacherRemarks || 'No remarks.'}</p>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamPerformanceCard;
    