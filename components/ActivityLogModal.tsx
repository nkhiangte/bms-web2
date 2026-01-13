
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ActivityLog, Assessment } from '../types';
import { XIcon, PlusIcon, TrashIcon } from './Icons';

interface ActivityLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogChange: (log: ActivityLog) => void;
    studentName: string;
    examName: string;
    subjectName: string;
    initialLog?: ActivityLog;
    onNavigate: (direction: 'next' | 'prev') => void;
    canNavigatePrev: boolean;
    canNavigateNext: boolean;
}

const defaultComponentLog = { assessments: [{ marksObtained: null, maxMarks: null }], weightage: 0, scaledMarks: 0 };

const defaultLog: ActivityLog = {
    classTest: { ...defaultComponentLog, weightage: 20, assessments: [{ marksObtained: null, maxMarks: 20 }] },
    homework: { ...defaultComponentLog, weightage: 10, assessments: [{ marksObtained: null, maxMarks: 10 }] },
    project: { ...defaultComponentLog, weightage: 10, assessments: [{ marksObtained: null, maxMarks: 10 }] },
};

const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ isOpen, onClose, onLogChange, studentName, examName, subjectName, initialLog, onNavigate, canNavigatePrev, canNavigateNext }) => {
    
    const [log, setLog] = useState<ActivityLog>(defaultLog);
    
    useEffect(() => {
        if (isOpen) {
            setLog(initialLog || JSON.parse(JSON.stringify(defaultLog)));
        }
    }, [isOpen, initialLog]);

    const calculateScaledMarks = (assessments: Assessment[], weightage: number) => {
        const totalObtained = assessments.reduce((sum, a) => sum + (a.marksObtained || 0), 0);
        const totalMax = assessments.reduce((sum, a) => sum + (a.maxMarks || 0), 0);
        if (totalMax === 0 || weightage === 0) return 0;
        return (totalObtained / totalMax) * weightage;
    };

    const updateLogAndNotify = (newLog: ActivityLog) => {
        setLog(newLog);
        onLogChange(newLog);
    }

    const handleComponentChange = (component: keyof ActivityLog, field: 'weightage', value: string) => {
        if (!/^\d*$/.test(value)) return;
        const numValue = parseInt(value, 10) || 0;
    
        const newLog = JSON.parse(JSON.stringify(log));
        const newComponentLog = newLog[component];
        newComponentLog[field] = numValue;
        newComponentLog.scaledMarks = calculateScaledMarks(newComponentLog.assessments, newComponentLog.weightage);
        updateLogAndNotify(newLog);
    };
    
    const handleAssessmentChange = (component: keyof ActivityLog, index: number, field: keyof Assessment, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const numValue = value === '' ? null : parseInt(value, 10);
        
        const newLog = JSON.parse(JSON.stringify(log));
        const assessments = newLog[component].assessments;
        assessments[index][field] = numValue;
        newLog[component].scaledMarks = calculateScaledMarks(assessments, newLog[component].weightage);
        updateLogAndNotify(newLog);
    };
    
    const handleAddAssessment = (component: keyof ActivityLog) => {
        const newLog = JSON.parse(JSON.stringify(log));
        // Default max marks: 20 for class tests, 10 for others
        const max = component === 'classTest' ? 20 : 10;
        newLog[component].assessments.push({ marksObtained: null, maxMarks: max });
        updateLogAndNotify(newLog);
    };

    const handleRemoveAssessment = (component: keyof ActivityLog, index: number) => {
        const newLog = JSON.parse(JSON.stringify(log));
        const assessments = newLog[component].assessments.filter((_: any, i: number) => i !== index);
        newLog[component].assessments = assessments;
        newLog[component].scaledMarks = calculateScaledMarks(assessments, newLog[component].weightage);
        updateLogAndNotify(newLog);
    }

    const totalActivityMarks = useMemo(() => {
        return Math.round((log.classTest.scaledMarks || 0) + (log.homework.scaledMarks || 0) + (log.project.scaledMarks || 0));
    }, [log]);


    const renderComponentEditor = (component: keyof ActivityLog, title: string) => (
        <div className="bg-slate-50 p-3 rounded-lg border">
            <h4 className="font-bold text-slate-800">{title}</h4>
            <div className="mt-2 grid grid-cols-5 gap-2 items-center">
                <div className="col-span-3">
                     {log[component].assessments.map((asm, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                             <input type="tel" pattern="[0-9]*" value={asm.marksObtained ?? ''} onChange={e => handleAssessmentChange(component, index, 'marksObtained', e.target.value)} className="form-input w-full text-center" placeholder="Marks" />
                             <span className="font-bold">/</span>
                             <input type="tel" pattern="[0-9]*" value={asm.maxMarks ?? ''} onChange={e => handleAssessmentChange(component, index, 'maxMarks', e.target.value)} className="form-input w-full text-center" placeholder="Max" />
                             <button type="button" onClick={() => handleRemoveAssessment(component, index)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                     ))}
                     <button type="button" onClick={() => handleAddAssessment(component)} className="text-xs btn btn-secondary !py-1 mt-1"><PlusIcon className="w-3 h-3"/> Add Test</button>
                </div>
                <div className="text-center">
                    <label className="text-xs font-semibold block mb-1">Weightage</label>
                    <input type="tel" pattern="[0-9]*" value={log[component].weightage} onChange={e => handleComponentChange(component, 'weightage', e.target.value)} className="form-input w-full text-center" />
                </div>
                 <div className="text-center">
                    <label className="text-xs font-semibold block mb-1">Scaled</label>
                    <div className="font-bold text-lg text-sky-700">{log[component].scaledMarks.toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
    

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col h-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-slate-800">Activity Log for {subjectName}</h2>
                    <p className="text-sm text-slate-600">{studentName} - {examName}</p>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                    {renderComponentEditor('classTest', 'Class Test')}
                    {renderComponentEditor('homework', 'Homework/Assignment')}
                    {renderComponentEditor('project', 'Project/Practical')}
                </div>
                 <div className="bg-slate-100 px-6 py-4 flex justify-between items-center rounded-b-xl border-t">
                    <div className="flex gap-2">
                        <button type="button" onClick={() => onNavigate('prev')} disabled={!canNavigatePrev} className="btn btn-secondary">
                            &larr; Previous
                        </button>
                        <button type="button" onClick={() => onNavigate('next')} disabled={!canNavigateNext} className="btn btn-secondary">
                            Next &rarr;
                        </button>
                    </div>
                    <div className="font-bold text-lg">
                        Total Activity Marks: <span className="text-sky-700">{totalActivityMarks}</span>
                    </div>
                    <button type="button" onClick={onClose} className="btn btn-primary">Close</button>
                 </div>
            </div>
        </div>
    );
};

export default ActivityLogModal;
