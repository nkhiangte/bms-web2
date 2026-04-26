import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Grade, GradeDefinition, StudentStatus, User } from '@/types';
import { GRADES_LIST } from '@/constants';
import { BackIcon, HomeIcon, AcademicCapIcon } from '@/components/Icons';
import ConfirmationModal from '@/components/ConfirmationModal';
import { calculateStudentResult, getNextGrade, getNextAcademicYear, normalizeAcademicYear } from '@/utils';

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

    const nextYear = getNextAcademicYear(academicYear);

    // Check if today is on or after April 1 of the year-end
    const yearEnd = parseInt(academicYear.split('-')[0]) + 1; // e.g. 2026
    const promotionDate = new Date(`${yearEnd}-04-01`);
    const today = new Date();
    const isPastPromotionDate = today >= promotionDate;
    const isAlreadyNewYear = academicYear === nextYear;

    const promotionSummary = useMemo(() => {
        return GRADES_LIST.map(grade => {
            const gradeDef = gradeDefinitions[grade];
            const classStudents = students.filter(
                s => s.status === StudentStatus.ACTIVE && s.grade === grade
            );

            if (!gradeDef || !Array.isArray(gradeDef.subjects)) {
                return { grade, total: classStudents.length, toPromote: 0, toDetain: 0, toGraduate: 0, nextGrade: getNextGrade(grade) };
            }

            let toPromote = 0, toDetain = 0, toGraduate = 0;

            classStudents.forEach(student => {
                const resultStatus = calculateStudentResult(student, gradeDef);
                if (resultStatus === 'FAIL') {
                    toDetain++;
                } else {
                    grade === Grade.X ? toGraduate++ : toPromote++;
                }
            });

            return { grade, total: classStudents.length, toPromote, toDetain, toGraduate, nextGrade: getNextGrade(grade) };
        });
    }, [students, gradeDefinitions, academicYear]);

    const totalStudents  = promotionSummary.reduce((s, r) => s + r.total, 0);
    const totalPromoted  = promotionSummary.reduce((s, r) => s + r.toPromote, 0);
    const totalDetained  = promotionSummary.reduce((s, r) => s + r.toDetain, 0);
    const totalGraduated = promotionSummary.reduce((s, r) => s + r.toGraduate, 0);

    const handleConfirmPromotion = async () => {
        setIsPromoting(true);
        try {
            await onPromoteStudents();
        } finally {
            setIsPromoting(false);
            setIsConfirmModalOpen(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                        <BackIcon className="w-5 h-5" /> Back
                    </button>
                    <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800">
                        <HomeIcon className="w-5 h-5" /> Home
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Student Promotion</h1>
                        <p className="text-slate-600 mt-1">
                            End of <span className="font-semibold">{academicYear}</span> → Promote to <span className="font-semibold">{nextYear}</span>
                        </p>
                    </div>
                </div>

                {/* April 1 readiness banner */}
                {isPastPromotionDate ? (
                    <div className="mb-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <span className="text-2xl flex-shrink-0">✅</span>
                        <div>
                            <p className="font-bold text-emerald-800">Ready for promotion</p>
                            <p className="text-sm text-emerald-700 mt-0.5">
                                Today is past April 1, {yearEnd}. You can now finalize the year and promote all students to {nextYear}.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <span className="text-2xl flex-shrink-0">⏳</span>
                        <div>
                            <p className="font-bold text-amber-800">Promotion not yet due</p>
                            <p className="text-sm text-amber-700 mt-0.5">
                                The promotion window opens on <strong>April 1, {yearEnd}</strong>. You can still run it early, but it is not recommended.
                            </p>
                        </div>
                    </div>
                )}

                {/* Summary stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Active', value: totalStudents, color: 'slate' },
                        { label: 'To Promote', value: totalPromoted, color: 'emerald' },
                        { label: 'To Detain', value: totalDetained, color: 'rose' },
                        { label: 'To Graduate (X)', value: totalGraduated, color: 'indigo' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-xl p-4 text-center`}>
                            <p className={`text-3xl font-extrabold text-${color}-700`}>{value}</p>
                            <p className={`text-xs font-semibold text-${color}-500 mt-1 uppercase tracking-wide`}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Per-class table */}
                <div className="overflow-x-auto border rounded-lg mb-6">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Class</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Promotes To</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Total</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-emerald-800 uppercase">Promoted</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-rose-800 uppercase">Detained</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-indigo-800 uppercase">Graduated</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {promotionSummary.map(summary => (
                                <tr key={summary.grade} className={summary.total === 0 ? 'opacity-40' : ''}>
                                    <td className="px-6 py-4 font-semibold text-slate-900">{summary.grade}</td>
                                    <td className="px-6 py-4 text-center text-sm text-slate-500">
                                        {summary.grade === Grade.X
                                            ? <span className="font-bold text-indigo-600">🎓 Graduate</span>
                                            : <span className="font-semibold text-slate-700">{summary.nextGrade || '—'}</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-800">{summary.total}</td>
                                    <td className="px-6 py-4 text-center font-bold text-emerald-700">{summary.toPromote}</td>
                                    <td className="px-6 py-4 text-center font-bold text-rose-700">{summary.toDetain}</td>
                                    <td className="px-6 py-4 text-center font-bold text-indigo-700">{summary.toGraduate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* What this does */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl mb-6 space-y-2 text-sm text-slate-700">
                    <p className="font-bold text-slate-800 mb-2">What this action does:</p>
                    <p>📦 Archives a snapshot of every active student under <code className="bg-slate-200 px-1 rounded">students_archive/{academicYear}/</code></p>
                    <p>⬆️ Promotes Nursery → KG → Class I → … → Class IX to the next grade with new student IDs for <strong>{nextYear}</strong></p>
                    <p>🎓 Marks Class X students as <strong>Graduated</strong></p>
                    <p>🔄 Resets academic performance and fee payments for all promoted students</p>
                    <p>📅 Updates the active academic year to <strong>{nextYear}</strong></p>
                    <p className="text-rose-600 font-semibold">⚠️ Students who need to be detained must be manually moved back to their original grade after this step.</p>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={() => setIsConfirmModalOpen(true)}
                        disabled={user.role !== 'admin' || isPromoting}
                        className="btn btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500 text-lg px-6 py-3 disabled:bg-slate-400"
                    >
                        <AcademicCapIcon className="w-5 h-5" />
                        {isPromoting ? 'Processing…' : `Finalize ${academicYear} & Promote to ${nextYear}`}
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmPromotion}
                title={`Confirm Promotion to ${nextYear}`}
                confirmDisabled={isPromoting}
            >
                <div className="space-y-3 text-sm">
                    <p>You are about to:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                        <li>Archive all <strong>{totalStudents}</strong> active students from <strong>{academicYear}</strong></li>
                        <li>Promote <strong>{totalPromoted}</strong> students to their next grade</li>
                        <li>Graduate <strong>{totalGraduated}</strong> Class X students</li>
                        <li>Set the academic year to <strong>{nextYear}</strong></li>
                    </ul>
                    <p className="text-rose-600 font-semibold">This action cannot be undone from this screen.</p>
                </div>
            </ConfirmationModal>
        </>
    );
};

export default PromotionPage;
