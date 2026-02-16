import React, { useState, useMemo } from 'react';
import { User, Student, StudentClaim } from '../types';
import { BackIcon, HomeIcon, CheckIcon, TrashIcon, UserGroupIcon, ChevronUpIcon, PhoneIcon, WhatsappIcon } from '../components/Icons';
import * as ReactRouterDOM from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import { firebase } from '../firebaseConfig';
import ParentReviewModal from '../components/ParentReviewModal';
import { formatDateForDisplay, formatStudentId, formatPhoneNumberForWhatsApp } from '../utils';

const { Link, useNavigate } = ReactRouterDOM as any;

interface ParentsManagementPageProps {
  allUsers: User[];
  students: Student[];
  academicYear: string;
  currentUser: User;
  onDeleteUser: (uid: string) => void;
  onUpdateUser: (uid: string, updates: Partial<User>) => Promise<void>;
}

const DetailItem: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <div>
        <dt className="text-xs font-semibold text-slate-500">{label}</dt>
        <dd className="text-sm text-slate-800">{value || '-'}</dd>
    </div>
);

export const ParentsManagementPage: React.FC<ParentsManagementPageProps> = ({ 
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
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

    const parentUsers = useMemo(() => {
        return allUsers
            .filter(user => ['parent', 'pending_parent'].includes(user.role))
            .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    }, [allUsers]);

    const toggleExpand = (uid: string) => {
        setExpandedUserId(prevId => (prevId === uid ? null : uid));
    };

    const handleConfirmDelete = () => {
        if (userToDelete) {
            onDeleteUser(userToDelete.uid);
            setUserToDelete(null);
        }
    };

    const handleApproveAndLink = async (studentIdsToLink: string[]) => {
        if (reviewingUser) {
            const existingIds = reviewingUser.studentIds || [];
            const newStudentIds = [...new Set([...existingIds, ...studentIdsToLink])];

            await onUpdateUser(reviewingUser.uid, {
                role: 'parent',
                studentIds: newStudentIds,
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
                        <p className="text-slate-700 mt-1">Approve new parent registrations and manage linked student accounts.</p>
                    </div>
                </div>
                
                 <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                         <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Parent Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Linked Students</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-slate-200">
                            {parentUsers.map(user => {
                                const isExpanded = expandedUserId === user.uid;
                                return (
                                <React.Fragment key={user.uid}>
                                    <tr className={`hover:bg-slate-50 ${isExpanded ? 'bg-sky-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{user.displayName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{user.email}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {user.role === 'pending_parent' ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">Pending Approval</span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">Active</span>
                                            )}
                                        </td>
                                         <td className="px-6 py-4 text-sm text-slate-700">
                                            {(user.studentIds || []).map(id => {
                                                const s = students.find(st => st.id === id);
                                                return <div key={id}>{s?.name || `ID: ${id}`}</div>;
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => toggleExpand(user.uid)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full" title="More Info">
                                                    <ChevronUpIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                </button>
                                                {user.role === 'pending_parent' && (
                                                    <button onClick={() => setReviewingUser(user)} className="flex items-center gap-1.5 px-3 py-1 bg-sky-600 text-white text-xs font-bold rounded-full hover:bg-sky-700">
                                                        <CheckIcon className="w-4 h-4" /> Review & Approve
                                                    </button>
                                                )}
                                                <button onClick={() => setUserToDelete(user)} className="p-2 text-red-600 hover:bg-red-100 rounded-full">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-slate-50">
                                            <td colSpan={5} className="p-4">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <DetailItem label="Contact Number" value={user.registrationDetails?.contactNumber} />
                                                    <DetailItem label="Relationship" value={user.registrationDetails?.relationship} />
                                                    <DetailItem label="Address" value={`${user.registrationDetails?.address}, ${user.registrationDetails?.city}`} />
                                                    <div className="flex items-center gap-2">
                                                        {user.registrationDetails?.contactNumber && (
                                                            <a href={`https://wa.me/${formatPhoneNumberForWhatsApp(user.registrationDetails.contactNumber)}`} target="_blank" rel="noopener noreferrer" className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-full"><WhatsappIcon className="w-5 h-5"/></a>
                                                        )}
                                                         <a href={`mailto:${user.email}`} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full"><PhoneIcon className="w-5 h-5"/></a>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )})}
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