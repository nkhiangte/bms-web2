import React, { useState, useEffect } from 'react';
import { DailyRoutine, ClassRoutine, Period } from '../types';
import { CheckIcon, SpinnerIcon, PlusIcon, TrashIcon } from './Icons';
import { PERIOD_LABELS, GRADES_LIST } from '../constants';

interface ClassRoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (day: string, routine: DailyRoutine) => Promise<void>;
    day: string;
    currentRoutine: DailyRoutine;
}

const ClassRoutineModal: React.FC<ClassRoutineModalProps> = ({ isOpen, onClose, onSave, day, currentRoutine }) => {
    const [routine, setRoutine] = useState<DailyRoutine>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [activeClassIndex, setActiveClassIndex] = useState(0);

    useEffect(() => {
        if (isOpen) {
            // Deep copy or initialize if empty
            let initialData = currentRoutine ? JSON.parse(JSON.stringify(currentRoutine)) : [];
            
            // Ensure all grades are present if it's a new setup or missing some
            const existingGrades = new Set(initialData.map((r: ClassRoutine) => r.class));
            // We typically use classes from X down to Nursery in the timetable view, let's preserve order if exists
            // Or just use GRADES_LIST in reverse order for display consistency with the main table
            const reverseGrades = [...GRADES_LIST].reverse();
            
            if (initialData.length === 0) {
                initialData = reverseGrades.map(g => ({
                    class: g,
                    periods: Array(PERIOD_LABELS.length).fill({ subject: '' })
                }));
            } else {
                // If we have data, make sure we have 8 periods for each class (or match PERIOD_LABELS length)
                initialData = initialData.map((cr: ClassRoutine) => {
                    const periods = [...cr.periods];
                    if (periods.length < PERIOD_LABELS.length) {
                        const diff = PERIOD_LABELS.length - periods.length;
                        for(let i=0; i<diff; i++) periods.push({ subject: '' });
                    }
                    return { ...cr, periods };
                });
            }
            setRoutine(initialData);
            setActiveClassIndex(0);
        }
    }, [isOpen, currentRoutine]);

    const handlePeriodChange = (classIndex: number, periodIndex: number, value: string) => {
        const newRoutine = [...routine];
        const periods = [...newRoutine[classIndex].periods];
        periods[periodIndex] = { subject: value };
        newRoutine[classIndex] = { ...newRoutine[classIndex], periods };
        setRoutine(newRoutine);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(day, routine);
        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    const activeClassRoutine = routine[activeClassIndex];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Edit Routine for {day}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                    <div className="flex flex-grow overflow-hidden">
                        {/* Sidebar for Classes */}
                        <div className="w-1/4 border-r bg-slate-50 overflow-y-auto p-2 space-y-1">
                            {routine.map((cr, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveClassIndex(idx)}
                                    className={`w-full text-left px-4 py-3 rounded-md font-semibold text-sm transition-colors ${activeClassIndex === idx ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'}`}
                                >
                                    {cr.class.startsWith('Class') ? cr.class : `Class ${cr.class}`}
                                </button>
                            ))}
                        </div>

                        {/* Main Content for Periods */}
                        <div className="w-3/4 p-6 overflow-y-auto bg-white">
                            {activeClassRoutine && (
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
                                        {activeClassRoutine.class} Schedule
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {activeClassRoutine.periods.slice(0, PERIOD_LABELS.length).map((period, pIdx) => (
                                            <div key={pIdx}>
                                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                                                    Period {PERIOD_LABELS[pIdx]}
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={period.subject || ''} 
                                                    onChange={e => handlePeriodChange(activeClassIndex, pIdx, e.target.value)}
                                                    className="form-input w-full"
                                                    placeholder="Subject (Teacher)"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSaving}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? <SpinnerIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
                            <span>Save Changes</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassRoutineModal;