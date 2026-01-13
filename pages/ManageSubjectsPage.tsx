
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Grade, GradeDefinition, User } from '../types';
import { GRADES_LIST, GRADES_WITH_NO_ACTIVITIES } from '../constants';
import { BackIcon, HomeIcon, EditIcon, BookOpenIcon, TrashIcon } from '../components/Icons';
import EditSubjectsModal from '../components/EditSubjectsModal';
import ConfirmationModal from '../components/ConfirmationModal';

const { Link, useNavigate } = ReactRouterDOM as any;

interface ManageSubjectsPageProps {
  gradeDefinitions: Record<Grade, GradeDefinition>;
  onUpdateGradeDefinition: (grade: Grade, newDefinition: GradeDefinition) => void;
  user: User;
  onResetAllMarks: () => Promise<void>;
}

export const ManageSubjectsPage: React.FC<ManageSubjectsPageProps> = ({ gradeDefinitions, onUpdateGradeDefinition, user, onResetAllMarks }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const handleEditClick = (grade: Grade) => {
        setEditingGrade(grade);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGrade(null);
    };

    const handleSaveChanges = (newDefinition: GradeDefinition) => {
        if (editingGrade) {
            onUpdateGradeDefinition(editingGrade, newDefinition);
        }
        handleCloseModal();
    };
    
    const handleConfirmReset = async () => {
        setIsResetting(true);
        await onResetAllMarks();
        setIsResetting(false);
        setIsResetModalOpen(false);
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                    >
                        <BackIcon className="w-5 h-5" />
                        Back
                    </button>
                    <Link
                        to="/portal/dashboard"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                        title="Go to Home/Dashboard"
                    >
                        <HomeIcon className="w-5 h-5" />
                        <span>Home</span>
                    </Link>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Manage Subjects by Grade</h1>
                <p className="text-slate-700 mb-8">
                    View and edit the official list of subjects for each grade level.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {GRADES_LIST.map(grade => {
                        const gradeDef = gradeDefinitions[grade];
                        const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(grade);
                        
                        return (
                            <div key={grade} className="bg-slate-50 rounded-lg p-4 flex flex-col border">
                                <div className="flex justify-between items-start mb-3">
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <BookOpenIcon className="w-6 h-6 text-sky-600" />
                                        {grade}
                                    </h2>
                                    <button
                                        onClick={() => handleEditClick(grade)}
                                        disabled={user.role !== 'admin'}
                                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs bg-white border border-slate-300 text-slate-700 font-semibold rounded-md shadow-sm hover:bg-slate-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
                                        title={`Edit curriculum for ${grade}`}
                                    >
                                        <EditIcon className="w-4 h-4" />
                                        Edit
                                    </button>
                                </div>
                                <ul className="text-slate-700 space-y-1 text-sm flex-grow">
                                    {(gradeDef.subjects || []).length > 0 ? (
                                        (gradeDef.subjects || []).map((subject, index) => (
                                            <li key={`${grade}-${subject.name}-${index}`} className="flex justify-between items-center p-1 rounded-md even:bg-slate-100">
                                                <span>{subject.name}</span>
                                                <span className="text-xs font-mono text-slate-500">
                                                    {subject.gradingSystem === 'OABC'
                                                        ? 'Graded'
                                                        : `FM: ${subject.examFullMarks + subject.activityFullMarks}`}
                                                </span>
                                            </li>
                                        ))
                                    ) : (
                                        <p className="italic text-slate-500">No subjects defined.</p>
                                    )}
                                </ul>
                            </div>
                        );
                    })}
                </div>
                
                {user.role === 'admin' && (
                    <div className="mt-8 pt-6 border-t border-red-200">
                        <h2 className="text-xl font-bold text-red-700">Danger Zone</h2>
                        <p className="text-slate-600 text-sm mt-1">This action will permanently delete all academic marks for all students. Use with extreme caution.</p>
                        <button
                            onClick={() => setIsResetModalOpen(true)}
                            className="mt-4 btn bg-red-600 hover:bg-red-700 text-white"
                        >
                            <TrashIcon className="w-5 h-5" />
                            Reset All Academic Records
                        </button>
                    </div>
                )}
            </div>
            
            <EditSubjectsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveChanges}
                grade={editingGrade!}
                initialGradeDefinition={editingGrade ? gradeDefinitions[editingGrade] : { subjects: [] }}
            />

            <ConfirmationModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={handleConfirmReset}
                title="Confirm Reset All Academic Records"
                confirmDisabled={isResetting}
            >
                <p>Are you sure you want to delete all marks for all students? This action is irreversible.</p>
            </ConfirmationModal>
        </>
    );
};
