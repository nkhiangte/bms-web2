import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon, HomeIcon, ShieldCheckIcon, PlusIcon, EditIcon, TrashIcon, InboxArrowDownIcon } from '../components/Icons';
import { HostelDisciplineEntry, User, Student, HostelResident, IncidentStatus } from '../types';
import { INCIDENT_STATUS_LIST } from '../constants';
import { formatDateForDisplay, exportDisciplineLogToCsv, formatStudentId } from '../utils';
import HostelDisciplineFormModal, { HostelDisciplineFormData } from '../components/HostelDisciplineFormModal';

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
                    <ShieldCheckIcon className