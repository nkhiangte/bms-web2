import React, { useState, useEffect } from 'react';
import { ExamRoutine, ExamScheduleItem } from '../types';
import { PlusIcon, TrashIcon, CheckIcon, SpinnerIcon } from './Icons';

interface ExamRoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (routine: Omit<ExamRoutine, 'id'>, id?: string) => Promise<boolean>;
    initialData: ExamRoutine | null;
}

const ExamRoutineModal: React.FC<ExamRoutineModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [title, setTitle] = useState('');
    const [exams, setExams] = useState<ExamScheduleItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setExams(initialData.exams);
            } else {
                setTitle('');
                setExams([{ date: '', day: '', morning: '', afternoon: '' }]);
            }
        }
    }, [isOpen, initialData]);

    const handleExamChange = (index: number, field: keyof ExamScheduleItem, value: string) => {
        const newExams = [...exams];
        newExams[index] = { ...newExams[index], [field]: value };
        
        // Auto-calculate Day from Date
        if (field === 'date' && value) {
            const dateObj = new Date(value);
            if (!isNaN(dateObj.getTime())) {
                newExams[index].day = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            }
        }
        
        setExams(newExams);
    };

    const handleAddExam = () => {
        setExams([...exams, { date: '', day: '', morning: '', afternoon: '' }]);
    };

    const handleRemoveExam = (index: number) => {
        setExams(exams.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        const routineData: Omit<ExamRoutine, 'id'> = {
            title,
            exams: exams.filter(e => e.date || e.morning || e.afternoon), // Filter out empty rows
        };

        await onSave(routineData, initialData?.id);
        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">{initialData ? 'Edit Exam Routine' : 'Add Exam Routine'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                    <div className="p-6 overflow-y-auto flex-grow space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Routine Title</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                className="form-input w-full" 
                                placeholder="e.g., II SEM EXAM ROUTINE For CL IX & X"
                                required 
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-slate-700">Exam Schedule</label>
                                <button type="button" onClick={handleAddExam} className="btn btn-secondary text-xs py-1 px-2">
                                    <PlusIcon className="w-3 h-3" /> Add Exam
                                </button>
                            </div>
                            
                            <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-600">Date</th>
                                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-600">Day</th>
                                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-600">Morning Subject</th>
                                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-600">Afternoon Subject</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {exams.map((exam, index) => (
                                            <tr key={index}>
                                                <td className="p-2">
                                                    <input 
                                                        type="text" 
                                                        value={exam.date} 
                                                        onChange={e => handleExamChange(index, 'date', e.target.value)} 
                                                        className="form-input w-full text-sm" 
                                                        placeholder="DD/MM/YYYY"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input 
                                                        type="text" 
                                                        value={exam.day} 
                                                        onChange={e => handleExamChange(index, 'day', e.target.value)} 
                                                        className="form-input w-full text-sm bg-slate-50"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input 
                                                        type="text" 
                                                        value={exam.morning || ''} 
                                                        onChange={e => handleExamChange(index, 'morning', e.target.value)} 
                                                        className="form-input w-full text-sm" 
                                                        placeholder="Subject"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input 
                                                        type="text" 
                                                        value={exam.afternoon || ''} 
                                                        onChange={e => handleExamChange(index, 'afternoon', e.target.value)} 
                                                        className="form-input w-full text-sm" 
                                                        placeholder="Subject"
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button type="button" onClick={() => handleRemoveExam(index)} className="text-red-500 hover:bg-red-100 p-1 rounded-full">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSaving}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? <SpinnerIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
                            <span>Save Routine</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExamRoutineModal;