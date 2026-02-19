
import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, Grade, SubjectAssignment, Syllabus, SyllabusTopic, GradeDefinition } from '../types';
import { BackIcon, HomeIcon, BookOpenIcon, PlusIcon, TrashIcon, CheckIcon, SpinnerIcon } from '../components/Icons';
import { GRADES_LIST } from '../constants';
import { normalizeSubjectName } from '../utils';

const { Link, useNavigate } = ReactRouterDOM as any;

interface ManageSyllabusPageProps {
    user: User;
    assignedGrade: Grade | null;
    assignedSubjects: SubjectAssignment[];
    onSave: (syllabus: Omit<Syllabus, 'id'>, id: string) => Promise<void>;
    allSyllabus: Syllabus[];
    gradeDefinitions: Record<Grade, GradeDefinition>;
}

const ManageSyllabusPage: React.FC<ManageSyllabusPageProps> = ({ user, assignedGrade, assignedSubjects, onSave, allSyllabus, gradeDefinitions }) => {
    const navigate = useNavigate();
    const [selectedGrade, setSelectedGrade] = useState<Grade | ''>(assignedGrade || '');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [topics, setTopics] = useState<SyllabusTopic[]>([]);
    const [newTopic, setNewTopic] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const availableGrades = useMemo(() => {
        if (user.role === 'admin') return GRADES_LIST;
        const grades = new Set<Grade>();
        if (assignedGrade) grades.add(assignedGrade);
        assignedSubjects.forEach(s => grades.add(s.grade));
        return Array.from(grades).sort((a, b) => GRADES_LIST.indexOf(a) - GRADES_LIST.indexOf(b));
    }, [user.role, assignedGrade, assignedSubjects]);

    const availableSubjects = useMemo(() => {
        if (!selectedGrade) return [];
        const subjectsForGrade = gradeDefinitions[selectedGrade]?.subjects || [];
        if (user.role === 'admin') return subjectsForGrade;
        if (user.role === 'user') {
            const teacherSubjects = assignedSubjects
                .filter(s => s.grade === selectedGrade)
                .map(s => normalizeSubjectName(s.subject));
            return subjectsForGrade.filter(sd => teacherSubjects.includes(normalizeSubjectName(sd.name)));
        }
        return [];
    }, [selectedGrade, gradeDefinitions, user.role, assignedSubjects]);

    useEffect(() => {
        if (availableGrades.length === 1 && !selectedGrade) setSelectedGrade(availableGrades[0]);
    }, [availableGrades, selectedGrade]);
    
    useEffect(() => {
        if (availableSubjects.length > 0 && !availableSubjects.some(s => s.name === selectedSubject)) {
            setSelectedSubject(availableSubjects[0]?.name || '');
        } else if (availableSubjects.length === 0) {
            setSelectedSubject('');
        }
    }, [availableSubjects, selectedSubject]);

    useEffect(() => {
        if (selectedGrade && selectedSubject) {
            const syllabusId = `${selectedGrade}-${selectedSubject}`;
            const existingSyllabus = allSyllabus.find(s => s.id === syllabusId);
            setTopics(existingSyllabus?.topics || []);
        } else {
            setTopics([]);
        }
    }, [selectedGrade, selectedSubject, allSyllabus]);
    
    const handleAddTopic = () => {
        if (newTopic.trim()) {
            setTopics(prev => [...prev, { name: newTopic.trim(), status: 'Not Started' }]);
            setNewTopic('');
        }
    };
    
    const handleRemoveTopic = (index: number) => {
        setTopics(prev => prev.filter((_, i) => i !== index));
    };

    const handleStatusChange = (index: number, status: SyllabusTopic['status']) => {
        setTopics(prev => prev.map((topic, i) => i === index ? { ...topic, status } : topic));
    };
    
    const handleSave = async () => {
        if (!selectedGrade || !selectedSubject) return;
        setIsSaving(true);
        const syllabusId = `${selectedGrade}-${selectedSubject}`;
        const dataToSave = { grade: selectedGrade, subject: selectedSubject, topics };
        await onSave(dataToSave, syllabusId);
        setIsSaving(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600"><BackIcon className="w-5 h-5"/> Back</button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600"><HomeIcon className="w-5 h-5"/> Home</Link>
            </div>
            <div className="flex items-center gap-3 mb-6">
                <BookOpenIcon className="w-10 h-10 text-violet-600"/>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Manage Syllabus</h1>
                    <p className="text-slate-600 mt-1">Update syllabus topics and track completion status.</p>
                </div>
            </div>

            <div className="p-4 bg-slate-50 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold">Class</label><select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value as Grade)} className="form-select w-full mt-1"><option value="">-- Select --</option>{availableGrades.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                <div><label className="block text-sm font-bold">Subject</label><select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="form-select w-full mt-1" disabled={!selectedGrade}><option value="">-- Select --</option>{availableSubjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}</select></div>
            </div>

            {selectedGrade && selectedSubject && (
                <div className="mt-6">
                    <div className="space-y-2">
                        {topics.map((topic, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                                <span className="flex-grow text-slate-800">{topic.name}</span>
                                <select value={topic.status} onChange={e => handleStatusChange(index, e.target.value as any)} className="form-select text-xs py-1">
                                    <option value="Not Started">Not Started</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <button onClick={() => handleRemoveTopic(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                        <input type="text" value={newTopic} onChange={e => setNewTopic(e.target.value)} className="form-input flex-grow" placeholder="Add new topic name..."/>
                        <button onClick={handleAddTopic} className="btn btn-secondary"><PlusIcon className="w-5 h-5"/></button>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
                            {isSaving && <SpinnerIcon className="w-5 h-5"/>}
                            {isSaving ? 'Saving...' : 'Save Syllabus'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSyllabusPage;
