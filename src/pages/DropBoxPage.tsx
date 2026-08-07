import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, User, StudentStatus, Grade } from '@/types';
import { ArchiveBoxIcon, SearchIcon, UserIcon, ArrowUpOnSquareIcon, TrashIcon, EditIcon } from '@/components/Icons';
import { formatStudentId, normalizeAcademicYear } from '@/utils';
import ConfirmationModal from '@/components/ConfirmationModal';
import StudentFormModal from '@/components/StudentFormModal';

const { Link } = ReactRouterDOM as any;

interface DropBoxPageProps {
    students: Student[];
    academicYear: string;
    user: User;
    onReinstateStudent: (student: Student) => Promise<void>;
    onPermanentDeleteStudent: (studentId: string) => Promise<void>;
    onEditStudent: (student: Student) => Promise<void>;
}

const DropBoxPage: React.FC<DropBoxPageProps> = ({
    students,
    academicYear,
    user,
    onReinstateStudent,
    onPermanentDeleteStudent,
    onEditStudent,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [gradeFilter, setGradeFilter] = useState<string>('');
    const [selectedAcademicYearFilter, setSelectedAcademicYearFilter] = useState<string>(academicYear);
    const [studentToReinstate, setStudentToReinstate] = useState<Student | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const isAdmin = user.role === 'admin';
    const isStaff = isAdmin || user.role === 'user';

    // Filter students where status === StudentStatus.DROPPED
    const droppedStudents = useMemo(() => {
        return students.filter(s => {
            if (s.status !== StudentStatus.DROPPED) return false;
            
            // Academic year check
            const studentYear = normalizeAcademicYear(s.academicYear || academicYear);
            const filterYear = normalizeAcademicYear(selectedAcademicYearFilter);
            if (selectedAcademicYearFilter && studentYear !== filterYear) {
                return false;
            }

            // Grade filter
            if (gradeFilter && s.grade !== gradeFilter) {
                return false;
            }

            // Search term
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const nameMatch = s.name.toLowerCase().includes(term);
                const idMatch = formatStudentId(s, academicYear).toLowerCase().includes(term);
                const fatherMatch = (s.fatherName || '').toLowerCase().includes(term);
                const penMatch = (s.pen || '').toLowerCase().includes(term);
                return nameMatch || idMatch || fatherMatch || penMatch;
            }

            return true;
        });
    }, [students, academicYear, selectedAcademicYearFilter, gradeFilter, searchTerm]);

    const handleConfirmReinstate = async () => {
        if (studentToReinstate) {
            await onReinstateStudent(studentToReinstate);
            setStudentToReinstate(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (studentToDelete) {
            await onPermanentDeleteStudent(studentToDelete.id);
            setStudentToDelete(null);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
                            <ArchiveBoxIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900">Drop Box</h1>
                            <p className="text-sm text-slate-600 mt-0.5">
                                Manage students who have dropped out or left during the academic year.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700">
                    <span>Total Dropped:</span>
                    <span className="px-2.5 py-0.5 bg-rose-600 text-white rounded-full font-bold text-xs">
                        {droppedStudents.length}
                    </span>
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
                        placeholder="Search by name, ID, PEN or father's name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition text-sm"
                        aria-label="Search dropped students"
                    />
                </div>

                {/* Grade Filter */}
                <select
                    value={gradeFilter}
                    onChange={e => setGradeFilter(e.target.value)}
                    className="w-full md:w-48 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition text-sm font-medium bg-slate-50"
                    aria-label="Filter by grade"
                >
                    <option value="">All Grades</option>
                    {Object.values(Grade).map(g => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>

                {/* Academic Year Filter */}
                <input
                    type="text"
                    placeholder="Academic Year (e.g. 2026)"
                    value={selectedAcademicYearFilter}
                    onChange={e => setSelectedAcademicYearFilter(e.target.value)}
                    className="w-full md:w-48 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition text-sm font-medium"
                    aria-label="Academic Year Filter"
                />
            </div>

            {/* Students List */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {droppedStudents.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                            <ArchiveBoxIcon className="w-8 h-8" />
                        </div>
                        <p className="text-slate-800 text-lg font-bold">No dropped students found</p>
                        <p className="text-slate-500 text-sm mt-1">Students marked as dropped will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Student ID</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Grade</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Father's Name</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Year</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {droppedStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-slate-900">
                                            {formatStudentId(student, academicYear)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {student.photographUrl ? (
                                                        <img src={student.photographUrl} alt={student.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserIcon className="w-5 h-5 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <Link to={`/portal/student/${student.id}`} className="text-sky-600 hover:text-sky-800 hover:underline">
                                                        {student.name}
                                                    </Link>
                                                    {student.pen && <p className="text-xs text-slate-400 font-mono">PEN: {student.pen}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                                            {student.grade}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            {student.fatherName || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            {student.contact || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {student.academicYear || academicYear}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                {isStaff && (
                                                    <button
                                                        onClick={() => setStudentToReinstate(student)}
                                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-lg text-xs transition border border-emerald-200 shadow-sm flex items-center gap-1.5"
                                                        title="Reinstate student back to Active status"
                                                    >
                                                        <ArrowUpOnSquareIcon className="w-4 h-4" />
                                                        Reinstate
                                                    </button>
                                                )}
                                                {isStaff && (
                                                    <button
                                                        onClick={() => setEditingStudent(student)}
                                                        className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition"
                                                        title="Edit student record"
                                                    >
                                                        <EditIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => setStudentToDelete(student)}
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
                isOpen={!!studentToReinstate}
                onClose={() => setStudentToReinstate(null)}
                onConfirm={handleConfirmReinstate}
                title="Reinstate Student"
            >
                <p className="text-slate-700">
                    Are you sure you want to reinstate <span className="font-bold text-slate-900">{studentToReinstate?.name}</span> back to active status?
                </p>
            </ConfirmationModal>

            {/* Permanent Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!studentToDelete}
                onClose={() => setStudentToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Permanently Delete Dropped Student Record"
            >
                <div className="space-y-3">
                    <p className="text-slate-700">
                        Are you sure you want to permanently delete the dropped record for <span className="font-bold text-slate-900">{studentToDelete?.name}</span>? This action cannot be undone.
                    </p>
                </div>
            </ConfirmationModal>

            {/* Edit Student Modal */}
            {editingStudent && (
                <StudentFormModal
                    isOpen={!!editingStudent}
                    onClose={() => setEditingStudent(null)}
                    onSubmit={async (data) => {
                        await onEditStudent({ ...editingStudent, ...data });
                        setEditingStudent(null);
                    }}
                    initialData={editingStudent}
                    academicYear={academicYear}
                />
            )}
        </div>
    );
};

export default DropBoxPage;
