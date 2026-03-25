import React, { useState, useEffect } from 'react';
import { ExamRoutine, ExamScheduleItem } from '@/types';
import { XIcon, PlusIcon, TrashIcon, SpinnerIcon } from '@/components/Icons';

interface ExamRoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (routine: Omit<ExamRoutine, 'id'>, id?: string) => Promise<boolean>;
    initialData: ExamRoutine | null;
}

const ExamRoutineModal: React.FC<ExamRoutineModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [title, setTitle] = useState('');
    const [exams, setExams] = useState<ExamScheduleItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setExams(initialData.exams || []);
            } else {
                setTitle('');
                setExams([{ date: '', day: '', morning: '', afternoon: '' }]);
            }
        }
    }, [isOpen, initialData]);

    const handleAddRow = () => {
        setExams([...exams, { date: '', day: '', morning: '', afternoon: '' }]);
    };

    const handleRemoveRow = (index: number) => {
        setExams(exams.filter((_, i) => i !== index));
    };

    const handleUpdateRow = (index: number, field: keyof ExamScheduleItem, value: string) => {
        const newExams = [...exams];
        newExams[index] = { ...newExams[index], [field]: value };
        setExams(newExams);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        try {
            const success = await onSave({ title, exams }, initialData?.id);
            if (success) onClose();
        } catch (error) {
            console.error('Failed to save exam routine:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">
                        {initialData ? 'Edit Exam Routine' : 'New Exam Routine'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Routine Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., I Terminal Examination 2026"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Schedule Items</h3>
                            <button
                                type="button"
                                onClick={handleAddRow}
                                className="flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
                            >
                                <PlusIcon className="w-4 h-4" /> Add Day
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="pb-3 pr-4">Date</th>
                                        <th className="pb-3 pr-4">Day</th>
                                        <th className="pb-3 pr-4">Morning Session</th>
                                        <th className="pb-3 pr-4">Afternoon Session</th>
                                        <th className="pb-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="space-y-2">
                                    {exams.map((exam, index) => (
                                        <tr key={index} className="group">
                                            <td className="py-2 pr-4">
                                                <input
                                                    type="text"
                                                    value={exam.date}
                                                    onChange={(e) => handleUpdateRow(index, 'date', e.target.value)}
                                                    placeholder="e.g., 12/05/26"
                                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                                                />
                                            </td>
                                            <td className="py-2 pr-4">
                                                <input
                                                    type="text"
                                                    value={exam.day}
                                                    onChange={(e) => handleUpdateRow(index, 'day', e.target.value)}
                                                    placeholder="e.g., Monday"
                                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                                                />
                                            </td>
                                            <td className="py-2 pr-4">
                                                <input
                                                    type="text"
                                                    value={exam.morning}
                                                    onChange={(e) => handleUpdateRow(index, 'morning', e.target.value)}
                                                    placeholder="Subject (Time)"
                                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                                                />
                                            </td>
                                            <td className="py-2 pr-4">
                                                <input
                                                    type="text"
                                                    value={exam.afternoon}
                                                    onChange={(e) => handleUpdateRow(index, 'afternoon', e.target.value)}
                                                    placeholder="Subject (Time)"
                                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                                                />
                                            </td>
                                            <td className="py-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveRow(index)}
                                                    className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-zinc-800 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !title.trim()}
                        className="px-8 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <SpinnerIcon className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Routine'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamRoutineModal;
