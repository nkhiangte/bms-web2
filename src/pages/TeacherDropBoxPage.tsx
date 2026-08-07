import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Staff, User, EmploymentStatus, StaffType } from '@/types';
import { ArchiveBoxIcon, SearchIcon, UserIcon, ArrowUpOnSquareIcon, TrashIcon, EditIcon, BackIcon, HomeIcon } from '@/components/Icons';
import { normalizeAcademicYear } from '@/utils';
import PhotoWithFallback from '@/components/PhotoWithFallback';
import ConfirmationModal from '@/components/ConfirmationModal';
import StaffFormModal from '@/components/StaffFormModal';

const { Link, useNavigate } = ReactRouterDOM as any;

interface TeacherDropBoxPageProps {
    staff: Staff[];
    academicYear: string;
    user: User;
    onReinstateStaff: (staffMember: Staff) => Promise<void>;
    onPermanentDeleteStaff: (staffId: string) => Promise<void>;
    onEditStaff: (staffData: Omit<Staff, 'id'>, id: string | undefined, assignedGrade: any) => Promise<void>;
    gradeDefinitions: any;
}

export const TeacherDropBoxPage: React.FC<TeacherDropBoxPageProps> = ({
    staff,
    academicYear,
    user,
    onReinstateStaff,
    onPermanentDeleteStaff,
    onEditStaff,
    gradeDefinitions,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [staffTypeFilter, setStaffTypeFilter] = useState<string>('');
    const [selectedAcademicYearFilter, setSelectedAcademicYearFilter] = useState<string>(academicYear);
    const [staffToReinstate, setStaffToReinstate] = useState<Staff | null>(null);
    const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const navigate = useNavigate();
    const isAdmin = user.role === 'admin';
    const isStaffUser = isAdmin || user.role === 'user';

    // Filter staff where status === RESIGNED or DROPPED
    const droppedStaff = useMemo(() => {
        return staff.filter(s => {
            const isRemoved = s.status === EmploymentStatus.RESIGNED || s.status === EmploymentStatus.DROPPED || s.removalYear;
            if (!isRemoved) return false;

            // Removal year check
            const removalYearNorm = normalizeAcademicYear(s.removalYear || academicYear);
            const filterYearNorm = normalizeAcademicYear(selectedAcademicYearFilter);
            if (selectedAcademicYearFilter && removalYearNorm !== filterYearNorm) {
                return false;
            }

            // Staff type filter
            if (staffTypeFilter && s.staffType !== staffTypeFilter) {
                return false;
            }

            // Search term
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const nameMatch = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase().includes(term);
                const idMatch = (s.employeeId || '').toLowerCase().includes(term);
                const desigMatch = (s.designation || '').toLowerCase().includes(term);
                const deptMatch = (s.department || '').toLowerCase().includes(term);
                return nameMatch || idMatch || desigMatch || deptMatch;
            }

            return true;
        });
    }, [staff, academicYear, selectedAcademicYearFilter, staffTypeFilter, searchTerm]);

    const handleConfirmReinstate = async () => {
        if (staffToReinstate) {
            await onReinstateStaff(staffToReinstate);
            setStaffToReinstate(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (staffToDelete) {
            setIsSaving(true);
            try {
                await onPermanentDeleteStaff(staffToDelete.id);
                setStaffToDelete(null);
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Navigation & Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="mb-4 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                        <BackIcon className="w-5 h-5" /> Back
                    </button>
                    <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Dashboard">
                        <HomeIcon className="w-5 h-5" /> <span>Home</span>
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                            <ArchiveBoxIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900">Teacher & Staff Drop Box</h1>
                            <p className="text-sm text-slate-600 mt-0.5">
                                Manage teachers and staff members who have resigned or been removed from active duty, including their year of removal.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700">
                        <span>Total Dropped/Resigned:</span>
                        <span className="px-2.5 py-0.5 bg-amber-600 text-white rounded-full font-bold text-xs">
                            {droppedStaff.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                {/* Search Bar */}
                <div className="relative flex-grow w-full md:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, Employee ID, designation..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition text-sm"
                        aria-label="Search dropped staff"
                    />
                </div>

                {/* Staff Type Filter */}
                <select
                    value={staffTypeFilter}
                    onChange={e => setStaffTypeFilter(e.target.value)}
                    className="w-full md:w-48 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition text-sm font-medium bg-slate-50"
                    aria-label="Filter by staff type"
                >
                    <option value="">All Staff Types</option>
                    <option value={StaffType.TEACHING}>Teaching</option>
                    <option value={StaffType.NON_TEACHING}>Non-Teaching</option>
                </select>

                {/* Removal Academic Year Filter */}
                <input
                    type="text"
                    placeholder="Removal Year (e.g. 2026)"
                    value={selectedAcademicYearFilter}
                    onChange={e => setSelectedAcademicYearFilter(e.target.value)}
                    className="w-full md:w-48 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition text-sm font-medium"
                    aria-label="Removal Year Filter"
                />
            </div>

            {/* Staff List */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {droppedStaff.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                            <ArchiveBoxIcon className="w-8 h-8" />
                        </div>
                        <p className="text-slate-800 text-lg font-bold">No removed or resigned staff found</p>
                        <p className="text-slate-500 text-sm mt-1">Staff members removed or marked as resigned will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Employee ID</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Staff Name</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Designation</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Removal Year</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {droppedStaff.map(member => (
                                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-slate-900">
                                            {member.employeeId || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {member.photographUrl ? (
                                                        <img src={member.photographUrl} alt={`${member.firstName} ${member.lastName}`} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserIcon className="w-5 h-5 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <Link to={`/staff/${member.id}`} className="text-sky-600 hover:text-sky-800 hover:underline">
                                                        {member.firstName} {member.lastName}
                                                    </Link>
                                                    <p className="text-xs text-slate-400">{member.department || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                                            {member.designation}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold">
                                                {member.staffType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            {member.contactNumber || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-rose-700">
                                            {member.removalYear || academicYear}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                {isStaffUser && (
                                                    <button
                                                        onClick={() => setStaffToReinstate(member)}
                                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-lg text-xs transition border border-emerald-200 shadow-sm flex items-center gap-1.5"
                                                        title="Reinstate staff back to Active status"
                                                    >
                                                        <ArrowUpOnSquareIcon className="w-4 h-4" />
                                                        Reinstate
                                                    </button>
                                                )}
                                                {isStaffUser && (
                                                    <button
                                                        onClick={() => setEditingStaff(member)}
                                                        className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition"
                                                        title="Edit staff record"
                                                    >
                                                        <EditIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => setStaffToDelete(member)}
                                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                        title="Permanently delete record"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Reinstate Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!staffToReinstate}
                onClose={() => setStaffToReinstate(null)}
                onConfirm={handleConfirmReinstate}
                title="Reinstate Staff Member"
            >
                <p className="text-slate-700">
                    Are you sure you want to reinstate <span className="font-bold text-slate-900">{staffToReinstate?.firstName} {staffToReinstate?.lastName}</span> back to active employment?
                </p>
            </ConfirmationModal>

            {/* Permanent Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!staffToDelete}
                onClose={() => setStaffToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Permanently Delete Staff Record"
                confirmDisabled={isSaving}
            >
                <div className="space-y-3">
                    <p className="text-slate-700">
                        Are you sure you want to permanently delete the record for <span className="font-bold text-slate-900">{staffToDelete?.firstName} {staffToDelete?.lastName}</span>? This action cannot be undone.
                    </p>
                    {isSaving && <p className="text-sm text-rose-600">Deleting...</p>}
                </div>
            </ConfirmationModal>

            {/* Edit Staff Modal */}
            {editingStaff && (
                <StaffFormModal
                    isOpen={!!editingStaff}
                    onClose={() => setEditingStaff(null)}
                    onSubmit={async (data, assignedGradeKey) => {
                        await onEditStaff(data, editingStaff.id, assignedGradeKey);
                        setEditingStaff(null);
                    }}
                    staffMember={editingStaff}
                    allStaff={staff}
                    gradeDefinitions={gradeDefinitions}
                    isSaving={isSaving}
                />
            )}
        </div>
    );
};

export default TeacherDropBoxPage;
