import React, { useState, useEffect, useMemo } from 'react';
import { Staff, Grade, GradeDefinition, SubjectAssignment } from '@/types';
import { GRADES_LIST } from '@/constants';
import { 
    XIcon, 
    PlusIcon, 
    TrashIcon, 
    CheckIcon, 
    AcademicCapIcon, 
    BookOpenIcon, 
    SaveIcon, 
    SpinnerIcon, 
    SparklesIcon,
    ExclamationTriangleIcon
} from '@/components/Icons';
import PhotoWithFallback from '@/components/PhotoWithFallback';

interface TeacherSubjectAssignmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: Staff | null;
    gradeDefinitions: Record<Grade, GradeDefinition>;
    allStaff: Staff[];
    onSave: (teacherId: string, assignedSubjects: SubjectAssignment[], assignedGradeKey: Grade | null) => Promise<void>;
    isSaving?: boolean;
}

interface EditableAssignment {
    id: string;
    grade: Grade;
    subject: string;
    isCustom?: boolean;
}

export const TeacherSubjectAssignmentsModal: React.FC<TeacherSubjectAssignmentsModalProps> = ({
    isOpen,
    onClose,
    teacher,
    gradeDefinitions,
    allStaff,
    onSave,
    isSaving = false,
}) => {
    const [assignments, setAssignments] = useState<EditableAssignment[]>([]);
    const [assignedGradeKey, setAssignedGradeKey] = useState<Grade | null>(null);
    const [batchGrade, setBatchGrade] = useState<Grade>(Grade.IX);
    const [selectedBatchSubjects, setSelectedBatchSubjects] = useState<string[]>([]);
    const [showBatchAdd, setShowBatchAdd] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Identify current class teacher assignment for this teacher
    useEffect(() => {
        if (teacher && isOpen) {
            // Find if this teacher is currently assigned as class teacher
            const currentGrade = Object.entries(gradeDefinitions).find(
                ([, def]) => (def as GradeDefinition)?.classTeacherId === teacher.id
            )?.[0] as Grade | undefined;
            setAssignedGradeKey(currentGrade || null);

            // Populate existing assigned subjects
            const initialList: EditableAssignment[] = (teacher.assignedSubjects || []).map((a, idx) => ({
                id: `${a.grade}-${a.subject}-${idx}-${Date.now()}`,
                grade: a.grade,
                subject: a.subject,
            }));
            setAssignments(initialList);
            setSelectedBatchSubjects([]);
            setShowBatchAdd(false);
            setSaveError(null);
        }
    }, [teacher, isOpen, gradeDefinitions]);

    // Subjects available for a given grade
    const getAvailableSubjectsForGrade = (grade: Grade): string[] => {
        const set = new Set<string>();
        const defs = gradeDefinitions[grade]?.subjects || [];
        defs.forEach(s => {
            if (s.name) set.add(s.name.trim());
        });

        // Common defaults in Bethel Mission School curriculum if not defined
        const standardCurriculum: Record<string, string[]> = {
            [Grade.NURSERY]: ['ABC Oral', 'ABC Writing', 'Numbers Oral', 'Numbers Writing', 'Rhyme', 'Conversation', 'Drawing'],
            [Grade.KINDERGARTEN]: ['English I', 'English II', 'Maths', 'Writing', 'Spellings', 'Rhymes', 'Conversation', 'Drawing'],
            [Grade.I]: ['English', 'Mizo', 'Mathematics', 'EVS', 'Cursive', 'Drawing'],
            [Grade.II]: ['ENG-I', 'ENG-II', 'MIZO', 'MATH', 'Spellings', 'Hindi', 'Cursive', 'Drawing'],
            [Grade.III]: ['English I', 'English II', 'Mizo', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Computer'],
            [Grade.IV]: ['English I', 'English II', 'Mizo', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Computer'],
            [Grade.V]: ['English I', 'English II', 'Mizo', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Computer'],
            [Grade.VI]: ['English', 'Mizo', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer'],
            [Grade.VII]: ['English', 'Mizo', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer'],
            [Grade.VIII]: ['English', 'Mizo', 'Mathematics', 'Science', 'Social Science', 'Hindi'],
            [Grade.IX]: ['English', 'Mizo', 'Mathematics', 'Science', 'Social Science', 'Hindi'],
            [Grade.X]: ['English', 'Mizo', 'Mathematics', 'Science', 'Social Science', 'Hindi'],
        };

        const std = standardCurriculum[grade] || [];
        std.forEach(s => set.add(s));

        return Array.from(set);
    };

    // Current batch available subjects
    const batchAvailableSubjects = useMemo(() => {
        return getAvailableSubjectsForGrade(batchGrade);
    }, [batchGrade, gradeDefinitions]);

    // Class teacher conflicts detection
    const classTeacherConflict = useMemo(() => {
        if (!assignedGradeKey || !teacher) return null;
        const currentAssigneeId = gradeDefinitions[assignedGradeKey]?.classTeacherId;
        if (currentAssigneeId && currentAssigneeId !== teacher.id) {
            const assigneeStaff = allStaff.find(s => s.id === currentAssigneeId);
            return assigneeStaff ? `${assigneeStaff.firstName} ${assigneeStaff.lastName}` : 'Another teacher';
        }
        return null;
    }, [assignedGradeKey, teacher, gradeDefinitions, allStaff]);

    // Unique classes taught summary
    const uniqueClassesTaught = useMemo(() => {
        const classes = new Set<string>();
        assignments.forEach(a => {
            if (a.grade && a.subject.trim()) {
                classes.add(a.grade);
            }
        });
        return Array.from(classes);
    }, [assignments]);

    // Handlers
    const handleAddRow = (grade?: Grade) => {
        const targetGrade = grade || batchGrade || GRADES_LIST[0];
        const avail = getAvailableSubjectsForGrade(targetGrade);
        const newAssignment: EditableAssignment = {
            id: `new-${Date.now()}-${Math.random()}`,
            grade: targetGrade,
            subject: avail[0] || '',
        };
        setAssignments(prev => [...prev, newAssignment]);
    };

    const handleUpdateRow = (id: string, updates: Partial<EditableAssignment>) => {
        setAssignments(prev => prev.map(item => {
            if (item.id !== id) return item;
            const updated = { ...item, ...updates };
            // If grade changed, reset subject to first available or keep if valid
            if (updates.grade && updates.grade !== item.grade) {
                const avail = getAvailableSubjectsForGrade(updates.grade);
                updated.subject = avail[0] || '';
            }
            return updated;
        }));
    };

    const handleRemoveRow = (id: string) => {
        setAssignments(prev => prev.filter(item => item.id !== id));
    };

    const handleBatchCheckboxToggle = (subj: string) => {
        setSelectedBatchSubjects(prev => 
            prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]
        );
    };

    const handleApplyBatchAdd = () => {
        if (selectedBatchSubjects.length === 0) return;
        const newItems: EditableAssignment[] = selectedBatchSubjects.map(sub => ({
            id: `batch-${batchGrade}-${sub}-${Date.now()}-${Math.random()}`,
            grade: batchGrade,
            subject: sub
        }));

        // Avoid adding duplicate {grade, subject}
        setAssignments(prev => {
            const existingSet = new Set(prev.map(p => `${p.grade}:::${p.subject.trim().toLowerCase()}`));
            const filteredNew = newItems.filter(n => !existingSet.has(`${n.grade}:::${n.subject.trim().toLowerCase()}`));
            return [...prev, ...filteredNew];
        });

        setSelectedBatchSubjects([]);
        setShowBatchAdd(false);
    };

    const handleDuplicateToClass = (item: EditableAssignment, targetGrade: Grade) => {
        if (!item.subject.trim()) return;
        const exists = assignments.some(a => a.grade === targetGrade && a.subject.trim().toLowerCase() === item.subject.trim().toLowerCase());
        if (exists) {
            alert(`This teacher is already assigned to ${item.subject} for ${targetGrade}.`);
            return;
        }
        const newAssignment: EditableAssignment = {
            id: `dup-${targetGrade}-${item.subject}-${Date.now()}`,
            grade: targetGrade,
            subject: item.subject,
        };
        setAssignments(prev => [...prev, newAssignment]);
    };

    const handleSave = async () => {
        if (!teacher) return;
        setSaveError(null);

        // Clean and deduplicate assignments
        const cleanList: SubjectAssignment[] = [];
        const seen = new Set<string>();

        for (const item of assignments) {
            const trimmedSubject = item.subject.trim();
            if (!trimmedSubject) continue; // Skip empty rows
            const key = `${item.grade}:::${trimmedSubject.toLowerCase()}`;
            if (!seen.has(key)) {
                seen.add(key);
                cleanList.push({
                    grade: item.grade,
                    subject: trimmedSubject
                });
            }
        }

        try {
            await onSave(teacher.id, cleanList, assignedGradeKey);
            onClose();
        } catch (err: any) {
            console.error("Failed to save teacher assignments:", err);
            setSaveError(err?.message || "Failed to update assignments. Please check permissions and try again.");
        }
    };

    if (!isOpen || !teacher) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] my-auto animate-fade-in">
                
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between relative border-b border-indigo-800/40">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full border-2 border-indigo-300/40 overflow-hidden shadow-md shrink-0 bg-slate-800">
                            <PhotoWithFallback 
                                src={teacher.photographUrl} 
                                alt={`${teacher.firstName} ${teacher.lastName}`}
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-white tracking-tight">
                                    {teacher.firstName} {teacher.lastName}
                                </h2>
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                                    {teacher.staffType}
                                </span>
                            </div>
                            <p className="text-xs text-indigo-200/80 mt-0.5 flex items-center gap-3">
                                <span>{teacher.designation} • {teacher.department}</span>
                                {teacher.employeeId && (
                                    <span className="bg-slate-800/80 px-2 py-0.5 rounded font-mono text-[11px] text-slate-300">
                                        ID: {teacher.employeeId}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                        title="Close Modal"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
                    
                    {saveError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 shrink-0 text-red-500" />
                            <span>{saveError}</span>
                        </div>
                    )}

                    {/* Section 1: Designated Class Teacher Assignment */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <AcademicCapIcon className="w-4 h-4 text-indigo-600" />
                                Primary Class Teacher Allocation (Class Taught)
                            </label>
                            {assignedGradeKey && (
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                                    Class Teacher of {assignedGradeKey}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                            Designates this teacher as the primary Class Teacher in charge of student attendance, conduct, and class reports.
                        </p>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <select
                                value={assignedGradeKey || ''}
                                onChange={(e) => setAssignedGradeKey(e.target.value ? (e.target.value as Grade) : null)}
                                className="w-full sm:w-72 bg-white border border-slate-300 rounded-lg text-sm px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">-- Not a Class Teacher --</option>
                                {GRADES_LIST.map(g => (
                                    <option key={g} value={g}>Class Teacher of {g}</option>
                                ))}
                            </select>

                            {assignedGradeKey && (
                                <button
                                    type="button"
                                    onClick={() => setAssignedGradeKey(null)}
                                    className="text-xs font-semibold text-slate-600 hover:text-red-600 px-3 py-2 rounded-lg border border-slate-200 hover:border-red-200 bg-slate-50 transition cursor-pointer"
                                >
                                    Clear Class Teacher Role
                                </button>
                            )}
                        </div>

                        {classTeacherConflict && (
                            <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200/70 p-2.5 rounded-lg flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4 shrink-0 text-amber-600" />
                                <span>
                                    Note: <strong>{classTeacherConflict}</strong> is currently assigned as Class Teacher for {assignedGradeKey}. Saving will reassign this class to {teacher.firstName}.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Assigned Subjects & Classes */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <BookOpenIcon className="w-4 h-4 text-indigo-600" />
                                    Classes &amp; Subjects Taught ({assignments.length})
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {uniqueClassesTaught.length > 0 
                                        ? `Teaching across ${uniqueClassesTaught.length} classes: ${uniqueClassesTaught.join(', ')}`
                                        : 'No classes or subjects allocated yet.'}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowBatchAdd(prev => !prev)}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    <SparklesIcon className="w-3.5 h-3.5" />
                                    {showBatchAdd ? 'Hide Batch Add' : 'Batch Add by Class'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAddRow()}
                                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    <PlusIcon className="w-3.5 h-3.5" />
                                    Add Subject
                                </button>
                            </div>
                        </div>

                        {/* Batch Add Panel */}
                        {showBatchAdd && (
                            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3 animate-fade-in">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                                        Quick Batch Selection by Class:
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-slate-600 font-medium">Select Class:</label>
                                        <select
                                            value={batchGrade}
                                            onChange={(e) => {
                                                setBatchGrade(e.target.value as Grade);
                                                setSelectedBatchSubjects([]);
                                            }}
                                            className="bg-white border border-indigo-200 rounded-lg text-xs px-2.5 py-1 font-semibold text-indigo-950"
                                        >
                                            {GRADES_LIST.map(g => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    {batchAvailableSubjects.map(sub => {
                                        const isSelected = selectedBatchSubjects.includes(sub);
                                        const isAlreadyAssigned = assignments.some(
                                            a => a.grade === batchGrade && a.subject.trim().toLowerCase() === sub.toLowerCase()
                                        );
                                        return (
                                            <button
                                                key={sub}
                                                type="button"
                                                onClick={() => !isAlreadyAssigned && handleBatchCheckboxToggle(sub)}
                                                disabled={isAlreadyAssigned}
                                                className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition cursor-pointer ${
                                                    isAlreadyAssigned
                                                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                                                        : isSelected
                                                        ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-xs'
                                                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                                                }`}
                                            >
                                                {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                                                {sub} {isAlreadyAssigned && '(Added)'}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-indigo-100 text-xs">
                                    <span className="text-slate-600">
                                        {selectedBatchSubjects.length} subject(s) selected for {batchGrade}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleApplyBatchAdd}
                                        disabled={selectedBatchSubjects.length === 0}
                                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-lg text-xs shadow-xs transition cursor-pointer"
                                    >
                                        Add Selected to Teacher
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* List of Current Subject Assignments */}
                        {assignments.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                                <BookOpenIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="text-sm font-semibold text-slate-600">No classes or subjects currently assigned</p>
                                <p className="text-xs text-slate-400 mt-0.5">Click "+ Add Subject" or use "Batch Add by Class" above to assign teaching subjects.</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                                {assignments.map((item, index) => {
                                    const availableSubjects = getAvailableSubjectsForGrade(item.grade);
                                    const isCustomValue = !availableSubjects.includes(item.subject) && item.subject.trim() !== '';

                                    return (
                                        <div
                                            key={item.id}
                                            className="p-3 bg-slate-50/80 hover:bg-slate-100/90 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 transition"
                                        >
                                            {/* Index Indicator */}
                                            <span className="text-[11px] font-mono text-slate-600 w-5 text-center hidden sm:inline-block">
                                                {index + 1}.
                                            </span>

                                            {/* Grade / Class Selector */}
                                            <div className="w-full sm:w-44">
                                                <select
                                                    value={item.grade}
                                                    onChange={(e) => handleUpdateRow(item.id, { grade: e.target.value as Grade })}
                                                    className="w-full bg-white border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    {GRADES_LIST.map(g => (
                                                        <option key={g} value={g}>{g}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Subject Selector or Custom Input */}
                                            <div className="flex-1 flex items-center gap-2">
                                                {item.isCustom ? (
                                                    <div className="flex-1 flex items-center gap-1.5">
                                                        <input
                                                            type="text"
                                                            value={item.subject}
                                                            onChange={(e) => handleUpdateRow(item.id, { subject: e.target.value })}
                                                            placeholder="Type custom subject name..."
                                                            className="flex-1 bg-white border border-indigo-300 rounded-lg text-xs px-3 py-1.5 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                                                            autoFocus
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateRow(item.id, { isCustom: false })}
                                                            className="text-[11px] text-indigo-600 hover:underline px-1.5 py-1 whitespace-nowrap cursor-pointer"
                                                            title="Pick from standard list"
                                                        >
                                                            List
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 flex items-center gap-1.5">
                                                        <select
                                                            value={isCustomValue ? '__custom__' : item.subject}
                                                            onChange={(e) => {
                                                                if (e.target.value === '__custom__') {
                                                                    handleUpdateRow(item.id, { isCustom: true });
                                                                } else {
                                                                    handleUpdateRow(item.id, { subject: e.target.value });
                                                                }
                                                            }}
                                                            className="flex-1 bg-white border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                                        >
                                                            <option value="" disabled>-- Select Subject --</option>
                                                            {availableSubjects.map(sub => (
                                                                <option key={sub} value={sub}>{sub}</option>
                                                            ))}
                                                            {isCustomValue && (
                                                                <option value="__custom__">Custom: {item.subject}</option>
                                                            )}
                                                            <option value="__custom__">+ Type Custom Subject...</option>
                                                        </select>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateRow(item.id, { isCustom: true })}
                                                            className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600 hover:text-slate-900 hover:border-slate-300 cursor-pointer"
                                                            title="Type custom subject"
                                                        >
                                                            Custom
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quick Actions per Row */}
                                            <div className="flex items-center justify-end gap-1.5 shrink-0">
                                                {/* Duplicate to next grade shortcut */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const currentIndex = GRADES_LIST.indexOf(item.grade);
                                                        if (currentIndex < GRADES_LIST.length - 1) {
                                                            handleDuplicateToClass(item, GRADES_LIST[currentIndex + 1]);
                                                        } else if (currentIndex > 0) {
                                                            handleDuplicateToClass(item, GRADES_LIST[currentIndex - 1]);
                                                        }
                                                    }}
                                                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                                                    title="Copy subject to adjacent class"
                                                >
                                                    <PlusIcon className="w-3.5 h-3.5" />
                                                </button>

                                                {/* Delete Row */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveRow(item.id)}
                                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                                    title="Remove this assignment"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {assignments.length > 0 && (
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                                <button
                                    type="button"
                                    onClick={() => handleAddRow()}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                                >
                                    <PlusIcon className="w-3.5 h-3.5" />
                                    Add Another Subject
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm("Are you sure you want to clear all subject assignments for this teacher?")) {
                                            setAssignments([]);
                                        }
                                    }}
                                    className="text-xs font-semibold text-slate-400 hover:text-red-600 transition cursor-pointer"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                        Total: <strong className="text-slate-800">{assignments.filter(a => a.subject.trim()).length}</strong> subject assignment(s)
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                        >
                            {isSaving ? (
                                <>
                                    <SpinnerIcon className="w-4 h-4 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <SaveIcon className="w-4 h-4" />
                                    <span>Save Assignments</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TeacherSubjectAssignmentsModal;
