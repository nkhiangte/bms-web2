import React, { useState, useMemo } from 'react';
import { 
    Staff, 
    Grade, 
    GradeDefinition, 
    SubjectAssignment, 
    StaffType,
    EmploymentStatus 
} from '@/types';
import { 
    AcademicCapIcon, 
    BookOpenIcon, 
    SearchIcon, 
    EditIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    UserGroupIcon,
    ChevronDownIcon,
    PlusIcon,
    PrinterIcon
} from '@/components/Icons';
import PhotoWithFallback from '@/components/PhotoWithFallback';
import TeacherSubjectAssignmentsModal from '@/components/TeacherSubjectAssignmentsModal';
import { db } from '@/firebaseConfig';
import firebase from 'firebase/compat/app';

interface AdminTeacherAssignmentsSectionProps {
    staff: Staff[];
    gradeDefinitions?: Record<Grade, GradeDefinition>;
    academicYear: string;
    onUpdateStaffAssignments?: (teacherId: string, assignedSubjects: SubjectAssignment[], assignedGradeKey: Grade | null) => Promise<void>;
}

export const AdminTeacherAssignmentsSection: React.FC<AdminTeacherAssignmentsSectionProps> = ({
    staff,
    gradeDefinitions = {} as Record<Grade, GradeDefinition>,
    academicYear,
    onUpdateStaffAssignments
}) => {
    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'unassigned' | 'assigned' | 'class-teacher'>('all');
    const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'teachers' | 'classes'>('teachers');
    const [quickPickTeacherId, setQuickPickTeacherId] = useState<string>('');

    // Modal state for editing assignments
    const [selectedTeacherForModal, setSelectedTeacherForModal] = useState<Staff | null>(null);
    const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState(false);
    const [isSavingAssignments, setIsSavingAssignments] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Filter active teaching staff
    const teachingStaff = useMemo(() => {
        return staff.filter(s => {
            const isRemoved = s.status === EmploymentStatus.RESIGNED || s.status === EmploymentStatus.DROPPED || s.removalYear;
            if (isRemoved) return false;
            
            const isTeachingType = s.staffType === StaffType.TEACHING || (s.staffType as any) === 'Teaching';
            const dept = (s.department || '').toLowerCase();
            const desig = (s.designation || '').toLowerCase();
            const isTeacherByRole = dept.includes('teach') || desig.includes('teacher') || desig.includes('faculty') || desig.includes('lecturer');
            
            return isTeachingType || isTeacherByRole;
        });
    }, [staff]);

    // Map teacher id to their appointed Class Teacher grade
    const classTeacherByTeacherId = useMemo(() => {
        const map: Record<string, Grade> = {};
        if (!gradeDefinitions) return map;
        Object.entries(gradeDefinitions).forEach(([gradeKey, def]) => {
            if ((def as GradeDefinition)?.classTeacherId) {
                map[(def as GradeDefinition).classTeacherId!] = gradeKey as Grade;
            }
        });
        return map;
    }, [gradeDefinitions]);

    // Compute summary stats
    const stats = useMemo(() => {
        const total = teachingStaff.length;
        let assignedCount = 0;
        let unassignedCount = 0;
        let classTeacherCount = 0;

        teachingStaff.forEach(t => {
            const subs = t.assignedSubjects || [];
            if (subs.length > 0) {
                assignedCount++;
            } else {
                unassignedCount++;
            }
            if (classTeacherByTeacherId[t.id]) {
                classTeacherCount++;
            }
        });

        const totalGrades = Object.values(Grade).length;

        return {
            total,
            assignedCount,
            unassignedCount,
            classTeacherCount,
            totalGrades
        };
    }, [teachingStaff, classTeacherByTeacherId]);

    // Filtered teachers list based on search & filters
    const filteredTeachers = useMemo(() => {
        return teachingStaff.filter(teacher => {
            const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
            const empId = (teacher.employeeId || '').toLowerCase();
            const dept = (teacher.department || '').toLowerCase();
            const desig = (teacher.designation || '').toLowerCase();
            const subs = teacher.assignedSubjects || [];
            const subNames = subs.map(s => `${s.grade} ${s.subject}`.toLowerCase()).join(' ');

            const term = searchTerm.trim().toLowerCase();
            const matchesSearch = !term || 
                fullName.includes(term) || 
                empId.includes(term) || 
                dept.includes(term) || 
                desig.includes(term) || 
                subNames.includes(term);

            if (!matchesSearch) return false;

            // Status filter
            if (statusFilter === 'unassigned' && subs.length > 0) return false;
            if (statusFilter === 'assigned' && subs.length === 0) return false;
            if (statusFilter === 'class-teacher' && !classTeacherByTeacherId[teacher.id]) return false;

            // Grade filter
            if (selectedGradeFilter !== 'all') {
                const teachesGrade = subs.some(s => s.grade === selectedGradeFilter);
                const isClassTeacherForGrade = classTeacherByTeacherId[teacher.id] === selectedGradeFilter;
                if (!teachesGrade && !isClassTeacherForGrade) return false;
            }

            return true;
        });
    }, [teachingStaff, searchTerm, statusFilter, selectedGradeFilter, classTeacherByTeacherId]);

    // Save assignments handler
    const handleSaveAssignments = async (
        teacherId: string,
        newAssignedSubjects: SubjectAssignment[],
        newAssignedGradeKey: Grade | null
    ) => {
        setIsSavingAssignments(true);
        try {
            if (onUpdateStaffAssignments) {
                await onUpdateStaffAssignments(teacherId, newAssignedSubjects, newAssignedGradeKey);
            } else {
                const batch = db.batch();
                const staffRef = db.collection('staff').doc(teacherId);
                batch.update(staffRef, { assignedSubjects: newAssignedSubjects });

                if (gradeDefinitions) {
                    const currentAssignedGrade = Object.keys(gradeDefinitions).find(
                        (g) => gradeDefinitions[g as Grade]?.classTeacherId === teacherId
                    ) as Grade | undefined;

                    const configRef = db.collection('config').doc('gradeDefinitions');

                    if (newAssignedGradeKey && newAssignedGradeKey !== currentAssignedGrade) {
                        const updates: Record<string, any> = {};
                        if (currentAssignedGrade) {
                            updates[`${currentAssignedGrade}.classTeacherId`] = firebase.firestore.FieldValue.delete();
                        }
                        updates[`${newAssignedGradeKey}.classTeacherId`] = teacherId;
                        batch.update(configRef, updates);
                    } else if (!newAssignedGradeKey && currentAssignedGrade) {
                        batch.update(configRef, {
                            [`${currentAssignedGrade}.classTeacherId`]: firebase.firestore.FieldValue.delete(),
                        });
                    }
                }
                await batch.commit();
            }
            showToast('Teacher subjects and class assignments saved successfully!', 'success');
            setIsAssignmentsModalOpen(false);
            setSelectedTeacherForModal(null);
        } catch (error: any) {
            console.error('Failed to save teacher assignments:', error);
            showToast(error.message || 'Failed to save teacher assignments.', 'error');
            throw error;
        } finally {
            setIsSavingAssignments(false);
        }
    };

    // Open modal for a teacher
    const openModalForTeacher = (teacher: Staff) => {
        setSelectedTeacherForModal(teacher);
        setIsAssignmentsModalOpen(true);
    };

    // Standard curriculum for fallback
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

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    return (
        <div id="teacher-assignments-section" className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm scroll-mt-6">
            {/* Toast Notification */}
            {toastMessage && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border shadow-sm ${
                    toastMessage.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                    {toastMessage.type === 'success' ? (
                        <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0" />
                    )}
                    <span className="text-sm font-semibold">{toastMessage.text}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2">
                        <AcademicCapIcon className="w-4 h-4" />
                        Faculty Academic Management
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Assign Subjects &amp; Classes to All Teachers
                    </h2>
                    <p className="text-slate-600 text-sm mt-1 max-w-3xl">
                        Centrally allocate teaching subjects, class teacher duties, and curriculum responsibilities across all faculty members for Academic Year <strong className="text-indigo-900">{academicYear}</strong>.
                    </p>
                </div>

                {/* Right controls: Print / Quick Selector */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition"
                        title="Print Faculty Subject Allocation Matrix"
                    >
                        <PrinterIcon className="w-4 h-4 text-slate-600" />
                        <span>Print Matrix</span>
                    </button>

                    {/* Quick Pick dropdown to immediately assign any teacher */}
                    <div className="flex items-center gap-2 bg-white border border-indigo-200 rounded-xl p-1 shadow-xs">
                        <select
                            value={quickPickTeacherId}
                            onChange={(e) => setQuickPickTeacherId(e.target.value)}
                            className="text-xs bg-transparent font-medium text-slate-700 py-1 px-2 focus:outline-none max-w-[200px]"
                        >
                            <option value="">Select teacher to assign...</option>
                            {teachingStaff.map(t => {
                                const subsCount = (t.assignedSubjects || []).length;
                                return (
                                    <option key={t.id} value={t.id}>
                                        {t.firstName} {t.lastName} ({subsCount} {subsCount === 1 ? 'subject' : 'subjects'})
                                    </option>
                                );
                            })}
                        </select>
                        <button
                            type="button"
                            disabled={!quickPickTeacherId}
                            onClick={() => {
                                const teacher = teachingStaff.find(t => t.id === quickPickTeacherId);
                                if (teacher) openModalForTeacher(teacher);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer disabled:cursor-not-allowed"
                        >
                            Assign
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Teachers</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                        {stats.total}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">Active teaching staff</span>
                </div>

                <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 shadow-xs">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Subjects Assigned</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-1">
                        {stats.assignedCount}
                    </div>
                    <span className="text-[11px] text-emerald-600 mt-1 block">With classes &amp; subjects</span>
                </div>

                <div className={`bg-white rounded-xl border p-4 shadow-xs ${
                    stats.unassignedCount > 0 
                        ? 'border-amber-300 bg-amber-50/40' 
                        : 'border-slate-200'
                }`}>
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Missing Subjects</span>
                    <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${
                        stats.unassignedCount > 0 ? 'text-amber-700' : 'text-slate-700'
                    }`}>
                        {stats.unassignedCount}
                    </div>
                    <span className="text-[11px] text-amber-700 mt-1 block">
                        {stats.unassignedCount > 0 ? 'Requires subject allocation' : 'All teachers assigned'}
                    </span>
                </div>

                <div className="bg-white rounded-xl border border-indigo-200 bg-indigo-50/20 p-4 shadow-xs">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">Class Teachers</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-indigo-900 mt-1">
                        {stats.classTeacherCount} <span className="text-sm font-medium text-indigo-500">/ {stats.totalGrades}</span>
                    </div>
                    <span className="text-[11px] text-indigo-600 mt-1 block">Official grade in-charges</span>
                </div>
            </div>

            {/* View Mode Toggle & Filter Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs mb-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* View Switcher Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                        <button
                            type="button"
                            onClick={() => setViewMode('teachers')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                                viewMode === 'teachers'
                                    ? 'bg-white text-indigo-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <UserGroupIcon className="w-4 h-4" />
                            <span>By Teacher List ({filteredTeachers.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('classes')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                                viewMode === 'classes'
                                    ? 'bg-white text-indigo-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <BookOpenIcon className="w-4 h-4" />
                            <span>By Class Curriculum</span>
                        </button>
                    </div>

                    {/* Filter Status Pills (Only relevant in teacher view) */}
                    {viewMode === 'teachers' && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    statusFilter === 'all'
                                        ? 'bg-slate-800 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                All ({stats.total})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('unassigned')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    statusFilter === 'unassigned'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                }`}
                            >
                                ⚠️ Needs Subjects ({stats.unassignedCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('assigned')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    statusFilter === 'assigned'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                }`}
                            >
                                ✅ Assigned ({stats.assignedCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('class-teacher')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    statusFilter === 'class-teacher'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
                                }`}
                            >
                                🎓 Class Teachers ({stats.classTeacherCount})
                            </button>
                        </div>
                    )}
                </div>

                {/* Search and Grade Filter Bar */}
                {viewMode === 'teachers' && (
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
                        <div className="relative flex-1 w-full">
                            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by teacher name, employee ID, department, or subject..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className="w-full sm:w-auto flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500 shrink-0">Filter Grade:</span>
                            <select
                                value={selectedGradeFilter}
                                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                                className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Classes</option>
                                {Object.values(Grade).map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* TAB 1: TEACHER LIST VIEW */}
            {viewMode === 'teachers' && (
                <div>
                    {filteredTeachers.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                            <AcademicCapIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-slate-800">No teachers found</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                No faculty members match your search criteria. Try clearing search filters or checking staff records.
                            </p>
                            {(searchTerm || statusFilter !== 'all' || selectedGradeFilter !== 'all') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setSelectedGradeFilter('all');
                                    }}
                                    className="mt-4 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredTeachers.map(teacher => {
                                const classTeacherGrade = classTeacherByTeacherId[teacher.id];
                                const assignedSubs = teacher.assignedSubjects || [];
                                
                                // Group subjects by grade
                                const subjectsByGrade: Record<string, string[]> = {};
                                assignedSubs.forEach(item => {
                                    if (!subjectsByGrade[item.grade]) {
                                        subjectsByGrade[item.grade] = [];
                                    }
                                    subjectsByGrade[item.grade].push(item.subject);
                                });

                                const gradesList = Object.keys(subjectsByGrade);
                                const hasAssignments = assignedSubs.length > 0;

                                return (
                                    <div
                                        key={teacher.id}
                                        className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between p-5 hover:shadow-md ${
                                            !hasAssignments 
                                                ? 'border-amber-200/90 shadow-xs' 
                                                : classTeacherGrade 
                                                ? 'border-indigo-200/90 shadow-xs' 
                                                : 'border-slate-200 shadow-xs'
                                        }`}
                                    >
                                        {/* Teacher Info Header */}
                                        <div>
                                            <div className="flex items-start gap-3.5">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                                                    <PhotoWithFallback
                                                        src={teacher.photographUrl}
                                                        alt={`${teacher.firstName} ${teacher.lastName}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-bold text-slate-900 truncate">
                                                        {teacher.firstName} {teacher.lastName}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {teacher.designation || 'Teacher'}
                                                        {teacher.department ? ` • ${teacher.department}` : ''}
                                                    </p>
                                                    {teacher.employeeId && (
                                                        <span className="text-[11px] font-mono text-slate-400">
                                                            ID: {teacher.employeeId}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Class Teacher Badge */}
                                            <div className="mt-3.5">
                                                {classTeacherGrade ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold">
                                                        <AcademicCapIcon className="w-3.5 h-3.5 text-indigo-600" />
                                                        <span>Class Teacher: <strong>{classTeacherGrade}</strong></span>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                                                        <span>No Class Teacher Role</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Assigned Classes and Subjects Breakdown */}
                                            <div className="mt-4 pt-3.5 border-t border-slate-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                                        <BookOpenIcon className="w-3 h-3 text-slate-400" />
                                                        Classes &amp; Subjects ({assignedSubs.length})
                                                    </span>
                                                    {gradesList.length > 0 && (
                                                        <span className="text-[11px] font-semibold text-indigo-600">
                                                            {gradesList.length} {gradesList.length === 1 ? 'class' : 'classes'}
                                                        </span>
                                                    )}
                                                </div>

                                                {hasAssignments ? (
                                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                        {gradesList.map(gradeName => (
                                                            <div key={gradeName} className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
                                                                <div className="text-[11px] font-bold text-indigo-900 mb-1.5 flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                                    {gradeName}
                                                                </div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {subjectsByGrade[gradeName].map(sub => (
                                                                        <span
                                                                            key={sub}
                                                                            className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-xs rounded-md shadow-2xs font-medium"
                                                                        >
                                                                            {sub}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-center">
                                                        <p className="text-xs text-amber-800 font-semibold flex items-center justify-center gap-1.5">
                                                            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 shrink-0" />
                                                            <span>No subjects assigned yet</span>
                                                        </p>
                                                        <p className="text-[11px] text-amber-700 mt-0.5">
                                                            Click below to allocate classes and subjects.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-5 pt-3 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => openModalForTeacher(teacher)}
                                                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer shadow-xs ${
                                                    hasAssignments
                                                        ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 hover:border-indigo-300'
                                                        : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white'
                                                }`}
                                            >
                                                <EditIcon className="w-3.5 h-3.5" />
                                                <span>{hasAssignments ? 'Edit Subjects & Class' : 'Assign Subjects & Class'}</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: BY CLASS CURRICULUM VIEW */}
            {viewMode === 'classes' && (
                <div className="space-y-6">
                    <p className="text-xs text-slate-500">
                        Review coverage for each grade. Identify which teachers teach each subject, and check for any uncovered subjects.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {Object.values(Grade).map(gradeKey => {
                            const def = gradeDefinitions[gradeKey];
                            const classTeacherId = def?.classTeacherId;
                            const classTeacher = classTeacherId ? staff.find(s => s.id === classTeacherId) : null;

                            // Determine subjects list for this grade
                            const definedSubjects = def?.subjects?.map(s => s.name.trim()).filter(Boolean) || [];
                            const fallbackSubjects = standardCurriculum[gradeKey] || [];
                            const allClassSubjects = Array.from(new Set([...definedSubjects, ...fallbackSubjects]));

                            // Build mapping of subject -> assigned teachers
                            const subjectTeachersMap: Record<string, Staff[]> = {};
                            allClassSubjects.forEach(s => {
                                subjectTeachersMap[s] = [];
                            });

                            teachingStaff.forEach(t => {
                                (t.assignedSubjects || []).forEach(assign => {
                                    if (assign.grade === gradeKey) {
                                        if (!subjectTeachersMap[assign.subject]) {
                                            subjectTeachersMap[assign.subject] = [];
                                        }
                                        if (!subjectTeachersMap[assign.subject].some(existing => existing.id === t.id)) {
                                            subjectTeachersMap[assign.subject].push(t);
                                        }
                                    }
                                });
                            });

                            return (
                                <div key={gradeKey} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                                    <div>
                                        {/* Class Title & Class Teacher */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">{gradeKey}</h3>
                                                <span className="text-xs text-slate-500">
                                                    Curriculum &amp; Faculty Allocations
                                                </span>
                                            </div>

                                            {/* Class Teacher Indicator */}
                                            {classTeacher ? (
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-xl">
                                                    <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                                                        <PhotoWithFallback
                                                            src={classTeacher.photographUrl}
                                                            alt={`${classTeacher.firstName} ${classTeacher.lastName}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold text-indigo-900">
                                                        Class Teacher: <strong className="font-bold">{classTeacher.firstName} {classTeacher.lastName}</strong>
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
                                                    <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-600" />
                                                    <span>No Class Teacher</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Subject List & Teacher Mapping */}
                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1">
                                                <span>Subject</span>
                                                <span>Assigned Faculty</span>
                                            </div>

                                            {allClassSubjects.length === 0 ? (
                                                <p className="text-xs text-slate-400 italic py-2">No subjects defined for this grade.</p>
                                            ) : (
                                                allClassSubjects.map(subName => {
                                                    const assignedTeachers = subjectTeachersMap[subName] || [];
                                                    const hasTeacher = assignedTeachers.length > 0;

                                                    return (
                                                        <div
                                                            key={subName}
                                                            className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition"
                                                        >
                                                            <span className="text-xs font-bold text-slate-800">
                                                                {subName}
                                                            </span>

                                                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                                                {hasTeacher ? (
                                                                    assignedTeachers.map(t => (
                                                                        <button
                                                                            key={t.id}
                                                                            type="button"
                                                                            onClick={() => openModalForTeacher(t)}
                                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-300 text-slate-800 text-[11px] font-medium rounded-lg shadow-2xs transition cursor-pointer"
                                                                            title={`Click to edit assignments for ${t.firstName} ${t.lastName}`}
                                                                        >
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                            <span>{t.firstName} {t.lastName}</span>
                                                                        </button>
                                                                    ))
                                                                ) : (
                                                                    <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold rounded-lg">
                                                                        Unassigned
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick action button for this class */}
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xs text-slate-500">
                                            {allClassSubjects.filter(s => (subjectTeachersMap[s] || []).length > 0).length} of {allClassSubjects.length} subjects covered
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // If class teacher exists, open for them, otherwise open quick picker
                                                if (classTeacher) {
                                                    openModalForTeacher(classTeacher);
                                                } else if (teachingStaff.length > 0) {
                                                    openModalForTeacher(teachingStaff[0]);
                                                }
                                            }}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                                        >
                                            <EditIcon className="w-3.5 h-3.5" />
                                            <span>Manage Assignments &rarr;</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TEACHER SUBJECT & CLASS ASSIGNMENTS MODAL */}
            {isAssignmentsModalOpen && (
                <TeacherSubjectAssignmentsModal
                    isOpen={isAssignmentsModalOpen}
                    onClose={() => {
                        setIsAssignmentsModalOpen(false);
                        setSelectedTeacherForModal(null);
                    }}
                    teacher={selectedTeacherForModal}
                    gradeDefinitions={gradeDefinitions}
                    allStaff={staff}
                    onSave={handleSaveAssignments}
                    isSaving={isSavingAssignments}
                />
            )}
        </div>
    );
};

export default AdminTeacherAssignmentsSection;
