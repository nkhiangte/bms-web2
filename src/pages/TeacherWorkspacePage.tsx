import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, Staff, Grade, GradeDefinition, SubjectAssignment, Syllabus, Homework, ExamRoutine } from '@/types';
import { BackIcon, HomeIcon, AcademicCapIcon } from '@/components/Icons';
import TeacherWorkspace from '@/components/TeacherWorkspace';

const { Link, useNavigate, useSearchParams } = ReactRouterDOM as any;

interface TeacherWorkspacePageProps {
    user: User;
    staff: Staff[];
    assignedGrade?: Grade | null;
    assignedSubjects?: SubjectAssignment[];
    syllabus?: Syllabus[];
    homework?: Homework[];
    examRoutines?: ExamRoutine[];
    academicYear: string;
    gradeDefinitions?: Record<Grade, GradeDefinition>;
    onUpdateStaffAssignments?: (teacherId: string, assignedSubjects: SubjectAssignment[], assignedGradeKey: Grade | null) => Promise<void>;
}

export const TeacherWorkspacePage: React.FC<TeacherWorkspacePageProps> = ({
    user,
    staff,
    assignedGrade,
    assignedSubjects = [],
    syllabus = [],
    homework = [],
    examRoutines = [],
    academicYear,
    gradeDefinitions,
    onUpdateStaffAssignments
}) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const initialTab = tabParam === 'question-bank' ? 'question-bank' : 'workspace';
    const initialOpenAssignments = searchParams.get('openAssignments') === 'true';

    return (
        <div className="space-y-6">
            {/* Top Navigation */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition"
                >
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <div className="flex items-center gap-2">
                    <Link
                        to="/portal/dashboard"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition"
                        title="Go to Dashboard"
                    >
                        <HomeIcon className="w-5 h-5" /> Dashboard
                    </Link>
                </div>
            </div>

            {/* Teacher Workspace Component */}
            <TeacherWorkspace
                user={user}
                staff={staff}
                assignedGrade={assignedGrade}
                assignedSubjects={assignedSubjects}
                syllabus={syllabus}
                homework={homework}
                examRoutines={examRoutines}
                academicYear={academicYear}
                initialTab={initialTab}
                initialOpenAssignments={initialOpenAssignments}
                gradeDefinitions={gradeDefinitions}
                onUpdateStaffAssignments={onUpdateStaffAssignments}
            />
        </div>
    );
};

export default TeacherWorkspacePage;
