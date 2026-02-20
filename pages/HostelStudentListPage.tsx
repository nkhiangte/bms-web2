

import React, { useMemo, useState } from 'react';
import * => ReactRouterDOM from 'react-router-dom';
import { HostelResident, Student, User } from '../types';
import { BackIcon, HomeIcon, UsersIcon, PlusIcon, EditIcon, TrashIcon } from '../components/Icons';
import { formatStudentId } from '@/utils';

const { Link, useNavigate } = ReactRouterDOM as any;

interface HostelStudentListPageProps {
    residents: HostelResident[];
    students: Student[];
    onAdd: () => void;
    onAddById: (studentId: string) => Promise<{ success: boolean, message?: string }>;
    onEdit: (resident: HostelResident) => void;
    onDelete: (resident: HostelResident) => void;
    user: User;
    academicYear: string;
}

const HostelStudentListPage: React.FC<HostelStudentListPageProps> = ({ residents, students, onAdd, onAddById, onEdit, onDelete, user, academicYear }) => {
    const navigate = useNavigate();
    const [studentIdInput, setStudentIdInput] = useState('');
    const [searchError, setSearchError] = useState('');

    const residentDetails = useMemo(() => {
        return residents.map(resident => {
            const student = students.find(s => s.id === resident.studentId);
            return {
                ...resident,
                studentName: student?.name || 'N/A',
                studentClass: student?.grade || 'N/A',
                studentIdForDisplay: student ? formatStudentId(student, academicYear) : 'N/A',
            };
        }).sort((a, b) => a.studentName.localeCompare(b.name));
    }, [residents, students, academicYear]);

    const handleSearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearchError('');
        if (!studentIdInput) {
            setSearchError('Please enter a student ID.');
            return;
        }
        const result = await onAddById(studentIdInput);
        if (!result.success) {
            setSearchError(result.message || 'An error occurred.');
        } else {
            setStudentIdInput(''); // Clear on success
        }
    };

    const canManage = ['admin', 'warden'].includes(user.role);

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home">
                    <HomeIcon className="w-5 h-5" /> Home
                </Link>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div className="flex items-center gap-4">
                    <UsersIcon className="w-10 h-10 text-sky-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Student Hostel Records</h1>
                        <p className="text-slate-600 mt-1">List of all registered students in the hostel.</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <form onSubmit={handleSearchSubmit} className="flex gap-2">
                        <input 
                            type="text"
                            placeholder="Enter Student ID to add..."
                            value={studentIdInput}
                            onChange={e => setStudentIdInput(e.target.value.toUpperCase())}
                            className="form-input"
                        />
                        <button type="submit" className="btn btn-primary whitespace-nowrap" disabled={!canManage}>
                            <UsersIcon className="w-5 h-5"/> Add by ID
                        </button>
                    </form>
                    <button 
                        onClick={onAdd}
                        disabled={!canManage}
                        className="btn btn-secondary whitespace-nowrap disabled:bg-slate-300"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Manually
                    </button>
                </div>
            </div>
            {searchError && <p className="text-red-600 text-sm -mt-4 mb-4">{searchError}</p>}

            {residentDetails.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-700 text-lg font-semibold">No students are currently registered in the hostel.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Student ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Student Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Class</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Dormitory</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Date of Joining</th>
                                {canManage && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {residentDetails.map(resident => (
                                <tr key={resident.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{resident.studentIdForDisplay}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <Link to={`/portal/student/${resident.studentId}`} className="font-medium text-sky-700 hover:underline">
                                            {resident.studentName}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{resident.studentClass}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{resident.dormitory}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{resident.dateOfJoining}</td>
                                    {canManage && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => onEdit(resident)} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full" title="Edit">
                                                    <EditIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => onDelete(resident)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Delete">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default HostelStudentListPage;
