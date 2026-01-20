
import React, { useState } from 'react';
import { User, Student, StudentClaim } from '../types';
import { BackIcon, HomeIcon, CheckIcon, TrashIcon, XCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, UserIcon } from '../components/Icons';
import * as ReactRouterDOM from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatStudentId } from '../utils';

const { Link, useNavigate } = ReactRouterDOM as any;

interface UserManagementPageProps {
  allUsers: User[];
  students: Student[];
  academicYear: string;
  currentUser: User;
  onUpdateUserRole: (uid: string, newRole: 'admin' | 'user' | 'pending' | 'warden') => void;
  onDeleteUser: (uid: string) => void;
  onUpdateUser: (uid: string, updates: Partial<User>) => Promise<void>; 
  onApproveParent: (uid: string, studentIds: string) => void; 
}

const VerificationModal: React.FC<{
    user: User;
    students: Student[];
    academicYear: string;
    onClose: () => void;
    onApprove: (studentIds: string[]) => void;
}> = ({ user, students, academicYear, onClose, onApprove }) => {
    // Collect all claims from either the legacy field or the new array
    const claims: StudentClaim[] = user.claimedStudents || 
        (user.claimedStudentId ? [{
            studentId: user.claimedStudentId,
            dob: user.claimedDateOfBirth || '',
            fullName: 'Legacy Claim',
            relationship: 'Parent'
        }] : []);

    const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set());

    const verificationResults = claims.map(claim => {
        const student = students.find(s => formatStudentId(s, academicYear).toLowerCase() === claim.studentId.toLowerCase());
        
        let status = 'not_found';
        if (student) {
            if (claim.dob && student.dateOfBirth === claim.dob) {
                status = 'match';
            } else if (!claim.dob) {
                status = 'missing_dob';
            } else {
                status = 'dob_mismatch';
            }
        }
        return { claim, student, status };
    });

    const toggleVerification = (studentId: string) => {
        setVerifiedIds(prev => {
            const next = new Set(prev);
            if (next.has(studentId)) next.delete(studentId);
            else next.add(studentId);
            return next;
        });
    };
    
    // Auto-select verified matches on load
    React.useEffect(() => {
        const matches = verificationResults
            .filter(r => r.status === 'match' && r.student)
            .map(r => r.student!.id);
        setVerifiedIds(new Set(matches));
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Review Parent Application</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow">
                    <div className="bg-slate-50 p-4 rounded-lg border mb-6">
                        <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <UserIcon className="w-5 h-5"/> Applicant Details
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-slate-500">Name:</span> <span className="font-semibold">{user.displayName}</span></div>
                            <div><span className="text-slate-500">Email:</span> <span className="font-semibold">{user.email}</span></div>
                            {user.registrationDetails && (
                                <>
                                    <div><span className="text-slate-500">Phone:</span> <span className="font-semibold">{user.registrationDetails.contactNumber}</span></div>
                                    <div className="col-span-2"><span className="text-slate-500">Address:</span> <span className="font-semibold">{user.registrationDetails.address}</span></div>
                                </>
                            )}
                        </div>
                    </div>

                    <h4 className="font-bold text-slate-700 mb-2">Claimed Students</h4>
                    <div className="space-y-3">
                        {verificationResults.map((result, idx) => (
                            <div key={idx} className={`p-3 border rounded-lg flex items-center justify-between ${
                                result.status === 'match' ? 'bg-emerald-50 border-emerald-200' : 
                                result.status === 'not_found' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                            }`}>
                                <div>
                                    <p className="font-semibold text-sm">Claimed ID: {result.claim.studentId}</p>
                                    <p className="text-xs text-slate-600">Claimed Name: {result.claim.fullName} ({result.claim.relationship})</p>
                                    <p className="text-xs text-slate-600">Claimed DOB: {result.claim.dob}</p>
                                    
                                    {result.student ? (
                                        <div className="mt-2 text-xs">
                                            <p className="font-bold text-slate-700">Found in Database:</p>
                                            <p>{result.student.name} ({result.student.grade})</p>
                                            <p>DOB: {result.student.dateOfBirth}</p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-red-600 font-bold mt-1">Student Not Found in Database</p>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    {result.status === 'match' && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4"/> Matched</span>}
                                    {result.status === 'dob_mismatch' && <span className="text-xs font-bold text-red-600 flex items-center gap-1"><XCircleIcon className="w-4 h-4"/> DOB Mismatch</span>}
                                    {result.status === 'missing_dob' && <span className="text-xs font-bold text-amber-600 flex items-center gap-1"><ExclamationTriangleIcon className="w-4 h-4"/> Manual Check</span>}

                                    {result.student && (
                                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                                            <input 
                                                type="checkbox" 
                                                checked={verifiedIds.has(result.student.id)}
                                                onChange={() => toggleVerification(result.student!.id)}
                                                className="form-checkbox text-sky-600 rounded"
                                            />
                                            <span className="text-sm font-semibold">Link</span>
                                        </label>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button 
                        onClick={() => onApprove(Array.from(verifiedIds))}
                        disabled={verifiedIds.size === 0}
                        className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400"
                    >
                        Approve & Link {verifiedIds.size} Student(s)
                    </button>
                </div>
            </div>
        </div>
    );
};


export const UserManagementPage: React.FC<UserManagementPageProps> = ({ allUsers, students, academicYear, currentUser, onUpdateUserRole, onDeleteUser, onUpdateUser }) => {
    const navigate = useNavigate();
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [reviewingUser, setReviewingUser] = useState<User | null>(null);

    const handleRoleChange = (uid: string, newRole: string) => {
        if (['admin', 'user', 'pending', 'warden'].includes(newRole)) {
            onUpdateUserRole(uid, newRole as 'admin' | 'user' | 'pending' | 'warden');
        }
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
    };

    const handleConfirmDelete = () => {
        if (userToDelete) {
            onDeleteUser(userToDelete.uid);
            setUserToDelete(null);
        }
    };

    const handleApproveParent = async (studentIds: string[]) => {
        if (reviewingUser) {
            await onUpdateUser(reviewingUser.uid, {
                role: 'parent',
                studentIds: studentIds
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
                
                <h1 className="text-3xl font-bold text-slate-800 mb-2">User Management</h1>
                <p className="text-slate-700 mb-8">Approve new user registrations and manage existing user roles.</p>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Role / Status</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {allUsers.map(user => {
                                return (
                                    <tr key={user.uid}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{user.displayName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{user.email}</td>
                                    <td className="px-6 py-4 text-sm">
                                        {user.role === 'pending' ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                                                Pending Staff
                                            </span>
                                        ) : user.role === 'pending_parent' ? (
                                            <div className="space-y-1">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                                    Parent Request
                                                </span>
                                                <div className="text-xs text-slate-500">
                                                    {user.claimedStudents ? 
                                                        `${user.claimedStudents.length} student(s) claimed` : 
                                                        `Legacy Claim: ${user.claimedStudentId}`
                                                    }
                                                </div>
                                            </div>
                                        ) : user.role === 'parent' ? (
                                            <div>
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                                    Parent
                                                </span>
                                                <div className="text-xs text-slate-600 mt-1">
                                                    {user.studentIds && user.studentIds.length > 0 ? (
                                                        <span>Linked to {user.studentIds.length} student(s).</span>
                                                    ) : (
                                                        <span>Not linked to any student.</span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                                                disabled={user.uid === currentUser.uid}
                                                className="form-select text-sm rounded-md border-slate-300 shadow-sm focus:border-sky-300 focus:ring focus:ring-sky-200 focus:ring-opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="warden">Warden</option>
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {user.role === 'pending' ? (
                                                <button
                                                    onClick={() => onUpdateUserRole(user.uid, 'user')}
                                                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full hover:bg-emerald-700 transition"
                                                >
                                                    <CheckIcon className="w-4 h-4" />
                                                    Approve Staff
                                                </button>
                                            ) : user.role === 'pending_parent' ? (
                                                 <button
                                                    onClick={() => setReviewingUser(user)}
                                                    className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full hover:bg-indigo-700 transition"
                                                >
                                                    <CheckIcon className="w-4 h-4" />
                                                    Review
                                                </button>
                                            ) : null }

                                            <button
                                                onClick={() => handleDeleteClick(user)}
                                                disabled={user.uid === currentUser.uid}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-full disabled:text-slate-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                                title={user.uid === currentUser.uid ? "Cannot delete yourself" : "Delete User"}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                    {allUsers.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-slate-600">No other users found.</p>
                        </div>
                    )}
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
                <VerificationModal 
                    user={reviewingUser}
                    students={students}
                    academicYear={academicYear}
                    onClose={() => setReviewingUser(null)}
                    onApprove={handleApproveParent}
                />
            )}
        </>
    );
};
