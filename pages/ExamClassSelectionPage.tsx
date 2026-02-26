import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { GRADES_LIST, TERMINAL_EXAMS } from '@/constants';
import { BookOpenIcon, HomeIcon, BackIcon } from '@/components/Icons';
import { Grade, GradeDefinition, Staff, User } from '@/types';

const { Link, useNavigate, useParams } = ReactRouterDOM as any;

interface ExamClassSelectionPageProps {
    gradeDefinitions: Record<Grade, GradeDefinition>;
    staff: Staff[];
    user: User;
}

const ExamClassSelectionPage: React.FC<ExamClassSelectionPageProps> = ({ gradeDefinitions, staff, user }) => {
    const navigate = useNavigate();
    const { examId } = useParams() as { examId: string };

    const examDetails = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);

    if (!examDetails) {
        return (
             <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">Invalid Examination Term</h2>
                <p className="text-slate-700 mt-2">The selected examination term does not exist.</p>
                <button onClick={() => navigate('/portal/exams')} className="mt-6 btn btn-primary">Back to Exam Selection</button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home/Dashboard">
                    <HomeIcon className="w-5 h-5" /> <span>Home</span>
                </Link>
            </div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Select a Class</h1>
                <p className="text-slate-600 mt-1">Viewing marks for: <span className="font-semibold">{examDetails.name}</span></p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {GRADES_LIST.map(grade => {
                    const gradeDef = gradeDefinitions[grade];
                    const teacher = staff.find(t => t.id === gradeDef?.classTeacherId);
                    const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A';

                    return (
                        <Link
                            key={grade}
                            to={`/portal/reports/class/${encodeURIComponent(grade)}/${examId}`}
                            className="group block p-4 bg-slate-50 rounded-lg text-center text-slate-800 hover:bg-white hover:text-sky-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-transparent hover:border-sky-300"
                        >
                            <BookOpenIcon className="w-12 h-12 mx-auto text-sky-500 group-hover:text-sky-600 transition-colors" />
                            <span className="text-xl mt-2 block font-bold">{grade}</span>
                            <div className="mt-2 text-xs text-slate-600 font-medium">
                                Teacher: <span className="font-semibold block">{teacherName}</span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
};

export default ExamClassSelectionPage;