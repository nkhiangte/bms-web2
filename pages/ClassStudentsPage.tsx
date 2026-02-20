


import React, { useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Student, Grade, GradeDefinition, Staff, User, FeePayments, FeeStructure, StudentStatus } from '../types';
import { BackIcon, HomeIcon, TrashIcon, PlusIcon, MessageIcon, WhatsappIcon, UserIcon, CurrencyDollarIcon, ArrowUpOnSquareIcon, CalendarDaysIcon } from '../components/Icons';
import { formatStudentId, calculateDues, formatPhoneNumberForWhatsApp } from '../utils';
import PhotoWithFallback from '../components/PhotoWithFallback';
import { ImportStudentsModal } from '../components/ImportStudentsModal';
import ConfirmationModal from '../components/ConfirmationModal';
import ExamFeeCollectionModal from '../components/ExamFeeCollectionModal';
import StudentFormModal from '../components/StudentFormModal'; 

const { Link, useNavigate, useParams } = ReactRouterDOM;

interface ClassStudentsPageProps {
  students: Student[];
  staff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  onUpdateClassTeacher: (grade: Grade, teacherId: string | undefined) => void;
  academicYear: string;
  onOpenImportModal: (grade: Grade | null) => void;
  onDelete: (student: Student) => Promise<void>;
  user: User;
  assignedGrade: Grade | null;
  onAddStudentToClass: (studentData: Omit<Student, 'id'>) => Promise<void>;
  onUpdateBulkFeePayments: (updates: Array<{ studentId: string; payments: FeePayments }>) => Promise<void>;
  feeStructure: FeeStructure;
}

const ClassStudentsPage: React.FC<ClassStudentsPageProps> = ({
    students,
    staff,
    gradeDefinitions,
    onUpdateClassTeacher,
    academicYear,
    onOpenImportModal,
    onDelete,
    user,
    assignedGrade,
    onAddStudentToClass,
    onUpdateBulkFeePayments,
    feeStructure
}) => {
    const { grade: encodedGrade } = useParams();
    const grade = encodedGrade ? decodeURIComponent(encodedGrade) as Grade : undefined;
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [isSavingStudent, setIsSavingStudent] = useState(false);
    const [isExamFeeModalOpen, setIsExamFeeModalOpen] = useState(false);

    const classStudents = useMemo(() => {
        if (!grade) return [];
        return students
            .filter(s => {
                const studentYear = s.academicYear || '2025-2026'; // Fallback for legacy data
                return s.grade === grade && s.status === StudentStatus.ACTIVE && studentYear === academicYear;
            })
            .sort((a, b) => a.rollNo - b.rollNo);
    }, [students, grade, academicYear]);

    const filteredStudents = useMemo(() => {
        return classStudents.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            formatStudentId(s, academicYear).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [classStudents, searchTerm, academicYear]);

    const gradeDef = grade ? gradeDefinitions[grade] : undefined;
    const currentClassTeacher = staff.find(s => s.id === gradeDef?.classTeacherId);

    const stats = useMemo(() => {
        const boys = classStudents.filter(s => s.gender === 'Male').length;
        const girls = classStudents.filter(s => s.gender === 'Female').length;
        return { boys, girls, total: classStudents.length };
    }, [classStudents]);

    const isAdmin = user.role === 'admin';
    const isClassTeacher = isAdmin || (user.role === 'user' && assignedGrade === grade);

    if (!grade) return <div>Invalid Class</div>;

    const handleImportStudents = async (importedStudents: Omit<Student, 'id'>[], targetGrade: Grade) => {
        setIsImporting(true);
        try {
            // Bulk add students
            const addPromises = importedStudents.map(s => onAddStudentToClass(s));
            await Promise.all(addPromises);
            alert(`Successfully imported ${importedStudents.length} students to ${targetGrade}.`);
            setIsImportModalOpen(false);
        } catch (error) {
            console.error("Error importing students:", error);
            alert("Failed to import students. Please check console for details.");
        } finally {
            setIsImporting(false);
        }
    };

    const handleDeleteClick = (student: Student) => {
        setStudentToDelete(student);
        setIsConfirmDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (studentToDelete) {
            await onDelete(studentToDelete);
            setStudentToDelete(null);
            setIsConfirmDeleteModalOpen(false);
        }
    };

    const handleAddStudentSubmit = async (studentData: Omit<Student, 'id'>) => {
        setIsSavingStudent(true);
        try {
            await onAddStudentToClass(studentData);
            setIsAddStudentModalOpen(false);
        } catch (error) {
            console.error("Error adding student:", error);
            alert("Failed to add student. Please try again.");
        } finally {
            setIsSavingStudent(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                     <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                        <BackIcon className="w-5 h-5" /> Back
                    </button>
                    <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home">
                        <HomeIcon className="w-5 h-5" /> Home
                    </Link>
                </div>

                {/* Title & Teacher */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">{grade} <span className="text-lg font-normal text-slate-500">({academicYear})</span></h1>
                        <div className="flex items-center gap-2 mt-2 text-slate-600">
                            <UserIcon className="w-5 h-5" />
                            <span className="font-semibold">Class Teacher:</span>
                            {isAdmin ? (
                                <select
                                    value={currentClassTeacher?.id || ''}
                                    onChange={(e) => onUpdateClassTeacher(grade, e.target.value || undefined)}
                                    className="form-select py-1 px-2 text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                                >
                                    <option value="">-- Assign Teacher --</option>
                                    {staff.filter(s => s.staffType === 'Teaching').map(s => (
                                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                    ))}
                                </select>
                            ) : (
                                <span>{currentClassTeacher ? `${currentClassTeacher.firstName} ${currentClassTeacher.lastName}` : 'Not Assigned'}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold">Boys: {stats.boys}</div>
                        <div className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full font-semibold">Girls: {stats.girls}</div>
                        <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-semibold">Total: {stats.total}</div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search student..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input w-full sm:w-64"
                    />
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                        {isAdmin && (
                            <button onClick={() => setIsImportModalOpen(true)} className="btn btn-secondary whitespace-nowrap">
                                <ArrowUpOnSquareIcon className="w-5 h-5"/> Import
                            </button>
                        )}
                        {(isAdmin || isClassTeacher) && (
                            <>
                                <button onClick={() => setIsExamFeeModalOpen(true)} className="btn btn-secondary whitespace-nowrap">
                                    <CurrencyDollarIcon className="w-5 h-5"/> Exam Fees
                                </button>
                                <Link to={`/portal/classes/${encodeURIComponent(grade)}/attendance`} className="btn btn-secondary whitespace-nowrap">
                                    <CalendarDaysIcon className="w-5 h-5"/> Attendance
                                </Link>
                                <button onClick={() => setIsAddStudentModalOpen(true)} className="btn btn-primary whitespace-nowrap">
                                    <PlusIcon className="w-5 h-5"/> Add Student
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Students List */}
                {filteredStudents.length === 0 ? (
                     <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                        <p className="text-slate-700 text-lg font-semibold">No students found for {academicYear}.</p>
                        <p className="text-slate-500">Students will appear here after promotion or new admission.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredStudents.map(student => {
                            const dues = calculateDues(student, feeStructure);
                            return (
                                <div key={student.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs sm:text-sm flex-shrink-0">
                                            {student.rollNo}
                                        </div>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-slate-100">
                                            <PhotoWithFallback src={student.photographUrl} alt={student.name} />
                                        </div>
                                        <div>
                                            <Link to={`/portal/student/${student.id}`} className="font-bold text-base sm:text-lg text-sky-700 hover:underline block">{student.name}</Link>
                                            <div className="text-xs sm:text-sm text-slate-500 flex flex-col sm:flex-row sm:gap-4">
                                                <span>ID: {formatStudentId(student, academicYear)}</span>
                                                <span>Parent: {student.fatherName}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        {dues.length > 0 && (
                                            <Link to="/portal/fees" state={{ studentId: student.id }} className="flex items-center gap-1 text-xs px-3 py-1 bg-amber-50 text-amber-700 font-semibold rounded-full hover:bg-amber-100">
                                                <CurrencyDollarIcon className="w-4 h-4"/> {dues.length} Dues
                                            </Link>
                                        )}
                                         <div className="flex items-center gap-2">
                                             {student.contact && (
                                                 <>
                                                    <a href={`https://wa.me/${formatPhoneNumberForWhatsApp(student.contact)}`} target="_blank" rel="noopener noreferrer" className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-full">
                                                        <WhatsappIcon className="w-5 h-5"/>
                                                    </a>
                                                    <a href={`tel:${student.contact}`} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full">
                                                        <MessageIcon className="w-5 h-5"/>
                                                    </a>
                                                 </>
                                             )}
                                             {isAdmin && (
                                                <button onClick={() => handleDeleteClick(student)} className="p-2 text-red-600 hover:bg-red-100 rounded-full">
                                                    <TrashIcon className="w-5 h-5"/>
                                                </button>
                                             )}
                                         </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ImportStudentsModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportStudents}
                grade={grade}
                allStudents={classStudents}
                allGrades={[grade]} // Only allow importing into the current grade
                isImporting={isImporting}
                academicYear={academicYear}
            />
            <ConfirmationModal
                isOpen={isConfirmDeleteModalOpen}
                onClose={() => setIsConfirmDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Student Deletion"
            >
                <p>Are you sure you want to remove <span className="font-bold">{studentToDelete?.name}</span> from the active student list? This will mark the student as 'Dropped'.</p>
            </ConfirmationModal>

            {grade && (
                <StudentFormModal
                    isOpen={isAddStudentModalOpen}
                    onClose={() => setIsAddStudentModalOpen(false)}
                    onSubmit={handleAddStudentSubmit}
                    student={null}
                    newStudentTargetGrade={grade}
                    academicYear={academicYear}
                    isSaving={isSavingStudent}
                />
            )}
            {grade && (
                <ExamFeeCollectionModal
                    isOpen={isExamFeeModalOpen}
                    onClose={() => setIsExamFeeModalOpen(false)}
                    onSave={onUpdateBulkFeePayments}
                    students={classStudents}
                    grade={grade}
                    feeStructure={feeStructure}
                />
            )}
        </>
    );
};

export default ClassStudentsPage;