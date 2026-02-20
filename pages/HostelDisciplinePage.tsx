import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon, HomeIcon, ShieldCheckIcon, PlusIcon, EditIcon, TrashIcon, InboxArrowDownIcon } from '@/components/Icons';
import { HostelDisciplineEntry, User, Student, HostelResident, IncidentStatus } from '@/types';
import { INCIDENT_STATUS_LIST } from '@/constants';
import { formatDateForDisplay, exportDisciplineLogToCsv, formatStudentId } from '@/utils';
import HostelDisciplineFormModal, { HostelDisciplineFormData } from '@/components/HostelDisciplineFormModal';

const { Link, useNavigate } = ReactRouterDOM as any;

interface HostelDisciplinePageProps {
    user: User;
    students: Student[];
    residents: HostelResident[];
    disciplineLog: HostelDisciplineEntry[];
    onSave: (entryData: HostelDisciplineFormData, id?: string) => Promise<void>;
    onDelete: (entry: HostelDisciplineEntry) => void;
    academicYear: string;
}

const HostelDisciplinePage: React.FC<HostelDisciplinePageProps> = ({ user, students, residents, disciplineLog, onSave, onDelete, academicYear }) => {
    const navigate = useNavigate();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<HostelDisciplineEntry | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);

    const filteredLog = useMemo(() => {
        return disciplineLog
            .map(entry => {
                const student = studentMap.get(entry.studentId);
                return { ...entry, studentName: student?.name || 'N/A' };
            })
            .filter(entry => {
                const term = searchTerm.toLowerCase();
                const matchesSearch = !term || entry.studentName.toLowerCase().includes(term);
                const matchesStatus = !statusFilter || entry.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a,b) => b.date.localeCompare(a.date));
    }, [disciplineLog, studentMap, searchTerm, statusFilter]);
    
    const handleOpenAdd = () => {
        setEditingEntry(null);
        setIsModalOpen(true);
    };
    
    const handleOpenEdit = (entry: HostelDisciplineEntry) => {
        setEditingEntry(entry);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEntry(null);
    };

    const handleFormSubmit = async (formData: HostelDisciplineFormData, id?: string) => {
        setIsSaving(true);
        try {
            await onSave(formData, id);
            handleCloseModal();
        } catch (e) {
            console.error("Save failed", e);
            // Error notification is handled in App.tsx, but you could add local error state here if needed.
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleExport = () => {
        exportDisciplineLogToCsv({
            logEntries: filteredLog,
            students,
            residents,
            fileName: 'Hostel_Discipline_Log',
            academicYear
        });
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'bg-red-100 text-red-800';
            case 'Major': return 'bg-amber-100 text-amber-800';
            case 'Minor':
            default: return 'bg-slate-100 text-slate-800';
        }
    };


    return (
        <>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home">
                    <HomeIcon className="w-5 h-5" /> Home
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <ShieldCheckIcon className="w-10 h-10 text-rose-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Discipline & Incident Records</h1>
                        <p className="text-slate-600 mt-1">Log and track all hostel-related incidents.</p>
                    </div>
                </div>
                 {(user.role === 'admin' || user.role === 'warden') && (
                    <button onClick={handleOpenAdd} className="btn btn-primary"><PlusIcon className="w-5 h-5"/> Add Incident</button>
                 )}
            </div>

            <div className="my-6 p-4 bg-slate-50 border rounded-lg flex flex-col sm:flex-row items-center gap-4">
                 <input type="text" placeholder="Search by student name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="form-input flex-grow" />
                 <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select">
                    <option value="">All Statuses</option>
                    {INCIDENT_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <button onClick={handleExport} className="btn btn-secondary"><InboxArrowDownIcon className="w-5 h-5"/> Export CSV</button>
            </div>

            {filteredLog.length === 0 ? (
                 <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-700 text-lg font-semibold">No incidents found.</p>
                 </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase">Student</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase">Severity</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase">Reported By</th>
                                {(user.role === 'admin' || user.role === 'warden') && <th className="px-4 py-3 text-center text-xs font-bold text-slate-800 uppercase">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredLog.map(entry => (
                                <tr key={entry.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-sky-700">
                                        <Link to={`/student/${entry.studentId}`} className="hover:underline">{entry.studentName}</Link>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{formatDateForDisplay(entry.date)}</td>
                                    <td className="px-4 py-3 text-sm text-slate-800">{entry.category}</td>
                                    <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate" title={entry.description}>{entry.description}</td>
                                    <td className="px-4 py-3 text-sm"><span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getSeverityColor(entry.severity)}`}>{entry.severity}</span></td>
                                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{entry.status}</td>
                                    <td className="px-4 py-3 text-sm text-slate-700">{entry.reportedBy}</td>
                                    {(user.role === 'admin' || user.role === 'warden') && (
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleOpenEdit(entry)} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full" title="Edit"><EditIcon className="w-4 h-4"/></button>
                                                <button onClick={() => onDelete(entry)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Delete"><TrashIcon className="w-4 h-4"/></button>
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
        <HostelDisciplineFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleFormSubmit}
            entry={editingEntry}
            residents={residents}
            students={students}
            isSaving={isSaving}
            academicYear={academicYear}
        />
        </>
    );
};
export default HostelDisciplinePage;