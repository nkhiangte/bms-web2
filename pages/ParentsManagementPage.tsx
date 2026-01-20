import React, { useState, useMemo } from 'react';
import { User, Student } from '../types';
import { BackIcon, HomeIcon, CheckIcon, TrashIcon, UserGroupIcon } from '../components/Icons';
import * as ReactRouterDOM from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import { firebase } from '../firebaseConfig';
import ParentReviewModal from '../components/ParentReviewModal';

const { Link, useNavigate } = ReactRouterDOM as any;

interface ParentsManagementPageProps {
  allUsers: User[];
  students: Student[];
  academicYear: string;
  currentUser: User;
  onDeleteUser: (uid: string) => void;
  onUpdateUser: (uid: string, updates: Partial<User>) => Promise<void>;
}

const ParentsManagementPage: React.FC<ParentsManagementPageProps> = ({ 
    allUsers, 
    students, 
    academicYear, 
    currentUser, 
    onDeleteUser, 
    onUpdateUser 
}) => {
    const navigate = useNavigate();
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [reviewingUser, setReviewingUser] = useState<User | null>(null);

    const parentUsers = useMemo(() => {
        return allUsers
            .filter(user => ['parent', 'pending_parent'].includes(user.role))
            .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    }, [allUsers]);


    const handleConfirmDelete = () => {
        if (userToDelete) {
            onDeleteUser(userToDelete.uid);
            setUserToDelete(null);
        }
    };

    const handleApproveAndLink = async (studentIdsToLink: string[]) => {
        if (reviewingUser) {
            await onUpdateUser(reviewingUser.uid, {
                role: 'parent',
                studentIds: studentIdsToLink,
                claimedStudents: firebase.firestore.FieldValue.delete(),
                claimedStudentId: firebase.firestore.FieldValue.delete(),
                claimedDateOfBirth: firebase.firestore.FieldValue.delete(),
            });
            setReviewingUser(null);
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                        <BackIcon className="w-5 h-5" /> Back
                    </button>
                    <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home/Dashboard">
                        <HomeIcon className="w-5 h-5" />
                        <span>Home</span>
                    </Link>
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                    <UserGroupIcon className="w-10 h-10 text-indigo-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Parents Management</h1>
                        <p className="text-slate-700">View parent biodata and approve new accounts.</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase">Email & Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase">Address</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-800 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {parentUsers.map(user => (
                                <tr key={user.uid}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">{user.displayName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                                        <div>{user.email}</div>
                                        <div className="text-xs text-slate-500">{user.registrationDetails?.contactNumber}</div>
                                    </td>
                                     <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">{user.registrationDetails?.address}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {user.role === 'pending_parent' ? (
                                            <div className="space-y-1">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">Pending Approval</span>
                                            </div>
                                        ) : (
                                            <div>
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">Approved Parent</span>
                                                <div className="text-xs text-slate-500 mt-1">Linked to {user.studentIds?.length || 0} student(s)</div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                             {user.role === 'pending_parent' && (
                                                <button onClick={() => setReviewingUser(user)} className="flex items-center gap-1.5 px-3 py-1 bg-sky-600 text-white text-xs font-bold rounded-full hover:bg-sky-700">
                                                    <CheckIcon className="w-4 h-4" /> Review
                                                </button>
                                            )}
                                            <button onClick={() => setUserToDelete(user)} disabled={user.uid === currentUser.uid} className="p-2 text-red-600 hover:bg-red-100 rounded-full disabled:text-slate-400 disabled:hover:bg-transparent">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete User Confirmation"
            >
                <p>Are you sure you want to permanently delete the user <span className="font-bold">{userToDelete?.displayName || userToDelete?.email}</span>? This action cannot be undone.</p>
            </ConfirmationModal>

            {reviewingUser && (
                <ParentReviewModal 
                    user={reviewingUser}
                    students={students}
                    academicYear={academicYear}
                    onClose={() => setReviewingUser(null)}
                    onApprove={handleApproveAndLink}
                />
            )}
        </>
    );
};

export default ParentsManagementPage;
