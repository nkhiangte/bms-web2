

import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Grade, GradeDefinition, StudentStatus, User } from '../types';
import { GRADES_LIST } from '../constants';
import { BackIcon, HomeIcon, AcademicCapIcon } from '../components/Icons';
import ConfirmationModal from '../components/ConfirmationModal';
import { calculateStudentResult } from '../utils';

const { useNavigate, Link } = ReactRouterDOM as any;

interface PromotionPageProps {
  students: Student[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
  onPromoteStudents: () => Promise<void>;
  user: User;
}

const PromotionPage: React.FC<PromotionPageProps> = ({ students, gradeDefinitions, academicYear, onPromoteStudents, user }) => {
    const navigate = useNavigate();
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isPromoting, setIsPromoting] = useState(false);

    const promotionSummary = useMemo(() => {
        return GRADES_LIST.map(grade => {
            const gradeDef = gradeDefinitions[grade];
            if (!gradeDef || !Array.isArray(gradeDef.subjects)) return { grade, total: 0, toPromote: 0, toDetain: 0, toGraduate: 0 };

            const classStudents = students.filter(s => s.status === StudentStatus.ACTIVE && s.grade === grade);
            
            let toPromote = 0;
            let toDetain = 0;
            let toGraduate = 0;

            classStudents.forEach(student => {
                const resultStatus = calculateStudentResult(student, gradeDef);

                // Simple pass is still a promotion.
                if (resultStatus === 'FAIL') {
                    toDetain++;
                } else {
                    if (grade === Grade.X) {
                        toGraduate++;
                    } else {
                        toPromote++;
                    }
                }
            });

            return { grade, total: classStudents.length, toPromote, toDetain, toGraduate };
        });
    }, [students, gradeDefinitions]);

    const handleConfirmPromotion = async () => {
        setIsPromoting(true);
        await onPromoteStudents();
        setIsPromoting(false);
        setIsConfirmModalOpen(false);
        // The reload is handled by onPromoteStudents in App.tsx
    };
    
    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                        <BackIcon className="w-5 h-5" /> Back
                    </button>
                    <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home/Dashboard">
                        <HomeIcon className="w-5 h-5" /> <span>Home</span>
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Student Promotion</h1>
                        <p className="text-slate-600 mt-1">Review the promotion summary for the academic year <span className="font-semibold">{academicYear}</span>.</p>
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Class</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Total Students</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-emerald-800 uppercase">Promoted</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-rose-800 uppercase">Detained</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-indigo-800 uppercase">Graduated</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {promotionSummary.map(summary => (
                                <tr key={summary.grade}>
                                    <td className="px-6 py-4 font-semibold text-slate-900">{summary.grade}</td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-800">{summary.total}</td>
                                    <td className="px-6 py-4 text-center font-bold text-emerald-700">{summary.toPromote}</td>
                                    <td className="px-6 py-4 text-center font-bold text-rose-700">{summary.toDetain}</td>
                                    <td className="px-6 py-4 text-center font-bold text-indigo-700">{summary.toGraduate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                    <h3 className="font-bold text-amber-800">Important:</h3>
                    <p className="text-amber-900 text-sm">
                        This action will archive all current student data, promote all students to the next grade (and graduate Class X students), and reset the system for the new academic year ({parseInt(academicYear.split('-')[0]) + 1}-{parseInt(academicYear.split('-')[1]) + 1}). This action is irreversible. Students who need to be detained must be manually transferred back to their original class after this process.
                    </p>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => setIsConfirmModalOpen(true)}
                        disabled={user.role !== 'admin' || isPromoting}
                        className="btn btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500 text-lg px-6 py-3 disabled:bg-slate-400"
                    >
                        <AcademicCapIcon className="w-5 h-5" />
                        {isPromoting ? 'Processing...' : 'Finalize & Promote to New Session'}
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmPromotion}
                title="Confirm Promotion to New Academic Session"
                confirmDisabled={isPromoting}
            >
                <p>Are you sure you want to proceed? This will end the current academic year and promote students to the next session. This action cannot be undone.</p>
            </ConfirmationModal>
        </>
    );
};

export default PromotionPage;