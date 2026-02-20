
import React, { useState, useMemo, FormEvent } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, Grade, SubjectAssignment, Homework } from '@/types';
import { BackIcon, HomeIcon, PlusIcon, EditIcon, TrashIcon, BookOpenIcon, SpinnerIcon } from '@/components/Icons';
import { GRADES_LIST } from '@/constants';
import { formatDateForDisplay, formatDateForStorage } from '@/utils';

const { Link, useNavigate } = ReactRouterDOM as any;

interface HomeworkFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (homework: Omit<Homework, 'id' | 'createdBy'>) => Promise<void>;
    homework: Omit<Homework, 'id' | 'createdBy'> | null;
    isSaving: boolean;
    availableSubjects: { name: string }[];
}

const HomeworkFormModal: React.FC<HomeworkFormModalProps> = ({ isOpen, onClose, onSave, homework, isSaving, availableSubjects }) => {
    const [formData, setFormData] = useState<Omit<Homework, 'id' | 'createdBy'>>({
        grade: GRADES_LIST[0],
        subject: '',
        date: new Date().toISOString().split('T')[0],
        assignmentDetails: '',
        dueDate: '',
    });

    React.useEffect(() => {
        if (isOpen) {
            setFormData(homework || {
                grade: GRADES_LIST[0],
                subject: availableSubjects[0]?.name || '',
                date: new Date().toISOString().split('T')[0],
                assignmentDetails: '',
                dueDate: '',
            });
        }
    }, [isOpen, homework, availableSubjects]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold text-slate-800">{homework ? 'Edit Homework' : 'Add Homework'}</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-bold">Class</label><select name="grade" value={formData.grade} onChange={handleChange} className="form-select w-full mt-1" required><option value="">-- Select --</option>{GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                            <div><label className="block text-sm font-bold">Subject</label><select name="subject" value={formData.subject} onChange={handleChange} className="form-select w-full mt-1" required><option value="">-- Select --</option>{availableSubjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}</select></div>
                            <div><label className="block text-sm font-bold">Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="form-input w-full mt-1" required /></div>
                            <div><label className="block text-sm font-bold">Due Date (Optional)</label><input type="date" name="dueDate" value={formData.dueDate || ''} onChange={handleChange} className="form-input w-full mt-1" /></div>
                        </div>
                        <div><label className="block text-sm font-bold">Assignment Details</label><textarea name="assignmentDetails" value={formData.assignmentDetails} onChange={handleChange} rows={4} className="form-textarea w-full mt-1" required></textarea></div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSaving}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving && <SpinnerIcon className="w-5 h-5"/>}
                            {isSaving ? 'Saving...' : 'Save Homework'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface ManageHomeworkPageProps {
    user: User;
    assignedGrade: Grade | null;
    assignedSubjects: SubjectAssignment[];
    onSave: (homework: Omit<Homework, 'id' | 'createdBy'>, id?: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    allHomework: Homework[];
}

const ManageHomeworkPage: React.FC<ManageHomeworkPageProps> = ({ user, assignedGrade, assignedSubjects, onSave, onDelete, allHomework }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [filters, setFilters] = useState({ grade: '', subject: '' });

    const availableGrades = useMemo(() => {
        if (user.role === 'admin') return GRADES_LIST;
        const grades = new Set<Grade>();
        if (assignedGrade) grades.add(assignedGrade);
        assignedSubjects.forEach(s => grades.add(s.grade));
        return Array.from(grades).sort((a,b) => GRADES_LIST.indexOf(a) - GRADES_LIST.indexOf(b));
    }, [user, assignedGrade, assignedSubjects]);

    const filteredHomework = useMemo(() => {
        return allHomework
            .filter(hw => filters.grade ? hw.grade === filters.grade : true)
            .filter(hw => filters.subject ? hw.subject === filters.subject : true)
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [allHomework, filters]);

    const handleSave = async (data: Omit<Homework, 'id' | 'createdBy'>) => {
        setIsSaving(true);
        await onSave(data, editingHomework?.id);
        setIsSaving(false);
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600"><BackIcon className="w-5 h-5"/> Back</button>
                    <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600"><HomeIcon className="w-5 h-5"/> Home</Link>
                </div>
                <div className="flex items-center gap-3 mb-6">
                    <BookOpenIcon className="w-10 h-10 text-indigo-600"/>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Manage Homework</h1>
                        <p className="text-slate-600 mt-1">Assign and review homework for different classes.</p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border rounded-lg flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-auto flex-grow"><label className="text-sm font-bold">Filter by Class</label><select value={filters.grade} onChange={e => setFilters({...filters, grade: e.target.value})} className="form-select w-full mt-1"><option value="">All Classes</option>{availableGrades.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                    <div className="w-full sm:w-auto flex-grow"><label className="text-sm font-bold">Filter by Subject</label><input type="text" value={filters.subject} onChange={e => setFilters({...filters, subject: e.target.value})} className="form-input w-full mt-1" placeholder="Type to filter..."/></div>
                    <div className="w-full sm:w-auto self-end"><button onClick={() => { setEditingHomework(null); setIsModalOpen(true); }} className="btn btn-primary w-full"><PlusIcon className="w-5 h-5"/> Add Homework</button></div>
                </div>
                
                <div className="mt-6 space-y-3">
                    {filteredHomework.length > 0 ? filteredHomework.map(hw => (
                        <div key={hw.id} className="p-4 border rounded-lg bg-slate-50/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-slate-800">{hw.subject} - {hw.grade}</p>
                                    <p className="text-xs text-slate-500">Posted on: {formatDateForDisplay(hw.date)} {hw.dueDate && `| Due: ${formatDateForDisplay(hw.dueDate)}`}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingHomework(hw); setIsModalOpen(true); }} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => onDelete(hw.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{hw.assignmentDetails}</p>
                        </div>
                    )) : <p className="text-center text-slate-500 py-10">No homework found for the selected filters.</p>}
                </div>
            </div>
             <HomeworkFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                homework={editingHomework}
                isSaving={isSaving}
                availableSubjects={assignedSubjects as any}
            />
        </>
    );
};

export default ManageHomeworkPage;
