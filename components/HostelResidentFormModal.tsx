





import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { HostelResident, Student, StudentStatus, HostelDormitory } from '../types';
import { formatDateForDisplay, formatDateForStorage } from '../utils';
import { SpinnerIcon } from './Icons';
import { HOSTEL_DORMITORY_LIST } from '../constants';

interface HostelResidentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (resident: Omit<HostelResident, 'id'>) => void;
    resident: HostelResident | null;
    preselectedStudent: Student | null;
    allStudents: Student[];
    allResidents: HostelResident[];
    isSaving: boolean;
    error?: string;
}

const ReadonlyField: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div className="bg-slate-100 p-2 rounded-md">
        <label className="block text-xs font-semibold text-slate-600">{label}</label>
        <div className="text-sm text-slate-900 font-medium">{value || 'N/A'}</div>
    </div>
);


const HostelResidentFormModal: React.FC<HostelResidentFormModalProps> = ({ isOpen, onClose, onSubmit, resident, preselectedStudent, allStudents, allResidents, isSaving, error }) => {
    
    const getInitialFormData = (): Omit<HostelResident, 'id'> => ({
        studentId: '',
        dormitory: HOSTEL_DORMITORY_LIST[0],
        dateOfJoining: formatDateForDisplay(new Date().toISOString().split('T')[0]),
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const availableStudents = useMemo(() => {
        const residentStudentIds = new Set(allResidents.map(r => r.studentId));
        const currentStudentId = resident ? resident.studentId : null;
        return allStudents
            .filter(s => s.status === StudentStatus.ACTIVE && (!residentStudentIds.has(s.id) || s.id === currentStudentId))
            .sort((a,b) => a.name.localeCompare(b.name));
    }, [allStudents, allResidents, resident]);

    useEffect(() => {
        if (isOpen) {
            if (resident) {
                const student = allStudents.find(s => s.id === resident.studentId);
                setSelectedStudent(student || null);
                setFormData({ ...resident, dateOfJoining: formatDateForDisplay(resident.dateOfJoining) });
            } else if (preselectedStudent) {
                setFormData({ ...getInitialFormData(), studentId: preselectedStudent.id });
                setSelectedStudent(preselectedStudent);
            } else {
                setFormData(getInitialFormData());
                setSelectedStudent(null);
            }
        }
    }, [resident, preselectedStudent, isOpen, allStudents]);

    const handleStudentSelect = (studentId: string) => {
        const student = allStudents.find(s => s.id === studentId);
        setSelectedStudent(student || null);
        setFormData(prev => ({ ...prev, studentId }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value as any}));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            dateOfJoining: formatDateForStorage(formData.dateOfJoining),
        };
        onSubmit(dataToSubmit);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold text-slate-800">{resident ? 'Edit Inmate Record' : 'Hostel Inmate Registration'}</h2>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                         {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md animate-fade-in" role="alert">
                                <p className="font-bold">Error</p>
                                <p>{error}</p>
                            </div>
                        )}
                        <div>
                            <label htmlFor="studentId" className="block text-sm font-bold text-slate-800">Select Student</label>
                            <select 
                                id="studentId" 
                                name="studentId" 
                                value={formData.studentId}
                                onChange={(e) => handleStudentSelect(e.target.value)}
                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:bg-slate-200 disabled:cursor-not-allowed"
                                required
                                disabled={!!resident || !!preselectedStudent}
                            >
                                <option value="" disabled>-- Choose an active student --</option>
                                {(resident || preselectedStudent) && selectedStudent && <option value={selectedStudent.id}>{selectedStudent.name} ({selectedStudent.grade})</option>}
                                {!resident && !preselectedStudent && availableStudents.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                                ))}
                            </select>
                        </div>
                        
                        {selectedStudent && (
                             <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 md:grid-cols-3 gap-3">
                                <ReadonlyField label="Father's Name" value={selectedStudent.fatherName} />
                                <ReadonlyField label="Class" value={selectedStudent.grade} />
                                <ReadonlyField label="Roll No." value={selectedStudent.rollNo} />
                                <ReadonlyField label="Date of Birth" value={formatDateForDisplay(selectedStudent.dateOfBirth)} />
                                <div className="col-span-2 md:col-span-3">
                                    <ReadonlyField label="Address" value={selectedStudent.address} />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="dormitory" className="block text-sm font-bold text-slate-800">Assign Dormitory</label>
                                <select id="dormitory" name="dormitory" value={formData.dormitory} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required>
                                    {HOSTEL_DORMITORY_LIST.map(dorm => (
                                        <option key={dorm} value={dorm}>
                                            {dorm}
                                        </option>
                                    ))}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="dateOfJoining" className="block text-sm font-bold text-slate-800">Date of Joining</label>
                                <input type="text" name="dateOfJoining" id="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} placeholder="DD/MM/YYYY" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                        </div>

                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSaving}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <SpinnerIcon className="w-5 h-5" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                resident ? 'Save Changes' : 'Register Inmate'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HostelResidentFormModal;
