
import React, { useState, useMemo } from 'react';
import { Student, Grade, GradeDefinition } from '@/types';
import { db } from '@/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getNextGrade, formatStudentId, calculateStudentResult } from '@/utils';
import { XIcon, SearchIcon, SpinnerIcon, UserIcon, CheckCircleIcon, XCircleIcon } from '@/components/Icons';
import StudentFormModal from './StudentFormModal';

interface ImportFromPreviousYearModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (studentData: Omit<Student, 'id'>) => Promise<void>;
    currentAcademicYear: string;
    gradeDefinitions: Record<Grade, GradeDefinition>;
    currentStudents: Student[];
}

const ImportFromPreviousYearModal: React.FC<ImportFromPreviousYearModalProps> = ({
    isOpen,
    onClose,
    onImport,
    currentAcademicYear,
    gradeDefinitions,
    currentStudents
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Student[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const previousYear = useMemo(() => {
        const parts = currentAcademicYear.split('-');
        if (parts.length !== 2) return "2025-26";
        const start = parseInt(parts[0], 10);
        const end = parseInt(parts[1], 10);
        if (isNaN(start) || isNaN(end)) return "2025-26";
        return `${start - 1}-${String(end - 1).padStart(2, '0')}`;
    }, [currentAcademicYear]);

    const getImportedClass = (student: Student) => {
        const imported = currentStudents.find(cs => {
            if (student.aadhaarNumber && cs.aadhaarNumber === student.aadhaarNumber) return true;
            if (student.pen && cs.pen === student.pen) return true;
            if (student.name === cs.name && student.fatherName === cs.fatherName && student.dateOfBirth === cs.dateOfBirth) return true;
            return false;
        });
        return imported ? imported.grade : null;
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setIsSearching(true);
        try {
            // Fetch students from the previous year
            const q = query(
                collection(db, 'students'),
                where('academicYear', '==', previousYear)
            );
            const snapshot = await getDocs(q);
            
            const results = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Student))
                .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
            
            setSearchResults(results);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectStudent = (student: Student, isPromoted: boolean) => {
        // Prepare student for current year
        const targetGrade = isPromoted ? (getNextGrade(student.grade) || student.grade) : student.grade;
        
        // We reset rollNo and studentId to let the user edit them for the new year
        // We also reset feePayments and academicPerformance
        const preparedStudent: Student = {
            ...student,
            grade: targetGrade,
            academicYear: currentAcademicYear,
            rollNo: 0, 
            studentId: '', 
            feePayments: {
                admissionFeePaid: true, // Assuming they are existing students
                tuitionFeesPaid: {},
                examFeesPaid: { terminal1: false, terminal2: false, terminal3: false }
            },
            academicPerformance: [] 
        };
        setSelectedStudent(preparedStudent);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (data: Omit<Student, 'id'>) => {
        setIsSaving(true);
        try {
            await onImport(data);
            setIsFormOpen(false);
            onClose();
        } catch (error) {
            console.error("Import failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col h-full max-h-[80vh]" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">Import from Previous Year ({previousYear})</h2>
                        <button onClick={onClose} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"><XIcon className="w-5 h-5"/></button>
                    </div>

                    <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                        <p className="text-sm text-slate-600">
                            Search for a student from the previous academic year to enroll them in the next class for {currentAcademicYear}.
                        </p>
                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search student name..." 
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <button 
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="bg-sky-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-sky-700 disabled:bg-slate-400 flex items-center gap-2"
                            >
                                {isSearching ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <SearchIcon className="w-5 h-5" />}
                                Search
                            </button>
                        </div>

                        <div className="space-y-2">
                            {searchResults.length > 0 ? (
                                searchResults.map(student => {
                                    const importedClass = getImportedClass(student);
                                    return (
                                    <div key={student.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${importedClass ? 'bg-slate-50 opacity-75' : 'hover:bg-slate-50'}`}>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{student.name}</h4>
                                            <p className="text-sm text-slate-500">
                                                {student.grade} ({student.academicYear}) • Roll No: {student.rollNo}
                                            </p>
                                            <p className="text-xs text-slate-400">Father: {student.fatherName}</p>
                                            
                                            {/* Result Display */}
                                            {(() => {
                                                const result = calculateStudentResult(student, gradeDefinitions[student.grade]);
                                                return (
                                                    <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${result === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                        {result === 'PASS' ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
                                                        Result: {result}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                                            {importedClass ? (
                                                <span className="text-sm font-semibold text-slate-500 bg-slate-200 px-3 py-1.5 rounded-lg">
                                                    Already imported to {importedClass}
                                                </span>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => handleSelectStudent(student, true)}
                                                        className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${calculateStudentResult(student, gradeDefinitions[student.grade]) === 'PASS' ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                                    >
                                                        Promote to {getNextGrade(student.grade) || 'Next Class'}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSelectStudent(student, false)}
                                                        className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${calculateStudentResult(student, gradeDefinitions[student.grade]) === 'FAIL' ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                                                    >
                                                        Detain in {student.grade}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )})
                            ) : searchTerm && !isSearching ? (
                                <p className="text-center text-slate-500 py-8">No students found for "{searchTerm}" in {previousYear}.</p>
                            ) : (
                                <p className="text-center text-slate-500 py-8 italic">Enter a name to search students from the previous academic year.</p>
                            )}
                        </div>
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end rounded-b-xl">
                        <button onClick={onClose} className="btn btn-secondary">Close</button>
                    </div>
                </div>
            </div>

            {isFormOpen && selectedStudent && (
                <StudentFormModal 
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={handleFormSubmit}
                    student={selectedStudent}
                    academicYear={currentAcademicYear}
                    isSaving={isSaving}
                    title="Import Student Details"
                />
            )}
        </>
    );
};

export default ImportFromPreviousYearModal;
