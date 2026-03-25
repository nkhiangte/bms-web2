import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { HomeIcon, BackIcon, DocumentPlusIcon, SearchIcon, FolderIcon } from '@/components/Icons';
import { db } from '@/firebaseConfig';
import { Student, StudentStatus } from '@/types';

const { Link, useNavigate } = ReactRouterDOM as any;

// ─── Icons ────────────────────────────────────────────────────────────────────

const UndoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
    </svg>
);

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={`animate-spin ${className}`}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface TransferredStudent extends Student {
    tcDate?: string;
    tcReason?: string;
    tcNumber?: string;
    transferredAt?: string; // ISO timestamp
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────

const UndoConfirmModal: React.FC<{
    student: TransferredStudent | null;
    onConfirm: () => void;
    onClose: () => void;
    isLoading: boolean;
}> = ({ student, onConfirm, onClose, isLoading }) => {
    if (!student) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-slate-200">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full">
                        <UndoIcon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800">Undo Transfer?</h3>
                        <p className="text-sm text-slate-600 mt-1">
                            You are about to restore <span className="font-semibold text-slate-800">{student.name}</span> back to <span className="font-semibold text-slate-800">Active</span> status.
                        </p>
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-600">
                            <p><span className="font-medium">Class:</span> {student.grade}</p>
                            {student.tcNumber && <p><span className="font-medium">TC No:</span> {student.tcNumber}</p>}
                            {student.tcDate && <p><span className="font-medium">TC Date:</span> {student.tcDate}</p>}
                            {student.tcReason && <p><span className="font-medium">Reason:</span> {student.tcReason}</p>}
                        </div>
                        <p className="text-xs text-amber-600 mt-3 font-medium">
                            ⚠ This will set the student's status back to Active. The TC record will remain in TC Records for audit purposes.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <SpinnerIcon className="w-4 h-4" /> : <UndoIcon className="w-4 h-4" />}
                        {isLoading ? 'Restoring...' : 'Yes, Undo Transfer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Toast Notification ───────────────────────────────────────────────────────

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all
            ${type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
            {type === 'success'
                ? <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                : <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />}
            {message}
            <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600">✕</button>
        </div>
    );
};

// ─── Action Card ──────────────────────────────────────────────────────────────

const ActionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; link: string; }> = ({ title, description, icon, link }) => (
    <Link to={link} className="group block p-6 bg-slate-50 rounded-lg text-slate-800 hover:bg-white hover:text-sky-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-transparent hover:border-sky-300">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-sky-100 text-sky-600 rounded-lg group-hover:bg-sky-500 group-hover:text-white transition-colors">{icon}</div>
            <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-sm text-slate-600">{description}</p>
            </div>
        </div>
    </Link>
);

// ─── Undo Transfer Panel ──────────────────────────────────────────────────────

const UndoTransferPanel: React.FC = () => {
    const [transferredStudents, setTransferredStudents] = useState<TransferredStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<TransferredStudent | null>(null);
    const [isUndoing, setIsUndoing] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Fetch all transferred/left students from Firestore
    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = db.collection('students')
           .where('status', 'in', ['Transferred', 'Left', 'transferred', 'left'])
            .onSnapshot(snapshot => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as TransferredStudent));
                // Sort by most recently transferred first
                data.sort((a, b) => {
                    const aTime = a.transferredAt || a.tcDate || '';
                    const bTime = b.transferredAt || b.tcDate || '';
                    return bTime.localeCompare(aTime);
                });
                setTransferredStudents(data);
                setIsLoading(false);
            }, () => {
                setIsLoading(false);
            });
        return () => unsubscribe();
    }, []);

    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return transferredStudents;
        const q = searchQuery.toLowerCase();
        return transferredStudents.filter(s =>
            s.name?.toLowerCase().includes(q) ||
            s.grade?.toLowerCase().includes(q) ||
            s.tcNumber?.toLowerCase().includes(q) ||
            String(s.rollNo).includes(q)
        );
    }, [transferredStudents, searchQuery]);

    const handleUndoTransfer = async () => {
        if (!selectedStudent) return;
        setIsUndoing(true);
        try {
            await db.collection('students').doc(selectedStudent.id).update({
                status: StudentStatus.ACTIVE,
                // Clear TC-related fields from the student record
                // but keep them in the TC Records collection for audit
                undoneAt: new Date().toISOString(),
                previousStatus: selectedStudent.status,
            });
            setToast({ message: `${selectedStudent.name} has been restored to Active status.`, type: 'success' });
            setSelectedStudent(null);
        } catch (err: any) {
            setToast({ message: `Failed to undo transfer: ${err?.message || 'Unknown error'}`, type: 'error' });
        } finally {
            setIsUndoing(false);
        }
    };

    return (
        <div className="mt-10 border-t border-slate-200 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <UndoIcon className="w-5 h-5 text-amber-500" />
                        Undo Transfer
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Restore a mistakenly transferred student back to Active status.
                    </p>
                </div>
                <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-200 self-start sm:self-auto">
                    {transferredStudents.length} transferred student{transferredStudents.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search by name, class, roll no, or TC number..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-slate-400"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-12 text-slate-500 text-sm">
                        <SpinnerIcon className="w-5 h-5" />
                        Loading transferred students...
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <UndoIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">
                            {searchQuery ? 'No students match your search.' : 'No transferred students found.'}
                        </p>
                    </div>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-slate-100 border-b border-slate-200">
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Class</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Roll No</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">TC No</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">TC Date</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Reason</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                                <th className="px-4 py-3 text-center font-semibold text-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-amber-50 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-800">{student.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{student.grade}</td>
                                    <td className="px-4 py-3 text-slate-600">{student.rollNo}</td>
                                    <td className="px-4 py-3 text-slate-600">{student.tcNumber || <span className="text-slate-300">—</span>}</td>
                                    <td className="px-4 py-3 text-slate-600">{student.tcDate || <span className="text-slate-300">—</span>}</td>
                                    <td className="px-4 py-3 text-slate-500 max-w-[160px] truncate" title={student.tcReason}>
                                        {student.tcReason || <span className="text-slate-300">—</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => setSelectedStudent(student)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors"
                                            title={`Undo transfer for ${student.name}`}
                                        >
                                            <UndoIcon className="w-3.5 h-3.5" />
                                            Undo
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <p className="text-xs text-slate-400 mt-3">
                * Undoing a transfer restores the student to Active status. The TC record is preserved in TC Records for audit trail.
            </p>

            {/* Confirm modal */}
            <UndoConfirmModal
                student={selectedStudent}
                onConfirm={handleUndoTransfer}
                onClose={() => setSelectedStudent(null)}
                isLoading={isUndoing}
            />

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TransferManagementPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
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

            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-800">Transfer Certificate System</h1>
                <p className="text-slate-600 mt-1">Manage all student transfer processes and documentation.</p>
            </div>

            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActionCard
                    title="Register Transfer Certificate"
                    description="Generate a new TC for a student."
                    icon={<DocumentPlusIcon className="w-8 h-8"/>}
                    link="/portal/transfers/generate"
                />
                <ActionCard
                    title="All TC Records"
                    description="View, search, and print existing TCs."
                    icon={<FolderIcon className="w-8 h-8"/>}
                    link="/portal/transfers/records"
                />
            </div>

            {/* Undo Transfer Section */}
            <div className="max-w-5xl mx-auto">
                <UndoTransferPanel />
            </div>
        </div>
    );
};

export default TransferManagementPage;
