import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
    AcademicCapIcon, 
    SparklesIcon, 
    SearchIcon, 
    PlusIcon, 
    EditIcon, 
    TrashIcon, 
    BookOpenIcon, 
    ClipboardDocumentListIcon, 
    CheckIcon, 
    XIcon, 
    PrinterIcon, 
    ChevronDownIcon, 
    ChevronUpIcon, 
    SpinnerIcon,
    HomeIcon,
    UsersIcon,
    CalendarDaysIcon,
    DocumentReportIcon
} from '@/components/Icons';
import { 
    User, 
    Staff, 
    Grade, 
    GradeDefinition,
    SubjectAssignment, 
    Syllabus, 
    Homework, 
    ExamRoutine, 
    QuestionBankItem, 
    QuestionType, 
    QuestionDifficulty, 
    QuestionExamType, 
    StaffType 
} from '@/types';
import { db } from '@/firebaseConfig';
import firebase from 'firebase/compat/app';
import TeacherSubjectAssignmentsModal from '@/components/TeacherSubjectAssignmentsModal';
import { getMBSEChapters } from '@/data/mbseCurriculum';

const { Link, useNavigate } = ReactRouterDOM as any;

// Standard Bethel Mission School curriculum subjects by grade level
export const STANDARD_GRADE_SUBJECTS: Record<string, string[]> = {
    [Grade.NURSERY]: ['ABC Oral', 'ABC Writing', 'Numbers Oral', 'Numbers Writing', 'Rhyme', 'Conversation', 'Drawing', 'General Knowledge'],
    [Grade.KINDERGARTEN]: ['English I', 'English II', 'Maths', 'Writing', 'Spellings', 'Rhymes', 'Conversation', 'Drawing', 'General Knowledge'],
    [Grade.I]: ['English', 'Mizo', 'Mathematics', 'EVS', 'Cursive', 'Drawing', 'General Knowledge'],
    [Grade.II]: ['ENG-I', 'ENG-II', 'MIZO', 'MATH', 'Spellings', 'Hindi', 'Cursive', 'Drawing', 'General Knowledge'],
    [Grade.III]: ['English I', 'English II', 'Mizo', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Computer', 'General Knowledge'],
    [Grade.IV]: ['English I', 'English II', 'Mizo', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Computer', 'General Knowledge'],
    [Grade.V]: ['English I', 'English II', 'Mizo', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Computer', 'General Knowledge'],
    [Grade.VI]: ['English', 'Mizo', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer'],
    [Grade.VII]: ['English', 'Mizo', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer'],
    [Grade.VIII]: ['English', 'Mizo', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer'],
    [Grade.IX]: ['English', 'Mizo', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer'],
    [Grade.X]: ['English', 'Mizo', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer'],
};

interface TeacherWorkspaceProps {
    user: User;
    staff: Staff[];
    assignedGrade?: Grade | null;
    assignedSubjects?: SubjectAssignment[];
    syllabus?: Syllabus[];
    homework?: Homework[];
    examRoutines?: ExamRoutine[];
    academicYear: string;
    initialTab?: 'workspace' | 'question-bank';
    initialOpenAssignments?: boolean;
    isEmbeddedInDashboard?: boolean;
    gradeDefinitions?: Record<Grade, GradeDefinition>;
    onUpdateStaffAssignments?: (teacherId: string, assignedSubjects: SubjectAssignment[], assignedGradeKey: Grade | null) => Promise<void>;
}

export const TeacherWorkspace: React.FC<TeacherWorkspaceProps> = ({
    user,
    staff,
    assignedGrade,
    assignedSubjects = [],
    syllabus = [],
    homework = [],
    examRoutines = [],
    academicYear,
    initialTab = 'workspace',
    initialOpenAssignments = false,
    isEmbeddedInDashboard = false,
    gradeDefinitions,
    onUpdateStaffAssignments
}) => {
    const navigate = useNavigate();

    // Active workspace sub-tab
    const [activeTab, setActiveTab] = useState<'workspace' | 'question-bank'>(initialTab);

    // Questions state from Firestore
    const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState<boolean>(true);
    const [firestoreError, setFirestoreError] = useState<string | null>(null);

    // Filter states for Question Bank
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGrade, setFilterGrade] = useState<string>('all');
    const [filterSubject, setFilterSubject] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
    const [filterExamType, setFilterExamType] = useState<string>('all');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [notificationMessage, setNotificationMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Modal state for Teacher Subject & Class Assignments (Admin feature)
    const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState<boolean>(initialOpenAssignments);
    const [isSavingAssignments, setIsSavingAssignments] = useState<boolean>(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

    const isAdmin = user.role === 'admin' || (user.email != null && user.email.trim().toLowerCase() === 'nkhiangte@gmail.com');

    // All teaching staff
    const teachingStaff = useMemo(() => {
        return staff.filter(s => 
            s.staffType === StaffType.TEACHING || 
            (s.staffType as any) === 'Teaching' ||
            s.department?.toLowerCase().includes('teach') ||
            s.designation?.toLowerCase().includes('teacher')
        );
    }, [staff]);

    // Identify logged in teacher staff profile
    const loggedInStaffProfile = useMemo(() => {
        if (!user || !user.email) return undefined;
        const userEmail = user.email.trim().toLowerCase();
        return staff.find(s => {
            if (!s.emailAddress) return false;
            const emails = s.emailAddress.split(/[,;\s]+/).map(e => e.trim().toLowerCase()).filter(Boolean);
            if (emails.includes(userEmail)) return true;
            if (user.secondaryEmails && user.secondaryEmails.some(se => emails.includes(se.trim().toLowerCase()))) return true;
            return s.emailAddress.toLowerCase().includes(userEmail);
        });
    }, [staff, user]);

    // Active teacher profile (defaults to selected teacher if chosen, or logged in staff profile, or first teaching staff for admin)
    const activeTeacherStaff = useMemo(() => {
        if (selectedTeacherId) {
            const found = staff.find(s => s.id === selectedTeacherId);
            if (found) return found;
        }
        if (loggedInStaffProfile) return loggedInStaffProfile;
        if (isAdmin && teachingStaff.length > 0) return teachingStaff[0];
        return undefined;
    }, [selectedTeacherId, staff, loggedInStaffProfile, isAdmin, teachingStaff]);

    // Alias staffProfile to activeTeacherStaff for backward compatibility across all existing component references
    const staffProfile = activeTeacherStaff;

    // Determine class teacher grade for the active teacher
    const effectiveClassTeacherGrade = useMemo(() => {
        if (!activeTeacherStaff) return assignedGrade || null;
        if (gradeDefinitions) {
            const entry = Object.entries(gradeDefinitions).find(
                ([, def]) => (def as GradeDefinition)?.classTeacherId === activeTeacherStaff.id
            );
            if (entry) return entry[0] as Grade;
        }
        return activeTeacherStaff.id === loggedInStaffProfile?.id ? (assignedGrade || null) : null;
    }, [activeTeacherStaff, gradeDefinitions, assignedGrade, loggedInStaffProfile]);

    // Determine assigned subjects for the active teacher
    const effectiveAssignedSubjects = useMemo(() => {
        if (activeTeacherStaff && activeTeacherStaff.assignedSubjects && activeTeacherStaff.assignedSubjects.length > 0) {
            return activeTeacherStaff.assignedSubjects;
        }
        if (activeTeacherStaff && activeTeacherStaff.id === loggedInStaffProfile?.id && assignedSubjects && assignedSubjects.length > 0) {
            return assignedSubjects;
        }
        return activeTeacherStaff?.assignedSubjects || [];
    }, [activeTeacherStaff, loggedInStaffProfile, assignedSubjects]);

    // Compile teacher assignments strictly from active teacher staff data
    const { assignedGrades, assignedSubjectsByGrade, allAssignedSubjects } = useMemo(() => {
        const assignments: SubjectAssignment[] = [...effectiveAssignedSubjects];
        const gradeSet = new Set<Grade>();
        const byGrade: Record<string, string[]> = {};

        assignments.forEach(a => {
            if (a.grade && a.subject) {
                gradeSet.add(a.grade);
                if (!byGrade[a.grade]) {
                    byGrade[a.grade] = [];
                }
                if (!byGrade[a.grade].includes(a.subject)) {
                    byGrade[a.grade].push(a.subject);
                }
            }
        });

        if (effectiveClassTeacherGrade) {
            gradeSet.add(effectiveClassTeacherGrade);
            if (!byGrade[effectiveClassTeacherGrade]) {
                byGrade[effectiveClassTeacherGrade] = [];
            }
        }

        // For admin with no direct assignments and no selected teacher profile, fallback for question bank browsing
        if (isAdmin && gradeSet.size === 0 && !activeTeacherStaff) {
            Object.values(Grade).forEach(g => {
                gradeSet.add(g);
                byGrade[g] = ['Mathematics', 'Science', 'English', 'Social Science', 'Mizo', 'Hindi'];
            });
        }

        const allSubs = Array.from(new Set(Object.values(byGrade).flat()));
        return {
            assignedGrades: Array.from(gradeSet),
            assignedSubjectsByGrade: byGrade,
            allAssignedSubjects: allSubs
        };
    }, [effectiveAssignedSubjects, effectiveClassTeacherGrade, isAdmin, activeTeacherStaff]);

    // Save handler for admin to add, edit, or delete teacher subjects and class assignments
    const handleSaveTeacherAssignments = async (
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
            showToast('Teacher subjects and class assignments updated successfully!', 'success');
            setIsAssignmentsModalOpen(false);
        } catch (error: any) {
            console.error('Failed to update teacher assignments:', error);
            showToast(error.message || 'Failed to update teacher assignments.', 'error');
            throw error;
        } finally {
            setIsSavingAssignments(false);
        }
    };

    // Show temporary toast message
    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setNotificationMessage({ text, type });
        setTimeout(() => setNotificationMessage(null), 3500);
    };

    // Listen to Firestore questionBank collection
    useEffect(() => {
        if (!user || !user.uid) return;
        setLoadingQuestions(true);
        const unsubscribe = db.collection('questionBank').onSnapshot(
            (snapshot) => {
                const list: QuestionBankItem[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as QuestionBankItem[];
                setQuestions(list);
                setLoadingQuestions(false);
                setFirestoreError(null);
            },
            (err) => {
                console.error("Error loading question bank:", err);
                setFirestoreError(err.message || "Failed to load Question Bank");
                setLoadingQuestions(false);
            }
        );

        return () => unsubscribe();
    }, [user?.uid]);

    // Filter questions: Teachers must only see classes and subjects assigned to them
    const authorizedQuestions = useMemo(() => {
        return questions.filter(q => {
            // Admin can see all, teachers only see their assigned classes & subjects
            if (isAdmin) return true;
            const hasGrade = assignedGrades.includes(q.grade);
            const validSubjects = assignedSubjectsByGrade[q.grade] || [];
            const hasSubject = validSubjects.length === 0 || validSubjects.includes(q.subject);
            return hasGrade && hasSubject;
        });
    }, [questions, isAdmin, assignedGrades, assignedSubjectsByGrade]);

    // Apply UI filters (search, class, subject, type, difficulty, examType)
    const filteredQuestions = useMemo(() => {
        return authorizedQuestions.filter(q => {
            if (filterGrade !== 'all' && q.grade !== filterGrade) return false;
            if (filterSubject !== 'all' && q.subject !== filterSubject) return false;
            if (filterType !== 'all' && q.type !== filterType) return false;
            if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
            if (filterExamType !== 'all' && q.examType !== filterExamType) return false;

            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchQuestion = q.question.toLowerCase().includes(query);
                const matchChapter = q.chapter?.toLowerCase().includes(query);
                const matchAnswer = q.correctAnswer?.toLowerCase().includes(query);
                const matchSubject = q.subject.toLowerCase().includes(query);
                if (!matchQuestion && !matchChapter && !matchAnswer && !matchSubject) {
                    return false;
                }
            }
            return true;
        });
    }, [authorizedQuestions, filterGrade, filterSubject, filterType, filterDifficulty, filterExamType, searchQuery]);

    // Calculate teacher syllabus stats
    const teacherSyllabus = useMemo(() => {
        return syllabus.filter(s => {
            if (isAdmin) return true;
            return assignedGrades.includes(s.grade) && 
                (assignedSubjectsByGrade[s.grade] || []).includes(s.subject);
        });
    }, [syllabus, isAdmin, assignedGrades, assignedSubjectsByGrade]);

    // Calculate syllabus progress
    const syllabusStats = useMemo(() => {
        let totalTopics = 0;
        let completed = 0;
        let inProgress = 0;
        teacherSyllabus.forEach(s => {
            s.topics?.forEach(t => {
                totalTopics++;
                if (t.status === 'Completed') completed++;
                if (t.status === 'In Progress') inProgress++;
            });
        });
        return { totalTopics, completed, inProgress };
    }, [teacherSyllabus]);

    // Calculate teacher homework stats
    const teacherHomework = useMemo(() => {
        return homework.filter(h => {
            if (isAdmin) return true;
            return assignedGrades.includes(h.grade) && 
                (assignedSubjectsByGrade[h.grade] || []).includes(h.subject);
        });
    }, [homework, isAdmin, assignedGrades, assignedSubjectsByGrade]);

    // Delete question handler
    const handleDeleteQuestion = async (id: string) => {
        try {
            await db.collection('questionBank').doc(id).delete();
            showToast('Question deleted from Question Bank', 'success');
            setDeletingId(null);
        } catch (error: any) {
            showToast(error.message || 'Failed to delete question', 'error');
        }
    };

    // Copy question to clipboard
    const handleCopyQuestion = (item: QuestionBankItem) => {
        let text = `${item.question}\n`;
        if (item.type === 'mcq' && item.options && item.options.length > 0) {
            item.options.forEach((opt, idx) => {
                text += `  ${String.fromCharCode(65 + idx)}. ${opt}\n`;
            });
        }
        if (item.correctAnswer) {
            text += `Answer: ${item.correctAnswer}\n`;
        }
        if (item.explanation) {
            text += `Explanation: ${item.explanation}\n`;
        }
        navigator.clipboard.writeText(text);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Toggle solution display
    const toggleSolution = (id: string) => {
        setExpandedSolutions(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-6">
            {/* Notification Toast */}
            {notificationMessage && (
                <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium transition-all ${
                    notificationMessage.type === 'success' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-rose-600 text-white'
                }`}>
                    {notificationMessage.type === 'success' ? <CheckIcon className="w-5 h-5" /> : <XIcon className="w-5 h-5" />}
                    <span>{notificationMessage.text}</span>
                </div>
            )}

            {/* Workspace Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-20 top-0 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                                <AcademicCapIcon className="w-4 h-4" />
                                Teacher Workspace
                            </div>

                            {/* Admin Teacher Switcher */}
                            {isAdmin && teachingStaff.length > 0 && (
                                <div className="inline-flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-full px-3 py-1 shadow-inner">
                                    <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Teacher:</span>
                                    <select
                                        value={activeTeacherStaff?.id || ''}
                                        onChange={(e) => setSelectedTeacherId(e.target.value)}
                                        className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer pr-1"
                                    >
                                        {teachingStaff.map(t => (
                                            <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                                                {t.firstName} {t.lastName} {t.employeeId ? `(${t.employeeId})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            {activeTeacherStaff ? `${activeTeacherStaff.firstName} ${activeTeacherStaff.lastName}` : (user.displayName || user.email)}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300 text-sm mt-1">
                            {activeTeacherStaff?.designation && (
                                <span>{activeTeacherStaff.designation}</span>
                            )}
                            {activeTeacherStaff?.department && (
                                <span>• {activeTeacherStaff.department}</span>
                            )}
                            {activeTeacherStaff?.employeeId && (
                                <span>• ID: <strong className="text-sky-300">{activeTeacherStaff.employeeId}</strong></span>
                            )}
                            {effectiveClassTeacherGrade ? (
                                <span>• Class Teacher: <strong className="text-indigo-300">{effectiveClassTeacherGrade}</strong></span>
                            ) : (
                                <span>• Class Teacher: <span className="text-slate-400 italic">None Assigned</span></span>
                            )}
                            <span>• Academic Year: <strong className="text-amber-300">{academicYear}</strong></span>
                        </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Admin button to add, edit, or delete subjects and class taught */}
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setIsAssignmentsModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-sm rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all duration-200 cursor-pointer"
                                title="Add, edit, or delete subjects and class taught for this teacher"
                            >
                                <AcademicCapIcon className="w-4 h-4 text-slate-950" />
                                <span>Manage Subjects & Classes</span>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setActiveTab('question-bank');
                                setIsAiModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-teal-500/25 transition-all duration-200 cursor-pointer"
                        >
                            <SparklesIcon className="w-4 h-4 text-emerald-200" />
                            AI Question Generator
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('question-bank');
                                setIsAddModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 cursor-pointer"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Add Question
                        </button>
                    </div>
                </div>

                {/* Sub-tab Navigation */}
                <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800">
                    <button
                        onClick={() => setActiveTab('workspace')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === 'workspace'
                                ? 'bg-white text-slate-900 shadow-md'
                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        Workspace Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('question-bank')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === 'question-bank'
                                ? 'bg-white text-slate-900 shadow-md'
                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        Question Bank
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            activeTab === 'question-bank' ? 'bg-indigo-100 text-indigo-800' : 'bg-white/20 text-white'
                        }`}>
                            {authorizedQuestions.length}
                        </span>
                    </button>
                </div>
            </div>

            {/* Warning if no assigned subjects found in staff data */}
            {assignedGrades.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
                    <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                        <AcademicCapIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-amber-900 font-bold text-base">No Assigned Classes or Subjects Found</h4>
                        <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                            {activeTeacherStaff ? `${activeTeacherStaff.firstName} ${activeTeacherStaff.lastName}` : 'This teacher'} currently does not have any assigned classes or subjects in the school database. 
                            {!isAdmin && " Please contact the school administrator to assign your classes and subjects."}
                        </p>
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setIsAssignmentsModalOpen(true)}
                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Assign Classes &amp; Subjects Now
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 1: WORKSPACE DASHBOARD OVERVIEW */}
            {activeTab === 'workspace' && (
                <div className="space-y-6">
                    {/* Stat Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* Assigned Classes */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Classes</span>
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <BookOpenIcon className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-3 text-3xl font-extrabold text-slate-900">
                                    {assignedGrades.length}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {assignedGrades.slice(0, 3).map(g => (
                                        <span key={g} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
                                            {g}
                                        </span>
                                    ))}
                                    {assignedGrades.length > 3 && (
                                        <span className="text-xs text-slate-500 font-medium">+{assignedGrades.length - 3} more</span>
                                    )}
                                </div>
                            </div>
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => setIsAssignmentsModalOpen(true)}
                                    className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition cursor-pointer pt-2 border-t border-slate-100"
                                >
                                    <EditIcon className="w-3.5 h-3.5" /> Manage Classes
                                </button>
                            )}
                        </div>

                        {/* Assigned Subjects */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Subjects</span>
                                    <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                                        <AcademicCapIcon className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-3 text-3xl font-extrabold text-slate-900">
                                    {allAssignedSubjects.length}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {allAssignedSubjects.slice(0, 3).map(s => (
                                        <span key={s} className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md text-xs font-medium">
                                            {s}
                                        </span>
                                    ))}
                                    {allAssignedSubjects.length > 3 && (
                                        <span className="text-xs text-slate-500 font-medium">+{allAssignedSubjects.length - 3} more</span>
                                    )}
                                </div>
                            </div>
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => setIsAssignmentsModalOpen(true)}
                                    className="mt-3 text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition cursor-pointer pt-2 border-t border-slate-100"
                                >
                                    <PlusIcon className="w-3.5 h-3.5" /> Add / Remove Subjects
                                </button>
                            )}
                        </div>

                        {/* Question Bank Items */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question Bank</span>
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <SparklesIcon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-3 text-3xl font-extrabold text-slate-900">
                                {authorizedQuestions.length}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Ready for class tests & exams
                            </p>
                        </div>

                        {/* Syllabus Coverage */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Syllabus Topics</span>
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                    <ClipboardDocumentListIcon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-3 text-3xl font-extrabold text-slate-900">
                                {syllabusStats.totalTopics}
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-xs">
                                <span className="text-emerald-600 font-semibold">{syllabusStats.completed} completed</span>
                                <span className="text-slate-400">•</span>
                                <span className="text-amber-600 font-semibold">{syllabusStats.inProgress} in progress</span>
                            </div>
                        </div>
                    </div>

                    {/* Assigned Classes and Subjects Breakdown */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Assigned Classes & Subjects</h3>
                                <p className="text-sm text-slate-500">
                                    {activeTeacherStaff ? `Teaching assignments for ${activeTeacherStaff.firstName} ${activeTeacherStaff.lastName}` : 'Based on staff assignment records'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => setIsAssignmentsModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                                        title="Add, edit, or delete classes and subjects taught for this teacher"
                                    >
                                        <AcademicCapIcon className="w-4 h-4 text-amber-700" />
                                        <span>Add, Edit, Delete Subjects &amp; Classes</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setActiveTab('question-bank')}
                                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
                                >
                                    Open Question Bank &rarr;
                                </button>
                            </div>
                        </div>

                        {assignedGrades.length === 0 ? (
                            <p className="text-slate-500 text-sm italic py-4 text-center">No assignments configured.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {assignedGrades.map(grade => {
                                    const subjects = assignedSubjectsByGrade[grade] || [];
                                    const questionsForGrade = authorizedQuestions.filter(q => q.grade === grade);
                                    return (
                                        <div key={grade} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-slate-900 text-base">{grade}</h4>
                                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                                    {questionsForGrade.length} questions
                                                </span>
                                            </div>
                                            <div className="space-y-1.5 mt-3">
                                                <span className="text-xs font-medium text-slate-500 block">Assigned Subjects:</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {subjects.length > 0 ? (
                                                        subjects.map(s => (
                                                            <button
                                                                key={s}
                                                                onClick={() => {
                                                                    setFilterGrade(grade);
                                                                    setFilterSubject(s);
                                                                    setActiveTab('question-bank');
                                                                }}
                                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <span>{s}</span>
                                                                <span className="text-slate-400 text-[10px]">
                                                                    ({questionsForGrade.filter(q => q.subject === s).length})
                                                                </span>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">No specific subject assigned</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                                                <button
                                                    onClick={() => {
                                                        setFilterGrade(grade);
                                                        setActiveTab('question-bank');
                                                        setIsAddModalOpen(true);
                                                    }}
                                                    className="font-medium text-indigo-600 hover:text-indigo-800 transition"
                                                >
                                                    + Add Question
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setFilterGrade(grade);
                                                        setActiveTab('question-bank');
                                                        setIsAiModalOpen(true);
                                                    }}
                                                    className="font-medium text-emerald-600 hover:text-emerald-800 transition flex items-center gap-1"
                                                >
                                                    <SparklesIcon className="w-3.5 h-3.5" /> AI Draft
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Quick Question Bank Preview in Workspace */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Recent Questions in Bank</h3>
                                <p className="text-sm text-slate-500">Your latest created and generated questions</p>
                            </div>
                            <button
                                onClick={() => setActiveTab('question-bank')}
                                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                            >
                                View All ({authorizedQuestions.length})
                            </button>
                        </div>

                        {authorizedQuestions.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                                <SparklesIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                                <h4 className="font-semibold text-slate-700">Your Question Bank is currently empty</h4>
                                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                                    Start building your curriculum question repository manually or let AI generate questions aligned with your syllabus.
                                </p>
                                <div className="flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => {
                                            setActiveTab('question-bank');
                                            setIsAddModalOpen(true);
                                        }}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                                    >
                                        Add Manually
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveTab('question-bank');
                                            setIsAiModalOpen(true);
                                        }}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                                    >
                                        Generate with AI
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {authorizedQuestions.slice(0, 5).map((q, idx) => (
                                    <div key={q.id} className="py-3.5 flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700">
                                                    {q.grade}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                                                    {q.subject}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[11px] uppercase tracking-wider font-semibold bg-sky-50 text-sky-700">
                                                    {q.type}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                                    q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700' :
                                                    q.difficulty === 'hard' ? 'bg-rose-50 text-rose-700' :
                                                    'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {q.difficulty}
                                                </span>
                                                <span className="text-xs font-medium text-slate-500">
                                                    {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-800 font-medium line-clamp-1">
                                                {q.question}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditingQuestion(q);
                                                setActiveTab('question-bank');
                                                setIsAddModalOpen(true);
                                            }}
                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap pt-1"
                                        >
                                            View/Edit
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: FULL QUESTION BANK VIEW */}
            {activeTab === 'question-bank' && (
                <div className="space-y-6">
                    {/* Question Bank Header & Search / Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Question Bank</h3>
                                <p className="text-sm text-slate-500">
                                    Manage, filter, generate, and export test questions for your assigned classes
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <button
                                    onClick={() => setIsPrintModalOpen(true)}
                                    disabled={filteredQuestions.length === 0}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                                    title="Export or print selected questions as an exam sheet"
                                >
                                    <PrinterIcon className="w-4 h-4" />
                                    Print Paper ({filteredQuestions.length})
                                </button>
                                <button
                                    onClick={() => setIsAiModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer"
                                >
                                    <SparklesIcon className="w-4 h-4" />
                                    AI Generate
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingQuestion(null);
                                        setIsAddModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    Add Question
                                </button>
                            </div>
                        </div>

                        {/* Search and Filters Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                            {/* Search */}
                            <div className="relative sm:col-span-2">
                                <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search questions, topics, solutions..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Class Filter (Restricted to assigned classes) */}
                            <div>
                                <select
                                    value={filterGrade}
                                    onChange={e => {
                                        setFilterGrade(e.target.value);
                                        // Reset subject filter if not applicable to new grade
                                        if (e.target.value !== 'all' && filterSubject !== 'all') {
                                            const valid = assignedSubjectsByGrade[e.target.value] || [];
                                            if (!valid.includes(filterSubject)) {
                                                setFilterSubject('all');
                                            }
                                        }
                                    }}
                                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                >
                                    <option value="all">All Classes ({assignedGrades.length})</option>
                                    {assignedGrades.map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Subject Filter (Restricted to assigned subjects) */}
                            <div>
                                <select
                                    value={filterSubject}
                                    onChange={e => setFilterSubject(e.target.value)}
                                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                >
                                    <option value="all">All Subjects</option>
                                    {(filterGrade !== 'all' 
                                        ? (assignedSubjectsByGrade[filterGrade] || []) 
                                        : allAssignedSubjects
                                    ).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Question Type Filter */}
                            <div>
                                <select
                                    value={filterType}
                                    onChange={e => setFilterType(e.target.value)}
                                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                >
                                    <option value="all">All Question Types</option>
                                    <option value="mcq">Multiple Choice (MCQ)</option>
                                    <option value="short">Short Answer</option>
                                    <option value="long">Long Answer</option>
                                    <option value="true_false">True / False</option>
                                    <option value="fill_blank">Fill in Blanks</option>
                                </select>
                            </div>

                            {/* Difficulty Filter */}
                            <div>
                                <select
                                    value={filterDifficulty}
                                    onChange={e => setFilterDifficulty(e.target.value)}
                                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                >
                                    <option value="all">All Difficulties</option>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        {/* Filter Status summary / Reset */}
                        {(filterGrade !== 'all' || filterSubject !== 'all' || filterType !== 'all' || filterDifficulty !== 'all' || searchQuery) && (
                            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                                <span>
                                    Showing <strong>{filteredQuestions.length}</strong> of {authorizedQuestions.length} questions
                                </span>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterGrade('all');
                                        setFilterSubject('all');
                                        setFilterType('all');
                                        setFilterDifficulty('all');
                                        setFilterExamType('all');
                                    }}
                                    className="text-indigo-600 font-semibold hover:text-indigo-800 transition cursor-pointer"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Question Cards List */}
                    {loadingQuestions ? (
                        <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-slate-200">
                            <SpinnerIcon className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                            <p className="text-slate-600 text-sm font-medium">Loading questions from Question Bank...</p>
                        </div>
                    ) : firestoreError ? (
                        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                            Error loading Question Bank: {firestoreError}
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-slate-200 space-y-4">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                                <AcademicCapIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-800">No questions found</h4>
                                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                                    {authorizedQuestions.length === 0 
                                        ? "You have not added any questions yet for your assigned classes. Create your first question or use AI generation to quickly draft a set."
                                        : "No questions match your current search and filter criteria. Try adjusting or clearing your filters."
                                    }
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-3 pt-2">
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                                >
                                    + Add New Question
                                </button>
                                <button
                                    onClick={() => setIsAiModalOpen(true)}
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
                                >
                                    <SparklesIcon className="w-4 h-4" />
                                    Generate with AI
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredQuestions.map((q, index) => {
                                const isSolutionOpen = !!expandedSolutions[q.id];
                                return (
                                    <div
                                        key={q.id}
                                        className="bg-white rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all p-5 flex flex-col gap-3 group"
                                    >
                                        {/* Header Row: Badges & Actions */}
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs font-bold text-slate-400">
                                                    Q{index + 1}.
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                                                    {q.grade}
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                                    {q.subject}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                                                    {q.type === 'mcq' ? 'MCQ' :
                                                     q.type === 'short' ? 'Short Answer' :
                                                     q.type === 'long' ? 'Long Answer' :
                                                     q.type === 'true_false' ? 'True/False' : 'Fill in Blank'}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                                    q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800' :
                                                    q.difficulty === 'hard' ? 'bg-rose-100 text-rose-800' :
                                                    'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {q.difficulty.toUpperCase()}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800">
                                                    {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                                                </span>
                                                {q.examType && q.examType !== 'general' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-800">
                                                        {q.examType.toUpperCase()}
                                                    </span>
                                                )}
                                                {q.chapter && (
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        Topic: <em>{q.chapter}</em>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                                                <button
                                                    onClick={() => handleCopyQuestion(q)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                                    title="Copy question text"
                                                >
                                                    {copiedId === q.id ? (
                                                        <span className="text-xs font-semibold text-emerald-600">Copied!</span>
                                                    ) : (
                                                        <ClipboardDocumentListIcon className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingQuestion(q);
                                                        setIsAddModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                    title="Edit question"
                                                >
                                                    <EditIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(q.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                    title="Delete question"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Question Text */}
                                        <div className="text-slate-900 font-medium text-base whitespace-pre-line leading-relaxed">
                                            {q.question}
                                        </div>

                                        {/* MCQ Options */}
                                        {q.type === 'mcq' && q.options && q.options.length > 0 && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                                {q.options.map((opt, optIdx) => {
                                                    const letter = String.fromCharCode(65 + optIdx);
                                                    const isCorrect = q.correctAnswer?.trim().toLowerCase() === letter.toLowerCase() ||
                                                                      q.correctAnswer?.trim().toLowerCase() === opt.trim().toLowerCase();
                                                    return (
                                                        <div
                                                            key={optIdx}
                                                            className={`px-3 py-2 rounded-lg text-sm border flex items-center gap-2.5 transition ${
                                                                isSolutionOpen && isCorrect
                                                                    ? 'border-emerald-400 bg-emerald-50/80 text-emerald-900 font-semibold'
                                                                    : 'border-slate-200 bg-slate-50/50 text-slate-800'
                                                            }`}
                                                        >
                                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                                                isSolutionOpen && isCorrect
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : 'bg-slate-200 text-slate-700'
                                                            }`}>
                                                                {letter}
                                                            </span>
                                                            <span className="flex-1">{opt}</span>
                                                            {isSolutionOpen && isCorrect && (
                                                                <CheckIcon className="w-4 h-4 text-emerald-600 ml-auto" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Collapsible Answer & Explanation */}
                                        <div className="mt-1 pt-2 border-t border-slate-100 flex flex-col gap-2">
                                            <button
                                                onClick={() => toggleSolution(q.id)}
                                                className="self-start text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
                                            >
                                                {isSolutionOpen ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                                                {isSolutionOpen ? 'Hide Answer & Solution' : 'Show Answer & Solution'}
                                            </button>

                                            {isSolutionOpen && (
                                                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-2 animate-fadeIn">
                                                    {q.correctAnswer && (
                                                        <div>
                                                            <span className="font-bold text-slate-700">Answer: </span>
                                                            <span className="font-semibold text-emerald-700">{q.correctAnswer}</span>
                                                        </div>
                                                    )}
                                                    {q.explanation && (
                                                        <div>
                                                            <span className="font-bold text-slate-700">Explanation / Notes: </span>
                                                            <span className="text-slate-600 whitespace-pre-line">{q.explanation}</span>
                                                        </div>
                                                    )}
                                                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                                                        Added by: {q.createdBy?.name || 'Teacher'} • {new Date(q.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                            <TrashIcon className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-slate-900">Delete Question?</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Are you sure you want to permanently delete this question from the Question Bank?
                            </p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteQuestion(deletingId)}
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD / EDIT QUESTION MODAL */}
            {isAddModalOpen && (
                <AddEditQuestionModal
                    isOpen={isAddModalOpen}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setEditingQuestion(null);
                    }}
                    onSaved={() => {
                        setIsAddModalOpen(false);
                        setEditingQuestion(null);
                        showToast(editingQuestion ? 'Question updated successfully' : 'Question added to Question Bank');
                    }}
                    initialData={editingQuestion}
                    user={user}
                    staffProfile={staffProfile}
                    assignedGrades={assignedGrades}
                    assignedSubjectsByGrade={assignedSubjectsByGrade}
                    syllabus={syllabus}
                    academicYear={academicYear}
                />
            )}

            {/* AI QUESTION GENERATOR MODAL */}
            {isAiModalOpen && (
                <AiQuestionGeneratorModal
                    isOpen={isAiModalOpen}
                    onClose={() => setIsAiModalOpen(false)}
                    onQuestionsSaved={(count) => {
                        setIsAiModalOpen(false);
                        showToast(`Successfully saved ${count} questions to Question Bank!`);
                    }}
                    user={user}
                    staffProfile={staffProfile}
                    assignedGrades={assignedGrades}
                    assignedSubjectsByGrade={assignedSubjectsByGrade}
                    syllabus={syllabus}
                    academicYear={academicYear}
                />
            )}

            {/* PRINT / EXAM PAPER PREVIEW MODAL */}
            {isPrintModalOpen && (
                <PrintQuestionPaperModal
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    questions={filteredQuestions}
                    academicYear={academicYear}
                    filterGrade={filterGrade}
                    filterSubject={filterSubject}
                />
            )}

            {/* TEACHER SUBJECT & CLASS ASSIGNMENTS MODAL (ADMIN) */}
            {isAssignmentsModalOpen && (
                <TeacherSubjectAssignmentsModal
                    isOpen={isAssignmentsModalOpen}
                    onClose={() => setIsAssignmentsModalOpen(false)}
                    teacher={activeTeacherStaff || null}
                    gradeDefinitions={gradeDefinitions || ({} as Record<Grade, GradeDefinition>)}
                    allStaff={staff}
                    onSave={handleSaveTeacherAssignments}
                    isSaving={isSavingAssignments}
                />
            )}
        </div>
    );
};

// -------------------------------------------------------------
// SUB-COMPONENT: ADD / EDIT QUESTION MODAL
// -------------------------------------------------------------
interface AddEditQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    initialData: QuestionBankItem | null;
    user: User;
    staffProfile?: Staff;
    assignedGrades: Grade[];
    assignedSubjectsByGrade: Record<string, string[]>;
    syllabus: Syllabus[];
    academicYear: string;
}

const AddEditQuestionModal: React.FC<AddEditQuestionModalProps> = ({
    isOpen,
    onClose,
    onSaved,
    initialData,
    user,
    staffProfile,
    assignedGrades,
    assignedSubjectsByGrade,
    syllabus,
    academicYear
}) => {
    // Grade selection (assigned classes prioritized, all classes accessible)
    const [grade, setGrade] = useState<Grade>(
        initialData?.grade || assignedGrades[0] || Grade.VI
    );

    const [isCustomSubject, setIsCustomSubject] = useState<boolean>(false);
    const [customSubjectName, setCustomSubjectName] = useState<string>('');

    // Teacher's assigned subjects for the selected grade
    const teacherAssignedSubjects = useMemo(() => {
        return assignedSubjectsByGrade[grade] || [];
    }, [assignedSubjectsByGrade, grade]);

    // Available subjects for the selected grade (assigned + standard curriculum + syllabus)
    const availableSubjects = useMemo(() => {
        const std = STANDARD_GRADE_SUBJECTS[grade] || ['English', 'Mathematics', 'Science', 'Social Science', 'Mizo', 'Hindi', 'Computer'];
        const syllabusList = syllabus.filter(s => s.grade === grade).map(s => s.subject);
        return Array.from(new Set([...teacherAssignedSubjects, ...std, ...syllabusList]));
    }, [grade, teacherAssignedSubjects, syllabus]);

    // Subject selection
    const [subject, setSubject] = useState<string>(
        initialData?.subject || availableSubjects[0] || 'Mathematics'
    );

    // Synchronize subject when grade changes
    useEffect(() => {
        if (!isCustomSubject) {
            if (!availableSubjects.includes(subject) && availableSubjects.length > 0) {
                setSubject(availableSubjects[0]);
            }
        }
    }, [availableSubjects, subject, isCustomSubject]);

    const [chapter, setChapter] = useState(initialData?.chapter || '');
    const [type, setType] = useState<QuestionType>(initialData?.type || 'mcq');
    const [questionText, setQuestionText] = useState(initialData?.question || '');
    const [options, setOptions] = useState<string[]>(
        initialData?.options && initialData.options.length > 0 
            ? initialData.options 
            : ['', '', '', '']
    );
    const [correctAnswer, setCorrectAnswer] = useState(initialData?.correctAnswer || '');
    const [explanation, setExplanation] = useState(initialData?.explanation || '');
    const [marks, setMarks] = useState<number>(initialData?.marks || 1);
    const [difficulty, setDifficulty] = useState<QuestionDifficulty>(initialData?.difficulty || 'medium');
    const [examType, setExamType] = useState<QuestionExamType>(initialData?.examType || 'general');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Extract syllabus topics for suggested chapters
    const suggestedTopics = useMemo(() => {
        const match = syllabus.find(s => s.grade === grade && s.subject.toLowerCase() === subject.toLowerCase());
        return match?.topics?.map(t => t.name) || [];
    }, [syllabus, grade, subject]);

    const handleOptionChange = (index: number, value: string) => {
        const next = [...options];
        next[index] = value;
        setOptions(next);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const finalSubject = isCustomSubject ? customSubjectName.trim() : subject.trim();
        if (!finalSubject) {
            setError('Please select or specify a subject.');
            return;
        }

        if (!questionText.trim()) {
            setError('Please enter the question text.');
            return;
        }

        if (type === 'mcq') {
            const filledOptions = options.filter(o => o.trim() !== '');
            if (filledOptions.length < 2) {
                setError('Please provide at least 2 options for multiple choice questions.');
                return;
            }
            if (!correctAnswer.trim()) {
                setError('Please select or specify the correct answer option.');
                return;
            }
        }

        setSaving(true);
        try {
            const dataToSave = {
                grade,
                subject: finalSubject,
                chapter: chapter.trim(),
                type,
                question: questionText.trim(),
                options: type === 'mcq' ? options.filter(o => o.trim() !== '') : [],
                correctAnswer: correctAnswer.trim(),
                explanation: explanation.trim(),
                marks: Number(marks) || 1,
                difficulty,
                examType,
                academicYear,
                updatedAt: new Date().toISOString()
            };

            if (initialData?.id) {
                await db.collection('questionBank').doc(initialData.id).update(dataToSave);
            } else {
                await db.collection('questionBank').add({
                    ...dataToSave,
                    createdBy: {
                        uid: user.uid,
                        name: user.displayName || user.email || 'Teacher',
                        email: user.email || '',
                        staffId: staffProfile?.id || ''
                    },
                    createdAt: new Date().toISOString()
                });
            }

            setSaving(false);
            onSaved();
        } catch (err: any) {
            console.error("Save question error:", err);
            setError(err.message || "Failed to save question to Firestore.");
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <AcademicCapIcon className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                            {initialData ? 'Edit Question' : 'Add Question to Bank'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                    {/* Class & Subject */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Class / Grade <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={grade}
                                onChange={e => {
                                    setGrade(e.target.value as Grade);
                                    setIsCustomSubject(false);
                                }}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 font-medium shadow-sm"
                                required
                            >
                                {assignedGrades.length > 0 && (
                                    <optgroup label="⭐ Your Assigned Classes">
                                        {assignedGrades.map(g => (
                                            <option key={`qf-assigned-${g}`} value={g} className="bg-white text-slate-900 font-medium">{g}</option>
                                        ))}
                                    </optgroup>
                                )}
                                <optgroup label="🏫 All School Classes">
                                    {Object.values(Grade).map(g => (
                                        <option key={`qf-all-${g}`} value={g} className="bg-white text-slate-900 font-medium">{g}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Subject <span className="text-rose-500">*</span>
                            </label>
                            {!isCustomSubject ? (
                                <select
                                    value={subject}
                                    onChange={e => {
                                        if (e.target.value === '__custom__') {
                                            setIsCustomSubject(true);
                                            setCustomSubjectName('');
                                        } else {
                                            setSubject(e.target.value);
                                        }
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 font-medium shadow-sm"
                                    required
                                >
                                    {teacherAssignedSubjects.length > 0 && (
                                        <optgroup label="⭐ Your Assigned Subjects">
                                            {teacherAssignedSubjects.map(s => (
                                                <option key={`qf-subj-assigned-${s}`} value={s} className="bg-white text-slate-900 font-medium">{s}</option>
                                            ))}
                                        </optgroup>
                                    )}
                                    <optgroup label="📚 Standard Curriculum Subjects">
                                        {availableSubjects.filter(s => !teacherAssignedSubjects.includes(s)).map(s => (
                                            <option key={`qf-subj-std-${s}`} value={s} className="bg-white text-slate-900 font-medium">{s}</option>
                                        ))}
                                    </optgroup>
                                    <option value="__custom__" className="bg-white text-indigo-600 font-bold">
                                        ✏️ + Other / Custom Subject...
                                    </option>
                                </select>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type custom subject name..."
                                        value={customSubjectName}
                                        onChange={e => setCustomSubjectName(e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm border border-indigo-400 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 font-medium shadow-sm placeholder:text-slate-400"
                                        autoFocus
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCustomSubject(false);
                                            setSubject(availableSubjects[0] || 'Mathematics');
                                        }}
                                        className="px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition whitespace-nowrap"
                                    >
                                        List
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chapter / Topic and Question Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Chapter / Topic (Optional)
                            </label>
                            <input
                                type="text"
                                list="syllabus-topics"
                                placeholder="e.g. Fractions, Cell Structure..."
                                value={chapter}
                                onChange={e => setChapter(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                            />
                            {suggestedTopics.length > 0 && (
                                <datalist id="syllabus-topics">
                                    {suggestedTopics.map(t => (
                                        <option key={t} value={t} />
                                    ))}
                                </datalist>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Question Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value as QuestionType)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="mcq">Multiple Choice Question (MCQ)</option>
                                <option value="short">Short Answer (1 - 3 Marks)</option>
                                <option value="long">Long Answer (4 - 5 Marks)</option>
                                <option value="true_false">True / False</option>
                                <option value="fill_blank">Fill in the Blanks</option>
                            </select>
                        </div>
                    </div>

                    {/* Question Text */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Question Text <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Enter the question statement here..."
                            value={questionText}
                            onChange={e => setQuestionText(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    {/* MCQ Options */}
                    {type === 'mcq' && (
                        <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Multiple Choice Options &amp; Correct Answer
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {options.map((opt, idx) => {
                                    const letter = String.fromCharCode(65 + idx);
                                    const isSelected = correctAnswer.toLowerCase() === letter.toLowerCase() || 
                                                      (opt && correctAnswer.toLowerCase() === opt.toLowerCase());
                                    return (
                                        <div key={idx} className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setCorrectAnswer(letter)}
                                                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition ${
                                                    isSelected 
                                                        ? 'bg-emerald-600 text-white shadow-sm' 
                                                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                                                }`}
                                                title={`Mark Option ${letter} as correct`}
                                            >
                                                {letter}
                                            </button>
                                            <input
                                                type="text"
                                                placeholder={`Option ${letter}`}
                                                value={opt}
                                                onChange={e => handleOptionChange(idx, e.target.value)}
                                                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                                Tip: Click the letter button (A, B, C, D) to mark it as the correct answer.
                            </p>
                        </div>
                    )}

                    {/* True/False selection */}
                    {type === 'true_false' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Correct Answer
                            </label>
                            <div className="flex items-center gap-3">
                                {['True', 'False'].map(val => (
                                    <label key={val} className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tf-answer"
                                            value={val}
                                            checked={correctAnswer.toLowerCase() === val.toLowerCase()}
                                            onChange={() => setCorrectAnswer(val)}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span>{val}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Correct Answer for Short / Long / Fill in Blanks */}
                    {type !== 'mcq' && type !== 'true_false' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Model Answer / Solution Key
                            </label>
                            <input
                                type="text"
                                placeholder="Expected answer or key points..."
                                value={correctAnswer}
                                onChange={e => setCorrectAnswer(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    )}

                    {/* Explanation / Notes */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Explanation / Marking Criteria (Optional)
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Step-by-step working, rationale, or teacher's marking criteria..."
                            value={explanation}
                            onChange={e => setExplanation(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Marks, Difficulty, Exam Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Marks
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                value={marks}
                                onChange={e => setMarks(Number(e.target.value) || 1)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Difficulty
                            </label>
                            <select
                                value={difficulty}
                                onChange={e => setDifficulty(e.target.value as QuestionDifficulty)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Exam Tag
                            </label>
                            <select
                                value={examType}
                                onChange={e => setExamType(e.target.value as QuestionExamType)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="general">General / Class Test</option>
                                <option value="terminal1">Terminal 1</option>
                                <option value="terminal2">Terminal 2</option>
                                <option value="terminal3">Terminal 3</option>
                                <option value="annual">Annual Exam</option>
                            </select>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
                        >
                            {saving ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                            {initialData ? 'Update Question' : 'Save to Question Bank'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// -------------------------------------------------------------
// SUB-COMPONENT: AI QUESTION GENERATOR MODAL
// -------------------------------------------------------------
interface AiQuestionGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onQuestionsSaved: (count: number) => void;
    user: User;
    staffProfile?: Staff;
    assignedGrades: Grade[];
    assignedSubjectsByGrade: Record<string, string[]>;
    syllabus: Syllabus[];
    academicYear: string;
}

const AiQuestionGeneratorModal: React.FC<AiQuestionGeneratorModalProps> = ({
    isOpen,
    onClose,
    onQuestionsSaved,
    user,
    staffProfile,
    assignedGrades,
    assignedSubjectsByGrade,
    syllabus,
    academicYear
}) => {
    // Grade selection (assigned classes prioritized, all classes accessible)
    const [grade, setGrade] = useState<Grade>(assignedGrades[0] || Grade.VI);

    const [isCustomSubject, setIsCustomSubject] = useState<boolean>(false);
    const [customSubjectName, setCustomSubjectName] = useState<string>('');

    // Teacher's assigned subjects for this grade
    const teacherAssignedSubjects = useMemo(() => {
        return assignedSubjectsByGrade[grade] || [];
    }, [assignedSubjectsByGrade, grade]);

    // Complete available subjects for this grade (assigned + standard curriculum + syllabus)
    const availableSubjects = useMemo(() => {
        const std = STANDARD_GRADE_SUBJECTS[grade] || ['English', 'Mathematics', 'Science', 'Social Science', 'Mizo', 'Hindi', 'Computer'];
        const syllabusList = syllabus.filter(s => s.grade === grade).map(s => s.subject);
        return Array.from(new Set([...teacherAssignedSubjects, ...std, ...syllabusList]));
    }, [grade, teacherAssignedSubjects, syllabus]);

    // Subject selection (strictly from assigned or standard subjects for selected grade)
    const [subject, setSubject] = useState<string>(
        teacherAssignedSubjects[0] || availableSubjects[0] || 'Mathematics'
    );

    useEffect(() => {
        if (!isCustomSubject) {
            if (!availableSubjects.includes(subject) && availableSubjects.length > 0) {
                setSubject(teacherAssignedSubjects[0] || availableSubjects[0]);
            }
        }
    }, [availableSubjects, teacherAssignedSubjects, subject, isCustomSubject]);

    const [board, setBoard] = useState<string>('MBSE (Mizoram Board / NCERT)');
    const [chapter, setChapter] = useState('');
    const [selectedType, setSelectedType] = useState<'mixed' | 'mcq' | 'short' | 'long'>('mixed');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
    const [questionCount, setQuestionCount] = useState<number>(5);
    const [customInstructions, setCustomInstructions] = useState('');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [generatedQuestions, setGeneratedQuestions] = useState<Array<Partial<QuestionBankItem> & { selected: boolean }>>([]);
    const [isSaving, setIsSaving] = useState(false);

    // MBSE standard curriculum chapters for selected grade & subject
    const activeSubjectName = isCustomSubject ? customSubjectName : subject;
    const mbseChapters = useMemo(() => {
        return getMBSEChapters(grade, activeSubjectName);
    }, [grade, activeSubjectName]);

    // Extract custom syllabus topics from database
    const suggestedTopics = useMemo(() => {
        const effectiveSubject = isCustomSubject ? customSubjectName : subject;
        const match = syllabus.find(s => s.grade === grade && s.subject.toLowerCase() === effectiveSubject.toLowerCase());
        const dbTopics = match?.topics?.map(t => t.name) || [];
        // Combine with MBSE standard chapters
        return Array.from(new Set([...mbseChapters, ...dbTopics]));
    }, [syllabus, grade, subject, isCustomSubject, customSubjectName, mbseChapters]);

    const handleGenerate = async () => {
        setGenerationError(null);

        const finalSubject = isCustomSubject ? customSubjectName.trim() : subject.trim();
        if (!finalSubject) {
            setGenerationError('Please select or type a subject name.');
            return;
        }

        setIsGenerating(true);

        try {
            const res = await fetch('/api/ai/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grade,
                    subject: finalSubject,
                    chapter,
                    board,
                    selectedType,
                    difficulty,
                    questionCount,
                    customInstructions,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Generation failed (Status ${res.status}). Please try again.`);
            }

            const data = await res.json();
            if (Array.isArray(data.questions) && data.questions.length > 0) {
                const prepared = data.questions.map((q: any) => ({
                    ...q,
                    grade,
                    subject: finalSubject,
                    chapter: q.chapter || chapter || finalSubject,
                    marks: Number(q.marks) || (q.type === 'mcq' ? 1 : 3),
                    difficulty: q.difficulty || 'medium',
                    options: Array.isArray(q.options) ? q.options : [],
                    selected: true,
                }));
                setGeneratedQuestions(prepared);
            } else {
                throw new Error("No questions were generated. Please refine your prompt and try again.");
            }
        } catch (err: any) {
            console.error("AI Generation error:", err);
            setGenerationError(err.message || "Failed to generate questions. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleQuestionSelection = (index: number) => {
        setGeneratedQuestions(prev => {
            const next = [...prev];
            next[index] = { ...next[index], selected: !next[index].selected };
            return next;
        });
    };

    const handleSaveSelected = async () => {
        const selected = generatedQuestions.filter(q => q.selected);
        if (selected.length === 0) {
            setGenerationError('Please select at least one question to save.');
            return;
        }

        setIsSaving(true);
        try {
            const batchPromises = selected.map(q => {
                return db.collection('questionBank').add({
                    grade: q.grade,
                    subject: q.subject,
                    chapter: q.chapter || '',
                    type: q.type || 'mcq',
                    question: q.question || '',
                    options: q.options || [],
                    correctAnswer: q.correctAnswer || '',
                    explanation: q.explanation || '',
                    marks: Number(q.marks) || 1,
                    difficulty: q.difficulty || 'medium',
                    examType: 'general',
                    academicYear,
                    createdBy: {
                        uid: user.uid,
                        name: user.displayName || user.email || 'Teacher',
                        email: user.email || '',
                        staffId: staffProfile?.id || ''
                    },
                    createdAt: new Date().toISOString()
                });
            });

            await Promise.all(batchPromises);
            setIsSaving(false);
            onQuestionsSaved(selected.length);
        } catch (err: any) {
            console.error("Save generated questions error:", err);
            setGenerationError(err.message || "Failed to save questions to Firestore.");
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                            <SparklesIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">AI Question Generator</h3>
                            <p className="text-xs text-slate-500">Draft questions automatically tailored for your assigned classes</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {generationError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                        {generationError}
                    </div>
                )}

                {/* Generator Configuration (if questions not generated yet) */}
                {generatedQuestions.length === 0 ? (
                    <div className="space-y-4">
                        {/* Board & Curriculum Alignment */}
                        <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <AcademicCapIcon className="w-4 h-4 text-teal-700" />
                                    Curriculum Board:
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {[
                                    { id: 'MBSE (Mizoram Board / NCERT)', label: '🎓 MBSE (Mizoram Board)' },
                                    { id: 'CBSE / NCERT', label: '📘 CBSE / NCERT' },
                                    { id: 'General / Custom', label: '🌐 General' },
                                ].map(b => (
                                    <button
                                        key={b.id}
                                        type="button"
                                        onClick={() => setBoard(b.id)}
                                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                                            board === b.id
                                                ? 'bg-teal-700 text-white shadow-sm'
                                                : 'bg-white/80 text-teal-800 hover:bg-white border border-teal-200'
                                        }`}
                                    >
                                        {b.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Class (Assigned classes prioritized, all school classes accessible) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Class / Grade <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={grade}
                                    onChange={e => {
                                        setGrade(e.target.value as Grade);
                                        setIsCustomSubject(false);
                                        setChapter('');
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-slate-900 font-medium shadow-sm"
                                >
                                    {assignedGrades.length > 0 && (
                                        <optgroup label="⭐ Your Assigned Classes">
                                            {assignedGrades.map(g => (
                                                <option key={`ai-assigned-${g}`} value={g} className="bg-white text-slate-900 font-medium">{g}</option>
                                            ))}
                                        </optgroup>
                                    )}
                                    <optgroup label="🏫 All School Classes">
                                        {Object.values(Grade).map(g => (
                                            <option key={`ai-all-${g}`} value={g} className="bg-white text-slate-900 font-medium">{g}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            {/* Subject (Assigned + standard curriculum + custom) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Subject <span className="text-rose-500">*</span>
                                </label>
                                {!isCustomSubject ? (
                                    <select
                                        value={subject}
                                        onChange={e => {
                                            if (e.target.value === '__custom__') {
                                                setIsCustomSubject(true);
                                                setCustomSubjectName('');
                                                setChapter('');
                                            } else {
                                                setSubject(e.target.value);
                                                setChapter('');
                                            }
                                        }}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-slate-900 font-medium shadow-sm"
                                    >
                                        {teacherAssignedSubjects.length > 0 && (
                                            <optgroup label="⭐ Your Assigned Subjects">
                                                {teacherAssignedSubjects.map(s => (
                                                    <option key={`ai-subj-assigned-${s}`} value={s} className="bg-white text-slate-900 font-medium">{s}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                        <optgroup label="📚 Standard Curriculum Subjects">
                                            {availableSubjects.filter(s => !teacherAssignedSubjects.includes(s)).map(s => (
                                                <option key={`ai-subj-std-${s}`} value={s} className="bg-white text-slate-900 font-medium">{s}</option>
                                            ))}
                                        </optgroup>
                                        <option value="__custom__" className="bg-white text-teal-700 font-bold">
                                            ✏️ + Other / Custom Subject...
                                        </option>
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="Type custom subject name..."
                                            value={customSubjectName}
                                            onChange={e => setCustomSubjectName(e.target.value)}
                                            className="flex-1 px-3 py-2 text-sm border border-teal-400 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-slate-900 font-medium shadow-sm placeholder:text-slate-400"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsCustomSubject(false);
                                                setSubject(teacherAssignedSubjects[0] || availableSubjects[0] || 'Mathematics');
                                            }}
                                            className="px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition whitespace-nowrap"
                                        >
                                            List
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chapter / Topic and Question Format */}
                        <div className="space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Topic / Chapter
                                        </label>
                                        {mbseChapters.length > 0 && (
                                            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                                                {mbseChapters.length} Prescribed MBSE Chapters
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        list="ai-syllabus-topics"
                                        placeholder="Select below or type custom topic/chapter..."
                                        value={chapter}
                                        onChange={e => setChapter(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                                    />
                                    {suggestedTopics.length > 0 && (
                                        <datalist id="ai-syllabus-topics">
                                            {suggestedTopics.map(t => (
                                                <option key={t} value={t} />
                                            ))}
                                        </datalist>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Question Format
                                    </label>
                                    <select
                                        value={selectedType}
                                        onChange={e => setSelectedType(e.target.value as any)}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-slate-900 font-medium shadow-sm"
                                    >
                                        <option value="mixed" className="bg-white text-slate-900 font-medium">Mixed (MCQ + Short + Long)</option>
                                        <option value="mcq" className="bg-white text-slate-900 font-medium">MCQ Only</option>
                                        <option value="short" className="bg-white text-slate-900 font-medium">Short Answer Only</option>
                                        <option value="long" className="bg-white text-slate-900 font-medium">Long Answer Only</option>
                                    </select>
                                </div>
                            </div>

                            {/* MBSE Chapter Quick Pills / Dropdown */}
                            {mbseChapters.length > 0 && (
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                                            <span>📖</span> Quick Select MBSE Chapter for {grade} {isCustomSubject ? customSubjectName : subject}:
                                        </span>
                                        {chapter && (
                                            <button
                                                type="button"
                                                onClick={() => setChapter('')}
                                                className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                                        {mbseChapters.map(ch => {
                                            const isSelected = chapter.toLowerCase() === ch.toLowerCase();
                                            return (
                                                <button
                                                    key={ch}
                                                    type="button"
                                                    onClick={() => setChapter(ch)}
                                                    className={`px-2.5 py-1 text-xs rounded-lg text-left transition font-medium border ${
                                                        isSelected
                                                            ? 'bg-teal-600 text-white border-teal-700 shadow-sm font-semibold'
                                                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 hover:text-teal-900'
                                                    }`}
                                                >
                                                    {ch}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quantity and Difficulty */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Number of Questions
                                </label>
                                <select
                                    value={questionCount}
                                    onChange={e => setQuestionCount(Number(e.target.value))}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-slate-900 font-medium shadow-sm"
                                >
                                    <option value={3} className="bg-white text-slate-900 font-medium">3 Questions</option>
                                    <option value={5} className="bg-white text-slate-900 font-medium">5 Questions</option>
                                    <option value={8} className="bg-white text-slate-900 font-medium">8 Questions</option>
                                    <option value={10} className="bg-white text-slate-900 font-medium">10 Questions</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Difficulty Level
                                </label>
                                <select
                                    value={difficulty}
                                    onChange={e => setDifficulty(e.target.value as any)}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-slate-900 font-medium shadow-sm"
                                >
                                    <option value="mixed" className="bg-white text-slate-900 font-medium">Balanced (Easy, Med, Hard)</option>
                                    <option value="easy" className="bg-white text-slate-900 font-medium">Easy</option>
                                    <option value="medium" className="bg-white text-slate-900 font-medium">Medium</option>
                                    <option value="hard" className="bg-white text-slate-900 font-medium">Hard (Higher Order Thinking)</option>
                                </select>
                            </div>
                        </div>

                        {/* Custom Instructions */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Teacher Focus Instructions (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Include 1 real-world word problem, focus on definitions, or CBSE board format"
                                value={customInstructions}
                                onChange={e => setCustomInstructions(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                            />
                        </div>

                        {/* Generate button */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
                            >
                                {isGenerating ? (
                                    <>
                                        <SpinnerIcon className="w-4 h-4 animate-spin" />
                                        <span>AI is generating questions...</span>
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-4 h-4" />
                                        <span>Generate {questionCount} Questions</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Review & Save Generated Questions */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-slate-600">
                                <span>Generated <strong>{generatedQuestions.length}</strong> questions for </span>
                                <strong className="text-teal-800">{grade} • {generatedQuestions[0]?.subject || (isCustomSubject ? customSubjectName : subject)}</strong>.
                                <span className="block text-slate-400 mt-0.5">Select the questions you would like to keep in your Question Bank.</span>
                            </div>
                            <button
                                onClick={() => setGeneratedQuestions([])}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition underline"
                            >
                                &larr; Generate Again
                            </button>
                        </div>

                        <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
                            {generatedQuestions.map((q, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => toggleQuestionSelection(idx)}
                                    className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                                        q.selected
                                            ? 'border-teal-400 bg-teal-50/40 shadow-sm'
                                            : 'border-slate-200 bg-slate-50/50 opacity-60'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={q.selected}
                                            onChange={() => {}} // Handled by div click
                                            className="mt-1 h-4 w-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                                        />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                                                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-200 text-slate-800">
                                                    {q.type}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                                    {q.difficulty}
                                                </span>
                                                <span className="text-xs font-medium text-slate-500">
                                                    {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {q.question}
                                            </p>

                                            {/* MCQ Options preview */}
                                            {q.type === 'mcq' && q.options && q.options.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={oIdx} className="text-xs text-slate-600 bg-white/80 px-2 py-1 rounded border border-slate-200">
                                                            <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="text-xs text-emerald-800 pt-1">
                                                <strong>Answer:</strong> {q.correctAnswer}
                                            </div>
                                            {q.explanation && (
                                                <div className="text-xs text-slate-500">
                                                    <strong>Explanation:</strong> {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <span className="text-xs text-slate-500 font-medium">
                                {generatedQuestions.filter(q => q.selected).length} of {generatedQuestions.length} questions selected
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveSelected}
                                    disabled={isSaving || generatedQuestions.filter(q => q.selected).length === 0}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
                                >
                                    {isSaving ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                                    Save Selected ({generatedQuestions.filter(q => q.selected).length}) to Bank
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// -------------------------------------------------------------
// SUB-COMPONENT: PRINT / EXAM PAPER PREVIEW MODAL
// -------------------------------------------------------------
interface PrintQuestionPaperModalProps {
    isOpen: boolean;
    onClose: () => void;
    questions: QuestionBankItem[];
    academicYear: string;
    filterGrade: string;
    filterSubject: string;
}

const PrintQuestionPaperModal: React.FC<PrintQuestionPaperModalProps> = ({
    isOpen,
    onClose,
    questions,
    academicYear,
    filterGrade,
    filterSubject
}) => {
    const totalMarks = useMemo(() => {
        return questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    }, [questions]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 my-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
                    <div className="flex items-center gap-2">
                        <PrinterIcon className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-bold text-slate-900">Question Paper Preview</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-1.5"
                        >
                            <PrinterIcon className="w-4 h-4" /> Print / Save PDF
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Question Paper Sheet */}
                <div className="p-8 border border-slate-300 rounded-xl bg-white space-y-6 print:border-none print:p-0">
                    {/* School Header */}
                    <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
                        <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
                            BETHEL MISSION SCHOOL
                        </h1>
                        <p className="text-xs uppercase tracking-widest font-semibold text-slate-600">
                            CLASS TEST / EXAMINATION QUESTION PAPER • ACADEMIC YEAR {academicYear}
                        </p>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 pt-3">
                            <span>CLASS: {filterGrade !== 'all' ? filterGrade : 'ALL CLASSES'}</span>
                            <span>SUBJECT: {filterSubject !== 'all' ? filterSubject : 'VARIOUS'}</span>
                            <span>TOTAL MARKS: {totalMarks}</span>
                        </div>
                    </div>

                    {/* General Instructions */}
                    <div className="text-xs text-slate-600 italic border-b border-slate-200 pb-3">
                        Instructions: Read all questions carefully before answering. Answer all questions to the best of your ability.
                    </div>

                    {/* Questions List */}
                    <div className="space-y-6">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="space-y-2 text-sm text-slate-900">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="font-semibold leading-relaxed">
                                        <span className="font-bold mr-2">{idx + 1}.</span>
                                        {q.question}
                                    </div>
                                    <div className="text-xs font-bold text-slate-600 whitespace-nowrap pt-0.5">
                                        [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                                    </div>
                                </div>

                                {q.type === 'mcq' && q.options && q.options.length > 0 && (
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 pl-6 pt-1 text-xs">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="text-slate-800">
                                                <strong className="mr-1.5">({String.fromCharCode(65 + oIdx)})</strong> {opt}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center text-xs font-bold text-slate-400 pt-8 border-t border-slate-200 uppercase tracking-widest">
                        *** END OF QUESTION PAPER ***
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherWorkspace;
