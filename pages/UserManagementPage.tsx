
import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { BackIcon, HomeIcon, CheckIcon, TrashIcon } from '../components/Icons';
import * as ReactRouterDOM from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

const { Link, useNavigate } = ReactRouterDOM as any;

interface UserManagementPageProps {
  allUsers: User[];
  currentUser: User;
  onUpdateUserRole: (uid: string, newRole: 'admin' | 'user' | 'pending' | 'warden') => void;
  onDeleteUser: (uid: string) => void;
}

export const UserManagementPage: React.FC<UserManagementPageProps> = ({ 
    allUsers, 
    currentUser, 
    onUpdateUserRole, 
    onDeleteUser
}) => {
    const navigate = useNavigate();
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const staffUsers = useMemo(() => {
        return allUsers.filter(user => 
            ['admin', 'user', 'warden', 'pending'].includes(user.role)
        );
    }, [allUsers]);

    const handleRoleChange = (uid: string, newRole: string) => {
        if (['admin', 'user', 'pending', 'warden'].includes(newRole)) {
            onUpdateUserRole(uid, newRole as 'admin' | 'user' | 'pending' | 'warden');
        }
    };

    const handleConfirmDelete = () => {
        if (userToDelete) {
            onDeleteUser(userToDelete.uid);
            setUserToDelete(null);
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
                
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Staff User Management</h1>
                <p className="text-slate-700 mb-8">Approve new staff registrations and manage existing user roles.</p>
                
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                         <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Role</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-slate-200">
                            {staffUsers.map(user => (
                                <tr key={user.uid}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{user.displayName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{user.email}</td>
                                    <td className="px-6 py-4 text-sm">
                                        {user.role === 'pending' ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">Pending Approval</span>
                                        ) : (
                                            <select value={user.role} onChange={(e) => handleRoleChange(user.uid, e.target.value)} disabled={user.uid === currentUser.uid} className="form-select text-sm rounded-md border-slate-300 shadow-sm">
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="warden">Warden</option>
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {user.role === 'pending' && (
                                                <button onClick={() => onUpdateUserRole(user.uid, 'user')} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full hover:bg-emerald-700">
                                                    <CheckIcon className="w-4 h-4" /> Approve
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
        </>
    );
};
