

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
            subjects = subjects.map(sub => ({ ...sub, examFullMarks: 100, activity