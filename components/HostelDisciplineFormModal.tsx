import React, { useState, useMemo, FormEvent, useEffect } from 'react';
import { HostelDisciplineEntry, Student, HostelResident, IncidentSeverity, IncidentStatus } from '../types';
import { INCIDENT_CATEGORIES, INCIDENT_SEVERITY_LIST, INCIDENT_STATUS_LIST } from '../constants';
import { formatStudentId } from '../utils';
import { SpinnerIcon, CheckIcon, XIcon } from './Icons';

export type HostelDisciplineFormData = Omit<HostelDisciplineEntry, 'id' | 'reportedBy' | 'reportedById'>;

interface DisciplineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: HostelDisciplineFormData, id?: string) => void;
  entry: HostelDisciplineEntry | null;
  residents: HostelResident[];
  students: Student[];
  isSaving: boolean;
  academicYear: string;
}

const HostelDisciplineFormModal: React.FC<DisciplineFormModalProps> = ({ isOpen, onClose, onSubmit, entry, residents, students, isSaving, academicYear }) => {
    const getInitialState = (): HostelDisciplineFormData => ({
        residentId: '',
        studentId: '',
        date: new Date().toISOString().split('T')[0],
        category: INCIDENT_CATEGORIES[0],
        description: '',
        severity: IncidentSeverity.MINOR,
        status: IncidentStatus.OPEN,
        actionTaken: '',
    });
    
    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            if (entry) {
                const resident = residents.find(r => r.studentId === entry.studentId);
                setFormData({
                    residentId: resident?.id || '',
                    studentId: entry.studentId,
                    date: entry.date,
                    category: entry.category,
                    description: entry.description,
                    severity: entry.severity,
                    status: entry.status,
                    actionTaken: entry.actionTaken || '',
                });
            } else {
                setFormData(getInitialState());
            }
        }
    }, [entry, isOpen, residents]);
    
    const residentOptions = useMemo(() => {
        return residents.map(resident => {
            const student = students.find(s => s.id === resident.studentId);
            return {
                value: resident.id,
                label: `${student?.name || 'Unknown'} (${student?.grade}, ID: ${student ? formatStudentId(student, academicYear) : 'N/A'})`,
                studentId: resident.studentId,
            };
        }).sort((a,b) => a.label.localeCompare(b.label));
    }, [residents, students, academicYear]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === 'residentId') {
            const selectedOption = residentOptions.find(opt => opt.value === value);
            setFormData(prev => ({ ...prev, residentId: value, studentId: selectedOption?.studentId || '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value as any }));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(formData, entry?.id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">{entry ? 'Edit Incident Record' : 'Add New Incident Record'}</h2>
                        <button type="button" onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><XIcon className="w-5 h-5"/></button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-bold text-slate-800">Student</label>
                            <select name="residentId" value={formData.residentId} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required disabled={!!entry}>
                                <option value="" disabled>-- Select a hostel resident --</option>
                                {residentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Date of Incident</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required/>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                    {INCIDENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Severity</label>
                                <select name="severity" value={formData.severity} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                    {INCIDENT_SEVERITY_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                    {INCIDENT_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-800">Description of Incident</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-800">Action Taken (Optional)</label>
                            <textarea name="actionTaken" value={formData.actionTaken} onChange={handleChange} rows={2} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm"></textarea>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSaving}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? <SpinnerIcon className="w-5 h-5"/> : <CheckIcon className="w-5 h-5"/>}
                            {isSaving ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default HostelDisciplineFormModal;
